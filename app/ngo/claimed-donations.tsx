// ShareBite — NGO Claimed Donations Screen

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export default function ClaimedDonationsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const dons = await DonationsService.getClaimedDonations(user?.id ?? '');
    setDonations(dons);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Claimed Donations</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>Food you've rescued</Text>
      </View>
      {loading ? (
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <DonationCardSkeleton />
          <DonationCardSkeleton />
        </View>
      ) : donations.length === 0 ? (
        <EmptyState
          emoji="🤝"
          title="No claimed donations yet"
          subtitle="Start rescuing food near you to see them here."
          actionLabel="Find Food"
          onAction={() => router.push('/(tabs)/discover')}
        />
      ) : (
        <FlatList
          data={donations}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <DonationCard
              donation={item}
              onPress={() => router.push(`/ngo/${item.id}`)}
              showDistance
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base },
  title: { fontFamily: FontFamily.outfitBold, fontSize: FontSize['2xl'] },
  sub: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm, marginTop: 2 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['3xl'] },
});
