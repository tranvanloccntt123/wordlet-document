import WordletImage from "@/assets/images";
import CalendarStreak from "@/components/CalendarStreak";
import useConversationStore from "@/store/conversationStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { energyCheck } from "@/utils/energy";
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet, vs } from "react-native-size-matters";

const SettingsScreen = () => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const info = useInfoStore((state) => state.info);

  const initConversation = useConversationStore((state) => state.init);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        style={{ flex: 1, paddingVertical: s(16), paddingHorizontal: s(16) }}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.profileContainer,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  borderColor: colors.textDisabled,
                },
              ]}
            >
              <Image source={{ uri: info?.avatar }} style={styles.avatar} />
              <View
                style={[
                  styles.profileBadge,
                  {
                    backgroundColor: info?.is_premium
                      ? colors.premium || "#FFD700"
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.profileBadgeText,
                    { color: info?.is_premium ? "black" : colors.textPrimary },
                  ]}
                >
                  {info?.is_premium ? "Pre" : "Free"}
                </Text>
              </View>
            </View>
            <View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>
                {info?.name}
              </Text>
              <Text
                style={[
                  getAppFontStyle({
                    fontFamily: FontFamilies.NunitoBlack,
                    fontSizeKey: FontSizeKeys.caption,
                  }),
                  { color: colors.warning },
                ]}
              >
                {info?.point} WP
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{ marginTop: vs(30) }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate("/settings");
            }}
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
                style={[
                  styles.settingButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                {t("home.setting")}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: vs(8) }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate("/history");
            }}
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
                style={[
                  styles.settingButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                {t("home.activities")}
              </Text>
            </View>
          </TouchableOpacity>
          {/* Group Manager Setting */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate("/series");
            }}
            style={{ marginTop: vs(8) }}
          >
            <View
              style={[
                styles.settingButtonContainer,
                { backgroundColor: colors.card },
              ]}
            >
              <MaterialIcons
                name="folder"
                size={vs(18)}
                color={colors.textPrimary}
              />
              <Text
                style={[
                  styles.settingButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                {t("common.series")}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ marginTop: vs(30) }}>
            <CalendarStreak hideRankButton={true} />
          </View>
          <TouchableOpacity
            style={{ marginTop: vs(8) }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              energyCheck(() => {
                initConversation();
                router.navigate("/conversation");
              });
            }}
          >
            <View
              style={[
                styles.settingButtonContainer,
                { backgroundColor: colors.card },
              ]}
            >
              <Image
                source={WordletImage.AI_TECHNOLOGY}
                style={{ width: s(18), height: s(18) }}
              />
              <Text
                style={[
                  styles.settingButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                Wordlet AI
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
    borderRadius: "50@s",
    alignSelf: "center",
    padding: "3@s",
    borderWidth: "3@s",
  },
  avatar: { flex: 1, resizeMode: "contain", borderRadius: "50@s" },
  name: {
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
      fontFamily: FontFamilies.NunitoBlack,
    }),
  },
  profileBadge: {
    position: "absolute",
    top: 0,
    paddingHorizontal: "8@s",
    paddingVertical: "2@s",
    borderRadius: "9@s",
    right: "-10@s",
  },
  profileBadgeText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
    fontSize: "8@s",
  },
  profileContainer: {
    flexDirection: "row",
    gap: "16@s",
    padding: "16@s",
    borderRadius: "16@s",
  },
});

export default SettingsScreen;
