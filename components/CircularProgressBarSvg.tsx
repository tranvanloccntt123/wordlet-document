import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressBarSvgProps {
  progress: number; // 0-100
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}
const CircularProgressBarSvg: React.FC<CircularProgressBarSvgProps> = ({
  progress,
  size,
  strokeWidth,
  color,
  backgroundColor = "#e6e6e6", // Default background color
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Ensure progress is between 0 and 100 for sweepAngle calculation
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityLabel={`Progress: ${normalizedProgress.toFixed(0)}%`}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
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
            transform={`rotate(-90 ${center} ${center})`} // Start at 12 o'clock
          />
        )}
      </Svg>
    </View>
  );
};

export default CircularProgressBarSvg;
