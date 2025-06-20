import useThemeStore from "@/store/themeStore";
import React from "react";
import { StatusBar as RNStatusBar } from "react-native";

const StatusBar: React.FC<object> = () => {
  const { theme, colors } = useThemeStore();
  return (
    <RNStatusBar
      barStyle={theme === "dark" ? "light-content" : "dark-content"}
      backgroundColor={colors.background}
    />
  );
};

export default StatusBar;
