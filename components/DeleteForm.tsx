import AppLoading from "@/components/AppLoading";
import GameButtons from "@/components/GameButtons";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, Text, View } from "react-native";
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

const DeleteForm: React.FC<{
  title: string;
  subTitle: string;
  onSubmit: () => any;
}> = ({ title, subTitle, onSubmit }) => {
  const colors = useThemeStore((state) => state.colors);
  const params = useLocalSearchParams<{
    x: string;
    y: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();
  const backgroundAnim = useSharedValue(0);
  const contentAnim = useSharedValue(0);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
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

  const rootStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        backgroundAnim.value,
        [0, 70],
        ["rgba(0, 0, 0, 0)", colors.background]
      ),
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
      <Animated.View style={[{ flex: 1 }, rootStyle]}>
        <Animated.View
          style={[
            styles.background,
            {
              backgroundColor: colors.accentDark,
              left: parseFloat(params.x || "0") - s(11),
              top: parseFloat(params.y || "0") - s(11),
            },
            backgroundStyle,
          ]}
        ></Animated.View>
        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View style={[styles.container, contentStyle]}>
            <View style={[styles.alertContainer]}>
              <Ionicons
                name="close-circle-outline"
                size={s(160)}
                color="white"
              />
              <Text style={styles.titleText}>{title}</Text>
              <Text style={styles.descriptionText}>{subTitle}</Text>
            </View>
            <GameButtons
              skipButtonTextColor={"white"}
              skipButtonText={t("common.cancel")}
              primaryButtonText={t("common.delete")}
              onPrimaryPress={async () => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                setIsLoading(true);
                await onSubmit();
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
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </AppLoading>
  );
};

export default DeleteForm;

const styles = ScaledSheet.create({
  background: {
    width: "22@s",
    height: "22@s",
    position: "absolute",
    borderRadius: "22@s",
  },
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: "16@s",
    paddingHorizontal: "24@s",
    flex: 1,
  },
  alertContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.largeTitle,
      fontFamily: FontFamilies.NunitoBlack,
    }),
    color: "white",
  },
  descriptionText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.body,
      fontFamily: FontFamilies.NunitoRegular,
    }),
    color: "white",
    textAlign: "center",
  },
});
