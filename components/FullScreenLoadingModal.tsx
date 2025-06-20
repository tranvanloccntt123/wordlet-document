import useThemeStore from "@/store/themeStore";
import React from "react";
import { Modal, View } from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";
import Rive from "rive-react-native";

interface FullScreenLoadingModalProps {
  visible: boolean;
  animationType?: "none" | "slide" | "fade";
  riveResourceName?: string;
}

const FullScreenLoadingModal: React.FC<FullScreenLoadingModalProps> = ({
  visible,
  animationType = "fade",
  riveResourceName = "finding", // Default Rive animation
}) => {
  const { colors } = useThemeStore(); // If you need theme colors for the modal background

  return (
    <Modal
      transparent={true}
      animationType={animationType}
      visible={visible}
      onRequestClose={() => {
        // Optional: handle back button press during loading
      }}
    >
      <View style={[styles.loadingContainer]}>
        <Rive
          resourceName={riveResourceName}
          autoplay={true}
          style={{
            width: s(300),
            height: s(300),
          }}
        />
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
});

export default FullScreenLoadingModal;
