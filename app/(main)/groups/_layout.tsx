import { Stack } from "expo-router";
import React from "react";

const MyGroupLayout: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="add"
        options={{
          presentation: "containedTransparentModal",
          animation: "none",
        }}
      />
      <Stack.Screen
        name="delete"
        options={{
          presentation: "containedTransparentModal",
          animation: "none",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "containedTransparentModal",
          animation: "none",
        }}
      />
    </Stack>
  );
};

export default MyGroupLayout;
