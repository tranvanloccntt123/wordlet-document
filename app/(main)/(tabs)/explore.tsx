import CalendarStreak from "@/components/CalendarStreak";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
// import * as Sharing from "expo-sharing"; // Import Sharing
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet, vs } from "react-native-size-matters";

const SettingsScreen = () => {
  const { colors } = useThemeStore();
  const { t, i18n } = useTranslation();
  const info = useInfoStore((state) => state.info);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        style={{ flex: 1, paddingVertical: s(16), paddingHorizontal: s(16) }}
      >
        <View style={[styles.avatarContainer]}>
          <Image
            source={{ uri: info?.avatar }}
            style={{ flex: 1, resizeMode: "contain" }}
          />
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {info?.name}
        </Text>

        <TouchableOpacity
          style={{ marginTop: vs(30) }}
          onPress={() => router.navigate("/settings")}
        >
          <View
            style={[
              styles.settingButtonContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={vs(18)}
              color={colors.textPrimary}
            />
            <Text
              style={[styles.settingButtonText, { color: colors.textPrimary }]}
            >
              {t("home.setting")}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: vs(8) }}
          onPress={() => router.navigate("/history")}
        >
          <View
            style={[
              styles.settingButtonContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <MaterialIcons
              name="timeline"
              size={vs(18)}
              color={colors.textPrimary}
            />
            <Text
              style={[styles.settingButtonText, { color: colors.textPrimary }]}
            >
              {t("home.activities")}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{marginTop: vs(30)}}>
          <CalendarStreak />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    width: "80@s",
    height: "80@s",
    overflow: "hidden",
    borderRadius: "50@s",
    alignSelf: "center",
  },
  name: {
    alignSelf: "center",
    marginTop: "8@s",
    textAlign: "center",
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.subheading,
      fontFamily: FontFamilies.NunitoBold,
    }),
  },
  settingButtonContainer: {
    flexDirection: "row",
    height: "50@vs",
    borderRadius: "10@s",
    paddingHorizontal: "16@s",
    alignItems: "center",
    gap: "8@s",
  },
  settingButtonText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.body,
      fontFamily: FontFamilies.NunitoRegular,
    }),
  },
});

export default SettingsScreen;
