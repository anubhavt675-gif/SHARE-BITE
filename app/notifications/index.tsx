// ShareBite — Notifications Screen

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { AppNotification } from '../../types';
import { MOCK_NOTIFICATIONS } from '../../services/mock-data';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const NOTIF_ICONS: Record<string, { icon: string; color: string }> = {
  new_donation: { icon: 'restaurant', color: Colors.primary },
  donation_claimed: { icon: 'checkmark-circle', color: Colors.accent },
  pickup_confirmed: { icon: 'bicycle', color: Colors.yellow },
  donation_completed: { icon: 'trophy', color: Colors.primary },
  donation_expiring: { icon: 'time', color: Colors.error },
  verification_update: { icon: 'shield-checkmark', color: Colors.info },
  impact_milestone: { icon: 'star', color: Colors.yellow },
};

function NotificationItem({ notif }: { notif: AppNotification }) {
  const { theme } = useTheme();
  const config = NOTIF_ICONS[notif.type] ?? { icon: 'notifications', color: Colors.primary };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.notifItem,
        {
          backgroundColor: notif.isRead ? theme.colors.surface : `${config.color}08`,
          borderLeftColor: notif.isRead ? 'transparent' : config.color,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={config.icon as any} size={20} color={config.color} />
      </View>
      <View style={styles.notifText}>
        <Text style={[styles.notifTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {notif.title}
        </Text>
        <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {notif.body}
        </Text>
        <Text style={[styles.notifTime, { color: theme.colors.textTertiary }]}>
          {timeAgo(notif.createdAt)}
        </Text>
      </View>
      {!notif.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: config.color }]} />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setNotifications(MOCK_NOTIFICATIONS);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadText, { color: Colors.primary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setNotifications(ns => ns.map(n => ({ ...n, isRead: true })))}
        >
          <Text style={[styles.markAll, { color: Colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="You're all caught up!"
          subtitle="No new notifications right now. We'll notify you when food is available or claimed."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => <NotificationItem notif={item} />}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.divider }]} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xl,
  },
  unreadText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  markAll: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  list: {
    paddingBottom: Spacing['3xl'],
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderLeftWidth: 3,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifText: { flex: 1 },
  notifTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
    marginBottom: 3,
  },
  notifBody: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: 4,
  },
  notifTime: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  separator: { height: 0.5 },
});
