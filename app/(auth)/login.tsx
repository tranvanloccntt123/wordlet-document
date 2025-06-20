import StatusBar from "@/components/StatusBar";
import { signInWithGoogle } from "@/services/googleSignin"; // Adjust path as needed
import useThemeStore from "@/store/themeStore"; // Adjust path as needed
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { AntDesign } from "@expo/vector-icons"; // For Google 'G' icon
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s } from "react-native-size-matters";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useThemeStore();
  const { t } = useTranslation(); // Assuming you might want to use translations

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Navigation to the main app will be handled by the AuthLayout/AppLayout
        // console.log('Signed in user:', user.displayName);
      } else {
        Alert.alert(
          "Sign-in Failed",
          "Could not sign in with Google. Please try again."
        );
      }
    } catch (error) {
      console.error("Google Sign-In Error on Login Screen:", error);
      Alert.alert("Error", "An unexpected error occurred during sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar />
      <View style={styles.content}>
        {/* App Logo - Replace with your actual logo */}
        <Image
          source={require("@/assets/images/logo.png")} // Replace with your logo path
          style={styles.logo}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t("login.welcomeTitle", "Welcome to Wordlet!")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("login.signInPrompt", "Sign in to challenge your knowledge.")}
        </Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: "#4285F4" }]} // Standard Google Blue
            onPress={handleGoogleSignIn}
          >
            <AntDesign name="google" size={s(22)} color={"white"} />
            <Text style={[styles.googleButtonText, { color: "white" }]}>
              {t("login.signInWithGoogle", "Sign in with Google")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: s(20),
  },
  logo: {
    width: s(120),
    height: s(120),
    resizeMode: "contain",
    marginBottom: s(30),
    borderRadius: s(30),
  },
  title: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.title,
    }),
    textAlign: "center",
    marginBottom: s(10),
  },
  subtitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginBottom: s(40), // More space before button
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: s(12),
    paddingHorizontal: s(30),
    borderRadius: s(8),
    elevation: 2, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleButtonText: { marginLeft: s(12), fontSize: s(16), fontWeight: "bold" },
});
