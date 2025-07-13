import AppLoading from "@/components/AppLoading";
import GameButtons from "@/components/GameButtons";
import { createGroupInfo } from "@/services/groupServices";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

const AddGroup: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const [name, setName] = React.useState<string>("");
  const [errorName, setErrorName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const containerAnim = useSharedValue(0);

  React.useEffect(() => {
    containerAnim.value = withTiming(1, { duration: 200 });
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerAnim.value,
    };
  });

  return (
    <AppLoading isLoading={isLoading}>
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        <Animated.View style={[{ flex: 1 }, containerStyle]}>
          <SafeAreaView style={styles.container}>
            <Text style={styles.createGroupText}>
              {t("groups.createGroup")}
            </Text>
            <View>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.shadow,
                    borderColor: !!errorName.length ? colors.warning : "white",
                  },
                ]}
              >
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder={t("groups.enterGroupName")}
                />
              </Animated.View>
              {!!errorName.length && (
                <Text style={[styles.errorText, { color: colors.warning }]}>
                  *{errorName}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.descriptionContainer,
                { backgroundColor: colors.shadow },
              ]}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                placeholder={t("groups.enterGroupDescription")}
                multiline={true}
                textAlign="left"
                verticalAlign="top"
                textAlignVertical="top"
              />
            </View>
            <GameButtons
              primaryButtonText={t("common.create")}
              skipButtonText={t("common.cancel")}
              skipButtonTextColor={colors.textPrimary}
              onPrimaryPress={async () => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                if (name.trim() === "") {
                  setErrorName(t("common.groupNameEmptyError"));
                  return;
                }
                setIsLoading(true);
                await createGroupInfo(name, description);
                setIsLoading(false);
                containerAnim.value = withTiming(0, { duration: 200 });
                setTimeout(() => {
                  router.back();
                }, 250);
              }}
              onSkipPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                containerAnim.value = withTiming(0, { duration: 200 });
                setTimeout(() => {
                  router.back();
                }, 250);
              }}
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </AppLoading>
  );
};

export default AddGroup;

const styles = ScaledSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    width: "100%",
    height: "50@vs",
    borderColor: "white",
    borderRadius: "8@s",
  },
  createGroupText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.title,
    }),
    color: "white",
    textAlign: "center",
  },
  errorText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  container: {
    flex: 1,
    paddingVertical: "8@vs",
    paddingHorizontal: "16@s",
    justifyContent: "space-between",
    gap: "16@s",
  },
  input: {
    flex: 1,
    paddingHorizontal: "16@s",
    color: "white",
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  descriptionContainer: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    width: "100%",
    borderColor: "white",
    borderRadius: "8@s",
  },
});
