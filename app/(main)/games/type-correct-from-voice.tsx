import AppAudio from "@/assets/audio";
import CommonHeader from "@/components/CommonHeader";
import GameButtons from "@/components/GameButtons";
import GameLoading from "@/components/GameLoading";
import GameProgressBar from "@/components/GameProgressBart";
import ParseContent from "@/components/ParseContent";
import SuggestButton from "@/components/SuggestButton";
import Colors from "@/constants/Colors";
import useGameStore from "@/store/gameStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { playWord } from "@/utils/voice"; // Import playWord utility
import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters";

// Define voice speed levels
type VoiceSpeedLevel = "Easy" | "Medium" | "High";
const VOICE_SPEED_LEVELS: {
  level: VoiceSpeedLevel;
  rate: number;
  label: string;
  labelKey: string; // For i18n
}[] = [
  { level: "Easy", rate: 0.75, label: "Easy", labelKey: "games.speedEasy" },
  {
    level: "Medium",
    rate: 1.0,
    label: "Medium",
    labelKey: "games.speedMedium",
  },
  { level: "High", rate: 1.25, label: "High", labelKey: "games.speedHigh" },
];

const ChooseCorrectFromVoice = () => {
  const playerCorrect = useAudioPlayer(AppAudio.CORRECT);
  const { colors } = useThemeStore();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const groupId = params.groupId;
  const { t } = useTranslation();
  const { shuffledWords, currentIndex, submitAnswer, next } = useGameStore();
  const [userInput, setUserInput] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isSuggestModalVisible, setIsSuggestModalVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentVoiceSpeed, setCurrentVoiceSpeed] =
    useState<VoiceSpeedLevel>("Medium");

  const currentWord = useMemo(() => {
    if (shuffledWords.length > 0 && currentIndex < shuffledWords.length) {
      return shuffledWords[currentIndex];
    }
    return null;
  }, [shuffledWords, currentIndex]);

  useEffect(() => {
    // Reset state for new question and play sound
    if (currentWord) {
      const selectedSpeedConfig = VOICE_SPEED_LEVELS.find(
        (s) => s.level === currentVoiceSpeed
      );
      const playbackRate = selectedSpeedConfig ? selectedSpeedConfig.rate : 1.0;

      setUserInput("");
      setIsCorrect(null);
      setShowAnswer(false);
      // Automatically play sound for the new word
      playWord(currentWord.word, currentWord.source, playbackRate);
    }
  }, [currentWord, currentVoiceSpeed]); // Runs when currentWord or currentVoiceSpeed changes

  const handlePlaySound = () => {
    if (currentWord) {
      const selectedSpeedConfig = VOICE_SPEED_LEVELS.find(
        (s) => s.level === currentVoiceSpeed
      );
      playWord(
        currentWord.word,
        currentWord.source,
        selectedSpeedConfig?.rate || 1.0
      );
    }
  };
  const handleSubmitAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (!currentWord || userInput.trim() === "") return;
    Keyboard.dismiss();

    const correctAnswer = currentWord.word.toLowerCase();
    const userAnswer = userInput.trim().toLowerCase();

    if (userAnswer === correctAnswer) {
      setIsCorrect(true);
      // playWord(currentWord.word, currentWord.source);
      playerCorrect.seekTo(0);
      playerCorrect.play();
      submitAnswer(
        userAnswer,
        currentVoiceSpeed === "High"
          ? 1.5
          : currentVoiceSpeed === "Medium"
          ? 1
          : 0.5
      );
      setTimeout(() => {
        next();
      }, 1500);
    } else {
      setIsCorrect(false);
      setShowAnswer(true);
      setTimeout(() => {
        next();
      }, 2500); // Longer delay if incorrect to show answer
    }
  };

  const handleSkipPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isCorrect !== null) return; // Don't allow skip if already answered

    // Optionally, you might want to briefly show the answer before skipping
    // setShowAnswer(true);
    // setIsCorrect(false); // Mark as incorrect for display purposes if showing answer

    next();
  };

  const progress = t("games.wordProgress", {
    current: Math.min(currentIndex + 1, shuffledWords.length),
    total: shuffledWords.length,
  });

  return (
    <GameLoading
      gameType="TypeCorrectFromVoice"
      groupId={parseInt(groupId || "0")}
    >
      {!!shuffledWords?.length && (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <SafeAreaView style={[styles.container]}>
            <CommonHeader title={t("games.translationFromVoiceTitle")} />
            <View style={[styles.safeArea]}>
              <GameProgressBar
                groupWords={shuffledWords}
                currentWordIndex={currentIndex}
              />
              <View style={styles.interactiveArea}>
                <TouchableOpacity
                  onPress={handlePlaySound}
                  style={styles.playSoundButton}
                  disabled={isCorrect !== null}
                >
                  <MaterialIcons
                    name="volume-up"
                    size={s(40)}
                    color={
                      isCorrect !== null ? colors.textDisabled : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.instructionText,
                      {
                        color:
                          isCorrect !== null
                            ? colors.textDisabled
                            : colors.textPrimary,
                      },
                    ]}
                  >
                    {t("games.tapToListenInstruction")}
                  </Text>
                </TouchableOpacity>

                <View style={styles.speedControlContainer}>
                  {VOICE_SPEED_LEVELS.map((speed) => (
                    <TouchableOpacity
                      key={speed.level}
                      style={[
                        styles.speedButton,
                        {
                          backgroundColor:
                            currentVoiceSpeed === speed.level
                              ? colors.primary
                              : colors.card,
                          borderColor:
                            currentVoiceSpeed === speed.level
                              ? colors.primary
                              : colors.border,
                        },
                        isCorrect !== null && styles.disabledSpeedButton, // Style for disabled state
                      ]}
                      onPress={() => setCurrentVoiceSpeed(speed.level)}
                      disabled={isCorrect !== null}
                    >
                      <Text
                        style={[
                          styles.speedButtonText,
                          {
                            color:
                              currentVoiceSpeed === speed.level
                                ? colors.card
                                : colors.textPrimary,
                          },
                          isCorrect !== null && { color: colors.textDisabled }, // Text color for disabled state
                        ]}
                      >
                        {t(speed.labelKey as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ParseContent
                  content={currentWord?.content || ""}
                  hideComponents={["1#"]}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.card,
                      borderColor:
                        isCorrect === false
                          ? colors.error
                          : isCorrect === true
                          ? colors.success
                          : colors.border,
                    },
                  ]}
                  value={userInput}
                  onChangeText={setUserInput}
                  placeholder={t("games.typeWordPlaceholder")}
                  placeholderTextColor={colors.textSecondary}
                  onSubmitEditing={handleSubmitAnswer}
                  editable={isCorrect === null}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
                <SuggestButton
                  isCorrect={isCorrect}
                  currentWord={currentWord}
                />
                {isCorrect !== null && currentWord && (
                  <View style={styles.feedbackContainer}>
                    <MaterialIcons
                      name={isCorrect ? "check-circle" : "cancel"}
                      size={s(24)}
                      color={isCorrect ? colors.success : colors.error}
                    />
                    <Text
                      style={[
                        styles.feedbackResultText,
                        { color: isCorrect ? colors.success : colors.error },
                      ]}
                    >
                      {isCorrect ? t("games.correct") : t("games.tryAgain")}
                    </Text>
                  </View>
                )}
                {showAnswer && !isCorrect && currentWord && (
                  <Text
                    style={[
                      styles.correctAnswerText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("games.correctWordWas", { word: currentWord.word })}
                  </Text>
                )}
                <GameButtons
                  primaryButtonText={t("games.submitButton")}
                  primaryButtonDisabled={
                    isCorrect !== null || userInput.trim() === ""
                  }
                  skipButtonDisabled={isCorrect !== null}
                  onPrimaryPress={handleSubmitAnswer}
                  onSkipPress={handleSkipPress}
                />
              </View>
              <Text
                style={[styles.progressText, { color: colors.textSecondary }]}
              >
                {progress}
              </Text>
            </View>
          </SafeAreaView>
        </View>
      )}
    </GameLoading>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    padding: "15@s",
    flex: 1,
  },
  centeredLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: "16@s",
    marginTop: "10@s",
    textAlign: "center",
  },
  title: {
    fontSize: "24@s",
    fontWeight: "bold",
    marginBottom: "20@s",
    textAlign: "center",
  },
  progressText: {
    position: "absolute", // Position absolutely within its parent (styles.safeArea)
    bottom: "20@ms", // Place it 20ms from the bottom
    alignSelf: "center", // Center it horizontally
    fontSize: "14@s",
    // color is applied inline
  },
  interactiveArea: {
    flex: 1,
    // justifyContent: "center", // Removed to allow content to flow from the top
    alignItems: "center",
    width: "100%",
    paddingHorizontal: "10@s", // Ensure some padding for smaller screens
  },
  playSoundButton: {
    marginBottom: "30@ms",
    padding: "15@s",
    alignItems: "center",
  },
  instructionText: {
    fontSize: "16@s",
    marginTop: "10@s",
    textAlign: "center",
  },
  speedControlContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    marginBottom: "20@ms",
  },
  speedButton: {
    paddingVertical: "8@vs",
    paddingHorizontal: "15@s",
    borderRadius: "20@s",
    borderWidth: 1,
    minWidth: "70@s",
    alignItems: "center",
  },
  disabledSpeedButton: {
    backgroundColor: `${Colors.light.shadow}`, // Ensure disabled style overrides
    borderColor: `${Colors.light.border}`,
  },
  speedButtonText: {
    fontSize: "14@s",
    fontWeight: "600",
  },
  textInput: {
    width: "100%",
    height: "50@ms",
    borderWidth: 1,
    borderRadius: "8@s",
    paddingHorizontal: "15@s",
    fontSize: "18@s",
    textAlign: "center",
    marginBottom: "10@ms", // Reduced margin to make space for suggest button
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "10@ms",
    minHeight: "30@s", // Ensure space for feedback
  },
  feedbackResultText: {
    fontSize: "18@s",
    fontWeight: "bold",
    marginLeft: "8@s",
  },
  correctAnswerText: {
    fontSize: "16@s",
    textAlign: "center",
    marginBottom: "20@ms",
  },
  feedbackText: {
    fontSize: "16@s",
    textAlign: "center",
    marginBottom: "20@s",
    paddingHorizontal: "10@s",
  },
  button: {
    paddingVertical: "12@vs",
    paddingHorizontal: "30@s",
    borderRadius: "8@s",
    marginTop: "20@s",
  },
  buttonText: { fontSize: "16@s", fontWeight: "bold" },
  suggestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "8@vs",
    paddingHorizontal: "10@s",
    borderRadius: "30@s",
    borderWidth: 1,
    marginBottom: "20@ms", // Space before submit button or feedback
    gap: "8@s",
  },
  suggestButtonText: {
    fontSize: "14@s",
    fontWeight: "600",
    marginLeft: "8@s",
  },
  suggestNumberContainer: {
    width: "30@s",
    height: "30@s",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "30@s",
  },
  suggestNumberText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
});

export default ChooseCorrectFromVoice;
