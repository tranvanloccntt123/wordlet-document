import AppLoading from "@/components/AppLoading";
import CommonHeader from "@/components/CommonHeader";
import { addWordLearning } from "@/services/supabase/remember";
import useThemeStore from "@/store/themeStore";
import useWordLearningStore from "@/store/wordLearningStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import { ScaledSheet, ms, s, vs } from "react-native-size-matters";

const AddRememberScreen = () => {
  const { t } = useTranslation();
  // WordStore interface should be defined or imported if not already available globally
  const { colors } = useThemeStore();
  const pushData = useWordLearningStore((state) => state.pushData);
  const params = useLocalSearchParams();
  const wordToAdd = React.useMemo(() => {
    if (typeof params.wordDetails === "string") {
      try {
        return JSON.parse(params.wordDetails) as WordStore;
      } catch (error) {
        console.error("Failed to parse wordDetails param:", error);
        // Optionally, show an error to the user or navigate back
      }
    }
    return null;
  }, [params.wordDetails]);

  const [isSubmitting, setIsSubmitting] = useState(false); // Keep submitting state for loading modal

  const [selectedDefinitionText, setSelectedDefinitionText] = useState<
    string | null
  >(null);

  // Refs for scrolling
  const scrollViewRef = React.useRef<ScrollView>(null);
  const formContainerY = React.useRef<number>(0);

  const { selectableDefinitions, phoneticLine } = React.useMemo(() => {
    const result = {
      selectableDefinitions: [] as { id: string; text: string }[],
      phoneticLine: null as string | null,
    };
    if (wordToAdd?.content) {
      const lines = wordToAdd.content.split("\n");
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!result.phoneticLine && trimmedLine.startsWith("1#")) {
          result.phoneticLine = trimmedLine;
        } else if (trimmedLine.startsWith("5#")) {
          result.selectableDefinitions.push({
            id: `def-${index}`,
            text: trimmedLine,
          });
        }
      });
    }
    return result;
  }, [wordToAdd?.content]);

  const canAddWord = React.useMemo(() => {
    return selectableDefinitions.length > 0;
  }, [selectableDefinitions]);

  React.useEffect(() => {
    setSelectedDefinitionText(null); // Reset on definition changes
    if (selectableDefinitions.length === 1) {
      setSelectedDefinitionText(selectableDefinitions[0].text);
    }
  }, [selectableDefinitions]);

  const styles = createStyles(colors);

  return (
    <AppLoading isLoading={isSubmitting}>
      <View style={styles.safeArea}>
        {/* Use a top-level View for background color */}
        <SafeAreaView style={styles.safeAreaContent}>
          <CommonHeader title={t("remember.remember")} />
          {/* Wrap the ScrollView with KeyboardAvoidingView */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} // Use 'padding' for iOS, 'height' or 'null' for Android
            style={styles.keyboardAvoidingView}
            // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust offset if needed
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.container}
              keyboardShouldPersistTaps="handled" // Helps with dismissing keyboard when tapping outside inputs
            >
              {wordToAdd && selectableDefinitions.length > 0 && (
                <View style={styles.definitionsContainer}>
                  <Text style={styles.definitionsTitle}>
                    {t("groups.selectAMeaning", { word: wordToAdd.word })}:
                  </Text>
                  {selectableDefinitions.map((def) => (
                    <TouchableOpacity
                      key={def.id}
                      style={[
                        styles.definitionItem,
                        selectedDefinitionText === def.text &&
                          styles.definitionItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedDefinitionText(def.text);
                      }}
                    >
                      <Text
                        style={[
                          styles.definitionText,
                          selectedDefinitionText === def.text &&
                            styles.definitionTextSelected,
                        ]}
                      >
                        {def.text.substring(2).trim()}{" "}
                        {/* Remove 5# prefix for display */}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View
                style={styles.formContainer}
                onLayout={(event) => {
                  formContainerY.current = event.nativeEvent.layout.y;
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.button,
                    (isSubmitting ||
                      !wordToAdd ||
                      !selectedDefinitionText ||
                      !canAddWord) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (!wordToAdd) return;
                    let newContent = "";
                    if (phoneticLine) {
                      newContent += phoneticLine + "\n";
                    }
                    newContent += selectedDefinitionText;
                    const modifiedWord: WordStore = {
                      ...wordToAdd,
                      content: newContent,
                    };
                    setIsSubmitting(true);
                    addWordLearning(modifiedWord)
                      .then((r) => {
                        if (r.data?.[0]) {
                          pushData(r.data[0]);
                          router.back();
                        }
                      })
                      .finally(() => {
                        setIsSubmitting(false);
                      });
                  }}
                  disabled={
                    isSubmitting ||
                    !wordToAdd ||
                    !selectedDefinitionText ||
                    !canAddWord
                  }
                >
                  <Text style={styles.buttonText}>{t("common.save")}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </AppLoading>
  );
};

const createStyles = (
  colors: any // Use 'any' or define a proper type for colors
) =>
  ScaledSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    safeAreaContent: { flex: 1 }, // Added to give SafeAreaView flex: 1
    keyboardAvoidingView: { flex: 1 }, // Ensure KeyboardAvoidingView takes available space
    container: { flex: 1, paddingHorizontal: s(20) },
    formContainer: { flex: 1, paddingTop: vs(20) }, // Reduced top padding slightly
    label: {
      fontSize: ms(16),
      color: colors.textSecondary,
      marginBottom: vs(10),
    },
    input: {
      backgroundColor: colors.card,
      color: colors.textPrimary, // Ensure text color is readable
      paddingHorizontal: s(15),
      paddingVertical: vs(12),
      borderRadius: s(8),
      fontSize: ms(16),
      marginBottom: vs(20),
    },
    infoText: {
      fontSize: ms(14),
      color: colors.textSecondary,
      marginBottom: vs(25),
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: vs(15),
      borderRadius: s(8),
      alignItems: "center",
    },
    buttonDisabled: { backgroundColor: colors.textDisabled }, // Use primaryMuted for disabled state
    buttonText: {
      color: colors.card,
      fontSize: ms(16),
      fontWeight: "bold",
    }, // Use a dedicated buttonText color
    orText: {
      fontSize: ms(14),
      color: colors.textSecondary,
      textAlign: "center",
      marginVertical: vs(25), // Space above and below the separator text
    },
    groupItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: vs(15),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    groupName: {
      fontSize: ms(16),
      color: colors.textPrimary,
      flex: 1,
      marginRight: s(10),
    }, // Added flex and margin
    definitionsContainer: {
      marginBottom: vs(20),
      padding: s(10),
      backgroundColor: colors.card,
      borderRadius: s(8),
    },
    definitionsTitle: {
      fontSize: ms(15),
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: vs(10),
    },
    definitionItem: {
      paddingVertical: vs(10),
      paddingHorizontal: s(10),
      borderRadius: s(6),
      marginBottom: vs(5),
    },
    definitionItemSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    definitionText: {
      fontSize: ms(14),
      color: colors.textSecondary,
    },
    definitionTextSelected: {
      color: colors.card, // Or a contrasting color for selected text
    },
    errorText: {
      fontSize: ms(14),
      color: colors.error, // Assuming you have an error color in your theme
      textAlign: "center",
    },
  });

export default AddRememberScreen;
