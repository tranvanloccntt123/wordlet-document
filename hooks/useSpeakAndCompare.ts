import AppAudio from "@/assets/audio";
import { calculateSimilarityText } from "@/utils/string";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useEffect, useState } from "react";
import {
  Alert,
  InteractionManager,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";

const useSpeakAndCompare = () => {
  const playerLoss = useAudioPlayer(AppAudio.LOSS);

  const playerCorrect = useAudioPlayer(AppAudio.CORRECT);

  const transcripts = React.useRef<string[]>([]);

  const currentWord = React.useRef<string>("");

  const [error, setError] = useState<string>("");

  const [isListening, setIsListening] = useState<boolean>(false);

  const [spokenText, setSpokenText] = useState<string>("");

  const [similarity, setSimilarity] = useState<number>(0);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const feedback = React.useMemo(() => {
    if (spokenText === "" || !currentWord.current) return [];
    const result: Array<{
      char: string;
      status: "correct" | "incorrect" | "missing";
    }> = [];
    const spokenArray = spokenText.toLowerCase().split("");
    const targetArray = currentWord.current.toLowerCase().split("");

    // Compare characters based on target word
    targetArray.forEach((char, index) => {
      if (index < spokenArray.length && char === spokenArray[index]) {
        result.push({ char, status: "correct" });
      } else {
        result.push({ char, status: "incorrect" });
      }
    });

    return result;
  }, [spokenText]);

  const startAnimation = useSharedValue(0);

  useSpeechRecognitionEvent("start", () => {
    startAnimation.value = withTiming(1, { duration: 100 });
    setSimilarity(0);
    setIsListening(true);
    setError("");
    setIsCalculating(false);
  });

  useSpeechRecognitionEvent("end", () => {
    startAnimation.value = withTiming(0, { duration: 100 });
    setIsListening(false);
  });

  const calculateScorePerTranscript = async (transcript: string) => {
    const listword = currentWord.current.split(" ");
    let sim = 0;
    if (currentWord.current.toLowerCase() === transcript.toLowerCase()) {
      sim = 100;
    } else {
      sim = await calculateSimilarityText(
        currentWord.current.toLowerCase(),
        transcript.toLowerCase()
      );
      // //Current word cached
      // let _currentWordStore: WordStore[] | null =
      //   getQueryData(getSearchKey(currentWord.current)) || null;

      // if (_currentWordStore === null) {
      //   const res = (
      //     await wordSupabase
      //       .schema("public")
      //       .from("fts_words")
      //       .select("*")
      //       .in(
      //         "word",
      //         listword.map((w) => w.trim()).filter((w) => !!w.length)
      //       )
      //   ).data;
      //   setQueryData(getSearchKey(currentWord.current), res || []);
      //   _currentWordStore = res || [];
      // }
      // //Transcript cached
      // let _transcriptWordStore: WordStore[] | null =
      //   getQueryData(getSearchKey(transcript)) || null;

      // if (_transcriptWordStore === null) {
      //   const res = (
      //     await wordSupabase
      //       .schema("public")
      //       .from("fts_words")
      //       .select("*")
      //       .in(
      //         "word",
      //         transcript
      //           .split(" ")
      //           .map((w) => w.trim())
      //           .filter((w) => !!w.length)
      //       )
      //   ).data;
      //   setQueryData(getSearchKey(transcript), res || []);
      //   _transcriptWordStore = res || [];
      // }

      // for (const word of listword) {
      //   const wordSim = await calculateSimilarityPercentage(
      //     word,
      //     transcript,
      //     _currentWordStore || [],
      //     _transcriptWordStore || []
      //   );
      //   sim += wordSim;
      // }
      // sim = sim / (listword.length || 1);
    }
    return sim;
  };

  const calculateScore = async () => {
    if (transcripts.current) {
      setIsCalculating(true);
      // setSpokenText(transcript.current);
      const simCalculate: Record<string, number> = {};

      for (const transcript of transcripts.current) {
        simCalculate[transcript] = await calculateScorePerTranscript(
          transcript
        );
        if (simCalculate[transcript] === 100) break;
      }

      const sim = Math.max(0, ...Object.values(simCalculate));

      setSpokenText(
        Object.keys(simCalculate).find((k) => simCalculate[k] === sim) || ""
      );
      // Helper function to play sound and trigger haptics
      const playSoundAndHaptics = async (
        player: ReturnType<typeof useAudioPlayer>, // More specific type if available
        hapticType: Haptics.NotificationFeedbackType
      ) => {
        try {
          await player.seekTo(0);
          await player.play();
          Haptics.notificationAsync(hapticType);
        } catch (e) {
          console.error("Error playing sound or triggering haptics:", e);
        }
      };

      ExpoSpeechRecognitionModule.stop();

      // Ensure player operations and haptics run on the main thread
      InteractionManager.runAfterInteractions(() => {
        if (sim > 65) {
          playSoundAndHaptics(
            playerCorrect,
            Haptics.NotificationFeedbackType.Success
          );
        } else {
          playSoundAndHaptics(
            playerLoss,
            Haptics.NotificationFeedbackType.Error
          );
        }
      });
      setSimilarity(sim);
      setIsCalculating(false);
    }
  };

  useSpeechRecognitionEvent("result", async (event) => {
    if (event.results && event.results.length > 0) {
      transcripts.current = event.results.map((v) => v.transcript) || [];
      if (event.isFinal)
        if (transcripts.current) {
          await calculateScore();
        } else {
          setSpokenText("");
        }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setError(event.message || "An unknown speech error occurred.");
    setIsListening(false);
    setSpokenText("");
  });

  useEffect(() => {}, [spokenText, isListening]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message:
              "This app needs access to your microphone to recognize your speech.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // For iOS, permissions are typically requested when the new library's start method is called.
    // You can check its availability or handle errors from its start method.
    return true;
  };

  const startListening = async (word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (word !== currentWord.current) {
      currentWord.current = word;
    }
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Microphone permission is required to use this feature. Please enable it in your device settings."
      );
      return;
    }
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      // [Default: false] Continuous recognition.
      // If false:
      //    - on iOS 17-, recognition will run until no speech is detected for 3 seconds.
      //    - on iOS 18+ and Android, recognition will run until a final result is received.
      // Not supported on Android 12 and below.
      continuous: true,
    });
  };

  const stopListening = async (isSkip: boolean = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    ExpoSpeechRecognitionModule.stop();
    if (!isSkip) await calculateScore();
    setIsListening(false);
  };

  return {
    startListening,
    startAnimation,
    isListening,
    error,
    spokenText,
    setSpokenText,
    similarity,
    stopListening,
    setError,
    isCalculating,
    nextWord: () => setSimilarity(0),
    feedback,
  };
};

export default useSpeakAndCompare;
