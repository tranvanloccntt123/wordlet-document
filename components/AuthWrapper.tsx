import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSegments } from "expo-router";
import React from "react";
import { View } from "react-native";

const AuthRedirect: React.FC = () => {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (initializing) {
      router.replace("/get-started");
      return;
    }
    if (user && (inAuthGroup || segments[0] === "get-started")) {
      router.replace("/(main)/(tabs)"); // Redirect to your main app home screen
      return;
    }
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login"); // Redirect to your main app home screen
      return;
    }
  }, [user, initializing, segments, router]);
  return <></>;
};

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <AuthRedirect />
    </View>
  );
};

export default AuthWrapper;
