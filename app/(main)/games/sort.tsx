import GameLoading from "@/components/GameLoading";
import GameProgressBar from "@/components/GameProgressBart";
import SingleWordSortGame from "@/components/SingleWordSortGame";
import useGameStore from "@/store/gameStore";
import useThemeStore from "@/store/themeStore"; // Import useThemeStore
import { playWord } from "@/utils/voice";
import { useLocalSearchParams } from "expo-router";
import React from "react"; // Added useRef
import { useTranslation } from "react-i18next";
import { ScrollView, Text } from "react-native";
import { scale, ScaledSheet } from "react-native-size-matters";

const SortCharactersGame = () => {
  const { colors } = useThemeStore();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const { t } = useTranslation();
  const { groupId } = params;
  const { shuffledWords, currentIndex, submitAnswer, next } = useGameStore();

  const advanceToNextWord = () => {
    "worklet";
    next();
  };

  const currentWordDetail = React.useMemo(
    () =>
      !!shuffledWords && shuffledWords.length
        ? shuffledWords[currentIndex]
        : undefined,
    [shuffledWords, currentIndex]
  );

  const handleWordCorrect = async () => {
    "worklet";
    if (currentWordDetail) {
      submitAnswer(currentWordDetail.word || "", 1);
      playWord(currentWordDetail.word, currentWordDetail.source);
      setTimeout(() => advanceToNextWord(), 1500);
    }
  };

  return (
    <GameLoading
      gameType="SortCharacterGame"
      groupId={parseInt(groupId || "0")}
      title={t("games.sortCharactersTitle")}
    >
      <ScrollView style={styles.container}>
        {/* Progress Bar */}
        {shuffledWords.length > 0 && (
          <GameProgressBar
            groupWords={shuffledWords}
            currentWordIndex={currentIndex}
          />
        )}
        <Text
          style={[
            styles.prompt,
            {
              color: colors.textSecondary,
              marginTop: currentWordDetail ? 0 : scale(20),
            },
          ]}
        >
          {t("games.sortPrompt")}
        </Text>
        {currentWordDetail ? (
          <>
            <SingleWordSortGame
              key={currentWordDetail.word + currentWordDetail.source} // Ensure re-render on word change
              wordDetail={currentWordDetail}
              onCorrect={handleWordCorrect}
              onSkip={advanceToNextWord} // Skip also advances to the next word
            />
          </>
        ) : (
          <Text style={{ color: colors.textDisabled, fontSize: scale(16) }}>
            {t("games.loadingWord")}
          </Text>
        )}
      </ScrollView>
    </GameLoading>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: "15@ms",
    // justifyContent: "center", // Remove to allow content to flow from top
  },
  prompt: {
    fontSize: "18@s",
    marginBottom: "20@ms",
  },
  progressText: {
    position: "absolute",
    bottom: "20@ms",
    fontSize: "14@s",
  },
});

export default SortCharactersGame;
