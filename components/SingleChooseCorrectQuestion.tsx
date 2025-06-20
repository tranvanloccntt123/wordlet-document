// c:\english\app\components\SingleChooseCorrectQuestion.tsx
import Colors from "@/constants/Colors";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import * as Haptics from "expo-haptics";
import { t } from "i18next";
import React from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { ScaledSheet } from "react-native-size-matters";

interface SingleChooseCorrectQuestionProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswerPress: (answer: string) => void;
}

const WordOptions: React.FC<{
  option: string;
  correctAnswer: string;
  index: number;
  onPress: (index: number, option: string) => void;
  indexSelected: SharedValue<number>;
}> = ({ option, correctAnswer, index, onPress, indexSelected }) => {
  const { colors } = useThemeStore();
  const isSelected = useSharedValue(0);
  const isActualCorrect = option === correctAnswer;

  const statusAnim = useDerivedValue(() => {
    if (indexSelected.value === -1) {
      isSelected.value = 0;
    }
    if (indexSelected.value >= 0) {
      if (isActualCorrect) {
        return 2;
      }
      if (isSelected.value === 1) {
        return 1;
      }
    }
    return 0;
  });

  let buttonStyle: StyleProp<ViewStyle> = [dynamicStyles(colors).optionButton]; // Start with base style

  const contentContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        statusAnim.value,
        [0, 1, 2],
        [colors.card, colors.accent, colors.success]
      ),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        statusAnim.value,
        [0, 1, 2],
        [colors.textPrimary, colors.card, colors.card]
      ),
    };
  });

  return (
    <TouchableOpacity
      key={index}
      onPress={() => {
        if (indexSelected.value >= 0) return;
        isSelected.value = 1;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(index, option);
      }}
    >
      <Animated.View style={[buttonStyle, contentContainerStyle]}>
        <Animated.Text style={[dynamicStyles(colors).optionText, textStyle]}>
          {option}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const SingleChooseCorrectQuestion: React.FC<
  SingleChooseCorrectQuestionProps
> = ({ question, options, correctAnswer, onAnswerPress }) => {
  const { colors } = useThemeStore();

  const selectedAnswerAim = useSharedValue(-1);

  React.useEffect(() => {
    if (options) {
      selectedAnswerAim.value = -1;
    }
  }, [options]);

  const styles = React.useMemo(() => dynamicStyles(colors), [colors]);

  const onOptionPress = (index: number, option: string) => {
    selectedAnswerAim.value = index;
    onAnswerPress(option);
  };

  return (
    <>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
      </View>
      <Text style={[styles.answerTxt]}>{t("common.answer")}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          return (
            <WordOptions
              key={`option-${index}`}
              option={option}
              correctAnswer={correctAnswer}
              index={index}
              onPress={onOptionPress}
              indexSelected={selectedAnswerAim}
            />
          );
        })}
      </View>
    </>
  );
};

export default SingleChooseCorrectQuestion;

// Dynamic styles based on theme
const dynamicStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
  ScaledSheet.create({
    questionContainer: {
      marginBottom: "30@ms",
      padding: "15@s",
      backgroundColor: colors.card, // Use a slightly offset background for the question
      borderRadius: "8@s",
      width: "100%",
    },
    questionText: {
      fontSize: "18@s",
      textAlign: "center",
      lineHeight: "24@s",
      color: colors.textPrimary,
    },
    optionsContainer: {
      width: "100%",
      gap: "10@vs",
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: "15@vs",
      paddingHorizontal: "20@s",
      borderRadius: "8@s",
      backgroundColor: colors.card,
    },
    optionText: {
      fontSize: "16@s",
      flex: 1,
      color: colors.textPrimary,
    },
    correctButton: {
      borderColor: colors.success,
      backgroundColor: colors.card, // Assuming you have an opaque success color
    },
    incorrectButton: {
      borderColor: colors.error,
      backgroundColor: colors.card, // Assuming you have an opaque error color
    },
    answerTxt: {
      ...getAppFontStyle({
        fontFamily: FontFamilies.NunitoBold,
        fontSizeKey: FontSizeKeys.caption,
      }),
      color: colors.textPrimary,
      paddingVertical: "8@s",
    },
  });
