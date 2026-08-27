// ShareBite — StatusChip Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

interface StatusChipProps {
  status: string;
  label?: string;
  color?: string;
  size?: 'sm' | 'md';
}

// Subtle pill colors: very light background tint + matching dot + text
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  AVAILABLE:         { bg: 'rgba(104, 115, 77, 0.10)',  text: '#52593B',  dot: '#68734D' },
  CLAIMED:           { bg: 'rgba(85, 107, 122, 0.10)',   text: '#45596A',  dot: '#556B7A' },
  PICKUP_CONFIRMED:  { bg: 'rgba(169, 97, 77, 0.10)',   text: '#8C4E3D',  dot: '#A9614D' },
  PICKED_UP:         { bg: 'rgba(169, 97, 77, 0.10)',   text: '#8C4E3D',  dot: '#A9614D' },
  COMPLETED:         { bg: 'rgba(111, 106, 97, 0.10)',  text: '#5A5650',  dot: '#6F6A61' },
  CANCELLED:         { bg: 'rgba(166, 83, 67, 0.10)',   text: '#8C4435',  dot: '#A65343' },
  EXPIRED:           { bg: 'rgba(166, 83, 67, 0.10)',   text: '#8C4435',  dot: '#A65343' },
  FRESH:             { bg: 'rgba(104, 115, 77, 0.10)',  text: '#52593B',  dot: '#68734D' },
  PICKUP_SOON:       { bg: 'rgba(169, 97, 77, 0.10)',   text: '#8C4E3D',  dot: '#A9614D' },
  URGENT:            { bg: 'rgba(166, 83, 67, 0.12)',   text: '#8C4435',  dot: '#A65343' },
  // Verification statuses
  verified:          { bg: 'rgba(104, 115, 77, 0.10)',  text: '#52593B',  dot: '#68734D' },
  pending:           { bg: 'rgba(196, 151, 74, 0.12)',  text: '#7A5E28',  dot: '#C4974A' },
  rejected:          { bg: 'rgba(166, 83, 67, 0.10)',   text: '#8C4435',  dot: '#A65343' },
  under_review:      { bg: 'rgba(85, 107, 122, 0.10)',  text: '#45596A',  dot: '#556B7A' },
};

export function StatusChip({ status, label, size = 'sm' }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? {
    bg: 'rgba(111, 106, 97, 0.10)',
    text: Colors.textSecondary,
    dot: Colors.textTertiary,
  };

  const displayLabel = label ?? status.replace(/_/g, ' ');
  const isSmall = size === 'sm';

  return (
    <View style={[styles.chip, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 9 : FontSize.xs,
          },
        ]}
      >
        {displayLabel.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 5,
  },
  text: {
    fontFamily: FontFamily.outfitSemiBold,
    letterSpacing: 0.6,
  },
});
