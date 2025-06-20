import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// Import your translation files
import en from "./en";
import vn from "./vn";

// Add other languages here
// import frMessages from './locales/fr.json';

export const resources = {
  en: en,
  vn: vn,
  // fr: {
  //   translation: frMessages,
  // },
} as const; // 'as const' provides better type safety for keys

const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const deviceLanguageCode = locales[0].languageCode; // e.g., "en", "es"
    // Check if the detected language code is a key in our resources
    if (
      deviceLanguageCode &&
      Object.keys(resources).includes(deviceLanguageCode)
    ) {
      return deviceLanguageCode;
    }
  }
  return "en"; // Default to English
};

i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getDeviceLanguage(), // Detect device language
    fallbackLng: "en", // Fallback language
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18next;
