// ShareBite — Discover / Nearby Screen

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { DonationsService } from '../../services/donations';
import { LocationService } from '../../services/location';
import { supabase } from '../../lib/supabase';
import { Donation } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

type FilterType = 'all' | 'fresh' | 'urgent' | 'veg' | 'non-veg';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'fresh',   label: 'Fresh'   },
  { key: 'urgent',  label: 'Urgent'  },
  { key: 'veg',     label: 'Veg'     },
  { key: 'non-veg', label: 'Non-Veg' },
];

export default function DiscoverScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filtered, setFiltered] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const latRef = useRef(28.6139);
  const lngRef = useRef(77.2090);

  const isNGO = user?.role === 'ngo';

  const loadData = useCallback(async () => {
    try {
      const loc = await LocationService.getCurrentLocation();
      const lat = loc?.latitude ?? 28.6139;
      const lng = loc?.longitude ?? 77.2090;
      latRef.current = lat;
      lngRef.current = lng;
      const dons = await DonationsService.getNearbyDonations(lat, lng);
      setDonations(dons);
      setFiltered(dons);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('discover-food-listings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_listings' },
        async () => {
          const dons = await DonationsService.getNearbyDonations(latRef.current, lngRef.current);
          setDonations(dons);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  const ListHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Nearby</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Food waiting to find another table.
      </Text>
      <HandDrawnSeparator />

      {/* Result count */}
      <Text style={[styles.resultCount, { color: theme.colors.textTertiary }]}>
        {filtered.length} meal{filtered.length !== 1 ? 's' : ''} available nearby
      </Text>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
        <Ionicons name="search-outline" size={15} color={theme.colors.textTertiary} />
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
            <Ionicons name="close-circle" size={15} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips — outlined, no emoji */}
      <View style={styles.filtersRow}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? Colors.primary : 'transparent',
                  borderColor: isActive ? Colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? Colors.textInverse : theme.colors.textSecondary },
                ]}
              >
                {f.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <ListHeader />
        <View style={styles.loadingList}>
          <DonationCardSkeleton />
          <DonationCardSkeleton />
          <DonationCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <EmptyState
            title="No rescued meals nearby."
            subtitle="Try adjusting your filters or check back soon — new donations appear anytime."
            actionLabel="Clear Filters"
            onAction={() => { setActiveFilter('all'); setSearch(''); }}
          />
        }
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
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
      />
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
  resultCount: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
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
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
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
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  loadingList: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
});
