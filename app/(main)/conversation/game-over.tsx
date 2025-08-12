import CircularProgressBarSvg from "@/components/CircularProgressBarSvg";
import GameButtons from "@/components/GameButtons";
import gameOver from "@/i18n/en/gameOver";
import useConversationStore from "@/store/conversationStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { getPercent } from "@/utils/voice";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

const ConversationGameOver = () => {
  const colors = useThemeStore((state) => state.colors);
  const timeline = useConversationStore((state) => state.timeline);
  const { t } = useTranslation();
  const percent = React.useMemo(() => {
    const userTimeline = timeline.filter((v) => v.role === "user");
    let total = 0;
    userTimeline.forEach(item => {
      total += getPercent((item as any)?.feedback || []) || 0;
    })
    return total / (userTimeline.length || 1);
  }, []);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Text
            style={[
              styles.resultText,
              {
                color:
                  percent < 30
                    ? colors.error
                    : percent < 60
                    ? colors.warning
                    : colors.primary,
              },
            ]}
          >
            {percent < 10
              ? gameOver.oneMoreShot
              : percent < 20
              ? gameOver.nextTimeChamp
              : percent < 30
              ? gameOver.awesomeJob
              : percent < 50
              ? gameOver.dontGiveUp
              : percent < 60
              ? gameOver.betterLuckNextTime
              : percent < 70
              ? gameOver.superstar
              : percent < 80
              ? gameOver.victory
              : gameOver.awesomeJob}
          </Text>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: s(50),
              marginBottom: s(75),
            }}
          >
            <CircularProgressBarSvg
              progress={percent}
              size={s(155)}
              strokeWidth={s(15)}
              backgroundColor={
                (percent < 30
                  ? colors.error
                  : percent < 60
                  ? colors.warning
                  : colors.primary) + "30"
              }
              color={
                percent < 30
                  ? colors.error
                  : percent < 60
                  ? colors.warning
                  : colors.primary
              }
            />
            <Text
              style={[
                styles.progressText,
                {
                  color:
                    percent < 30
                      ? colors.error
                      : percent < 60
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            >
              {percent.toFixed(0)}%
            </Text>
          </View>
          {timeline
            .filter((v) => v.role === "user")
            .map((item, i) => (
              <View
                key={`${i}`}
                style={[
                  styles.timelineItemContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                {!item.feedback?.length && (
                  <Text
                    style={[styles.commentText, { color: colors.textPrimary }]}
                  >
                    {item.content.replaceAll("-", " ")}
                  </Text>
                )}
                <Text style={styles.commentText}>
                  {item.feedback?.map((item, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.commentText,
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
              </View>
            ))}
        </ScrollView>
        <View style={{ paddingHorizontal: s(16), paddingVertical: s(4) }}>
          <GameButtons
            hideSkipButton
            primaryButtonText={t("common.goBack")}
            onPrimaryPress={() => {
              router.back();
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ConversationGameOver;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  timelineItemContainer: {
    marginHorizontal: "16@s",
    marginVertical: "8@s",
    paddingHorizontal: "16@s",
    paddingVertical: "8@s",
    borderRadius: "16@s",
  },
  commentText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.body,
      fontFamily: FontFamilies.NunitoRegular,
    }),
  },
  progressText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.largeTitle,
    }),
    position: "absolute",
  },
  resultText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.largeTitle, // Choose the size key
    }),
    textAlign: "center",
    marginTop: "16@s",
  },
});
