// ShareBite — NGO Donation Detail + Claim Screen

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusChip } from '../../components/ui/StatusChip';
import { HandDrawnSeparator, BotanicalSprig } from '../../components/ui/BotanicalDetails';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { FOOD_CATEGORIES } from '../../constants/food-ui';
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

export default function NGODonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    DonationsService.getDonationById(id ?? '').then(d => {
      setDonation(d);
      setLoading(false);
    });
  }, [id]);

  const handleClaim = async () => {
    if (!donation || !user) return;
    setClaiming(true);
    try {
      const success = await DonationsService.claimDonation(donation.id, user.id);
      if (success) {
        setShowClaimModal(false);
        setClaimSuccess(true);
        Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
        setDonation(prev => prev ? { ...prev, status: 'CLAIMED' } : prev);
      }
    } catch {
      Alert.alert('Failed', 'Unable to claim donation. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

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
  const canClaim = donation.status === 'AVAILABLE' && !claimSuccess;

  // ── Claim success state ───────────────────────────────────────────
  if (claimSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successWrap}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }], backgroundColor: Colors.primaryAlpha12, borderColor: Colors.primary }]}>
            <BotanicalSprig size={40} color={Colors.primary} />
          </Animated.View>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>Donation Secured</Text>
          <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
            You've claimed {donation.food.name}. Coordinate pickup with the donor now.
          </Text>
          <View style={[styles.claimedSummary, { backgroundColor: Colors.primaryAlpha08, borderColor: Colors.primary }]}>
            <View style={styles.claimedRow}>
              <Ionicons name="people-outline" size={13} color={Colors.primary} />
              <Text style={[styles.claimedItem, { color: Colors.primary }]}>{donation.servings} meals</Text>
            </View>
            <View style={styles.claimedRow}>
              <Ionicons name="location-outline" size={13} color={Colors.primary} />
              <Text style={[styles.claimedItem, { color: Colors.primary }]}>{donation.distanceKm ?? '?'} km away</Text>
            </View>
          </View>
          <View style={styles.successBtns}>
            <Button label="Track Pickup" onPress={() => router.replace('/ngo/pickup-tracking')} variant="primary" size="lg" />
            <Button label="Find More Donations" onPress={() => router.replace('/(tabs)/discover')} variant="outline" size="md" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: 'rgba(41,39,34,0.45)' }]}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          {donation.freshnessStatus === 'URGENT' && (
            <View style={[styles.urgentBanner, { backgroundColor: Colors.error }]}>
              <Text style={styles.urgentText}>URGENT PICKUP NEEDED</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* ── Title Block ── */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabel}>
                {cat?.label?.toUpperCase() ?? 'FOOD'} · {donation.food.isVegetarian ? 'VEG' : 'NON-VEG'}
              </Text>
              <Text style={[styles.foodName, { color: theme.colors.text }]}>{donation.food.name}</Text>
              <Text style={[styles.orgName, { color: theme.colors.textSecondary }]}>
                from {donation.donor.organizationName ?? donation.donor.name}
              </Text>
            </View>
            <StatusChip status={donation.freshnessStatus} size="md" />
          </View>

          <HandDrawnSeparator />

          {/* ── Key Stats ── */}
          <View style={styles.statsRow}>
            {[
              { icon: 'people-outline',   value: `${donation.servings}`,                       label: 'PORTIONS',  color: Colors.primary  },
              { icon: 'location-outline', value: `${donation.distanceKm ?? '?'} km`,            label: 'DISTANCE',  color: Colors.accent   },
              { icon: 'time-outline',     value: hoursLeft > 0 ? `${hoursLeft}h` : `${minutesLeft}m`, label: 'AVAILABLE', color: Colors.yellow   },
            ].map(stat => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name={stat.icon as any} size={15} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Trust Callout ── */}
          <View style={[styles.trustBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <BotanicalSprig size={22} color={Colors.primary} />
            <Text style={[styles.trustText, { color: theme.colors.textSecondary }]}>
              "By rescuing this meal, you're helping prevent good food from going to waste."
            </Text>
          </View>

          {/* ── Donor Info ── */}
          <Card style={styles.sectionCard} padding={Spacing.base}>
            <Text style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>THE DONOR</Text>
            <View style={styles.donorRow}>
              <View style={[styles.donorInitial, { backgroundColor: Colors.primaryAlpha12 }]}>
                <Text style={[styles.donorLetter, { color: Colors.primary }]}>
                  {(donation.donor.organizationName ?? donation.donor.name).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.donorName, { color: theme.colors.text }]}>
                  {donation.donor.organizationName ?? donation.donor.name}
                </Text>
                {donation.donor.isVerified && (
                  <View style={styles.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                    <Text style={[styles.verifiedText, { color: Colors.primary }]}>Verified Local Donor</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={[styles.callBtn, { backgroundColor: Colors.primaryAlpha08, borderColor: Colors.primary }]}>
                <Ionicons name="call-outline" size={15} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* ── Details ── */}
          <Card style={styles.sectionCard} padding={Spacing.base}>
            <Text style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>LISTING DETAILS</Text>
            {[
              { label: 'Pickup Location', value: donation.pickupLocation.address },
              { label: 'Packaging',       value: donation.packagingType            },
              { label: 'Prepared At',     value: formatDate(donation.preparedAt)   },
              { label: 'Rescue Before',   value: formatDate(donation.expiresAt)    },
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

          {donation.notes ? (
            <Card style={styles.sectionCard} padding={Spacing.base}>
              <Text style={[styles.cardLabel, { color: theme.colors.textTertiary }]}>NOTES FROM DONOR</Text>
              <Text style={[styles.notesText, { color: theme.colors.text }]}>{donation.notes}</Text>
            </Card>
          ) : null}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Fixed CTA ── */}
      {canClaim && (
        <View style={[styles.ctaArea, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <Button
            label="Reserve This Food"
            onPress={() => setShowClaimModal(true)}
            variant="primary"
            size="lg"
          />
          <TouchableOpacity onPress={() => router.push('/ngo/pickup-tracking')} style={styles.directionsLink}>
            <Ionicons name="navigate-outline" size={13} color={Colors.primary} />
            <Text style={styles.directionsText}>GET DIRECTIONS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Claim Modal ── */}
      <Modal visible={showClaimModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHandle} />

            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Confirm Reservation
            </Text>
            <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
              You're about to rescue {donation.food.name} for your community.
            </Text>

            <View style={[styles.modalDetails, { backgroundColor: Colors.primaryAlpha08, borderColor: theme.colors.border }]}>
              {[
                { icon: 'restaurant-outline', text: `${donation.servings} meals`,                                    color: Colors.primary  },
                { icon: 'location-outline',   text: `${donation.distanceKm ?? '?'} km away`,                        color: Colors.accent   },
                { icon: 'time-outline',       text: `Pickup before ${new Date(donation.expiresAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`, color: Colors.yellow },
              ].map(item => (
                <View key={item.icon} style={styles.modalDetailRow}>
                  <Ionicons name={item.icon as any} size={14} color={item.color} />
                  <Text style={[styles.modalDetailText, { color: theme.colors.textSecondary }]}>{item.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <Button
                label={claiming ? 'Reserving...' : 'Confirm Reservation'}
                onPress={handleClaim}
                variant="primary"
                size="lg"
                isLoading={claiming}
              />
              <Button
                label="Cancel"
                onPress={() => setShowClaimModal(false)}
                variant="outline"
                size="md"
                disabled={claiming}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Loading / Error
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorTitle: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.xl },
  errorLink: { paddingVertical: Spacing.sm },

  // Hero
  imageWrap: { height: 260, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderLetter: { fontFamily: FontFamily.serifDisplay, fontSize: 64 },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  urgentBanner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingVertical: 6, alignItems: 'center',
  },
  urgentText: { color: '#fff', fontFamily: FontFamily.outfitBold, fontSize: 10, letterSpacing: 1 },

  // Content
  content: { padding: Spacing.xl },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  categoryLabel: {
    fontSize: 9, fontFamily: FontFamily.outfitBold, letterSpacing: 1,
    color: Colors.primary, marginBottom: 4,
  },
  foodName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'] + 2,
    lineHeight: (FontSize['2xl'] + 2) * 1.2,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  orgName: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm },

  // Stats row
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.xs, borderWidth: 1, gap: 3,
  },
  statValue: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.lg },
  statLabel: { fontSize: 8, fontFamily: FontFamily.outfitBold, letterSpacing: 0.8 },

  // Trust
  trustBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.xs, borderWidth: 1,
    marginBottom: Spacing.base,
  },
  trustText: { flex: 1, fontFamily: FontFamily.serifDisplay, fontSize: FontSize.xs + 1, fontStyle: 'italic', lineHeight: 16 },

  // Sections
  sectionCard: { marginBottom: Spacing.sm },
  cardLabel: { fontSize: 9, fontFamily: FontFamily.outfitBold, letterSpacing: 1, marginBottom: Spacing.sm },

  // Donor row
  donorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  donorInitial: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  donorLetter: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.xl },
  donorName: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.sm },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  verifiedText: { fontFamily: FontFamily.outfitSemiBold, fontSize: 9, letterSpacing: 0.3 },
  callBtn: { width: 36, height: 36, borderRadius: Radius.xs, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Details
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm, paddingVertical: 9 },
  detailLabel: { fontFamily: FontFamily.interRegular, fontSize: FontSize.xs, flex: 1 },
  detailValue: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.xs + 1, flex: 2, textAlign: 'right' },
  sep: { height: 0.5 },
  notesText: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, marginTop: 4 },

  // CTA
  ctaArea: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    paddingBottom: 28, borderTopWidth: 1, gap: Spacing.sm,
  },
  directionsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  directionsText: { color: Colors.primary, fontFamily: FontFamily.outfitBold, fontSize: 9, letterSpacing: 0.5 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(41,39,34,0.45)' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, gap: Spacing.md },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize.xl, letterSpacing: 0.2 },
  modalSub: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  modalDetails: { borderRadius: Radius.xs, borderWidth: 1, padding: Spacing.base, gap: Spacing.sm },
  modalDetailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modalDetailText: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm },
  modalBtns: { gap: Spacing.sm, marginTop: Spacing.sm },

  // Success
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'], gap: Spacing.base },
  successCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  successTitle: { fontFamily: FontFamily.serifDisplay, fontSize: FontSize['2xl'], letterSpacing: 0.2 },
  successSub: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm, textAlign: 'center', lineHeight: FontSize.sm * 1.5 },
  claimedSummary: { borderRadius: Radius.xs, borderWidth: 1, padding: Spacing.base, gap: Spacing.sm, alignSelf: 'stretch' },
  claimedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  claimedItem: { fontFamily: FontFamily.outfitSemiBold, fontSize: FontSize.sm },
  successBtns: { alignSelf: 'stretch', gap: Spacing.sm, marginTop: Spacing.sm },
});
