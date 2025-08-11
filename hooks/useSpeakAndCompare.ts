import AppAudio from "@/assets/audio";
import { getPercent, wordTableRoad } from "@/utils/voice";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, PermissionsAndroid, Platform } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import Toast from "react-native-toast-message";



const useSpeakAndCompare = () => {
  const playerLoss = useAudioPlayer(AppAudio.LOSS);

  const playerCorrect = useAudioPlayer(AppAudio.CORRECT);

  const transcripts = React.useRef<string[]>([]);

  const currentWord = React.useRef<string>("");

  const [error, setError] = useState<string>("");

  const [isListening, setIsListening] = useState<boolean>(false);

  const [spokenText, setSpokenText] = useState<string>("");

  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const { t } = useTranslation();

  const [feedback, setFeedback] = React.useState<
    {
      char: string;
      status: "correct" | "incorrect" | "missing" | "nocheck";
    }[]
  >([]);

  const [percent, setPercent] = React.useState<number | null>(null);

  const startAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (feedback.length && percent !== null) {
      percent < 60 && playerLoss.play();
      percent >= 60 && playerCorrect.play();
    }
  }, [percent, feedback]);

  useSpeechRecognitionEvent("start", () => {
    startAnimation.value = withTiming(1, { duration: 100 });
    transcripts.current = [];
    setIsListening(true);
    setError("");
    setIsCalculating(false);
  });

  useSpeechRecognitionEvent("end", () => {
    startAnimation.value = withTiming(0, { duration: 100 });
    setIsListening(false);
  });

  const calculateScore = async () => {
    if (transcripts.current) {
      setIsCalculating(true);
      const simCalculate: Record<
        string,
        {
          feedback: {
            char: string;
            status: "correct" | "incorrect" | "missing" | "nocheck";
          }[];
          percent: number | null;
        }
      > = {};

      for (const transcript of transcripts.current) {
        const feedback = wordTableRoad(transcript, currentWord.current);
        const percent = getPercent(feedback);
        simCalculate[transcript] = {
          feedback,
          percent,
        };
        if (simCalculate[transcript].percent === 100) break;
      }

      const sim = Math.max(
        0,
        ...Object.values(simCalculate).map((v) => v.percent || 0)
      );

      Object.values(simCalculate).forEach((v) => {
        if (v.percent === sim) {
          setFeedback(v.feedback);
          setPercent(v.percent);
        }
      });

      ExpoSpeechRecognitionModule.stop();

      setSpokenText(
        Object.keys(simCalculate).find(
          (k) => simCalculate[k].percent === sim
        ) || ""
      );
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

  useEffect(() => {
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

    // Ensure player operations and haptics run on the main thread
    !!feedback.length &&
      percent !== null &&
      InteractionManager.runAfterInteractions(() => {
        if (percent > 65) {
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
  }, [percent, feedback]);

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
      Toast.show({
        type: "error",
        text1: t("settings.permissionDenied"),
        text2: t("settings.microDenied"),
      });
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
    setFeedback([]);
    setPercent(null);
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
    stopListening,
    setError,
    isCalculating,
    feedback,
    percent,
    nextWord: () => {
      setSpokenText("");
      setFeedback([]);
      setPercent(null);
    },
  };
};

export default useSpeakAndCompare;
