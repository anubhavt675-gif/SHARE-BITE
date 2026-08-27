// ShareBite — Donor: My Donations Screen (Performance Optimized)
// Key changes:
//  - load wrapped in useCallback with [user?.id] dependency
//  - isMounted ref prevents setState after unmount (memory leak fix)
//  - FlatList tuned: initialNumToRender, maxToRenderPerBatch, windowSize, removeClippedSubviews

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export default function MyDonationsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Stable load function — won't be recreated unless user.id changes
  const load = useCallback(async () => {
    try {
      const dons = await DonationsService.getMyDonations(user?.id ?? '');
      if (isMounted.current) setDonations(dons);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const renderItem = useCallback(({ item }: { item: Donation }) => (
    <DonationCard
      donation={item}
      onPress={() => router.push(`/donor/${item.id}`)}
      showDistance={false}
    />
  ), []);

  const keyExtractor = useCallback((item: Donation) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>My Donations</Text>
        <TouchableOpacity onPress={() => router.push('/donor/create-donation')} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingList}>
          <DonationCardSkeleton />
          <DonationCardSkeleton />
          <DonationCardSkeleton />
        </View>
      ) : donations.length === 0 ? (
        <EmptyState
          emoji="🍽️"
          title="No donations yet"
          subtitle="Start sharing surplus food and make a difference today!"
          actionLabel="Donate Food"
          onAction={() => router.push('/donor/create-donation')}
        />
      ) : (
        <FlatList
          data={donations}
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
          ListHeaderComponent={
            <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
              {donations.length} donation{donations.length !== 1 ? 's' : ''}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xl,
    textAlign: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  count: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.base,
  },
  loadingList: {
    paddingHorizontal: Spacing.xl,
  },
});
