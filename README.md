# A Good Fit

A React Native mobile application for wellness, connection, and community.

## Features

- **Splash Screens**: Auto-advancing splash screens with brand identity
- **Authentication**: Welcome screen with email, Google, and Apple sign-in options
- **Goal Selection**: Onboarding flow for users to select their fitness and social goals
- **Activity Tracking**: Workout tracking with steps, calories, and activity logging
- **Social Discovery**: Card-based matching system for finding fitness buddies and community
- **Events**: Discover and RSVP to local fitness and wellness events
- **Messaging**: 1:1 chat with safety features
- **Profile Management**: Edit bio, interests, intentions, and availability
- **Admin Dashboard**: Moderation tools for community management

## Project Structure

```
goodfitapp/
├── App.tsx                     # App entry point
├── src/
│   ├── screens/
│   │   ├── splash/            # Splash screens (Frame1 & Frame2)
│   │   ├── auth/              # Authentication screens
│   │   ├── onboarding/        # Goal selection and onboarding
│   │   ├── home/              # Main app screens (workout, matching, cycling)
│   │   ├── events/            # Event discovery and details
│   │   ├── messages/          # Chat and messaging
│   │   ├── profile/           # User profile management
│   │   └── admin/             # Admin and super-user dashboards
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigation setup
│   └── constants/
│       └── theme.ts           # Design system tokens
├── assets/                     # Images and assets
└── package.json

```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (optional, will be installed with dependencies)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create placeholder assets (if needed):
   You'll need the following assets in the `assets/` folder:
   - `icon.png` (1024x1024) - App icon
   - `splash.png` (1284x2778) - Splash screen image
   - `adaptive-icon.png` (1024x1024) - Android adaptive icon
   - `favicon.png` (48x48) - Web favicon

### Running the App

Start the development server:
```bash
npm start
```

Run on specific platforms:
```bash
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
npm run web      # Run in web browser
```

## Navigation Flow

1. **Splash Screens**:
   - SplashScreen1 shows for 2.5 seconds
   - Auto-advances to SplashScreen2 with Log In / Sign Up buttons

2. **Authentication**:
   - WelcomeAuthScreen for login/signup

3. **Onboarding**:
   - GoalSelectionScreen for selecting user goals

4. **Main App**:
   - Bottom tab navigation with:
     - Home (Workout Tracker)
     - Events (Event Discovery)
     - Chat (Messaging)
     - Profile (Profile Management)

## Design System

The app uses a consistent design system defined in `src/constants/theme.ts`:

- **Colors**: Wellness-focused green/teal palette with warm accents
- **Spacing**: 8px base unit with consistent spacing scale
- **Typography**: Font sizes from 12px to 72px
- **Border Radius**: Rounded corners for modern UI
- **Shadows**: Elevation system for depth

## Screens

### Splash & Auth
- `SplashScreen1`: Initial brand splash
- `SplashScreen2`: Splash with auth buttons
- `WelcomeAuthScreen`: Email, Google, and Apple authentication

### Onboarding
- `GoalSelectionScreen`: Select fitness and social goals

### Home
- `WorkoutTrackerScreen`: Activity tracking dashboard
- `MatchingDiscoveryScreen`: Swipeable card matching
- `CyclingCommandCenterScreen`: Advanced cycling metrics

### Events
- `EventsDiscoveryScreen`: Browse and filter events
- `EventDetailsScreen`: Event details and RSVP

### Social
- `MessagingScreen`: 1:1 chat with safety features

### Profile
- `ProfileManagementScreen`: Edit profile, bio, interests

### Admin
- `AdminDashboardScreen`: Moderation and user management
- `SuperUserDashboardScreen`: Event organizer dashboard

## Technology Stack

- **React Native** 0.76.5
- **Expo** ~52.0.0
- **React Navigation** ^7.0.0
- **TypeScript** ^5.3.3
- **React Native Gesture Handler** ~2.20.2
- **React Native Safe Area Context** 4.12.0

## Notes

- All screens use pure React Native components (no external UI libraries)
- Navigation uses React Navigation with Stack and Bottom Tab navigators
- TypeScript is enabled for type safety
- Design follows wellness and community-focused aesthetics

## Next Steps

1. Replace placeholder assets with final branded images
2. Implement actual authentication logic
3. Connect to backend APIs
4. Add state management (Redux, Context, etc.)
5. Implement real data fetching
6. Add error handling and loading states
7. Test on physical devices
8. Prepare for app store submission
