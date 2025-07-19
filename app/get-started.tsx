import StatusBar from "@/components/StatusBar";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s } from "react-native-size-matters";

export default function GetStartedScreen() {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar />
      <View style={styles.content}>
        {/* App Logo */}
        <Image
          source={require("@/assets/images/logo.png")} // Ensure this path is correct
          style={styles.logo}
        />
        {/* App Name */}
        <Text style={[styles.appName, { color: colors.textPrimary }]}>
          Wordlet
        </Text>
        {/* Play to Earn Message */}
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t("getStarted.playToEarnMessage", "Play to learn, play to earn!")}{" "}
          {/* New translation key */}
        </Text>
        {/* Activity Indicator */}
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.activityIndicator}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: s(20),
  },
  logo: {
    width: s(150), // Make logo larger
    height: s(150), // Make logo larger
    resizeMode: "contain",
    marginBottom: s(20),
    borderRadius: s(30), // Keep rounded corners if desired
  },
  appName: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Use a bold font
      fontSizeKey: FontSizeKeys.largeTitle, // Make app name large
    }),
    marginBottom: s(10),
  },
  message: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginBottom: s(40), // Space before indicator
  },
  activityIndicator: {
    // Style for the indicator if needed
  },
});
