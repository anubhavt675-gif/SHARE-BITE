// ShareBite — SkeletonLoader Component

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius } from '../../constants/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const { theme } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

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

export function DonationCardSkeleton() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Skeleton width={80} height={80} borderRadius={Radius.md} />
      <View style={styles.cardContent}>
        <Skeleton height={14} width="70%" />
        <View style={{ height: 6 }} />
        <Skeleton height={11} width="50%" />
        <View style={{ height: 8 }} />
        <Skeleton height={11} width="80%" />
        <View style={{ height: 10 }} />
        <Skeleton height={30} width="40%" borderRadius={Radius.full} />
      </View>
    </View>
  );
}

export function ImpactMetricSkeleton() {
  return (
    <View style={styles.metricSkeleton}>
      <Skeleton height={36} width="60%" style={{ alignSelf: 'center' }} />
      <View style={{ height: 6 }} />
      <Skeleton height={12} width="80%" style={{ alignSelf: 'center' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: Radius.lg,
    marginBottom: 12,
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  metricSkeleton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
});
