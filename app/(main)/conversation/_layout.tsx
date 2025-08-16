import { Stack } from "expo-router";
import React from "react";

const ConversationLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="game-over" />
      <Stack.Screen name="list" />
      <Stack.Screen
        name="unlock-confirmation"
        options={{ presentation: "transparentModal" }}
      />
    </Stack>
  );
};

export default ConversationLayout;
