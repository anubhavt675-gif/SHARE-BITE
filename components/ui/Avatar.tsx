// ShareBite — Avatar Component

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FontFamily } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  showVerified?: boolean;
}

export function Avatar({ name, imageUrl, size = 44, showVerified = false }: AvatarProps) {
  const { theme } = useTheme();
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={{ width: size, height: size }}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: Colors.primaryAlpha20,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: size * 0.35, color: Colors.primary },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}
      {showVerified && (
        <View style={[styles.badge, { borderColor: theme.colors.background }]}>
          <Text style={{ fontSize: 8 }}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.outfitBold,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
