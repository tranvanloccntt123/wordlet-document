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
import { Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";

const EmptyHistoryList: React.FC = () => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialIcons
        name="history-toggle-off" // Icon suggesting empty history
        size={s(60)}
        color={colors.textDisabled}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t("history.noHistoryTitle")}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t("history.noHistoryMessage")}
      </Text>
      <TouchableOpacity onPress={() => router.navigate("/games")}>
        <Text style={[styles.letGoTxt, { color: colors.primary }]}>
          {t("common.letGo")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "20@s",
  },
  icon: { marginBottom: "20@s" },
  title: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.heading,
    }),
    marginBottom: "10@s",
    textAlign: "center",
  },
  letGoTxt: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
    marginVertical: "16@s",
  },
  message: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
  },
});

export default EmptyHistoryList;
