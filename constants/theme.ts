// ShareBite Design System — Theme

import { Colors } from './colors';
import { FontFamily, FontSize } from './typography';
import { Spacing, Radius, Shadow } from './spacing';

export const LightTheme = {
  colors: {
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceVariant,
    card: Colors.surface,
    text: Colors.textPrimary,
    textSecondary: Colors.textSecondary,
    textTertiary: Colors.textTertiary,
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    accent: Colors.accent,
    border: Colors.border,
    divider: Colors.divider,
    shadow: Colors.shadow,
    tabBar: Colors.background, // Match screen background for seamless tactile tab bar
    tabBarActive: Colors.primary,
    tabBarInactive: Colors.textTertiary,
    headerBg: Colors.background,
    inputBg: Colors.surface,
    inputBorder: Colors.border,
    placeholder: Colors.textTertiary,
    skeleton: '#ECE8DD',
    skeletonHighlight: '#FAF8F1',
  },
  fonts: FontFamily,
  fontSizes: FontSize,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadow,
  isDark: false,
};

export const DarkTheme = {
  colors: {
    background: Colors.backgroundDark,
    surface: Colors.surfaceDark,
    surfaceVariant: Colors.surfaceVariantDark,
    card: Colors.cardDark,
    text: Colors.textPrimaryDark,
    textSecondary: Colors.textSecondaryDark,
    textTertiary: Colors.textTertiaryDark,
    primary: Colors.primaryLight,
    primaryLight: Colors.primary,
    accent: Colors.accentLight,
    border: Colors.borderDark,
    divider: Colors.dividerDark,
    shadow: Colors.shadowDark,
    tabBar: Colors.backgroundDark,
    tabBarActive: Colors.primaryLight,
    tabBarInactive: Colors.textTertiaryDark,
    headerBg: Colors.surfaceDark,
    inputBg: Colors.surfaceVariantDark,
    inputBorder: Colors.borderDark,
    placeholder: Colors.textTertiaryDark,
    skeleton: '#383832',
    skeletonHighlight: '#44443C',
  },
  fonts: FontFamily,
  fontSizes: FontSize,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadow,
  isDark: true,
};

export type Theme = typeof LightTheme;
