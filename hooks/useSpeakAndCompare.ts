import AppAudio from "@/assets/audio";
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

interface Position {
  col: number;
  row: number;
}

const ignoreChar = [".", "!", ",", "'", "’", "?", "-"];

function getLongestSortedList(positions: Position[]): Position[] {
  if (positions.length === 0) return [];

  // Sort positions by row (ascending) and then by col (ascending)
  const sorted = [...positions].sort((a, b) => {
    if (a.row !== b.row) {
      return a.row - b.row; // Lower row first
    }
    return a.col - b.col; // Lower col first within same row
  });

  // dp[i] stores the length of the longest sequence ending at index i
  const dp: number[] = new Array(sorted.length).fill(1);
  // prev[i] stores the previous index in the longest sequence ending at i
  const prev: number[] = new Array(sorted.length).fill(-1);

  // Find the longest increasing subsequence
  let maxLength = 1;
  let maxIndex = 0;

  for (let i = 1; i < sorted.length; i++) {
    for (let j = 0; j < i; j++) {
      if (sorted[i].col > sorted[j].col && sorted[i].row > sorted[j].row) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          prev[i] = j;
        }
      }
    }
    if (dp[i] > maxLength) {
      maxLength = dp[i];
      maxIndex = i;
    }
  }

  // Reconstruct the longest sequence
  const result: Position[] = [];
  let currentIndex = maxIndex;
  while (currentIndex !== -1) {
    result.push(sorted[currentIndex]);
    currentIndex = prev[currentIndex];
  }

  return result.reverse(); // Reverse to get the sequence in increasing order
}

const wordTableRoad = (spokenText: string, currentWord: string) => {
  const currentWordLabel = currentWord.replaceAll("-", " ").split(" ");
  const spokenTextLabel = spokenText.replaceAll("-", " ").split(" ");
  const roadTable: {
    feedback: {
      char: string;
      status: "correct" | "incorrect" | "missing" | "nocheck";
    }[];
    percent: number | null;
  }[][] = Array.from({ length: spokenTextLabel.length }, (_, i) =>
    Array.from({ length: currentWordLabel.length }, (_, i) => ({
      feedback: [],
      percent: 0,
    }))
  );
  let tmpList: Position[] = [];
  for (let i = 0; i < roadTable.length; i++) {
    for (let j = 0; j < roadTable[i].length; j++) {
      roadTable[i][j] = checkStatusOfResponse(
        spokenTextLabel[i],
        currentWordLabel[j]
      );
      if (roadTable[i][j].percent !== 0) {
        tmpList.push({ col: j, row: i });
      }
    }
  }

  const finalList = getLongestSortedList(tmpList);

  let feedbackList = currentWordLabel.map((word) => {
    const list = word.split("").map((v) => ({
      char: v,
      status: ignoreChar.includes(v.toLowerCase()) ? "nocheck" : "incorrect",
    }));
    list.push({
      char: " ",
      status: "nocheck",
    });
    return list;
  });

  if (finalList.length) {
    finalList.forEach((i) => {
      feedbackList[i.col] = [
        ...roadTable[i.row][i.col].feedback,
        {
          char: " ",
          status: "nocheck",
        },
      ];
    });
  }

  const list = feedbackList.flatMap((v) => v);

  if (list[list.length - 1].char === " ") list.pop();

  return list as {
    char: string;
    status: "correct" | "incorrect" | "missing" | "nocheck";
  }[];
};

const getPercent = (
  result: Array<{
    char: string;
    status: "correct" | "incorrect" | "missing" | "nocheck";
  }>
) => {
  return !result.length
    ? null
    : (result.filter((item) => item.status === "correct").length /
        result.filter((i) => i.status !== "nocheck").length) *
        100;
};

const checkStatusOfResponse = (spokenText: string, currentWord: string) => {
  const result: Array<{
    char: string;
    status: "correct" | "incorrect" | "missing" | "nocheck";
  }> = [];
  if (spokenText === "" || !currentWord) {
    return {
      feedback: result,
      percent: null,
    };
  }

  const spokenArray = spokenText.toLowerCase().split("");
  const targetArray = currentWord.toLowerCase().split("");

  let spokenIndex = 0;

  // Compare characters based on target word
  targetArray.forEach((char, index) => {
    if (ignoreChar.includes(spokenArray[spokenIndex])) {
      spokenIndex += 1;
    }
    if (char === spokenArray[spokenIndex]) {
      result.push({ char: currentWord[index], status: "correct" });
      spokenIndex += 1;
    } else {
      if (ignoreChar.includes(char)) {
        result.push({ char: currentWord[index], status: "nocheck" });
      } else {
        result.push({
          char: currentWord[index],
          status: "incorrect",
        });
        spokenIndex += 1;
      }
    }
  });

  const percent = getPercent(result);

  return {
    feedback: result,
    percent,
  };
};

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
        v.percent === sim && setFeedback(v.feedback) && setPercent(v.percent);
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
