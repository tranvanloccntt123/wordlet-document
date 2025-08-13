import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
import Rive from "rive-react-native";
import CommonHeader from "./CommonHeader";
import GameButtons from "./GameButtons";

const DoubleCheckBackScreen: React.FC<{
  children: React.ReactNode | React.ReactNode[];
  title: string;
}> = ({ children, title }) => {
  const colors = useThemeStore((state) => state.colors);

  const [challengeVisible, setChallengeVisible] = React.useState(false);

  const router = useRouter();

  const navigation = useNavigation();

  const { t } = useTranslation();

  // Handle hardware back button (Android)
  const onBackPress = () => {
    setChallengeVisible(true);
    return true; // Prevent default back action
  };

  React.useEffect(() => {
    // Add BackHandler listener for Android
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // Clean up listeners on unmount
    return () => {
      // unsubscribe();
      subscription.remove();
    };
  }, [navigation, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.container}>
        <CommonHeader
          title={title}
          onBackPress={() => {
            setChallengeVisible(true);
          }}
        />
        {children}
      </SafeAreaView>
      <Modal
        visible={challengeVisible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
      >
        <View style={[styles.alertModalContainer]}>
          <View style={styles.alertContentContainer}>
            <Rive
              resourceName={"winner"}
              style={{ width: s(200), height: s(200), alignSelf: "center" }}
            />
            <Text style={[styles.alertTitle]}>{t("common.confirm")}</Text>
            <Text style={[styles.alertDescription]}>
              {t("games.quitGames")}
            </Text>
            <GameButtons
              primaryButtonText={t("common.goBack")}
              skipButtonText={t("common.cancel")}
              skipButtonTextColor="black"
              fontSize={s(15)}
              onPrimaryPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back(); // Proceed with back action
                setChallengeVisible(false);
              }}
              onSkipPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setChallengeVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DoubleCheckBackScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  alertModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContentContainer: {
    backgroundColor: "white",
    borderRadius: "16@s",
    padding: "20@s",
    width: "300@s",
    gap: "8@s",
  },
  alertTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.subheading,
    }),
    textAlign: "center",
    color: "black",
  },
  alertDescription: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    textAlign: "center",
    color: "black",
  },
});
