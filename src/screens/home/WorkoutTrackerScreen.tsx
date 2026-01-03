import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useActivity } from '../../contexts/ActivityContext';
import ActivityLoggingModal from '../../components/ActivityLoggingModal';

/**
 * MOCK DATA & TYPES
 */
type ActivityType = 'Run' | 'Yoga' | 'Walk' | 'Swim' | 'Strength' | 'Cycle';

interface ActivityLog {
  id: string;
  title: string;
  time: string;
  metric: string; // duration or distance
  type: ActivityType;
  iconChar: string;
  tintColor: string;
}

const RECENT_LOGS: ActivityLog[] = [
  {
    id: '1',
    title: 'Morning Yoga',
    time: '7:00 AM',
    metric: '45m',
    type: 'Yoga',
    iconChar: '☀️',
    tintColor: '#FEF3C7', // Soft yellow
  },
  {
    id: '2',
    title: 'Evening Walk',
    time: 'Yesterday',
    metric: '3km',
    type: 'Walk',
    iconChar: '👣',
    tintColor: '#DCFCE7', // Soft green
  },
  {
    id: '3',
    title: 'HIIT Workout',
    time: 'Yesterday',
    metric: '30m',
    type: 'Strength',
    iconChar: '💪',
    tintColor: '#FEE2E2', // Soft red
  },
];

const ACTIVITY_TYPES: ActivityType[] = ['Run', 'Yoga', 'Walk', 'Swim', 'Strength', 'Cycle'];

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  Run: '🏃',
  Cycle: '🚴',
  Walk: '🚶',
  Swim: '🏊',
  Yoga: '🧘',
  Strength: '💪',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  Run: '#FEE2E2', // Soft red
  Cycle: '#DBEAFE', // Soft blue
  Walk: '#DCFCE7', // Soft green
  Swim: '#E0F2FE', // Soft cyan
  Yoga: '#FEF3C7', // Soft yellow
  Strength: '#FCE7F3', // Soft pink
};

/**
 * Get time ago string from date
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * THEME CONSTANTS
 */
const COLORS = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#0D9488', // Teal
  secondary: '#64748B', // Slate
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  accent: '#F59E0B', // Orange/Flame
  border: '#E2E8F0',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

/**
 * SUB-COMPONENTS
 */

// Simple Icon Placeholder (Using Text/Emoji to avoid external SVG deps)
const Icon = ({ char, size = 20, color = COLORS.textPrimary }: { char: string; size?: number; color?: string }) => (
  <Text style={{ fontSize: size, color, textAlign: 'center' }}>{char}</Text>
);

const ActivityPill = ({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.pill,
      isSelected ? styles.pillActive : styles.pillInactive,
    ]}
  >
    <Text style={[styles.pillText, isSelected ? styles.pillTextActive : styles.pillTextInactive]}>
      {label}
    </Text>
  </Pressable>
);

const LogItem = ({ item, onPress }: { item: ActivityLog; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.logItemContainer}>
    <View style={[styles.logIconBox, { backgroundColor: item.tintColor }]}>
      <Icon char={item.iconChar} size={20} />
    </View>
    <View style={styles.logContent}>
      <Text style={styles.logTitle}>{item.title}</Text>
      <View style={styles.logMetaRow}>
        <Text style={styles.logMetaText}>{item.time}</Text>
        <View style={styles.dotSeparator} />
        <Text style={styles.logMetaText}>{item.metric}</Text>
      </View>
    </View>
    <View style={styles.logAction}>
      <Icon char="›" size={24} color={COLORS.secondary} />
    </View>
  </Pressable>
);

/**
 * MAIN COMPONENT: WorkoutTrackerHome
 */
