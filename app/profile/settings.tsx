// ShareBite — Settings Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

export default function SettingsScreen() {
  const { theme, isDark, setThemeMode, themeMode } = useTheme();
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>APPEARANCE</Text>
          <Card padding={0} variant="outlined">
            {[
              { label: 'Light Mode', mode: 'light' as const },
              { label: 'Dark Mode', mode: 'dark' as const },
              { label: 'System Default', mode: 'system' as const },
            ].map((item, idx, arr) => (
              <TouchableOpacity
                key={item.mode}
                onPress={() => setThemeMode(item.mode)}
                style={[
                  styles.settingRow,
                  idx < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.colors.divider },
                ]}
              >
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
                {themeMode === item.mode && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>NOTIFICATIONS</Text>
          <Card padding={0} variant="outlined">
            <View style={[styles.settingRow, { borderBottomWidth: 0.5, borderBottomColor: theme.colors.divider }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Push Notifications</Text>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notifEnabled ? Colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Location Services</Text>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={locationEnabled ? Colors.primary : '#f4f3f4'}
              />
            </View>
          </Card>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>DATA & PRIVACY</Text>
          <Card padding={0} variant="outlined">
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0.5, borderBottomColor: theme.colors.divider }]}
              onPress={() => Alert.alert('Export Data', 'Your data export will be sent to your email within 24 hours.')}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Export My Data</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('Delete Account', 'Are you sure? This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
              ])}
            >
              <Text style={[styles.settingLabel, { color: Colors.error }]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>ABOUT</Text>
          <Card padding={Spacing.base} variant="outlined">
            <Text style={[styles.appName, { color: theme.colors.text }]}>ShareBite v1.0.0</Text>
            <Text style={[styles.appTagline, { color: theme.colors.textSecondary }]}>Share Food. Share Hope.</Text>
            <Text style={[styles.appBuilt, { color: theme.colors.textTertiary }]}>
              Built for SDG 2 · Zero Hunger
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  backBtn: { width: 36, height: 36, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  sectionLabel: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  settingLabel: {
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.md,
  },
  appName: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.lg,
    marginBottom: 4,
  },
  appTagline: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    marginBottom: 4,
  },
  appBuilt: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
});
