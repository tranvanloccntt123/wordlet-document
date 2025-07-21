// App.jsx
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { ToastConfigParams } from "react-native-toast-message";
/*
  1. Create the config
*/
const toastConfig = {
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  tomatoToast: ({ text1, props }: ToastConfigParams<any>) => (
    <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
  report: ({ text1, text2 }: ToastConfigParams<any>) => {
    const colors = useThemeStore((state) => state.colors);
    return (
      <View
        style={[styles.reportContainer, { backgroundColor: colors.accentDark }]}
      >
        <Entypo name="bug" size={24} color={colors.background} />
        <View style={{ flex: 1 }}>
          <Text style={[{ color: colors.background }, styles.reportTitle]}>
            {text1}
          </Text>
          <Text style={[{ color: colors.card }, styles.reportDescription]}>
            {text2}
          </Text>
        </View>
      </View>
    );
  },
  limit: ({}: ToastConfigParams<any>) => {
    const colors = useThemeStore((state) => state.colors);
    const { t } = useTranslation();
    return (
      <View
        style={[
          styles.reportContainer,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.background,
          },
        ]}
      >
        <MaterialIcons
          name="local-fire-department"
          size={24}
          color={colors.textSecondary}
        />
        <View style={{ flex: 1 }}>
          <Text style={[{ color: colors.textPrimary }, styles.reportTitle]}>
            {t("groups.limitWordTitle")}
          </Text>
          <Text
            style={[{ color: colors.textDisabled }, styles.reportDescription]}
          >
            {t("groups.limitWordMessage", { limit: 25 })}
          </Text>
        </View>
      </View>
    );
  },
  addWordSuccess: ({ text1: word }: ToastConfigParams<any>) => {
    const colors = useThemeStore((state) => state.colors);
    const { t } = useTranslation();
    return (
      <View
        style={[
          styles.reportContainer,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.background,
          },
        ]}
      >
        <MaterialIcons
          name="local-fire-department"
          size={24}
          color={colors.textSecondary}
        />
        <View style={{ flex: 1 }}>
          <Text style={[{ color: colors.textPrimary }, styles.reportTitle]}>
            {t("common.success")}
          </Text>
          <Text
            style={[{ color: colors.textDisabled }, styles.reportDescription]}
          >
            {t("games.wordAddedSuccess", { word: word })}
          </Text>
        </View>
      </View>
    );
  },
  word: ({ text1, text2, onPress }: ToastConfigParams<any>) => {
    const colors = useThemeStore((state) => state.colors);
    return (
      <Pressable onPress={onPress}>
        <View
          style={[
            styles.reportContainer,
            {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.background,
            },
          ]}
        >
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={[{ color: colors.textPrimary }, styles.reportTitle]}>
              {text1}
            </Text>
            <Text
              style={[{ color: colors.textDisabled }, styles.reportDescription]}
            >
              {text2}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  },
  error: ({ text1, text2, onPress }: ToastConfigParams<any>) => {
    const colors = useThemeStore((state) => state.colors);
    return (
      <Pressable onPress={onPress}>
        <View
          style={[
            styles.reportContainer,
            {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.background,
            },
          ]}
        >
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={[{ color: colors.error }, styles.reportTitle]}>
              {text1}
            </Text>
            <Text
              style={[{ color: colors.textDisabled }, styles.reportDescription]}
            >
              {text2}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  },
};

export default toastConfig;

const styles = ScaledSheet.create({
  reportContainer: {
    width: "300@s",
    padding: "16@s",
    borderRadius: "16@s",
    flexDirection: "row",
    gap: "16@s",
    alignItems: "center",
  },
  reportTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  reportDescription: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  logo: {
    width: "30@s",
    height: "30@s",
    borderRadius: "30@s",
  },
});
