import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import matchingService, { MatchedUser, SwipeAction } from '../../services/matchingService';

// ────────────────────────────────────────────────────────────────────────────────
// CONFIGURATION & THEME
// ────────────────────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#2A9D8F', // Calming Teal
  primaryDark: '#1F7A6F',
  secondary: '#E9C46A', // Warm Yellow
  background: '#F0F4F3', // Soft Wellness White
  surface: '#FFFFFF',
  text: '#264653',
  textSecondary: '#6B858D',
  white: '#FFFFFF',
  errorBackground: '#FFEBEE',
  error: '#EF5350',
  successBackground: '#E8F5E9',
  success: '#66BB6A',
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  glass: 'rgba(255, 255, 255, 0.2)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
};

const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

const FONT_SIZE = {
  xs: 12,
  s: 14,
  m: 16,
  l: 20,
  xl: 28,
  xxl: 34,
};

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

const formatDistance = (distance?: number): string => {
  if (!distance) return 'Location not shared';
  return `${distance} mi away`;
};

// ────────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────────────────────

const TabSegment = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.tabSegment, active && styles.tabSegmentActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const Chip = ({ label }: { label: string }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const ActionButton = ({ 
  icon, 
  color, 
  backgroundColor, 
  size = 60, 
  onPress,
  scale = 1
}: { 
  icon: string; 
  color: string; 
  backgroundColor: string; 
  size?: number; 
  onPress?: () => void;
  scale?: number;
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton, 
      { 
        width: size * scale, 
        height: size * scale, 
        backgroundColor,
        borderRadius: (size * scale) / 2
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={{ fontSize: size * 0.45, color }}>{icon}</Text>
  </TouchableOpacity>
);

// ────────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT: MatchingDiscoveryScreen
// ────────────────────────────────────────────────────────────────────────────────

export default function MatchingDiscoveryScreen() {
  const [activeTab, setActiveTab] = useState<'Buddies' | 'Vibe' | 'Community'>('Buddies');
  const [users, setUsers] = useState<MatchedUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await matchingService.discoverUsers();

      if (response.success && response.data) {
        setUsers(response.data);
        setCurrentIndex(0);
      } else {
        Alert.alert('Error', response.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: SwipeAction) => {
    const currentUser = users[currentIndex];
    if (!currentUser || swiping) return;

    try {
      setSwiping(true);
      const response = await matchingService.swipeUser(currentUser.user_id, action);

      if (response.success) {
        // Check if it's a match
        if (response.data?.is_match) {
          Alert.alert(
            "It's a Match! 🎉",
            `You and ${currentUser.display_name} are now connected!`,
            [{ text: 'Awesome!', style: 'default' }]
          );
        }

        // Move to next user
        if (currentIndex < users.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // No more users, reload
          await loadUsers();
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to swipe');
      }
    } catch (error) {
      console.error('Error swiping:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSwiping(false);
    }
  };

  const currentUser = users[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER: Segmented Control */}
      <View style={styles.headerContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          <TabSegment 
            label="Fit Buddies" 
            active={activeTab === 'Buddies'} 
            onPress={() => setActiveTab('Buddies')} 
          />
          <TabSegment 
            label="Vibe Check" 
            active={activeTab === 'Vibe'} 
            onPress={() => setActiveTab('Vibe')} 
          />
          <TabSegment 
            label="Community" 
            active={activeTab === 'Community'} 
            onPress={() => setActiveTab('Community')} 
          />
        </ScrollView>
      </View>

      {/* MAIN CONTENT: Card Stack */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Finding your perfect match...</Text>
          </View>
        ) : !currentUser ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>😊</Text>
            <Text style={styles.emptyTitle}>No More Users</Text>
            <Text style={styles.emptyText}>
              Check back later for new potential matches!
            </Text>
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={loadUsers}
            >
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* The Card */}
            <View style={styles.card}>
              <Image
                source={{ uri: currentUser.profile_photo }}
                style={styles.cardImage}
                resizeMode="cover"
              />

              {/* Gradient Simulation Overlay */}
              <View style={styles.gradientOverlay} />

              {/* Card Content Overlay */}
              <View style={styles.cardContent}>

                {/* Prompt Bubble */}
                <View style={styles.promptBubble}>
                  <Text style={styles.promptText}>{currentUser.prompt_question}</Text>
                  <View style={styles.promptArrow} />
                </View>

                {/* User Info */}
                <View style={styles.infoSection}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>
                      {currentUser.display_name}{currentUser.age ? `, ${currentUser.age}` : ''}
                    </Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>
                      {currentUser.location_city || formatDistance(currentUser.distance)}
                    </Text>
                  </View>

                  {/* Interests Chips */}
                  <View style={styles.chipsContainer}>
                    {currentUser.favorite_activities?.map((activity, index) => (
                      <Chip key={index} label={activity} />
                    ))}
                    <Chip label={currentUser.fitness_level} />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* ACTION BAR: Swipe Actions */}
      {!loading && currentUser && (
        <View style={styles.actionBar}>
          {/* Pass Button */}
          <ActionButton
            icon="✕"
            color={COLORS.error}
            backgroundColor={COLORS.errorBackground}
            onPress={() => handleSwipe('pass')}
          />

          {/* Super Like Button (Smaller, Secondary) */}
          <ActionButton
            icon="⭐"
            color="#F57F17"
            backgroundColor="#FFF9C4"
            size={50}
            onPress={() => handleSwipe('super_like')}
          />

          {/* Like Button (Primary, Large) */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.8}
            onPress={() => handleSwipe('like')}
            disabled={swiping}
          >
            <Text style={styles.primaryActionIcon}>💚</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header Tabs
  headerContainer: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabSegment: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.s + 2,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.s,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Content Area
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.m, // Space for action bar
  },
  
  // Card
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: COLORS.overlay, // Fallback for gradient
    // Simulating gradient with opacity layering could be done here with multiple views if stricter visual adherence needed without libraries
    opacity: 0.9,
  },
  
  // Card Content
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  
  // Prompt Bubble
  promptBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: SPACING.m,
    maxWidth: '85%',
  },
  promptText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.s,
    fontWeight: '500',
    lineHeight: 20,
  },
  promptArrow: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
  },

  // Info Section
  infoSection: {
    marginBottom: SPACING.s,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  nameText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  locationIcon: {
    fontSize: FONT_SIZE.s,
    marginRight: 4,
  },
  locationText: {
    fontSize: FONT_SIZE.m,
    color: COLORS.white,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
  },
  chipText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: SPACING.l,
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.xl,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryActionButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryActionIcon: {
    fontSize: 28,
    color: COLORS.white,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: FONT_SIZE.m,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.m,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  emptyText: {
    fontSize: FONT_SIZE.m,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.l,
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: 24,
    marginTop: SPACING.m,
  },
  reloadButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.m,
    fontWeight: '600',
  },
});