import { Stack } from "expo-router";
import "react-native-reanimated";

import AuthWrapper from "@/components/AuthWrapper";
import RemoteConfigWrapper from "@/components/RemoteConfigWrapper";
import i18next from "@/i18n";
import { migrateDbIfNeeded } from "@/services/migrateDbIfNeed";
import * as supabase from "@/services/supabase";
import { useGoogleFontSetup } from "@/styles/fontStyles";
import messaging from "@react-native-firebase/messaging";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded } = useGoogleFontSetup();

  if (!fontsLoaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Suspense>
      <SQLiteProvider
        databaseName={"teiresource.db"}
        onInit={migrateDbIfNeeded}
      >
        <RemoteConfigWrapper
          onFinished={() => {
            SplashScreen.hide();
            supabase.init();
          }}
        >
          <AuthWrapper>
            <I18nextProvider i18n={i18next}>
              <Stack screenOptions={{ headerShown: false }} />
            </I18nextProvider>
          </AuthWrapper>
        </RemoteConfigWrapper>
      </SQLiteProvider>
    </Suspense>
  );
}
