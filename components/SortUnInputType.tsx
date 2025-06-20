import Colors from "@/constants/Colors";
import useThemeStore from "@/store/themeStore";
import { shuffleArray } from "@/utils/array";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    interpolate,
    interpolateColor,
    makeMutable,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { ScaledSheet } from "react-native-size-matters";
import GameButtons from "./GameButtons";

enum WordStatus {
  READY = 0,
  WRONG = 1,
  CORRECT = 2,
}

const ToggleButton: React.FC<{
  isSelected: SharedValue<number>;
  char: string;
  onPress: () => any;
}> = ({ isSelected, char, onPress }) => {
  const { colors } = useThemeStore();

  const styles = createStyles(colors); // Define styles inside or pass colors

  const contentContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isSelected.value, [0, 1], [1, 0.5]),
    };
  });

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View
        style={[
          styles.wordToggleButton,
          { backgroundColor: colors.card },
          contentContainerStyle,
        ]}
      >
        <Text style={[styles.letterText, { color: colors.textPrimary }]}>
          {char.toUpperCase()}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const SortUnInputType: React.FC<{
  actualWord: string;
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: () => void;
  editable: boolean;
}> = ({ actualWord, onCorrect, editable, onWrong, onSkip }) => {
  const { t } = useTranslation();
  const textInputRef = useRef<TextInput>(null);
  const { colors } = useThemeStore();
  const [userInput, setUserInput] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const orderWord = React.useRef<number[]>([]);
  const splitWord = React.useMemo(
    () => shuffleArray(actualWord.split("")),
    [actualWord]
  );
  const selectedButton = React.useMemo(
    () => splitWord.map((v) => makeMutable(0)),
    [splitWord]
  );
  const styles = createStyles(colors); // Define styles inside or pass colors
  const statusAnim = useSharedValue(WordStatus.READY);

  const handleInputChange = (text: string) => {
    if (text.length <= actualWord.length) {
      setUserInput(text.toLowerCase());
    } else {
      setUserInput(text.substring(0, actualWord.length).toLowerCase());
    }
    if (text.length === actualWord.length) {
      Keyboard.dismiss();
      if (text.toLocaleLowerCase() === actualWord.toLowerCase()) {
        onCorrect();
        statusAnim.value = WordStatus.CORRECT;
        setIsCorrect(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onWrong();
        statusAnim.value = WordStatus.WRONG;
        setIsCorrect(false);
      }
    }
  };

  const inputContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        statusAnim.value,
        [WordStatus.READY, WordStatus.WRONG, WordStatus.CORRECT],
        [colors.card, colors.accent, colors.success]
      ),
    };
  });

  const handleUndoLetter = () => {
    if (userInput.length > 0 && orderWord.current.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      const index = orderWord.current.pop()!;
      selectedButton[index].value = 0;
      setUserInput(orderWord.current.map((v) => splitWord[v]).join(""));
    }
  };

  return (
    <>
      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            {
              color: colors.textPrimary,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          value={userInput}
          onChangeText={handleInputChange}
          maxLength={actualWord.length}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          editable={editable}
          onSubmitEditing={() => {
            /* Can add logic if needed */
          }}
        />
      </Animated.View>
      <View style={styles.lettersContainer}>
        {splitWord.map((v, index) => (
          <ToggleButton
            key={`${index}-${v}`}
            char={v}
            isSelected={selectedButton[index]}
            onPress={() => {
              if (selectedButton[index].value === 1) {
                return;
              }
              handleInputChange(userInput + v);
              orderWord.current.push(index);
              selectedButton[index].value = withTiming(1, { duration: 150 });
            }}
          />
        ))}
      </View>
      <GameButtons
        primaryButtonDisabled={userInput.length === 0 || isCorrect === true}
        skipButtonDisabled={isCorrect === true}
        primaryButtonText={t("common.undo")}
        onPrimaryPress={handleUndoLetter}
        onSkipPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSkip();
        }}
      />
    </>
  );
};

export default SortUnInputType;

// Add styles here, similar to the ones in SortCharactersGame.tsx but scoped
const createStyles = (colors: typeof Colors.dark | typeof Colors.light) =>
  ScaledSheet.create({
    inputContainer: {
      width: "80%",
      borderWidth: 1,
      borderColor: colors.card,
      borderRadius: "8@s",
      marginBottom: "20@ms",
    },
    textInput: {
      height: "50@ms",
      width: "100%",
      paddingHorizontal: "15@ms",
      fontSize: "20@s",
      textAlign: "center",
      borderRadius: "8@s",
    },
    lettersContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "4@ms",
      marginBottom: "20@ms",
      alignItems: "center",
    },
    letterText: { fontSize: "18@s", fontWeight: "bold" },
    wordToggleButton: {
      width: "30@s",
      height: "30@s",
      borderRadius: "8@s",
      justifyContent: "center",
      alignItems: "center",
    },
  });
