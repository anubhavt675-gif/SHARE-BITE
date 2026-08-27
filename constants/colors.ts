// ShareBite Design System — Color Tokens
// Reference: Premium editorial food-rescue community platform

export const Colors = {
  // ── Brand / Accent ────────────────────────────────────────────────
  primary: '#A9614D',         // Terracotta / Burnt Clay — primary accent
  primaryLight: '#BB7A68',    // Lighter terracotta
  primaryDark: '#8C4E3D',     // Deeper terracotta

  accent: '#68734D',          // Muted Olive — secondary accent
  accentLight: '#7E8961',     // Lighter olive
  accentDark: '#52593B',      // Deeper olive

  yellow: '#C4974A',          // Muted warm amber (subtle, not bright)
  yellowLight: '#D4AF77',

  // ── Neutral Backgrounds ───────────────────────────────────────────
  background: '#F4F0E5',      // Warm Ivory — primary background
  surface: '#FBF9F3',         // Soft Off-White — cards / elevated containers
  surfaceVariant: '#ECE8DC',  // Subtle beige — secondary surfaces

  // ── Dark Mode Backgrounds ─────────────────────────────────────────
  backgroundDark: '#24231F',
  surfaceDark: '#302E29',
  surfaceVariantDark: '#3D3A33',
  cardDark: '#302E29',

  // ── Text ─────────────────────────────────────────────────────────
  textPrimary: '#292722',     // Deep Charcoal — NOT pure black
  textSecondary: '#6F6A61',   // Warm Gray
  textTertiary: '#9C9689',    // Muted warm gray
  textInverse: '#FBF9F3',     // Ivory — text on dark/colored surfaces

  textPrimaryDark: '#F4F0E5',
  textSecondaryDark: '#B8B0A1',
  textTertiaryDark: '#7A7368',

  // ── Status Colors ────────────────────────────────────────────────
  success: '#68734D',         // Olive — positive / completed
  warning: '#C4974A',         // Amber — warning
  error: '#A65343',           // Muted Rust — warnings/urgent (NOT bright red)
  errorLight: '#F0E6E3',
  info: '#556B7A',            // Slate — informational

  // ── Donation Status ───────────────────────────────────────────────
  statusAvailable: '#68734D',     // Olive
  statusClaimed: '#556B7A',       // Slate
  statusPickup: '#A9614D',        // Terracotta
  statusCompleted: '#6F6A61',     // Warm gray
  statusExpired: '#A65343',       // Rust
  statusUrgent: '#A65343',        // Rust
  statusFresh: '#68734D',         // Olive
  statusSoon: '#A9614D',          // Terracotta

  // ── UI Elements ───────────────────────────────────────────────────
  border: '#D8D1C2',          // Warm Beige — subtle, elegant borders
  borderDark: '#3D3A33',
  divider: '#E4DDD0',         // Thin warm divider
  dividerDark: '#38352E',

  // Shadows — warm neutral, very subtle
  shadow: 'rgba(41, 39, 34, 0.06)',
  shadowMedium: 'rgba(41, 39, 34, 0.10)',
  shadowDark: 'rgba(0, 0, 0, 0.22)',
  overlay: 'rgba(41, 39, 34, 0.42)',

  // ── Gradient Arrays (for LinearGradient) ─────────────────────────
  gradientPrimary: ['#A9614D', '#BB7A68'] as const,
  gradientAccent: ['#68734D', '#7E8961'] as const,
  gradientHero: ['#FBF9F3', '#F4F0E5'] as const,     // Editorial neutral hero
  gradientCard: ['#FBF9F3', '#FBF9F3'] as const,
  gradientDark: ['#24231F', '#302E29'] as const,

  // ── Transparent Tints ─────────────────────────────────────────────
  transparent: 'transparent',
  primaryAlpha08: 'rgba(169, 97, 77, 0.08)',
  primaryAlpha12: 'rgba(169, 97, 77, 0.12)',
  primaryAlpha20: 'rgba(169, 97, 77, 0.20)',
  // Keep legacy aliases for backward-compat
  primaryAlpha10: 'rgba(169, 97, 77, 0.10)',
  accentAlpha10: 'rgba(104, 115, 77, 0.10)',
  accentAlpha20: 'rgba(104, 115, 77, 0.20)',
  yellowAlpha20: 'rgba(196, 151, 74, 0.20)',

  // ── Cream / Off-White aliases ─────────────────────────────────────
  cream: '#FBF9F3',
};

export type ColorKey = keyof typeof Colors;