const WorkoutTrackerHome: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const { userProfile, loading: userLoading, greeting, firstName } = useUser();
  const { recentActivities, loading: activitiesLoading, refreshActivities } = useActivity();

  // Listen for navigation parameter to open modal from tab bar
  React.useEffect(() => {
    if (route?.params?.openModal) {
      setShowActivityModal(true);
      // Clear the parameter
      navigation.setParams({ openModal: undefined });
    }
  }, [route?.params?.openModal]);

  // Show loading indicator while user data is being fetched
  if (userLoading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Get user data with fallbacks
  const displayName = firstName || userProfile?.displayName || 'User';
  const avatarUrl = userProfile?.avatarUrl || 'https://i.pravatar.cc/150?img=32';
  const isOnline = userProfile?.onlineStatus === 'online';
  const currentStreak = userProfile?.stats.currentStreak || 0;
  const todaySteps = 5432; // Will be replaced with real data in Phase 3
  const todayCalories = 320; // Will be replaced with real data in Phase 3

  // Convert real activities to display format
  // Safety check: ensure recentActivities is always an array
  const activitiesArray = Array.isArray(recentActivities) ? recentActivities : [];

  const displayActivities = activitiesArray.slice(0, 3).map((activity) => {
    // Safely parse the date with validation
    let timeAgo = 'Recently';
    if (activity.start_time) {
      try {
        const date = new Date(activity.start_time);
        if (!isNaN(date.getTime())) {
          timeAgo = getTimeAgo(date);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }

    const metric = activity.distance
      ? `${(activity.distance / 1000).toFixed(1)}km`
      : `${activity.duration}m`;

    return {
      id: String(activity.id),
      title: activity.title,
      time: timeAgo,
      metric,
      type: activity.type,
      iconChar: ACTIVITY_ICONS[activity.type] || '🏃',
      tintColor: ACTIVITY_COLORS[activity.type] || '#DCFCE7',
    };
  });

  // Handle refresh
  const handleRefresh = async () => {
    await refreshActivities();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER (Sticky Glassmorphic) */}
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
               {/* User Avatar */}
               <Image
                 source={{ uri: avatarUrl }}
                 style={styles.avatar}
               />
               {isOnline && <View style={styles.avatarStatus} />}
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingSub}>{greeting},</Text>
              <Text style={styles.greetingName}>{displayName}</Text>
            </View>
          </View>
          <Pressable style={styles.notificationBtn}>
            <Icon char="🔔" size={20} />
            <View style={styles.notificationBadge} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={activitiesLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* HERO SECTION */}
        <View style={styles.heroCard}>
          <View style={styles.progressRingContainer}>
            {/* Visual simulation of a 75% progress ring using borders */}
            <View style={styles.outerRing}>
              <View style={styles.innerRing}>
                 <View style={styles.ringContent}>
                   <Text style={styles.stepsValue}>5,432</Text>
                   <Text style={styles.stepsLabel}>Steps</Text>
                   <View style={styles.caloriesBadge}>
                     <Text style={styles.fireIcon}>🔥</Text>
                     <Text style={styles.caloriesText}>320 kcal</Text>
                   </View>
                 </View>
              </View>
            </View>
          </View>


          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>
              {currentStreak > 0 ? (
                <>You're on a roll! <Text style={{ fontWeight: 'bold' }}>{currentStreak} day streak</Text></>
              ) : (
                <>Start your streak today! 🔥</>
              )}
            </Text>
          </View>
        </View>

        {/* ACTIVITY GRID */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Log Activity</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.pillsContainer}
          >
            {ACTIVITY_TYPES.map((activity) => (
              <ActivityPill
                key={activity}
                label={activity}
                isSelected={selectedActivity === activity}
                onPress={() => setSelectedActivity(activity)}
              />
            ))}
          </ScrollView>
        </View>

        {/* RECENT LOGS */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => navigation.navigate('AllActivities')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          
          <View style={styles.logsList}>
            {displayActivities.length > 0 ? (
              displayActivities.map((item) => (
                <LogItem
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No activities yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap the + button to log your first activity!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Padding for Bottom Nav + FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Activity Logging Modal */}
      <ActivityLoggingModal
        visible={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        initialActivityType={selectedActivity || 'Cycle'}
        mode="manual"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  safeAreaTop: {
    backgroundColor: COLORS.glass,
    zIndex: 100,
    ...Platform.select({
      android: { paddingTop: StatusBar.currentHeight },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // HEADER
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.m,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981', // Online green
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  // HERO CARD
  heroCard: {
    margin: SPACING.l,
    padding: SPACING.l,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  progressRingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 15,
    borderColor: '#E2E8F0', // Base grey ring
    justifyContent: 'center',
    alignItems: 'center',
    // In a real app, use SVG. Here we simulate "progress" by coloring borders
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
    borderLeftColor: COLORS.primary,
    // This creates a 75% look roughly
    transform: [{ rotate: '-45deg' }],
  },
  innerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }], // Counter act the parent rotation
  },
  ringContent: {
    alignItems: 'center',
  },
  stepsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  stepsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED', // Orange tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fireIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  caloriesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2410C',
  },
  streakContainer: {
    marginTop: SPACING.s,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  streakText: {
    fontSize: 14,
    color: '#15803D',
  },

  // SECTIONS
  sectionContainer: {
    marginTop: SPACING.m,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.l,
    marginBottom: SPACING.m,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // PILLS
  pillsContainer: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.s,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: SPACING.s,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextInactive: {
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: '#FFF',
  },

  // LOGS
  logsList: {
    paddingHorizontal: SPACING.l,
  },
  logItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: 16,
    marginBottom: SPACING.m,
    ...SHADOWS.card,
    shadowOpacity: 0.03, // lighter shadow for list items
  },
  logIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  logMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 6,
  },
  logAction: {
    padding: SPACING.s,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

});

export default WorkoutTrackerHome;