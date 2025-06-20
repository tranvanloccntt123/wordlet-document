import { Stack } from "expo-router";
import React from "react";

const GameLayout: React.FC<object> = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default GameLayout;
