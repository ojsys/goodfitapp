import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  StatusBar,
  Pressable,
} from 'react-native';

// -------------------------------------------------------------------------
// Types & Interfaces
// -------------------------------------------------------------------------

type Intention = {
  id: string;
  label: string;
  selected: boolean;
};

type Availability = {
  id: string;
  label: string;
  isEnabled: boolean;
};

// -------------------------------------------------------------------------
// Constants & Theme
// -------------------------------------------------------------------------

const COLORS = {
  background: '#F7F9F8', // Calm off-white
  cardBg: '#FFFFFF',
  primary: '#4A8B71', // Sage Green - Wellness tone
  secondary: '#E8F3ED', // Light Sage
  textMain: '#1A1C1E',
  textSecondary: '#6C757D',
  border: '#E0E0E0',
  error: '#D32F2F',
  white: '#FFFFFF',
  shadow: '#000000',
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
  l: 18,
  xl: 24,
  xxl: 32,
};

const AVATAR_SIZE = 96;

// -------------------------------------------------------------------------
// Mock Data
// -------------------------------------------------------------------------

const MOCK_USER = {
  name: 'Alex Chen',
  location: 'Seattle, WA',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
};

// -------------------------------------------------------------------------
// Helper Components
// -------------------------------------------------------------------------

/**
 * Simple Icon Placeholder using Text to avoid external dependencies.
 * In a real app, replace with SVG or Lucide icons.
 */
const Icon = ({ name, size = 24, color = COLORS.textMain }: { name: string; size?: number; color?: string }) => {
  const getIcon = () => {
    switch (name) {
      case 'settings': return '⚙️';
      case 'edit': return '✏️';
      case 'close': return '✕';
      case 'plus': return '＋';
      case 'check': return '✓';
      case 'user': return '👤';
      case 'home': return '🏠';
      case 'message': return '💬';
      case 'calendar': return '📅';
      default: return '?';
    }
  };

  // Adjust style to strip emoji color where possible or just use as is
  return (
    <Text style={{ fontSize: size - 4, color, fontWeight: 'bold' }}>
      {getIcon()}
    </Text>
  );
};

const Checkbox = ({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) => (
  <Pressable style={styles.checkboxRow} onPress={onPress}>
    <View style={[styles.checkboxBase, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkboxCheckMark}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </Pressable>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

// -------------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------------

const ProfileManagementScreen: React.FC = () => {
  // --- State ---
  const [bio, setBio] = useState('Training for life. Love coffee after a good run.');
  
  const [interests, setInterests] = useState<string[]>([
    'Cycling', 'Meditation', 'Cooking', 'Running'
  ]);

  const [intentions, setIntentions] = useState<Intention[]>([
    { id: '1', label: 'Meet people', selected: true },
    { id: '2', label: 'Stay fit', selected: true },
    { id: '3', label: 'Explore dating', selected: false },
    { id: '4', label: 'Find events', selected: true },
  ]);

  const [availability, setAvailability] = useState<Availability[]>([
    { id: 'weekdays', label: 'Weekdays', isEnabled: true },
    { id: 'weekends', label: 'Weekends', isEnabled: false },
    { id: 'open', label: 'Open to new experiences', isEnabled: true },
  ]);

  // --- Handlers ---
  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const toggleIntention = (id: string) => {
    setIntentions(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleAvailability = (id: string) => {
    setAvailability(prev => prev.map(item => 
      item.id === id ? { ...item, isEnabled: !item.isEnabled } : item
    ));
  };

  // --- Render ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="settings" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Hero / Avatar Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: MOCK_USER.avatarUrl }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editBadge}>
              <Icon name="edit" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
          <Text style={styles.userLocation}>{MOCK_USER.location}</Text>
        </View>

        {/* Bio Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SectionHeader title="Bio" />
            <TouchableOpacity>
              <Text style={styles.linkText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            multiline
            scrollEnabled={false}
            placeholder="Tell us about yourself..."
          />
        </View>

        {/* Interests Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SectionHeader title="Interests" />
            <TouchableOpacity>
               <Icon name="plus" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsContainer}>
            {interests.map((interest) => (
              <View key={interest} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
                <TouchableOpacity 
                  onPress={() => removeInterest(interest)}
                  style={styles.chipRemove}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Icon name="close" size={10} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Intentions Section */}
        <View style={styles.card}>
          <SectionHeader title="Intentions" />
          <View style={styles.listContainer}>
            {intentions.map((item) => (
              <Checkbox 
                key={item.id}
                label={item.label}
                checked={item.selected}
                onPress={() => toggleIntention(item.id)}
              />
            ))}
          </View>
        </View>

        {/* Availability Section */}
        <View style={styles.card}>
          <SectionHeader title="Availability" />
          <View style={styles.listContainer}>
            {availability.map((item) => (
              <View key={item.id} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Switch
                  trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                  thumbColor={COLORS.white}
                  ios_backgroundColor="#D1D5DB"
                  onValueChange={() => toggleAvailability(item.id)}
                  value={item.isEnabled}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Extra spacing for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// -------------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  iconButton: {
    padding: SPACING.s,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    // Soft shadow
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.l,
    marginTop: SPACING.s,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.s,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: FONT_SIZE.l,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  userLocation: {
    fontSize: FONT_SIZE.s,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    // Soft shadow for depth
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.m,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: SPACING.s,
  },
  linkText: {
    fontSize: FONT_SIZE.s,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bioInput: {
    fontSize: FONT_SIZE.s,
    color: COLORS.textMain,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    marginBottom: 8,
  },
  chipText: {
    fontSize: FONT_SIZE.s,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  chipRemove: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkboxBase: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCheckMark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.m,
    color: COLORS.textMain,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: FONT_SIZE.m,
    color: COLORS.textMain,
  },
});

export default ProfileManagementScreen;