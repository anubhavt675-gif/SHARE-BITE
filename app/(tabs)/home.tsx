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
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { DonationCardSkeleton } from '../../components/ui/SkeletonLoader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { StatusChip } from '../../components/ui/StatusChip';
import { BotanicalSprig, WaxSeal, HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { DonationsService } from '../../services/donations';
import { ImpactService } from '../../services/impact';
import { Donation, ImpactStats } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';
import { MOCK_COMMUNITY_IMPACT } from '../../services/mock-data';

const { width } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Donor Home ───────────────────────────────────────────────────────────────

function DonorHome() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
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

  const quickActions = [
    { icon: 'add-circle-outline', label: 'Donate Food', color: Colors.primary, route: '/donor/create-donation' },
    { icon: 'list-outline', label: 'My Donations', color: Colors.accent, route: '/donor/my-donations' },
    { icon: 'bicycle-outline', label: 'Pickup Status', color: Colors.yellow, route: '/ngo/pickup-tracking' },
    { icon: 'leaf-outline', label: 'My Impact', color: '#1976D2', route: '/(tabs)/impact' },
  ] as const;

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
      {/* Header Area */}
      <View style={styles.editorialHeader}>
        <View style={styles.editorialTopRow}>
          <Text style={styles.editorialBrand}>ShareBite</Text>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.editorialIconBtn}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <View style={styles.editorialNotifDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Avatar name={user?.name ?? 'U'} size={34} showVerified={user?.isVerified} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.editorialSubheading}>Give good food another table.</Text>
        <HandDrawnSeparator />

        {/* Hero Card */}
        <Card style={styles.magazineHeroCard} padding={20}>
          <View style={styles.heroLayout}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroSerifTitle}>Surplus to Surplus</Text>
              <Text style={styles.heroSansBody}>Have extra food from your kitchen or event? Share it with local community groups in just a few taps.</Text>
              <TouchableOpacity
                onPress={() => router.push('/donor/create-donation')}
                style={styles.heroEditorialBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.heroEditorialBtnText}>SHARE THE MEAL →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroImageColumn}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' }} 
                style={styles.heroThumb}
                resizeMode="cover"
              />
              <WaxSeal size={32} style={styles.heroWaxSeal} />
            </View>
          </View>
        </Card>
      </View>

      {/* Your Impact */}
      {impact && (
        <View style={styles.section}>
          <Text style={styles.sectionLabelText}>YOUR CONTRIBUTIONS</Text>
          <Text style={styles.sectionSerifTitle}>The Table's Impact</Text>
          <View style={styles.impactRow}>
            {[
              { value: impact.mealsSaved.toLocaleString(), label: 'Meals Rescued', color: Colors.primary },
              { value: `${impact.foodRedistributedKg}kg`, label: 'Surplus Shared', color: Colors.accent },
              { value: impact.peopleReached.toLocaleString(), label: 'People Fed', color: Colors.yellow },
            ].map(item => (
              <Card key={item.label} style={styles.editorialImpactCard} padding={12}>
                <Text style={styles.impactCardValue}>{item.value}</Text>
                <Text style={styles.impactCardLabel}>{item.label.toUpperCase()}</Text>
              </Card>
            ))}
          </View>
          <Text style={styles.impactNoticeText}>
            "You helped keep {impact.mealsSaved} meals on the table this month."
          </Text>
        </View>
      )}

      {/* Today's Offerings from Local Kitchens */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelText}>RESCUE OPPORTUNITIES</Text>
        <Text style={styles.sectionSerifTitle}>Today's Offerings</Text>
        <Text style={styles.sectionEditorialDesc}>"Good food deserves another table."</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOfferings}>
          {donations.length > 0 ? donations.slice(0, 3).map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/donor/${item.id}`)}
              style={[styles.offeringCard, { backgroundColor: theme.colors.card }]}
            >
              <Image 
                source={{ uri: item.imageUrl ?? 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' }} 
                style={styles.offeringImg} 
              />
              <View style={styles.offeringDetails}>
                <Text style={styles.offeringCategory}>{item.food.category.toUpperCase()}</Text>
                <Text style={styles.offeringName} numberOfLines={1}>{item.food.name}</Text>
                <Text style={styles.offeringOrg} numberOfLines={1}>{item.donor.organizationName ?? item.donor.name}</Text>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.noOfferingsText}>Browse the Rescue Feed to view all items.</Text>
          )}
        </ScrollView>
      </View>

      {/* Illustrated Community Map */}
      <View style={styles.section}>
        <View style={styles.sectionSerifHeader}>
          <View>
            <Text style={styles.sectionLabelText}>LOCAL CIRCLE</Text>
            <Text style={styles.sectionSerifTitle}>Our Community</Text>
          </View>
          <View style={styles.estBadge}>
            <Text style={styles.estBadgeText}>EST. 2023</Text>
          </View>
        </View>
        <Card style={styles.illustratedMapCard} padding={0}>
          <View style={styles.mapContainer}>
            {/* Draw a stylized illustrated route with dotted lines */}
            <Svg height="140" width="100%">
              <Path
                d="M 30 30 Q 150 10, 160 70 T 320 110"
                fill="none"
                stroke={Colors.border}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <Path
                d="M 60 120 C 130 110, 170 50, 270 20"
                fill="none"
                stroke={Colors.border}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </Svg>
            
            {/* Visual location labels/pins absolutely positioned on the illustrated map */}
            <View style={[styles.mapPin, { top: 20, left: 30 }]}>
              <View style={styles.mapPinCircle} />
              <Text style={styles.mapPinLabel}>The Daily Knead</Text>
            </View>
            <View style={[styles.mapPin, { top: 60, right: 30 }]}>
              <View style={[styles.mapPinCircle, { backgroundColor: Colors.accent }]} />
              <Text style={styles.mapPinLabel}>Farmer Josh</Text>
            </View>
            <View style={[styles.mapPin, { bottom: 15, left: 50 }]}>
              <View style={[styles.mapPinCircle, { backgroundColor: Colors.yellow }]} />
              <Text style={styles.mapPinLabel}>City Mission</Text>
            </View>
            <View style={[styles.mapPin, { bottom: 40, right: 60 }]}>
              <View style={styles.mapPinCircle} />
              <Text style={styles.mapPinLabel}>Community Kitchen</Text>
            </View>
            <WaxSeal size={32} style={styles.mapWax} />
          </View>
        </Card>
      </View>

      {/* Community Stories */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelText}>LIFESTYLE & IMPACT</Text>
        <Text style={styles.sectionSerifTitle}>Community Stories</Text>
        <View style={styles.storiesGrid}>
          {[
            {
              id: 'story_1',
              title: "How a local café rescued 42 meals today",
              image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400',
            },
            {
              id: 'story_2',
              title: "From kitchen surplus to family dinner",
              image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
            }
          ].map(story => (
            <View key={story.id} style={styles.storyCard}>
              <Image source={{ uri: story.image }} style={styles.storyImg} />
              <Text style={styles.storyTitle}>{story.title}</Text>
              <TouchableOpacity style={styles.storyLink}>
                <Text style={styles.storyLinkText}>CONNECT →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelText}>QUICK NAVIGATION</Text>
        <Text style={styles.sectionSerifTitle}>Direct Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={[styles.quickAction, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              activeOpacity={0.85}
            >
              <Ionicons name={action.icon as any} size={18} color={action.color} />
              <Text style={[styles.qaLabel, { color: theme.colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Donations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabelText}>HISTORY</Text>
            <Text style={styles.sectionSerifTitle}>Recent Surplus</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/donor/my-donations')}>
            <Text style={[styles.seeAll, { color: Colors.primary }]}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <DonationCardSkeleton />
            <DonationCardSkeleton />
          </>
        ) : donations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No donations yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Your first donation is one tap away!
            </Text>
          </Card>
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

      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

// ─── NGO Home ─────────────────────────────────────────────────────────────────

function NGOHome() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const dons = await DonationsService.getNearbyDonations(28.6139, 77.2090);
      setDonations(dons);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const availableCount = donations.filter(d => d.status === 'AVAILABLE').length;
  const urgentCount = donations.filter(d => d.freshnessStatus === 'URGENT').length;

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
      {/* Header Area */}
      <View style={styles.editorialHeader}>
        <View style={styles.editorialTopRow}>
          <Text style={styles.editorialBrand}>Rescue Feed</Text>
          <View style={styles.topBarRight}>
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                <Text style={styles.verifiedText}>Verified Partner</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.editorialIconBtn}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <View style={styles.editorialNotifDot} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.editorialSubheading}>Fresh food from local tables.</Text>
        <HandDrawnSeparator />

        {/* Stats Row */}
        <View style={styles.tactileStatsRow}>
          <View style={styles.tactileStat}>
            <Text style={styles.tactileStatValue}>{availableCount}</Text>
            <Text style={styles.tactileStatLabel}>AVAILABLE</Text>
          </View>
          <View style={styles.tactileStatDivider} />
          <View style={styles.tactileStat}>
            <Text style={[styles.tactileStatValue, urgentCount > 0 && { color: Colors.error }]}>
              {urgentCount}
            </Text>
            <Text style={styles.tactileStatLabel}>URGENT</Text>
          </View>
          <View style={styles.tactileStatDivider} />
          <View style={styles.tactileStat}>
            <Text style={styles.tactileStatValue}>
              {donations.reduce((acc, d) => acc + d.servings, 0)}
            </Text>
            <Text style={styles.tactileStatLabel}>SERVINGS</Text>
          </View>
        </View>
      </View>

      {/* Today's Offerings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelText}>CURATED DAILY</Text>
        <Text style={styles.sectionSerifTitle}>Today's Offerings</Text>
        <Text style={styles.sectionEditorialDesc}>"Good food deserves another table."</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOfferings}>
          {donations.slice(0, 3).map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/ngo/${item.id}`)}
              style={[styles.offeringCard, { backgroundColor: theme.colors.card }]}
            >
              <Image 
                source={{ uri: item.imageUrl ?? 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' }} 
                style={styles.offeringImg} 
              />
              <View style={styles.offeringDetails}>
                <Text style={styles.offeringCategory}>{item.food.category.toUpperCase()}</Text>
                <Text style={styles.offeringName} numberOfLines={1}>{item.food.name}</Text>
                <Text style={styles.offeringOrg} numberOfLines={1}>{item.donor.organizationName ?? item.donor.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Illustrated Community Map */}
      <View style={styles.section}>
        <View style={styles.sectionSerifHeader}>
          <View>
            <Text style={styles.sectionLabelText}>LOCAL CIRCLE</Text>
            <Text style={styles.sectionSerifTitle}>Our Community</Text>
          </View>
          <View style={styles.estBadge}>
            <Text style={styles.estBadgeText}>EST. 2023</Text>
          </View>
        </View>
        <Card style={styles.illustratedMapCard} padding={0}>
          <View style={styles.mapContainer}>
            {/* Draw a stylized illustrated route with dotted lines */}
            <Svg height="140" width="100%">
              <Path
                d="M 30 30 Q 150 10, 160 70 T 320 110"
                fill="none"
                stroke={Colors.border}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <Path
                d="M 60 120 C 130 110, 170 50, 270 20"
                fill="none"
                stroke={Colors.border}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </Svg>
            
            {/* Visual location pins */}
            <View style={[styles.mapPin, { top: 20, left: 30 }]}>
              <View style={styles.mapPinCircle} />
              <Text style={styles.mapPinLabel}>The Daily Knead</Text>
            </View>
            <View style={[styles.mapPin, { top: 60, right: 30 }]}>
              <View style={[styles.mapPinCircle, { backgroundColor: Colors.accent }]} />
              <Text style={styles.mapPinLabel}>Farmer Josh</Text>
            </View>
            <View style={[styles.mapPin, { bottom: 15, left: 50 }]}>
              <View style={[styles.mapPinCircle, { backgroundColor: Colors.yellow }]} />
              <Text style={styles.mapPinLabel}>City Mission</Text>
            </View>
            <View style={[styles.mapPin, { bottom: 40, right: 60 }]}>
              <View style={styles.mapPinCircle} />
              <Text style={styles.mapPinLabel}>Community Kitchen</Text>
            </View>
            <WaxSeal size={32} style={styles.mapWax} />
          </View>
        </Card>
      </View>

      {/* Community Stories */}
      <View style={styles.section}>
        <Text style={styles.sectionLabelText}>LIFESTYLE & IMPACT</Text>
        <Text style={styles.sectionSerifTitle}>Community Stories</Text>
        <View style={styles.storiesGrid}>
          {[
            {
              id: 'story_1',
              title: "How a local café rescued 42 meals today",
              image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400',
            },
            {
              id: 'story_2',
              title: "From kitchen surplus to family dinner",
              image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
            }
          ].map(story => (
            <View key={story.id} style={styles.storyCard}>
              <Image source={{ uri: story.image }} style={styles.storyImg} />
              <Text style={styles.storyTitle}>{story.title}</Text>
              <TouchableOpacity style={styles.storyLink}>
                <Text style={styles.storyLinkText}>CONNECT →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Nearby Feed List */}
      <View style={styles.section}>
        <View style={styles.sectionSerifHeader}>
          <View>
            <Text style={styles.sectionLabelText}>RESIDENT SURPLUS</Text>
            <Text style={styles.sectionSerifTitle}>Nearby Tables</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/discover')}
            style={styles.editorialActionBtn}
          >
            <Text style={styles.editorialActionBtnText}>MAP VIEW</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <DonationCardSkeleton />
            <DonationCardSkeleton />
            <DonationCardSkeleton />
          </>
        ) : donations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No food nearby yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Check again soon — new donations appear anytime!
            </Text>
          </Card>
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

      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingBottom: 30 },
  
  // Editorial Header
  editorialHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  editorialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  editorialBrand: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['4xl'] - 2,
    color: Colors.textPrimary,
  },
  editorialSubheading: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: -2,
    marginBottom: Spacing.xs,
  },
  editorialIconBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    backgroundColor: '#FAF8F1',
  },
  editorialNotifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // Magazine Hero Card
  magazineHeroCard: {
    marginTop: Spacing.sm,
    backgroundColor: '#FAF8F1',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  heroLayout: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroSerifTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  heroSansBody: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
    lineHeight: (FontSize.xs + 1) * 1.4,
    marginBottom: Spacing.md,
  },
  heroEditorialBtn: {
    alignSelf: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primary,
    paddingBottom: 2,
  },
  heroEditorialBtnText: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  heroImageColumn: {
    width: 80,
    alignItems: 'center',
    position: 'relative',
  },
  heroThumb: {
    width: 80,
    height: 100,
    borderRadius: Radius.xs,
  },
  heroWaxSeal: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },

  // Tactile Stats Row (NGO)
  tactileStatsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xs,
    backgroundColor: '#FAF8F1',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  tactileStat: {
    flex: 1,
    alignItems: 'center',
  },
  tactileStatValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'] + 2,
    color: Colors.textPrimary,
  },
  tactileStatLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tactileStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    backgroundColor: '#FAF8F1',
  },
  verifiedText: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionLabelText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1,
    color: Colors.primary,
    marginBottom: 2,
  },
  sectionSerifTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl + 1,
    color: Colors.textPrimary,
  },
  sectionSerifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionEditorialDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 1,
    marginBottom: Spacing.sm,
  },
  seeAll: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },

  // Today's Offerings Horizontal
  horizontalOfferings: {
    gap: Spacing.md,
    paddingVertical: 4,
  },
  offeringCard: {
    width: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xs,
    overflow: 'hidden',
  },
  offeringImg: {
    width: 140,
    height: 90,
  },
  offeringDetails: {
    padding: Spacing.sm,
  },
  offeringCategory: {
    fontSize: 8,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.8,
    color: Colors.primary,
    marginBottom: 2,
  },
  offeringName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
  },
  offeringOrg: {
    fontFamily: FontFamily.interRegular,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  noOfferingsText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: Spacing.md,
  },

  // Illustrated Map Card
  illustratedMapCard: {
    backgroundColor: '#FAF8F1',
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#FAF8F1',
  },
  mapPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F0E6',
    borderWidth: 0.8,
    borderColor: Colors.textPrimary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  mapPinCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  mapPinLabel: {
    fontSize: 8,
    fontFamily: FontFamily.outfitBold,
    color: Colors.textPrimary,
  },
  mapWax: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  estBadge: {
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ rotate: '-3deg' }],
    backgroundColor: '#FAF8F1',
  },
  estBadgeText: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: 8,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },

  // Community Stories
  storiesGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  storyCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xs,
    overflow: 'hidden',
    backgroundColor: '#FAF8F1',
  },
  storyImg: {
    width: '100%',
    height: 110,
  },
  storyTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    padding: Spacing.sm,
    lineHeight: (FontSize.xs + 1) * 1.2,
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

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickAction: {
    width: (width - Spacing.xl * 2 - Spacing.sm) / 2 - 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xs,
    borderWidth: 1,
    backgroundColor: '#FAF8F1',
  },
  qaLabel: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs + 1,
    flex: 1,
  },

  // Impact Row (Tactile)
  impactRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  editorialImpactCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FAF8F1',
  },
  impactCardValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg,
    color: Colors.primary,
  },
  impactCardLabel: {
    fontSize: 8,
    fontFamily: FontFamily.outfitBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  impactNoticeText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Empty Card Tactile
  emptyCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    backgroundColor: '#FAF8F1',
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.md,
    marginBottom: Spacing.xs,
  },
  emptySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.4,
  },

  // NGO home feed map view button
  editorialActionBtn: {
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    backgroundColor: '#FAF8F1',
  },
  editorialActionBtnText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.5,
    color: Colors.textPrimary,
  },
});
