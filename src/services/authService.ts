/**
 * Authentication Service - Django Backend
 * Handles user authentication with Django REST API
 */

import api, { tokenManager, handleApiError, ApiResponse } from './api';

export interface User {
  id: number;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  online_status: 'online' | 'offline' | 'away';
  last_seen: string;
  goals: UserGoals;
  stats: UserStats;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserGoals {
  selected_goals: string[];
  daily_step_goal: number;
  weekly_workout_goal: number;
  daily_calorie_goal: number;
}

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_workouts: number;
  total_minutes: number;
  total_calories: number;
  total_distance: number;
}

export interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  activity_reminders: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  show_stats_publicly: boolean;
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  display_name: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response = await api.post<AuthResponse>('/auth/register/', data);

      const { user, tokens } = response.data;

      // Save tokens
      await tokenManager.saveTokens(tokens.access, tokens.refresh);

      return {
        success: true,
        data: user,
        message: 'Registration successful',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      const response = await api.post<AuthResponse>('/auth/login/', credentials);

      const { user, tokens } = response.data;

      // Save tokens
      await tokenManager.saveTokens(tokens.access, tokens.refresh);

      return {
        success: true,
        data: user,
        message: 'Login successful',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();

      // Call backend logout endpoint
      await api.post('/auth/logout/', {
        refresh_token: refreshToken,
      });

      // Clear tokens
      await tokenManager.clearTokens();

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      // Even if API call fails, clear local tokens
      await tokenManager.clearTokens();

      return {
        success: true,
        message: 'Logout successful',
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await tokenManager.hasTokens();
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<User>('/auth/profile/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      await api.post('/auth/password/change/', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update online status
   */
  async updateOnlineStatus(status: 'online' | 'offline' | 'away'): Promise<ApiResponse> {
    try {
      await api.post('/auth/status/', { status });

      return {
        success: true,
        message: `Status updated to ${status}`,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Login with Google ID token
   */
  async googleLogin(idToken: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.post<AuthResponse>('/auth/google-login/', {
        id_token: idToken,
      });

      const { user, tokens } = response.data;

      // Save tokens
      await tokenManager.saveTokens(tokens.access, tokens.refresh);

      return {
        success: true,
        data: user,
        message: 'Google login successful',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default authService;
