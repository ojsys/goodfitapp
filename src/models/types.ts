/**
 * Core Data Models and Types for A Good Fit App
 */

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export type ActivityType = 'Run' | 'Yoga' | 'Walk' | 'Swim' | 'Strength' | 'Cycle';

export type IntensityLevel = 'low' | 'moderate' | 'high';

export type MoodType = 'energized' | 'tired' | 'happy' | 'neutral';

export type OnlineStatus = 'online' | 'away' | 'offline';

export type NotificationType = 'achievement' | 'social' | 'reminder' | 'event';

// ============================================================================
// USER MODELS
// ============================================================================

export interface UserGoals {
  selectedGoals: string[]; // from onboarding
  dailyStepGoal: number;
  weeklyWorkoutGoal: number;
  dailyCalorieGoal?: number;
  weeklyDistanceGoal?: number; // in meters
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  totalDistance: number; // in meters
  lastActivityDate?: Date;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  preferredActivities: ActivityType[];
  measurementSystem: 'metric' | 'imperial';
  shareActivities: boolean;
  weekStartsOn: 'sunday' | 'monday';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  bio?: string;
  location?: string;
  weight?: number; // in kg
  height?: number; // in cm
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  goals: UserGoals;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ACTIVITY MODELS
// ============================================================================

export interface ActivityMetrics {
  pace?: number; // min/km
  averageSpeed?: number; // km/h
  heartRate?: number; // bpm
  averageHeartRate?: number; // bpm
  maxHeartRate?: number; // bpm
  intensity?: IntensityLevel;
  elevationGain?: number; // in meters
}

export interface ActivityLocation {
  latitude: number;
  longitude: number;
  placeName?: string;
  city?: string;
  country?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  distance?: number; // in meters
  caloriesBurned?: number;
  steps?: number;
  metrics?: ActivityMetrics;
  location?: ActivityLocation;
  isPublic: boolean;
  mood?: MoodType;
  notes?: string;
  photos?: string[]; // URLs to activity photos
  likes?: number;
  comments?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DAILY SUMMARY MODELS
// ============================================================================

export interface GoalProgress {
  steps: boolean;
  calories: boolean;
  workouts: boolean;
  distance?: boolean;
}

export interface DailySummary {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  distance: number; // in meters
  workoutsCompleted: number;
  goalsMet: GoalProgress;
  activities: string[]; // activity IDs
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICATION MODELS
// ============================================================================

export interface NotificationMetadata {
  activityId?: string;
  userId?: string;
  eventId?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: NotificationMetadata;
  createdAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TimeOfDay {
  hours: number;
  minutes: number;
}

// ============================================================================
// FIRESTORE CONVERTER HELPERS
// ============================================================================

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Helper to convert Firestore timestamps to Date
export const timestampToDate = (timestamp: FirestoreTimestamp | Date): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp.seconds * 1000);
};

// Helper to convert Date to Firestore timestamp format
export const dateToTimestamp = (date: Date): FirestoreTimestamp => {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  };
};
