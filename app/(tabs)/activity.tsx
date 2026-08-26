// ShareBite — Activity Screen

import React, { useState, useEffect } from 'react';
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
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { FOOD_CATEGORIES, DONATION_STATUS_LABELS } from '../../services/mock-data';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

type ActivityFilter = 'all' | 'available' | 'claimed' | 'completed' | 'expired';

const ACTIVITY_FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Active' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'completed', label: 'Completed' },
  { key: 'expired', label: 'Expired' },
];

function ActivityItem({ donation, onPress }: { donation: Donation; onPress: () => void }) {
  const { theme, isDark } = useTheme();
  const category = FOOD_CATEGORIES.find(c => c.key === donation.food.category);
  const date = new Date(donation.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.activityItem,
        { backgroundColor: theme.colors.card, ...(isDark ? Shadow.dark : Shadow.sm) },
      ]}
      activeOpacity={0.85}
    >
      {/* Image / Emoji */}
      <View style={[styles.activityImg, { backgroundColor: `${category?.color}18` }]}>
        {donation.imageUrl ? (
          <Image source={{ uri: donation.imageUrl }} style={styles.activityImgFull} />
        ) : (
          <Text style={{ fontSize: 28 }}>{category?.emoji ?? '🍽️'}</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.activityInfo}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {donation.food.name}
          </Text>
          <Text style={[styles.activityDate, { color: theme.colors.textTertiary }]}>{dateStr}</Text>
        </View>
        <Text style={[styles.activityMeta, { color: theme.colors.textSecondary }]}>
          {donation.servings} servings • {donation.food.isVegetarian ? 'Veg' : 'Non-Veg'}
        </Text>
        <View style={styles.activityFooter}>
          <StatusChip status={donation.status} label={DONATION_STATUS_LABELS[donation.status]} />
          {donation.status === 'COMPLETED' && (
            <Text style={[styles.activityImpact, { color: Colors.primary }]}>
              🌱 +{donation.servings} meals saved
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function ActivityScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isNGO = user?.role === 'ngo';
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const dons = isNGO
        ? await DonationsService.getClaimedDonations(user?.id ?? '')
        : await DonationsService.getMyDonations(user?.id ?? '');
      setDonations(dons);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = donations.filter(d => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'available') return d.status === 'AVAILABLE' || d.status === 'CLAIMED';
    if (activeFilter === 'claimed') return d.status === 'CLAIMED' || d.status === 'PICKUP_CONFIRMED';
    if (activeFilter === 'completed') return d.status === 'COMPLETED' || d.status === 'PICKED_UP';
    if (activeFilter === 'expired') return d.status === 'EXPIRED' || d.status === 'CANCELLED';
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Activity</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {isNGO ? 'Your claimed food' : 'Your donation history'}
        </Text>
      </View>

      {/* Filter chips */}
      <FlatList
        data={ACTIVITY_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={f => f.key}
        contentContainerStyle={styles.filtersWrap}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === item.key ? Colors.primary : theme.colors.surfaceVariant,
                borderColor: activeFilter === item.key ? Colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === item.key ? '#fff' : theme.colors.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      {loading ? (
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <DonationCardSkeleton />
          <DonationCardSkeleton />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="Nothing here yet"
          subtitle={
            isNGO
              ? 'Your rescued meals will appear here.'
              : 'Your donation history will appear here.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(); }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <ActivityItem
              donation={item}
              onPress={() =>
                isNGO
                  ? router.push(`/ngo/${item.id}`)
                  : router.push(`/donor/${item.id}`)
              }
            />
          )}
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
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
  filtersWrap: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  activityImg: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activityImgFull: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
  },
  activityInfo: { flex: 1 },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  activityTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
    flex: 1,
  },
  activityDate: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  activityMeta: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  activityImpact: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
  },
});
