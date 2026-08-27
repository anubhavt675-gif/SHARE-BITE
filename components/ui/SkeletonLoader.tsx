// ShareBite — SkeletonLoader Component

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing } from '../../constants/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.xs, style }: SkeletonProps) {
  const { theme } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 850, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Matches the actual DonationCard layout (horizontal row)
export function DonationCardSkeleton() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Image placeholder */}
      <Skeleton width={100} height={100} borderRadius={Radius.xs} />
      {/* Text content */}
      <View style={styles.cardContent}>
        <Skeleton height={9}  width="40%" borderRadius={3} />
        <View style={{ height: 7 }} />
        <Skeleton height={15} width="75%" />
        <View style={{ height: 6 }} />
        <Skeleton height={11} width="55%" borderRadius={3} />
        <View style={{ height: 10 }} />
        <Skeleton height={11} width="85%" borderRadius={3} />
        <View style={{ height: 12 }} />
        <Skeleton height={24} width="36%" borderRadius={Radius.xs} />
      </View>
    </View>
  );
}

export function ImpactMetricSkeleton() {
  return (
    <View style={styles.metricSkeleton}>
      <Skeleton height={32} width="55%" style={{ alignSelf: 'center' }} />
      <View style={{ height: 8 }} />
      <Skeleton height={11} width="75%" style={{ alignSelf: 'center' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    paddingTop: 2,
  },
  metricSkeleton: {
    flex: 1,
    padding: Spacing.base,
    alignItems: 'center',
  },
});
