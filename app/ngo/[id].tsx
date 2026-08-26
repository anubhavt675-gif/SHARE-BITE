// ShareBite — NGO Donation Detail + Claim Screen [id].tsx

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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusChip } from '../../components/ui/StatusChip';
import { DonationsService } from '../../services/donations';
import { Donation } from '../../types';
import { FOOD_CATEGORIES } from '../../services/mock-data';
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
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

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
  const canClaim = donation.status === 'AVAILABLE' && !claimSuccess;

  if (claimSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successWrap}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.successCircle}>
              <Text style={{ fontSize: 52 }}>🎉</Text>
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>Donation Secured!</Text>
          <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
            You've claimed {donation.food.name}. Coordinate pickup with the donor now.
          </Text>
          <View style={[styles.claimedSummary, { backgroundColor: Colors.primaryAlpha10 }]}>
            <Text style={[styles.claimedText, { color: Colors.primary }]}>
              🍽️ {donation.servings} meals · 📍 {donation.distanceKm ?? '?'} km away
            </Text>
          </View>
          <View style={styles.successBtns}>
            <Button
              label="Track Pickup"
              onPress={() => router.replace('/ngo/pickup-tracking')}
              variant="primary"
              size="xl"
            />
            <Button
              label="Find More Donations"
              onPress={() => router.replace('/(tabs)/discover')}
              variant="outline"
              size="lg"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageWrap}>
          {donation.imageUrl ? (
            <Image source={{ uri: donation.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={isDark ? ['#292925', '#1C1C1A'] : [Colors.background, Colors.surfaceVariant]}
              style={styles.imagePlaceholder}
            >
              <Text style={{ fontSize: 80 }}>{cat?.emoji ?? '🍛'}</Text>
            </LinearGradient>
          )}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Urgency banner */}
          {donation.freshnessStatus === 'URGENT' && (
            <View style={styles.urgentBanner}>
              <Text style={styles.urgentText}>⚡ URGENT PICKUP NEEDED</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabelText}>
                {cat?.label ? cat.label.toUpperCase() : 'FOOD SURPLUS'} · {donation.food.isVegetarian ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
              </Text>
              <Text style={[styles.foodName, { color: theme.colors.text }]}>{donation.food.name}</Text>
              <Text style={[styles.orgName, { color: theme.colors.textSecondary }]}>
                from {donation.donor.organizationName ?? donation.donor.name}
              </Text>
            </View>
            <StatusChip status={donation.freshnessStatus} size="md" />
          </View>

          {/* Key info */}
          <View style={styles.keyInfoRow}>
            <View style={[styles.keyInfoCard, { backgroundColor: Colors.primaryAlpha10, borderColor: Colors.primary, borderWidth: 1 }]}>
              <Ionicons name="people" size={16} color={Colors.primary} />
              <Text style={[styles.keyInfoValue, { color: Colors.primary }]}>{donation.servings}</Text>
              <Text style={[styles.keyInfoLabel, { color: theme.colors.textSecondary }]}>PORTIONS</Text>
            </View>
            <View style={[styles.keyInfoCard, { backgroundColor: Colors.accentAlpha10, borderColor: Colors.accent, borderWidth: 1 }]}>
              <Ionicons name="location-sharp" size={16} color={Colors.accent} />
              <Text style={[styles.keyInfoValue, { color: Colors.accent }]}>{donation.distanceKm ?? '?'} km</Text>
              <Text style={[styles.keyInfoLabel, { color: theme.colors.textSecondary }]}>DISTANCE</Text>
            </View>
            <View style={[styles.keyInfoCard, { backgroundColor: Colors.yellowAlpha20, borderColor: Colors.yellow, borderWidth: 1 }]}>
              <Ionicons name="time" size={16} color={Colors.yellow} />
              <Text style={[styles.keyInfoValue, { color: Colors.yellow }]}>
                {hoursLeft > 0 ? `${hoursLeft}h` : `${minutesLeft}m`}
              </Text>
              <Text style={[styles.keyInfoLabel, { color: theme.colors.textSecondary }]}>AVAILABLE</Text>
            </View>
          </View>

          {/* Trust Banner */}
          <View style={[styles.trustBanner, { backgroundColor: '#FAF8F1', borderColor: Colors.border, borderWidth: 1 }]}>
            <BotanicalSprig size={28} />
            <Text style={[styles.trustText, { color: theme.colors.textSecondary }]}>
              "By rescuing this meal, you're helping prevent good food from going to waste."
            </Text>
          </View>

          {/* Donor info */}
          <Card style={styles.donorCard} padding={14}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>THE DONOR</Text>
            <View style={styles.donorRow}>
              <View style={[styles.donorAvatar, { backgroundColor: Colors.primaryAlpha20 }]}>
                <Text style={{ fontSize: 20 }}>🏪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.donorName, { color: theme.colors.text }]}>
                  {donation.donor.organizationName ?? donation.donor.name}
                </Text>
                {donation.donor.isVerified && (
                  <View style={styles.verifiedRow}>
                    <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                    <Text style={[styles.verifiedText, { color: Colors.primary }]}>Verified Local Donor</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={[styles.callBtn, { backgroundColor: Colors.primaryAlpha10 }]}>
                <Ionicons name="call" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Details */}
          <Card style={styles.detailsCard} padding={14}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>LISTING DETAILS</Text>
            {[
              { label: 'Pickup Location', value: donation.pickupLocation.address },
              { label: 'Packaging Type', value: donation.packagingType },
              { label: 'Prepared At', value: formatDate(donation.preparedAt) },
              { label: 'Rescue Before', value: formatDate(donation.expiresAt) },
            ].map(item => (
              <View key={item.label} style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </Card>

          {donation.notes && (
            <Card style={{ marginBottom: Spacing.base }} padding={14}>
              <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>DONOR NOTES</Text>
              <Text style={[styles.notesText, { color: theme.colors.text }]}>{donation.notes}</Text>
            </Card>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>


      {/* CTA */}
      {canClaim && (
        <View style={[styles.ctaArea, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <Button
            label="Rescue This Food 🙌"
            onPress={() => setShowClaimModal(true)}
            variant="primary"
            size="xl"
          />
        </View>
      )}

      {/* Claim Confirmation Modal */}
      <Modal visible={showClaimModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalEmoji}>🤝</Text>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Ready to rescue this food?
            </Text>
            <View style={[styles.claimDetails, { backgroundColor: Colors.primaryAlpha10 }]}>
              <Text style={[styles.claimDetailItem, { color: Colors.primary }]}>
                🍽️ {donation.servings} meals
              </Text>
              <Text style={[styles.claimDetailItem, { color: Colors.primary }]}>
                📍 {donation.distanceKm ?? '?'} km away
              </Text>
              <Text style={[styles.claimDetailItem, { color: Colors.primary }]}>
                ⏰ Pickup before {new Date(donation.expiresAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
            </View>
            <View style={styles.modalBtns}>
              <Button
                label="Confirm Claim"
                onPress={handleClaim}
                variant="primary"
                size="xl"
                isLoading={claiming}
              />
              <Button
                label="Cancel"
                onPress={() => setShowClaimModal(false)}
                variant="ghost"
                size="md"
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
  urgentBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.error,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  urgentText: {
    color: '#fff',
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
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
  keyInfoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  keyInfoCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.sm,
    gap: 2,
  },
  keyInfoValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg + 1,
  },
  keyInfoLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.base,
  },
  trustText: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    lineHeight: FontSize.xs * 1.4,
  },
  donorCard: { marginBottom: Spacing.base },
  cardLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  donorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorName: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  verifiedText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: { marginBottom: Spacing.base },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 0.8,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    flex: 1,
  },
  detailValue: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    flex: 1.5,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  notesText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.5,
    marginTop: 4,
  },
  ctaArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    marginBottom: Spacing.xl,
  },
  modalEmoji: { fontSize: 52, marginBottom: Spacing.base },
  modalTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  claimDetails: {
    width: '100%',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  claimDetailItem: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
  },
  modalBtns: { width: '100%', gap: Spacing.sm },
  // Success
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.base,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['4xl'],
    letterSpacing: -1,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: FontSize.lg * 1.5,
  },
  claimedSummary: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  claimedText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  successBtns: { width: '100%', gap: Spacing.sm, marginTop: Spacing.base },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontFamily: FontFamily.outfitBold, fontSize: FontSize.xl },
});
