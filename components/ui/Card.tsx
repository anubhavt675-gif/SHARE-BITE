// ShareBite — Card Component

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'flat' | 'outlined';
  padding?: number;
  radius?: number;
}

export function Card({ children, style, onPress, variant = 'elevated', padding, radius }: CardProps) {
  const { theme, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: radius ?? Radius.sm,
    padding: padding ?? Spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(variant === 'elevated' && (isDark ? Shadow.dark : Shadow.sm)),
    ...(variant === 'flat' && { borderWidth: 0, shadowOpacity: 0, elevation: 0 }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[cardStyle, style]}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
