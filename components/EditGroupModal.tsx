import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert, // Import Dimensions
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { s, ScaledSheet } from "react-native-size-matters";

interface EditGroupModalProps {
  onClose: () => void;
  group: Group | null;
  onSave: (groupId: number, newName: string) => void;
  colors: any; // Type for theme colors, consider defining a more specific type
}

const Content: React.FC<{
  onClose: () => any;
  group: Group;
  onSave: (groupId: number, newName: string) => void;
  colors: any; // Type for theme colors, consider defining a more specific type
}> = ({ onClose, onSave, group, colors }) => {
  const [name, setName] = useState(group?.name || "");
  const { t } = useTranslation(); // Initialize useTranslation

  const inputRef = React.useRef<TextInput>(null);

  const triggerAnimatedClose = () => {
    inputRef.current?.blur();
    Keyboard.dismiss(); // Dismiss keyboard first
    onClose();
  };

  const handleConfirmSave = () => {
    inputRef.current?.blur();
    Keyboard.dismiss(); // Dismiss keyboard first
    if (name.trim()) {
      onSave(group.id, name.trim());
      triggerAnimatedClose();
    } else {
      Alert.alert(
        t("common.invalidNameTitle"),
        t("common.groupNameEmptyError")
      );
    }
  };

  return (
    <Animated.View
      style={[styles.modalContent, { backgroundColor: colors.card }]}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View>
          <Text
            style={[styles.modalTitle, { color: colors.textPrimary }]} // Ensure title is prominent
          >
            {t("groups.editGroupTitle")}
          </Text>
          <BottomSheetTextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder={t("groups.editGroupPlaceholder")}
            placeholderTextColor={colors.textDisabled}
            autoFocus
          />
          <View style={[styles.modalActions]}>
            <TouchableOpacity
              style={[
                styles.modalButton, // General button style
                styles.cancelButton, // Specific cancel button style
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  marginRight: s(5),
                }, // Themed cancel button
              ]}
              onPress={triggerAnimatedClose} // Corrected to use animated close
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
                styles.modalButton, // General button style
                styles.saveButton, // Specific save button style
                { backgroundColor: colors.primary, marginLeft: s(5) }, // Themed save button
              ]}
              onPress={handleConfirmSave}
            >
              <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
                {t("common.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  onClose,
  group,
  onSave,
  colors,
}) => {
  // Initialize slideAnim to start off-screen (at the bottom)

  if (!group) return null;

  return (
    <Content onClose={onClose} group={group} onSave={onSave} colors={colors} />
  );
};

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    paddingVertical: "16@s",
    // backgroundColor is applied dynamically by the component
  },
  modalTitle: {
    fontSize: "15@s",
    fontWeight: "bold",
    marginBottom: "15@ms",
    textAlign: "left",
  },
  textInput: {
    height: "45@ms",
    borderWidth: 1,
    borderRadius: "8@s",
    paddingHorizontal: "10@ms",
    fontSize: "16@s",
    marginBottom: "20@ms",
    // color, borderColor, backgroundColor applied dynamically by the component
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between", // Use space-between for better alignment if buttons have different widths
    marginTop: "10@ms", // Add some space above the buttons
  },
  modalButton: {
    paddingVertical: "10@ms",
    paddingHorizontal: "15@ms", // Adjusted padding
    borderRadius: "8@s",
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Allow buttons to share space
    minHeight: "45@ms", // Ensure buttons have a good tap height
  },
  cancelButton: {
    // backgroundColor and borderColor set dynamically
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: "16@s",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EditGroupModal;
