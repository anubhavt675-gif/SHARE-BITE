// ShareBite — Donor Donation Detail Screen

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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { StatusChip } from '../../components/ui/StatusChip';
import { Card } from '../../components/ui/Card';
import { HandDrawnSeparator, BotanicalSprig } from '../../components/ui/BotanicalDetails';
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
  const { theme } = useTheme();
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
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorLink}>
            <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = FOOD_CATEGORIES.find(c => c.key === donation.food.category);
  const timeLeft = new Date(donation.expiresAt).getTime() - Date.now();
  const minutesLeft = Math.max(0, Math.floor(timeLeft / 60000));
  const hoursLeft = Math.floor(minutesLeft / 60);
  const isExpired = donation.status === 'EXPIRED' || donation.status === 'CANCELLED';
  const isCompleted = donation.status === 'COMPLETED' || donation.status === 'PICKED_UP';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero Image ── */}
        <View style={styles.imageWrap}>
          {donation.imageUrl ? (
            <Image source={{ uri: donation.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: Colors.surfaceVariant }]}>
              <Text style={[styles.placeholderLetter, { color: Colors.textTertiary }]}>
                {cat?.label?.charAt(0).toUpperCase() ?? 'F'}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: 'rgba(41,39,34,0.45)' }]}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* ── Title ── */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabel}>
                {cat?.label?.toUpperCase() ?? 'FOOD'} · {donation.food.isVegetarian ? 'VEG' : 'NON-VEG'}
              </Text>
              <Text style={[styles.foodName, { color: theme.colors.text }]}>{donation.food.name}</Text>
            </View>
            <StatusChip status={donation.status} label={DONATION_STATUS_LABELS[donation.status]} size="md" />
          </View>

          <HandDrawnSeparator />

          {/* ── Status banner for completed / expired ── */}
          {(isCompleted || isExpired) && (
            <View style={[
              styles.statusBanner,
              {
                backgroundColor: isCompleted ? Colors.accentAlpha10 : Colors.primaryAlpha08,
                borderColor: isCompleted ? Colors.accent : Colors.error,
              },
            ]}>
              <Ionicons
                name={isCompleted ? 'checkmark-circle-outline' : 'time-outline'}
                size={15}
                color={isCompleted ? Colors.accent : Colors.error}
              />
              <Text style={[styles.statusBannerText, { color: isCompleted ? Colors.accent : Colors.error }]}>
                {isCompleted
                  ? 'This meal has been successfully collected by an NGO partner.'
                  : 'This donation has expired or was cancelled.'}
              </Text>
            </View>
          )}

          {/* ── Stats ── */}
          <View style={styles.statsRow}>
            {[
              { icon: 'people-outline',   value: `${donation.servings}`,   label: 'PORTIONS',  color: Colors.primary },
              { icon: 'time-outline',     value: hoursLeft > 0 ? `${hoursLeft}h` : `${minutesLeft}m`, label: 'REMAINING', color: Colors.yellow },
              { icon: 'cube-outline',     value: donation.quantity.toString(), label: 'QUANTITY',  color: Colors.accent  },
            ].map(stat => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name={stat.icon as any} size={14} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Listing Details ── */}
          <Card style={styles.sectionCard} padding={Spacing.base}>
            <Text style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>LISTING DETAILS</Text>
            {[
              { label: 'Pickup Location', value: donation.pickupLocation.address },
              { label: 'Packaging',       value: donation.packagingType            },
              { label: 'Prepared At',     value: formatDate(donation.preparedAt)   },
              { label: 'Expires At',      value: formatDate(donation.expiresAt)    },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>{item.label}</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={2}>{item.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />}
              </View>
            ))}
          </Card>

          {/* ── Claimed By ── */}
          {donation.claimedBy && (
            <Card style={styles.sectionCard} padding={Spacing.base}>
              <Text style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>CLAIMED BY</Text>
              <View style={styles.donorRow}>
                <View style={[styles.donorInitial, { backgroundColor: Colors.accentAlpha10 }]}>
                  <Text style={[styles.donorLetter, { color: Colors.accent }]}>
                    {donation.claimedBy.charAt(0).toUpperCase() ?? 'N'}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.donorName, { color: theme.colors.text }]}>NGO Partner</Text>
                  <View style={styles.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={10} color={Colors.accent} />
                    <Text style={[styles.verifiedText, { color: Colors.accent }]}>NGO Partner</Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* ── Notes ── */}
          {donation.notes ? (
            <Card style={styles.sectionCard} padding={Spacing.base}>
              <Text style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>ADDITIONAL NOTES</Text>
              <Text style={[styles.notesText, { color: theme.colors.text }]}>{donation.notes}</Text>
            </Card>
          ) : null}

          {/* ── Impact callout if completed ── */}
          {isCompleted && (
            <View style={[styles.impactCallout, { backgroundColor: Colors.accentAlpha10, borderColor: Colors.accent }]}>
              <BotanicalSprig size={20} color={Colors.accent} />
              <Text style={[styles.impactText, { color: Colors.accent }]}>
                {donation.servings} meals rescued · {(donation.servings * 0.38).toFixed(1)} kg CO₂ saved
              </Text>
            </View>
          )}

          <View style={{ height: Spacing['4xl'] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorTitle: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.xl },
  errorLink: { paddingVertical: Spacing.sm },

  imageWrap: { height: 240, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderLetter: { fontFamily: FontFamily.serifDisplay, fontSize: 64 },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  content: { padding: Spacing.xl },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  categoryLabel: {
    fontSize: 9, fontFamily: FontFamily.outfitBold,
    letterSpacing: 1, color: Colors.primary, marginBottom: 4,
  },
  foodName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'] + 2,
    lineHeight: (FontSize['2xl'] + 2) * 1.2,
    letterSpacing: 0.2,
  },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.xs, borderWidth: 1, marginBottom: Spacing.base,
  },
  statusBannerText: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.xs + 1, flex: 1 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.xs, borderWidth: 1, gap: 3,
  },
  statValue: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.lg },
  statLabel: { fontSize: 8, fontFamily: FontFamily.outfitBold, letterSpacing: 0.8 },

  sectionCard: { marginBottom: Spacing.sm },
  cardLabel: { fontSize: 9, fontFamily: FontFamily.outfitBold, letterSpacing: 1, marginBottom: Spacing.sm },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm, paddingVertical: 9 },
  detailLabel: { fontFamily: FontFamily.interRegular, fontSize: FontSize.xs, flex: 1 },
  detailValue: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.xs + 1, flex: 2, textAlign: 'right' },
  sep: { height: 0.5 },

  donorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  donorInitial: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  donorLetter: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.xl },
  donorName: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.sm },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  verifiedText: { fontFamily: FontFamily.outfitSemiBold, fontSize: 9, letterSpacing: 0.3 },

  notesText: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, marginTop: 4 },

  impactCallout: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.base, borderRadius: Radius.xs, borderWidth: 1,
    marginTop: Spacing.sm,
  },
  impactText: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.sm, flex: 1 },
});
