import { Stack } from "expo-router";
import "react-native-reanimated";

import RemoteConfigWrapper from "@/components/RemoteConfigWrapper";
import SwapThemeWrapper from "@/components/SwapThemeWrapper";
import i18next from "@/i18n";
import { migrateDbIfNeeded } from "@/services/migrateDbIfNeed";
import * as supabase from "@/services/supabase";
import useAuthStore from "@/store/authStore";
import { useGoogleFontSetup } from "@/styles/fontStyles";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import messaging from "@react-native-firebase/messaging";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

SplashScreen.preventAutoHideAsync();

const AppProtected: React.FC = () => {
  const isLogged = useAuthStore((state) => state.isLogged);
  const session = isLogged ? "authenticated" : null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="get-started" /> */}
      <Stack.Protected guard={isLogged}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLogged}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
};

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
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <SwapThemeWrapper>
                <I18nextProvider i18n={i18next}>
                  <AppProtected />
                </I18nextProvider>
              </SwapThemeWrapper>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </RemoteConfigWrapper>
      </SQLiteProvider>
    </Suspense>
  );
}
