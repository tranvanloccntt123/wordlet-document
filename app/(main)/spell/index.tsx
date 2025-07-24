import WordletBanner from "@/components/Banner";
import CommonHeader from "@/components/CommonHeader"; // Import CommonHeader
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { router, useLocalSearchParams } from "expo-router"; // Import router and params
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { BannerAdSize } from "react-native-google-mobile-ads";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, vs } from "react-native-size-matters";
import YoutubePlayer from "react-native-youtube-iframe";

const SpellCharactor = () => {
  const { colors } = useThemeStore();
  const params = useLocalSearchParams<{
    spell?: string;
    youtubeId?: string;
  }>();

  const { t } = useTranslation(); // Specify namespaces

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <CommonHeader title={params.spell || ""} />
      <View style={{ justifyContent: "space-between", flex: 1 }}>
        <View style={styles.youtubeContainer}>
          <WordletBanner banner={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          <YoutubePlayer
            height={vs(200)}
            width={vs(290)}
            videoId={params.youtubeId || ""}
          />
          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            {t("games.watchVideoPrompt")}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => {
            if (params.spell) {
              router.push({
                pathname: "/spell/speak",
                params: { spell: params.spell },
              });
            }
          }}
        >
          <Text
            style={[styles.actionButtonText, { color: colors.textPrimary }]}
          >
            {t("common.letGo")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: { flex: 1 },
  youtubeContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: "16@s",
  },
  instructionText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginTop: "16@s",
    paddingHorizontal: "20@s",
  },
  actionButton: {
    paddingVertical: "10@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "8@s",
    minWidth: "100@s",
    alignItems: "center",
    margin: "16@s",
  },
  actionButtonText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.heading, // Choose the size key
    }),
  },
});

export default SpellCharactor;
