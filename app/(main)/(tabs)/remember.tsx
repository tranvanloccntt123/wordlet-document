import ParseContent from "@/components/ParseContent";
import { deleteWordLearning } from "@/services/supabase/remember";
import useThemeStore from "@/store/themeStore";
import useWordLearningStore from "@/store/wordLearningStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { playWord } from "@/utils/voice";
import { MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
import Rive from "rive-react-native";

const RememberItem: React.FC<{
  word: WordRemember;
  index: number;
  length: number;
}> = ({ word, index, length }) => {
  const { width } = useWindowDimensions();

  const { t } = useTranslation();

  const deleteData = useWordLearningStore((state) => state.deleteData);

  const [isDeleted, setIsDeleted] = React.useState<boolean>(false);

  const [zIndex, setZIndex] = React.useState<number>(9999 - index);

  const translationX = useSharedValue(0);

  const prevTranslationX = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
    })
    .onUpdate((event) => {
      const maxTranslateX = width - 50;

      translationX.value = clamp(
        prevTranslationX.value + event.translationX,
        length === 1 ? 0 : -maxTranslateX,
        maxTranslateX
      );
    })
    .onEnd(() => {
      if (Math.abs(width / translationX.value) > 3) {
        translationX.value = withTiming(0, { duration: 200 });
      } else {
        if (width / translationX.value > 0) {
          translationX.value = withTiming(
            width * 2,
            { duration: 200 },
            (finished) => !!finished && runOnJS(setIsDeleted)(true)
          );
        } else {
          translationX.value = withSequence(
            withTiming(
              -width * 2,
              { duration: 200 },
              (finished) => !!finished && runOnJS(setZIndex)(zIndex - length)
            ),
            withTiming(0, { duration: 200 })
          );
        }
      }
    })
    .runOnJS(true);

  const colors = useThemeStore((state) => state.colors);

  const animatedStyles = useAnimatedStyle(() => {
    const rotate = interpolate(
      translationX.value,
      [-width, 0, width],
      [-45, 0, 45]
    );

    return {
      zIndex: zIndex,
      transform: [
        { translateX: translationX.value },
        {
          rotate: `${rotate}deg`,
        },
      ],
    };
  });

  React.useEffect(() => {
    if (isDeleted) {
      deleteWordLearning(word.id).then(() => deleteData(word.id));
    }
  }, [isDeleted]);

  if (isDeleted) return <></>;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.itemContainer,
          {
            borderTopColor: colors.accent,
            borderLeftColor: colors.accent,
            borderBottomColor: colors.primary,
            borderRightColor: colors.primary,
            backgroundColor: colors.card,
          },
          animatedStyles,
        ]}
      >
        {length > 1 && (
          <View
            style={[
              {
                alignSelf: "flex-start",
                backgroundColor: colors.accent,
              },
              styles.itemMarkContainer,
              styles.itemMarkLeft,
            ]}
          >
            <AntDesign
              name="arrowleft"
              size={s(18)}
              color={colors.textPrimary}
            />
            <Text
              style={[
                getAppFontStyle({
                  fontSizeKey: FontSizeKeys.caption,
                  fontFamily: FontFamilies.NunitoRegular,
                }),
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              {t("remember.dragLeft")}
            </Text>
          </View>
        )}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: s(16),
          }}
        >
          <Text
            style={[
              getAppFontStyle({
                fontFamily: FontFamilies.NunitoBlack,
                fontSizeKey: FontSizeKeys.largeTitle,
              }),
              {
                color: colors.textPrimary,
                textAlign: "center",
                fontSize: word.word.word.length > 20 ? s(18) : s(25),
              },
            ]}
          >
            {word.word.word}
          </Text>
          <ParseContent
            content={word.word.content}
            style={{ textAlign: "center" }}
          />
          <TouchableOpacity
            style={{}}
            onPress={() => playWord(word.word.word, word.word.source)}
          >
            <MaterialIcons
              name="volume-up"
              size={s(30)}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            {
              alignSelf: "flex-end",
              backgroundColor: colors.primary,
            },
            styles.itemMarkContainer,
            styles.itemMarkRight,
          ]}
        >
          <Text
            style={[
              getAppFontStyle({
                fontSizeKey: FontSizeKeys.caption,
                fontFamily: FontFamilies.NunitoRegular,
              }),
              {
                color: colors.textPrimary,
              },
            ]}
          >
            {t("remember.remembered")}
          </Text>
          <AntDesign
            name="arrowright"
            size={s(18)}
            color={colors.textPrimary}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const RememberScreen = () => {
  const { t } = useTranslation();
  const colors = useThemeStore((state) => state.colors);
  const { data, fetchData } = useWordLearningStore((state) => state);

  const [localData, setLocalData] = React.useState(data);

  React.useEffect(() => {
    if (!localData.length && data.length) {
      setLocalData(data);
    }
  }, [data, localData]);

  React.useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
    React.useCallback(() => {
      // Invoked whenever the route is focused.
      setLocalData([]);

      // Return function is invoked whenever the route gets out of focus.
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.border }]}>
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          {localData.map((item, index) => (
            <RememberItem
              word={item}
              key={`mark-${index}`}
              index={index}
              length={localData.length}
            />
          ))}
          {!data.length && (
            <View
              style={[
                styles.itemContainer,
                {
                  borderColor: colors.shadow,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: s(16),
                }}
              >
                <View
                  style={{
                    width: s(150),
                    height: s(150),
                  }}
                >
                  <Rive
                    resourceName={"search_rive"}
                    style={{
                      width: s(150),
                      height: s(150),
                    }}
                  />
                </View>
                <Text
                  style={[
                    getAppFontStyle({
                      fontFamily: FontFamilies.NunitoBlack,
                      fontSizeKey: FontSizeKeys.largeTitle,
                    }),
                    { color: colors.textPrimary, textAlign: "center" },
                  ]}
                >
                  {t("remember.noWord")}
                </Text>
                <Text
                  style={[
                    getAppFontStyle({
                      fontFamily: FontFamilies.NunitoRegular,
                      fontSizeKey: FontSizeKeys.caption,
                    }),
                    {
                      color: colors.textSecondary,
                      textAlign: "center",
                      marginHorizontal: s(32),
                    },
                  ]}
                >
                  {t("remember.noWordDesc")}
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default RememberScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    borderRadius: "16@s",
    position: "absolute",
    width: "300@s",
    height: "500@vs",
    overflow: "hidden",
    paddingVertical: "16@s",
    borderWidth: "3@s",
  },
  itemMarkContainer: {
    height: "45@s",
    width: "180@s",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: "18@s",
  },
  itemMarkLeft: {
    borderTopRightRadius: "45@s",
    borderBottomRightRadius: "45@s",
  },
  itemMarkRight: {
    borderTopLeftRadius: "45@s",
    borderBottomLeftRadius: "45@s",
  },
});
