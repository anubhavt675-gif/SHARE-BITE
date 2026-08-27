// ShareBite Design System — Theme

import { Colors } from './colors';
import { FontFamily, FontSize } from './typography';
import { Spacing, Radius, Shadow } from './spacing';

export const LightTheme = {
  colors: {
    background: Colors.background,       // #F4F0E5 — warm ivory
    surface: Colors.surface,             // #FBF9F3 — soft off-white
    surfaceVariant: Colors.surfaceVariant,
    card: Colors.surface,
    text: Colors.textPrimary,            // #292722 — deep charcoal
    textSecondary: Colors.textSecondary, // #6F6A61 — warm gray
    textTertiary: Colors.textTertiary,   // #9C9689 — muted warm gray
    primary: Colors.primary,             // #A9614D — terracotta
    primaryLight: Colors.primaryLight,
    accent: Colors.accent,               // #68734D — muted olive
    border: Colors.border,               // #D8D1C2 — warm beige
    divider: Colors.divider,
    shadow: Colors.shadow,
    tabBar: Colors.background,           // Seamless — same as background
    tabBarActive: Colors.primary,        // Terracotta
    tabBarInactive: Colors.textTertiary, // Warm muted gray
    headerBg: Colors.background,
    inputBg: Colors.surface,
    inputBorder: Colors.border,
    inputFocus: Colors.primary,          // Terracotta focus ring
    placeholder: Colors.textTertiary,
    skeleton: '#E8E2D6',                 // Warm skeleton
    skeletonHighlight: '#F4F0E5',
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
    background: Colors.backgroundDark,       // #24231F
    surface: Colors.surfaceDark,             // #302E29
    surfaceVariant: Colors.surfaceVariantDark,
    card: Colors.cardDark,
    text: Colors.textPrimaryDark,            // #F4F0E5
    textSecondary: Colors.textSecondaryDark, // #B8B0A1
    textTertiary: Colors.textTertiaryDark,   // #7A7368
    primary: Colors.primaryLight,            // Lighter terracotta for dark bg
    primaryLight: Colors.primary,
    accent: Colors.accentLight,
    border: Colors.borderDark,
    divider: Colors.dividerDark,
    shadow: Colors.shadowDark,
    tabBar: Colors.backgroundDark,
    tabBarActive: Colors.primaryLight,       // #BB7A68 on dark
    tabBarInactive: Colors.textTertiaryDark,
    headerBg: Colors.surfaceDark,
    inputBg: Colors.surfaceVariantDark,
    inputBorder: Colors.borderDark,
    inputFocus: Colors.primaryLight,
    placeholder: Colors.textTertiaryDark,
    skeleton: '#3A3731',
    skeletonHighlight: '#45413A',
  },
  fonts: FontFamily,
  fontSizes: FontSize,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadow,
  isDark: true,
};

export type Theme = typeof LightTheme;
