// ShareBite — Input Component

import React, { useState, ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing } from '../../constants/spacing';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? Colors.error
    : isFocused
    ? Colors.primary          // Terracotta focus accent
    : theme.colors.border;    // Warm beige default

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textTertiary }]}>
          {label.toUpperCase()}{required && <Text style={{ color: Colors.error }}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.inputBg,
            borderColor,
            borderWidth: isFocused || error ? 1.5 : 1,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          {...props}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.placeholder}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontFamily: FontFamily.interRegular,
              paddingLeft: leftIcon ? 0 : Spacing.base,
              paddingRight: rightIcon ? 0 : Spacing.base,
            },
          ]}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    minHeight: 48,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: Spacing.sm + 2,
  },
  leftIcon: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
  },
  rightIcon: {
    paddingRight: Spacing.base,
    paddingLeft: Spacing.sm,
  },
  error: {
    color: Colors.error,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.interRegular,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.interRegular,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});
