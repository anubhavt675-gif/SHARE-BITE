// ShareBite — DonationCard Component

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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

function formatTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function timeAgo(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function DonationCard({
  donation,
  onPress,
  onClaim,
  showDistance = true,
  compact = false,
}: DonationCardProps) {
  const { theme, isDark } = useTheme();
  const categoryInfo = FOOD_CATEGORIES.find(c => c.key === donation.food.category);

  const isUrgent = donation.freshnessStatus === 'URGENT';
  const isExpired = donation.freshnessStatus === 'EXPIRED' || donation.status === 'EXPIRED';

  const isAltLayout = donation.id ? (donation.id.charCodeAt(donation.id.length - 1) % 2 === 0) : false;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: Radius.sm,
          flexDirection: isAltLayout ? 'column' : 'row',
        },
        isUrgent && styles.urgentBorder,
      ]}
    >
      {/* Food Image */}
      <View style={[
        styles.imageContainer,
        {
          width: isAltLayout ? '100%' : 110,
          height: isAltLayout ? 140 : 120,
        }
      ]}>
        {donation.imageUrl ? (
          <Image
            source={{ uri: donation.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: `${categoryInfo?.color}12` }]}>
            <Text style={styles.emoji}>{categoryInfo?.emoji ?? '🍛'}</Text>
          </View>
        )}
        {/* Veg/Non-veg indicator */}
        <View
          style={[
            styles.vegBadge,
            { borderColor: donation.food.isVegetarian ? Colors.success : Colors.error },
          ]}
        >
          <View
            style={[
              styles.vegDot,
              { backgroundColor: donation.food.isVegetarian ? Colors.success : Colors.error },
            ]}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={[styles.categoryText, { color: Colors.primary }]}>
            {categoryInfo?.label ? categoryInfo.label.toUpperCase() : 'FOOD'}
          </Text>
          <View style={styles.headerRow}>
            <Text
              style={[styles.foodName, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {donation.food.name}
            </Text>
          </View>
        </View>

        <Text style={[styles.orgName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {donation.donor.organizationName ?? donation.donor.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {donation.servings} portions · {showDistance && donation.distanceKm ? `${donation.distanceKm} km` : 'Local'}
          </Text>
          <Text
            style={[
              styles.timeText,
              { color: isUrgent ? Colors.error : theme.colors.textSecondary },
            ]}
          >
            Until {new Date(donation.expiresAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </Text>
        </View>

        <View style={styles.footer}>
          <StatusChip status={donation.freshnessStatus} label={donation.freshnessStatus.replace('_', ' ')} />
          {onClaim && donation.status === 'AVAILABLE' && !isExpired ? (
            <TouchableOpacity
              onPress={onClaim}
              style={styles.claimBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.claimText}>[ RESCUE ]</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.detailsLink, { color: Colors.primary }]}>VIEW DETAILS →</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  urgentBorder: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  vegBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    backgroundColor: '#FAF8F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  headerInfo: {
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg - 1,
    lineHeight: FontSize.lg * 1.1,
    flex: 1,
  },
  orgName: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    color: '#54544D',
    marginBottom: 6,
  },
  metaRow: {
    marginBottom: Spacing.sm,
    gap: 2,
  },
  metaText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  timeText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  claimBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  claimText: {
    color: Colors.primary,
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.sm - 1,
    letterSpacing: 0.5,
  },
  detailsLink: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 0.5,
  },
});
