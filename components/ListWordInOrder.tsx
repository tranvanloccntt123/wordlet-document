import { updateGroupInfo } from "@/services/groupServices";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import { playWord } from "@/utils/voice"; // Import playWord utility
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react"; // Import useEffect, useState
import { useTranslation } from "react-i18next"; // Import useTranslation
import {
  Alert, // Import Dimensions
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";
import ParseContent from "./ParseContent";

const ListWordInOrder: React.FC<{ group: Group }> = ({ group }) => {
  const { width } = useWindowDimensions();
  const info = useInfoStore((state) => state.info);
  const groupWords = group.words || [];

  const { t } = useTranslation(); // Initialize useTranslation
  const { colors } = useThemeStore();
  const styles = createStyles(colors, width); // Pass colors and width to style creator
  const flatlistRef = React.useRef<FlatList>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<
    WordStore | Omit<WordStore, "id"> | null
  >(null);
  const [editedContent, setEditedContent] = useState("");
  // New state to store the original content structure for reconstruction
  const [originalContentStructure, setOriginalContentStructure] = useState<
    Array<{ type: "5#" | "other"; line: string }>
  >([]);

  const openEditModal = (word: Omit<WordStore, "id">) => {
    const structure: Array<{ type: "5#" | "other"; line: string }> = [];
    const fiveLinesForEditing: string[] = [];

    word.content.split("\n").forEach((line) => {
      if (line.startsWith("5#")) {
        structure.push({ type: "5#", line });
        fiveLinesForEditing.push(line); // Keep the "5#" prefix for editing context if desired, or substring it
      } else {
        structure.push({ type: "other", line });
      }
    });

    setEditingWord(word);
    // Show only 5# lines for editing, potentially without the "5#" prefix for a cleaner edit experience
    setEditedContent(
      fiveLinesForEditing.map((line) => line.substring(2).trim()).join("\n")
    );
    setIsEditModalVisible(true);
    setOriginalContentStructure(structure);
  };

  const handleSaveEdit = async () => {
    if (editingWord) {
      // Call the store action to update the word
      await updateGroupInfo(group.id, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          words: (oldData.words || []).map((v) =>
            v.word === editingWord.word && v.source === editingWord.source
              ? { ...v, content: reconstructContent() }
              : v
          ),
        };
      });
      setIsEditModalVisible(false);
      setEditingWord(null);
      setOriginalContentStructure([]);
    }
  };

  const reconstructContent = (): string => {
    if (!originalContentStructure) return editedContent; // Fallback, though should not happen

    const newFiveLinesRaw = editedContent.split("\n");
    let fiveLineIdx = 0;
    const finalContentLines: string[] = [];

    originalContentStructure.forEach((part) => {
      if (part.type === "5#") {
        if (fiveLineIdx < newFiveLinesRaw.length) {
          const userLine = newFiveLinesRaw[fiveLineIdx].trim();
          if (userLine) {
            // Only add non-empty lines
            finalContentLines.push(
              userLine.startsWith("5#") ? userLine : "5#" + userLine
            );
          }
          fiveLineIdx++;
        }
        // If user provided fewer 5# lines, original ones beyond that count are effectively removed.
      } else {
        // part.type === 'other'
        finalContentLines.push(part.line);
      }
    });

    // If user provided more 5# lines than original slots, append them.
    while (fiveLineIdx < newFiveLinesRaw.length) {
      const userLine = newFiveLinesRaw[fiveLineIdx].trim();
      if (userLine) {
        // Only add non-empty lines
        finalContentLines.push(
          userLine.startsWith("5#") ? userLine : "5#" + userLine
        );
      }
      fiveLineIdx++;
    }
    return finalContentLines.join("\n");
  };

  const handleRemoveWord = (
    wordName: string,
    wordContent: string,
    index: number
  ) => {
    if (!group.id) return;

    Alert.alert(
      t("groups.removeWordTitle"),
      t("groups.confirmRemoveWordMessage", {
        wordName,
        groupName: group.name || t("groups.thisGroupFallback", "this group"), // Added a fallback key
      }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.remove"),
          onPress: async () => {
            if (index === group.words.length - 1 && index > 0) {
              //move previous
              flatlistRef.current?.scrollToIndex({
                animated: true,
                index: index - 1,
              });
            }
            await updateGroupInfo(group.id, (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                words: (oldData.words || []).filter(
                  (w) => !(w.word === wordName && w.content === wordContent)
                ),
              };
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderWordItem = ({
    item,
    index,
  }: {
    item: Omit<WordStore, "id">;
    index: number;
  }) => (
    <View style={[styles.wordPageStyle, { width }]}>
      <View style={[styles.wordCardStyle, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.playAudioButton}
          onPress={() => playWord(item.word, item.source)}
        >
          <MaterialIcons name="volume-up" size={s(30)} color={colors.primary} />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: s(2),
            marginBottom: s(5),
          }}
        >
          <Text
            style={[
              styles.wordTextStyle,
              {
                color: colors.textPrimary,
                fontSize: item.word.length > 20 ? s(15) : s(18),
              },
            ]}
          >
            {item.word}
          </Text>
          {info?.user_id === group.user_id && (
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={{ padding: s(5) }}
            >
              <MaterialIcons
                name="edit"
                size={s(15)} // Slightly smaller than delete for differentiation
                color={colors.primaryDark} // Different color for edit
              />
            </TouchableOpacity>
          )}
        </View>
        <ParseContent content={item.content} />
        {info?.user_id === group.user_id && (
          <TouchableOpacity
            style={styles.removeWordButton}
            onPress={() => handleRemoveWord(item.word, item.content, index)}
          >
            <MaterialIcons
              name="delete-outline"
              size={s(30)}
              color={colors.accentDark}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        ref={flatlistRef}
        style={{ flex: 1 }}
        data={groupWords}
        renderItem={renderWordItem}
        keyExtractor={
          (item, index) => index.toString() // Use the unique word ID
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      {/* Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("groups.editContentForTitle", {
                wordName: editingWord?.word,
              })}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  backgroundColor: colors.background, // Or colors.inputBackground if you have one
                },
              ]}
              multiline
              numberOfLines={10}
              value={editedContent}
              onChangeText={setEditedContent}
              textAlignVertical="top" // Align text to the top for multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.shadow }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSaveEdit}
              >
                <Text style={[styles.modalButtonText, { color: colors.card }]}>
                  {t("common.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ListWordInOrder;

const createStyles = (colors: any, screenWidth: number) =>
  ScaledSheet.create({
    wordPageStyle: {
      width: screenWidth, // Use passed screenWidth
      paddingHorizontal: "15@ms",
      justifyContent: "center",
      alignItems: "center",
    },
    wordCardStyle: {
      width: "100%", // Takes full width of the padded area in wordPageStyle
      paddingVertical: "15@ms",
      paddingHorizontal: "20@ms",
      height: "100%",
      borderRadius: "8@s",
      alignItems: "center",
      justifyContent: "center",
    },
    wordTextStyle: {
      fontSize: "18@s",
      fontWeight: "500",
      textAlign: "center",
    },
    removeWordButton: {
      position: "absolute",
      top: "8@s",
      right: "8@s",
      width: "40@s", // Made button circular
      height: "40@s",
      borderRadius: "25@s", // Half of width/height for circle
      backgroundColor: "rgba(255, 59, 48, 0.1)", // Subtle red background (adjust color/opacity as needed)
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1, // Ensure it's above other elements if needed
    },
    playAudioButton: {
      position: "absolute",
      top: "8@s",
      left: "8@s",
      width: "40@s",
      height: "40@s",
      borderRadius: "25@s",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    editWordButton: {
      position: "absolute",
      top: "8@s",
      left: "50@s", // Position next to play audio, adjust as needed
      width: "40@s",
      height: "40@s",
      borderRadius: "25@s",
      // backgroundColor: "rgba(0, 122, 255, 0.1)", // Subtle blue background
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      width: "90%",
      padding: "20@s",
      borderRadius: "10@s",
    },
    modalTitle: {
      fontSize: "18@s",
      fontWeight: "bold",
      marginBottom: "15@s",
      textAlign: "center",
    },
    textInput: {
      height: "200@vs", // Adjust height as needed
      borderWidth: 1,
      borderRadius: "8@s",
      padding: "10@s",
      fontSize: "14@s",
      marginBottom: "20@s",
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    modalButton: {
      paddingVertical: "10@vs",
      paddingHorizontal: "20@s",
      borderRadius: "8@s",
      minWidth: "100@s",
      alignItems: "center",
    },
    modalButtonText: {
      fontSize: "16@s",
      fontWeight: "bold",
    },
  });
