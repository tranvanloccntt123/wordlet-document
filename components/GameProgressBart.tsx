import useThemeStore from "@/store/themeStore"; // Import useThemeStore
import React, { useEffect, useRef } from "react"; // Added useRef
import { Animated, View } from "react-native"; // Import Animated
import { ScaledSheet } from "react-native-size-matters";

const GameProgressBar: React.FC<{
  groupWords: Array<Omit<WordStore, "id">>;
  currentWordIndex: number;
}> = ({ groupWords, currentWordIndex }) => {
  const { colors } = useThemeStore();
  const progressAnim = useRef(new Animated.Value(0)).current; // Animated value for progress
  const progressPercentage =
    groupWords.length > 0
      ? ((currentWordIndex + 1) / groupWords.length) * 100
      : 0;

  useEffect(() => {
    // Animate progress bar fill
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: false, // width animation is not supported by native driver
    }).start();
  }, [progressPercentage, progressAnim]);

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"], // Animate between 0% and 100% width
  });
  return (
    <View style={styles.progressBarContainer}>
      <Animated.View // Use Animated.View for the fill
        style={[
          styles.progressBarFill,
          {
            width: animatedProgressWidth, // Apply animated width
            backgroundColor: colors.primary,
          },
        ]}
      />
    </View>
  );
};

export default GameProgressBar;

const styles = ScaledSheet.create({
  progressBarContainer: {
    height: "8@ms", // Or your desired height
    width: "90%", // Or your desired width
    borderRadius: "4@ms", // Rounded corners
    marginTop: "10@ms",
    marginBottom: "20@ms",
    overflow: "hidden", // Ensures the fill stays within bounds
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "4@ms", // Match container's border radius
  },
});
