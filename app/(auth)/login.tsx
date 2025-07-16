import GameButtons from "@/components/GameButtons";
import StatusBar from "@/components/StatusBar";
import { signInWithGoogle } from "@/services/googleSignin"; // Adjust path as needed
import mixpanel from "@/services/mixpanel";
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
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useThemeStore();
  const { t } = useTranslation(); // Assuming you might want to use translations
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== "cancelled") {
        mixpanel.track("Sign In Error", error);
        Alert.alert("Error", "An unexpected error occurred during sign-in.");
        setIsErrorVisible(true);
      } else {
        setIsErrorVisible(true);
      }
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
      <Modal
        visible={isErrorVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setIsErrorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.card }]}
          >
            <View style={styles.modalConnectImgContainer}>
              <Image
                source={require("@/assets/images/logo.png")} // Replace with your logo path
                style={[
                  styles.logo,
                  { width: s(50), height: s(50), marginBottom: 0 },
                ]}
              />
              <View
                style={{
                  flexDirection: "row",
                  gap: s(3),
                  alignItems: "center",
                }}
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <View
                    key={`dashed-${i}`}
                    style={{
                      width: s(3),
                      height: s(2 + i / 5),
                      borderRadius: s(2),
                      backgroundColor: colors.textPrimary,
                    }}
                  />
                ))}
              </View>
              <Image
                source={require("@/assets/images/google-logo.png")} // Replace with your logo path
                style={[
                  styles.logo,
                  { width: s(50), height: s(50), marginBottom: 0 },
                ]}
              />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("login.signInWithGoogle", "Sign in with Google")}
            </Text>
            <Text style={[styles.modalText, { color: colors.textPrimary }]}>
              {t("login.signInWithGoogleError")}
            </Text>
            <GameButtons
              onPrimaryPress={() => {
                handleGoogleSignIn();
                setIsErrorVisible(false);
              }}
              onSkipPress={() => {
                setIsErrorVisible(false);
              }}
              primaryButtonText={t("common.retry")}
              skipButtonText={t("common.cancel")}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    paddingTop: "25@vs",
    paddingHorizontal: "15@s",
    borderRadius: "12@s",
    alignItems: "center",
    width: "300@s",
  },
  modalTitle: {
    marginBottom: "15@vs",
    textAlign: "center",
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.subheading,
    }),
  },
  modalText: {
    marginBottom: "25@vs",
    textAlign: "center",
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  modalConnectImgContainer: {
    flexDirection: "row",
    gap: "16@s",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "50@s",
  },
});
