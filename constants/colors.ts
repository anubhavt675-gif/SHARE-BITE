// ShareBite Design System — Color Tokens

export const Colors = {
  // Brand Colors
  primary: '#B96F52',       // Terracotta
  primaryLight: '#C6866C',  // Light Terracotta
  primaryDark: '#9C5B41',   // Deep Terracotta
  accent: '#626A3A',        // Olive Green
  accentLight: '#79824F',   // Light Olive
  accentDark: '#4C522B',    // Deep Olive
  yellow: '#D5A467',        // Muted Warm Yellow
  yellowLight: '#E2BD8A',   // Light Warm Yellow

  // Neutral Backgrounds (Tactile Light Mode)
  background: '#F4F0E6',    // Warm Cream Paper
  surface: '#FAF8F1',       // Warm Ivory
  surfaceVariant: '#ECE8DD',// Muted Tactile Beige
  cream: '#FAF8F1',

  // Neutral Backgrounds (tactile Dark Mode)
  backgroundDark: '#1C1C1A',
  surfaceDark: '#292925',
  surfaceVariantDark: '#383832',
  cardDark: '#292925',

  // Text
  textPrimary: '#292925',    // Charcoal
  textSecondary: '#54544D',  // Muted Charcoal
  textTertiary: '#8A8A80',   // Warm Muted Gray
  textInverse: '#FAF8F1',    // Warm Ivory
  textPrimaryDark: '#F4F0E6',
  textSecondaryDark: '#D8D0BE',
  textTertiaryDark: '#8A8A80',

  // Status Colors
  success: '#626A3A',       // Olive Green
  warning: '#D5A467',       // Muted Yellow
  error: '#A24836',         // Rust/Deep Terracotta Red
  errorLight: '#F3E5E2',
  info: '#4F6379',          // Slate Gray

  // Donation Status Colors
  statusAvailable: '#626A3A',
  statusClaimed: '#4F6379',
  statusPickup: '#B96F52',
  statusCompleted: '#54544D',
  statusExpired: '#A24836',
  statusUrgent: '#A24836',
  statusFresh: '#626A3A',
  statusSoon: '#B96F52',

  // UI Elements
  border: '#D8D0BE',        // Muted Beige Border
  borderDark: '#3D3D37',
  divider: '#E4DFD3',       // Thin organic rule color
  dividerDark: '#33332E',
  shadow: 'rgba(41, 41, 37, 0.04)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  overlay: 'rgba(41, 41, 37, 0.4)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#B96F52', '#C6866C'] as const,
  gradientAccent: ['#626A3A', '#79824F'] as const,
  gradientHero: ['#FAF8F1', '#F4F0E6'] as const, // Neutral editorial hero
  gradientCard: ['#FAF8F1', '#FAF8F1'] as const,
  gradientDark: ['#1C1C1A', '#292925'] as const,

  // Transparent
  transparent: 'transparent',
  primaryAlpha10: 'rgba(185, 111, 82, 0.10)',
  primaryAlpha20: 'rgba(185, 111, 82, 0.20)',
  accentAlpha10: 'rgba(98, 106, 58, 0.10)',
  accentAlpha20: 'rgba(98, 106, 58, 0.20)',
  yellowAlpha20: 'rgba(213, 164, 103, 0.20)',
};

export type ColorKey = keyof typeof Colors;

