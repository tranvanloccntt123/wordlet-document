import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert, // Import Dimensions
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { ScaledSheet } from "react-native-size-matters";

interface EditGroupModalProps {
  visible: boolean;
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
  // Initialize slideAnim to start off-screen (at the bottom)
  const slideAnim = useSharedValue(0);

  React.useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidShow", (e) => {
      slideAnim.value = withTiming(e.endCoordinates.height, { duration: 200 });
    });
    return () => subscribe.remove();
  }, []);

  React.useEffect(() => {
    const subscribe = Keyboard.addListener("keyboardDidHide", (e) => {
      slideAnim.value = e.endCoordinates.height;
    });
    return () => subscribe.remove();
  }, []);

  const triggerAnimatedClose = () => {
    Keyboard.dismiss(); // Dismiss keyboard first
    onClose();
    // slideAnim.value = withTiming(
    //   screenHeight,
    //   { duration: 300 },
    //   (finished) => {
    //     if (finished) {
    //       runOnJS(onClose)();
    //     }
    //   }
    // );
    // Animate slide out (from on-screen to bottom)
    // Animated.timing(slideAnim, {
    //   toValue: screenHeight,
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start(() => {
    //   onClose(); // Call the parent's onClose AFTER the animation completes
    // });
  };

  const handleConfirmSave = () => {
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

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -slideAnim.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.modalContent,
        { backgroundColor: colors.card },
        contentStyle,
      ]}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View>
          <Text
            style={[styles.modalTitle, { color: colors.textPrimary }]} // Ensure title is prominent
          >
            {t("groups.editGroupTitle")}
          </Text>
          <TextInput
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
                { backgroundColor: colors.primary }, // Themed save button
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
  visible,
  onClose,
  group,
  onSave,
  colors,
}) => {
  // Initialize slideAnim to start off-screen (at the bottom)

  if (!group) return null;

  const triggerAnimatedClose = () => {
    Keyboard.dismiss(); // Dismiss keyboard first
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={triggerAnimatedClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={triggerAnimatedClose}>
        <View style={styles.modalOverlay}>
          {/* Animated.View will now be the sliding content container */}
          <Content
            onClose={onClose}
            group={group}
            onSave={onSave}
            colors={colors}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    paddingHorizontal: "20@ms",
    paddingTop: "20@ms",
    paddingBottom: "30@ms", // More space at the bottom for buttons
    borderTopLeftRadius: "20@s",
    borderTopRightRadius: "20@s",
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor is applied dynamically by the component
  },
  modalTitle: {
    fontSize: "18@s",
    fontWeight: "bold",
    marginBottom: "15@ms",
    textAlign: "center",
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
    marginHorizontal: "5@ms", // Add small margin between buttons
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
