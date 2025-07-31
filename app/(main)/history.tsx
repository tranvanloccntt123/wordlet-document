import CommonHeader from "@/components/CommonHeader";
import HistoryDisplayList from "@/components/HistoryDisplayList";
import useThemeStore from "@/store/themeStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HistoryScreen = () => {
  const { colors } = useThemeStore();
  const {t} = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{flex: 1}}>
        <CommonHeader title={t("home.activities")} />
        <HistoryDisplayList />
      </SafeAreaView>
    </View>
  );
};

export default HistoryScreen;
