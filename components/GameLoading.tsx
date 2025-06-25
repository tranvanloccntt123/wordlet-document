import useGameStore from "@/store/gameStore";
import useSpellStore from "@/store/spellStore";
import useThemeStore from "@/store/themeStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

const GameLoading: React.FC<{
  children?: React.ReactNode;
  groupId?: number;
  gameType: GameType;
  ipaChar?: string;
}> = ({ children, groupId, gameType, ipaChar }) => {
  const { setPercent } = useSpellStore();
  const {
    isLoading,
    currentIndex,
    shuffledWords,
    scores,
    history,
    init,
    start,
    reset,
    group,
    user,
  } = useGameStore();
  const { colors } = useThemeStore();
  const { t } = useTranslation(); // Initialize useTranslation
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  useEffect(() => {
    init(gameType, groupId, ipaChar);
  }, [groupId, gameType]);

  useEffect(() => {
    if (
      !isLoading &&
      currentIndex >= shuffledWords.length &&
      !!history &&
      !!user
    ) {
      if (gameType === "SpeakAndCompareIPA") {
        setPercent(
          ipaChar || "",
          scores.reduce((old, current) => old + current, 0) /
            (scores.length || 1 * 100)
        );
      }
      router.replace({
        pathname: "/(main)/game-over",
        params: {
          score: Math.round(
            scores.reduce((old, current) => old + current, 0)
          ).toString(),
          totalAnswerCorrect: scores
            .reduce((old, current) => (current > 0 ? old + 1 : old), 0)
            .toString(),
          totalQuestions: shuffledWords.length.toString(),
          historyId: history.id,
          gameType: gameType,
          isMyGroup: group?.user_id === user?.id || !!ipaChar ? "1" : "0",
          groupId: group?.id?.toString(),
        },
      });
    }
  }, [isLoading, currentIndex, shuffledWords, scores, history, user]);

  useEffect(() => {
    if (!isLoading && !!history && !!user && !!group) {
      start();
    }
  }, [isLoading, history, user, group, t]); // Added user, group, and t to dependency array

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Centering ActivityIndicator and Text */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            {t("games.loadingGame")}
          </Text>
        </View>
      </View>
    );
  }
  return !!children ? <View style={{ flex: 1 }}>{children}</View> : <></>;
};

export default GameLoading;

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
