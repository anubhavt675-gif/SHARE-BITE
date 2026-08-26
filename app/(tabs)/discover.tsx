// ShareBite — Discover Screen (NGO: Nearby donations | Donor: Browse all)

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

type FilterType = 'all' | 'fresh' | 'urgent' | 'veg' | 'non-veg';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fresh', label: '🟢 Fresh' },
  { key: 'urgent', label: '🔴 Urgent' },
  { key: 'veg', label: '🥦 Veg' },
  { key: 'non-veg', label: '🍗 Non-Veg' },
];

export default function DiscoverScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filtered, setFiltered] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const isNGO = user?.role === 'ngo';

  const loadData = useCallback(async () => {
    try {
      const dons = await DonationsService.getNearbyDonations(28.6139, 77.2090);
      setDonations(dons);
      setFiltered(dons);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let result = donations;
    if (search.trim()) {
      result = result.filter(d =>
        d.food.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.donor.organizationName ?? '').toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (activeFilter === 'fresh') result = result.filter(d => d.freshnessStatus === 'FRESH');
    if (activeFilter === 'urgent') result = result.filter(d => d.freshnessStatus === 'URGENT');
    if (activeFilter === 'veg') result = result.filter(d => d.food.isVegetarian);
    if (activeFilter === 'non-veg') result = result.filter(d => !d.food.isVegetarian);
    setFiltered(result);
  }, [search, activeFilter, donations]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isNGO ? 'Nearby Tables' : 'Browse Tables'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {filtered.length} surplus meal{filtered.length !== 1 ? 's' : ''} available
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search kitchens, dishes..."
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.searchInput, { color: theme.colors.text, fontFamily: FontFamily.interRegular }]}
            accessibilityLabel="Search donations"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={f => f.key}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? Colors.primary : theme.colors.surface,
                    borderColor: isActive ? Colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { 
                      color: isActive ? '#FAF8F1' : theme.colors.textSecondary,
                      fontSize: FontSize.xs,
                    },
                  ]}
                >
                  {item.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Donation List */}
      {loading ? (
        <View style={styles.loadingList}>
          <DonationCardSkeleton />
          <DonationCardSkeleton />
          <DonationCardSkeleton />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="📭"
          title="No donations found"
          subtitle="Try adjusting your filters or check again soon — new donations appear anytime."
          actionLabel="Clear Filters"
          onAction={() => { setActiveFilter('all'); setSearch(''); }}
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
            <DonationCard
              donation={item}
              onPress={() =>
                isNGO
                  ? router.push(`/ngo/${item.id}`)
                  : router.push(`/donor/${item.id}`)
              }
              onClaim={isNGO ? () => router.push(`/ngo/claim-confirmation?id=${item.id}`) : undefined}
              showDistance
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    height: 44,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  filters: {
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: FontFamily.outfitSemiBold,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.sm,
  },
  loadingList: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
