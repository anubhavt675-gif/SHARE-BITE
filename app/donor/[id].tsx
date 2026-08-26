// ShareBite — Donor Donation Detail Screen [id].tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { StatusChip } from '../../components/ui/StatusChip';
import { Card } from '../../components/ui/Card';
import { BotanicalSprig, HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { FOOD_CATEGORIES, DONATION_STATUS_LABELS } from '../../services/mock-data';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function DonorDonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DonationsService.getDonationById(id ?? '').then(d => {
      setDonation(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} size="large" />
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorWrap}>
          <Text style={{ fontSize: 48 }}>😔</Text>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>Donation not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = FOOD_CATEGORIES.find(c => c.key === donation.food.category);
  const timeLeft = new Date(donation.expiresAt).getTime() - Date.now();
  const minutesLeft = Math.max(0, Math.floor(timeLeft / 60000));
  const hoursLeft = Math.floor(minutesLeft / 60);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Header */}
        <View style={styles.imageWrap}>
          {donation.imageUrl ? (
            <Image source={{ uri: donation.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={isDark ? ['#292925', '#1C1C1A'] : [Colors.background, Colors.surfaceVariant]}
              style={[styles.imagePlaceholder]}
            >
              <Text style={{ fontSize: 80 }}>{cat?.emoji ?? '🍛'}</Text>
            </LinearGradient>
          )}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.vegBadge}>
            <Text style={{ fontSize: 10 }}>{donation.food.isVegetarian ? '🟢' : '🔴'}</Text>
            <Text style={styles.vegText}>{donation.food.isVegetarian ? 'Veg' : 'Non-Veg'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabelText}>
                {cat?.label ? cat.label.toUpperCase() : 'FOOD'} · DONATION OVERVIEW
              </Text>
              <Text style={[styles.foodName, { color: theme.colors.text }]}>{donation.food.name}</Text>
              <Text style={[styles.orgName, { color: theme.colors.textSecondary }]}>
                Shared by you ({donation.donor.organizationName ?? donation.donor.name})
              </Text>
            </View>
            <StatusChip status={donation.freshnessStatus} size="md" />
          </View>

          {/* Status */}
          <Card style={styles.statusCard} padding={14}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>LISTING STATUS</Text>
            <Text style={[styles.statusText, { color: theme.colors.text }]}>
              {DONATION_STATUS_LABELS[donation.status]}
            </Text>
            {donation.claimedBy && (
              <Text style={[styles.claimedText, { color: Colors.primary }]}>
                Claimed by a registered partner NGO
              </Text>
            )}
          </Card>

          {/* Trust Callout */}
          <View style={[styles.trustBanner, { backgroundColor: '#FAF8F1', borderColor: Colors.border, borderWidth: 1, padding: 12, borderRadius: Radius.sm, marginBottom: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
            <BotanicalSprig size={26} />
            <Text style={{ flex: 1, fontFamily: FontFamily.interRegular, fontSize: FontSize.xs, color: theme.colors.textSecondary, fontStyle: 'italic', lineHeight: 15 }}>
              "By rescuing this meal, you're helping prevent good food from going to waste."
            </Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {[
              { icon: 'people-outline', label: 'Servings', value: `${donation.servings} people` },
              { icon: 'scale-outline', label: 'Quantity', value: `${donation.quantity} kg` },
              { icon: 'time-outline', label: 'Prepared at', value: formatDate(donation.preparedAt) },
              {
                icon: 'alarm-outline',
                label: hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft % 60}m left` : `${minutesLeft}m left`,
                value: 'Expires at ' + formatDate(donation.expiresAt),
              },
              { icon: 'cube-outline', label: 'Packaging', value: donation.packagingType },
              { icon: 'location-outline', label: 'Pickup from', value: donation.pickupLocation.address },
            ].map(item => (
              <Card key={item.label} style={styles.detailCard} padding={12}>
                <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {item.label.toUpperCase()}
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.value}
                </Text>
              </Card>
            ))}
          </View>

          {donation.notes && (
            <Card style={styles.notesCard} padding={14}>
              <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Notes</Text>
              <Text style={[styles.notesText, { color: theme.colors.text }]}>{donation.notes}</Text>
            </Card>
          )}

          {/* Safety confirmed */}
          <View style={[styles.safetyBanner, { backgroundColor: Colors.primaryAlpha10, borderColor: Colors.primary, borderWidth: 1 }]}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
            <Text style={[styles.safetyText, { color: Colors.primary }]}>
              Food safety confirmed by donor
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageWrap: { height: 260, position: 'relative' },
  image: { width: '100%', height: 260 },
  imagePlaceholder: { width: '100%', height: 260, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(41, 41, 37, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF8F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vegText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.xl },
  titleRow: {
    marginBottom: Spacing.base,
  },
  categoryLabelText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1.2,
    color: Colors.primary,
    marginBottom: 4,
  },
  foodName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * 1.05,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  orgName: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusCard: { marginBottom: Spacing.base },
  cardLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  claimedText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  detailCard: {
    width: '47%',
    gap: 3,
    backgroundColor: '#FAF8F1',
  },
  detailLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
    lineHeight: 18,
  },
  notesCard: { marginBottom: Spacing.base },
  notesText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.5,
    marginTop: 4,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    borderRadius: Radius.sm,
  },
  safetyText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xl,
  },
});
