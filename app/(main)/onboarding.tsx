import GameButtons from "@/components/GameButtons";
import en from "@/i18n/en";
import { updateUserSocialInfo } from "@/services/supabase";
import useInfoStore from "@/store/infoStore";
import useOnboardingStore from "@/store/onboardingStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
const goals = {
  title: "categories.goalTitle",
  data: [
    {
      id: en.translation.categories.goals.fluent_speaking.title,
      text: "categories.goals.fluent_speaking.title",
    },
    {
      id: en.translation.categories.goals.academic_boost.title,
      text: "categories.goals.academic_boost.title",
    },
    {
      id: en.translation.categories.goals.clear_pronunciation.title,
      text: "categories.goals.clear_pronunciation.title",
    },
    {
      id: en.translation.categories.goals.daily_chats.title,
      text: "categories.goals.daily_chats.title",
    },
    {
      id: en.translation.categories.goals.easy_writing.title,
      text: "categories.goals.easy_writing.title",
    },
    {
      id: en.translation.categories.goals.exam_success.title,
      text: "categories.goals.exam_success.title",
    },
    {
      id: en.translation.categories.goals.travel_talk.title,
      text: "categories.goals.travel_talk.title",
    },
    {
      id: en.translation.categories.goals.work_english.title,
      text: "categories.goals.work_english.title",
    },
  ],
};

const interests = {
  title: "categories.interestsTitle",
  data: [
    {
      id: en.translation.categories.interests.art_speak.title,
      text: "categories.interests.art_speak.title",
    },
    {
      id: en.translation.categories.interests.fitness_words.title,
      text: "categories.interests.fitness_words.title",
    },
    {
      id: en.translation.categories.interests.food_talk.title,
      text: "categories.interests.food_talk.title",
    },
    {
      id: en.translation.categories.interests.gaming_terms.title,
      text: "categories.interests.gaming_terms.title",
    },
    {
      id: en.translation.categories.interests.movie_quotes.title,
      text: "categories.interests.movie_quotes.title",
    },
    {
      id: en.translation.categories.interests.music_lyrics.title,
      text: "categories.interests.music_lyrics.title",
    },
    {
      id: en.translation.categories.interests.pop_trends.title,
      text: "categories.interests.pop_trends.title",
    },
    {
      id: en.translation.categories.interests.sports_cheer.title,
      text: "categories.interests.sports_cheer.title",
    },
    {
      id: en.translation.categories.interests.tech_lingo.title,
      text: "categories.interests.tech_lingo.title",
    },
    {
      id: en.translation.categories.interests.travel_tales.title,
      text: "categories.interests.travel_tales.title",
    },
  ],
};

const SelectButton: React.FC<{
  item: { id: string; text: string };
  onPress: (selected: boolean) => any;
}> = ({ item, onPress }) => {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const active = useSharedValue(0);
  const containerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        active.value,
        [0, 1],
        [colors.card, colors.primary]
      ),
    };
  });
  const textStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        active.value,
        [0, 1],
        [colors.textPrimary, colors.card]
      ),
    };
  });
  return (
    <TouchableOpacity
      onPress={() => {
        active.value = withTiming(
          active.value === 1 ? 0 : 1,
          {
            duration: 200,
          },
          (finished) => {
            !!finished &&
              !!onPress &&
              runOnJS(onPress)(Math.floor(active.value) === 1);
          }
        );
      }}
    >
      <Animated.View
        style={[
          styles.selectButton,
          { borderColor: colors.shadow },
          containerStyle,
        ]}
      >
        <Animated.Text
          style={[styles.selectText, { color: colors.textPrimary }, textStyle]}
        >
          {t(item.text)}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const WelcomeScreen = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const navigation = useNavigation();
  const setHasSeenOnboarding = useOnboardingStore(
    (state) => state.setHasSeenOnboarding
  );
  const { info } = useInfoStore();

  const scrollRef = React.useRef<ScrollView>(null);

  const goalMapSet = React.useRef<Set<string>>(new Set());

  const interestMapSet = React.useRef<Set<string>>(new Set());

  const continueAnim = useSharedValue(0);

  const colors = useThemeStore((state) => state.colors);

  React.useEffect(() => {
    setHasSeenOnboarding(true);
  }, []);

  // Handle hardware back button (Android)
  const onBackPress = () => {
    // getStartAnim.value = withTiming(
    //   1,
    //   {
    //     duration: 500,
    //   },
    //   (finished) => {
    //     if (finished) {
    //       runOnJS(router.back)();
    //     }
    //   }
    // );
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

  const nextButtonContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(continueAnim.value, [0, 1], [0.5, 1]),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} ref={scrollRef}>
          <Text style={[styles.onBoardTitle, { color: colors.textPrimary }]}>
            {t("home.welcome")}
          </Text>
          <Text
            style={[styles.onBoardMessage, { color: colors.textSecondary }]}
          >
            {t("home.welcomeMessage")}
          </Text>
          <View style={[{ width }, styles.contentContainer]}>
            <Animated.Text
              style={[styles.headerTitle, { color: colors.textPrimary }]}
            >
              {t(goals.title)}
            </Animated.Text>
            <View style={styles.btnListContainer}>
              {goals.data.map((item, index) => (
                <SelectButton
                  key={`Goals-${index}`}
                  item={item}
                  onPress={(selected) => {
                    if (selected) {
                      goalMapSet.current.add(item.id);
                    } else {
                      goalMapSet.current.delete(item.id);
                    }
                    continueAnim.value =
                      !goalMapSet.current.size || !interestMapSet.current.size
                        ? 0
                        : 1;
                  }}
                />
              ))}
            </View>
          </View>
          <View style={[{ width }, styles.contentContainer]}>
            <Animated.Text
              style={[styles.headerTitle, { color: colors.textPrimary }]}
            >
              {t(interests.title)}
            </Animated.Text>
            <View style={styles.btnListContainer}>
              {interests.data.map((item, index) => (
                <SelectButton
                  key={`Interest-${index}`}
                  item={item}
                  onPress={(selected) => {
                    if (selected) {
                      interestMapSet.current.add(item.id);
                    } else {
                      interestMapSet.current.delete(item.id);
                    }
                    continueAnim.value =
                      !goalMapSet.current.size || !interestMapSet.current.size
                        ? 0
                        : 1;
                  }}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        <Animated.View style={[{ padding: s(16) }, nextButtonContainerStyle]}>
          <GameButtons
            onPrimaryPress={() => {
              if (!goalMapSet.current.size || !interestMapSet.current.size)
                return;
              updateUserSocialInfo({
                wordlet_user_id: info?.user_id,
                goals: Array.from(goalMapSet.current).join(", "),
                interests: Array.from(interestMapSet.current).join(", "),
              });
              router.back();
            }}
            hideSkipButton
            primaryButtonText={t("common.continue")}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: "16@s",
  },
  headerTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
    marginBottom: "16@s",
  },
  selectButton: {
    width: "150@s",
    height: "40@vs",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8@s",
  },
  selectText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  btnListContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    flex: 1,
    gap: "8@s",
  },
  onBoardTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.heading,
    }),
    textAlign: "center",
    marginTop: "16@s",
  },
  onBoardMessage: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginTop: "16@s",
    marginHorizontal: "16@s",
  },
});

export default WelcomeScreen;
