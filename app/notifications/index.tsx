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
import { HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
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

// Icon and color for each notification type
const NOTIF_CONFIG: Record<string, { icon: string; color: string }> = {
  new_donation:         { icon: 'restaurant-outline',      color: Colors.primary  },
  donation_claimed:     { icon: 'checkmark-circle-outline', color: Colors.accent   },
  pickup_confirmed:     { icon: 'bicycle-outline',          color: Colors.primary  },
  donation_completed:   { icon: 'ribbon-outline',           color: Colors.accent   },
  donation_expiring:    { icon: 'time-outline',             color: Colors.error    },
  verification_update:  { icon: 'shield-checkmark-outline', color: Colors.accent   },
  impact_milestone:     { icon: 'star-outline',             color: Colors.yellow   },
};

function NotificationItem({
  notif,
  onMarkRead,
}: {
  notif: AppNotification;
  onMarkRead?: () => void;
}) {
  const { theme } = useTheme();
  const config = NOTIF_CONFIG[notif.type] ?? { icon: 'notifications-outline', color: Colors.primary };

  return (
    <TouchableOpacity
      onPress={onMarkRead}
      activeOpacity={0.85}
      style={[
        styles.notifItem,
        {
          backgroundColor: notif.isRead ? theme.colors.surface : theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: `${config.color}12` }]}>
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </View>

      {/* Text content */}
      <View style={styles.notifBody}>
        <Text
          style={[styles.notifTitle, { color: theme.colors.text, opacity: notif.isRead ? 0.75 : 1 }]}
          numberOfLines={1}
        >
          {notif.title}
        </Text>
        <Text
          style={[styles.notifDesc, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {notif.body}
        </Text>
        <Text style={[styles.notifTime, { color: theme.colors.textTertiary }]}>
          {timeAgo(notif.createdAt)}
        </Text>
      </View>

      {/* Unread dot — small terracotta */}
      {!notif.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
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

  const markAllRead = () =>
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));

  const markOneRead = (id: string) =>
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadCount, { color: Colors.primary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAll, { color: Colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <HandDrawnSeparator style={{ marginHorizontal: Spacing.xl }} />

      {notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up."
          subtitle="No new notifications right now. We'll let you know when food is available nearby."
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
          renderItem={({ item }) => (
            <NotificationItem
              notif={item}
              onMarkRead={() => markOneRead(item.id)}
            />
          )}
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xs,
  },
  title: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'],
    letterSpacing: 0.2,
  },
  unreadCount: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  markAll: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  list: {
    paddingBottom: Spacing['3xl'],
  },
  separator: {
    height: 0.5,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm + 1,
    marginBottom: 3,
  },
  notifDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: 5,
  },
  notifTime: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 6,
    flexShrink: 0,
  },
});
