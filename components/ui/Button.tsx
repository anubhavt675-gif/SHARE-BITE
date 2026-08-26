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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import { FontFamily, FontSize } from '../../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
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
  sm: { paddingV: 8, paddingH: 16, fontSize: FontSize.sm, height: 36 },
  md: { paddingV: 12, paddingH: 20, fontSize: FontSize.base, height: 44 },
  lg: { paddingV: 15, paddingH: 24, fontSize: FontSize.lg, height: 52 },
  xl: { paddingV: 18, paddingH: 28, fontSize: FontSize.xl, height: 60 },
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

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.btn,
          {
            backgroundColor: isDisabled ? '#D4CFC5' : Colors.primary,
            borderColor: Colors.textPrimary,
            borderWidth: 1,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingH,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
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

  if (variant === 'accent') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.btn,
          {
            backgroundColor: isDisabled ? '#D4CFC5' : Colors.accent,
            borderColor: Colors.textPrimary,
            borderWidth: 1,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingH,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
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

  const variantStyles: Record<string, ViewStyle> = {
    secondary: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.2,
      borderColor: theme.colors.primary,
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
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: Colors.error,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        variantStyles[variant],
        { height: sizeConfig.height, paddingHorizontal: sizeConfig.paddingH },
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
    borderRadius: Radius.sm,
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
    color: '#FAF8F1',
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.3,
  },
  textBase: {
    fontFamily: FontFamily.outfitSemiBold,
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
