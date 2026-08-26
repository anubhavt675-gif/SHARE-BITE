// ShareBite — Auth Service (Mock + Supabase-ready)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { MOCK_DONOR, MOCK_NGO } from './mock-data';

const AUTH_KEY = '@sharebite_auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  async login(phone: string, _password: string, role: UserRole): Promise<User> {
    await delay(1200);
    // Mock login — returns different user based on role
    const user = role === 'ngo' ? MOCK_NGO : MOCK_DONOR;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, isAuthenticated: true }));
    return user;
  },

  async signup(data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
  }): Promise<User> {
    await delay(1500);
    const user: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: data.role,
      verificationStatus: 'pending',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, isAuthenticated: true }));
    return user;
  },

  async verifyOTP(_phone: string, _otp: string): Promise<boolean> {
    await delay(1000);
    // Mock: any 6-digit OTP works
    return true;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_KEY);
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
    await delay(800);
    const stored = await AsyncStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const updated = { ...parsed.user, ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ ...parsed, user: updated }));
      return updated;
    }
    throw new Error('User not found');
  },
};
