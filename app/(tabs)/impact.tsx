// ShareBite — Impact Dashboard Screen

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { ImpactService } from '../../services/impact';
import { ImpactStats } from '../../types';
import { MOCK_COMMUNITY_IMPACT } from '../../services/mock-data';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

const { width } = Dimensions.get('window');

// Animated number counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { theme } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    animValue.addListener(({ value: v }) => setDisplayValue(Math.round(v)));
    return () => animValue.removeAllListeners();
  }, [value]);

  return (
    <Text style={[styles.metricValue, { color: Colors.primary }]}>
      {displayValue.toLocaleString()}{suffix}
    </Text>
  );
}

interface MetricCardProps {
  icon: string;
  emoji: string;
  title: string;
  value: number;
  suffix?: string;
  subtitle?: string;
  gradient?: readonly [string, string];
}

function MetricCard({ icon, emoji, title, value, suffix, subtitle, gradient }: MetricCardProps) {
  const { theme, isDark } = useTheme();
  return (
    <Card style={[styles.metricCard, isDark ? Shadow.dark : Shadow.md]} padding={16}>
      <View style={[styles.metricIcon, { backgroundColor: Colors.primaryAlpha10 }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <AnimatedNumber value={value} suffix={suffix} />
      <Text style={[styles.metricTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.metricSub, { color: theme.colors.textTertiary }]}>{subtitle}</Text>
      )}
    </Card>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const { theme } = useTheme();
  const progress = Math.min(value / max, 1);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const barWidth = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.progressValue, { color: color }]}>{value.toLocaleString()}</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Animated.View
          style={[styles.progressFill, { width: barWidth, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

export default function ImpactScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isNGO = user?.role === 'ngo';

  useEffect(() => {
    ImpactService.getUserImpact(user?.id ?? '', user?.role ?? 'donor').then(data => {
      setImpact(data);
      setLoading(false);
    });
  }, [user]);

  const community = MOCK_COMMUNITY_IMPACT;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Banner */}
        <LinearGradient
          colors={isDark ? [Colors.surfaceDark ?? '#1A2E1F', '#0F1A14'] : Colors.gradientHero}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTag}>🌍 Your Impact</Text>
          <Text style={styles.heroTitle}>
            {impact ? impact.mealsSaved.toLocaleString() : '—'}
          </Text>
          <Text style={styles.heroSubtitle}>Meals Saved</Text>
          <Text style={styles.heroCopy}>
            Every meal counts. Keep going!
          </Text>

          {/* SDG Badges */}
          <View style={styles.sdgRow}>
            {['SDG 2', 'SDG 12', 'SDG 13'].map(sdg => (
              <View key={sdg} style={styles.sdgBadge}>
                <Text style={styles.sdgText}>{sdg}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Personal Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {isNGO ? 'Food Rescued' : 'Food Donated'}
          </Text>

          <View style={styles.metricsGrid}>
            {impact && (
              <>
                <MetricCard
                  emoji="🍽️"
                  icon="restaurant"
                  title="Meals Saved"
                  value={impact.mealsSaved}
                />
                <MetricCard
                  emoji="📦"
                  icon="cube"
                  title="Food Distributed"
                  value={impact.foodRedistributedKg}
                  suffix="kg"
                />
                <MetricCard
                  emoji="👥"
                  icon="people"
                  title="People Reached"
                  value={impact.peopleReached}
                />
                <MetricCard
                  emoji="🌱"
                  icon="leaf"
                  title="CO₂ Prevented"
                  value={impact.co2SavedKg}
                  suffix="kg"
                  subtitle="Equivalent to driving 250km less"
                />
              </>
            )}
          </View>
        </View>

        {/* Community Impact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🌏 Community Impact
          </Text>

          <Card style={[isDark ? Shadow.dark : Shadow.md]} padding={Spacing.lg}>
            <View style={styles.communityHeader}>
              <View>
                <Text style={[styles.communityTitle, { color: theme.colors.text }]}>
                  ShareBite Network
                </Text>
                <Text style={[styles.communitySub, { color: theme.colors.textSecondary }]}>
                  This month's collective impact
                </Text>
              </View>
              <View style={[styles.badgeCircle, { backgroundColor: Colors.primaryAlpha10 }]}>
                <Ionicons name="globe-outline" size={24} color={Colors.primary} />
              </View>
            </View>

            <View style={styles.communityStats}>
              {[
                { label: 'Active Donors', value: community.activeDonors, color: Colors.primary },
                { label: 'Partner NGOs', value: community.activeNGOs, color: Colors.accent },
                { label: 'Cities Covered', value: community.citiesCovered, color: Colors.yellow },
              ].map(stat => (
                <View key={stat.label} style={styles.communityStat}>
                  <Text style={[styles.communityStatValue, { color: stat.color }]}>
                    {stat.value.toLocaleString()}
                  </Text>
                  <Text style={[styles.communityStatLabel, { color: theme.colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <ProgressBar
              label="Meals this month"
              value={community.thisMonthMeals}
              max={20000}
              color={Colors.primary}
            />
            <View style={{ height: Spacing.sm }} />
            <ProgressBar
              label="Food redistributed (kg)"
              value={community.foodRedistributedKg}
              max={50000}
              color={Colors.accent}
            />
            <View style={{ height: Spacing.sm }} />
            <ProgressBar
              label="CO₂ saved (kg)"
              value={community.co2SavedKg}
              max={100000}
              color={Colors.yellow}
            />
          </Card>
        </View>

        {/* SDG Alignment */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🎯 SDG Alignment
          </Text>
          <View style={styles.sdgCards}>
            {[
              { sdg: 'SDG 2', icon: '🌾', title: 'Zero Hunger', desc: 'Redirecting surplus food to hungry communities via NGOs.' },
              { sdg: 'SDG 12', icon: '♻️', title: 'Responsible Consumption', desc: 'Preventing food waste by enabling timely redistribution.' },
              { sdg: 'SDG 13', icon: '🌍', title: 'Climate Action', desc: 'Reducing methane emissions from food decomposing in landfills.' },
            ].map(item => (
              <Card key={item.sdg} style={[isDark ? Shadow.dark : Shadow.sm, { marginBottom: Spacing.sm }]} padding={14}>
                <View style={styles.sdgCardHeader}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                  <View style={[styles.sdgTag, { backgroundColor: Colors.primaryAlpha10 }]}>
                    <Text style={[styles.sdgTagText, { color: Colors.primary }]}>{item.sdg}</Text>
                  </View>
                </View>
                <Text style={[styles.sdgCardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.sdgCardDesc, { color: theme.colors.textSecondary }]}>{item.desc}</Text>
              </Card>
            ))}
          </View>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing['2xl'] },
  // Hero
  heroBanner: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: Spacing.xl,
  },
  heroTag: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    color: '#fff',
    fontFamily: FontFamily.outfitBlack,
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
    marginBottom: Spacing.sm,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    marginBottom: Spacing.lg,
  },
  sdgRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sdgBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sdgText: {
    color: '#fff',
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
  },
  // Sections
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.lg,
    marginBottom: Spacing.base,
  },
  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    width: (width - Spacing.xl * 2 - Spacing.sm) / 2 - 1,
    alignItems: 'center',
    gap: 6,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['3xl'],
    letterSpacing: -0.5,
  },
  metricTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  metricSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.4,
  },
  // Community
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  communityTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.lg,
  },
  communitySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  badgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityStats: {
    flexDirection: 'row',
    marginBottom: Spacing.base,
  },
  communityStat: { flex: 1, alignItems: 'center' },
  communityStatValue: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
  },
  communityStatLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0EDE5',
    marginBottom: Spacing.base,
  },
  // Progress
  progressRow: { marginBottom: Spacing.sm },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.sm,
  },
  progressValue: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  // SDG Cards
  sdgCards: {},
  sdgCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sdgTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  sdgTagText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
  },
  sdgCardTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.md,
    marginBottom: 4,
  },
  sdgCardDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
