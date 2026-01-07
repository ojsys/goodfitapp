# GPS Live Tracking Setup Guide

## 📦 Required Packages

Install the necessary packages for GPS tracking and map display:

```bash
# Location tracking
npx expo install expo-location

# Maps display
npx expo install react-native-maps

# Additional dependencies
npm install @react-native-community/geolocation
```

## 🔐 Permissions Setup

### 1. Update `app.json` / `app.config.js`

Add location permissions:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow GoodFit to track your workouts with GPS for accurate distance and route recording.",
          "locationWhenInUsePermission": "Allow GoodFit to access your location during workouts."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "GoodFit needs access to your location to track your workouts and record routes.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "GoodFit needs access to your location even when the app is in the background to track your workouts."
      },
      "config": {
        "googleMapsApiKey": "YOUR_IOS_GOOGLE_MAPS_API_KEY"
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### 2. Get Google Maps API Keys

#### iOS:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps SDK for iOS"
4. Create API key
5. Restrict key to iOS apps only
6. Add to `app.json` under `ios.config.googleMapsApiKey`

#### Android:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for Android"
3. Create API key
4. Restrict key to Android apps only
5. Add package name: `com.yourcompany.goodfit`
6. Add to `app.json` under `android.config.googleMaps.apiKey`

## 📱 Navigation Setup

Add the screens to your navigation stack:

```typescript
// In your navigator file (e.g., AppNavigator.tsx)
import StartTrackingScreen from '../screens/home/StartTrackingScreen';
import LiveTrackingScreen from '../screens/home/LiveTrackingScreen';

// Add to your stack
<Stack.Screen
  name="StartTracking"
  component={StartTrackingScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="LiveTracking"
  component={LiveTrackingScreen}
  options={{ headerShown: false }}
/>
```

## 🚀 Usage

### From your home screen or activity screen:

```typescript
// Navigate to start tracking
navigation.navigate('StartTracking');
```

## 🔧 Rebuild Native Code

After adding location permissions and Google Maps API keys, rebuild:

```bash
# iOS
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios

# Android
npx expo prebuild --clean
npx expo run:android
```

## 📊 Features Included

### ✅ Real-time GPS Tracking
- Updates every 3 seconds or 10 meters
- High-accuracy positioning
- Altitude, speed, and accuracy tracking

### ✅ Route Visualization
- Live polyline drawing on map
- Start marker
- Auto-centering map

### ✅ Metrics Display
- Distance (km/miles)
- Duration (with pause tracking)
- Pace (min/km)
- Speed (km/h)
- Calories burned
- GPS point count

### ✅ Controls
- Start/Stop tracking
- Pause/Resume
- Confirmation before stop
- Auto-save to backend

### ✅ Backend Integration
- Live activity creation
- GPS point streaming
- Pause duration tracking
- Final activity record with full route

## 🧪 Testing

### Test on real device:
GPS tracking requires a real device (won't work in simulator for accurate tracking).

### iOS:
```bash
npx expo run:ios --device
```

### Android:
```bash
npx expo run:android --device
```

## 🐛 Troubleshooting

### Maps not showing:
- Verify Google Maps API keys are correct
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled on Google Cloud project
- Rebuild native code after adding keys

### Location not updating:
- Check permissions are granted in device settings
- Verify location services are enabled
- Test on real device (not simulator)
- Check accuracy settings in code

### Background tracking (iOS):
- Enable "Location updates" capability in Xcode
- Update `app.json` with background location permission
- Note: Apple review requires clear justification

## 📝 Notes

- GPS accuracy varies based on device, environment, and weather
- Indoor tracking may be less accurate
- Battery usage increases with GPS tracking
- Consider implementing battery-saving mode for long workouts
- Distance calculation uses Haversine formula (accurate for most use cases)

## 🎯 Next Steps

Optional enhancements:
- Add elevation profile chart
- Implement split times (per km/mile)
- Add audio cues for distance milestones
- Export routes to GPX/KML format
- Share workouts with friends
- Add workout analysis (fastest km, average pace by km)
