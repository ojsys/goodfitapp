import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  Pressable,
} from 'react-native';

// -----------------------------------------------------------------------------
// DESIGN SYSTEM & TOKENS
// -----------------------------------------------------------------------------

const COLORS = {
  primary: '#2A9D8F', // Calm Teal/Green
  primaryDark: '#21867a',
  secondary: '#E9C46A', // Warm Yellow for accents
  background: '#F8F9FA', // Soft off-white
  surface: '#FFFFFF',
  textMain: '#264653', // Dark Slate
  textSecondary: '#6C757D',
  textLight: '#AAB0B7',
  border: '#E9ECEF',
  success: '#4ADE80',
  error: '#EF476F',
  overlay: 'rgba(0,0,0,0.3)',
};

const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

const FONTS = {
  header: {
    fontSize: 24,
    fontWeight: '700' as '700',
    lineHeight: 32,
    color: COLORS.textMain,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600' as '600',
    lineHeight: 26,
    color: COLORS.textMain,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as '400',
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as '500',
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: COLORS.surface,
  },
};

const { width, height } = Dimensions.get('window');

// -----------------------------------------------------------------------------
// HELPER COMPONENTS
// -----------------------------------------------------------------------------

/**
 * Renders a simple icon using Image with tintColor to avoid external deps.
 * In a real project, replace with lucide-react-native.
 */
const Icon = ({ name, size = 20, color = COLORS.textMain }: { name: string; size?: number; color?: string }) => {
  // Mapping placeholder icons from a CDN for high-fidelity appearance without libraries
  const getIconUri = (iconName: string) => {
    switch (iconName) {
      case 'clock': return 'https://img.icons8.com/ios-filled/100/time.png';
      case 'map-pin': return 'https://img.icons8.com/ios-filled/100/marker.png';
      case 'users': return 'https://img.icons8.com/ios-filled/100/user-group-man-man.png';
      case 'zap': return 'https://img.icons8.com/ios-filled/100/lightning-bolt.png';
      case 'chevron-left': return 'https://img.icons8.com/ios-filled/100/back.png';
      case 'share': return 'https://img.icons8.com/ios-filled/100/upload.png';
      case 'check': return 'https://img.icons8.com/ios-filled/100/checkmark.png';
      default: return 'https://img.icons8.com/ios-filled/100/help.png';
    }
  };

  return (
    <Image
      source={{ uri: getIconUri(name) }}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
};

const InfoCard = ({ icon, label, subLabel }: { icon: string; label: string; subLabel: string }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconContainer}>
      <Icon name={icon} size={20} color={COLORS.primary} />
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoSubLabel}>{subLabel}</Text>
    </View>
  </View>
);

