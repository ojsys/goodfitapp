import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useActivity } from '../../contexts/ActivityContext';
import { Activity, ActivityType } from '../../services/activityService';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatPace,
} from '../../services/locationTrackingService';

const COLORS = {
  primary: '#FF6B35',
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  success: '#4CAF50',
  error: '#F44336',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  Run: '#FF6B35',
  Cycle: '#4CAF50',
  Walk: '#2196F3',
  Swim: '#00BCD4',
  Yoga: '#9C27B0',
  Strength: '#F44336',
};

const ACTIVITY_ICONS: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  Run: 'fitness',
  Cycle: 'bicycle',
  Walk: 'walk',
  Swim: 'water',
  Yoga: 'body',
  Strength: 'barbell',
};

const ActivityDetailScreen: React.FC<any> = ({
  route,
  navigation,
}) => {
  const { activityId } = route.params;
  const { getActivity, removeActivity } = useActivity();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      // Convert activityId to number if it's a string
      const id = typeof activityId === 'string' ? parseInt(activityId, 10) : activityId;
      const activityData = await getActivity(id);
      setActivity(activityData);
    } catch (error) {
      console.error('Error loading activity:', error);
      Alert.alert('Error', 'Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Convert activityId to number if it's a string
              const id = typeof activityId === 'string' ? parseInt(activityId, 10) : activityId;
              const success = await removeActivity(id);
              if (success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to delete activity');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.textSecondary} />
          <Text style={styles.errorText}>Activity not found</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const activityColor = ACTIVITY_COLORS[activity.type];
  const activityIcon = ACTIVITY_ICONS[activity.type];
  const hasRoute = activity.route && activity.route.length > 0;
  const pace = activity.pace || 0;
  const avgSpeed = activity.average_speed || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Activity Details</Text>
        <Pressable onPress={handleDelete} style={styles.headerButton}>
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Activity Type Header */}
        <View style={[styles.activityHeader, { backgroundColor: activityColor }]}>
          <Ionicons name={activityIcon} size={48} color={COLORS.text} />
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDate}>{formatDate(activity.start_time)}</Text>
        </View>

        {/* Main Stats */}
        <View style={styles.statsContainer}>
          <View key="duration" style={styles.statCard}>
            <Ionicons name="time-outline" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{formatDuration(activity.duration * 60)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          {activity.distance !== undefined && activity.distance > 0 && (
            <View key="distance" style={styles.statCard}>
              <Ionicons name="navigate-outline" size={32} color={COLORS.primary} />
              <Text style={styles.statValue}>{formatDistance(activity.distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          )}

          <View key="calories" style={styles.statCard}>
            <Ionicons name="flame-outline" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{activity.calories_burned || 0}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        {/* Additional Metrics */}
        {(pace > 0 || avgSpeed > 0 || (activity.elevation_gain && activity.elevation_gain > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.metricsGrid}>
              {pace > 0 && (
                <View key="pace" style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Avg Pace</Text>
                  <Text style={styles.metricValue}>{formatPace(pace)}</Text>
                </View>
              )}
              {avgSpeed > 0 && (
                <View key="speed" style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Avg Speed</Text>
                  <Text style={styles.metricValue}>{formatSpeed(avgSpeed)}</Text>
                </View>
              )}
              {activity.elevation_gain && activity.elevation_gain > 0 && (
                <View key="elevation" style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Elevation Gain</Text>
                  <Text style={styles.metricValue}>{Math.round(activity.elevation_gain)}m</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Route Map */}
        {hasRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: activity.route![0].latitude,
                  longitude: activity.route![0].longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                {/* Start Marker */}
                <Marker
                  coordinate={{
                    latitude: activity.route![0].latitude,
                    longitude: activity.route![0].longitude,
                  }}
                  pinColor="green"
                  title="Start"
                />

                {/* End Marker */}
                <Marker
                  coordinate={{
                    latitude: activity.route![activity.route!.length - 1].latitude,
                    longitude: activity.route![activity.route!.length - 1].longitude,
                  }}
                  pinColor="red"
                  title="Finish"
                />

                {/* Route Polyline */}
                <Polyline
                  coordinates={activity.route!.map((point) => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }))}
                  strokeColor={activityColor}
                  strokeWidth={4}
                />
              </MapView>
            </View>
            <View style={styles.mapLegend}>
              <View key="start" style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
                <Text style={styles.legendText}>Start</Text>
              </View>
              <View key="finish" style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
                <Text style={styles.legendText}>Finish</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {activity.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{activity.notes}</Text>
            </View>
          </View>
        )}

        {/* Location Info */}
        {activity.start_address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>{activity.start_address}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  activityHeader: {
    padding: 24,
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
  },
  activityDate: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.8,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  metricsGrid: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBackground,
  },
  map: {
    flex: 1,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  notesContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

export default ActivityDetailScreen;
