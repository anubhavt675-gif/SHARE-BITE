// ShareBite — Donation Success Screen

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

const { width } = Dimensions.get('window');

export default function DonationSuccessScreen() {
  const { theme, isDark } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#0F1A14', '#1A2E1F'] : Colors.gradientCard}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Animated checkmark */}
          <Animated.View style={[styles.iconCircle, { transform: [{ scale }] }]}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={{ fontSize: 60 }}>🎉</Text>
            </LinearGradient>
          </Animated.View>

          {/* Text */}
          <Animated.View style={{ opacity, transform: [{ translateY: slideUp }] }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Food Shared!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Your donation is now live. Nearby NGOs{'\n'}are being notified right now! 🌱
            </Text>

            {/* Impact estimate */}
            <View style={[styles.impactCard, { backgroundColor: Colors.primaryAlpha10 }]}>
              <Text style={[styles.impactTitle, { color: Colors.primary }]}>
                Estimated Impact
              </Text>
              <View style={styles.impactRow}>
                {[
                  { value: '~20', label: 'Meals', emoji: '🍽️' },
                  { value: '5 kg', label: 'Saved', emoji: '♻️' },
                  { value: '2.5kg', label: 'CO₂', emoji: '🌍' },
                ].map(item => (
                  <View key={item.label} style={styles.impactItem}>
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                    <Text style={[styles.impactValue, { color: Colors.primary }]}>{item.value}</Text>
                    <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Timeline */}
            <View style={[styles.timelineCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>What happens next?</Text>
              {[
                { step: '1', text: 'Nearby NGOs are notified instantly', done: true },
                { step: '2', text: 'An NGO claims your donation', done: false },
                { step: '3', text: 'Pickup is coordinated', done: false },
                { step: '4', text: 'Food reaches people in need 🌟', done: false },
              ].map(item => (
                <View key={item.step} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineStep,
                      { backgroundColor: item.done ? Colors.primary : Colors.primaryAlpha10 },
                    ]}
                  >
                    <Text style={[styles.timelineStepText, { color: item.done ? '#fff' : Colors.primary }]}>
                      {item.step}
                    </Text>
                  </View>
                  <Text style={[styles.timelineText, { color: theme.colors.textSecondary }]}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* CTAs */}
        <Animated.View style={[styles.ctas, { opacity }]}>
          <Button
            label="View My Donation"
            onPress={() => router.replace('/donor/my-donations')}
            variant="primary"
            size="xl"
          />
          <Button
            label="Go to Home"
            onPress={() => router.replace('/(tabs)/home')}
            variant="outline"
            size="lg"
          />
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  iconCircle: {
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['5xl'],
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: FontSize.lg * 1.6,
    marginBottom: Spacing.xl,
  },
  impactCard: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
  },
  impactTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: { alignItems: 'center', gap: 4 },
  impactValue: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xl,
  },
  impactLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  timelineCard: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  timelineTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.base,
    marginBottom: Spacing.base,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timelineStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineStepText: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.sm,
  },
  timelineText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    flex: 1,
  },
  ctas: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
});
