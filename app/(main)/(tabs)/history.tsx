import HistoryDisplayList from "@/components/HistoryDisplayList";
import useThemeStore from "@/store/themeStore";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HistoryScreen = () => {
  const { colors } = useThemeStore();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{flex: 1}}>
        <HistoryDisplayList />
      </SafeAreaView>
    </View>
  );
};

export default HistoryScreen;
