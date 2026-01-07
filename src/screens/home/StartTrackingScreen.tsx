import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';

const COLORS = {
  primary: '#4A7C59',
  background: '#F7F9F8',
  card: '#FFFFFF',
  textMain: '#1F2937',
  textLight: '#6B7280',
  border: '#E2E8F0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const ACTIVITY_TYPES = [
  { type: 'Run', icon: '🏃', color: '#EF4444' },
  { type: 'Cycle', icon: '🚴', color: '#3B82F6' },
  { type: 'Walk', icon: '🚶', color: '#10B981' },
  { type: 'Hike', icon: '⛰️', color: '#F59E0B' },
  { type: 'Swim', icon: '🏊', color: '#06B6D4' },
  { type: 'Yoga', icon: '🧘', color: '#8B5CF6' },
];

export default function StartTrackingScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState('Run');
  const [title, setTitle] = useState('');

  const handleStart = () => {
    const activityTitle = title.trim() || `${selectedType} Session`;

    navigation.navigate('LiveTracking', {
      activityType: selectedType,
      title: activityTitle,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Start Workout</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Activity Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Type</Text>
          <View style={styles.activityGrid}>
            {ACTIVITY_TYPES.map((activity) => (
              <Pressable
                key={activity.type}
                style={[
                  styles.activityCard,
                  selectedType === activity.type && styles.activityCardSelected,
                ]}
                onPress={() => setSelectedType(activity.type)}
              >
                <Text style={styles.activityIcon}>{activity.icon}</Text>
                <Text
                  style={[
                    styles.activityName,
                    selectedType === activity.type && styles.activityNameSelected,
                  ]}
                >
                  {activity.type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Workout Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={`${selectedType} Session`}
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>GPS Tracking</Text>
            <Text style={styles.infoText}>
              Your location will be tracked during the workout to record your route, distance, and
              pace.
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <Pressable style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start GPS Tracking</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    fontSize: 28,
    color: COLORS.textMain,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: SPACING.md,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  activityCard: {
    width: '30%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activityCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E6F0EB',
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  activityNameSelected: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
