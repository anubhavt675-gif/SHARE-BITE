// ShareBite — Button Component

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontFamily, FontSize } from '../../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'tertiary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const sizes: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; height: number }> = {
  sm: { paddingV: 7,  paddingH: 14, fontSize: FontSize.xs,   height: 34 },
  md: { paddingV: 10, paddingH: 18, fontSize: FontSize.sm,   height: 42 },
  lg: { paddingV: 13, paddingH: 22, fontSize: FontSize.base, height: 50 },
  xl: { paddingV: 16, paddingH: 26, fontSize: FontSize.lg,   height: 56 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const sizeConfig = sizes[size];

  const handlePress = async () => {
    if (disabled || isLoading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || isLoading;

  // ── Primary (Terracotta fill) ─────────────────────────────────────
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.btn,
          {
            backgroundColor: isDisabled ? Colors.surfaceVariant : Colors.primary,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingH,
            borderRadius: Radius.sm,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.textPrimary, { fontSize: sizeConfig.fontSize }, textStyle]}>
              {label}
            </Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ── Accent (Olive fill) ───────────────────────────────────────────
  if (variant === 'accent') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.btn,
          {
            backgroundColor: isDisabled ? Colors.surfaceVariant : Colors.accent,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingH,
            borderRadius: Radius.sm,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.textPrimary, { fontSize: sizeConfig.fontSize }, textStyle]}>
              {label}
            </Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ── Tertiary (text-only with terracotta accent) ───────────────────
  if (variant === 'tertiary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[styles.btn, { height: sizeConfig.height, paddingHorizontal: 4 }, style]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.textTertiary, { fontSize: sizeConfig.fontSize }, textStyle]}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      </TouchableOpacity>
    );
  }

  // ── Variant styles for remaining types ────────────────────────────
  const variantStyles: Record<string, ViewStyle> = {
    secondary: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.2,
      borderColor: Colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    danger: {
      backgroundColor: Colors.errorLight,
      borderWidth: 1,
      borderColor: Colors.error,
    },
  };

  const variantTextColors: Record<string, string> = {
    secondary: theme.colors.text,
    outline: Colors.primary,
    ghost: Colors.primary,
    danger: Colors.error,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.btn,
        variantStyles[variant],
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingH,
          borderRadius: Radius.sm,
        },
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.textBase,
              { fontSize: sizeConfig.fontSize, color: variantTextColors[variant] },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPrimary: {
    color: Colors.textInverse,
    fontFamily: FontFamily.outfitSemiBold,
    letterSpacing: 0.2,
  },
  textBase: {
    fontFamily: FontFamily.outfitSemiBold,
    letterSpacing: 0.2,
  },
  textTertiary: {
    fontFamily: FontFamily.outfitSemiBold,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.48,
  },
});
