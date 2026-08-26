// ShareBite — Auth Context

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { AuthService } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ONBOARDING'; payload: boolean }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasCompletedOnboarding: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'SET_ONBOARDING':
      return { ...state, hasCompletedOnboarding: action.payload };
    case 'LOGOUT':
      return { ...initialState, isLoading: false, hasCompletedOnboarding: state.hasCompletedOnboarding };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string, role: UserRole) => Promise<void>;
  signup: (data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const [user, onboarded] = await Promise.all([
          AuthService.getCurrentUser(),
          AuthService.hasCompletedOnboarding(),
        ]);
        dispatch({ type: 'SET_ONBOARDING', payload: onboarded });
        dispatch({ type: 'SET_USER', payload: user });
      } catch {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };
    init();
  }, []);

  const login = async (phone: string, password: string, role: UserRole) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await AuthService.login(phone, password, role);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  };

  const signup = async (data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await AuthService.signup(data);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const markOnboardingComplete = async () => {
    await AuthService.markOnboardingComplete();
    dispatch({ type: 'SET_ONBOARDING', payload: true });
  };

  const updateUser = (updates: Partial<User>) => {
    if (state.user) {
      dispatch({ type: 'SET_USER', payload: { ...state.user, ...updates } });
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout, markOnboardingComplete, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
