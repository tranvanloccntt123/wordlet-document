import { FredokaOne_400Regular } from "@expo-google-fonts/fredoka-one";
import { Nunito_400Regular, Nunito_700Bold, Nunito_900Black } from "@expo-google-fonts/nunito";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { useFonts } from "expo-font"; // General useFonts hook
import { ms } from "react-native-size-matters";

// Define keys for your fonts for type safety and easier usage
export const FontFamilies = {
  Pacifico: "Pacifico_400Regular",
  NunitoRegular: "Nunito_400Regular",
  NunitoBold: "Nunito_700Bold",
  NunitoBlack: "Nunito_900Black",
  FredokaOne: "FredokaOne_400Regular",
} as const;

export type AppFontFamily = (typeof FontFamilies)[keyof typeof FontFamilies];

// Define common font size keys
export const FontSizeKeys = {
  caption: "caption", // e.g., 12
  body: "body", // e.g., 14
  subheading: "subheading", // e.g., 16
  heading: "heading", // e.g., 20
  title: "title", // e.g., 24
  largeTitle: "largeTitle", // e.g., 30
} as const;

export type AppFontSize = keyof typeof FontSizeKeys;

export const useGoogleFontSetup = () => {
  let [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Nunito_400Regular,
    Nunito_700Bold,
    FredokaOne_400Regular,
    Nunito_900Black,
  });

  // It's good practice to also return or handle fontError
  // For example, you might log it or display a fallback UI

  return { fontsLoaded, fontError };
};

// Define the actual font sizes using react-native-size-matters for scaling
const appFontSizes = {
  [FontSizeKeys.caption]: ms(13),
  [FontSizeKeys.body]: ms(16),
  [FontSizeKeys.subheading]: ms(20),
  [FontSizeKeys.heading]: ms(24),
  [FontSizeKeys.title]: ms(28),
  [FontSizeKeys.largeTitle]: ms(38),
};

interface FontStyleProps {
  fontFamily: AppFontFamily;
  fontSizeKey: AppFontSize;
}

/**
 * Returns an object with fontFamily and fontSize properties
 * to be used in StyleSheet.
 */
export const getAppFontStyle = ({
  fontFamily,
  fontSizeKey,
}: FontStyleProps) => {
  return {
    fontFamily: fontFamily,
    fontSize: appFontSizes[fontSizeKey],
  };
};
