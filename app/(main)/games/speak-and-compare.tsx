import GameButtons from "@/components/GameButtons";
import GameLoading from "@/components/GameLoading";
import GameProgressBar from "@/components/GameProgressBart"; // Import GameProgressBar
import ParseContent from "@/components/ParseContent";
import useSpeakAndCompare from "@/hooks/useSpeakAndCompare";
import useGameStore from "@/store/gameStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router"; // Import router and params
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ms, s, vs } from "react-native-size-matters";

const SpeakAndCompareScreen = () => {
  const { colors } = useThemeStore();
  const params = useLocalSearchParams<{
    groupId?: string;
    groupName?: string;
  }>();
  const { groupId } = params;
  const { t } = useTranslation(); // Specify namespaces
  const { shuffledWords, currentIndex, submitAnswer, next } = useGameStore();

  const currentWordDetail = React.useMemo(
    () =>
      !!shuffledWords && shuffledWords.length
        ? shuffledWords[currentIndex]
        : undefined,
    [shuffledWords, currentIndex]
  );

  // States for speech recognition process
  const {
    stopListening,
    setSpokenText,
    spokenText,
    error,
    isListening,
    setError,
    startListening,
    isCalculating,
    nextWord,
    feedback,
    percent,
  } = useSpeakAndCompare();

  React.useEffect(() => {
    nextWord();
  }, [currentIndex]);

  const handleNextWord = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    await stopListening(true);
    setError("");
    setSpokenText("");
    submitAnswer(percent || 0, 1);
    next();
  };

  return (
    <GameLoading
      gameType="SpeakAndCompare"
      groupId={parseInt(groupId || "0")}
      title={t("games.speakAndCompareTitle")}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.gameArea}>
          {shuffledWords.length > 0 && currentWordDetail && (
            <GameProgressBar
              groupWords={shuffledWords}
              currentWordIndex={currentIndex}
            />
          )}
          <Text
            style={[
              styles.instructionText,
              { color: colors.textSecondary, marginTop: vs(15) },
            ]}
          >
            {t("games.tapToSpeakInstruction")}
          </Text>
          <View
            style={[
              styles.suggestionBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {feedback.length && spokenText !== "" ? (
              <Text style={{ flexDirection: "row" }}>
                {spokenText !== "" &&
                  feedback.map((item, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.suggestedText,
                        item.status === "correct"
                          ? { color: colors.success }
                          : item.status === "incorrect"
                          ? { color: colors.error }
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {item.char}
                    </Text>
                  ))}
              </Text>
            ) : (
              <Text
                style={[styles.suggestedText, { color: colors.textPrimary }]}
              >
                {currentWordDetail?.word || t("games.loadingWord")}
              </Text>
            )}

            <ParseContent content={currentWordDetail?.content || ""} />
          </View>
        </View>
        <View style={styles.interactiveArea}>
          <View style={styles.feedbackSection}>
            {isListening && !error && (
              <Text
                style={[styles.statusText, { color: colors.textSecondary }]}
              >
                {t("games.listeningStatus")}
              </Text>
            )}
            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error.includes("No speech was detected")
                  ? t("games.noSound")
                  : error}
              </Text>
            )}
            {!isListening && !!spokenText && percent !== null && (
              <View style={styles.resultsContainer}>
                <Text
                  style={[
                    styles.similarityText,
                    {
                      color:
                        percent >= 75
                          ? colors.success
                          : percent >= 50
                          ? colors.warning
                          : colors.error,
                    },
                  ]}
                >
                  {percent.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
        </View>
        <GameButtons
          skipButtonDisabled={isListening || isCalculating}
          primaryButtonDisabled={isCalculating}
          primaryButtonText={
            isListening ? t("games.stopButton") : t("games.startButton")
          }
          onSkipPress={handleNextWord}
          onPrimaryPress={
            isListening
              ? stopListening
              : () =>
                  startListening(
                    currentWordDetail?.word.replaceAll("-", " ") || ""
                  )
          }
        />
      </ScrollView>
    </GameLoading>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: vs(20),
    paddingHorizontal: s(15),
  },
  gameArea: {
    // Wraps the main game content (progress, instruction, word, mic, feedback)
    flex: 1, // Takes up available space to push bottomSection down
    width: "100%",
    alignItems: "center",
  },
  interactiveArea: {
    // For mic button and feedback, allowing them to be centered
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  instructionText: {
    fontSize: ms(16),
    marginBottom: vs(10),
    marginTop: vs(15), // Added margin top
    textAlign: "center",
  },
  suggestionBox: {
    width: "100%",
    paddingVertical: vs(20),
    paddingHorizontal: s(15),
    borderRadius: s(12),
    borderWidth: 1,
    // borderColor is set dynamically
    alignItems: "center",
    minHeight: vs(100),
    justifyContent: "center",
  },
  suggestedText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.title,
    }),
    textAlign: "center",
  },
  feedbackSection: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: s(10),
    paddingBottom: s(20),
  },
  statusText: { fontSize: ms(16), marginVertical: vs(10), fontStyle: "italic" },
  errorText: {
    fontSize: ms(15),
    marginVertical: vs(10),
    textAlign: "center",
    fontWeight: "bold",
  },
  resultsContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  spokenText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.heading,
    }),
    marginTop: vs(5),
  },
  similarityText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.largeTitle,
    }),
    marginTop: vs(5),
  },
  centeredFeedback: {
    // For loading and error states
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: s(20),
  },
  feedbackText: {
    // For text in centeredFeedback
    fontSize: ms(16),
    marginTop: vs(10),
    textAlign: "center",
  },
});

export default SpeakAndCompareScreen;
