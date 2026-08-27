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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/ui/Avatar';
import { HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

interface SettingRowProps {
  iconName: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
  isLast?: boolean;
}

function SettingRow({
  iconName, label, value, onPress,
  isSwitch, switchValue, onSwitchChange,
  danger, isLast,
}: SettingRowProps) {
  const { theme } = useTheme();
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.75 : 1}
        style={styles.settingRow}
        disabled={!onPress && !isSwitch}
        accessibilityRole={isSwitch ? 'switch' : 'button'}
        accessibilityLabel={label}
      >
        <Ionicons
          name={iconName as any}
          size={17}
          color={danger ? Colors.error : theme.colors.textSecondary}
          style={styles.settingIcon}
        />
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
              trackColor={{ false: Colors.border, true: Colors.primaryAlpha20 }}
              thumbColor={switchValue ? Colors.primary : '#EEEAD8'}
            />
          )}
          {!isSwitch && onPress && (
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textTertiary} />
          )}
        </View>
      </TouchableOpacity>
      {!isLast && <View style={[styles.sep, { backgroundColor: theme.colors.divider }]} />}
    </>
  );
}

interface SettingsGroupProps {
  label: string;
  children: React.ReactNode;
}

function SettingsGroup({ label, children }: SettingsGroupProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.groupLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
      <View style={[styles.groupCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, setThemeMode } = useTheme();
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

        {/* ── Profile Header Card ── */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {/* Avatar + Edit */}
          <View style={styles.avatarWrap}>
            <Avatar name={user?.name ?? 'U'} size={72} showVerified={user?.isVerified} />
            <TouchableOpacity
              onPress={() => router.push('/profile/edit')}
              style={[styles.editBtn, { backgroundColor: Colors.primary }]}
            >
              <Ionicons name="pencil" size={11} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={[styles.profileName, { color: theme.colors.text }]}>{user?.name}</Text>
          {isNGO && (user as any).organizationName && (
            <Text style={[styles.profileOrg, { color: theme.colors.textSecondary }]}>
              {(user as any).organizationName}
            </Text>
          )}

          {/* Role + Verification badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.rolePill, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
              <Text style={[styles.rolePillText, { color: theme.colors.textSecondary }]}>
                {isNGO ? 'NGO Partner' : user?.role === 'household' ? 'Household' : 'Local Donor'}
              </Text>
            </View>
            {user?.isVerified && (
              <View style={[styles.verifiedPill, { backgroundColor: Colors.primaryAlpha08 }]}>
                <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                <Text style={[styles.verifiedPillText, { color: Colors.primary }]}>Verified</Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={11} color={theme.colors.textTertiary} />
            <Text style={[styles.locationText, { color: theme.colors.textTertiary }]}>
              {user?.location?.city ?? 'New Delhi'}
            </Text>
          </View>
        </View>

        {/* ── Verification Banner ── */}
        {user?.verificationStatus !== 'verified' && (
          <TouchableOpacity
            onPress={() => router.push('/profile/verification')}
            style={[styles.verifyBanner, { backgroundColor: Colors.yellowAlpha20, borderColor: Colors.yellow }]}
          >
            <Ionicons name="shield-outline" size={18} color={Colors.yellow} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.verifyTitle, { color: theme.colors.text }]}>
                Complete Verification
              </Text>
              <Text style={[styles.verifySub, { color: theme.colors.textSecondary }]}>
                Get verified to build trust with partners
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* ── Impact Stats ── */}
        <View style={styles.statsSection}>
          <Text style={styles.statsLabel}>IMPACT SUMMARY</Text>
          <View style={[styles.statsRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {(isNGO ? [
              { value: '183', label: 'RESCUES' },
              { value: '8.7K', label: 'MEALS' },
              { value: '4.9', label: 'RATING' },
            ] : [
              { value: '47', label: 'LISTINGS' },
              { value: '1.2K', label: 'MEALS' },
              { value: '4.8', label: 'RATING' },
            ]).map((stat, i, arr) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={[styles.statsDivider, { backgroundColor: theme.colors.border }]} />}
                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Editorial callout */}
          <View style={[styles.callout, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.calloutText, { color: theme.colors.textSecondary }]}>
              {isNGO
                ? '"You helped rescue 8,750 meals for the community this season."'
                : '"You helped keep 1,240 meals on the table this season."'
              }
            </Text>
          </View>
        </View>

        {/* ── Settings ── */}
        <SettingsGroup label="ACCOUNT">
          <SettingRow iconName="person-outline" label="Edit Profile" onPress={() => router.push('/profile/edit')} />
          <SettingRow iconName="shield-checkmark-outline" label="Verification" value={user?.verificationStatus ?? 'Pending'} onPress={() => router.push('/profile/verification')} />
          <SettingRow iconName="location-outline" label="Location" value={user?.location?.city ?? 'Not set'} onPress={() => {}} isLast />
        </SettingsGroup>

        <SettingsGroup label="PREFERENCES">
          <SettingRow
            iconName="moon-outline"
            label="Dark Mode"
            isSwitch
            switchValue={isDark}
            onSwitchChange={val => setThemeMode(val ? 'dark' : 'light')}
          />
          <SettingRow iconName="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
          <SettingRow iconName="settings-outline" label="Settings" onPress={() => router.push('/profile/settings')} isLast />
        </SettingsGroup>

        <SettingsGroup label="SUPPORT">
          <SettingRow iconName="help-circle-outline" label="Help & Support" onPress={() => {}} />
          <SettingRow iconName="document-text-outline" label="Privacy Policy" onPress={() => {}} />
          <SettingRow iconName="star-outline" label="Rate ShareBite" onPress={() => {}} isLast />
        </SettingsGroup>

        <View style={styles.settingsSection}>
          <View style={[styles.groupCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <SettingRow iconName="log-out-outline" label="Log Out" onPress={handleLogout} danger isLast />
          </View>
        </View>

        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
          ShareBite v1.0.0 · Share Food. Share Hope.
        </Text>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 20 },

  // Profile card
  profileCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  avatarWrap: {
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  profileName: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'] + 2,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  profileOrg: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  rolePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  rolePillText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  verifiedPillText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },

  // Verify banner
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.sm,
    borderWidth: 1,
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

  // Stats
  statsSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  statsLabel: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1.2,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.sm,
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
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: 24,
  },
  callout: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  calloutText: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xs + 1,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },

  // Settings
  settingsSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  groupLabel: {
    fontSize: 9,
    fontFamily: FontFamily.outfitBold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  groupCard: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 20,
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
  sep: {
    height: 0.5,
    marginHorizontal: Spacing.base,
  },

  version: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
