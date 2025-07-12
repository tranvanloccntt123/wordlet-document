import AppLoading from "@/components/AppLoading";
import GameButtons from "@/components/GameButtons";
import useQuery from "@/hooks/useQuery";
import { updateGroupInfo } from "@/services/groupServices";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { getGroupKey } from "@/utils/string";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, Text, TextInput, View } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

const EditGroup: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const params = useLocalSearchParams<{
    x: string;
    y: string;
    groupId?: string;
    groupName?: string;
  }>();
  const { data: item } = useQuery({
    key: getGroupKey(parseInt(params.groupId || "0")),
  });
  const backgroundAnim = useSharedValue(0);
  const contentAnim = useSharedValue(0);
  const router = useRouter();
  const navigation = useNavigation();
  const [name, setName] = React.useState<string>(item?.name || "");
  const [errorName, setErrorName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>(
    item?.description || ""
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    backgroundAnim.value = withTiming(70, { duration: 400 });
    contentAnim.value = withDelay(500, withTiming(1, { duration: 200 }));
  }, []);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: backgroundAnim.value,
        },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentAnim.value,
    };
  });

  React.useEffect(() => {
    // Add BackHandler listener for Android
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        contentAnim.value = withTiming(0, { duration: 180 });
        backgroundAnim.value = withDelay(
          200,
          withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
              runOnJS(router.back)();
            }
          })
        );
        return true;
      }
    );

    // Clean up listeners on unmount
    return () => {
      // unsubscribe();
      subscription.remove();
    };
  }, [navigation, router]);

  return (
    <AppLoading isLoading={isLoading}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            styles.background,
            {
              backgroundColor: colors.primaryDark,
              left: parseFloat(params.x || "0") - s(11),
              top: parseFloat(params.y || "0") - s(11),
            },
            backgroundStyle,
          ]}
        ></Animated.View>
        <Animated.View style={[{ flex: 1 }, contentStyle]}>
          <SafeAreaView style={styles.container}>
            <Text style={styles.createGroupText}>
              {t("groups.editGroupTitle")}
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
              primaryButtonText={t("common.save")}
              skipButtonText={t("common.cancel")}
              skipButtonTextColor={"white"}
              onPrimaryPress={async () => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                if (name.trim() === "") {
                  setErrorName(t("common.groupNameEmptyError"));
                  return;
                }
                setIsLoading(true);
                await updateGroupInfo(
                  parseInt(params.groupId || "0"),
                  (oldData) =>
                    !oldData
                      ? oldData
                      : {
                          ...oldData,
                          name: name,
                          description: description,
                        }
                );
                setIsLoading(false);
                contentAnim.value = withTiming(0, { duration: 180 });
                backgroundAnim.value = withDelay(
                  200,
                  withTiming(0, { duration: 400 }, (finished) => {
                    if (finished) {
                      runOnJS(router.back)();
                    }
                  })
                );
              }}
              onSkipPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                contentAnim.value = withTiming(0, { duration: 180 });
                backgroundAnim.value = withDelay(
                  200,
                  withTiming(0, { duration: 400 }, (finished) => {
                    if (finished) {
                      runOnJS(router.back)();
                    }
                  })
                );
              }}
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </AppLoading>
  );
};

export default EditGroup;

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
  background: {
    width: "22@s",
    height: "22@s",
    position: "absolute",
    borderRadius: "22@s",
  },
});
