import useThemeStore from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";

const InitialEmptySearch = () => {
  const { colors } = useThemeStore();

  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="search" // A magnifying glass icon
        size={s(60)}
        color={colors.textDisabled}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t("search.startSearching")}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t("search.enterWordToFind")}
      </Text>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "20@s",
    marginTop: "50@s",
  },
  icon: {
    marginBottom: "20@s",
  },
  title: {
    fontSize: "20@s",
    fontWeight: "bold",
    marginBottom: "10@s",
  },
  message: {
    fontSize: "16@s",
    textAlign: "center",
  },
});

export default InitialEmptySearch;