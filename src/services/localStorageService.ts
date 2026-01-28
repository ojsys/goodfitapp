/**
 * Local Storage Service
 * Provides offline-first data storage for authentication and activity tracking.
 * Enables app testing on real devices without backend dependency.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserGoals } from './authService';
import { Activity, ActivityType, CreateActivityData } from './activityService';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  // Auth
  LOCAL_USER: '@local_user',
  OFFLINE_MODE: '@offline_mode',

  // Activities
  LOCAL_ACTIVITIES: '@local_activities',
  PENDING_SYNC_ACTIVITIES: '@pending_sync_activities',

  // Tracking sessions (in-progress)
  CURRENT_TRACKING_SESSION: '@current_tracking_session',

  // User preferences
  USER_GOALS: '@user_goals',
  USER_PREFERENCES: '@user_preferences',
};

// ============================================================================
// DEFAULT USER (FOR OFFLINE TESTING)
// ============================================================================

const createDefaultUser = (email: string, displayName: string): User => ({
  id: Date.now(),
  email,
  display_name: displayName,
  first_name: displayName.split(' ')[0] || '',
  last_name: displayName.split(' ').slice(1).join(' ') || '',
  full_name: displayName,
  avatar_url: null,
  bio: '',
  online_status: 'online',
  last_seen: new Date().toISOString(),
  goals: {
    selected_goals: [],
    daily_step_goal: 10000,
    weekly_workout_goal: 3,
    daily_calorie_goal: 500,
  },
  stats: {
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    total_workouts: 0,
    total_minutes: 0,
    total_calories: 0,
    total_distance: 0,
  },
  preferences: {
    email_notifications: true,
    push_notifications: true,
    activity_reminders: true,
    profile_visibility: 'public',
    show_stats_publicly: true,
    theme: 'auto',
    units: 'metric',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// ============================================================================
// OFFLINE MODE MANAGEMENT
// ============================================================================

export const offlineModeService = {
  /**
   * Check if offline mode is enabled
   */
  async isOfflineMode(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    return value === 'true';
  },

  /**
   * Enable offline mode
   */
  async enableOfflineMode(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'true');
  },

  /**
   * Disable offline mode
   */
  async disableOfflineMode(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'false');
  },

  /**
   * Toggle offline mode
   */
  async toggleOfflineMode(): Promise<boolean> {
    const current = await this.isOfflineMode();
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, (!current).toString());
    return !current;
  },
};

// ============================================================================
// LOCAL AUTHENTICATION SERVICE
// ============================================================================

