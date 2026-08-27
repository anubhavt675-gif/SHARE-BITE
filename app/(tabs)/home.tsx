// ShareBite — Home Screen (Role-aware: Donor + NGO)

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { HandDrawnSeparator, WaxSeal } from '../../components/ui/BotanicalDetails';
import { DonationsService } from '../../services/donations';
import { ImpactService } from '../../services/impact';
import { LocationService } from '../../services/location';
import { NotificationsService } from '../../services/notifications';
import { supabase } from '../../lib/supabase';
import { Donation, ImpactStats } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

const { width } = Dimensions.get('window');

// ─── Donor Home ───────────────────────────────────────────────────────────────

function DonorHome() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [dons, imp, unread] = await Promise.all([
        DonationsService.getMyDonations(user?.id ?? ''),
        ImpactService.getUserImpact(user?.id ?? '', 'donor'),
        user?.id ? NotificationsService.getUnreadCount(user.id) : Promise.resolve(0),
      ]);
      setDonations(dons);
      setImpact(imp);
      setUnreadCount(unread);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>ShareBite</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color={theme.colors.text} />
              {unreadCount > 0 && <View style={[styles.notifDot, { backgroundColor: Colors.primary }]} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Avatar name={user?.name ?? 'U'} size={34} showVerified={user?.isVerified} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Give good food another table.
        </Text>
        <HandDrawnSeparator />

        {/* Hero Banner */}
        <Card style={styles.heroBanner} padding={18}>
          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroSerifTitle, { color: theme.colors.text }]}>
                Surplus to Someone's Table
              </Text>
              <Text style={[styles.heroBody, { color: theme.colors.textSecondary }]}>
                Have extra food from your kitchen or event? Share it with local community groups in just a few taps.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/donor/create-donation')}
                style={styles.heroCTA}
                activeOpacity={0.8}
              >
                <Text style={styles.heroCTAText}>SHARE THE MEAL →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroImgWrap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200' }}
                style={styles.heroThumb}
                resizeMode="cover"
              />
              <WaxSeal size={30} style={styles.heroWaxSeal} />
            </View>
          </View>
        </Card>
      </View>

      {/* ── Your Impact ── */}
      {impact && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR CONTRIBUTIONS</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>The Table's Impact</Text>
          <View style={[styles.statsBand, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {[
              { value: impact.mealsSaved.toLocaleString(), label: 'MEALS RESCUED', color: Colors.primary },
              { value: `${impact.foodRedistributedKg}kg`, label: 'SURPLUS SHARED', color: Colors.accent },
              { value: impact.peopleReached.toLocaleString(), label: 'PEOPLE FED', color: Colors.textPrimary },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={[styles.statsDivider, { backgroundColor: theme.colors.border }]} />}
                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          <Text style={[styles.impactQuote, { color: theme.colors.textSecondary }]}>
            "You helped keep {impact.mealsSaved} meals on the table this month."
          </Text>
        </View>
      )}

      {/* ── Today's Offerings ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RESCUE OPPORTUNITIES</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Offerings</Text>
        <Text style={[styles.sectionQuote, { color: theme.colors.textSecondary }]}>
          "Good food deserves another table."
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offeringsRow}
        >
          {donations.length > 0 ? donations.slice(0, 5).map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/donor/${item.id}`)}
              style={[styles.offeringCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              activeOpacity={0.88}
            >
              <Image
                source={{ uri: item.imageUrl ?? 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' }}
                style={styles.offeringImg}
                resizeMode="cover"
              />
              <View style={styles.offeringInfo}>
                <Text style={styles.offeringCategory}>{item.food.category.toUpperCase()}</Text>
                <Text style={[styles.offeringName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.food.name}
                </Text>
                <Text style={[styles.offeringOrg, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {item.donor.organizationName ?? item.donor.name}
                </Text>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={[styles.emptyOfferingsText, { color: theme.colors.textTertiary }]}>
              Browse the Rescue Feed to view all items.
            </Text>
          )}
        </ScrollView>
      </View>

      {/* ── Community Map ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionLabel}>LOCAL CIRCLE</Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Our Community</Text>
          </View>
          <View style={[styles.estBadge, { borderColor: theme.colors.text, backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.estText, { color: theme.colors.text }]}>EST. 2023</Text>
          </View>
        </View>
        <CommunityMapCard />
      </View>

      {/* ── Community Impact Card ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>COMMUNITY IMPACT</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Every Meal Matters</Text>
        <Card style={styles.impactCard} padding={18}>
          <View style={styles.impactCardRow}>
            <Ionicons name="leaf-outline" size={28} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[styles.impactCardTitle, { color: theme.colors.text }]}>
                Real food. Real people. Real impact.
              </Text>
              <Text style={[styles.impactCardBody, { color: theme.colors.textSecondary }]}>
                Every donation you make goes directly to verified local NGOs and community kitchens — zero waste, maximum reach.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* ── Recent Donations ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionLabel}>HISTORY</Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Surplus</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/donor/my-donations')}>
            <Text style={styles.seeAll}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <DonationCardSkeleton />
            <DonationCardSkeleton />
          </>
        ) : donations.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No donations yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Your first donation is one tap away!
            </Text>
          </View>
        ) : (
          donations.slice(0, 3).map(donation => (
            <DonationCard
              key={donation.id}
              donation={donation}
              onPress={() => router.push(`/donor/${donation.id}`)}
              showDistance={false}
            />
          ))
        )}
      </View>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

// ─── NGO Home ─────────────────────────────────────────────────────────────────

function NGOHome() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const latRef = useRef(28.6139);
  const lngRef = useRef(77.2090);

  const lastRealtimeFetch = useRef(0);

  const loadData = useCallback(async () => {
    try {
      const [loc, unread] = await Promise.all([
        LocationService.getCurrentLocation(),
        user?.id ? NotificationsService.getUnreadCount(user.id) : Promise.resolve(0),
      ]);
      const lat = loc?.latitude ?? 28.6139;
      const lng = loc?.longitude ?? 77.2090;
      latRef.current = lat;
      lngRef.current = lng;
      const dons = await DonationsService.getNearbyDonations(lat, lng);
      setDonations(dons);
      setUnreadCount(unread);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Realtime subscription — throttled to max once per 5 seconds
  useEffect(() => {
    const channel = supabase
      .channel('home-food-listings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'food_listings' },
        async () => {
          const now = Date.now();
          if (now - lastRealtimeFetch.current < 5000) return;
          lastRealtimeFetch.current = now;
          const dons = await DonationsService.getNearbyDonations(latRef.current, lngRef.current);
          setDonations(dons);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  // Memoize derived stats — avoid recalculating on every render
  const availableCount = useMemo(
    () => donations.filter(d => d.status === 'AVAILABLE').length,
    [donations],
  );
  const urgentCount = useMemo(
    () => donations.filter(d => d.freshnessStatus === 'URGENT').length,
    [donations],
  );
  const totalServings = useMemo(
    () => donations.reduce((acc, d) => acc + d.servings, 0),
    [donations],
  );

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* ── Rescue Feed Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>Rescue Feed</Text>
          <View style={styles.headerActions}>
            {user?.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                <Text style={[styles.verifiedText, { color: theme.colors.text }]}>Verified Partner</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color={theme.colors.text} />
              {unreadCount > 0 && <View style={[styles.notifDot, { backgroundColor: Colors.primary }]} />}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Fresh food from local tables.
        </Text>
        <HandDrawnSeparator />

        {/* Stats Panel */}
        <View style={[styles.statsBand, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{availableCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>AVAILABLE</Text>
          </View>
          <View style={[styles.statsDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: urgentCount > 0 ? Colors.error : theme.colors.text }]}>
              {urgentCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>URGENT</Text>
          </View>
          <View style={[styles.statsDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalServings}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>SERVINGS</Text>
          </View>
        </View>
      </View>

      {/* ── Today's Offerings ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CURATED DAILY</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Offerings</Text>
        <Text style={[styles.sectionQuote, { color: theme.colors.textSecondary }]}>
          "Good food deserves another table."
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offeringsRow}
        >
          {donations.slice(0, 5).map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/ngo/${item.id}`)}
              style={[styles.offeringCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              activeOpacity={0.88}
            >
              <Image
                source={{ uri: item.imageUrl ?? 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' }}
                style={styles.offeringImg}
                resizeMode="cover"
              />
              <View style={styles.offeringInfo}>
                <Text style={styles.offeringCategory}>{item.food.category.toUpperCase()}</Text>
                <Text style={[styles.offeringName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.food.name}
                </Text>
                <Text style={[styles.offeringOrg, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {item.donor.organizationName ?? item.donor.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Community Map ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionLabel}>LOCAL CIRCLE</Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Our Community</Text>
          </View>
          <View style={[styles.estBadge, { borderColor: theme.colors.text, backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.estText, { color: theme.colors.text }]}>EST. 2023</Text>
          </View>
        </View>
        <CommunityMapCard />
      </View>

      {/* ── How It Works ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>From Listing to Table</Text>
        {[
          { icon: 'search-outline' as const, label: 'Discover', desc: 'Browse available food donations near you in real time.' },
          { icon: 'bookmark-outline' as const, label: 'Reserve', desc: 'Claim servings and set a pickup window with the donor.' },
          { icon: 'bicycle-outline' as const, label: 'Collect', desc: 'Pick up the food and confirm via the app — zero paperwork.' },
        ].map((step, i) => (
          <View
            key={step.label}
            style={[styles.howItWorksRow, { borderColor: theme.colors.border }]}
          >
            <View style={[styles.howItWorksIcon, { backgroundColor: `${Colors.primary}14` }]}>
              <Ionicons name={step.icon} size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.howItWorksLabel, { color: theme.colors.text }]}>{step.label}</Text>
              <Text style={[styles.howItWorksDesc, { color: theme.colors.textSecondary }]}>{step.desc}</Text>
            </View>
            <Text style={[styles.stepNumber, { color: theme.colors.border }]}>{`0${i + 1}`}</Text>
          </View>
        ))}
      </View>

      {/* ── Nearby Feed ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionLabel}>RESIDENT SURPLUS</Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nearby Tables</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/discover')}
            style={[styles.mapViewBtn, { borderColor: theme.colors.text, backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.mapViewText, { color: theme.colors.text }]}>MAP VIEW</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <DonationCardSkeleton />
            <DonationCardSkeleton />
            <DonationCardSkeleton />
          </>
        ) : donations.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No food nearby yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Check again soon — new donations appear anytime!
            </Text>
          </View>
        ) : (
          donations.map(donation => (
            <DonationCard
              key={donation.id}
              donation={donation}
              onPress={() => router.push(`/ngo/${donation.id}`)}
              onClaim={() => router.push(`/ngo/claim-confirmation?id=${donation.id}`)}
              showDistance
            />
          ))
        )}
      </View>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

// ─── Community Map Card (memoized — static SVG, never needs to re-render) ─────

const CommunityMapCard = React.memo(function CommunityMapCard() {
  const { theme } = useTheme();
  return (
    <Card style={styles.mapCard} padding={0} variant="elevated">
      <View style={styles.mapContainer}>
        <Svg height="150" width="100%" style={StyleSheet.absoluteFill}>
          <Path
            d="M 30 30 Q 160 10, 170 75 T 330 120"
            fill="none"
            stroke={Colors.border}
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <Path
            d="M 60 130 C 140 115, 180 55, 280 20"
            fill="none"
            stroke={Colors.border}
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <Path
            d="M 200 20 Q 260 60, 240 100 T 340 140"
            fill="none"
            stroke={Colors.border}
            strokeWidth="1"
            strokeDasharray="2 5"
          />
        </Svg>

        {/* Animated pulse nodes — no hardcoded names, just visual activity indicators */}
        {[
          { top: 22,  left: 28,   color: Colors.primary },
          { top: 60,  right: 24,  color: Colors.accent  },
          { bottom: 18, left: 50, color: Colors.yellow  },
          { bottom: 42, right: 55, color: Colors.primary },
        ].map((pin, i) => (
          <View
            key={i}
            style={[
              styles.mapPulse,
              {
                backgroundColor: `${(pin as any).color}22`,
                borderColor: `${(pin as any).color}55`,
                top: (pin as any).top,
                left: (pin as any).left,
                right: (pin as any).right,
                bottom: (pin as any).bottom,
              },
            ]}
          >
            <View style={[styles.mapPulseDot, { backgroundColor: (pin as any).color }]} />
          </View>
        ))}

        <View style={styles.mapLegend}>
          <View style={[styles.mapLegendDot, { backgroundColor: Colors.primary }]} />
          <Text style={[styles.mapLegendText, { color: theme.colors.textTertiary }]}>Active donors & NGOs near you</Text>
        </View>

        <WaxSeal size={36} style={styles.mapWax} />
      </View>
    </Card>
  );
});

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isNGO = user?.role === 'ngo';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {isNGO ? <NGOHome /> : <DonorHome />}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingBottom: 30 },

  // ── Header ──
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  brandTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['4xl'] - 2,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginTop: 1,
    marginBottom: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  verifiedText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },

  // ── Hero Banner (Donor) ──
  heroBanner: {
    marginTop: Spacing.sm,
  },
  heroContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroSerifTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * 1.25,
    marginBottom: Spacing.sm,
  },
  heroBody: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    lineHeight: (FontSize.xs + 1) * 1.5,
    marginBottom: Spacing.md,
  },
  heroCTA: {
    alignSelf: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primary,
    paddingBottom: 2,
  },
  heroCTAText: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  heroImgWrap: {
    width: 78,
    position: 'relative',
  },
  heroThumb: {
    width: 78,
    height: 96,
    borderRadius: Radius.xs,
  },
  heroWaxSeal: {
    position: 'absolute',
    bottom: -10,
    right: -8,
  },

  // ── Stats Band ──
  statsBand: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'] + 2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    marginVertical: 6,
  },
  impactQuote: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
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
    marginBottom: 2,
  },
  sectionQuote: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // ── Offerings Horizontal ──
  offeringsRow: {
    gap: Spacing.md,
    paddingVertical: 4,
  },
  offeringCard: {
    width: 148,
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  offeringImg: {
    width: 148,
    height: 100,
  },
  offeringInfo: {
    padding: Spacing.sm,
  },
  offeringCategory: {
    fontSize: 8,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.8,
    color: Colors.primary,
    marginBottom: 3,
  },
  offeringName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  offeringOrg: {
    fontFamily: FontFamily.interRegular,
    fontSize: 9,
  },
  emptyOfferingsText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    paddingVertical: Spacing.xl,
  },

  // ── Community Map ──
  mapCard: {
    overflow: 'hidden',
  },
  mapContainer: {
    height: 150,
    position: 'relative',
  },
  // Pulse node — circle with dot, no fake labels
  mapPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mapLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mapLegendText: {
    fontSize: 8,
    fontFamily: FontFamily.interRegular,
    fontStyle: 'italic',
  },
  mapWax: {
    position: 'absolute',
    top: 10,
    right: 12,
  },
  estBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    transform: [{ rotate: '-2.5deg' }],
  },
  estText: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: 8,
    letterSpacing: 0.5,
  },

  // ── Impact Info Card (Donor) ──
  impactCard: {
    marginTop: Spacing.sm,
  },
  impactCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  impactCardTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.base,
    marginBottom: Spacing.xs,
  },
  impactCardBody: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    lineHeight: 17,
  },

  // ── How It Works (NGO) ──
  howItWorksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  howItWorksIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howItWorksLabel: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.base,
    marginBottom: 2,
  },
  howItWorksDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  stepNumber: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'],
    letterSpacing: -1,
    flexShrink: 0,
  },

  // ── Empty Card ──
  emptyCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  emptyTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg,
    marginBottom: Spacing.xs,
  },
  emptySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── NGO Map View Button ──
  mapViewBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  mapViewText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.5,
  },
});
