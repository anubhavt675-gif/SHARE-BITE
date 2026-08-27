// ShareBite — Auth Service (Fixed)
//
// KEY FIXES:
//  1. login() — accepts email directly. Removed the phone-to-email lookup that
//     was constructing fake emails like "9876543210@sharebite.com".
//  2. signup() — metadata now sends 'full_name' (matching the DB trigger) AND
//     'name' as fallback. Also sends 'phone' and 'role' so the trigger can write
//     them to the profiles table correctly.
//  3. Both login() and signup() now map Supabase error codes to user-friendly
//     messages instead of throwing raw errors.

import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Map Supabase error messages to user-friendly strings ─────────────────────
function mapAuthError(error: any): string {
  const msg = (error?.message || '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('signup is disabled')) {
    return 'New registrations are temporarily disabled. Please try again later.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  // Return the raw message if it's meaningful, otherwise generic
  if (error?.message && error.message.length < 120) {
    return error.message;
  }
  return 'Authentication failed. Please try again.';
}

export const AuthService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        // Profile not yet created by trigger — return minimal user from session
        return {
          id: session.user.id,
          name: session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                'User',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || '',
          role: (session.user.user_metadata?.role as UserRole) || 'donor',
          verificationStatus: 'pending',
          isVerified: false,
          createdAt: session.user.created_at,
          updatedAt: session.user.created_at,
        };
      }

      return mapProfileToUser(profile);
    } catch {
      return null;
    }
  },

  // ── Login — accepts email address directly ───────────────────────────────────
  // FIXED: removed phone-to-email lookup. The login screen now collects email.
  async login(email: string, password: string, _role: UserRole): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      throw new Error(mapAuthError(error));
    }

    // Fetch full profile — fall back to session data if profile is missing
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      return {
        id: data.user.id,
        name: data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              'User',
        email: data.user.email || '',
        phone: data.user.user_metadata?.phone || '',
        role: (data.user.user_metadata?.role as UserRole) || 'donor',
        verificationStatus: 'pending',
        isVerified: false,
        createdAt: data.user.created_at,
        updatedAt: data.user.created_at,
      };
    }

    return mapProfileToUser(profile);
  },

  // ── Signup ───────────────────────────────────────────────────────────────────
  // FIXED: metadata now uses 'full_name' (matches DB trigger) + 'phone' + 'role'
  // so the auto-create trigger writes a complete profile row.
  async signup(data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
    password?: string;
  }): Promise<{ user: User; sessionExists: boolean }> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password!,
      options: {
        data: {
          // 'full_name' matches what the DB trigger reads: raw_user_meta_data->>'full_name'
          full_name: data.name,
          // Keep 'name' as well for backward compat
          name: data.name,
          phone: data.phone,
          role: data.role,
          organization_name: data.organizationName || null,
        },
      },
    });

    if (error) {
      throw new Error(mapAuthError(error));
    }

    if (!authData.user) {
      throw new Error('Signup failed. Please try again.');
    }

    // Check if a session was returned (email confirmation disabled)
    const sessionExists = !!authData.session;

    // If no session yet (email confirmation enabled), we can't do profile work.
    // The trigger already created the profile row. Return early.
    if (!sessionExists) {
      return {
        user: {
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
        },
        sessionExists: false,
      };
    }

    // Session exists — try to enrich the profile with role/phone/org if the
    // DB trigger hasn't done it yet (race condition guard).
    // Use upsert so we don't conflict with the trigger's insert.
    await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: data.name,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        role: data.role,
        is_verified: false,
      }, { onConflict: 'id' });

    return {
      user: {
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
      },
      sessionExists: true,
    };
  },

  async verifyOTP(_phone: string, _otp: string): Promise<boolean> {
    // Mock — OTP flow not used in primary auth path
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
      throw error || new Error('Profile update failed.');
    }

    return mapProfileToUser(profile);
  },
};

// ── Profile row → User type mapper ───────────────────────────────────────────
function mapProfileToUser(profile: any): User {
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
}
