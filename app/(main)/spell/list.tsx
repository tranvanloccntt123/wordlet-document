import CommonHeader from "@/components/CommonHeader";
import RemoteConfigComponentWrapper from "@/components/RemoteConfigComponentWrapper";
import { getIPA } from "@/constants/Spell";
import useSpellStore from "@/store/spellStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { SectionList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, ms, s, vs } from "react-native-size-matters";

interface SpellListItemProps {
  char: string;
  progress: number;
  onPress: () => void;
  youtubeUrl: string;
}

import Svg, { Circle } from "react-native-svg"; // Import Svg and Circle

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

const SpellListItem: React.FC<SpellListItemProps> = ({
  char,
  progress,
  onPress,
}) => {
  const { colors } = useThemeStore();
  return (
    <View>
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: colors.card }]}
        onPress={onPress}
      >
        <Text style={[styles.charText, { color: colors.textPrimary }]}>
          {char}
        </Text>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {progress.toFixed(0)}%
          </Text>
          <CircularProgressBarSvg
            progress={progress}
            size={s(35)}
            strokeWidth={s(4)}
            color={colors.primary}
            backgroundColor={colors.border}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const List: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const { percent: spellProgress } = useSpellStore();

  const sections = React.useMemo(
    () => [
      {
        title: t("common.vowel"),
        data: getIPA().vowels,
        keyExtractor: (item: IPAChar) => `vowel-${item.sound}`,
      },
      {
        title: t("common.consonant"),
        data: getIPA().consonants,
        keyExtractor: (item: IPAChar) => `consonant-${item.sound}`,
      },
    ],
    []
  );

  const renderItem = ({ item }: { item: IPAChar }) => (
    <SpellListItem
      char={item.sound}
      progress={spellProgress[item.sound] || 0}
      onPress={() =>
        router.push(
          `/spell?spell=${item.sound}&youtubeId=${item.url.replace(
            "https://youtu.be/",
            ""
          )}`
        )
      }
      youtubeUrl={item.url.replace("https://youtu.be/", "")}
    />
  );

  return (
    <SectionList
      sections={sections as any}
      keyExtractor={(item, index) =>
        (item as any).vowel || (item as any).consonant + index
      } // Fallback keyExtractor
      renderItem={renderItem} // Use section-specific renderItem
      renderSectionHeader={({ section: { title } }) => (
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      contentContainerStyle={styles.listContentContainer}
      stickySectionHeadersEnabled={false}
    />
  );
};

const SpellListScreen = () => {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <CommonHeader title={""} />
      <RemoteConfigComponentWrapper>
        <List />
      </RemoteConfigComponentWrapper>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: s(15),
    paddingBottom: vs(20),
  },
  sectionHeader: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.subheading,
    }),
    marginTop: vs(20),
    marginBottom: vs(10),
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: ms(12),
    paddingHorizontal: ms(15),
    borderRadius: s(8),
    marginBottom: ms(10),
  },
  charText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.heading,
    }),
  },
  progressText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
    fontSize: s(8),
    position: "absolute",
  },
});

export default SpellListScreen;
