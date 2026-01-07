/**
 * Live Tracking Service
 * Handles real-time GPS tracking and activity recording
 */

import api, { ApiResponse, handleApiError } from './api';

/**
 * Live Tracking Types
 */
export type ActivityStatus = 'active' | 'paused' | 'stopped';

export interface GPSPoint {
  lat: number;
  lng: number;
  altitude?: number;
  speed?: number;
  timestamp: string;
  accuracy?: number;
}

export interface LiveActivity {
  id: number;
  type: string;
  title: string;
  status: ActivityStatus;
  start_time: string;
  paused_at?: string;
  stopped_at?: string;
  total_paused_duration: number;
  current_distance: number;
  current_duration: number;
  current_calories: number;
  current_pace?: number;
  current_speed?: number;
  route_points: GPSPoint[];
  last_latitude?: number;
  last_longitude?: number;
  last_update?: string;
  final_activity?: number;
  created_at: string;
  updated_at: string;
  active_duration: number;
  distance_km: number;
  distance_miles: number;
}

export interface StartActivityData {
  type: string;
  title: string;
}

export interface AddGPSPointData {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
}

export interface UpdateMetricsData {
  current_calories?: number;
  current_pace?: number;
  current_speed?: number;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  distance: number;
  calories_burned: number;
  average_speed?: number;
  route: GPSPoint[];
}

/**
 * Live Tracking Service
 */
export const liveTrackingService = {
  /**
   * Start a new live activity
   */
  async startActivity(data: StartActivityData): Promise<ApiResponse<LiveActivity>> {
    try {
      const response = await api.post('/activities/live/', data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get current active activity
   */
  async getActiveActivity(): Promise<ApiResponse<LiveActivity | null>> {
    try {
      const response = await api.get('/activities/live/active/');

      if (response.data.active === false) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a specific live activity
   */
  async getLiveActivity(activityId: number): Promise<ApiResponse<LiveActivity>> {
    try {
      const response = await api.get(`/activities/live/${activityId}/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add GPS point to live activity
   */
  async addGPSPoint(
    activityId: number,
    data: AddGPSPointData
  ): Promise<ApiResponse<LiveActivity>> {
    try {
      const response = await api.post(`/activities/live/${activityId}/add_gps_point/`, data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Pause live activity
   */
  async pauseActivity(activityId: number): Promise<ApiResponse<LiveActivity>> {
    try {
      const response = await api.post(`/activities/live/${activityId}/pause/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Resume paused activity
   */
  async resumeActivity(activityId: number): Promise<ApiResponse<LiveActivity>> {
    try {
      const response = await api.post(`/activities/live/${activityId}/resume/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Stop activity and create final record
   */
  async stopActivity(activityId: number): Promise<ApiResponse<{ activity: Activity }>> {
    try {
      const response = await api.post(`/activities/live/${activityId}/stop/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update current metrics
   */
  async updateMetrics(
    activityId: number,
    data: UpdateMetricsData
  ): Promise<ApiResponse<LiveActivity>> {
    try {
      const response = await api.post(`/activities/live/${activityId}/update_metrics/`, data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Format duration (seconds to MM:SS or HH:MM:SS)
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format distance (meters to km/miles)
   */
  formatDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
    if (unit === 'km') {
      const km = meters / 1000;
      return `${km.toFixed(2)} km`;
    } else {
      const miles = meters / 1609.34;
      return `${miles.toFixed(2)} mi`;
    }
  },

  /**
   * Format pace (min/km or min/mi)
   */
  formatPace(pace?: number): string {
    if (!pace) return '--:--';
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate current pace from distance and duration
   */
  calculatePace(distanceMeters: number, durationSeconds: number, unit: 'km' | 'mi' = 'km'): number {
    if (distanceMeters === 0 || durationSeconds === 0) return 0;

    const distance = unit === 'km' ? distanceMeters / 1000 : distanceMeters / 1609.34;
    const durationMinutes = durationSeconds / 60;

    return durationMinutes / distance; // min/km or min/mi
  },

  /**
   * Calculate speed (km/h or mph)
   */
  calculateSpeed(distanceMeters: number, durationSeconds: number, unit: 'km' | 'mi' = 'km'): number {
    if (distanceMeters === 0 || durationSeconds === 0) return 0;

    const distance = unit === 'km' ? distanceMeters / 1000 : distanceMeters / 1609.34;
    const durationHours = durationSeconds / 3600;

    return distance / durationHours; // km/h or mph
  },
};

export default liveTrackingService;
