/**
 * Activity Logging Modal - Supports manual entry and live GPS tracking
 * Features live map view for cycling routes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { ActivityType } from '../models/types';
import { useActivity } from '../contexts/ActivityContext';
import { formatDistance, formatSpeed, formatDuration } from '../services/locationTrackingService';

// ============================================================================
// TYPES
// ============================================================================

type LoggingMode = 'manual' | 'live';

interface ActivityLoggingModalProps {
  visible: boolean;
  onClose: () => void;
  initialActivityType?: ActivityType;
  mode?: LoggingMode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#0D9488',
  primaryDark: '#0F766E',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const ACTIVITY_TYPES: ActivityType[] = ['Run', 'Cycle', 'Walk', 'Swim', 'Yoga', 'Strength'];

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  Run: '🏃',
  Cycle: '🚴',
  Walk: '🚶',
  Swim: '🏊',
  Yoga: '🧘',
  Strength: '💪',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ActivityLoggingModal: React.FC<ActivityLoggingModalProps> = ({
  visible,
  onClose,
  initialActivityType = 'Cycle',
  mode: initialMode = 'manual',
}) => {
  const {
    createActivity,
    isTracking,
    trackingSession,
    startLiveTracking,
    stopLiveTracking,
    pauseLiveTracking,
    resumeLiveTracking,
  } = useActivity();

  // State
  const [mode, setMode] = useState<LoggingMode>(initialMode);
  const [selectedType, setSelectedType] = useState<ActivityType>(initialActivityType);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDuration('');
      setDistance('');
      setNotes('');
      setMode(initialMode);
      setSelectedType(initialActivityType);
      setIsPaused(false);
    }
  }, [visible, initialMode, initialActivityType]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStartLiveTracking = async () => {
    const success = await startLiveTracking(selectedType);
    if (!success) {
      Alert.alert(
        'Permission Required',
        'Please grant location permission to track your route.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeLiveTracking();
      setIsPaused(false);
    } else {
      pauseLiveTracking();
      setIsPaused(true);
    }
  };

  const handleStopLiveTracking = async () => {
    Alert.alert(
      'Stop Tracking',
      'Do you want to save this activity?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await stopLiveTracking();
            onClose();
          },
        },
        {
          text: 'Save',
          onPress: async () => {
            setSaving(true);
            const activity = await stopLiveTracking();
            setSaving(false);
            if (activity) {
              Alert.alert('Success', 'Activity saved!');
              onClose();
            } else {
              Alert.alert('Error', 'Failed to save activity');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleManualSave = async () => {
    if (!duration) {
      Alert.alert('Error', 'Please enter duration');
      return;
    }

    setSaving(true);

    const durationMinutes = parseInt(duration, 10);
    const distanceMeters = distance ? parseFloat(distance) * 1000 : undefined;

    // Create activity with Django API format
    const now = new Date();
    const startTime = new Date(now.getTime() - durationMinutes * 60000); // Calculate start time based on duration

    const success = await createActivity({
      type: selectedType,
      title: title || `${selectedType} Activity`,
      start_time: startTime.toISOString(),
      end_time: now.toISOString(),
      duration: durationMinutes,
      distance: distanceMeters,
      notes,
    });

    setSaving(false);

    if (success) {
      Alert.alert('Success', 'Activity logged!');
      onClose();
    } else {
      Alert.alert('Error', 'Failed to log activity');
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
        onPress={() => !isTracking && setMode('manual')}
        disabled={isTracking}
      >
        <Text style={[styles.modeButtonText, mode === 'manual' && styles.modeButtonTextActive]}>
          Quick Log
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'live' && styles.modeButtonActive]}
        onPress={() => !isTracking && setMode('live')}
        disabled={isTracking}
      >
        <Text style={[styles.modeButtonText, mode === 'live' && styles.modeButtonTextActive]}>
          Live Tracking
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActivityTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activity Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScroll}
      >
        {ACTIVITY_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonActive,
            ]}
            onPress={() => !isTracking && setSelectedType(type)}
            disabled={isTracking}
          >
            <Text style={styles.typeIcon}>{ACTIVITY_ICONS[type]}</Text>
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderManualForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {renderActivityTypeSelector()}

      <View style={styles.section}>
        <Text style={styles.label}>Title (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder={`${selectedType} Activity`}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Duration (minutes) *</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Distance (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="5.0"
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="How did it feel?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleManualSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Activity</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLiveTracking = () => {
    const session = trackingSession;
    const hasRoute = session && session.routePoints.length > 0;

    return (
      <View style={styles.liveContainer}>
        {!isTracking ? (
          // Pre-tracking state
          <View style={styles.preTrackingContainer}>
            {renderActivityTypeSelector()}
            <View style={styles.startTrackingInfo}>
              <Text style={styles.startTrackingTitle}>Ready to track your {selectedType.toLowerCase()}?</Text>
              <Text style={styles.startTrackingText}>
                GPS tracking will record your route, distance, and speed in real-time.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.startTrackingButton}
              onPress={handleStartLiveTracking}
            >
              <Text style={styles.startTrackingButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Active tracking state
          <>
            {/* Map View */}
            {hasRoute && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: session.routePoints[0].latitude,
                  longitude: session.routePoints[0].longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
                followsUserLocation
              >
                {/* Route polyline */}
                <Polyline
                  coordinates={session.routePoints.map((point) => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }))}
                  strokeColor={COLORS.primary}
                  strokeWidth={4}
                />

                {/* Start marker */}
                <Marker
                  coordinate={{
                    latitude: session.routePoints[0].latitude,
                    longitude: session.routePoints[0].longitude,
                  }}
                  title="Start"
                  pinColor="green"
                />

                {/* Current position marker */}
                {session.routePoints.length > 1 && (
                  <Marker
                    coordinate={{
                      latitude: session.routePoints[session.routePoints.length - 1].latitude,
                      longitude: session.routePoints[session.routePoints.length - 1].longitude,
                    }}
                    title="Current"
                  />
                )}
              </MapView>
            )}

            {/* Metrics overlay */}
            <View style={styles.metricsOverlay}>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {formatDistance(session?.distance || 0)}
                  </Text>
                  <Text style={styles.metricLabel}>Distance</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {formatDuration(session?.duration || 0)}
                  </Text>
                  <Text style={styles.metricLabel}>Time</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {formatSpeed(session?.currentSpeed || 0)}
                  </Text>
                  <Text style={styles.metricLabel}>Speed</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {formatSpeed(session?.averageSpeed || 0)}
                  </Text>
                  <Text style={styles.metricLabel}>Avg Speed</Text>
                </View>
              </View>
            </View>

            {/* Control buttons */}
            <View style={styles.controlsOverlay}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePauseResume}
              >
                <Text style={styles.controlButtonText}>
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStopLiveTracking}
              >
                <Text style={[styles.controlButtonText, styles.stopButtonText]}>
                  ⏹️ Stop
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={isTracking}>
            <Text style={[styles.headerButton, isTracking && styles.headerButtonDisabled]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Activity</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Mode Selector */}
        {renderModeSelector()}

        {/* Content */}
        {mode === 'manual' ? renderManualForm() : renderLiveTracking()}
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    width: 60,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeButtonTextActive: {
    color: COLORS.surface,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  typeScroll: {
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 80,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.surface,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  liveContainer: {
    flex: 1,
  },
  preTrackingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  startTrackingInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  startTrackingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  startTrackingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  startTrackingButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startTrackingButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface,
  },
  map: {
    flex: 1,
  },
  metricsOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stopButton: {
    backgroundColor: COLORS.error,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stopButtonText: {
    color: COLORS.surface,
  },
});

export default ActivityLoggingModal;
