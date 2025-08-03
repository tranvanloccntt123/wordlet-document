import * as Haptics from "expo-haptics";
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PermissionsAndroid, Platform } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import Toast from "react-native-toast-message";

const useSpeak = () => {
  const transcripts = React.useRef<string[]>([]);

  const [error, setError] = useState<string>("");

  const [isListening, setIsListening] = useState<boolean>(false);

  const [spokenText, setSpokenText] = useState<string>("");

  const { t } = useTranslation();

  const startAnimation = useSharedValue(0);

  useSpeechRecognitionEvent("start", () => {
    startAnimation.value = withTiming(1, { duration: 100 });
    transcripts.current = [];
    setIsListening(true);
    setError("");
  });

  useSpeechRecognitionEvent("end", () => {
    startAnimation.value = withTiming(0, { duration: 100 });
    setSpokenText(transcripts.current?.[0] || "");
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", async (event) => {
    if (event.results && event.results.length > 0) {
      transcripts.current = event.results.map((v) => v.transcript) || [];
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

  const startListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setSpokenText("");
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
  };

  const stopListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    ExpoSpeechRecognitionModule.stop();
  };

  return {
    startListening,
    isListening,
    error,
    spokenText,
    setSpokenText,
    stopListening,
    setError,
  };
};

export default useSpeak;
