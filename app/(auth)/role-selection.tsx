// ShareBite — Role Selection Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';
import { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  icon: string;
  emoji: string;
  title: string;
  subtitle: string;
  features: string[];
  gradient: readonly [string, string];
  accent: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'donor',
    icon: 'restaurant-outline',
    emoji: '🍛',
    title: 'Donate Food',
    subtitle: 'Share surplus food with people who need it.',
    features: ['List food in 2 minutes', 'Real-time NGO matching', 'Track your impact'],
    gradient: Colors.gradientPrimary,
    accent: Colors.primary,
  },
  {
    role: 'ngo',
    icon: 'heart-outline',
    emoji: '🤝',
    title: 'Receive Food',
    subtitle: 'For NGOs and organizations serving communities.',
    features: ['Find nearby donations', 'Claim & coordinate pickup', 'Feed more people'],
    gradient: Colors.gradientAccent,
    accent: Colors.accent,
  },
];

export default function RoleSelectionScreen() {
  const { theme, isDark } = useTheme();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({ pathname: '/(auth)/signup', params: { role: selected } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            style={styles.logoMark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoEmoji}>🍃</Text>
          </LinearGradient>
          <Text style={[styles.heading, { color: theme.colors.text }]}>
            How would you like to{'\n'}use ShareBite?
          </Text>
          <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
            Choose your role to personalize your experience
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cards}>
          {ROLES.map(role => {
            const isSelected = selected === role.role;
            return (
              <TouchableOpacity
                key={role.role}
                onPress={() => setSelected(role.role)}
                activeOpacity={0.9}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isSelected ? role.accent : theme.colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    ...(isDark ? Shadow.dark : Shadow.md),
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${role.title}: ${role.subtitle}`}
              >
                {/* Gradient header strip */}
                <LinearGradient
                  colors={role.gradient}
                  style={styles.cardHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.cardEmoji}>{role.emoji}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    </View>
                  )}
                </LinearGradient>

                <View style={styles.cardBody}>
                  <Text style={[styles.roleTitle, { color: theme.colors.text }]}>{role.title}</Text>
                  <Text style={[styles.roleSubtitle, { color: theme.colors.textSecondary }]}>
                    {role.subtitle}
                  </Text>

                  <View style={styles.features}>
                    {role.features.map(feature => (
                      <View key={feature} style={styles.featureRow}>
                        <View style={[styles.featureDot, { backgroundColor: role.accent }]} />
                        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Household option */}
        <TouchableOpacity
          onPress={() => setSelected('household')}
          style={[
            styles.householdCard,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: selected === 'household' ? Colors.primary : theme.colors.border,
              borderWidth: selected === 'household' ? 1.5 : 1,
            },
          ]}
        >
          <Text style={styles.householdEmoji}>🏠</Text>
          <View style={styles.householdText}>
            <Text style={[styles.householdTitle, { color: theme.colors.text }]}>
              Continue as Household
            </Text>
            <Text style={[styles.householdSub, { color: theme.colors.textSecondary }]}>
              Share extra food from home
            </Text>
          </View>
          {selected === 'household' && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>

        <View style={styles.cta}>
          <Button
            label="Get Started →"
            onPress={handleContinue}
            variant="primary"
            size="xl"
            disabled={!selected}
          />
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginLink}
          >
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              Already registered?{' '}
              <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>
                Log In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'android' ? Spacing['3xl'] : Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoEmoji: { fontSize: 28 },
  heading: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['3xl'],
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: FontSize['3xl'] * 1.25,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  cards: {
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  roleCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cardEmoji: {
    fontSize: 48,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
  },
  cardBody: {
    padding: Spacing.lg,
  },
  roleTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
    marginBottom: Spacing.xs,
  },
  roleSubtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    marginBottom: Spacing.base,
    lineHeight: FontSize.base * 1.5,
  },
  features: {
    gap: Spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
  },
  householdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
    borderWidth: 1,
  },
  householdEmoji: { fontSize: 28 },
  householdText: { flex: 1 },
  householdTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.md,
  },
  householdSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cta: { gap: Spacing.base },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  loginText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
  },
});
