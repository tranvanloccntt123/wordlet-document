import Colors from "@/constants/Colors";
import useStreakStore from "@/store/streakStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { formatDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";

const DAY_ABBREVIATIONS = ["S", "M", "T", "W", "T", "F", "S"];

const CalendarStreak = () => {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const { currentStreak, streakHistory, fetchStreak } = useStreakStore(); // Get streak data
  const today = new Date();
  const todayFormatted = useMemo(() => formatDate(today), [today]);

  const daysData = useMemo(() => {
    return DAY_ABBREVIATIONS.map((dayAbbr, index) => {
      const dayOfWeekDate = new Date(today);
      // Calculate the date for the current day in the week iteration
      // Assumes Sunday (index 0) is the start of the week
      dayOfWeekDate.setDate(today.getDate() - (today.getDay() - index));
      const dayOfWeekFormatted = formatDate(dayOfWeekDate);

      const isCurrentDay = dayOfWeekFormatted === todayFormatted;
      const isInHistory = streakHistory.includes(dayOfWeekFormatted);

      return {
        key: `${dayAbbr}-${index}-${dayOfWeekDate.getDate()}`, // More robust key
        abbreviation: dayAbbr,
        date: dayOfWeekDate,
        isCurrentDay,
        isInHistory,
      };
    });
  }, [today, todayFormatted, streakHistory]);

  React.useEffect(() => {
    fetchStreak();
  }, []);

  return (
    <View style={[styles.streakContainer, { backgroundColor: colors.card }]}>
      <View style={styles.streakDetailsContainer}>
        <View style={styles.streakMainTextContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.streakNumber, { color: colors.primary }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              {t("home.dayStreak")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/leaderboard")}
            style={{}}
          >
            <Ionicons
              name="trophy-outline"
              size={s(24)}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.daysOfWeekContainer}>
          {daysData.map((dayData) => (
            <DayOfWeekItem
              key={dayData.key}
              abbreviation={dayData.abbreviation}
              date={dayData.date}
              isCurrentDay={dayData.isCurrentDay}
              isInHistory={dayData.isInHistory}
              colors={colors}
            />
          ))}
        </View>
        <Text
          style={[
            styles.streakEncouragement,
            { color: colors.textPrimary, marginTop: s(8) },
          ]}
        >
          {currentStreak > 0 ? t("home.keepUp") : t("home.startToday")}
        </Text>
      </View>
    </View>
  );
};

interface DayOfWeekItemProps {
  abbreviation: string;
  date: Date;
  isCurrentDay: boolean;
  isInHistory: boolean;
  colors: typeof Colors.dark | typeof Colors.light;
}

const DayOfWeekItem: React.FC<DayOfWeekItemProps> = React.memo(
  ({ abbreviation, date, isCurrentDay, isInHistory, colors }) => {
    let circleBackgroundColor = colors.shadow;
    let dayTextColor = colors.textSecondary;

    if (isCurrentDay) {
      circleBackgroundColor = colors.primary;
      dayTextColor = colors.card;
    } else if (isInHistory) {
      circleBackgroundColor = colors.error;
      dayTextColor = colors.card;
    }

    return (
      <View>
        <View
          style={[styles.dayCircle, { backgroundColor: circleBackgroundColor }]}
        >
          <View style={styles.dayContentContainer}>
            <Text style={[styles.dayNumberText, { color: dayTextColor }]}>
              {date.getDate()}
            </Text>
          </View>
        </View>
        <Text style={[styles.dayNameText, { color: colors.primaryDark }]}>
          {abbreviation}
        </Text>
      </View>
    );
  }
);

const styles = ScaledSheet.create({
  // Styles used by CalendarStreak and DayOfWeekItem
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "15@ms",
    paddingHorizontal: "15@ms",
    borderRadius: "12@s",
    marginBottom: "20@ms", // Space before the next cards
  },
  streakDetailsContainer: {
    flex: 1,
    flexDirection: "column",
  },
  streakMainTextContainer: {
    flexDirection: "row",
    alignItems: "baseline", // Aligns number and "Day Streak!" nicely
    justifyContent: "space-between",
  },
  streakNumber: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.largeTitle,
    }),
    fontWeight: "bold",
    marginRight: "6@ms",
  },
  streakLabel: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.title,
    }),
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "10@ms",
    marginBottom: "5@ms",
  },
  dayContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  dayCircle: {
    width: "28@s",
    height: "28@s",
    borderRadius: "14@s", // Perfect circle
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumberText: {
    fontFamily: FontFamilies.NunitoBold,
    fontSize: "10@s",
    lineHeight: "11@s", // Adjusted for tighter packing
  },
  dayNameText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }), // Updated
    marginTop: "2@s",
    textAlign: "center",
  },
  streakEncouragement: getAppFontStyle({
    fontFamily: FontFamilies.NunitoRegular,
    fontSizeKey: FontSizeKeys.caption,
  }),
});

export default CalendarStreak;
