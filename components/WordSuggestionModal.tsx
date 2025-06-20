// c:\english\app\components\WordSuggestionModal.tsx
import useThemeStore from "@/store/themeStore";
import { ParsedWordContent, parseWordContent } from "@/utils/contentParser";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";

interface WordSuggestionModalProps {
  isVisible: boolean;
  onClose: () => void;
  wordDetail: Omit<WordStore, "id"> | null;
}

const WordSuggestionModal: React.FC<WordSuggestionModalProps> = ({
  isVisible,
  onClose,
  wordDetail,
}) => {
  const { colors } = useThemeStore();

  if (!wordDetail) {
    return null;
  }

  const parsedContent: ParsedWordContent = parseWordContent(wordDetail.content);

  // Define styles inside the component or import if they are shared
  const styles = ScaledSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    modalContainer: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: colors.background,
      borderRadius: "10@s",
      paddingHorizontal: "15@s",
      paddingTop: "15@s",
      paddingBottom: "20@s",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: "3.84@s",
      elevation: 5,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10@vs",
    },
    modalTitle: {
      // Renamed from title to avoid conflict
      fontSize: "18@s",
      fontWeight: "bold",
      color: colors.textPrimary,
      flex: 1,
    },
    closeButton: {
      padding: "5@s", // Make it easier to tap
      marginLeft: "10@s",
    },
    scrollViewContent: {
      paddingBottom: "10@vs", // Ensure space at the bottom of scroll
    },
    sectionTitle: {
      fontSize: "16@s",
      fontWeight: "bold",
      color: colors.primary,
      marginTop: "12@vs",
      marginBottom: "6@vs",
    },
    wordText: {
      fontSize: "24@s",
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: "12@vs",
    },
    contentText: {
      fontSize: "15@s",
      color: colors.textSecondary,
      lineHeight: "22@s",
      marginBottom: "5@vs",
    },
    exampleContainer: {
      marginBottom: "10@vs",
      paddingLeft: "10@s",
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
    },
    exampleSentence: {
      fontSize: "15@s",
      color: colors.textPrimary,
      fontStyle: "italic",
    },
    exampleTranslation: {
      fontSize: "14@s",
      color: colors.textSecondary,
      marginTop: "2@vs",
    },
    noContentText: {
      fontSize: "15@s",
      color: colors.textDisabled,
      textAlign: "center",
      marginTop: "15@vs",
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose} // Close on tapping outside
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={() => {
            /* Prevents closing when tapping inside modal */
          }}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>Word Suggestion</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={s(26)}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <Text style={styles.wordText}>{wordDetail.word}</Text>

            {parsedContent.partOfSpeech ? (
              <>
                <Text style={styles.sectionTitle}>Part of Speech</Text>
                <Text style={styles.contentText}>
                  {parsedContent.partOfSpeech}
                </Text>
              </>
            ) : null}

            {parsedContent.definition ? (
              <>
                <Text style={styles.sectionTitle}>Definition</Text>
                <Text style={styles.contentText}>
                  {parsedContent.definition}
                </Text>
              </>
            ) : null}

            {parsedContent.examples.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Examples</Text>
                {parsedContent.examples.map((ex, index) => (
                  <View key={index} style={styles.exampleContainer}>
                    <Text style={styles.exampleSentence}>{ex.sentence}</Text>
                    {ex.translation && (
                      <Text style={styles.exampleTranslation}>
                        {ex.translation}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            ) : null}

            {!parsedContent.partOfSpeech &&
              !parsedContent.definition &&
              parsedContent.examples.length === 0 && (
                <Text style={styles.noContentText}>
                  No additional details available for this word.
                </Text>
              )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default WordSuggestionModal;
