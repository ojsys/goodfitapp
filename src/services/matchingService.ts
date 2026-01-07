/**
 * Matching Service
 * Handles all matching-related API calls
 */

import api, { ApiResponse, handleApiError } from './api';

/**
 * Matching Types
 */
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type SwipeAction = 'like' | 'pass' | 'super_like';

export interface UserProfile {
  id: number;
  user_id: number;
  display_name: string;
  profile_photo: string;
  age?: number;
  gender: string;
  location_city: string;
  location_state: string;
  latitude?: number;
  longitude?: number;
  fitness_level: FitnessLevel;
  favorite_activities: string[];
  fitness_goals: string[];
  looking_for: string[];
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_distance_miles: number;
  preferred_gender: string[];
  prompt_question: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchedUser {
  user_id: number;
  display_name: string;
  profile_photo: string;
  age?: number;
  gender: string;
  location_city: string;
  fitness_level: FitnessLevel;
  favorite_activities: string[];
  fitness_goals: string[];
  looking_for: string[];
  prompt_question: string;
  distance?: number;
}

export interface Swipe {
  id: number;
  from_user: number;
  from_user_name: string;
  to_user: number;
  to_user_name: string;
  action: SwipeAction;
  created_at: string;
}

export interface Match {
  id: number;
  user1: number;
  user1_name: string;
  user1_photo: string;
  user2: number;
  user2_name: string;
  user2_photo: string;
  other_user?: MatchedUser;
  is_active: boolean;
  matched_at: string;
  unmatched_at?: string;
}

export interface SwipeResponse extends Swipe {
  is_match: boolean;
  match?: Match;
}

export interface ProfileUpdateData {
  age?: number;
  gender?: string;
  location_city?: string;
  location_state?: string;
  latitude?: number;
  longitude?: number;
  fitness_level?: FitnessLevel;
  favorite_activities?: string[];
  fitness_goals?: string[];
  looking_for?: string[];
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_distance_miles?: number;
  preferred_gender?: string[];
  prompt_question?: string;
  is_active?: boolean;
}

/**
 * Matching Service
 */
export const matchingService = {
  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.get('/matching/profiles/me/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create or update current user's profile
   */
  async updateMyProfile(profileData: ProfileUpdateData): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.post('/matching/profiles/update_my_profile/', profileData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Discover compatible users for matching
   */
  async discoverUsers(): Promise<ApiResponse<MatchedUser[]>> {
    try {
      const response = await api.get('/matching/profiles/discover/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Swipe on a user (like/pass/super_like)
   */
  async swipeUser(userId: number, action: SwipeAction): Promise<ApiResponse<SwipeResponse>> {
    try {
      const response = await api.post('/matching/swipes/', {
        to_user: userId,
        action: action,
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
   * Get all swipes made by current user
   */
  async getMySwipes(): Promise<ApiResponse<Swipe[]>> {
    try {
      const response = await api.get('/matching/swipes/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get users that current user has liked
   */
  async getMyLikes(): Promise<ApiResponse<Swipe[]>> {
    try {
      const response = await api.get('/matching/swipes/my_likes/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get users that have liked current user
   */
  async getLikesReceived(): Promise<ApiResponse<Swipe[]>> {
    try {
      const response = await api.get('/matching/swipes/likes_received/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all matches for current user
   */
  async getMatches(): Promise<ApiResponse<Match[]>> {
    try {
      const response = await api.get('/matching/matches/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get recent matches (last 7 days)
   */
  async getRecentMatches(): Promise<ApiResponse<Match[]>> {
    try {
      const response = await api.get('/matching/matches/recent/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Unmatch with a user
   */
  async unmatch(matchId: number): Promise<ApiResponse<void>> {
    try {
      await api.post(`/matching/matches/${matchId}/unmatch/`);

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default matchingService;
