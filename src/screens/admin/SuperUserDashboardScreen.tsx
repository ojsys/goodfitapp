import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';

// Types
interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: number;
  maxCapacity: number;
  image: string;
  status: 'Upcoming' | 'Past';
}

interface StatData {
  label: string;
  value: string | number;
  trend?: string; // e.g. "+12%"
}

// Mock Data
const STATS: StatData[] = [
  { label: 'Events Hosted', value: 3 },
  { label: 'Total RSVPs', value: 45, trend: '+12%' },
  { label: 'Avg Rating', value: 4.9 },
];

const EVENTS: EventData[] = [
  {
    id: '1',
    title: 'Full Moon Hike',
    date: 'Oct 24',
    time: '8:00 PM',
    attendees: 15,
    maxCapacity: 20,
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=200&h=200&fit=crop',
    status: 'Upcoming',
  },
  {
    id: '2',
    title: 'Sunrise Yoga in the Park',
    date: 'Oct 28',
    time: '6:30 AM',
    attendees: 22,
    maxCapacity: 25,
    image: 'https://images.unsplash.com/photo-1544367563-12123d896889?w=200&h=200&fit=crop',
    status: 'Upcoming',
  },
  {
    id: '3',
    title: 'Urban Cycling Tour',
    date: 'Nov 02',
    time: '10:00 AM',
    attendees: 8,
    maxCapacity: 15,
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=200&h=200&fit=crop',
    status: 'Upcoming',
  },
];

const WEEKLY_ENGAGEMENT = [45, 65, 50, 85]; // Percentages for the bar chart

// --- Components ---

const Header = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerTitle}>Host Dashboard</Text>
      <Text style={styles.headerSubtitle}>Manage your community</Text>
    </View>
    <Image
      source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }}
      style={styles.avatar}
    />
  </View>
);

const StatCard = ({ label, value, trend }: StatData) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && (
      <View style={styles.trendBadge}>
        <Text style={styles.trendText}>{trend}</Text>
      </View>
    )}
  </View>
);

const BarChart = () => {
  return (
    <View style={styles.chartContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Engagement</Text>
        <Text style={styles.sectionAction}>Last 4 Weeks</Text>
      </View>
      
      <View style={styles.chartBody}>
        {WEEKLY_ENGAGEMENT.map((height, index) => (
          <View key={index} style={styles.barWrapper}>
            <View style={[styles.barFill, { height: `${height}%` }]} />
            <Text style={styles.barLabel}>W{index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const EventCard = ({ event }: { event: EventData }) => {
  const fillPercentage = (event.attendees / event.maxCapacity) * 100;

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {event.date} • {event.time}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{event.status}</Text>
        </View>
      </View>

      <View style={styles.capacitySection}>
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityLabel}>Attendees</Text>
          <Text style={styles.capacityValue}>
            {event.attendees}/{event.maxCapacity} Spots
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${fillPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Message Group</Text>
        </Pressable>
      </View>
    </View>
  );
};

const CreateEventButton = () => (
  <Pressable style={styles.createButton}>
    <Text style={styles.createButtonIcon}>+</Text>
    <Text style={styles.createButtonText}>Create New Event</Text>
  </Pressable>
);

// --- Main Component ---

const SuperUserDashboard: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </View>

        {/* Engagement Chart */}
        <BarChart />

        {/* Events Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            <Text style={styles.sectionAction}>View All</Text>
          </View>
          {EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>

        {/* Create Event Button */}
        <CreateEventButton />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---

const COLORS = {
  background: '#F5F7F5', // Soft gray/green white
  white: '#FFFFFF',
  primary: '#2A9D8F', // Teal
  secondary: '#E9C46A', // Warm yellow/orange
  textDark: '#264653', // Dark charcoal
  textLight: '#6D7D8B',
  border: '#E0E5E0',
  success: '#4CAF50',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  trendBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },

  // Chart
  chartContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionAction: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    width: 40,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Events Section
  sectionContainer: {
    marginBottom: 24,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: COLORS.border,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusBadge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  capacitySection: {
    marginBottom: 16,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  capacityValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.textDark,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },

  // Create Button
  createButton: {
    width: '100%',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.05)',
  },
  createButtonIcon: {
    fontSize: 24,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: '300',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default SuperUserDashboard;