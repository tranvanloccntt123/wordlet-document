import CommonHeader from "@/components/CommonHeader";
import { updateGroupInfo } from "@/services/groupServices";
import { convert } from "@/services/ipa";
import useThemeStore from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters";

const WORD_TYPES = [
  { labelKey: "games.wordType.select", value: "" },
  { labelKey: "games.wordType.noun", value: "Danh từ" },
  { labelKey: "games.wordType.verb", value: "Động từ" },
  { labelKey: "games.wordType.adjective", value: "Tính từ" },
  { labelKey: "games.wordType.adverb", value: "Trạng từ" },
  { labelKey: "games.wordType.preposition", value: "Giới từ" },
  { labelKey: "games.wordType.pronoun", value: "Đại từ" },
  { labelKey: "games.wordType.conjunction", value: "Liên từ" },
  { labelKey: "games.wordType.interjection", value: "Thán từ" },
  { labelKey: "games.wordType.phrase", value: "Cụm từ" },
  { labelKey: "games.wordType.other", value: "Khác" },
];

export default function CreateWordScreen() {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    groupId: string;
    groupName?: string;
  }>();
  const { groupId, groupName } = params;

  const [word, setWord] = useState("");
  const [wordType, setWordType] = useState<string>(WORD_TYPES[0].value);
  const [content, setContent] = useState("");

  const handleSaveWord = async () => {
    if (!groupId) {
      Alert.alert(t("common.error"), t("games.errorNoGroupSelected"));
      return;
    }
    if (!word.trim()) {
      Alert.alert(t("common.error"), t("games.addWordEmptyError"));
      return;
    }

    if (!content.trim()) {
      Alert.alert(t("common.error"), t("games.addContentEmptyError"));
      return;
    }

    const spell = convert(word);

    const newWordObject: Omit<WordStore, "id"> = {
      word: word.trim(),
      //   type: wordType || undefined,
      content: `${spell != "" ? `1#[${spell}]\n` : ""}${
        wordType !== "" ? `3#${wordType}\n` : ""
      }5#${content.trim()}`,
      parsedword: word.trim().toLowerCase(),
      source: "manual",
    };

    await updateGroupInfo(parseInt(groupId || "0"), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        words: [...(oldData?.words || []), newWordObject],
      };
    });

    Alert.alert(
      t("common.success"),
      t("games.wordAddedSuccess", { word: newWordObject.word }),
      [{ text: t("common.ok"), onPress: () => router.back() }]
    );
  };

  const screenTitle = groupName
    ? t("games.createWordForGroupTitle", { groupName })
    : t("games.createWordTitle");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <CommonHeader title={screenTitle} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexGrow}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t("games.wordLabel")}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.card || colors.card,
              },
            ]}
            placeholder={t("games.wordPlaceholder")}
            placeholderTextColor={colors.textDisabled}
            value={word}
            onChangeText={setWord}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t("games.wordTypeLabel")}
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                borderColor: colors.border,
                backgroundColor: colors.card || colors.card,
              },
            ]}
          >
            <Picker
              selectedValue={wordType}
              onValueChange={(itemValue) => setWordType(itemValue as string)}
              style={[styles.picker, { color: colors.textPrimary }]}
              dropdownIconColor={colors.textSecondary}
              prompt={t("games.selectPrompt")}
            >
              {WORD_TYPES.map((type) => (
                <Picker.Item
                  key={type.value || "select-type-key"}
                  label={t(type.labelKey)}
                  value={type.value}
                  style={{ fontSize: s(16) }}
                />
              ))}
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t("games.contentLabel")}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.contentInput,
              {
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.card || colors.card,
              },
            ]}
            placeholder={t("games.contentPlaceholder")}
            placeholderTextColor={colors.textDisabled}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            numberOfLines={5}
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveWord}
          >
            <MaterialIcons name="save" size={s(20)} color={colors.card} />
            <Text style={[styles.saveButtonText, { color: colors.card }]}>
              {t("common.save")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
  },
  flexGrow: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: "15@s",
  },
  label: {
    fontSize: "14@s",
    marginBottom: "5@ms",
    marginLeft: "2@s",
  },
  textInput: {
    height: "45@ms",
    borderRadius: "8@s",
    paddingHorizontal: "10@ms",
    fontSize: "16@s",
    marginBottom: "15@ms",
  },
  contentInput: {
    height: "120@ms",
    textAlignVertical: "top",
    paddingTop: "10@ms",
  },
  pickerContainer: {
    borderRadius: "8@s",
    marginBottom: "15@ms",
    justifyContent: "center",
    height: "60@ms",
  },
  picker: {
    width: "100%",
    height: "100%",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "12@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "8@s",
    marginTop: "20@ms",
  },
  saveButtonText: {
    fontSize: "16@s",
    fontWeight: "bold",
    marginLeft: "10@s",
  },
});
