import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
import StatusBar from "./StatusBar";

const LoadingModal: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <Modal
      transparent={true}
      statusBarTranslucent
      animationType="fade"
      visible={isVisible}
      onRequestClose={() => {}}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar />
        <View style={styles.content}>
          {/* App Logo */}
          <Image
            source={require("@/assets/images/logo.png")} // Ensure this path is correct
            style={styles.logo}
          />
          {/* App Name */}
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            Wordlet
          </Text>
          {/* Play to Earn Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {t("getStarted.playToEarnMessage", "Play to learn, play to earn!")}{" "}
            {/* New translation key */}
          </Text>
          {/* Activity Indicator */}
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.activityIndicator}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const IntroLoading: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
}> = ({ isLoading, children }) => {
  const [visible, setVisible] = React.useState(isLoading);
  React.useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      setTimeout(() => {
        setVisible(false);
      }, 1200);
    }
  }, [isLoading]);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      {children}
      <LoadingModal isVisible={visible} />
    </View>
  );
};

export default IntroLoading;

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "180@s",
    height: "180@s",
    justifyContent: "center",
    borderRadius: "18@s",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  dbListContainer: {
    width: "100%",
    marginBottom: 15,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  dbListItem: {
    fontSize: 14,
    textAlign: "center",
  },
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: s(20),
  },
  logo: {
    width: s(150), // Make logo larger
    height: s(150), // Make logo larger
    resizeMode: "contain",
    marginBottom: s(20),
    borderRadius: s(30), // Keep rounded corners if desired
  },
  appName: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Use a bold font
      fontSizeKey: FontSizeKeys.largeTitle, // Make app name large
    }),
    marginBottom: s(10),
  },
  message: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginBottom: s(40), // Space before indicator
  },
  activityIndicator: {
    // Style for the indicator if needed
  },
});
