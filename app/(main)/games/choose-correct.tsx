import AppAudio from "@/assets/audio";
import CommonHeader from "@/components/CommonHeader";
import GameLoading from "@/components/GameLoading";
import GameProgressBar from "@/components/GameProgressBart";
import SingleChooseCorrectQuestion from "@/components/SingleChooseCorrectQuestion"; // Import the new component
import useGameStore from "@/store/gameStore";
import useThemeStore from "@/store/themeStore";
import { shuffleArray } from "@/utils/array"; // Assuming you have this utility
import { playWord } from "@/utils/voice"; // Import playWord utility
import { useAudioPlayer } from "expo-audio";
import { useLocalSearchParams } from "expo-router"; // Import useRef
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

const MAX_OPTIONS = 4;

const extractDefinition = (content: string): string => {
  const lines = content.split("\n");
  const definitionLine = lines.find((line) => line.trim().startsWith("5#"));
  return definitionLine
    ? definitionLine.trim().substring(2)
    : "No definition found.";
};

const ChooseCorrect = () => {
  const playerLoss = useAudioPlayer(AppAudio.LOSS);
  const { colors } = useThemeStore();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const groupId = parseInt(params.groupId || "0");
  const { t } = useTranslation(); // Initialize useTranslation
  const { shuffledWords, group, currentIndex, submitAnswer, next } =
    useGameStore();

  const currentWordDetail = React.useMemo(() => {
    if (shuffledWords.length > 0 && currentIndex < shuffledWords.length) {
      return shuffledWords[currentIndex];
    }
    return null;
  }, [shuffledWords, currentIndex]);

  const questionText = React.useMemo(() => {
    if (currentWordDetail) {
      return extractDefinition(currentWordDetail.content);
    }
    return null;
  }, [currentWordDetail]);

  const answerOptions = React.useMemo(() => {
    if (currentWordDetail && group?.words) {
      const correctAnswer = currentWordDetail.word;
      const incorrectOptions = shuffleArray(
        group.words.filter((w) => w.word !== correctAnswer)
      )
        .slice(0, MAX_OPTIONS - 1)
        .map((w) => w.word);
      return shuffleArray([correctAnswer, ...incorrectOptions]);
    }
    return [];
  }, [currentWordDetail, group]);

  const handleAnswerPress = async (answer: string) => {
    if (!currentWordDetail) return; // Should not happen if logic is correct
    const correctAnswer = currentWordDetail.word;
    let delay = 500;
    if (answer === correctAnswer) {
      submitAnswer(answer, 1);
      await playWord(currentWordDetail.word, currentWordDetail.source, 0.7); // Speak the correct word
    } else {
      await playerLoss.seekTo(0);
      await playerLoss.play();
      delay = 1200;
    }
    setTimeout(() => {
      next();
    }, delay);
  };

  const progress = t("games.progressText", {
    current: currentIndex + 1,
    total: shuffledWords.length,
  });

  return (
    <GameLoading groupId={groupId} gameType="ChooseCorrect">
      {!!group && (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <SafeAreaView style={[styles.container]}>
            <CommonHeader title={t("games.wordFromTranslationTitle")} />
            <View style={styles.safeArea}>
              <GameProgressBar
                groupWords={group.words}
                currentWordIndex={currentIndex}
              />
              <Text
                style={[styles.progressText, { color: colors.textSecondary }]}
              >
                {progress}
              </Text>
              {questionText && currentWordDetail && answerOptions.length > 0 ? (
                <SingleChooseCorrectQuestion
                  question={questionText}
                  options={answerOptions}
                  correctAnswer={currentWordDetail.word}
                  onAnswerPress={handleAnswerPress}
                />
              ) : (
                <Text
                  style={[styles.loadingText, { color: colors.textPrimary }]}
                >
                  {t("games.preparingQuestion")}
                </Text>
              )}
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
    padding: "15@s", // Ensure padding is applied here
    flex: 1,
  },
  loadingText: { fontSize: "16@s", marginTop: "10@s" },
  title: {
    fontSize: "24@s",
    fontWeight: "bold",
    marginBottom: "20@s",
    textAlign: "center",
  },
  progressText: {
    fontSize: "14@s",
    marginBottom: "20@s",
    alignSelf: "flex-end",
  },
  feedbackText: { fontSize: "16@s", textAlign: "center", marginBottom: "20@s" },
  button: {
    paddingVertical: "12@vs",
    paddingHorizontal: "30@s",
    borderRadius: "8@s",
    marginTop: "20@s",
  },
  buttonText: { fontSize: "16@s", fontWeight: "bold" },
});

export default ChooseCorrect;
