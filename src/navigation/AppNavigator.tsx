import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Splash Screens
import SplashScreen1 from '../screens/splash/SplashScreen1';
import SplashScreen2 from '../screens/splash/SplashScreen2';

// Auth Screens
import WelcomeAuthScreen from '../screens/auth/WelcomeAuthScreen';
import EmailAuthScreen from '../screens/auth/EmailAuthScreen';

// Onboarding Screens
import GoalSelectionScreen from '../screens/onboarding/GoalSelectionScreen';

// Home Screens
import WorkoutTrackerScreen from '../screens/home/WorkoutTrackerScreen';
import MatchingDiscoveryScreen from '../screens/home/MatchingDiscoveryScreen';
import CyclingCommandCenterScreen from '../screens/home/CyclingCommandCenterScreen';
import ActivityDetailScreen from '../screens/home/ActivityDetailScreen';
import AllActivitiesScreen from '../screens/home/AllActivitiesScreen';

// Events Screens
import EventsDiscoveryScreen from '../screens/events/EventsDiscoveryScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';

// Messages Screens
import MessagingScreen from '../screens/messages/MessagingScreen';

// Profile Screens
import ProfileManagementScreen from '../screens/profile/ProfileManagementScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import SuperUserDashboardScreen from '../screens/admin/SuperUserDashboardScreen';

import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Key for tracking first-time users
const HAS_LAUNCHED_BEFORE = '@has_launched_before';

// Material Design icon component for tab bar
const TabIcon = ({
  iconName,
  color
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}) => (
  <Ionicons
    name={iconName}
    size={24}
    color={color}
  />
);

// Dummy component for Add tab (won't be displayed)
const AddTabScreen = () => null;

// Main bottom tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={WorkoutTrackerScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsDiscoveryScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddTabScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Navigate to Home and trigger modal
            navigation.navigate('HomeTab', { openModal: true });
          },
        })}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.addButtonContainer}>
              <View style={styles.addButton}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={MessagingScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileManagementScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Splash Navigator with auto-advancing
function SplashNavigator() {
  const [showSecondSplash, setShowSecondSplash] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has launched the app before
    const checkFirstTime = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_BEFORE);
        const isFirst = hasLaunched === null;
        setIsFirstTime(isFirst);

        // Mark that the app has been launched
        if (isFirst) {
          await AsyncStorage.setItem(HAS_LAUNCHED_BEFORE, 'true');
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstTime(true); // Default to showing full splash
      }
    };

    checkFirstTime();
  }, []);

  useEffect(() => {
    if (isFirstTime === null) return; // Wait for check to complete

    const timer = setTimeout(() => {
      setShowSecondSplash(true);
    }, isFirstTime ? 2500 : 1500); // 2.5s for first-time, 1.5s for returning users

    return () => clearTimeout(timer);
  }, [isFirstTime]);

  // Wait for first-time check
  if (isFirstTime === null) {
    return <SplashScreen1 />;
  }

  // First-time users see both splashes
  if (!showSecondSplash) {
    return <SplashScreen1 />;
  }

  // Returning users skip second splash
  if (!isFirstTime) {
    return null; // Let RootNavigator handle navigation
  }

  // First-time users see second splash
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash2" component={SplashScreen2Component} />
    </Stack.Navigator>
  );
}

// Wrapper component for SplashScreen2 with navigation
function SplashScreen2Component({ navigation }: any) {
  return (
    <SplashScreen2
      onLogin={() => navigation.replace('WelcomeAuth')}
      onSignUp={() => navigation.replace('WelcomeAuth')}
    />
  );
}

// Root stack navigator
function RootNavigator() {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if first time user
    const checkFirstTime = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_BEFORE);
        setIsFirstTime(hasLaunched === null);
      } catch (error) {
        setIsFirstTime(true);
      }
    };
    checkFirstTime();
  }, []);

  useEffect(() => {
    if (isFirstTime === null) return; // Wait for check

    // Simulate app initialization
    // First-time users: 3.5s (to show both splashes)
    // Returning users: 1.5s (quick splash only)
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, isFirstTime ? 3500 : 1500);

    return () => clearTimeout(timer);
  }, [isFirstTime]);

  // Show splash while app is initializing or auth is loading
  if (!isAppReady || loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Not authenticated - show auth screens
        <>
          <Stack.Screen name="WelcomeAuth" component={WelcomeAuthScreen} />
          <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
        </>
      ) : !hasCompletedOnboarding ? (
        // Authenticated but haven't completed onboarding - show onboarding
        <>
          <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="MatchingDiscovery" component={MatchingDiscoveryScreen} />
          <Stack.Screen name="CyclingCommandCenter" component={CyclingCommandCenterScreen} />
          <Stack.Screen name="AllActivities" component={AllActivitiesScreen} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="SuperUserDashboard" component={SuperUserDashboardScreen} />
        </>
      ) : (
        // Authenticated and completed onboarding - show main app
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="MatchingDiscovery" component={MatchingDiscoveryScreen} />
          <Stack.Screen name="CyclingCommandCenter" component={CyclingCommandCenterScreen} />
          <Stack.Screen name="AllActivities" component={AllActivitiesScreen} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="SuperUserDashboard" component={SuperUserDashboardScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