export const localAuthService = {
  /**
   * Register a local user (offline mode)
   */
  async registerLocalUser(email: string, displayName: string): Promise<User> {
    const user = createDefaultUser(email, displayName);
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(user));
    await offlineModeService.enableOfflineMode();
    return user;
  },

  /**
   * Login as local user (offline mode)
   */
  async loginLocalUser(email: string): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    if (userJson) {
      const user = JSON.parse(userJson) as User;
      if (user.email === email) {
        await offlineModeService.enableOfflineMode();
        return user;
      }
    }
    return null;
  },

  /**
   * Get the current local user
   */
  async getLocalUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  },

  /**
   * Update local user profile
   */
  async updateLocalUser(updates: Partial<User>): Promise<User | null> {
    const user = await this.getLocalUser();
    if (user) {
      const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  /**
   * Update user goals
   */
  async updateUserGoals(goals: Partial<UserGoals>): Promise<User | null> {
    const user = await this.getLocalUser();
    if (user) {
      const updatedUser = {
        ...user,
        goals: { ...user.goals, ...goals },
        updated_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  /**
   * Update user stats after an activity
   */
  async updateUserStats(activityData: {
    duration: number;
    calories?: number;
    distance?: number;
  }): Promise<User | null> {
    const user = await this.getLocalUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = user.stats.last_activity_date?.split('T')[0];

      // Calculate streak
      let currentStreak = user.stats.current_streak;
      if (lastActivityDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActivityDate === yesterdayStr) {
          currentStreak += 1;
        } else if (lastActivityDate !== today) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          current_streak: currentStreak,
          longest_streak: Math.max(currentStreak, user.stats.longest_streak),
          last_activity_date: new Date().toISOString(),
          total_workouts: user.stats.total_workouts + 1,
          total_minutes: user.stats.total_minutes + activityData.duration,
          total_calories: user.stats.total_calories + (activityData.calories || 0),
          total_distance: user.stats.total_distance + (activityData.distance || 0),
        },
        updated_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  /**
   * Logout local user
   */
  async logoutLocalUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOCAL_USER);
    await offlineModeService.disableOfflineMode();
  },

  /**
   * Check if local user exists
   */
  async hasLocalUser(): Promise<boolean> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    return !!userJson;
  },
};

// ============================================================================
// LOCAL ACTIVITIES SERVICE
// ============================================================================

export const localActivitiesService = {
  /**
   * Get all local activities
   */
  async getActivities(): Promise<Activity[]> {
    const activitiesJson = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_ACTIVITIES);
    if (activitiesJson) {
      return JSON.parse(activitiesJson) as Activity[];
    }
    return [];
  },

  /**
   * Get recent activities (last 20)
   */
  async getRecentActivities(limit: number = 20): Promise<Activity[]> {
    const activities = await this.getActivities();
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  /**
   * Get activity by ID
   */
  async getActivity(activityId: number): Promise<Activity | null> {
    const activities = await this.getActivities();
    return activities.find(a => a.id === activityId) || null;
  },

  /**
   * Create a new local activity
   */
  async createActivity(data: CreateActivityData): Promise<Activity> {
    const activities = await this.getActivities();

    const newActivity: Activity = {
      id: Date.now(),
      type: data.type,
      title: data.title,
      start_time: data.start_time || new Date().toISOString(),
      end_time: data.end_time,
      duration: data.duration,
      distance: data.distance,
      calories_burned: data.calories_burned,
      average_speed: data.average_speed,
      pace: data.pace,
      elevation_gain: data.elevation_gain,
      heart_rate_avg: data.heart_rate_avg,
      heart_rate_max: data.heart_rate_max,
      start_latitude: data.start_latitude,
      start_longitude: data.start_longitude,
      start_address: data.start_address,
      route: data.route || [],
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    activities.unshift(newActivity);
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_ACTIVITIES, JSON.stringify(activities));

    // Update user stats
    await localAuthService.updateUserStats({
      duration: data.duration,
      calories: data.calories_burned,
      distance: data.distance,
    });

    return newActivity;
  },

  /**
   * Update an existing local activity
   */
  async updateActivity(activityId: number, updates: Partial<CreateActivityData>): Promise<Activity | null> {
    const activities = await this.getActivities();
    const index = activities.findIndex(a => a.id === activityId);

    if (index !== -1) {
      activities[index] = {
        ...activities[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_ACTIVITIES, JSON.stringify(activities));
      return activities[index];
    }

    return null;
  },

  /**
   * Delete a local activity
   */
  async deleteActivity(activityId: number): Promise<boolean> {
    const activities = await this.getActivities();
    const filteredActivities = activities.filter(a => a.id !== activityId);

    if (filteredActivities.length !== activities.length) {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_ACTIVITIES, JSON.stringify(filteredActivities));
      return true;
    }

    return false;
  },

  /**
   * Clear all local activities
   */
  async clearActivities(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOCAL_ACTIVITIES);
  },

  /**
   * Get activities by type
   */
  async getActivitiesByType(type: ActivityType): Promise<Activity[]> {
    const activities = await this.getActivities();
    return activities.filter(a => a.type === type);
  },

  /**
   * Get activities summary (for dashboard)
   */
  async getActivitiesSummary(): Promise<{
    totalActivities: number;
    totalDuration: number;
    totalDistance: number;
    totalCalories: number;
    thisWeekActivities: number;
  }> {
    const activities = await this.getActivities();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekActivities = activities.filter(
      a => new Date(a.created_at) >= weekStart
    );

    return {
      totalActivities: activities.length,
      totalDuration: activities.reduce((sum, a) => sum + (a.duration || 0), 0),
      totalDistance: activities.reduce((sum, a) => sum + (a.distance || 0), 0),
      totalCalories: activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0),
      thisWeekActivities: thisWeekActivities.length,
    };
  },
};

