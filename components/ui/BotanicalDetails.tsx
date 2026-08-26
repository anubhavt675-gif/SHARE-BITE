import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface BotanicalProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function BotanicalSprig({ size = 32, color = Colors.accent, style }: BotanicalProps) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Organic hand-drawn look stem */}
        <Path
          d="M 50 90 C 48 70, 48 50, 50 15"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Leaf 1 */}
        <Path
          d="M 50 75 C 35 70, 20 60, 25 50 C 30 40, 45 60, 50 70"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Leaf 2 */}
        <Path
          d="M 50 60 C 65 55, 80 45, 75 35 C 70 25, 55 45, 50 55"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Leaf 3 */}
        <Path
          d="M 50 45 C 32 40, 18 30, 22 20 C 26 10, 42 30, 50 40"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Leaf 4 */}
        <Path
          d="M 50 30 C 68 25, 82 15, 78 5 C 74 -5, 58 15, 50 25"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function HandDrawnSeparator({ color = Colors.border, style }: { color?: string; style?: ViewStyle }) {
  return (
    <View style={[{ height: 12, justifyContent: 'center', marginVertical: 12 }, style]}>
      <Svg width="100%" height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
        {/* Slightly wiggly line to simulate hand-drawn imperfection */}
        <Path
          d="M 0 3 Q 75 1.5, 150 3 T 300 3"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function WaxSeal({ size = 48, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Melting wax outer shape - irregular and warm */}
        <Path
          d="M 50 5 C 75 2, 98 15, 95 48 C 92 80, 78 96, 48 94 C 18 92, 4 72, 6 45 C 8 18, 25 8, 50 5 Z"
          fill="#B96F52"
          opacity="0.95"
        />
        {/* Irregular inner ridge */}
        <Path
          d="M 50 12 C 70 10, 88 20, 86 48 C 84 75, 72 88, 48 86 C 24 84, 12 68, 14 45 C 16 22, 30 14, 50 12 Z"
          fill="none"
          stroke="#9C5B41"
          strokeWidth="3.5"
        />
        {/* Branch inside */}
        <G transform="translate(18, 18) scale(0.65)">
          <Path
            d="M 50 85 C 49 70, 49 50, 50 15"
            stroke="#FAF8F1"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d="M 50 70 C 35 65, 22 55, 27 48 C 32 41, 45 58, 50 65"
            fill="none"
            stroke="#FAF8F1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 50 55 C 65 50, 78 40, 73 33 C 68 26, 55 43, 50 50"
            fill="none"
            stroke="#FAF8F1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M 50 40 C 35 35, 22 25, 27 18 C 32 11, 45 28, 50 35"
            fill="none"
            stroke="#FAF8F1"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
}

export function HandDrawnPin({ size = 24, color = Colors.primary, style }: BotanicalProps) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M 50 90 C 25 65, 20 45, 25 30 C 35 15, 65 15, 75 30 C 80 45, 75 65, 50 90 Z"
          fill={color}
          stroke={Colors.textPrimary}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <Circle cx="50" cy="40" r="12" fill={Colors.background} stroke={Colors.textPrimary} strokeWidth="3" />
      </Svg>
    </View>
  );
}

export function SmallHeartIllustration({ size = 32, color = Colors.primary, style }: BotanicalProps) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Path
          d="M 50 85 C 20 60, 5 35, 20 15 C 35 -5, 50 15, 50 15 C 50 15, 65 -5, 80 15 C 95 35, 80 60, 50 85 Z"
          fill={color}
          stroke={Colors.textPrimary}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
