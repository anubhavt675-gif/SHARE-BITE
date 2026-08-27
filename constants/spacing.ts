// ShareBite Design System — Spacing, Radius & Shadow Tokens

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};

export const Radius = {
  xs: 6,     // small — filter chips, badges
  sm: 10,    // medium — cards, inputs (increased slightly for premium feel)
  md: 14,    // medium-large — food cards
  lg: 18,    // large — sheets
  xl: 24,    // extra large — modals
  '2xl': 32,
  '3xl': 48,
  full: 999,
};

// Shadows — warm neutral charcoal, very subtle (editorial feel)
export const Shadow = {
  sm: {
    shadowColor: 'rgba(41, 39, 34, 1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: 'rgba(41, 39, 34, 1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: 'rgba(41, 39, 34, 1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
};
