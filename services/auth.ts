// ShareBite — Auth Service (Connected to Supabase)

import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        // If trigger has not completed or failed, return fallback
        return {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || '',
          role: (session.user.user_metadata?.role as UserRole) || 'donor',
          verificationStatus: 'pending',
          isVerified: false,
          createdAt: session.user.created_at,
          updatedAt: session.user.created_at,
        };
      }

      return {
        id: profile.id,
        name: profile.full_name || 'User',
        email: profile.email || '',
        phone: profile.phone || '',
        role: (profile.role as UserRole) || 'donor',
        avatar: profile.avatar_url,
        bio: profile.bio,
        location: profile.latitude ? {
          latitude: profile.latitude,
          longitude: profile.longitude,
          address: profile.address || '',
          city: profile.city || '',
        } : undefined,
        verificationStatus: profile.is_verified ? 'verified' : 'pending',
        isVerified: profile.is_verified || false,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    } catch {
      return null;
    }
  },

  async login(phone: string, password: string, role: UserRole): Promise<User> {
    let authEmail = phone;

    // Check if user input is email or phone number
    if (!phone.includes('@')) {
      // Find email associated with this phone number in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', phone.trim())
        .limit(1)
        .maybeSingle();

      if (profile && profile.email) {
        authEmail = profile.email;
      } else {
        // Safe default placeholder email pattern if profile is missing
        authEmail = `${phone.trim()}@sharebite.com`;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: password,
    });

    if (error || !data.user) {
      throw error || new Error('Auth failed');
    }

    // Wait briefly for profile sync/fetch
    let profile = null;
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    profile = p;

    if (!profile) {
      // Fallback Profile
      return {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'User',
        email: data.user.email || '',
        phone: data.user.user_metadata?.phone || '',
        role: (data.user.user_metadata?.role as UserRole) || role,
        verificationStatus: 'pending',
        isVerified: false,
        createdAt: data.user.created_at,
        updatedAt: data.user.created_at,
      };
    }

    return {
      id: profile.id,
      name: profile.full_name || 'User',
      email: profile.email || '',
      phone: profile.phone || '',
      role: (profile.role as UserRole) || role,
      avatar: profile.avatar_url,
      bio: profile.bio,
      location: profile.latitude ? {
        latitude: profile.latitude,
        longitude: profile.longitude,
        address: profile.address || '',
        city: profile.city || '',
      } : undefined,
      verificationStatus: profile.is_verified ? 'verified' : 'pending',
      isVerified: profile.is_verified || false,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },

  async signup(data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
    password?: string;
  }): Promise<User> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password || 'password123', // safe fallback
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          role: data.role,
          organizationName: data.organizationName,
        },
      },
    });

    if (error || !authData.user) {
      throw error || new Error('Signup failed');
    }

    // Await database profile trigger to resolve (retry loop)
    let profile = null;
    for (let i = 0; i < 5; i++) {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      if (p) {
        profile = p;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Manual profile insertion if database trigger hasn't resolved
    if (!profile) {
      const { data: p, error: insErr } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          is_verified: false,
        })
        .select()
        .single();
      if (!insErr) profile = p;
    }

    return {
      id: authData.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      organizationName: data.organizationName,
      verificationStatus: 'pending',
      isVerified: false,
      createdAt: authData.user.created_at,
      updatedAt: authData.user.created_at,
    };
  },

  async verifyOTP(_phone: string, _otp: string): Promise<boolean> {
    // Mock for mobile flow bypass
    return true;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('@sharebite_onboarding');
      return value === 'completed';
    } catch {
      return false;
    }
  },

  async markOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem('@sharebite_onboarding', 'completed');
  },

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

    if (error || !profile) {
      throw error || new Error('Update failed');
    }

    return {
      id: profile.id,
      name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      role: (profile.role as UserRole) || 'donor',
      avatar: profile.avatar_url,
      bio: profile.bio,
      location: profile.latitude ? {
        latitude: profile.latitude,
        longitude: profile.longitude,
        address: profile.address || '',
        city: profile.city || '',
      } : undefined,
      verificationStatus: profile.is_verified ? 'verified' : 'pending',
      isVerified: profile.is_verified || false,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },
};
