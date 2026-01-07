import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import liveTrackingService, { LiveActivity, GPSPoint } from '../../services/liveTrackingService';
import Constants from 'expo-constants';

// Dynamically import MapView only in development builds
let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Polyline = maps.Polyline;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.log('Maps not available');
  }
}

const COLORS = {
  primary: '#4A7C59',
  primaryDark: '#3A6346',
  secondary: '#FFFFFF',
  background: '#F7F9F8',
  textMain: '#1F2937',
  textLight: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const { width, height } = Dimensions.get('window');

export default function LiveTrackingScreen({ navigation, route }: any) {
  const [liveActivity, setLiveActivity] = useState<LiveActivity | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<GPSPoint[]>([]);
  const [timer, setTimer] = useState(0);

  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      // Cleanup on unmount
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Start timer when tracking
    if (isTracking && !isPaused) {
      timerInterval.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTracking, isPaused]);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for GPS tracking');
        navigation.goBack();
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setCurrentLocation(location);

      // Center map on current location
      if (mapRef.current && location) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to get location permissions');
    }
  };

  const startTracking = async () => {
    try {
      const activityType = route.params?.activityType || 'Run';
      const title = route.params?.title || 'Workout';

      // Start live activity
      const response = await liveTrackingService.startActivity({
        type: activityType,
        title: title,
      });

      if (response.success && response.data) {
        setLiveActivity(response.data);
        setIsTracking(true);
        setTimer(0);

        // Start location tracking
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 10, // Update every 10 meters
            timeInterval: 3000, // Or every 3 seconds
          },
          async (location) => {
            setCurrentLocation(location);

            // Add GPS point to backend
            if (response.data && !isPaused) {
              const gpsResponse = await liveTrackingService.addGPSPoint(response.data.id, {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                altitude: location.coords.altitude || undefined,
                speed: location.coords.speed || undefined,
                accuracy: location.coords.accuracy || undefined,
              });

              if (gpsResponse.success && gpsResponse.data) {
                setLiveActivity(gpsResponse.data);
                setRouteCoordinates(gpsResponse.data.route_points);
              }
            }
          }
        );

        Alert.alert('Tracking Started', 'GPS tracking is now active');
      } else {
        Alert.alert('Error', response.error || 'Failed to start tracking');
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const pauseTracking = async () => {
    if (!liveActivity) return;

    try {
      const response = await liveTrackingService.pauseActivity(liveActivity.id);

      if (response.success && response.data) {
        setLiveActivity(response.data);
        setIsPaused(true);
        Alert.alert('Paused', 'Tracking paused');
      }
    } catch (error) {
      console.error('Error pausing:', error);
      Alert.alert('Error', 'Failed to pause tracking');
    }
  };

  const resumeTracking = async () => {
    if (!liveActivity) return;

    try {
      const response = await liveTrackingService.resumeActivity(liveActivity.id);

      if (response.success && response.data) {
        setLiveActivity(response.data);
        setIsPaused(false);
        Alert.alert('Resumed', 'Tracking resumed');
      }
    } catch (error) {
      console.error('Error resuming:', error);
      Alert.alert('Error', 'Failed to resume tracking');
    }
  };

  const stopTracking = async () => {
    if (!liveActivity) return;

    Alert.alert(
      'Stop Workout',
      'Are you sure you want to stop tracking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop location tracking
              if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
              }

              // Stop activity on backend
              const response = await liveTrackingService.stopActivity(liveActivity.id);

              if (response.success && response.data) {
                setIsTracking(false);
                Alert.alert('Workout Saved', 'Your activity has been saved!', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.error || 'Failed to stop tracking');
              }
            } catch (error) {
              console.error('Error stopping:', error);
              Alert.alert('Error', 'Failed to stop tracking');
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km.toFixed(2);
  };

  const formatPace = (): string => {
    if (!liveActivity || liveActivity.current_distance === 0) return '--:--';
    const pace = liveTrackingService.calculatePace(
      liveActivity.current_distance,
      liveActivity.active_duration
    );
    return liveTrackingService.formatPace(pace);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Map View */}
      <View style={styles.mapContainer}>
        {isExpoGo ? (
          // Fallback for Expo Go
          <View style={styles.expoGoFallback}>
            <Text style={styles.expoGoTitle}>📍 GPS Tracking</Text>
            <Text style={styles.expoGoMessage}>
              Maps require a development build.{'\n'}
              Run: npx expo run:ios or npx expo run:android
            </Text>
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoText}>
                Route points: {routeCoordinates.length}
              </Text>
              {currentLocation && (
                <Text style={styles.routeInfoText}>
                  Location: {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>
        ) : MapView ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            showsUserLocation
            followsUserLocation={isTracking}
            showsMyLocationButton={false}
            initialRegion={{
              latitude: currentLocation?.coords.latitude || 37.7749,
              longitude: currentLocation?.coords.longitude || -122.4194,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* Route Line */}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates.map((point) => ({
                  latitude: point.lat,
                  longitude: point.lng,
                }))}
                strokeColor={COLORS.primary}
                strokeWidth={4}
              />
            )}

            {/* Start Marker */}
            {routeCoordinates.length > 0 && (
              <Marker
                coordinate={{
                  latitude: routeCoordinates[0].lat,
                  longitude: routeCoordinates[0].lng,
                }}
                title="Start"
                pinColor={COLORS.success}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.expoGoFallback}>
            <Text style={styles.expoGoTitle}>Maps Unavailable</Text>
            <Text style={styles.expoGoMessage}>
              Please rebuild the app with native modules
            </Text>
          </View>
        )}

        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Metrics Panel */}
      <View style={styles.metricsPanel}>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>
              {liveActivity ? formatDistance(liveActivity.current_distance) : '0.00'}
            </Text>
            <Text style={styles.metricUnit}>km</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Time</Text>
            <Text style={styles.metricValue}>{formatTime(timer)}</Text>
            <Text style={styles.metricUnit}>duration</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Pace</Text>
            <Text style={styles.metricValue}>{formatPace()}</Text>
            <Text style={styles.metricUnit}>min/km</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Calories</Text>
            <Text style={styles.metricValue}>
              {liveActivity?.current_calories || 0}
            </Text>
            <Text style={styles.metricUnit}>kcal</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Speed</Text>
            <Text style={styles.metricValue}>
              {liveActivity?.current_speed?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.metricUnit}>km/h</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Points</Text>
            <Text style={styles.metricValue}>{routeCoordinates.length}</Text>
            <Text style={styles.metricUnit}>GPS</Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlPanel}>
        {!isTracking ? (
          <Pressable style={styles.startButton} onPress={startTracking}>
            <Text style={styles.startButtonText}>Start Tracking</Text>
          </Pressable>
        ) : (
          <View style={styles.trackingControls}>
            {isPaused ? (
              <Pressable style={styles.resumeButton} onPress={resumeTracking}>
                <Text style={styles.controlButtonText}>▶ Resume</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.pauseButton} onPress={pauseTracking}>
                <Text style={styles.controlButtonText}>⏸ Pause</Text>
              </Pressable>
            )}

            <Pressable style={styles.stopButton} onPress={stopTracking}>
              <Text style={styles.controlButtonText}>■ Stop</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  metricsPanel: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  controlPanel: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    paddingTop: SPACING.md,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trackingControls: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  expoGoFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 24,
  },
  expoGoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  expoGoMessage: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  routeInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  routeInfoText: {
    fontSize: 14,
    color: COLORS.textMain,
    marginBottom: 8,
  },
});
