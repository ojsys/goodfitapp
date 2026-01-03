import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../contexts/ActivityContext';
import { Activity, ActivityType } from '../../services/activityService';

const COLORS = {
  primary: '#0D9488',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  Run: '🏃',
  Cycle: '🚴',
  Walk: '🚶',
  Swim: '🏊',
  Yoga: '🧘',
  Strength: '💪',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  Run: '#FEE2E2',
  Cycle: '#DBEAFE',
  Walk: '#DCFCE7',
  Swim: '#E0F2FE',
  Yoga: '#FEF3C7',
  Strength: '#FCE7F3',
};

const getTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

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
  } catch (error) {
    return 'Recently';
  }
};

const AllActivitiesScreen: React.FC<any> = ({ navigation }) => {
  const { recentActivities, loading, refreshActivities } = useActivity();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshActivities();
    setRefreshing(false);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const timeAgo = getTimeAgo(item.start_time);
    const metric = item.distance
      ? `${(item.distance / 1000).toFixed(1)}km`
      : `${item.duration}m`;

    return (
      <Pressable
        style={styles.activityCard}
        onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
      >
        <View
          style={[
            styles.activityIcon,
            { backgroundColor: ACTIVITY_COLORS[item.type] || '#DCFCE7' },
          ]}
        >
          <Text style={styles.activityEmoji}>
            {ACTIVITY_ICONS[item.type] || '🏃'}
          </Text>
        </View>

        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityMetaText}>{timeAgo}</Text>
            <View style={styles.dot} />
            <Text style={styles.activityMetaText}>{metric}</Text>
            <View style={styles.dot} />
            <Text style={styles.activityMetaText}>{item.type}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Activities</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Activities List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : recentActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏃‍♂️</Text>
          <Text style={styles.emptyTitle}>No Activities Yet</Text>
          <Text style={styles.emptyText}>
            Start logging your workouts to see them here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 6,
  },
});

export default AllActivitiesScreen;
