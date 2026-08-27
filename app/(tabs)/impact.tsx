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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { ImpactService } from '../../services/impact';
import { ImpactStats } from '../../types';
import { MOCK_COMMUNITY_IMPACT } from '../../services/mock-data';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

const { width } = Dimensions.get('window');

// ── Animated editorial number ─────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const id = animValue.addListener(({ value: v }) => setDisplayValue(Math.round(v)));
    Animated.timing(animValue, {
      toValue: value,
      duration: 1100,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(id);
  }, [value]);

  return <>{displayValue.toLocaleString()}{suffix}</>;
}

// ── Metric card ───────────────────────────────────────────────────────────────
interface MetricProps {
  iconName: string;
  title: string;
  value: number;
  suffix?: string;
  subtitle?: string;
  accentColor: string;
}

function MetricCard({ iconName, title, value, suffix, subtitle, accentColor }: MetricProps) {
  const { theme, isDark } = useTheme();
  return (
    <Card style={[styles.metricCard, isDark ? Shadow.dark : Shadow.sm]} padding={Spacing.base}>
      <View style={[styles.metricIconWrap, { backgroundColor: `${accentColor}12` }]}>
        <Ionicons name={iconName as any} size={18} color={accentColor} />
      </View>
      <Text style={[styles.metricValue, { color: accentColor }]}>
        <AnimatedNumber value={value} suffix={suffix} />
      </Text>
      <Text style={[styles.metricTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.metricSub, { color: theme.colors.textTertiary }]}>{subtitle}</Text>
      )}
    </Card>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const { theme } = useTheme();
  const animWidth = useRef(new Animated.Value(0)).current;
  const progress = Math.min(value / max, 1);

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const barWidth = animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.progressValueText, { color: color }]}>{value.toLocaleString()}</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Animated.View style={[styles.progressFill, { width: barWidth, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── Milestone badge ───────────────────────────────────────────────────────────
function MilestoneBadge({ title, desc, earned }: { title: string; desc: string; earned: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.milestone,
      {
        backgroundColor: theme.colors.surface,
        borderColor: earned ? Colors.primary : theme.colors.border,
        opacity: earned ? 1 : 0.55,
      },
    ]}>
      <View style={[styles.milestoneDot, { backgroundColor: earned ? Colors.primary : theme.colors.border }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.milestoneTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.milestoneSub, { color: theme.colors.textSecondary }]}>{desc}</Text>
      </View>
      {earned && (
        <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ImpactScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isNGO = user?.role === 'ngo';
  const community = MOCK_COMMUNITY_IMPACT;

  useEffect(() => {
    ImpactService.getUserImpact(user?.id ?? '', user?.role ?? 'donor').then(data => {
      setImpact(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Editorial Header ── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>YOUR IMPACT</Text>
          <View style={styles.heroNumberRow}>
            <Text style={[styles.heroNumber, { color: theme.colors.text }]}>
              {impact ? impact.mealsSaved.toLocaleString() : '—'}
            </Text>
            <View style={styles.heroMeta}>
              <Text style={[styles.heroUnit, { color: theme.colors.textSecondary }]}>
                Meals{'\n'}Rescued
              </Text>
            </View>
          </View>
          <Text style={[styles.heroCaption, { color: theme.colors.textSecondary }]}>
            Small actions. Fewer wasted meals.
          </Text>
          <HandDrawnSeparator />

          {/* SDG Indicators — minimal */}
          <View style={styles.sdgRow}>
            {['SDG 2 · Zero Hunger', 'SDG 12 · Responsible Consumption', 'SDG 13 · Climate Action'].map(sdg => (
              <View key={sdg} style={[styles.sdgTag, { borderColor: theme.colors.border }]}>
                <Text style={[styles.sdgTagText, { color: theme.colors.textTertiary }]}>{sdg}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Personal Metrics ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{isNGO ? 'FOOD RESCUED' : 'FOOD DONATED'}</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {isNGO ? 'Your Rescue Record' : 'Your Donations'}
          </Text>
          <View style={styles.metricsGrid}>
            {impact && (
              <>
                <MetricCard
                  iconName="restaurant-outline"
                  title="Meals Saved"
                  value={impact.mealsSaved}
                  accentColor={Colors.primary}
                />
                <MetricCard
                  iconName="cube-outline"
                  title="Food Shared"
                  value={impact.foodRedistributedKg}
                  suffix="kg"
                  accentColor={Colors.accent}
                />
                <MetricCard
                  iconName="people-outline"
                  title="People Reached"
                  value={impact.peopleReached}
                  accentColor={Colors.textPrimary}
                />
                <MetricCard
                  iconName="leaf-outline"
                  title="CO₂ Reduced"
                  value={impact.co2SavedKg}
                  suffix="kg"
                  subtitle="~250km less driven"
                  accentColor={Colors.accent}
                />
              </>
            )}
          </View>
        </View>

        {/* ── Milestones ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MILESTONES</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Journey</Text>
          <View style={styles.milestonesCol}>
            <MilestoneBadge title="First Meal Shared" desc="You made your first food donation" earned={true} />
            <MilestoneBadge title="10 Meals Rescued" desc="Reached your first 10 meal milestone" earned={(impact?.mealsSaved ?? 0) >= 10} />
            <MilestoneBadge title="50 Servings" desc="50 servings of food kept from waste" earned={(impact?.mealsSaved ?? 0) >= 50} />
            <MilestoneBadge title="Community Pillar" desc="100+ meals shared with the community" earned={(impact?.mealsSaved ?? 0) >= 100} />
          </View>
        </View>

        {/* ── Community Impact ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NETWORK</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Community Impact</Text>

          <Card style={isDark ? Shadow.dark : Shadow.sm} padding={Spacing.lg}>
            <View style={styles.communityHeader}>
              <View>
                <Text style={[styles.communityTitle, { color: theme.colors.text }]}>
                  ShareBite Network
                </Text>
                <Text style={[styles.communitySub, { color: theme.colors.textSecondary }]}>
                  This month's collective
                </Text>
              </View>
              <View style={[styles.globeCircle, { backgroundColor: Colors.primaryAlpha12 }]}>
                <Ionicons name="globe-outline" size={20} color={Colors.primary} />
              </View>
            </View>

            <View style={styles.communityStats}>
              {[
                { label: 'Active Donors', value: community.activeDonors, color: Colors.primary },
                { label: 'Partner NGOs',  value: community.activeNGOs,   color: Colors.accent },
                { label: 'Cities',        value: community.citiesCovered, color: Colors.textPrimary },
              ].map(stat => (
                <View key={stat.label} style={styles.commStat}>
                  <Text style={[styles.commStatValue, { color: stat.color }]}>
                    {stat.value.toLocaleString()}
                  </Text>
                  <Text style={[styles.commStatLabel, { color: theme.colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            <ProgressBar label="Meals this month"         value={community.thisMonthMeals}       max={20000} color={Colors.primary} />
            <View style={{ height: Spacing.sm }} />
            <ProgressBar label="Food redistributed (kg)"  value={community.foodRedistributedKg}  max={50000} color={Colors.accent} />
            <View style={{ height: Spacing.sm }} />
            <ProgressBar label="CO₂ saved (kg)"           value={community.co2SavedKg}           max={100000} color={Colors.textSecondary} />
          </Card>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing['2xl'] },

  // ── Page Header ──
  pageHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  pageLabel: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1.2,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  heroNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  heroNumber: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  heroMeta: {
    marginBottom: 8,
  },
  heroUnit: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  heroCaption: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  sdgRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sdgTag: {
    borderWidth: 1,
    borderRadius: Radius.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  sdgTagText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1.2,
    color: Colors.primary,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl + 1,
    letterSpacing: 0.2,
    marginBottom: Spacing.md,
  },

  // ── Metrics Grid ──
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
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: FontFamily.serifDisplay,
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

  // ── Milestones ──
  milestonesCol: {
    gap: Spacing.sm,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  milestoneTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  milestoneSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },

  // ── Community ──
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  communityTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg,
    marginBottom: 2,
  },
  communitySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  globeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityStats: {
    flexDirection: 'row',
    marginBottom: Spacing.base,
  },
  commStat: { flex: 1, alignItems: 'center' },
  commStatValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.3,
  },
  commStatLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.base,
    marginTop: Spacing.xs,
  },

  // ── Progress ──
  progressRow: { marginBottom: Spacing.xs },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  progressValueText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
});
