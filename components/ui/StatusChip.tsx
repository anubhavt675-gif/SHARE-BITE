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

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  AVAILABLE: { bg: 'transparent', text: '#626A3A', dot: '#626A3A' },
  CLAIMED: { bg: 'transparent', text: '#4F6379', dot: '#4F6379' },
  PICKUP_CONFIRMED: { bg: 'transparent', text: '#B96F52', dot: '#B96F52' },
  PICKED_UP: { bg: 'transparent', text: '#B96F52', dot: '#B96F52' },
  COMPLETED: { bg: 'transparent', text: '#54544D', dot: '#54544D' },
  CANCELLED: { bg: 'transparent', text: '#A24836', dot: '#A24836' },
  EXPIRED: { bg: 'transparent', text: '#A24836', dot: '#A24836' },
  FRESH: { bg: 'transparent', text: '#626A3A', dot: '#626A3A' },
  PICKUP_SOON: { bg: 'transparent', text: '#B96F52', dot: '#B96F52' },
  URGENT: { bg: 'transparent', text: '#A24836', dot: '#A24836' },
  verified: { bg: 'transparent', text: '#626A3A', dot: '#626A3A' },
  pending: { bg: 'transparent', text: '#D5A467', dot: '#D5A467' },
  rejected: { bg: 'transparent', text: '#A24836', dot: '#A24836' },
  under_review: { bg: 'transparent', text: '#4F6379', dot: '#4F6379' },
};

export function StatusChip({ status, label, size = 'sm' }: StatusChipProps) {
  const colors = STATUS_COLORS[status] ?? {
    bg: 'transparent',
    text: '#54544D',
    dot: '#8A8A80',
  };

  const displayLabel = label ?? status.replace(/_/g, ' ');
  const isSmall = size === 'sm';

  return (
    <View style={[styles.chip, { borderColor: colors.dot, borderStyle: 'solid' }]}>
      <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? FontSize.xs - 2 : FontSize.xs,
          },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  text: {
    fontFamily: FontFamily.outfitSemiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
