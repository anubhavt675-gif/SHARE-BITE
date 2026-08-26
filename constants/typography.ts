import { Platform } from 'react-native';

export const FontFamily = {
  // Serif display for magazine-style typography
  serifDisplay: Platform.OS === 'ios' ? 'Georgia' : 'serif',

  // Outfit — primary brand font
  outfitBlack: 'Outfit_900Black',
  outfitBold: 'Outfit_700Bold',
  outfitSemiBold: 'Outfit_600SemiBold',
  outfitMedium: 'Outfit_500Medium',
  outfitRegular: 'Outfit_400Regular',
  outfitLight: 'Outfit_300Light',
  // Inter — body text
  interBold: 'Inter_700Bold',
  interSemiBold: 'Inter_600SemiBold',
  interMedium: 'Inter_500Medium',
  interRegular: 'Inter_400Regular',
};

export const FontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 40,
  hero: 48,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};
