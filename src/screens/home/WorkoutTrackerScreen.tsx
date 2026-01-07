import React, { useState, useEffect } from 'react';
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
import { matchingService } from '../../services/matchingService';
import { eventsService } from '../../services/eventsService';

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

interface NearbyMatch {
  id: string;
  name: string;
  age: number;
  distance: string;
  activities: ActivityType[];
  imageUrl: string;
  availability: 'Online' | 'Offline';
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

const NEARBY_MATCHES: NearbyMatch[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    distance: '0.8 mi',
    activities: ['Run', 'Yoga'],
    imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
    availability: 'Online',
  },
  {
    id: '2',
    name: 'Mike',
    age: 32,
    distance: '1.2 mi',
    activities: ['Cycle', 'Strength'],
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
    availability: 'Online',
  },
  {
    id: '3',
    name: 'Emma',
    age: 26,
    distance: '1.5 mi',
    activities: ['Swim', 'Yoga'],
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    availability: 'Offline',
  },
  {
    id: '4',
    name: 'David',
    age: 30,
    distance: '2.0 mi',
    activities: ['Run', 'Cycle'],
    imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400',
    availability: 'Online',
  },
  {
    id: '5',
    name: 'Lisa',
    age: 29,
    distance: '2.3 mi',
    activities: ['Strength', 'Walk'],
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    availability: 'Offline',
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

const MatchCard = ({ match, onPress }: { match: NearbyMatch; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.matchCard}>
    <Image source={{ uri: match.imageUrl }} style={styles.matchImage} />
    {match.availability === 'Online' && <View style={styles.onlineIndicator} />}
    <View style={styles.matchOverlay}>
      <Text style={styles.matchName}>{match.name}, {match.age}</Text>
      <View style={styles.matchDistanceRow}>
        <Text style={styles.matchDistanceIcon}>📍</Text>
        <Text style={styles.matchDistance}>{match.distance}</Text>
      </View>
      <View style={styles.matchActivities}>
        {match.activities.slice(0, 2).map((activity, index) => (
          <Text key={index} style={styles.matchActivityIcon}>
            {ACTIVITY_ICONS[activity]}
          </Text>
        ))}
      </View>
    </View>
  </Pressable>
);

/**
 * MAIN COMPONENT: WorkoutTrackerHome
 */
const WorkoutTrackerHome: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [nearbyMatches, setNearbyMatches] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

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

  // Fetch nearby matches
  useEffect(() => {
    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const response = await matchingService.discoverUsers();
        if (response.success && response.data) {
          setNearbyMatches(response.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await eventsService.getEvents({ time: 'upcoming' });
        if (response.success && response.data) {
          setUpcomingEvents(response.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

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

  // Calculate activity stats from logged activities
  const activitiesByType = Array.isArray(recentActivities) ? recentActivities : [];

  // Cycling stats
  const cyclingActivities = activitiesByType.filter(a => a.type === 'Cycle');
  const totalCyclingDistance = cyclingActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalCyclingRides = cyclingActivities.length;

  // Running stats
  const runningActivities = activitiesByType.filter(a => a.type === 'Run');
  const totalRunningDistance = runningActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalRuns = runningActivities.length;

  // Strength stats
  const strengthActivities = activitiesByType.filter(a => a.type === 'Strength');
  const totalStrengthDuration = strengthActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
  const totalStrengthWorkouts = strengthActivities.length;

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
        {/* STATS SECTION - 2x2 Grid */}
        <View style={styles.statsContainer}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            {/* Steps Card */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>👟</Text>
              </View>
              <Text style={styles.statValue}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeIcon}>🔥</Text>
                <Text style={styles.statBadgeText}>{todayCalories} kcal</Text>
              </View>
            </View>

            {/* Cycling Card */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>🚴</Text>
              </View>
              <Text style={styles.statValue}>
                {(totalCyclingDistance / 1000).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>km Cycled</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeIcon}>🚴</Text>
                <Text style={styles.statBadgeText}>
                  {totalCyclingRides} {totalCyclingRides === 1 ? 'ride' : 'rides'}
                </Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            {/* Running Card */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>🏃</Text>
              </View>
              <Text style={styles.statValue}>
                {(totalRunningDistance / 1000).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>km Run</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeIcon}>🏃</Text>
                <Text style={styles.statBadgeText}>
                  {totalRuns} {totalRuns === 1 ? 'run' : 'runs'}
                </Text>
              </View>
            </View>

            {/* Strength Card */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>💪</Text>
              </View>
              <Text style={styles.statValue}>
                {totalStrengthDuration}
              </Text>
              <Text style={styles.statLabel}>min Trained</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeIcon}>💪</Text>
                <Text style={styles.statBadgeText}>
                  {totalStrengthWorkouts} {totalStrengthWorkouts === 1 ? 'workout' : 'workouts'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Streak Container */}
        <View style={styles.streakCard}>
          <Text style={styles.streakText}>
            {currentStreak > 0 ? (
              <>You're on a roll! <Text style={{ fontWeight: 'bold' }}>{currentStreak} day streak</Text> 🔥</>
            ) : (
              <>Start your streak today! 🔥</>
            )}
          </Text>
        </View>

        {/* QUICK ACTIONS - Feature Cards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {/* GPS Tracking */}
            <Pressable
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('StartTracking')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.quickActionEmoji}>📍</Text>
              </View>
              <Text style={styles.quickActionLabel}>GPS Tracking</Text>
              <Text style={styles.quickActionSub}>Start workout</Text>
            </Pressable>

            {/* Events */}
            <Pressable
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('EventsTab')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.quickActionEmoji}>📅</Text>
              </View>
              <Text style={styles.quickActionLabel}>Events</Text>
              <Text style={styles.quickActionSub}>{upcomingEvents.length} upcoming</Text>
            </Pressable>

            {/* Find Matches */}
            <Pressable
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('MatchingDiscovery')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
                <Text style={styles.quickActionEmoji}>🤝</Text>
              </View>
              <Text style={styles.quickActionLabel}>Find Buddies</Text>
              <Text style={styles.quickActionSub}>{nearbyMatches.length} nearby</Text>
            </Pressable>

            {/* Messages */}
            <Pressable
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ChatTab')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0F2FE' }]}>
                <Text style={styles.quickActionEmoji}>💬</Text>
              </View>
              <Text style={styles.quickActionLabel}>Messages</Text>
              <Text style={styles.quickActionSub}>Chat now</Text>
            </Pressable>
          </View>
        </View>

        {/* NEARBY MATCHES SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Nearby Matches</Text>
            <Pressable onPress={() => navigation.navigate('MatchingDiscovery')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {loadingMatches ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : nearbyMatches.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {nearbyMatches.map((match) => (
                <Pressable
                  key={match.user_id}
                  onPress={() => navigation.navigate('MatchingDiscovery')}
                  style={styles.matchCard}
                >
                  <Image
                    source={{ uri: match.profile_image_url || 'https://i.pravatar.cc/300?img=' + match.user_id }}
                    style={styles.matchImage}
                  />
                  <View style={styles.matchOverlay}>
                    <Text style={styles.matchName}>{match.display_name}, {match.age}</Text>
                    <View style={styles.matchDistanceRow}>
                      <Text style={styles.matchDistanceIcon}>📍</Text>
                      <Text style={styles.matchDistance}>{match.distance?.toFixed(1) || '0.0'} mi</Text>
                    </View>
                    <View style={styles.matchActivities}>
                      {match.favorite_activities?.slice(0, 2).map((activity: string, index: number) => (
                        <Text key={index} style={styles.matchActivityIcon}>
                          {ACTIVITY_ICONS[activity as ActivityType] || '🏃'}
                        </Text>
                      ))}
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No matches yet</Text>
              <Text style={styles.emptyStateSubtext}>Check back soon for potential workout buddies!</Text>
            </View>
          )}
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

  // STATS SECTION - 2x2 Grid
  statsContainer: {
    paddingHorizontal: SPACING.l,
    marginTop: SPACING.m,
    marginBottom: SPACING.m,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.m,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.s,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C2410C',
  },
  streakCard: {
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
  },
  streakText: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
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

  // MATCHING SECTION
  matchesContainer: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.s,
  },
  matchCard: {
    width: 160,
    height: 220,
    borderRadius: 16,
    marginRight: SPACING.m,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  matchOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.m,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  matchName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: 4,
  },
  matchDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchDistanceIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  matchDistance: {
    fontSize: 11,
    color: COLORS.surface,
    fontWeight: '500',
  },
  matchActivities: {
    flexDirection: 'row',
    gap: 6,
  },
  matchActivityIcon: {
    fontSize: 14,
  },

  // QUICK ACTIONS
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.l,
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.m,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  quickActionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },

});

export default WorkoutTrackerHome;