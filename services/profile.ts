// ShareBite — Profile Service

import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

function mapProfile(profile: any): User {
  return {
    id: profile.id,
    name: profile.full_name || 'User',
    email: profile.email || '',
    phone: profile.phone || '',
    role: (profile.role as UserRole) || 'donor',
    avatar: profile.avatar_url || undefined,
    bio: profile.bio || undefined,
    organizationName: undefined,
    location: profile.latitude
      ? {
          latitude: profile.latitude,
          longitude: profile.longitude,
          address: profile.address || '',
          city: profile.city || '',
        }
      : undefined,
    verificationStatus: profile.is_verified ? 'verified' : 'pending',
    isVerified: profile.is_verified || false,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export const ProfileService = {
  // ── Fetch profile by id ──────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return mapProfile(data);
  },

  // ── Update current user's profile ────────────────────────────────────────────
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        phone: updates.phone,
        email: updates.email,
        avatar_url: updates.avatar,
        bio: updates.bio,
        address: updates.location?.address,
        city: updates.location?.city,
        latitude: updates.location?.latitude,
        longitude: updates.location?.longitude,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !profile) throw error || new Error('Update failed');
    return mapProfile(profile);
  },

  // ── Upload avatar image ──────────────────────────────────────────────────────
  async uploadAvatar(userId: string, imageUri: string): Promise<string | null> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `${userId}_${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filename, blob, { contentType: 'image/jpeg', upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filename);

      // Save URL to profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      return publicUrl;
    } catch (e) {
      console.warn('[ShareBite] Avatar upload failed:', e);
      return null;
    }
  },

  // ── Get profile stats ────────────────────────────────────────────────────────
  async getProfileStats(userId: string): Promise<{ donations: number; rescues: number }> {
    const [{ count: donations }, { count: rescues }] = await Promise.all([
      supabase
        .from('food_listings')
        .select('*', { count: 'exact', head: true })
        .eq('donor_id', userId),
      supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
    ]);

    return {
      donations: donations || 0,
      rescues: rescues || 0,
    };
  },
};
