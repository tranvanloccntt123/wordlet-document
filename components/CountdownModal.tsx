import useThemeStore from "@/store/themeStore";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Text, View } from "react-native";
import { ScaledSheet, s } from "react-native-size-matters";
import Svg, { Circle } from "react-native-svg";

/**
 * Reusable Circular Progress Bar SVG component.
 * Displays a circular progress bar based on a given percentage.
 */
interface CircularProgressBarSvgProps {
  progress: number; // Current progress (0-100)
  size: number; // Diameter of the circle
  strokeWidth: number; // Thickness of the progress bar stroke
  color: string; // Color of the progress fill
  backgroundColor?: string; // Color of the background track
}

const CircularProgressBarSvg: React.FC<CircularProgressBarSvgProps> = ({
  progress,
  size,
  strokeWidth,
  color,
  backgroundColor = "#e6e6e6", // Default background color if not provided
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Normalize progress to be between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  // Calculate the strokeDashoffset to represent the filled portion.
  // For a countdown, as `progress` goes from 100 to 0, the bar should empty.
  // So, when progress is 100 (full), offset is 0. When progress is 0 (empty), offset is circumference.
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
        {/* Progress fill */}
        {normalizedProgress > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`} // Start the stroke from the top (12 o'clock)
          />
        )}
      </Svg>
    </View>
  );
};

/**
 * A modal component that displays a countdown timer with a circular progress bar.
 */
interface CountdownModalProps {
  visible: boolean; // Controls the visibility of the modal
  seconds: number; // The initial number of seconds to count down from
  maxSeconds: number;
  onFinish: () => void; // Callback function executed when the countdown finishes
  onClose: () => void; // Callback function for when the modal is requested to close (e.g., Android back button)
}

const CountdownModal: React.FC<CountdownModalProps> = ({
  visible,
  seconds,
  onFinish,
  onClose,
  maxSeconds,
}) => {
  const { colors } = useThemeStore();
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setRemainingSeconds(seconds); // Reset countdown when modal becomes visible
      // Clear any existing interval to prevent multiple timers running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Start a new interval
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!); // Stop the interval when countdown reaches 0
            onFinish(); // Trigger the onFinish callback
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // If modal becomes invisible, clear any running interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // Cleanup function: clear the interval when the component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visible, seconds, onFinish]); // Re-run effect if these props change

  // Calculate progress for the circular bar (from 100% down to 0%)
  const progress = (remainingSeconds / maxSeconds) * 100;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose} // Allows closing via Android back button
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <CircularProgressBarSvg
            progress={progress}
            size={s(150)} // Size of the entire circle container
            strokeWidth={s(15)} // Thickness of the progress bar
            color={colors.primary} // Color of the progress bar fill
            backgroundColor={colors.border} // Background color of the circle track
          />
          <Text style={[styles.countdownText, { color: colors.textPrimary }]}>
            {remainingSeconds}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent black overlay
  },
  modalContent: {
    width: "180@s", // Width of the modal container (circular shape)
    height: "180@s", // Height of the modal container (circular shape)
    borderRadius: "90@s", // Half of width/height to make it a perfect circle
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
    position: "relative", // Needed for absolute positioning of countdownText
  },
  countdownText: {
    position: "absolute", // Position text over the circular progress bar
    fontSize: "48@s", // Large font size for the countdown number
    fontWeight: "bold",
    // Color is set inline using theme colors
  },
});

export default CountdownModal;
