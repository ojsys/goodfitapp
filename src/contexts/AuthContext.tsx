import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { User } from '../services/authService';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasCompletedOnboarding: boolean;
  signUp: (email: string, displayName: string, password: string, passwordConfirm: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Load onboarding status
        const onboardingValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setHasCompletedOnboarding(onboardingValue === 'true');

        // Check if user is authenticated
        const isAuthenticated = await authService.isAuthenticated();

        if (isAuthenticated) {
          // Load user profile
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token exists but invalid - clear it
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, displayName: string, password: string, passwordConfirm: string) => {
    try {
      const response = await authService.register({
        email,
        display_name: displayName,
        password,
        password_confirm: passwordConfirm,
      });

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Clear onboarding status on sign out
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      setHasCompletedOnboarding(false);
    } catch (error: any) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    hasCompletedOnboarding,
    signUp,
    signIn,
    signOut,
    completeOnboarding,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
