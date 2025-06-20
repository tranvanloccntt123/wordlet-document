import useThemeStore from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoCloseDelay?: number; // Optional delay in ms before auto-closing
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onClose,
  autoCloseDelay = 2000, // Default to 2 seconds
}) => {
  const { colors } = useThemeStore();
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade animation

  useEffect(() => {
    let timer: any;
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set auto-close timer
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
    } else {
      // Fade out (handled by handleClose)
    }

    return () => clearTimeout(timer); // Clean up timer
  }, [visible, fadeAnim, autoCloseDelay]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onClose(); // Call parent's onClose after fade out
    });
  };

  return (
    <Modal transparent={true} animationType="none" visible={visible}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={[styles.container, { backgroundColor: colors.card }]}>
            <MaterialIcons
              name="check-circle"
              size={s(40)}
              color={colors.success}
            />
            <Text style={[styles.messageText, { color: colors.textPrimary }]}>
              {message}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent background
  },
  container: {
    padding: "20@s",
    borderRadius: "10@s",
    alignItems: "center",
    maxWidth: "80%", // Limit width
  },
  messageText: {
    marginTop: "10@s",
    fontSize: "16@s",
    textAlign: "center",
  },
});

export default SuccessModal;
