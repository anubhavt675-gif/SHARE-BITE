// ShareBite — Notifications Service (Supabase-connected)

import { supabase } from '../lib/supabase';
import { AppNotification, NotificationType } from '../types';

export const NotificationsService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      type: item.type as NotificationType,
      title: item.title,
      body: item.message,
      isRead: item.is_read,
      createdAt: item.created_at,
    }));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  },

  subscribeToNotifications(
    userId: string,
    onNotification: (notification: AppNotification) => void,
  ) {
    return supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const item = payload.new;
          onNotification({
            id: item.id,
            userId: item.user_id,
            type: item.type as NotificationType,
            title: item.title,
            body: item.message,
            isRead: item.is_read,
            createdAt: item.created_at,
          });
        },
      )
      .subscribe();
  },
};
