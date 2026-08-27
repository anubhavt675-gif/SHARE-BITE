// ShareBite — Auth Context (Performance Optimized)
// - All action functions wrapped in useCallback (stable references)
// - Context value wrapped in useMemo to prevent re-renders in all consumers
//   when unrelated state changes

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
    password?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Keep a ref to current user so updateUser callback stays stable without
  // needing `state.user` in its dependency array.
  const userRef = useRef<User | null>(state.user);
  userRef.current = state.user;

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

  const login = useCallback(async (phone: string, password: string, role: UserRole) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await AuthService.login(phone, password, role);
      dispatch({ type: 'SET_USER', payload: user });
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
      const user = await AuthService.signup(data);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const markOnboardingComplete = useCallback(async () => {
    await AuthService.markOnboardingComplete();
    dispatch({ type: 'SET_ONBOARDING', payload: true });
  }, []);

  // Reads current user via ref so this callback never needs to be recreated
  const updateUser = useCallback((updates: Partial<User>) => {
    if (userRef.current) {
      dispatch({ type: 'SET_USER', payload: { ...userRef.current, ...updates } });
    }
  }, []);

  // Stable value object — only re-creates when actual state or stable fns change
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
