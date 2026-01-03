/**
 * Activity Service - Django Backend
 * Handles activity tracking, CRUD operations, and statistics
 */

import api, { handleApiError, ApiResponse } from './api';

export type ActivityType = 'Run' | 'Cycle' | 'Walk' | 'Swim' | 'Yoga' | 'Strength';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  timestamp?: string;
}

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  notes?: string;
  start_time: string;
  end_time?: string;
  duration: number; // minutes
  distance?: number; // meters
  calories_burned?: number;
  average_speed?: number; // km/h
  pace?: number; // min/km
  elevation_gain?: number; // meters
  heart_rate_avg?: number;
  heart_rate_max?: number;
  start_latitude?: number;
  start_longitude?: number;
  start_address?: string;
  route?: RoutePoint[];
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  type: ActivityType;
  title: string;
  notes?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  distance?: number;
  calories_burned?: number;
  average_speed?: number;
  pace?: number;
  elevation_gain?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  start_latitude?: number;
  start_longitude?: number;
  start_address?: string;
  route?: RoutePoint[];
}

export interface ActivityStats {
  total_activities: number;
  total_distance: number;
  total_duration: number;
  total_calories: number;
  activities_by_type: Record<string, number>;
  average_duration: number;
  longest_activity: number;
}

export interface DailySummary {
  id: number;
  date: string;
  total_steps: number;
  total_distance: number;
  total_calories: number;
  total_active_minutes: number;
  total_workouts: number;
  step_goal_progress: number;
  calorie_goal_progress: number;
  workout_goal_progress: number;
  created_at: string;
  updated_at: string;
}

/**
 * Activity Service
 */
export const activityService = {
  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<ApiResponse<Activity[]>> {
    try {
      const response = await api.get<Activity[]>('/activities/recent/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all activities with optional filters
   */
  async getActivities(params?: {
    type?: ActivityType;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Activity[]>> {
    try {
      const response = await api.get<Activity[]>('/activities/', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get activity by ID
   */
  async getActivity(id: number): Promise<ApiResponse<Activity>> {
    try {
      const response = await api.get<Activity>(`/activities/${id}/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new activity
   */
  async createActivity(data: CreateActivityData): Promise<ApiResponse<Activity>> {
    try {
      const response = await api.post<Activity>('/activities/', data);

      return {
        success: true,
        data: response.data,
        message: 'Activity created successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update activity
   */
  async updateActivity(id: number, data: Partial<CreateActivityData>): Promise<ApiResponse<Activity>> {
    try {
      const response = await api.patch<Activity>(`/activities/${id}/`, data);

      return {
        success: true,
        data: response.data,
        message: 'Activity updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete activity
   */
  async deleteActivity(id: number): Promise<ApiResponse> {
    try {
      await api.delete(`/activities/${id}/`);

      return {
        success: true,
        message: 'Activity deleted successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get activity statistics
   */
  async getStats(days: number = 30): Promise<ApiResponse<ActivityStats>> {
    try {
      const response = await api.get<ActivityStats>(`/activities/stats/`, {
        params: { days },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get daily summaries
   */
  async getDailySummaries(days: number = 30): Promise<ApiResponse<DailySummary[]>> {
    try {
      const response = await api.get<DailySummary[]>('/activities/summaries/', {
        params: { days },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get today's summary
   */
  async getTodaySummary(): Promise<ApiResponse<DailySummary>> {
    try {
      const response = await api.get<DailySummary>('/activities/summaries/today/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update daily summary
   */
  async updateDailySummary(data: Partial<DailySummary>): Promise<ApiResponse<DailySummary>> {
    try {
      const response = await api.post<DailySummary>('/activities/summaries/update/', data);

      return {
        success: true,
        data: response.data,
        message: 'Daily summary updated successfully',
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default activityService;
