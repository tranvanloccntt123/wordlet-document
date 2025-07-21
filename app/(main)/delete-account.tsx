import GameButtons from "@/components/GameButtons";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { s, ScaledSheet } from "react-native-size-matters";

import AppLoading from "@/components/AppLoading";
import { signOutGoogle } from "@/services/googleSignin";
import * as Mixpanel from "@/services/mixpanel";
import * as supabase from "@/services/supabase";
import useAuthStore from "@/store/authStore";
import useFetchStore from "@/store/fetchStore";
import useInfoStore from "@/store/infoStore";
import useSpellStore from "@/store/spellStore";
import { router } from "expo-router";

const Logout: React.FC = () => {
  const { t } = useTranslation();
  const clearFetch = useFetchStore((state) => state.clear);
  const { reset } = useSpellStore();
  const contentAnim = useSharedValue(0);
  const colors = useThemeStore((state) => state.colors);
  const setIsLogged = useAuthStore((state) => state.setIsLogged);
  const { info } = useInfoStore();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    contentAnim.value = withSpring(1, { duration: 500 });
  }, []);

  const contentContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(contentAnim.value, [0, 1], [0.5, 1]),
      transform: [
        {
          scale: contentAnim.value,
        },
      ],
    };
  });

  return (
    <AppLoading isLoading={isLoading}>
      <View style={[styles.container]}>
        <Animated.View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card },
            contentContainerStyle,
          ]}
        >
          <View style={styles.modalConnectImgContainer}>
            <Image
              source={{ uri: info?.avatar }} // Replace with your logo path
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
              {Array.from({ length: 16 }, (_, i) =>
                i === 7 ? (
                  <Text
                    key={`dashed-${i}`}
                    style={{
                      color: colors.accent,
                      fontSize: s(15),
                      fontWeight: "bold",
                    }}
                  >
                    x
                  </Text>
                ) : (
                  <View
                    key={`dashed-${i}`}
                    style={{
                      width: s(3),
                      height: s(2 + i / 5),
                      borderRadius: s(2),
                      backgroundColor: colors.textPrimary,
                    }}
                  />
                )
              )}
            </View>
            <Image
              source={require("@/assets/images/logo.png")} // Replace with your logo path
              style={[styles.logo]}
            />
          </View>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {t("settings.deleteAccount", "Delete Account")}
          </Text>
          <Text style={[styles.modalText, { color: colors.textPrimary }]}>
            {t(
              "settings.deleteAccountConfirmation",
              "Are you sure you want to delete your account?"
            )}
          </Text>
          <GameButtons
            onPrimaryPress={async () => {
              try {
                setIsLoading(true);
                await supabase.deleteAccount();
                await supabase.signOut();
                await signOutGoogle();
                reset();
                Mixpanel.logout();
                setIsLoading(false);
                setIsLogged(false);
              } catch (e) {
                setIsLoading(false);
              } finally {
                clearFetch();
              }
            }}
            onSkipPress={() => {
              contentAnim.value = withTiming(0, { duration: 200 });
              setTimeout(() => {
                router.back();
              }, 250);
            }}
            primaryButtonText={t("common.confirm")}
            skipButtonText={t("common.cancel")}
            fontSize={s(15)}
          />
        </Animated.View>
      </View>
    </AppLoading>
  );
};

export default Logout;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "50@s",
    height: "50@s",
    resizeMode: "contain",
    borderRadius: "30@s",
  },
  modalContainer: {
    paddingTop: "25@vs",
    paddingHorizontal: "15@s",
    borderRadius: "12@s",
    alignItems: "center",
    width: "300@s",
    transform: [
      {
        scale: 0,
      },
    ],
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
