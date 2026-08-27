// ShareBite — Home Screen (Role-aware: Donor + NGO)

import React, { useEffect, useState, useCallback } from 'react';
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

  const loadData = useCallback(async () => {
    try {
      const [dons, imp] = await Promise.all([
        DonationsService.getMyDonations(user?.id ?? ''),
        ImpactService.getUserImpact(user?.id ?? '', 'donor'),
      ]);
      setDonations(dons);
      setImpact(imp);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadData(); }}
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
              <View style={[styles.notifDot, { backgroundColor: Colors.primary }]} />
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
                source={{ uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' }}
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

      {/* ── Community Stories ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LIFESTYLE & IMPACT</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Community Stories</Text>
        <View style={styles.storiesRow}>
          {[
            { id: 's1', title: 'How a local café rescued 42 meals today', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400' },
            { id: 's2', title: 'From kitchen surplus to family dinner', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' },
          ].map(story => (
            <View key={story.id} style={[styles.storyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Image source={{ uri: story.image }} style={styles.storyImg} />
              <Text style={[styles.storyTitle, { color: theme.colors.text }]}>{story.title}</Text>
              <TouchableOpacity style={styles.storyLink}>
                <Text style={styles.storyLinkText}>READ →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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

  const loadData = useCallback(async () => {
    try {
      const loc = await LocationService.getCurrentLocation();
      const lat = loc?.latitude ?? 28.6139;
      const lng = loc?.longitude ?? 77.2090;
      const dons = await DonationsService.getNearbyDonations(lat, lng);
      setDonations(dons);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const availableCount = donations.filter(d => d.status === 'AVAILABLE').length;
  const urgentCount = donations.filter(d => d.freshnessStatus === 'URGENT').length;
  const totalServings = donations.reduce((acc, d) => acc + d.servings, 0);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadData(); }}
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
              <View style={[styles.notifDot, { backgroundColor: Colors.primary }]} />
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

      {/* ── Community Stories ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LIFESTYLE & IMPACT</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Community Stories</Text>
        <View style={styles.storiesRow}>
          {[
            { id: 's1', title: 'How a local café rescued 42 meals today', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400' },
            { id: 's2', title: 'From kitchen surplus to family dinner', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' },
          ].map(story => (
            <View key={story.id} style={[styles.storyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Image source={{ uri: story.image }} style={styles.storyImg} />
              <Text style={[styles.storyTitle, { color: theme.colors.text }]}>{story.title}</Text>
              <TouchableOpacity style={styles.storyLink}>
                <Text style={styles.storyLinkText}>READ →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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

// ─── Community Map Card ───────────────────────────────────────────────────────

function CommunityMapCard() {
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
        </Svg>

        {/* Community node labels */}
        {[
          { label: 'The Daily Knead', top: 18, left: 20, color: Colors.primary },
          { label: 'Farmer Josh',     top: 55, right: 20, color: Colors.accent },
          { label: 'City Mission',    bottom: 14, left: 40, color: Colors.yellow },
          { label: 'Community Kitchen', bottom: 38, right: 50, color: Colors.primary },
        ].map((pin, i) => (
          <View
            key={i}
            style={[
              styles.mapPin,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.text,
                top: pin.top,
                left: (pin as any).left,
                right: (pin as any).right,
                bottom: (pin as any).bottom,
              },
            ]}
          >
            <View style={[styles.mapPinDot, { backgroundColor: pin.color }]} />
            <Text style={[styles.mapPinLabel, { color: theme.colors.text }]}>{pin.label}</Text>
          </View>
        ))}

        <WaxSeal size={36} style={styles.mapWax} />
      </View>
    </Card>
  );
}

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
  mapPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 3,
  },
  mapPinDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mapPinLabel: {
    fontSize: 8,
    fontFamily: FontFamily.outfitSemiBold,
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

  // ── Community Stories ──
  storiesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  storyCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  storyImg: {
    width: '100%',
    height: 110,
  },
  storyTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xs + 1,
    lineHeight: 17,
    padding: Spacing.sm,
  },
  storyLink: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  storyLinkText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    color: Colors.primary,
    letterSpacing: 0.5,
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
