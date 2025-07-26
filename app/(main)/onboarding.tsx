import GameButtons from "@/components/GameButtons";
import useOnboardingStore from "@/store/onboardingStore";
import useThemeStore from "@/store/themeStore";
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import {
  Canvas,
  Group,
  Image,
  interpolateColors,
  LinearGradient,
  Paragraph,
  Rect,
  Skia,
  TextAlign,
  useFonts,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, Dimensions, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { s, ScaledSheet, vs } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const customFontMgr = useFonts({
    Nunito: [Nunito_400Regular, Nunito_700Bold, Nunito_900Black],
  });
  const setHasSeenOnboarding = useOnboardingStore(
    (state) => state.setHasSeenOnboarding
  );
  const cloud2 = useImage(require("@/assets/images/cloud2.png"));
  const cloud3 = useImage(require("@/assets/images/cloud3.png"));
  const cloud4 = useImage(require("@/assets/images/cloud4.png"));
  const cloud5 = useImage(require("@/assets/images/cloud5.png"));
  const sun = useImage(require("@/assets/images/sun.png"));

  const getStartAnim = useSharedValue(1);

  const cloud2Anim = useSharedValue(1);

  const cloud3Anim = useSharedValue(0.8);

  const cloud4Anim = useSharedValue(1);

  const cloud5Anim = useSharedValue(1);

  const sunAnim = useSharedValue(1.2);

  const colors = useThemeStore((state) => state.colors);

  React.useEffect(() => {
    cloud2Anim.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1
    );
    cloud3Anim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700 }),
        withTiming(0.8, { duration: 1700 })
      ),
      -1
    );
    cloud4Anim.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1
    );
    cloud5Anim.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1
    );
    sunAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(1.1, { duration: 1500 })
      ),
      -1
    );
    getStartAnim.value = withDelay(100, withTiming(0, { duration: 1500 }));
    setHasSeenOnboarding(true);
  }, []);

  const paragraph = React.useMemo(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle = {
      textAlign: TextAlign.Center,
    };
    const textStyle = {
      color: Skia.Color("black"),
      fontFamilies: ["Nunito"],
      fontSize: s(25),
    };
    return Skia.ParagraphBuilder.Make(paragraphStyle, customFontMgr)
      .pushStyle({ ...textStyle, fontStyle: { weight: 900 } })
      .addText(t("home.welcome"))
      .pushStyle({
        ...textStyle,
        fontSize: s(15),
        color: Skia.Color("black"),
        fontStyle: { weight: 400 },
      })
      .addText(`\n${t("home.welcomeMessage")}`)
      .pop()
      .build();
  }, [customFontMgr]);

  const cloud1Transform = useDerivedValue(() => {
    return [
      { scale: cloud2Anim.value },
      { translateX: interpolate(getStartAnim.value, [0, 1], [0, -width]) },
    ];
  });

  const cloud3Transform = useDerivedValue(() => {
    return [
      { scale: cloud3Anim.value },
      { translateX: interpolate(getStartAnim.value, [0, 1], [0, -width]) },
    ];
  });

  const cloud4Transform = useDerivedValue(() => {
    return [
      { scale: cloud4Anim.value },
      { translateX: interpolate(getStartAnim.value, [0, 1], [0, width]) },
    ];
  });

  const cloud5Transform = useDerivedValue(() => {
    return [
      { scale: cloud5Anim.value },
      { translateX: interpolate(getStartAnim.value, [0, 1], [0, width]) },
    ];
  });

  const sunTransform = useDerivedValue(() => {
    return [{ scale: cloud2Anim.value }];
  });

  const sunOpacity = useDerivedValue(() => {
    return interpolate(getStartAnim.value, [0, 1], [1, 0]);
  });

  const labelTransform = useDerivedValue(() => {
    return [
      { translateY: interpolate(getStartAnim.value, [0, 1], [0, height]) },
    ];
  });

  const gradientColors = useDerivedValue(() => {
    return [
      interpolateColors(
        getStartAnim.value,
        [0, 1],
        ["#4682B4", colors.background]
      ),
      interpolateColors(
        getStartAnim.value,
        [0, 1],
        ["#87CEEB", colors.background]
      ),
      interpolateColors(
        getStartAnim.value,
        [0, 1],
        ["#B0E0E6", colors.background]
      ),
    ];
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(getStartAnim.value, [0, 0.5, 1], [1, 1, 0]),
    };
  });

  // Handle hardware back button (Android)
  const onBackPress = () => {
    getStartAnim.value = withTiming(
      1,
      {
        duration: 500,
      },
      (finished) => {
        if (finished) {
          runOnJS(router.back)();
        }
      }
    );
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
    <Animated.View style={[styles.container, containerStyle]}>
      <Canvas style={styles.canvas}>
        {/* Sky background color */}
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, height)}
            end={vec(width, 0)}
            colors={gradientColors}
          />
        </Rect>
        <Group>
          <Group transform={sunTransform} origin={vec(300 / 2, 300 / 2)}>
            <Image
              x={(width - 300) / 2}
              y={vs(50)}
              width={300}
              height={300}
              image={sun}
              fit="contain"
              opacity={sunOpacity}
            />
          </Group>
          <Group transform={cloud1Transform} origin={vec(500 / 2, 500 / 2)}>
            <Image
              x={-width / 2}
              y={0}
              width={500}
              height={500}
              image={cloud2}
              fit="contain"
            />
          </Group>
          <Group transform={cloud3Transform} origin={vec(400 / 2, 400 / 2)}>
            <Image
              x={0}
              y={height / 5}
              width={400}
              height={400}
              image={cloud3}
              fit="contain"
            />
          </Group>
          <Group transform={cloud4Transform} origin={vec(250 / 2, 250 / 2)}>
            <Image
              x={width / 2}
              y={0}
              width={250}
              height={250}
              image={cloud4}
              fit="contain"
            />
          </Group>
          <Group transform={cloud5Transform} origin={vec(150, 150)}>
            <Image
              x={width / 2}
              y={height / 5}
              width={300}
              height={300}
              image={cloud5}
              fit="contain"
            />
          </Group>
          <Group transform={labelTransform}>
            <Paragraph
              paragraph={paragraph}
              x={16}
              y={height - insets.bottom - vs(200)}
              width={width - 32}
              opacity={sunOpacity}
            />
          </Group>
        </Group>
      </Canvas>
      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        <GameButtons
          hideSkipButton={true}
          primaryButtonText={t("common.letGo")}
          onPrimaryPress={() => {
            getStartAnim.value = withTiming(
              1,
              {
                duration: 500,
              },
              (finished) => {
                if (finished) {
                  runOnJS(router.back)();
                }
              }
            );
          }}
        />
      </View>
    </Animated.View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  canvas: {
    flex: 1,
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    top: height / 2 - 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    position: "absolute",
    left: "15@s",
    right: "15@s",
  },
});

export default WelcomeScreen;
