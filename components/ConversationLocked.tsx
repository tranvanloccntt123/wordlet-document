import Fontisto from "@expo/vector-icons/Fontisto";
import React from "react";
import { View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

const ConversationLocked = () => {
  return (
    <View style={styles.container}>
      <Fontisto name="locked" size={24} color="white" />
    </View>
  );
};

export default ConversationLocked;

const styles = ScaledSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "8@s",
    justifyContent: "center",
    alignItems: "center",
  },
});
