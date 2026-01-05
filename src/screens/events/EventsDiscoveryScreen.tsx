import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import eventsService, { Event, EventFilters } from '../../services/eventsService';

// --- Constants & Theme ---
const COLORS = {
  primary: '#4A8B71', // Calm Sage Green
  primaryLight: '#E6F0EB',
  secondary: '#ED8936', // Warm Coral/Orange
  background: '#F7F9FC', // Soft Cloud White
  card: '#FFFFFF',
  textMain: '#1A202C',
  textSub: '#718096',
  border: '#E2E8F0',
  success: '#38A169',
  shadow: '#000000',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const FILTERS = ['This Week', 'Yoga', 'Run Club', 'Social', 'Meditation', 'Hiking'];

// --- Components ---

const VibeBadge = ({ vibe }: { vibe: string }) => {
  let bg = '#EDF2F7';
  let text = '#4A5568';

  switch (vibe) {
    case 'Chill':
      bg = '#E6FFFA';
      text = '#2C7A7B';
      break;
    case 'Intense':
      bg = '#FFF5F5';
      text = '#C53030';
      break;
    case 'Social':
      bg = '#EBF8FF';
      text = '#2B6CB0';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{vibe} Vibe</Text>
    </View>
  );
};

const AvatarStack = ({ avatars, total }: { avatars: string[]; total: number }) => {
  return (
    <View style={styles.avatarContainer}>
      {avatars.slice(0, 3).map((uri, index) => (
        <Image
          key={index}
          source={{ uri }}
          style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10 }]}
        />
      ))}
      {total > 3 && (
        <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -10 }]}>
          <Text style={styles.moreAvatarText}>+{total - 3}</Text>
        </View>
      )}
    </View>
  );
};

const EventCard = ({ event, onPress }: { event: Event; onPress: () => void }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Card Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image_url }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.badgeOverlay}>
          <VibeBadge vibe={event.vibe} />
          {event.price_type === 'Free' && (
            <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
              <Text style={[styles.badgeText, { color: '#FFF' }]}>Free</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{event.formatted_date} • {event.formatted_time}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>{event.location_name}</Text>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.attendeeContainer}>
            <AvatarStack avatars={event.attendee_avatars} total={event.attendee_count} />
            <Text style={styles.attendeeLabel}>Going</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.rsvpButton,
              pressed && styles.rsvpButtonPressed
            ]}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <Text style={styles.rsvpButtonText}>RSVP</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

// --- Main Component ---
const EventsDiscoveryScreen = ({ navigation }: any) => {
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [activeFilter, searchQuery]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters: EventFilters = {
        time: 'upcoming',
      };

      // Add search query if present
      if (searchQuery) {
        filters.search = searchQuery;
      }

      // Map filter to API parameters
      if (activeFilter !== 'This Week') {
        filters.tags = activeFilter;
      }

      const response = await eventsService.getEvents(filters);

      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events or zip code"
            placeholderTextColor={COLORS.textSub}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Event Feed */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No Events Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Check back soon for upcoming events!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id, event: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterIcon: {
    fontSize: 18,
    opacity: 0.7,
  },

  // Filters
  filterContainer: {
    height: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSub,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for Bottom Nav
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Card Content
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
    width: 20,
    textAlign: 'center',
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attendeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  moreAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CBD5E0',
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A5568',
  },
  attendeeLabel: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  rsvpButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  rsvpButtonPressed: {
    backgroundColor: COLORS.primaryLight,
  },
  rsvpButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, // Safe area for iPhone X+
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.4,
  },
  navIconActive: {
    opacity: 1,
    color: COLORS.primary, // Note: Emoji color can't be changed, but opacity handles inactive state visually well
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSub,
  },
  navLabelActive: {
    color: COLORS.primary,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSub,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EventsDiscoveryScreen;