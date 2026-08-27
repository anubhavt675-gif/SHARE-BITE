// ShareBite — Activity Screen (Performance Optimized)
// Key changes:
//  - ActivityItem wrapped in React.memo (prevents re-renders on parent state changes)
//  - Date computations inside ActivityItem moved to useMemo
//  - loadData wrapped in useCallback with proper dependency
//  - isMounted ref prevents setState after unmount (memory leak fix)
//  - filtered computed with useMemo (no useEffect + setState)
//  - renderItem and onRefresh wrapped in useCallback
//  - FlatList tuned: initialNumToRender, maxToRenderPerBatch, windowSize, removeClippedSubviews

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusChip } from '../../components/ui/StatusChip';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { FOOD_CATEGORIES, DONATION_STATUS_LABELS } from '../../constants/food-ui';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

type ActivityFilter = 'all' | 'available' | 'claimed' | 'completed' | 'expired';

const ACTIVITY_FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'available', label: 'Active'    },
  { key: 'claimed',   label: 'Claimed'   },
  { key: 'completed', label: 'Completed' },
  { key: 'expired',   label: 'Expired'   },
];

// Timeline dot color by status
function getStatusColor(status: string): string {
  if (['AVAILABLE', 'CLAIMED', 'PICKUP_CONFIRMED'].includes(status)) return Colors.primary;
  if (['COMPLETED', 'PICKED_UP'].includes(status)) return Colors.accent;
  return Colors.textTertiary;
}

// ── ActivityItem — memoized to prevent re-renders when parent filter/state changes ──
const ActivityItem = React.memo(function ActivityItem({
  donation,
  onPress,
}: {
  donation: Donation;
  onPress: () => void;
}) {
  const { theme, isDark } = useTheme();

  // Memoize date computations — avoids creating Date objects on every render
  const { category, dateStr, timeStr, statusColor } = useMemo(() => {
    const cat = FOOD_CATEGORIES.find(c => c.key === donation.food.category);
    const d = new Date(donation.createdAt);
    return {
      category: cat,
      dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      timeStr: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
      statusColor: getStatusColor(donation.status),
    };
  }, [donation.food.category, donation.createdAt, donation.status]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.activityItem,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      activeOpacity={0.88}
    >
      {/* Timeline indicator */}
      <View style={styles.timelineCol}>
        <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />
        <View style={[styles.timelineLine, { backgroundColor: theme.colors.divider }]} />
      </View>

      {/* Image thumbnail */}
      <View style={[styles.thumbWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
        {donation.imageUrl ? (
          <Image source={{ uri: donation.imageUrl }} style={styles.thumb} />
        ) : (
          <Text style={[styles.thumbLetter, { color: theme.colors.textTertiary }]}>
            {category?.label?.charAt(0).toUpperCase() ?? 'F'}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityFoodName, { color: theme.colors.text }]} numberOfLines={1}>
            {donation.food.name}
          </Text>
          <Text style={[styles.activityDate, { color: theme.colors.textTertiary }]}>{dateStr}</Text>
        </View>

        <Text style={[styles.activityMeta, { color: theme.colors.textSecondary }]}>
          {donation.servings} servings · {donation.food.isVegetarian ? 'Veg' : 'Non-Veg'}
        </Text>

        <View style={styles.activityFooter}>
          <StatusChip status={donation.status} label={DONATION_STATUS_LABELS[donation.status]} />
          {donation.status === 'COMPLETED' && (
            <Text style={[styles.activitySaved, { color: Colors.accent }]}>
              {donation.servings} meals saved
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
});

export default function ActivityScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isNGO = user?.role === 'ngo';
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const dons = isNGO
        ? await DonationsService.getClaimedDonations(user?.id ?? '')
        : await DonationsService.getMyDonations(user?.id ?? '');
      if (isMounted.current) setDonations(dons);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [isNGO, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute filtered list with useMemo — no extra state, no useEffect
  const filtered = useMemo(() => donations.filter(d => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'available') return d.status === 'AVAILABLE' || d.status === 'CLAIMED';
    if (activeFilter === 'claimed') return d.status === 'CLAIMED' || d.status === 'PICKUP_CONFIRMED';
    if (activeFilter === 'completed') return d.status === 'COMPLETED' || d.status === 'PICKED_UP';
    if (activeFilter === 'expired') return d.status === 'EXPIRED' || d.status === 'CANCELLED';
    return true;
  }), [donations, activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderItem = useCallback(({ item }: { item: Donation }) => (
    <ActivityItem
      donation={item}
      onPress={() =>
        isNGO
          ? router.push(`/ngo/${item.id}`)
          : router.push(`/donor/${item.id}`)
      }
    />
  ), [isNGO]);

  const keyExtractor = useCallback((item: Donation) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Activity</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {isNGO ? 'Your rescued food timeline.' : 'Your donation history.'}
        </Text>
        <HandDrawnSeparator />
      </View>

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        {ACTIVITY_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === f.key ? Colors.primary : 'transparent',
                borderColor: activeFilter === f.key ? Colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === f.key ? Colors.textInverse : theme.colors.textSecondary },
              ]}
            >
              {f.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <DonationCardSkeleton />
          <DonationCardSkeleton />
          <DonationCardSkeleton />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet."
          subtitle={
            isNGO
              ? 'Your rescued meals will appear here.'
              : 'Your donation history will appear here.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={renderItem}
          // ── FlatList performance tuning ──
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['4xl'] - 2,
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  filtersWrap: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  loadingWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
  },
  // Timeline
  timelineCol: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 30,
  },
  // Thumbnail
  thumbWrap: {
    width: 54,
    height: 54,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumb: {
    width: 54,
    height: 54,
  },
  thumbLetter: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: 22,
  },
  // Content
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  activityFoodName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.base,
    flex: 1,
    marginRight: Spacing.sm,
  },
  activityDate: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    flexShrink: 0,
  },
  activityMeta: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  activitySaved: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
  },
});
