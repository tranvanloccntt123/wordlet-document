import { Stack } from "expo-router";
import "react-native-reanimated";

import AuthWrapper from "@/components/AuthWrapper";
import RemoteConfigWrapper from "@/components/RemoteConfigWrapper";
import i18next from "@/i18n";
import { migrateDbIfNeeded } from "@/services/migrateDbIfNeed";
import * as supabase from "@/services/supabase";
import { useGoogleFontSetup } from "@/styles/fontStyles";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import messaging from "@react-native-firebase/messaging";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { Parser } from "htmlparser2";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Host } from "react-native-portalize";
// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

SplashScreen.preventAutoHideAsync();

const htmlToJson = (htmlString: string): ParseHTMLElement | null => {
  const stack: any = [];
  let root: ParseHTMLElement | null = null;

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        const newNode: ParseHTMLElement = {
          type: "element",
          tag: name,
          attributes: attribs as any,
          children: [],
        };

        if (stack.length === 0) {
          root = newNode; // Set root node
        } else {
          stack[stack.length - 1].children.push(newNode); // Add as child of current node
        }
        stack.push(newNode); // Push to stack
      },
      ontext(text) {
        if (text.trim()) {
          stack[stack.length - 1].children.push({
            type: "text",
            content: text.trim(),
          });
        }
      },
      onclosetag() {
        stack.pop(); // Pop the current node off the stack
      },
    },
    { decodeEntities: true }
  );

  parser.write(htmlString);
  parser.end();

  return root;
};

export default function RootLayout() {
  const { fontsLoaded } = useGoogleFontSetup();

  // React.useEffect(() => {
  //   const getTest = async () => {
  //     const r = await axios.get(
  //       "https://dictionary.reverso.net/english-definition/eased"
  //     );
  //     const regexIPA = /\<app-ipa\s+[^>]*>([\s\S]*?)<\/app-ipa>/;
  //     const data = (r.data as string).match(regexIPA);
  //     htmlToJson(data?.[0] || "")?.children?.[0]?.children?.[0]?.content;
  //     // LINK TO IPA htmlToJson(data?.[0] || "")?.children?.[0]?.children?.[0]?.content

  //   };

  //   getTest();
  // }, []);

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
              <Host>
                <AuthWrapper>
                  <I18nextProvider i18n={i18next}>
                    <Stack screenOptions={{ headerShown: false }} />
                  </I18nextProvider>
                </AuthWrapper>
              </Host>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </RemoteConfigWrapper>
      </SQLiteProvider>
    </Suspense>
  );
}
