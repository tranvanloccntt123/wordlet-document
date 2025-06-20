import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";

const formatScore = (score: number): string => {
  if (score >= 1000000000) {
    return `${Math.floor(score / 1000000000)}B+`;
  }
  if (score >= 1000000) {
    return `${Math.floor(score / 1000000)}M+`;
  }
  if (score >= 1000) {
    // Handles 1k, 10k, 100k
    return `${Math.floor(score / 1000)}k+`;
  }
  return score.toString();
};

const HomePlay = () => {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const { info, isLoading } = useInfoStore();
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => router.push("/games")}
      >
        <View style={styles.cardLabelContainer}>
          <MaterialIcons
            name="play-circle-outline"
            size={s(28)}
            color={colors.primary}
          />
          <Text style={[styles.cardText, { color: colors.textPrimary }]}>
            {t("home.play")}
          </Text>
        </View>
        <View style={styles.scoreOuterContainer}>
          <View
            style={[styles.scorePill, { backgroundColor: colors.background }]}
          >
            {!isLoading && (
              <Text style={[styles.scoreText, { color: colors.primary }]}>
                {formatScore(info?.total_score || 0)}
              </Text>
            )}
            {isLoading && (
              <ActivityIndicator size={"small"} color={colors.primary} />
            )}
            <Text
              style={[styles.scoreUnitText, { color: colors.textSecondary }]}
            >
              PT
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomePlay;

const styles = ScaledSheet.create({
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // marginTop: "10@ms", // Adjusted by adding streak view
  },
  cardLabelContainer: {
    flex: 1, // Takes up available space, pushing score to the right
    flexDirection: "column", // Align icon and text vertically
    alignItems: "center", // Center items horizontally
  },
  card: {
    // backgroundColor applied via inline style using theme
    width: "100%",
    padding: "15@ms",
    borderRadius: "10@s",
    marginBottom: "16@ms",
    alignItems: "center", // Center content within the card
    flexDirection: "row", // Main axis for label section and score section
  },
  cardText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }), // Updated
    marginTop: "10@ms",
    textAlign: "center",
  },
  scoreOuterContainer: {
    // This container helps with alignment and spacing from the main play section
    paddingLeft: "10@s", // Space between play section and score section
    justifyContent: "center", // Vertically center the score pill
  },
  scorePill: {
    flexDirection: "row", // Arrange score and unit side-by-side
    alignItems: "baseline", // Align text nicely (score number and unit)
    paddingVertical: "6@s",
    paddingHorizontal: "12@s",
    borderRadius: "15@s", // Pill shape
    minWidth: "65@s", // Ensure a minimum width for the score box
    justifyContent: "center", // Center content if it's smaller than minWidth
    gap: "8@s",
  },
  scoreText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Bolder for score
      fontSizeKey: FontSizeKeys.subheading, // Make score prominent
    }),
    marginRight: "3@s", // Space between score number and unit
  },
  scoreUnitText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption, // Smaller text for "Pt"
    }),
  },
});
