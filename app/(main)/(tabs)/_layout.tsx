import { HapticTab } from "@/components/HapticTab";
import useLanguageStore from "@/store/languageStore"; // Import the new language store
import useThemeStore from "@/store/themeStore";
import { Feather, MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";
import React, { useEffect } from "react"; // Import useEffect
import { useTranslation } from "react-i18next"; // Import useTranslation
import { s, vs } from "react-native-size-matters";

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
            <MaterialIcons
              name="home"
              size={Math.min(s(22), vs(22))}
              color={color}
            />
          ),
        }}
      />
      {/* ``<Tabs.Screen 
        name="new-feed"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="newspaper-variant-multiple"  size={28} color={color} />
          ),
        }}
      />`` */}
      <Tabs.Screen
        name="remember"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Feather
              name="bookmark"
              size={Math.min(s(18), vs(18))}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome6
              name="user"
              size={Math.min(s(18), vs(18))}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
