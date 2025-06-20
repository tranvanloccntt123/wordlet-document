import useThemeStore from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";

interface EmptySearchResultProps {
  searchTerm: string;
}

const EmptySearchResult: React.FC<EmptySearchResultProps> = ({
  searchTerm,
}) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialIcons
        name="search-off" // Or a similar icon like "sentiment-dissatisfied"
        size={s(60)}
        color={colors.textDisabled}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t("search.noResultsFound")}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {t("search.noMatchesFor", { searchTerm })}
      </Text>
      <Text style={[styles.suggestion, { color: colors.textSecondary }]}>
        {t("search.tryDifferentKeyword")}
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
    marginTop: "50@s", // Add some top margin to push it down a bit
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
    marginBottom: "5@s",
  },
  suggestion: {
    fontSize: "14@s",
    textAlign: "center",
  },
});

export default EmptySearchResult;
