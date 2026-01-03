import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface GoalOption {
  id: string;
  label: string;
  iconUrl: string;
}

// Mock Data
const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'community',
    label: 'Find Community',
    // Using simple high-contrast icon placeholders
    iconUrl: 'https://img.icons8.com/ios/100/000000/users.png',
  },
  {
    id: 'fitness',
    label: 'Fitness Buddy',
    iconUrl: 'https://img.icons8.com/ios/100/000000/dumbbell.png',
  },
  {
    id: 'romantic',
    label: 'Romantic Spark',
    iconUrl: 'https://img.icons8.com/ios/100/000000/like.png',
  },
  {
    id: 'events',
    label: 'Local Events',
    iconUrl: 'https://img.icons8.com/ios/100/000000/calendar.png',
  },
];

interface GoalSelectionScreenProps {
  navigation: any;
}

const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ navigation }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const { completeOnboarding } = useAuth();

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleContinue = async () => {
    try {
      // Save selected goals (you can add to user profile later)
      console.log('Selected goals:', selectedGoals);

      // Mark onboarding as complete
      await completeOnboarding();

      // Navigate to main app
      navigation.replace('Main');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.track}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>What brings you here?</Text>
          <Text style={styles.subtitle}>
            Select all that apply to customize your feed.
          </Text>
        </View>

        {/* 2x2 Grid Layout */}
        <ScrollView 
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          {GOAL_OPTIONS.map((option) => {
            const isSelected = selectedGoals.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => toggleGoal(option.id)}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Select ${option.label}`}
              >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Image
                    source={{ uri: option.iconUrl }}
                    style={[
                      styles.icon,
                      { tintColor: isSelected ? '#0D9488' : '#64748B' }
                    ]}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {option.label}
                </Text>

                {/* Selection Checkmark Indicator (Optional visual cue) */}
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <View style={styles.checkMark} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Floating Bottom Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              selectedGoals.length === 0 && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const CARD_GAP = 16;
// Calculate card width: (Total Width - (Padding * 2) - Gap) / 2 columns
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  // Progress Bar Styles
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9', // muted slate
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    width: '25%',
    height: '100%',
    backgroundColor: '#0D9488', // Teal primary
    borderRadius: 4,
  },
  // Header Styles
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B', // Slate 800
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B', // Slate 500
    lineHeight: 24,
  },
  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, // Space for footer
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH, // Square aspect ratio
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    marginBottom: CARD_GAP,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#F0FDFA', // Very light teal
    borderColor: '#0D9488', // Teal primary
    shadowColor: '#0D9488',
    shadowOpacity: 0.15,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainerSelected: {
    backgroundColor: '#FFFFFF',
  },
  icon: {
    width: 32,
    height: 32,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: '#0D9488',
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 0 : 24,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.9)', // Slight blur effect background
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#0D9488',
    borderRadius: 28, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1', // Slate 300
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#0F766E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default GoalSelectionScreen;