import useGameStore from "@/store/gameStore";
import useSpellStore from "@/store/spellStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
import Rive from "rive-react-native";
import CommonHeader from "./CommonHeader";
import GameButtons from "./GameButtons";

const GameLoading: React.FC<{
  children?: React.ReactNode;
  groupId?: number;
  gameType: GameType;
  ipaChar?: string;
  title?: string;
}> = ({ children, groupId, gameType, ipaChar, title }) => {
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
  const router = useRouter();
  const navigation = useNavigation();
  const [challengeVisible, setChallengeVisible] = React.useState(false);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  useEffect(() => {
    init(gameType, groupId, ipaChar);
  }, [groupId, gameType]);

  useEffect(() => {
    if (!isLoading && currentIndex >= shuffledWords.length && !!user) {
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
          gameType: gameType,
          isMyGroup: group?.user_id === user?.id || !!ipaChar ? "1" : "0",
          groupId: group?.id?.toString(),
        },
      });
    }
  }, [isLoading, currentIndex, shuffledWords, scores, history, user]);

  // Handle hardware back button (Android)
  const onBackPress = () => {
    setChallengeVisible(true);
    return true; // Prevent default back action
  };

  useEffect(() => {
    // Add BackHandler listener for Android
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // Clean up listeners on unmount
    return () => {
      // unsubscribe();
      subscription.remove();
    };
  }, [navigation, router]);

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

  return !!children ? (
    <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <CommonHeader
          title={title || ""}
          onBackPress={() => {
            setChallengeVisible(true);
          }}
        />
        {children}
      </SafeAreaView>
      <Modal visible={challengeVisible} transparent={true} animationType="fade">
        <View style={[styles.alertModalContainer]}>
          <View style={styles.alertContentContainer}>
            <Rive
              resourceName={"winner"}
              style={{ width: s(200), height: s(200), alignSelf: "center" }}
            />
            <Text style={[styles.alertTitle]}>{t("common.confirm")}</Text>
            <Text style={[styles.alertDescription]}>
              {t("games.quitGames")}
            </Text>
            <GameButtons
              primaryButtonText={t("common.goBack")}
              skipButtonText={t("common.cancel")}
              fontSize={s(15)}
              onPrimaryPress={() => {
                router.back(); // Proceed with back action
                setChallengeVisible(false);
              }}
              onSkipPress={() => {
                setChallengeVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  ) : (
    <></>
  );
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
  lertContentContainer: {
    backgroundColor: "white",
    borderRadius: "16@s",
    padding: "20@s",
    width: "300@s",
    gap: "8@s",
  },
  alertTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.subheading,
    }),
    textAlign: "center",
    color: "black",
  },
  alertDescription: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    textAlign: "center",
    color: "black",
  },
  // Use the getAppFontStyle utility for font styling
  actionButtonText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.heading, // Choose the size key
    }),
  },
  alertModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContentContainer: {
    backgroundColor: "white",
    borderRadius: "16@s",
    padding: "20@s",
    width: "300@s",
    gap: "8@s",
  },
});
