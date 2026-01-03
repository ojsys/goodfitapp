/**
 * User Service - Django Backend
 * Handles user profile, goals, stats, and preferences
 */

import api, { handleApiError, ApiResponse } from './api';
import { User, UserGoals, UserStats, UserPreferences } from './authService';

export interface UpdateProfileData {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
}

/**
 * User Service
 */
export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
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
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch<User>('/auth/profile/update/', data);

      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user goals
   */
  async getGoals(): Promise<ApiResponse<UserGoals>> {
    try {
      const response = await api.get<UserGoals>('/auth/goals/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user goals
   */
  async updateGoals(goals: Partial<UserGoals>): Promise<ApiResponse<UserGoals>> {
    try {
      const response = await api.patch<UserGoals>('/auth/goals/', goals);

      return {
        success: true,
        data: response.data,
        message: 'Goals updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user stats
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await api.get<UserStats>('/auth/stats/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await api.get<UserPreferences>('/auth/preferences/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await api.patch<UserPreferences>('/auth/preferences/', preferences);

      return {
        success: true,
        data: response.data,
        message: 'Preferences updated successfully',
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
};

export default userService;
