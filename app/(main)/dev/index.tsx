import CommonHeader from "@/components/CommonHeader";
import { DB_DIR } from "@/services/downloadDb";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system"; // Import FileSystem
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

const DevScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const [dbList, setDbList] = React.useState<string[]>([]);
  const [isSharingDB, setIsSharingDB] = React.useState<boolean>(false);

  const handleTestNotification = async () => {
    const payload = {
      title: "Test",
      body: "Test Notification",
      data: {
        word: "Test",
        groupId: "0",
        screen: `/word/${encodeURIComponent("extra_mtb_ev.db")}/test/detail`,
      }, // Optional: useful for handling notification tap
    };
    await Notifications.scheduleNotificationAsync({
      content: payload,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false, // Show once per word for this scheduling session
      },
    });
  };

  const handleExportDatabase = async () => {
    setIsSharingDB(!isSharingDB);
    try {
      if (!dbList.length) {
        const dbs = await FileSystem.readDirectoryAsync(DB_DIR);
        setDbList(dbs);
      }
    } catch (error: any) {
      Alert.alert(
        t("settings.exportError"),
        error.message || t("common.unknownError")
      );
    }
  };

  const shareDB = async (db: string) => {
    Sharing.shareAsync(`${DB_DIR}/${db}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.container]}>
        <CommonHeader title="" />
        <View style={{ flex: 1, paddingHorizontal: s(16) }}>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={handleTestNotification}
          >
            <MaterialIcons
              name="notifications" // Icon for export/download
              size={s(22)}
              color={colors.warning} // Use a distinct color for dev features
              style={styles.icon}
            />
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>
              Test Notifications
            </Text>
            <View style={styles.placeholder} />
          </TouchableOpacity>
          {/* Export Database Setting (DEV only) */}
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: colors.card }]}
              onPress={handleExportDatabase}
            >
              <MaterialIcons
                name="save-alt" // Icon for export/download
                size={s(22)}
                color={colors.warning} // Use a distinct color for dev features
                style={styles.icon}
              />
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>
                Export DB (DEV)
              </Text>
              <View style={styles.placeholder} />
            </TouchableOpacity>
          )}

          {__DEV__ &&
            isSharingDB &&
            dbList.map((db) => (
              <TouchableOpacity
                key={db}
                style={[
                  styles.settingItem,
                  { backgroundColor: colors.card, marginLeft: s(40) },
                ]}
                onPress={() => shareDB(db)}
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
                  Export DB {db}
                </Text>
                <View style={styles.placeholder} />
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.navigate("/dev/new-feed")}
          >
            <MaterialCommunityIcons
              name="newspaper-variant-multiple"
              size={s(22)}
              color={colors.warning} // Use a distinct color for dev features
              style={styles.icon}
            />
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>
              Go to New Feed
            </Text>
            <View style={styles.placeholder} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default DevScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
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
  icon: {
    marginRight: "12@s",
  },
  settingText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    flex: 1, // Allow text to take available space
  },
  placeholder: {
    width: "22@s", // To balance the chevron-right icon in other items
  },
});
