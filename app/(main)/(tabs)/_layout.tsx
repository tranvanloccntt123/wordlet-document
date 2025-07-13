import { HapticTab } from "@/components/HapticTab";
import useLanguageStore from "@/store/languageStore"; // Import the new language store
import useThemeStore from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import { Tabs } from "expo-router";
import React, { useEffect } from "react"; // Import useEffect
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function TabLayout() {
  const { colors } = useThemeStore();
  const { i18n } = useTranslation();
  const storedLanguage = useLanguageStore((state) => state.language);

  useEffect(() => {
    if (storedLanguage && i18n.language !== storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [storedLanguage, i18n]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="timeline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
