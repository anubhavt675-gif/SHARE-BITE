// ShareBite — DonationCard Component

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Donation } from '../../types';
import { StatusChip } from '../ui/StatusChip';
import { FontFamily, FontSize } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { Colors } from '../../constants/colors';
import { FOOD_CATEGORIES } from '../../services/mock-data';

interface DonationCardProps {
  donation: Donation;
  onPress: () => void;
  onClaim?: () => void;
  showDistance?: boolean;
  compact?: boolean;
}

function formatPickupTime(expiresAt: string): string {
  return new Date(expiresAt).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function DonationCard({
  donation,
  onPress,
  onClaim,
  showDistance = true,
}: DonationCardProps) {
  const { theme, isDark } = useTheme();
  const categoryInfo = FOOD_CATEGORIES.find(c => c.key === donation.food.category);

  const isUrgent = donation.freshnessStatus === 'URGENT';
  const isExpired =
    donation.freshnessStatus === 'EXPIRED' || donation.status === 'EXPIRED';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: isUrgent ? Colors.error : theme.colors.border,
        },
        isDark ? Shadow.dark : Shadow.sm,
      ]}
    >
      {/* Food Image */}
      <View style={styles.imageContainer}>
        {donation.imageUrl ? (
          <Image
            source={{ uri: donation.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: Colors.surfaceVariant },
            ]}
          >
            {/* Category initial letter instead of emoji for editorial feel */}
            <Text style={styles.placeholderLetter}>
              {categoryInfo?.label?.charAt(0).toUpperCase() ?? 'F'}
            </Text>
          </View>
        )}

        {/* Veg/Non-veg FSSAI-style indicator */}
        <View
          style={[
            styles.vegBadge,
            {
              borderColor: donation.food.isVegetarian
                ? Colors.success
                : Colors.error,
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          <View
            style={[
              styles.vegDot,
              {
                backgroundColor: donation.food.isVegetarian
                  ? Colors.success
                  : Colors.error,
              },
            ]}
          />
        </View>

        {/* Urgent ribbon */}
        {isUrgent && (
          <View style={styles.urgentTag}>
            <Text style={styles.urgentTagText}>URGENT</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category + Food Name */}
        <View style={styles.nameBlock}>
          <Text style={styles.categoryText}>
            {categoryInfo?.label?.toUpperCase() ?? 'FOOD'}
          </Text>
          <Text
            style={[styles.foodName, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {donation.food.name}
          </Text>
          <Text
            style={[styles.orgName, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {donation.donor.organizationName ?? donation.donor.name}
          </Text>
        </View>

        {/* Meta information */}
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Ionicons
              name="people-outline"
              size={10}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
              {donation.servings} servings
            </Text>
            {showDistance && donation.distanceKm && (
              <>
                <Text style={[styles.metaDot, { color: theme.colors.textTertiary }]}>·</Text>
                <Ionicons
                  name="location-outline"
                  size={10}
                  color={theme.colors.textTertiary}
                />
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                  {donation.distanceKm} km
                </Text>
              </>
            )}
          </View>
          <Text
            style={[
              styles.timeText,
              { color: isUrgent ? Colors.error : theme.colors.textTertiary },
            ]}
          >
            Until {formatPickupTime(donation.expiresAt)}
          </Text>
        </View>

        {/* Footer — Status + CTA */}
        <View style={styles.footer}>
          <StatusChip
            status={donation.freshnessStatus}
            label={
              donation.freshnessStatus === 'FRESH'
                ? 'Available'
                : donation.freshnessStatus === 'PICKUP_SOON'
                ? 'Pickup Soon'
                : donation.freshnessStatus
            }
          />
          {onClaim && donation.status === 'AVAILABLE' && !isExpired ? (
            <TouchableOpacity
              onPress={onClaim}
              style={[styles.claimBtn, { borderColor: Colors.primary }]}
              activeOpacity={0.82}
            >
              <Text style={styles.claimText}>RESCUE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onPress} style={styles.viewBtn}>
              <Text style={[styles.viewText, { color: Colors.primary }]}>
                VIEW →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    position: 'relative',
  },
  image: {
    width: 100,
    height: '100%',
  },
  imagePlaceholder: {
    width: 100,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  placeholderLetter: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: 28,
    color: Colors.textTertiary,
  },
  vegBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 13,
    height: 13,
    borderRadius: 2,
    borderWidth: 1.2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgentTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.error,
    paddingVertical: 3,
    alignItems: 'center',
  },
  urgentTagText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  nameBlock: {
    marginBottom: Spacing.xs,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1,
    color: Colors.primary,
    marginBottom: 3,
  },
  foodName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.25,
    marginBottom: 3,
  },
  orgName: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  metaBlock: {
    gap: 3,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  metaDot: {
    fontSize: FontSize.xs,
    marginHorizontal: 1,
  },
  timeText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  claimBtn: {
    borderWidth: 1,
    borderRadius: Radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  claimText: {
    color: Colors.primary,
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  viewBtn: {
    paddingVertical: 4,
  },
  viewText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.5,
  },
});
