import React from "react";
import { Modal, View } from "react-native";
import { scale, ScaledSheet } from "react-native-size-matters";
import Rive from "rive-react-native";
import StatusBar from "./StatusBar";

const LoadingModal: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <Modal
      transparent={true}
      statusBarTranslucent
      animationType="fade"
      visible={isVisible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContainer, { backgroundColor: "white" }]}>
          <Rive
            resourceName="untitled" // weather_app.riv
            autoplay={true}
            style={{ width: scale(150), height: scale(150) }}
          />
        </View>
      </View>
    </Modal>
  );
};

const AppLoading: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
}> = ({ isLoading, children }) => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      {children}
      <LoadingModal isVisible={isLoading} />
    </View>
  );
};

export default AppLoading;

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "180@s",
    height: "180@s",
    justifyContent: "center",
    borderRadius: "18@s",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  dbListContainer: {
    width: "100%",
    marginBottom: 15,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  dbListItem: {
    fontSize: 14,
    textAlign: "center",
  },
});
