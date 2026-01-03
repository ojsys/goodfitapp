/**
 * User Context - Global state management for user profile and data
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import userService, { UpdateProfileData } from '../services/userService';
import { User, UserGoals, UserStats, UserPreferences } from '../services/authService';
import { useAuth } from './AuthContext';

/**
 * Get time-based greeting
 */
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Get first name from display name
 */
const getFirstName = (displayName: string): string => {
  return displayName.split(' ')[0];
};

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

interface UserContextType {
  // State
  userProfile: User | null;
  goals: UserGoals | null;
  stats: UserStats | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  greeting: string;
  firstName: string;

  // Actions
  refreshUserProfile: () => Promise<void>;
  updateProfile: (updates: UpdateProfileData) => Promise<void>;
  updateUserGoals: (goals: Partial<UserGoals>) => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  setUserOnlineStatus: (status: 'online' | 'away' | 'offline') => Promise<void>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>('Hello');
  const [firstName, setFirstName] = useState<string>('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load user profile when authenticated user changes
   */
  useEffect(() => {
    if (user) {
      loadUserProfile();
      updateUserOnlineStatus('online');
    } else {
      setUserProfile(null);
      setGoals(null);
      setStats(null);
      setPreferences(null);
      setLoading(false);
    }

    // Update greeting
    setGreeting(getGreeting());

    // Update greeting every hour
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [user]);

  /**
   * Update first name when user profile changes
   */
  useEffect(() => {
    if (userProfile?.display_name) {
      setFirstName(getFirstName(userProfile.display_name));
    }
  }, [userProfile]);

  /**
   * Update online status on app state changes
   */
  useEffect(() => {
    const handleAppStateChange = () => {
      if (user) {
        updateUserOnlineStatus('online');
      }
    };

    // Set online when app becomes active
    handleAppStateChange();

    // Set offline when app is closed (best effort)
    return () => {
      if (user) {
        updateUserOnlineStatus('offline').catch(console.error);
      }
    };
  }, [user]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Load user profile from Django API
   */
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile
      const profileResponse = await userService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data);
        // Profile includes goals, stats, and preferences
        setGoals(profileResponse.data.goals);
        setStats(profileResponse.data.stats);
        setPreferences(profileResponse.data.preferences);
      } else {
        setError(profileResponse.error || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Error loading user profile:', err);

      // Check if session expired
      if (err.isSessionExpired || err.message === 'SESSION_EXPIRED') {
        console.log('Session expired, profile will reload after re-authentication');
        setUserProfile(null);
      } else {
        setError(err.message || 'Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user's online status
   */
  const updateUserOnlineStatus = async (status: 'online' | 'away' | 'offline') => {
    if (!user) return;

    try {
      await userService.updateOnlineStatus(status);

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          online_status: status,
        });
      }
    } catch (err: any) {
      console.error('Error updating online status:', err);
    }
  };

  // ============================================================================
  // CONTEXT ACTIONS
  // ============================================================================

  /**
   * Refresh user profile from Django API
   */
  const refreshUserProfile = async () => {
    if (!user) return;
    await loadUserProfile();
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: UpdateProfileData) => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    try {
      setError(null);

      const response = await userService.updateProfile(updates);

      if (response.success && response.data) {
        setUserProfile(response.data);
        // Update nested data if present
        if (response.data.goals) setGoals(response.data.goals);
        if (response.data.stats) setStats(response.data.stats);
        if (response.data.preferences) setPreferences(response.data.preferences);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  /**
   * Update user goals
   */
  const updateUserGoals = async (goalUpdates: Partial<UserGoals>) => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    try {
      setError(null);

      const response = await userService.updateGoals(goalUpdates);

      if (response.success && response.data) {
        setGoals(response.data);
      } else {
        setError(response.error || 'Failed to update goals');
      }
    } catch (err: any) {
      console.error('Error updating goals:', err);
      setError(err.message || 'Failed to update goals');
    }
  };

  /**
   * Update user preferences
   */
  const updateUserPreferences = async (prefUpdates: Partial<UserPreferences>) => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    try {
      setError(null);

      const response = await userService.updatePreferences(prefUpdates);

      if (response.success && response.data) {
        setPreferences(response.data);
      } else {
        setError(response.error || 'Failed to update preferences');
      }
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      setError(err.message || 'Failed to update preferences');
    }
  };

  /**
   * Set user online status
   */
  const setUserOnlineStatus = async (status: 'online' | 'away' | 'offline') => {
    await updateUserOnlineStatus(status);
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: UserContextType = {
    // State
    userProfile,
    goals,
    stats,
    preferences,
    loading,
    error,
    greeting,
    firstName,

    // Actions
    refreshUserProfile,
    updateProfile,
    updateUserGoals,
    updateUserPreferences,
    setUserOnlineStatus,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to use User context
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
