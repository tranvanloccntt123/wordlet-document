import { getIPA } from "@/constants/RemoteConfig";
import useSpellStore from "@/store/spellStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { shuffleArray } from "@/utils/array";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { BannerAdSize } from "react-native-google-mobile-ads";
import { ScaledSheet, s } from "react-native-size-matters"; // Import s and ms
import Svg, { Circle } from "react-native-svg"; // Import Svg and Circle
import WordletBanner from "./Banner";

interface CircularProgressBarSvgProps {
  progress: number; // 0-100
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}
const CircularProgressBarSvg: React.FC<CircularProgressBarSvgProps> = ({
  progress,
  size,
  strokeWidth,
  color,
  backgroundColor = "#e6e6e6", // Default background color
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Ensure progress is between 0 and 100 for sweepAngle calculation
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityLabel={`Progress: ${normalizedProgress.toFixed(0)}%`}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
        {normalizedProgress > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`} // Start at 12 o'clock
          />
        )}
      </Svg>
    </View>
  );
};

const SpellWord: React.FC<{
  char: string;
  title: string;
  progress: number;
  youtubeId: string;
}> = ({ char, title, progress, youtubeId }) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/spell?spell=${char}&youtubeId=${youtubeId}`)}
    >
      <View style={styles.cardLabelContainer}>
        <Text style={[styles.spellText, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <View style={styles.charAndProgressContainer}>
          <Text
            style={[
              styles.cardText,
              { color: colors.primary, marginLeft: s(10) },
            ]}
          >
            {char}
          </Text>
          <CircularProgressBarSvg
            progress={progress}
            size={s(30)} // Adjust size as needed
            strokeWidth={s(5)} // Adjust stroke width as needed
            color={colors.primary}
            backgroundColor={colors.border} // Use a theme color for background
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SpellRandom = () => {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const { percent: spellProgress } = useSpellStore();
  const practice = React.useMemo(() => {
    const vowels = shuffleArray(getIPA().vowels);
    const consonants = shuffleArray(getIPA().consonants);
    return { vowel: vowels?.[0], consonant: consonants?.[0] };
  }, []);

  if (!practice.consonant && !practice.vowel) {
    return <></>;
  }

  const vowelProgress = spellProgress[practice.vowel.sound] || 0;
  const consonantProgress = spellProgress[practice.consonant.sound] || 0;

  return (
    <View style={styles.cardContainer}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <WordletBanner banner={BannerAdSize.BANNER} />
      </View>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {t("home.practicePronunciation")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/spell/list")}
          style={styles.linkButton}
        >
          <Text style={[styles.linkButtonText, { color: colors.primary }]}>
            {t("common.viewAll")}
          </Text>
          {/* Optional: Add an icon */}
          {/* <MaterialIcons name="arrow-forward" size={s(16)} color={colors.primary} /> */}
        </TouchableOpacity>
      </View>
      <SpellWord
        title={t("common.vowel")}
        char={practice.vowel.sound}
        progress={vowelProgress || 0}
        youtubeId={practice.vowel.url.replace("https://youtu.be/", "")}
      />
      <SpellWord
        title={t("common.consonant")}
        char={practice.consonant.sound}
        progress={consonantProgress || 0}
        youtubeId={practice.consonant.url.replace("https://youtu.be/", "")}
      />
    </View>
  );
};

export default SpellRandom;

const styles = ScaledSheet.create({
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "16@s",
    // marginTop: "10@ms", // Adjusted by adding streak view
  },
  charAndProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "25@s",
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "5@ms", // Adjust padding as needed
  },
  linkButtonText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  cardLabelContainer: {
    flex: 1, // Takes up available space, pushing score to the right
    flexDirection: "row", // Align icon and text vertically
    alignItems: "center", // Center items horizontally
    justifyContent: "space-between",
  },
  card: {
    // backgroundColor applied via inline style using theme
    width: "100%",
    padding: "15@ms",
    borderRadius: "10@s",
    flexDirection: "row", // Main axis for label section and score section
  },
  spellText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }), // Updated
  },
  cardText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.heading,
    }),
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
