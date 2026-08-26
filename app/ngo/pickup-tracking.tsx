// ShareBite — Pickup Tracking Screen

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { PICKUP_TIMELINE_STEPS } from '../../services/mock-data';
import { DonationStatus } from '../../types';

const MOCK_CURRENT_STATUS: DonationStatus = 'CLAIMED';
const MOCK_DONATION_NAME = 'Veg Biryani (25 servings)';
const MOCK_DONOR = 'Sharma Dhaba & Catering';
const MOCK_ADDRESS = '45, Karol Bagh Market, New Delhi';
const MOCK_PICKUP_TIME = '8:45 PM';

export default function PickupTrackingScreen() {
  const { theme, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentStepIndex = PICKUP_TIMELINE_STEPS.findIndex(s => s.status === MOCK_CURRENT_STATUS);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1A2E1F', '#0F1A14'] : Colors.gradientPrimary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pickup Tracking</Text>
          <Text style={styles.donationName}>{MOCK_DONATION_NAME}</Text>
          <View style={styles.statusPill}>
            <Animated.View
              style={[
                styles.statusDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.statusText}>In Progress</Text>
          </View>
        </LinearGradient>

        {/* ETA Card */}
        <View style={styles.etaRow}>
          <Card style={styles.etaCard} padding={16}>
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={[styles.etaValue, { color: Colors.primary }]}>{MOCK_PICKUP_TIME}</Text>
            <Text style={[styles.etaLabel, { color: theme.colors.textSecondary }]}>
              Scheduled Pickup
            </Text>
          </Card>
          <Card style={styles.etaCard} padding={16}>
            <Ionicons name="location-outline" size={24} color={Colors.accent} />
            <Text style={[styles.etaValue, { color: Colors.accent }]}>1.2 km</Text>
            <Text style={[styles.etaLabel, { color: theme.colors.textSecondary }]}>
              Distance
            </Text>
          </Card>
          <Card style={styles.etaCard} padding={16}>
            <Ionicons name="people-outline" size={24} color={Colors.yellow} />
            <Text style={[styles.etaValue, { color: Colors.yellow }]}>25</Text>
            <Text style={[styles.etaLabel, { color: theme.colors.textSecondary }]}>
              Servings
            </Text>
          </Card>
        </View>

        {/* Donor Info */}
        <Card style={styles.donorCard} padding={16}>
          <View style={styles.donorRow}>
            <View style={[styles.donorIcon, { backgroundColor: Colors.primaryAlpha10 }]}>
              <Text style={{ fontSize: 24 }}>🏪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.donorName, { color: theme.colors.text }]}>{MOCK_DONOR}</Text>
              <Text style={[styles.donorAddress, { color: theme.colors.textSecondary }]}>
                {MOCK_ADDRESS}
              </Text>
            </View>
            <View style={styles.contactBtns}>
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: Colors.primaryAlpha10 }]}>
                <Ionicons name="call" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: Colors.accentAlpha10 }]}>
                <Ionicons name="navigate" size={18} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pickup Timeline</Text>
          {PICKUP_TIMELINE_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            const isLast = index === PICKUP_TIMELINE_STEPS.length - 1;

            return (
              <View key={step.status} style={styles.timelineItem}>
                {/* Connector line */}
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
                    {isCompleted && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                    {isActive && (
                      <Animated.View
                        style={[
                          styles.activeDot,
                          { transform: [{ scale: pulseAnim }] },
                        ]}
                      />
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: isCompleted ? Colors.primary : theme.colors.border,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Content */}
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
                    {isActive && ' ← Current'}
                  </Text>
                  <Text
                    style={[
                      styles.timelineDesc,
                      {
                        color: isPending ? theme.colors.textTertiary : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {step.description}
                  </Text>
                  {isCompleted && (
                    <Text style={[styles.timelineTime, { color: Colors.primary }]}>
                      ✓ Completed
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Mark as Picked Up"
            onPress={() => {}}
            variant="primary"
            size="xl"
          />
          <Button
            label="Report an Issue"
            onPress={() => {}}
            variant="outline"
            size="md"
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
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  donationName: {
    color: '#fff',
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
    marginBottom: Spacing.base,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
  },
  statusText: {
    color: '#fff',
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
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
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.lg,
  },
  etaLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorName: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
  },
  donorAddress: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  contactBtns: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.outfitBold,
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
    width: 28,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.base,
  },
  timelineLabel: {
    fontSize: FontSize.base,
  },
  timelineDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  timelineTime: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
