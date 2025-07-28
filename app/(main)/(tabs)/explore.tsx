import AppAudio from "@/assets/audio";
import useLanguageStore from "@/store/languageStore"; // Import the language store
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router"; // Corrected: useRouter should be imported from expo-router
// import * as Sharing from "expo-sharing"; // Import Sharing
import AppLoading from "@/components/AppLoading";
import useNotificationStore from "@/store/notificationStore";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import {
  Keyboard,
  Linking,
  ScrollView, // Import Platform
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters";

const SettingsScreen = () => {
  const { colors } = useThemeStore();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const testSoundPlayer = useAudioPlayer(AppAudio.CORRECT); // Using an existing sound for testing
  const setIsSwappingTheme = useThemeStore((state) => state.setIsSwappingTheme);
  const isSwappingTheme = useThemeStore((state) => state.isSwappingTheme);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Local state for the TextInput
  const [inputValue, setInputValue] = useState("");

  // Get notification settings from the store
  const {
    maxNotificationsPerDay,
    setMaxNotificationsPerDay,
    clearAllNotifications,
  } = useNotificationStore();
  const currentTheme = useThemeStore((state) => state.theme);

  // Use the language store
  const { language: currentLanguage, setLanguage } = useLanguageStore();

  const playTestSound = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await testSoundPlayer.seekTo(0);
    testSoundPlayer.play();
  };

  // Sync local input state with store value
  useEffect(() => {
    setInputValue(maxNotificationsPerDay.toString());
  }, [maxNotificationsPerDay]);

  const handleMaxNotificationsChange = (text: string) => {
    // Allow only numbers
    const numericValue = text.replace(/[^0-9]/g, "");
    setInputValue(numericValue);
  };

  const submitMaxNotifications = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    const num = parseInt(inputValue, 10);
    await clearAllNotifications();
    if (!isNaN(num) && num >= 0) {
      setMaxNotificationsPerDay(num);
    } else if (inputValue === "") {
      // If input is cleared, maybe set to 0 or a default
      setMaxNotificationsPerDay(0);
    } else {
      // If input is invalid, revert to the store's current value
      setInputValue(maxNotificationsPerDay.toString());
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate("/logout");
    return;
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate("/delete-account");
    return;
  };

  const handleToggleTheme = () => {
    setIsSwappingTheme(true);
  };

  const handleToggleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLanguage = currentLanguage.startsWith("vn") ? "en" : "vn";
    setLanguage(newLanguage); // Update Zustand store
    i18n.changeLanguage(newLanguage); // Update i18next instance
  };

  // Display language based on the store's state
  const currentLanguageDisplay = currentLanguage.startsWith("vn") ? "VN" : "EN";

  return (
    <AppLoading isLoading={isLoading}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Test Sound Setting */}
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={playTestSound}
            >
              <MaterialIcons
                name="volume-up"
                size={s(22)}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {t("settings.playTestSound")}
              </Text>
              <View style={styles.placeholder} />
            </TouchableOpacity>

            {/* Max Notifications Per Day Setting */}
            <View
              style={[styles.settingItem, { backgroundColor: colors.card }]}
            >
              <MaterialIcons
                name="notifications-active"
                size={s(22)}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {t("settings.maxDailyNotifications")}
              </Text>
              {!isSwappingTheme && (
                <TextInput
                  style={[
                    styles.inputField,
                    { color: colors.textPrimary, borderColor: colors.border },
                  ]}
                  value={inputValue}
                  onChangeText={handleMaxNotificationsChange}
                  onBlur={submitMaxNotifications} // Update store when input loses focus
                  onSubmitEditing={submitMaxNotifications} // Update store when user presses "done"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={3} // Max 3 digits for notifications per day
                />
              )}
            </View>

            {/* Group Manager Setting */}
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.navigate("/series");
              }}
            >
              <MaterialIcons
                name="folder"
                size={s(22)}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {t("common.series")}
              </Text>
              <View style={styles.placeholder} />
            </TouchableOpacity>

            {/* Swap Theme Setting */}
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={handleToggleTheme}
            >
              <MaterialIcons
                name="brightness-6" // Icon for theme toggle
                size={s(22)}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {t("settings.swapTheme")}
              </Text>
              <MaterialIcons
                name={currentTheme === "light" ? "wb-sunny" : "brightness-3"} // Sun for light, moon for dark
                size={s(22)}
                color={colors.textSecondary} // Use a secondary color for the theme indicator icon
                style={styles.themeIcon}
              />
            </TouchableOpacity>

            {/* Swap Language Setting */}
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={handleToggleLanguage}
            >
              <MaterialIcons
                name="language" // Icon for language
                size={s(22)}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {t("settings.swapLanguage")}
              </Text>
              <Text
                style={[
                  styles.languageIndicatorText,
                  { color: colors.textSecondary },
                ]}
              >
                {currentLanguageDisplay}
              </Text>
            </TouchableOpacity>
            {/* Feedback Setting */}
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL("https://discord.gg/w2uwFQHV");
              }}
            >
              <MaterialIcons
                name="feedback" // Icon for language
                size={s(22)}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                {t("common.feedback")}
              </Text>
            </TouchableOpacity>

            {/* Export Database Setting (DEV only) */}
            {__DEV__ && (
              <TouchableOpacity
                style={[styles.settingItem, { backgroundColor: colors.card }]}
                onPress={() => router.navigate("/dev")}
              >
                <MaterialIcons
                  name="save-alt" // Icon for export/download
                  size={s(22)}
                  color={colors.warning} // Use a distinct color for dev features
                  style={styles.icon}
                />
                <Text
                  style={[styles.settingText, { color: colors.textPrimary }]}
                >
                  Go To Dev
                </Text>
                <View style={styles.placeholder} />
              </TouchableOpacity>
            )}
            {/* Logout Button */}
            <TouchableOpacity
              style={[
                styles.settingItem,
                styles.logoutButton, // Specific style for logout
                { backgroundColor: colors.card }, // Or a more distinct background if needed
              ]}
              onPress={handleLogout}
            >
              <MaterialIcons
                name="logout"
                size={s(22)}
                color={colors.error} // Use error color for logout icon
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.error }]}>
                {t("settings.logoutButton", "Logout")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingItem,
                styles.logoutButton, // Specific style for logout
                { backgroundColor: colors.card }, // Or a more distinct background if needed
              ]}
              onPress={handleDelete}
            >
              <MaterialIcons
                name="person-off"
                size={s(22)}
                color={colors.error} // Use error color for logout icon
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.error }]}>
                {t("settings.deleteAccount", "Delete Account")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </AppLoading>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: "15@ms",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "10@s",
    paddingHorizontal: "15@ms",
    marginBottom: "10@ms",
    height: "60@s",
  },
  settingText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    flex: 1, // Allow text to take available space
  },
  icon: {
    marginRight: "12@s",
  },
  inputField: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
    borderWidth: 1,
    borderRadius: "5@s",
    paddingHorizontal: "10@s",
    paddingVertical: "5@s",
    minWidth: "50@s", // Ensure enough width for a few digits
    textAlign: "center",
    marginLeft: "10@s", // Space from the label
  },
  themeIcon: {
    marginHorizontal: "10@s",
    // color is set inline
    // Adjust if you want it to take up space like the placeholder did, or align differently
  },
  placeholder: {
    width: "22@s", // To balance the chevron-right icon in other items
  },
  clearButton: {
    borderRadius: "10@s",
    padding: "15@ms",
    alignItems: "center",
    marginTop: "20@ms",
  },
  clearButtonText: {
    fontSize: "16@s",
    fontWeight: "bold",
  },
  languageIndicatorText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
    marginHorizontal: "10@s", // Similar to themeIcon for alignment
    // color is set inline
  },
  logoutButton: {
    // Optional: Add specific styles for the logout button if needed
    // For example, a border or different background emphasis
  },
});

export default SettingsScreen;
