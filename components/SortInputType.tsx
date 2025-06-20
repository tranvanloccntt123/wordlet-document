import Colors from "@/constants/Colors";
import useThemeStore from "@/store/themeStore";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, TextInput } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { ScaledSheet } from "react-native-size-matters";
import GameButtons from "./GameButtons";

enum WordStatus {
  READY = 0,
  WRONG = 1,
  CORRECT = 2,
}
const SortInputType: React.FC<{
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
      <GameButtons
        hidePrimaryButton={true}
        skipButtonDisabled={isCorrect === true}
        onSkipPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSkip();
        }}
      />
    </>
  );
};

export default SortInputType;

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
  });
