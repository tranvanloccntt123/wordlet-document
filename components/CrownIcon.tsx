import React from 'react';
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Stop,
    Text as SvgText,
} from 'react-native-svg';

type Rank = 1 | 2 | 3;

interface CrownIconProps {
  size?: number;
  rank: Rank;
}

const rankConfig = {
  1: {
    gradientId: 'goldGradient',
    stops: [
      { offset: '0', color: '#FFD700' },
      { offset: '1', color: '#FFA500' },
    ],
    jewelColor: '#E60026',
    textColor: '#A0522D',
  },
  2: {
    gradientId: 'silverGradient',
    stops: [
      { offset: '0', color: '#E0E0E0' },
      { offset: '1', color: '#A9A9A9' },
    ],
    jewelColor: '#4169E1',
    textColor: '#4A4A4A',
  },
  3: {
    gradientId: 'bronzeGradient',
    stops: [
      { offset: '0', color: '#CD7F32' },
      { offset: '1', color: '#8B4513' },
    ],
    jewelColor: '#228B22',
    textColor: '#5D2906',
  },
};

const CrownIcon: React.FC<CrownIconProps> = ({ size = 40, rank }) => {
  const { gradientId, stops, jewelColor, textColor } = rankConfig[rank];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="100%">
          <Stop offset={stops[0].offset} stopColor={stops[0].color} />
          <Stop offset={stops[1].offset} stopColor={stops[1].color} />
        </LinearGradient>
      </Defs>

      {/* Crown Base */}
      <Path d="M20 75 L80 75 L80 65 L20 65 Z" fill={`url(#${gradientId})`} />

      {/* Crown Points */}
      <Path d="M20 65 L30 40 L50 55 L70 40 L80 65 Z" fill={`url(#${gradientId})`} />

      {/* Jewels: Rank 1 gets all three, Rank 2 gets center, Rank 3 gets one */}
      {rank <= 3 && <Circle cx="50" cy="30" r="5" fill={jewelColor} />}
      {rank === 1 && <Circle cx="30" cy="40" r="4" fill={jewelColor} />}
      {rank === 1 && <Circle cx="70" cy="40" r="4" fill={jewelColor} />}

      {/* Rank Number */}
      <SvgText x="50" y="72" textAnchor="middle" fontSize="18" fontWeight="bold" fill={textColor} dy="2">
        {rank}
      </SvgText>
    </Svg>
  );
};

export default CrownIcon;

