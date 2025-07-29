import useOnboardingStore from "@/store/onboardingStore";
import useThemeStore from "@/store/themeStore";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { BackHandler } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

const WelcomeScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const setHasSeenOnboarding = useOnboardingStore(
    (state) => state.setHasSeenOnboarding
  );

  const colors = useThemeStore((state) => state.colors);

  const getStartAnim = useSharedValue(1);

  React.useEffect(() => {
    getStartAnim.value = withDelay(100, withTiming(0, { duration: 1500 }));
    setHasSeenOnboarding(true);
  }, []);

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
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        containerStyle,
      ]}
    >
      <SafeAreaView style={{ flex: 1 }}></SafeAreaView>
    </Animated.View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
});

export default WelcomeScreen;
