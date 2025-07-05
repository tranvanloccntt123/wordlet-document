import Colors from "@/constants/Colors";
import useThemeStore from "@/store/themeStore";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SortUnInputType from "./SortUnInputType";
import SuggestButton from "./SuggestButton";

interface SingleWordSortGameProps {
  wordDetail: Omit<WordStore, "id">;
  onCorrect: () => void;
  onSkip: () => void;
}

const SingleWordSortGame: React.FC<SingleWordSortGameProps> = ({
  wordDetail,
  onCorrect,
  onSkip,
}) => {
  const { colors } = useThemeStore();
  const actualWord = React.useMemo(
    () => wordDetail.word.toLowerCase(),
    [wordDetail]
  );

  // Adapted content parser (simplified to only show definitions for this component)
  const parseAndRenderGameContent = (content: string | undefined) => {
    if (!content) return null;
    const elements: React.ReactNode[] = [];
    content.split("\n").forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("5#")) {
        elements.push(
          <Text
            key={`content-5-${index}`}
            style={[styles.contentDefinition, { color: colors.textPrimary }]}
          >
            {trimmedLine.substring(2).trim()}
          </Text>
        );
      }
    });
    return elements.length > 0 ? (
      elements
    ) : (
      <Text
        style={{
          color: colors.textDisabled,
          textAlign: "center",
          marginTop: 10,
        }}
      >
        No definition available.
      </Text>
    );
  };

  const styles = createStyles(colors); // Define styles inside or pass colors

  if (!actualWord) return null; // Don't render if word isn't set up

  return (
    <View style={styles.gameAreaContainer}>
      <SortUnInputType
        actualWord={actualWord}
        onCorrect={function (): void {
          onCorrect();
        }}
        onWrong={function (): void {}}
        editable={false}
        onSkip={onSkip}
      />
      <SuggestButton currentWord={wordDetail} isCorrect={null} />
      {wordDetail.content && (
        <View style={styles.wordContentContainer}>
          <ScrollView
            nestedScrollEnabled={true}
            style={styles.contentScrollView}
          >
            {parseAndRenderGameContent(wordDetail.content)}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// Add styles here, similar to the ones in SortCharactersGame.tsx but scoped
const createStyles = (colors: typeof Colors.dark | typeof Colors.light) =>
  ScaledSheet.create({
    gameAreaContainer: { alignItems: "center", width: "100%" },
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
    feedbackText: {
      fontSize: "16@s",
      marginBottom: "15@ms",
      marginTop: "-10@ms",
    },
    lettersContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12@ms",
      marginBottom: "20@ms",
      alignItems: "center",
    },
    letterButton: {
      borderRadius: "8@s",
      paddingVertical: "12@ms",
      paddingHorizontal: "16@ms",
      minWidth: "40@s",
      alignItems: "center",
    },
    letterDisplay: {
      // Style for non-interactive letters in text input mode
      borderRadius: "8@s",
      paddingVertical: "12@ms",
      paddingHorizontal: "16@ms",
      minWidth: "40@s",
      alignItems: "center",
      opacity: 0.7, // Make them look less prominent
    },
    letterText: { fontSize: "20@s", fontWeight: "bold" },
    controlsContainer: {
      marginBottom: "20@ms",
      alignItems: "center",
    },
    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: "8@ms",
      paddingHorizontal: "15@ms",
      borderWidth: 1,
      borderRadius: "20@s",
    },
    toggleButtonText: {
      marginLeft: "8@ms",
      fontSize: "14@s",
    },
    wordContentContainer: {
      marginTop: "10@ms",
      padding: "10@ms",
      backgroundColor: colors.card,
      borderRadius: "8@s",
      width: "100%",
      maxHeight: "150@s", // Limit height, make it scrollable
    },
    contentScrollView: {},
    contentDefinition: {
      fontSize: "14@s",
      lineHeight: "19@s",
      marginBottom: "5@ms",
    },
  });

export default SingleWordSortGame;