const BulletPoint = ({ text }: { text: string }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const HostBadge = () => (
  <View style={styles.hostContainer}>
    <Image
      source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' }}
      style={styles.hostAvatar}
    />
    <View>
      <Text style={styles.hostLabel}>Hosted by</Text>
      <Text style={styles.hostName}>Trail Blazers</Text>
    </View>
  </View>
);

// -----------------------------------------------------------------------------
// MAIN COMPONENT: Event Details & RSVP
// -----------------------------------------------------------------------------

const EventDetailsScreen = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasRsvp, setHasRsvp] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const handleRSVP = () => {
    // Simulate API call
    setHasRsvp(!hasRsvp);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* --- CONTENT SCROLL VIEW --- */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HERO IMAGE SECTION */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          
          {/* Header Navigation (Absolute) */}
          <SafeAreaView style={styles.headerNav}>
            <TouchableOpacity style={styles.iconButtonBlur}>
              <Icon name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButtonBlur}>
              <Icon name="share" size={20} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* BOTTOM SHEET CONTENT */}
        <View style={styles.sheetContainer}>
          
          {/* HANDLE INDICATOR (Visual Only) */}
          <View style={styles.handleIndicator} />

          {/* TITLE & HOST */}
          <View style={styles.section}>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>COMMUNITY EVENT</Text>
            </View>
            <Text style={styles.title}>Sunday Morning Trail Run</Text>
            <HostBadge />
          </View>

          {/* INFO GRID (2x2) */}
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <InfoCard icon="clock" label="08:00 AM" subLabel="This Sunday" />
              <InfoCard icon="map-pin" label="Griffith Park" subLabel="Los Angeles, CA" />
            </View>
            <View style={[styles.gridRow, { marginTop: SPACING.m }]}>
              <InfoCard icon="users" label="24 Going" subLabel="Open to all" />
              <InfoCard icon="zap" label="Social Pace" subLabel="Beginner Friendly" />
            </View>
          </View>

          <View style={styles.divider} />

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About the Event</Text>
            <Text 
              style={styles.descriptionText}
              numberOfLines={isExpanded ? undefined : 3}
            >
              Join us for a refreshing morning run through the scenic trails of Griffith Park. 
              We'll be keeping a social pace (approx. 10-11 min/mile), so it's perfect for 
              beginners or anyone looking to enjoy the view and good company. 
              We'll meet at the Ranger Station parking lot.
              {'\n\n'}
              After the run, we usually grab coffee at The Trails Cafe. Come for the fitness, stay for the friends!
            </Text>
            <TouchableOpacity onPress={toggleExpand} style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>{isExpanded ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>
          </View>

          {/* WHAT TO BRING */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>What to bring</Text>
            <View style={styles.bulletList}>
              <BulletPoint text="Water bottle (hydration is key!)" />
              <BulletPoint text="Trail running shoes or sturdy sneakers" />
              <BulletPoint text="Sunscreen and sunglasses" />
              <BulletPoint text="Positive vibes ✨" />
            </View>
          </View>

          {/* MAP PREVIEW */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Location</Text>
            <View style={styles.mapContainer}>
              {/* Static Map Placeholder */}
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }} 
                style={styles.mapImage} 
              />
              <View style={styles.mapPinOverlay}>
                <Icon name="map-pin" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelText}>Griffith Park Ranger Station</Text>
              </View>
            </View>
          </View>

          {/* PADDING FOR FOOTER */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* --- FLOATING FOOTER --- */}
      <View style={styles.footerContainer}>
        <View style={styles.footerContent}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>Free Event</Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.rsvpButton, 
              hasRsvp && styles.rsvpButtonActive
            ]} 
            onPress={handleRSVP}
            activeOpacity={0.8}
          >
            {hasRsvp ? (
              <View style={styles.rsvpContent}>
                <Icon name="check" size={20} color={COLORS.primary} />
                <Text style={[styles.rsvpText, { color: COLORS.primary }]}>Going</Text>
              </View>
            ) : (
              <Text style={styles.rsvpText}>RSVP Now</Text>
            )}
          </TouchableOpacity>
        </View>
        <SafeAreaView edges={['bottom']} />
      </View>
    </View>
  );
};

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // HERO
  heroContainer: {
    height: height * 0.35,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)', // Slight darken for header text visibility
  },
  headerNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
    zIndex: 10,
  },
  iconButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)', // iOS only props, ignored on Android safely
  },

  // SHEET
  sheetContainer: {
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    minHeight: height * 0.7,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.l,
    marginTop: SPACING.s,
  },

  // SECTIONS
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    ...FONTS.subheader,
    marginBottom: SPACING.m,
  },
  tagContainer: {
    backgroundColor: '#E0F2F1', // Light teal bg
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    marginBottom: SPACING.s,
  },
  tagText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    ...FONTS.header,
    marginBottom: SPACING.m,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xl,
    marginHorizontal: -SPACING.l, // Full width divider
  },

  // HOST
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostLabel: {
    ...FONTS.caption,
    fontSize: 12,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },

  // GRID
  gridContainer: {
    marginBottom: SPACING.xl,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Approx half with spacing
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA', // Very light teal
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.s,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  infoSubLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // TEXT CONTENT
  descriptionText: {
    ...FONTS.body,
  },
  readMoreButton: {
    marginTop: SPACING.s,
  },
  readMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // LIST
  bulletList: {
    marginTop: SPACING.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.m,
  },
  bulletText: {
    ...FONTS.body,
    flex: 1,
  },

  // MAP
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.border,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  mapPinOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
  },
  mapLabel: {
    position: 'absolute',
    bottom: SPACING.s,
    left: SPACING.s,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },

  // FOOTER
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: Platform.OS === 'ios' ? 0 : SPACING.m, // SafeAreaView handles iOS padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  rsvpButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: 16,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rsvpButtonActive: {
    backgroundColor: '#E0F2F1',
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  rsvpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rsvpText: {
    ...FONTS.button,
  },
});

export default EventDetailsScreen;