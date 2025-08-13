import useThemeStore from "@/store/themeStore";
import useWordLearningStore from "@/store/wordLearningStore";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

const RememberScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const { data, deleteData, fetchData } = useWordLearningStore(
    (state) => state
  );

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.container}></SafeAreaView>
    </View>
  );
};

export default RememberScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
});
