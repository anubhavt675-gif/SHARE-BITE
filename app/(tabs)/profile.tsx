// ShareBite — Profile Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { StatusChip } from '../../components/ui/StatusChip';
import { BotanicalSprig, HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  color?: string;
  danger?: boolean;
}

function SettingRow({ icon, label, value, onPress, isSwitch, switchValue, onSwitchChange, color, danger }: SettingRowProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.settingRow}
      disabled={!onPress && !isSwitch}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      accessibilityLabel={label}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${color ?? Colors.primary}18` }]}>
        <Ionicons
          name={icon as any}
          size={18}
          color={danger ? Colors.error : color ?? Colors.primary}
        />
      </View>
      <Text style={[styles.settingLabel, { color: danger ? Colors.error : theme.colors.text }]}>
        {label}
      </Text>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { color: theme.colors.textTertiary }]}>{value}</Text>
        )}
        {isSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
          />
        )}
        {!isSwitch && onPress && (
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const isNGO = user?.role === 'ngo';

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <View style={styles.avatarContainer}>
            <Avatar name={user?.name ?? 'U'} size={72} showVerified={user?.isVerified} />
            <TouchableOpacity
              onPress={() => router.push('/profile/edit')}
              style={styles.editBtn}
            >
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.profileNameText, { color: theme.colors.text }]}>{user?.name}</Text>
          {isNGO && user?.organizationName && (
            <Text style={[styles.profileOrgText, { color: theme.colors.textSecondary }]}>{user.organizationName}</Text>
          )}

          <View style={styles.badgesRow}>
            <StatusChip status={user?.verificationStatus ?? 'pending'} label={user?.verificationStatus ?? 'Pending'} size="md" />
            <View style={[styles.roleBadge, { borderColor: theme.colors.border, borderWidth: 1 }]}>
              <Text style={[styles.roleBadgeText, { color: theme.colors.textSecondary }]}>
                {isNGO ? '🤝 NGO Partner' : user?.role === 'household' ? '🏠 Household' : '🏪 Local Donor'}
              </Text>
            </View>
          </View>

          <Text style={[styles.profileLocationText, { color: theme.colors.textSecondary }]}>
            <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
            {' '}{user?.location?.city ?? 'New Delhi'}
          </Text>
        </View>

        {/* Verification Banner (if not verified) */}
        {user?.verificationStatus !== 'verified' && (
          <TouchableOpacity
            onPress={() => router.push('/profile/verification')}
            style={[styles.verifyBanner, { backgroundColor: Colors.yellowAlpha20, borderColor: Colors.yellow, borderWidth: 1 }]}
          >
            <Ionicons name="shield-outline" size={20} color={Colors.yellow} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.verifyTitle, { color: theme.colors.text }]}>
                Complete Verification
              </Text>
              <Text style={[styles.verifySub, { color: theme.colors.textSecondary }]}>
                Get verified to build trust with partners
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Quick Stats & Callout */}
        <View style={styles.statsSection}>
          <Text style={styles.statsHeaderLabel}>IMPACT SUMMARY</Text>
          <View style={styles.statsRow}>
            {isNGO ? (
              <>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>183</Text>
                  <Text style={styles.statLabel}>RESCUES</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>8.7K</Text>
                  <Text style={styles.statLabel}>MEALS</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>4.9</Text>
                  <Text style={styles.statLabel}>RATING</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>47</Text>
                  <Text style={styles.statLabel}>LISTINGS</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>1.2K</Text>
                  <Text style={styles.statLabel}>MEALS</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>RATING</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.typographicCallout}>
            <BotanicalSprig size={24} />
            <Text style={styles.calloutText}>
              {isNGO 
                ? `"You helped rescue 8,750 meals for the community this season."`
                : `"You helped keep 1,240 meals on the table this season."`
              }
            </Text>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>ACCOUNT</Text>
          <Card padding={0} variant="outlined">
            <SettingRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => router.push('/profile/edit')}
            />
            <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />
            <SettingRow
              icon="shield-checkmark-outline"
              label="Verification"
              value={user?.verificationStatus ?? 'Pending'}
              onPress={() => router.push('/profile/verification')}
              color={Colors.accent}
            />
            <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />
            <SettingRow
              icon="location-outline"
              label="Location"
              value={user?.location?.city ?? 'Not set'}
              onPress={() => {}}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>PREFERENCES</Text>
          <Card padding={0} variant="outlined">
            <SettingRow
              icon="moon-outline"
              label="Dark Mode"
              isSwitch
              switchValue={isDark}
              onSwitchChange={val => setThemeMode(val ? 'dark' : 'light')}
              color="#6B5CE7"
            />
            <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push('/notifications')}
            />
            <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />
            <SettingRow
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push('/profile/settings')}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>SUPPORT</Text>
          <Card padding={0} variant="outlined">
            <SettingRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {}}
              color={Colors.accent}
            />
            <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />
            <SettingRow
              icon="document-text-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
            <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />
            <SettingRow
              icon="star-outline"
              label="Rate ShareBite"
              onPress={() => {}}
              color={Colors.yellow}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Card padding={0} variant="outlined">
            <SettingRow
              icon="log-out-outline"
              label="Log Out"
              onPress={handleLogout}
              danger
            />
          </Card>
        </View>

        {/* App version */}
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
          ShareBite v1.0.0 • Share Food. Share Hope.
        </Text>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 30 },
  
  // Editorial Profile Header
  profileHeaderCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: '#FAF8F1',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FAF8F1',
  },
  profileNameText: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'] + 2,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileOrgText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    backgroundColor: '#F4F0E6',
  },
  roleBadgeText: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  profileLocationText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  
  // Verification Banner
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.sm,
  },
  verifyTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  verifySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  statsHeaderLabel: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xs,
    backgroundColor: '#FAF8F1',
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl + 2,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 8,
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  typographicCallout: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: '#FAF8F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  calloutText: {
    flex: 1,
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xs + 1,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Settings Layout
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.sm + 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
  },
  sep: { height: 0.5, marginHorizontal: Spacing.base },
  version: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
