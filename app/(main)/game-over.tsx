import AppAudio from "@/assets/audio";
import gameOver from "@/i18n/en/gameOver";
import { decreaseEnergy } from "@/services/supabase";
import useEnergyStore from "@/store/energyStore";
import useInfoStore from "@/store/infoStore";
import useStreakStore from "@/store/streakStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import Svg, {
  Defs,
  G,
  Stop,
  LinearGradient as SvgLinearGradient,
  Path as SvgPath,
} from "react-native-svg";

import IntroLoading from "@/components/IntroLoading";
import { getQueryData } from "@/hooks/useQuery";
import mixpanel from "@/services/mixpanel";
import { getFormattedDate, getGroupKey } from "@/utils/string";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, verticalScale } from "react-native-size-matters";

const GameOverScreen: React.FC<object> = () => {
  const playerWinner = useAudioPlayer(AppAudio.WINNER);
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    score?: string;
    totalQuestions?: string;
    totalAnswerCorrect?: string;
    gameType?: string;
    historyId?: string;
    isMyGroup?: string;
    groupId?: string;
  }>();
  const { setEnergy } = useEnergyStore();
  const totalAnswerCorrect = params.totalAnswerCorrect
    ? parseInt(params.totalAnswerCorrect, 10)
    : 0;
  const totalQuestions = params.totalQuestions
    ? parseInt(params.totalQuestions, 10)
    : 0;
  // Define paths from SVG
  const path1String =
    "M63,224 C89.509,224 111,202.51 111,176 C111,176 111,154 111,154 C111,154 145,154 145,154 C145,154 145,176 145,176 C145,202.51 167,224 193,224 C219,224 29.42,224 63,224 Z";
  const path2String =
    "M193,256 C193,256 63,256 63,256 C54.163,256 47,248.836 47,240 C47,231.163 54.163,224 63,224 C72.287,224 183.976,224 193,224 C201.836,224 209,231.163 209,240 C209,248.836 201.836,256 193,256 Z";
  const path3String =
    "M248,62 C248,62 236,62 236,62 C217.222,62 201,77.222 201,96 C201,96 195,96 195,96 C195,96 195,62 195,62 C197.78,48.307 209.486,38 224,38 C224,38 248,38 248,38 C252.418,38 256,41.582 256,46 C256,46 256,54 256,54 C256,58.418 252.418,62 248,62 ZM20,62 C20,62 8,62 8,62 C3.582,62 0,58.418 0,54 C0,54 0,46 0,46 C0,41.582 3.582,38 8,38 C8,38 32,38 32,38 C46.513,38 58.22,48.307 61,62 C61,62 61,96 61,96 C61,96 55,96 55,96 C55,77.222 38.778,62 20,62 Z";
  const path4String =
    "M54,32 C54,32 202,32 202,32 C202,32 202,98 202,98 C202,138.869 168.869,172 128,172 C87.131,172 54,138.869 54,98 C54,98 54,32 54,32 Z";
  const path5String =
    "M52,0 C52,0 204,0 204,0 C208.418,0 212,3.582 212,8 C212,8 212,16 212,16 C212,20.418 208.418,24 204,24 C204,24 52,24 52,24 C47.582,24 44,20.418 44,16 C44,16 44,8 44,8 C44,3.582 47.582,0 52,0 Z";
  const path6String =
    "M162.856,90.349 C157.186,96.253 149.864,104.224 149.864,104.224 C149.864,104.224 151.121,114.155 152.104,122.143 C153.122,130.408 148.536,129.653 143.551,127.407 C136.369,124.171 128,120.112 128,120.112 C128,120.112 119.631,124.171 112.449,127.407 C107.464,129.653 102.877,130.408 103.895,122.143 C104.879,114.155 106.136,104.224 106.136,104.224 C106.136,104.224 98.814,96.253 93.144,90.349 C90.272,87.359 89.502,83.284 95.639,82.135 C103.704,80.624 114.487,78.513 114.487,78.513 C114.487,78.513 119.123,67.961 123.261,60.785 C125.386,57.099 130.614,57.099 132.739,60.785 C136.877,67.961 141.513,78.513 141.513,78.513 C141.513,78.513 152.296,80.624 160.361,82.135 C166.497,83.284 165.728,87.359 162.856,90.349 Z";
  const { colors } = useThemeStore();

  const { addGameResult } = useInfoStore();

  // Centering transform: scale to fit 200x200 canvas and center the 256x256 viewBox
  const translateX = verticalScale(2); // Center horizontally
  const translateY = verticalScale(2); // Center vertically

  const percent = (totalAnswerCorrect / totalQuestions) * 100;

  const { playGame } = useStreakStore();

  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const [finalScore, setFinalScore] = React.useState<number>(0);

  React.useEffect(() => {
    playGame();
    setIsLoading(true);
    decreaseEnergy({
      historyId: params?.historyId ? parseInt(params.historyId || "0") : null,
      score: parseInt(params.score || "0"),
      groupId: params.groupId ? parseInt(params.groupId || "0") : undefined,
      message:
        percent < 10
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
          : gameOver.awesomeJob,
    })
      .then((r) => {
        setIsLoading(false);
        setFinalScore(r.data.score || 0);
        if (r.data?.data?.[0]) {
          setEnergy(r.data.data[0].energy);
        }
        if (r.error) {
          mixpanel.track("Game Error", { error: r.error });
        }
      })
      .catch((e) => {
        mixpanel.track("Game Error", { error: e });
      })
      .finally(() => {
        playerWinner.seekTo(0);
        playerWinner.play();
      });
  }, []);

  return (
    <IntroLoading isLoading={isLoading}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Gold Cup using Skia */}
          <View style={styles.container}>
            <Svg style={styles.canvas} viewBox="0 0 256 256">
              <Defs>
                <SvgLinearGradient id="cupGradient" x1="0" y1="1" x2="0" y2="0">
                  <Stop offset="0" stopColor="#fc9502" />
                  <Stop offset="1" stopColor="#fcbe02" />
                </SvgLinearGradient>
              </Defs>
              <G transform={`translate(${translateX} ${translateY})`}>
                <SvgPath d={path1String} fill="#fcc402" />
                <SvgPath d={path2String} fill="#fce202" />
                <SvgPath d={path3String} fill="#fce202" />
                <SvgPath d={path4String} fill="url(#cupGradient)" />
                <SvgPath d={path5String} fill="#fcc402" />
                <SvgPath d={path6String} fill="#ffffff" />
              </G>
            </Svg>
            <Text
              style={[
                styles.resultText,
                {
                  color:
                    percent < 10
                      ? colors.error
                      : percent < 20
                      ? colors.error
                      : percent < 30
                      ? colors.warning
                      : percent < 50
                      ? colors.warning
                      : percent < 60
                      ? colors.primary
                      : percent < 70
                      ? colors.primaryDark
                      : percent < 80
                      ? colors.success
                      : colors.success,
                },
              ]}
            >
              {percent < 10
                ? t("gameOver.oneMoreShot")
                : percent < 20
                ? t("gameOver.nextTimeChamp")
                : percent < 30
                ? t("gameOver.awesomeJob")
                : percent < 50
                ? t("gameOver.dontGiveUp")
                : percent < 60
                ? t("gameOver.betterLuckNextTime")
                : percent < 70
                ? t("gameOver.superstar")
                : percent < 80
                ? t("gameOver.victory")
                : t("gameOver.awesomeJob")}
            </Text>
            {/* Score and Questions */}
            <View style={styles.scoreContainer}>
              {params.isMyGroup !== "1" && (
                <View
                  style={[
                    styles.scoreContentContainer,
                    { backgroundColor: colors.card },
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size={"small"}
                      color={colors.textPrimary}
                    />
                  ) : (
                    <Text
                      style={[styles.scoreText, { color: colors.textPrimary }]}
                    >
                      {finalScore}
                    </Text>
                  )}
                </View>
              )}
              {params.gameType !== "SpeakAndCompare" && (
                <View
                  style={[
                    styles.scoreContentContainer,
                    { backgroundColor: colors.warning },
                  ]}
                >
                  <Text style={styles.scoreText}>
                    {totalAnswerCorrect}/{totalQuestions}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {/* Play Again Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              let group: Group | null | undefined = null;
              if (params?.groupId) {
                group =
                  getQueryData(getGroupKey(Number(params.groupId || "0"))) ||
                  undefined;
              }
              const history: GameHistory = {
                id: Number(params?.historyId || "0"),
                score: finalScore,
                created_at: getFormattedDate(new Date()),
                message:
                  percent < 10
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
                    : gameOver.awesomeJob,
                group: group as Group,
                group_id: params.groupId
                  ? Number(params.groupId || "0")
                  : undefined,
              };
              addGameResult(history);
              router.back();
            }}
          >
            <Text style={styles.buttonText}>
              {t("games.gameOverBackToGames")}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </IntroLoading>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "16@s",
  },
  canvas: {
    width: "200@vs",
    height: "200@vs",
    alignSelf: "center",
    marginBottom: "50@s",
  },
  scoreContainer: {
    flexDirection: "row",
    marginTop: 24,
    gap: "16@s",
  },
  scoreText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.heading, // Choose the size key
    }),
  },
  resultText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.largeTitle, // Choose the size key
    }),
    textAlign: "center",
  },
  button: {
    marginHorizontal: "16@s",
    backgroundColor: "#3B82F6", // Equivalent to bg-blue-500
    paddingVertical: "10@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "8@s",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.body, // Choose the size key
    }),
  },
  scoreContentContainer: {
    paddingVertical: "10@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "8@s",
    width: "150@s",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GameOverScreen;
