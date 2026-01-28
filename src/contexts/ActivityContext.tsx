/**
 * Activity Context - Global state management for activities and tracking
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import activityService, {
  Activity,
  ActivityType,
  CreateActivityData
} from '../services/activityService';
import { LocationTracker, TrackingSession } from '../services/locationTrackingService';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import {
  localActivitiesService,
  trackingSessionStorage,
  syncQueueService,
} from '../services/localStorageService';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

interface ActivityContextType {
  // State
  recentActivities: Activity[];
  loading: boolean;
  error: string | null;
  isTracking: boolean;
  trackingSession: TrackingSession | null;

  // Actions
  refreshActivities: () => Promise<void>;
  createActivity: (activityData: CreateActivityData) => Promise<boolean>;
  editActivity: (activityId: number, updates: Partial<CreateActivityData>) => Promise<boolean>;
  removeActivity: (activityId: number) => Promise<boolean>;
  getActivity: (activityId: number) => Promise<Activity | null>;

  // Live Tracking
  startLiveTracking: (activityType: ActivityType) => Promise<boolean>;
  stopLiveTracking: () => Promise<Activity | null>;
  pauseLiveTracking: () => void;
  resumeLiveTracking: () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const { user, isOfflineMode } = useAuth();
  const { userProfile, refreshUserProfile } = useUser();

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingSession, setTrackingSession] = useState<TrackingSession | null>(null);
  const [locationTracker] = useState<LocationTracker>(new LocationTracker());
  const [currentActivityType, setCurrentActivityType] = useState<ActivityType | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load recent activities when user or offline mode changes
   */
  useEffect(() => {
    if (user) {
      loadRecentActivities();
    } else {
      setRecentActivities([]);
    }
  }, [user, isOfflineMode]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Load recent activities from Django API or local storage
   */
  const loadRecentActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Use local storage in offline mode
      if (isOfflineMode) {
        console.log('📱 Loading activities from local storage (offline mode)');
        const localActivities = await localActivitiesService.getRecentActivities();
        console.log('✅ Loaded', localActivities.length, 'activities from local storage');
        setRecentActivities(localActivities);
        return;
      }

      const response = await activityService.getRecentActivities();

      console.log('📊 Activities API Response:', {
        success: response.success,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        count: Array.isArray(response.data) ? response.data.length : 0,
        data: response.data,
      });

      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        let activitiesData: Activity[];

        if (Array.isArray(response.data)) {
          // Direct array response
          activitiesData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Paginated response from Django REST Framework
          activitiesData = response.data.results;
        } else {
          // Fallback to empty array
          activitiesData = [];
        }

        console.log('✅ Setting recent activities:', activitiesData.length, 'activities');
        setRecentActivities(activitiesData);
      } else {
        console.log('❌ Failed to load activities:', response.error);
        // Try loading from local storage as fallback
        console.log('📱 Trying to load from local storage as fallback...');
        const localActivities = await localActivitiesService.getRecentActivities();
        if (localActivities.length > 0) {
          console.log('✅ Loaded', localActivities.length, 'activities from local storage');
          setRecentActivities(localActivities);
        } else {
          setError(response.error || 'Failed to load activities');
          setRecentActivities([]);
        }
      }
    } catch (err: any) {
      console.error('Error loading activities:', err);

      // Check if session expired
      if (err.isSessionExpired || err.message === 'SESSION_EXPIRED') {
        console.log('Session expired, activities will reload after re-authentication');
        setRecentActivities([]);
      } else {
        // Try loading from local storage as fallback
        console.log('📱 Error occurred, trying local storage fallback...');
        try {
          const localActivities = await localActivitiesService.getRecentActivities();
          if (localActivities.length > 0) {
            console.log('✅ Loaded', localActivities.length, 'activities from local storage');
            setRecentActivities(localActivities);
            setError(null);
          } else {
            setError(err.message || 'Failed to load activities');
            setRecentActivities([]);
          }
        } catch (localErr) {
          setError(err.message || 'Failed to load activities');
          setRecentActivities([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CONTEXT ACTIONS
  // ============================================================================

  /**
   * Refresh activities list
   */
  const refreshActivities = async () => {
    await loadRecentActivities();
  };

  /**
   * Create a new activity
   */
  const createActivity = async (activityData: CreateActivityData): Promise<boolean> => {
    if (!user) {
      setError('No user logged in');
      return false;
    }

    try {
      setError(null);

      // Use local storage in offline mode
      if (isOfflineMode) {
        console.log('📱 Creating activity in local storage (offline mode)');
        const newActivity = await localActivitiesService.createActivity(activityData);
        console.log('✅ Activity created locally:', newActivity.id);

        // Add to local state
        setRecentActivities((prev) => [newActivity, ...prev]);

        // Add to sync queue for later
        await syncQueueService.addToSyncQueue(newActivity);

        return true;
      }

      const response = await activityService.createActivity(activityData);

      if (response.success && response.data) {
        // Add to local state
        setRecentActivities((prev) => [response.data!, ...prev]);

        // Also save to local storage for offline access
        await localActivitiesService.createActivity(activityData);

        // Refresh user profile to update stats
        await refreshUserProfile();

        return true;
      } else {
        // API failed - save locally and queue for sync
        console.log('📱 API failed, saving to local storage...');
        const newActivity = await localActivitiesService.createActivity(activityData);
        setRecentActivities((prev) => [newActivity, ...prev]);
        await syncQueueService.addToSyncQueue(newActivity);

        setError(response.error || 'Saved locally - will sync when online');
        return true;
      }
    } catch (err: any) {
      console.error('Error creating activity:', err);

      // Save locally on error
      try {
        console.log('📱 Error occurred, saving to local storage...');
        const newActivity = await localActivitiesService.createActivity(activityData);
        setRecentActivities((prev) => [newActivity, ...prev]);
        await syncQueueService.addToSyncQueue(newActivity);
        setError('Saved locally - will sync when online');
        return true;
      } catch (localErr) {
        setError(err.message || 'Failed to create activity');
        return false;
      }
    }
  };

  /**
   * Update an existing activity
   */
  const editActivity = async (
    activityId: number,
    updates: Partial<CreateActivityData>
  ): Promise<boolean> => {
    try {
      setError(null);

      const response = await activityService.updateActivity(activityId, updates);

      if (response.success && response.data) {
        // Update local state
        setRecentActivities((prev) =>
          prev.map((activity) =>
            activity.id === activityId ? response.data! : activity
          )
        );
        return true;
      } else {
        setError(response.error || 'Failed to update activity');
        return false;
      }
    } catch (err: any) {
      console.error('Error updating activity:', err);
      setError(err.message || 'Failed to update activity');
      return false;
    }
  };

  /**
   * Delete an activity
   */
  const removeActivity = async (activityId: number): Promise<boolean> => {
    if (!user) {
      setError('No user logged in');
      return false;
    }

    try {
      setError(null);

      const response = await activityService.deleteActivity(activityId);

      if (response.success) {
        // Remove from local state
        setRecentActivities((prev) =>
          prev.filter((activity) => activity.id !== activityId)
        );

        // Refresh user profile to update stats
        await refreshUserProfile();

        return true;
      } else {
        setError(response.error || 'Failed to delete activity');
        return false;
      }
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      setError(err.message || 'Failed to delete activity');
      return false;
    }
  };

  /**
   * Get a specific activity by ID
   */
  const getActivity = async (activityId: number): Promise<Activity | null> => {
    try {
      setError(null);

      const response = await activityService.getActivity(activityId);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to get activity');
        return null;
      }
    } catch (err: any) {
      console.error('Error getting activity:', err);
      setError(err.message || 'Failed to get activity');
      return null;
    }
  };

  // ============================================================================
  // LIVE TRACKING ACTIONS
  // ============================================================================

  /**
   * Start live tracking for cycling/running
   */
  const startLiveTracking = async (activityType: ActivityType): Promise<boolean> => {
    try {
      setError(null);
      setCurrentActivityType(activityType);

      const success = await locationTracker.startTracking(async (session) => {
        setTrackingSession(session);

        // Persist session to local storage for crash recovery (every 10 points)
        if (session.routePoints.length % 10 === 0) {
          await trackingSessionStorage.saveSession({
            activityType,
            startTime: new Date(Date.now() - session.duration * 1000).toISOString(),
            routePoints: session.routePoints,
            distance: session.distance,
            duration: session.duration,
            elevationGain: session.elevationGain,
            isPaused: !session.isTracking,
          });
        }
      });

      if (success) {
        setIsTracking(true);

        // Save initial tracking session
        await trackingSessionStorage.saveSession({
          activityType,
          startTime: new Date().toISOString(),
          routePoints: [],
          distance: 0,
          duration: 0,
          elevationGain: 0,
          isPaused: false,
        });

        return true;
      } else {
        setError('Failed to start location tracking');
        return false;
      }
    } catch (err: any) {
      console.error('Error starting live tracking:', err);
      setError(err.message || 'Failed to start tracking');
      return false;
    }
  };

  /**
   * Stop live tracking and save activity
   */
  const stopLiveTracking = async (): Promise<Activity | null> => {
    try {
      const finalSession = await locationTracker.stopTracking();
      setIsTracking(false);
      setTrackingSession(null);

      // Clear any persisted tracking session
      await trackingSessionStorage.clearSession();

      if (!user || !currentActivityType) {
        setError('Cannot save activity: missing user or activity type');
        return null;
      }

      // Convert route points to the format expected by Django
      const route = finalSession.routePoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
        altitude: point.altitude,
        speed: point.speed,
        timestamp: new Date(point.timestamp).toISOString(),
      }));

      // Get start location
      const startLatitude = finalSession.routePoints.length > 0
        ? finalSession.routePoints[0].latitude
        : undefined;
      const startLongitude = finalSession.routePoints.length > 0
        ? finalSession.routePoints[0].longitude
        : undefined;

      // Calculate start and end times
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - finalSession.duration * 1000);

      // Create activity from tracking session
      const activityData: CreateActivityData = {
        type: currentActivityType,
        title: `${currentActivityType} Activity`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: Math.round(finalSession.duration / 60), // Convert to minutes
        distance: Math.round(finalSession.distance),
        average_speed: finalSession.averageSpeed * 3.6, // Convert m/s to km/h
        elevation_gain: Math.round(finalSession.elevationGain),
        start_latitude: startLatitude,
        start_longitude: startLongitude,
        route: route,
        notes: `Tracked route with ${route.length} points`,
      };

      const success = await createActivity(activityData);

      if (success) {
        // Return the newly created activity
        return recentActivities[0] || null;
      }

      return null;
    } catch (err: any) {
      console.error('Error stopping live tracking:', err);
      setError(err.message || 'Failed to save activity');
      return null;
    }
  };

  /**
   * Pause live tracking
   */
  const pauseLiveTracking = () => {
    locationTracker.pauseTracking();
    const session = locationTracker.getSession();
    setTrackingSession(session);
  };

  /**
   * Resume live tracking
   */
  const resumeLiveTracking = () => {
    locationTracker.resumeTracking((session) => {
      setTrackingSession(session);
    });
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: ActivityContextType = {
    // State
    recentActivities,
    loading,
    error,
    isTracking,
    trackingSession,

    // Actions
    refreshActivities,
    createActivity,
    editActivity,
    removeActivity,
    getActivity,

    // Live Tracking
    startLiveTracking,
    stopLiveTracking,
    pauseLiveTracking,
    resumeLiveTracking,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to use Activity context
 */
export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);

  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }

  return context;
};
