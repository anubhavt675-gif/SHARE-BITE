// ShareBite — Live Pickup Tracking Screen

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { DonationsService } from '../../services/donations';
import { Donation, DonationStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

const TIMELINE_STEPS = [
  { status: 'AVAILABLE', label: 'Surplus Shared', description: 'Donor listed surplus food on ShareBite.' },
  { status: 'CLAIMED', label: 'Reservation Claimed', description: 'NGO requested the food reservation.' },
  { status: 'PICKUP_CONFIRMED', label: 'Pickup Ready', description: 'Donor confirmed food is packed and ready.' },
  { status: 'PICKED_UP', label: 'Collected', description: 'NGO picked up the food from the donor.' },
  { status: 'COMPLETED', label: 'Completed', description: 'Food rescued and distributed to the community.' },
];

export default function PickupTrackingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadData = async () => {
    try {
      let queryId = id;
      if (!queryId && user) {
        // Fallback: Fetch latest reservation for user
        const { data: res } = await supabase
          .from('reservations')
          .select('food_listing_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (res) {
          queryId = res.food_listing_id;
        }
      }

      if (queryId) {
        const data = await DonationsService.getDonationById(queryId);
        setDonation(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [id, user]);

  const handleUpdateStatus = async (nextStatus: DonationStatus) => {
    if (!donation) return;
    setUpdating(true);
    try {
      const success = await DonationsService.updateDonationStatus(donation.id, nextStatus);
      if (success) {
        setDonation(prev => prev ? { ...prev, status: nextStatus } : prev);
        Alert.alert('Success', `Status updated to ${nextStatus.replace('_', ' ')}.`);
        if (nextStatus === 'COMPLETED') {
          router.replace('/(tabs)/impact');
        }
      } else {
        Alert.alert('Error', 'Failed to update status.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorWrap}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>No active pickups found.</Text>
          <Button label="Discover Food" onPress={() => router.replace('/(tabs)/discover')} size="md" />
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.status === donation.status);
  const activeStepIndex = currentStepIndex === -1 ? 1 : currentStepIndex;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pickup Tracking</Text>
          <Text style={styles.donationName}>{donation.food.name}</Text>
          <View style={styles.statusPill}>
            <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.statusText}>{donation.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* ETA Card */}
        <View style={styles.etaRow}>
          <Card style={styles.etaCard} padding={12}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={[styles.etaValue, { color: Colors.primary }]}>
              {new Date(donation.expiresAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Text>
            <Text style={[styles.etaLabel, { color: theme.colors.textSecondary }]}>Scheduled Limit</Text>
          </Card>
          <Card style={styles.etaCard} padding={12}>
            <Ionicons name="location-outline" size={20} color={Colors.accent} />
            <Text style={[styles.etaValue, { color: Colors.accent }]}>{donation.distanceKm ?? '1.2'} km</Text>
            <Text style={[styles.etaLabel, { color: theme.colors.textSecondary }]}>Distance</Text>
          </Card>
          <Card style={styles.etaCard} padding={12}>
            <Ionicons name="people-outline" size={20} color={Colors.yellow} />
            <Text style={[styles.etaValue, { color: Colors.yellow }]}>{donation.servings}</Text>
            <Text style={[styles.etaLabel, { color: theme.colors.textSecondary }]}>Servings</Text>
          </Card>
        </View>

        {/* Donor Info */}
        <Card style={styles.donorCard} padding={16}>
          <View style={styles.donorRow}>
            <View style={[styles.donorIcon, { backgroundColor: Colors.primaryAlpha08 }]}>
              <Text style={[styles.donorLetter, { color: Colors.primary }]}>
                {donation.donor.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.donorName, { color: theme.colors.text }]}>
                {donation.donor.organizationName || donation.donor.name}
              </Text>
              <Text style={[styles.donorAddress, { color: theme.colors.textSecondary }]}>
                {donation.pickupLocation.address}
              </Text>
            </View>
          </View>
        </Card>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pickup Timeline</Text>
          {TIMELINE_STEPS.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isActive = index === activeStepIndex;
            const isPending = index > activeStepIndex;
            const isLast = index === TIMELINE_STEPS.length - 1;

            return (
              <View key={step.status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineCircle,
                      {
                        backgroundColor: isCompleted
                          ? Colors.primary
                          : isActive
                          ? Colors.primary
                          : theme.colors.surfaceVariant,
                        borderColor: isCompleted || isActive ? Colors.primary : theme.colors.border,
                        borderWidth: isActive ? 3 : 2,
                      },
                    ]}
                  >
                    {isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
                    {isActive && (
                      <Animated.View style={[styles.activeDot, { transform: [{ scale: pulseAnim }] }]} />
                    )}
                  </View>
                  {!isLast && (
                    <View style={[styles.timelineLine, { backgroundColor: isCompleted ? Colors.primary : theme.colors.border }]} />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      {
                        color: isPending ? theme.colors.textTertiary : theme.colors.text,
                        fontFamily: isActive ? FontFamily.outfitBold : FontFamily.outfitSemiBold,
                      },
                    ]}
                  >
                    {step.label}
                    {isActive && ' (Active)'}
                  </Text>
                  <Text style={[styles.timelineDesc, { color: isPending ? theme.colors.textTertiary : theme.colors.textSecondary }]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {donation.status === 'CLAIMED' && (
            <Button
              label={updating ? 'Confirming...' : 'Mark as Ready for Pickup'}
              onPress={() => handleUpdateStatus('PICKUP_CONFIRMED')}
              variant="primary"
              size="lg"
              isLoading={updating}
            />
          )}
          {donation.status === 'PICKUP_CONFIRMED' && (
            <Button
              label={updating ? 'Loading...' : 'Mark as Collected / Picked Up'}
              onPress={() => handleUpdateStatus('PICKED_UP')}
              variant="primary"
              size="lg"
              isLoading={updating}
            />
          )}
          {donation.status === 'PICKED_UP' && (
            <Button
              label={updating ? 'Completing...' : 'Mark as Rescue Completed'}
              onPress={() => handleUpdateStatus('COMPLETED')}
              variant="primary"
              size="lg"
              isLoading={updating}
            />
          )}
          {donation.status === 'COMPLETED' && (
            <Text style={[styles.completeText, { color: Colors.accent }]}>✓ This rescue is fully completed.</Text>
          )}
          <Button
            label="Cancel Reservation"
            onPress={() => handleUpdateStatus('CANCELLED')}
            variant="outline"
            size="md"
            disabled={donation.status === 'COMPLETED' || updating}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  donationName: {
    color: '#fff',
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'],
    marginBottom: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.xs,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  etaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  etaCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  etaValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.md,
  },
  etaLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: 9,
    textAlign: 'center',
  },
  donorCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  donorIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  donorLetter: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg,
  },
  donorName: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm + 1,
  },
  donorAddress: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  timelineSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg,
    marginBottom: Spacing.base,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineCircle: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  activeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 5,
  },
  timelineLine: {
    width: 1, flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.base,
  },
  timelineLabel: {
    fontSize: FontSize.sm,
  },
  timelineDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  completeText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
  errorWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.xl, gap: Spacing.md, marginTop: 80,
  },
  errorText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
});
