// ShareBite — Auth Context (Fixed + Performance Optimized)
//
// KEY FIXES vs previous version:
//  1. supabase.auth.onAuthStateChange() is now the SINGLE SOURCE OF TRUTH for
//     auth state. All session changes (login, logout, token refresh, email
//     confirmation, deep-link callbacks) are handled automatically.
//  2. Removed the manual one-shot getCurrentUser() init — replaced by
//     INITIAL_SESSION event from the listener, which fires immediately on mount.
//  3. Added 10-second timeout so isLoading never hangs indefinitely.
//  4. All action functions remain wrapped in useCallback (stable references).
//  5. Context value remains wrapped in useMemo.

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { User, UserRole } from '../types';
import { AuthService } from '../services/auth';
import { supabase } from '../lib/supabase';

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
      return {
        ...initialState,
        isLoading: false,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
    password?: string;
  }) => Promise<{ sessionExists: boolean } | void>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Ref keeps updateUser stable without recapturing user state
  const userRef = useRef<User | null>(state.user);
  userRef.current = state.user;

  // ── Load onboarding flag once on mount ───────────────────────────────────────
  useEffect(() => {
    AuthService.hasCompletedOnboarding().then(onboarded => {
      dispatch({ type: 'SET_ONBOARDING', payload: onboarded });
    });
  }, []);

  // ── Supabase auth state listener — SINGLE SOURCE OF TRUTH ────────────────────
  // This handles: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED,
  // USER_UPDATED, and email-confirmation callbacks automatically.
  useEffect(() => {
    // Safety timeout — if Supabase takes more than 10s, stop showing spinner
    const timeoutId = setTimeout(() => {
      dispatch({ type: 'SET_USER', payload: null });
    }, 10_000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(timeoutId);

        if (event === 'SIGNED_OUT' || !session) {
          dispatch({ type: 'LOGOUT' });
          return;
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'INITIAL_SESSION'
        ) {
          try {
            // Fetch the full profile for this session user
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: user });
          } catch {
            // If profile fetch fails, build a minimal user from session data
            dispatch({
              type: 'SET_USER',
              payload: {
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
              },
            });
          }
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // ── Stable action functions ──────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // AuthService.login handles signInWithPassword and profile fetch.
      // The onAuthStateChange listener will update state automatically on success,
      // but we call login() here to get error propagation and immediate feedback.
      await AuthService.login(email, password, role);
      // State will be updated by onAuthStateChange(SIGNED_IN) automatically.
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const signup = useCallback(async (data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    organizationName?: string;
    password?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await AuthService.signup(data);
      // If email confirmation is required, no session — clear loading and
      // let the caller show an appropriate message.
      // If session exists, onAuthStateChange(SIGNED_IN) will update state.
      if (!result.sessionExists) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      // Return result so the signup screen can check sessionExists
      return result;
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange(SIGNED_OUT) handles the state update.
  }, []);

  const markOnboardingComplete = useCallback(async () => {
    await AuthService.markOnboardingComplete();
    dispatch({ type: 'SET_ONBOARDING', payload: true });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (userRef.current) {
      dispatch({ type: 'SET_USER', payload: { ...userRef.current, ...updates } });
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login,
    signup,
    logout,
    markOnboardingComplete,
    updateUser,
  }), [state, login, signup, logout, markOnboardingComplete, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
