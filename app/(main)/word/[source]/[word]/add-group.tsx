import CommonHeader from "@/components/CommonHeader";
import FullScreenLoadingModal from "@/components/FullScreenLoadingModal";
import useQuery, { setQueryData } from "@/hooks/useQuery";
import { createGroupInfo, updateGroupInfo } from "@/services/groupServices";
import { fetchGroupDetail, fetchOwnerGroup } from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import { getGroupKey, getOwnerGroup } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import { ScaledSheet, ms, s, vs } from "react-native-size-matters";

const GroupItem: React.FC<{
  groupId: number;
  onAddWordToGroup: () => void;
  disabled?: boolean;
}> = ({ groupId, onAddWordToGroup, disabled }) => {
  const { data: item } = useQuery({
    key: getGroupKey(groupId),
    async queryFn() {
      try {
        const res = await fetchGroupDetail(groupId);
        if (res.error) {
          throw "Failed to fetch group";
        }
        return res.data;
      } catch (e) {
        throw e;
      }
    },
  });

  const colors = useThemeStore((state) => state.colors); // Use theme colors
  const styles = createStyles(colors);

  return (
    !!item && (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={onAddWordToGroup}
        disabled={disabled} // Disable while submitting or if no definition selected
      >
        <Text style={styles.groupName}>{item.name}</Text>
        <MaterialIcons
          name="add-circle-outline"
          size={s(24)}
          color={colors.primary}
        />
      </TouchableOpacity>
    )
  );
};

const AddGroupScreen = () => {
  // WordStore interface should be defined or imported if not already available globally
  const { colors } = useThemeStore();
  const { data: groups } = useQuery<number[]>({
    key: getOwnerGroup(),
    async queryFn() {
      const { error, data } = await fetchOwnerGroup();
      if (!error && !!data) {
        data.map((group) => setQueryData(getGroupKey(group.id), group));
        return data.map((v) => v.id);
      }
      return [];
    },
  });
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

  const [groupName, setGroupName] = useState("");
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

  const handleCreateGroupAndAddWord = async () => {
    // Logic for creating a NEW group
    const trimmedGroupName = groupName.trim();
    if (!trimmedGroupName) {
      Alert.alert("Missing Name", "Please enter a name for the group.");
      return;
    }

    if (!wordToAdd) {
      Alert.alert(
        "Error",
        "No word details found to add to the new group. Please go back and try again."
      );
      return;
    }
    if (!selectedDefinitionText) {
      Alert.alert(
        "Definition Required",
        "Please select a definition for the word before adding it to a group."
      );
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const newGroupId = await createGroupInfo(trimmedGroupName);

      if (newGroupId && wordToAdd && selectedDefinitionText) {
        let newContent = "";
        if (phoneticLine) {
          newContent += phoneticLine + "\n";
        }
        newContent += selectedDefinitionText;
        const modifiedWord: WordStore = { ...wordToAdd, content: newContent };
        updateGroupInfo(newGroupId, (oldData) =>
          oldData
            ? { ...oldData, words: [...oldData.words, modifiedWord] }
            : oldData
        );
      } else {
        // createGroup returned null, likely because the group name already exists
        Alert.alert(
          "Creation Failed",
          `A group with the name "${trimmedGroupName}" already exists. Please choose a different name.`
        );
      }
    } catch (e) {}
    router.back(); // Navigate back after the operation (success or failure alert)
    setIsSubmitting(false);
  };

  const handleAddToExistingGroup = (groupId: number) => {
    // Logic for adding to an EXISTING group
    if (!wordToAdd) {
      Alert.alert(
        "Error",
        "No word details found to add. Please go back and try again."
      );
      return;
    }
    if (!selectedDefinitionText) {
      Alert.alert(
        "Definition Required",
        "Please select a definition for the word."
      );
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true); // Show loading while adding

    let newContent = "";
    if (phoneticLine) {
      newContent += phoneticLine + "\n";
    }
    newContent += selectedDefinitionText;
    const modifiedWord: WordStore = { ...wordToAdd, content: newContent };
    updateGroupInfo(groupId, (oldData) =>
      oldData
        ? { ...oldData, words: [...oldData.words, modifiedWord] }
        : oldData
    );
    router.back(); // Navigate back after adding
    setIsSubmitting(false);
  };

  return (
    <View style={styles.safeArea}>
      {/* Use a top-level View for background color */}
      <SafeAreaView style={styles.safeAreaContent}>
        <CommonHeader title={"Add To A Group"} />
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
                  Select a meaning for "{wordToAdd.word}":
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
                      // Scroll to the form container after selecting a definition
                      if (
                        scrollViewRef.current &&
                        formContainerY.current !== 0
                      ) {
                        scrollViewRef.current.scrollTo({
                          y: formContainerY.current,
                          animated: true,
                        });
                      }
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
            {wordToAdd && selectableDefinitions.length === 0 && (
              <View style={styles.definitionsContainer}>
                <Text style={styles.errorText}>
                  This word ("{wordToAdd.word}") does not have any selectable
                  definitions (5# lines) in its content. It cannot be added to a
                  group.
                </Text>
              </View>
            )}
            {/* Use onLayout to get the Y position of the form container */}
            <View
              style={styles.formContainer}
              onLayout={(event) => {
                formContainerY.current = event.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.label}>Group Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Favorite Words"
                placeholderTextColor={colors.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
                // autoFocus={true} // Consider removing if definition selection is primary first step
              />
              {!!wordToAdd && !!selectedDefinitionText && (
                <Text style={styles.infoText}>
                  This new group will include the word: "{wordToAdd.word}"
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.button,
                  (isSubmitting ||
                    !wordToAdd ||
                    !selectedDefinitionText ||
                    !canAddWord) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleCreateGroupAndAddWord}
                disabled={
                  isSubmitting ||
                  !wordToAdd ||
                  !selectedDefinitionText ||
                  !canAddWord
                }
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Processing..." : "Create Group & Add Word"}
                </Text>
              </TouchableOpacity>
              {(groups?.length || 0) > 0 && (
                <Text style={styles.orText}>OR select an existing group</Text>
              )}
              {(groups?.length || 0) > 0 &&
                groups.map((group) => (
                  <GroupItem
                    key={group}
                    onAddWordToGroup={() => handleAddToExistingGroup(group)}
                    disabled={
                      isSubmitting ||
                      !wordToAdd ||
                      !selectedDefinitionText ||
                      !canAddWord
                    } // Disable while submitting or if no definition selected
                    groupId={group}
                  />
                ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <FullScreenLoadingModal visible={isSubmitting} />
    </View>
  );
};

const createStyles = (
  colors: any // Use 'any' or define a proper type for colors
) =>
  ScaledSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    safeAreaContent: { flex: 1 }, // Added to give SafeAreaView flex: 1
    keyboardAvoidingView: { flex: 1 }, // Ensure KeyboardAvoidingView takes available space
    container: { flex: 1, paddingHorizontal: s(20), paddingTop: vs(10) },
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

export default AddGroupScreen;
