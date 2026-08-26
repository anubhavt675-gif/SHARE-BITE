// ShareBite — Card Component

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'flat' | 'outlined';
  padding?: number;
}

export function Card({ children, style, onPress, variant = 'elevated', padding }: CardProps) {
  const { theme, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: Radius.sm, // slightly rounded for premium editorial look
    padding: padding ?? Spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(variant === 'elevated' && (isDark ? Shadow.dark : Shadow.sm)),
    ...(variant === 'flat' && { borderWidth: 0 }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[cardStyle, style]}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
