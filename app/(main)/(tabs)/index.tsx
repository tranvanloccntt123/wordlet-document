import CalendarStreak from "@/components/CalendarStreak";
import HomePlay from "@/components/HomePlay";
import RemoteConfigComponentWrapper from "@/components/RemoteConfigComponentWrapper";
import SpellRandom from "@/components/SpellRandom";
import useEnergyStore from "@/store/energyStore";
import useSpellStore from "@/store/spellStore";
import useThemeStore from "@/store/themeStore";
import { commonStyles } from "@/styles/commonStyles";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"; // Import MaterialCommunityIcons
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters";

const EnergyView = () => {
  const { colors } = useThemeStore();
  const { energy, fetchEnergy, isLoading } = useEnergyStore();
  React.useEffect(() => {
    fetchEnergy();
  }, []);
  return (
    <View style={[styles.energyContainer, { backgroundColor: colors.shadow }]}>
      <MaterialCommunityIcons
        name="flash" // Bolt icon
        size={s(22)}
        color={colors.warning} // Using warning color for energy, adjust as needed
      />
      {!isLoading && (
        <Text style={[styles.energyText, { color: colors.textPrimary }]}>
          {energy || 0}
        </Text>
      )}
      {isLoading && (
        <ActivityIndicator size={"small"} color={colors.textPrimary} />
      )}
    </View>
  );
};

const HomeScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useThemeStore();
  const fetchCurrentSpellStore = useSpellStore(
    (state) => state.fetchCurrentSpellStore
  );

  React.useEffect(() => {
    fetchCurrentSpellStore();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerContainer}>
        {/* Search Bar Area */}
        <View style={styles.searchBarWrapper}>
          <TouchableOpacity
            style={[
              commonStyles.textInputContainer,
              { backgroundColor: colors.card, paddingHorizontal: s(16) },
            ]}
            onPress={() => router.push("/search")}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="search"
              size={s(20)}
              color={colors.textSecondary}
              style={styles.searchIconStyle}
            />
            <Text
              style={[
                commonStyles.textInput,
                { color: colors.textSecondary },
                getAppFontStyle({
                  fontFamily: FontFamilies.NunitoRegular,
                  fontSizeKey: FontSizeKeys.body,
                }),
              ]}
            >
              {t("home.searchWord")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <EnergyView />
        </View>
      </View>
      <ScrollView bounces={false}>
        <View style={styles.contentContainer}>
          <CalendarStreak />
          <HomePlay />
          <RemoteConfigComponentWrapper>
            <SpellRandom />
          </RemoteConfigComponentWrapper>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  headerContainer: {
    paddingHorizontal: "15@ms",
    paddingVertical: "12@ms", // Slightly increased padding
    width: "100%",
    flexDirection: "row", // Arrange search and energy side-by-side
    alignItems: "center", // Vertically align items
    justifyContent: "space-between", // Space out search and energy
    // If a bottom border is desired:
    // borderBottomWidth: 1,
    // borderBottomColor: colors.border, // This would require passing colors to createStyles or defining styles inside component
  },
  searchBarWrapper: {
    flex: 1, // Allow search bar to take available space
    marginRight: "10@s", // Add some space between search and energy
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    paddingHorizontal: "8@s",
    // marginRight: "5@s", // Space before energy view if needed
  },
  searchIconStyle: {
    marginRight: "8@ms",
  },
  energyContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "10@s", // Add some padding to the energy display
    height: "50@s",
    borderRadius: "45@s",
  },
  energyText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.body,
    }),
    marginLeft: "5@s",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    padding: "20@ms", // Add padding to the content area below the header
  },
});

export default HomeScreen;
