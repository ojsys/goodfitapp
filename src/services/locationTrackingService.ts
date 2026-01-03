/**
 * Location Tracking Service - Handles GPS tracking for cycling and running activities
 * Provides real-time route tracking with distance and speed calculations
 */

import * as Location from 'expo-location';

// ============================================================================
// TYPES
// ============================================================================

export interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
}

export interface TrackingSession {
  routePoints: RoutePoint[];
  isTracking: boolean;
  distance: number; // in meters
  duration: number; // in seconds
  currentSpeed: number; // in m/s
  averageSpeed: number; // in m/s
  elevationGain: number; // in meters
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  message?: string;
}

// ============================================================================
// LOCATION PERMISSIONS
// ============================================================================

/**
 * Request location permissions from the user
 */
export const requestLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      return {
        granted: true,
        canAskAgain: true,
      };
    }

    return {
      granted: false,
      canAskAgain,
      message: canAskAgain
        ? 'Location permission denied. Please grant permission to track your route.'
        : 'Location permission permanently denied. Please enable it in your device settings.',
    };
  } catch (error: any) {
    console.error('Error requesting location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      message: 'Failed to request location permissions',
    };
  }
};

/**
 * Check if location permissions are granted
 */
export const checkLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error: any) {
    console.error('Error checking location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
};

/**
 * Request background location permissions (for future use)
 */
export const requestBackgroundLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.requestBackgroundPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain,
      message: status !== 'granted'
        ? 'Background location permission denied. Route tracking may stop when app is in background.'
        : undefined,
    };
  } catch (error: any) {
    console.error('Error requesting background location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
};

// ============================================================================
// LOCATION TRACKING CLASS
// ============================================================================

export class LocationTracker {
  private locationSubscription: Location.LocationSubscription | null = null;
  private session: TrackingSession = {
    routePoints: [],
    isTracking: false,
    distance: 0,
    duration: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    elevationGain: 0,
  };
  private startTime: number = 0;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start tracking the route
   */
  async startTracking(onUpdate?: (session: TrackingSession) => void): Promise<boolean> {
    try {
      // Check permissions
      const permissions = await checkLocationPermissions();
      if (!permissions.granted) {
        const result = await requestLocationPermissions();
        if (!result.granted) {
          console.error('Location permissions not granted');
          return false;
        }
      }

      // Reset session
      this.session = {
        routePoints: [],
        isTracking: true,
        distance: 0,
        duration: 0,
        currentSpeed: 0,
        averageSpeed: 0,
        elevationGain: 0,
      };
      this.startTime = Date.now();

      // Start location updates
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
          onUpdate?.(this.session);
        }
      );

      // Start duration timer
      this.intervalId = setInterval(() => {
        if (this.session.isTracking) {
          this.session.duration = Math.floor((Date.now() - this.startTime) / 1000);
          onUpdate?.(this.session);
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop tracking the route
   */
  async stopTracking(): Promise<TrackingSession> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.session.isTracking = false;
    this.session.duration = Math.floor((Date.now() - this.startTime) / 1000);

    return { ...this.session };
  }

  /**
   * Pause tracking
   */
  pauseTracking(): void {
    this.session.isTracking = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resume tracking
   */
  resumeTracking(onUpdate?: (session: TrackingSession) => void): void {
    this.session.isTracking = true;
    this.startTime = Date.now() - this.session.duration * 1000;

    // Restart duration timer
    this.intervalId = setInterval(() => {
      if (this.session.isTracking) {
        this.session.duration = Math.floor((Date.now() - this.startTime) / 1000);
        onUpdate?.(this.session);
      }
    }, 1000);
  }

  /**
   * Get current tracking session
   */
  getSession(): TrackingSession {
    return { ...this.session };
  }

  /**
   * Handle location updates
   */
  private handleLocationUpdate(location: Location.LocationObject): void {
    const newPoint: RoutePoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude || undefined,
      speed: location.coords.speed || undefined,
      timestamp: location.timestamp,
    };

    this.session.routePoints.push(newPoint);

    // Calculate distance if we have at least 2 points
    if (this.session.routePoints.length >= 2) {
      const previousPoint = this.session.routePoints[this.session.routePoints.length - 2];
      const distance = this.calculateDistance(previousPoint, newPoint);
      this.session.distance += distance;
    }

    // Update current speed
    if (location.coords.speed !== null) {
      this.session.currentSpeed = location.coords.speed;
    }

    // Calculate average speed
    if (this.session.duration > 0) {
      this.session.averageSpeed = this.session.distance / this.session.duration;
    }

    // Calculate elevation gain
    if (this.session.routePoints.length >= 2) {
      const previousPoint = this.session.routePoints[this.session.routePoints.length - 2];
      if (
        previousPoint.altitude !== undefined &&
        newPoint.altitude !== undefined &&
        newPoint.altitude > previousPoint.altitude
      ) {
        this.session.elevationGain += newPoint.altitude - previousPoint.altitude;
      }
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current location once
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const permissions = await checkLocationPermissions();
    if (!permissions.granted) {
      const result = await requestLocationPermissions();
      if (!result.granted) {
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to get address/place name
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const result = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (result && result.length > 0) {
      const address = result[0];
      const parts = [];

      if (address.name) parts.push(address.name);
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.region) parts.push(address.region);

      return parts.join(', ');
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(2)}km`;
};

/**
 * Format speed for display
 */
export const formatSpeed = (metersPerSecond: number): string => {
  const kmPerHour = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(1)} km/h`;
};

/**
 * Format pace for display (min/km)
 */
export const formatPace = (metersPerSecond: number): string => {
  if (metersPerSecond === 0) return '--:--';

  const kmPerHour = metersPerSecond * 3.6;
  const minPerKm = 60 / kmPerHour;
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