// ============================================================================
// TRACKING SESSION PERSISTENCE
// ============================================================================

export interface StoredTrackingSession {
  activityType: ActivityType;
  startTime: string;
  routePoints: Array<{
    latitude: number;
    longitude: number;
    altitude?: number;
    speed?: number;
    timestamp: number;
  }>;
  distance: number;
  duration: number;
  elevationGain: number;
  isPaused: boolean;
}

export const trackingSessionStorage = {
  /**
   * Save current tracking session (for crash recovery)
   */
  async saveSession(session: StoredTrackingSession): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_TRACKING_SESSION,
      JSON.stringify(session)
    );
  },

  /**
   * Get saved tracking session
   */
  async getSession(): Promise<StoredTrackingSession | null> {
    const sessionJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRACKING_SESSION);
    if (sessionJson) {
      return JSON.parse(sessionJson) as StoredTrackingSession;
    }
    return null;
  },

  /**
   * Clear saved tracking session
   */
  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TRACKING_SESSION);
  },

  /**
   * Check if there's a saved session
   */
  async hasSession(): Promise<boolean> {
    const session = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRACKING_SESSION);
    return !!session;
  },
};

// ============================================================================
// PENDING SYNC QUEUE (For future backend sync)
// ============================================================================

export const syncQueueService = {
  /**
   * Add activity to sync queue
   */
  async addToSyncQueue(activity: Activity): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(activity);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES, JSON.stringify(queue));
  },

  /**
   * Get pending sync queue
   */
  async getSyncQueue(): Promise<Activity[]> {
    const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES);
    if (queueJson) {
      return JSON.parse(queueJson) as Activity[];
    }
    return [];
  },

  /**
   * Remove activity from sync queue
   */
  async removeFromSyncQueue(activityId: number): Promise<void> {
    const queue = await this.getSyncQueue();
    const filteredQueue = queue.filter(a => a.id !== activityId);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES, JSON.stringify(filteredQueue));
  },

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC_ACTIVITIES);
  },

  /**
   * Get sync queue count
   */
  async getSyncQueueCount(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all local storage data
 */
export const clearAllLocalStorage = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.LOCAL_USER,
    STORAGE_KEYS.OFFLINE_MODE,
    STORAGE_KEYS.LOCAL_ACTIVITIES,
    STORAGE_KEYS.PENDING_SYNC_ACTIVITIES,
    STORAGE_KEYS.CURRENT_TRACKING_SESSION,
    STORAGE_KEYS.USER_GOALS,
    STORAGE_KEYS.USER_PREFERENCES,
  ]);
};

/**
 * Export all local data (for backup)
 */
export const exportLocalData = async (): Promise<{
  user: User | null;
  activities: Activity[];
  pendingSync: Activity[];
}> => {
  const user = await localAuthService.getLocalUser();
  const activities = await localActivitiesService.getActivities();
  const pendingSync = await syncQueueService.getSyncQueue();

  return { user, activities, pendingSync };
};

/**
 * Import local data (for restore)
 */
export const importLocalData = async (data: {
  user?: User;
  activities?: Activity[];
}): Promise<void> => {
  if (data.user) {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(data.user));
  }
  if (data.activities) {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_ACTIVITIES, JSON.stringify(data.activities));
  }
};

export default {
  offlineModeService,
  localAuthService,
  localActivitiesService,
  trackingSessionStorage,
  syncQueueService,
  clearAllLocalStorage,
  exportLocalData,
  importLocalData,
};
