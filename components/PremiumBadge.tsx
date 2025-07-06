import React from "react";
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Stop,
} from "react-native-svg";

interface PremiumBadgeProps {
  size?: number;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = 40 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="100%">
          <Stop offset="0" stopColor="#FFD700" />
          <Stop offset="1" stopColor="#FFA500" />
        </LinearGradient>
      </Defs>

      <Path d="M20 75 L80 75 L80 65 L20 65 Z" fill="url(#goldGradient)" />
      <Path
        d="M20 65 L30 40 L50 55 L70 40 L80 65 Z"
        fill="url(#goldGradient)"
      />

      <Circle cx="30" cy="40" r="4" fill="#E60026" />
      <Circle cx="50" cy="30" r="5" fill="#E60026" />
      <Circle cx="70" cy="40" r="4" fill="#E60026" />
    </Svg>
  );
};

export default PremiumBadge;
