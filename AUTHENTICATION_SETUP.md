# Authentication Setup Guide

This guide will help you configure Firebase Authentication for the A Good Fit app with Email, Google, and Apple sign-in.

## Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- A Google account for Firebase Console access

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `a-good-fit` (or your preferred name)
4. Disable Google Analytics (optional, can enable later)
5. Click "Create project"

## Step 2: Add Firebase to Your App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register app with nickname: `A Good Fit Web`
3. Click "Register app"
4. Copy the `firebaseConfig` object shown

## Step 3: Configure Firebase in Your App

1. Open `/src/config/firebase.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Enable Authentication Methods

### Enable Email/Password Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on "Email/Password"
5. Enable "Email/Password" (first toggle)
6. Click "Save"

### Enable Google Sign-In

1. In **Sign-in method** tab, click "Google"
2. Enable Google sign-in
3. Set project support email
4. Click "Save"
5. Note your **Web client ID** - you'll need it for the next step

#### Configure Google Sign-In in Your App

1. Open `/src/services/authService.ts`
2. Find the `signInWithGoogle` function
3. Replace the placeholder client IDs:

```typescript
// Get these from Firebase Console > Authentication > Sign-in method > Google
const webClientId = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const iosClientId = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const androidClientId = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const expoClientId = webClientId; // Use web client ID for Expo
```

To get iOS and Android client IDs:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Create OAuth 2.0 Client IDs for iOS and Android if not already created

### Enable Apple Sign-In (iOS only)

1. In **Sign-in method** tab, click "Apple"
2. Enable Apple sign-in
3. Click "Save"

**Requirements for Apple Sign-In:**
- Apple Developer Account ($99/year)
- App must be published or in TestFlight
- Configure Sign in with Apple capability in your app

## Step 5: Update app.json for Authentication

Add the following to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.goodfit.app",
      "usesAppleSignIn": true
    },
    "android": {
      "package": "com.goodfit.app",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## Step 6: Test Authentication

### Test Email/Password

1. Run `npm start`
2. Open app on iOS or Android
3. Click "Continue with Email"
4. Enter email and password
5. Click "Sign Up" to create account
6. Try logging in with the same credentials

### Test Google Sign-In

**Important:** Google Sign-In requires configuration:
1. You need to set up OAuth consent screen in Google Cloud Console
2. Add test users or publish the app
3. Configure redirect URIs properly

For development, use Expo's auth proxy:
```typescript
import * as Google from 'expo-auth-session/providers/google';

const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'YOUR_WEB_CLIENT_ID',
  // ... other config
});
```

### Test Apple Sign-In (iOS only)

**Requirements:**
- Physical iOS device or simulator running iOS 13+
- Apple Developer account configured
- App properly set up with Sign in with Apple capability

## Step 7: Troubleshooting

### Common Issues

**Firebase errors:**
- Make sure you copied the correct config from Firebase Console
- Ensure all required authentication methods are enabled

**Google Sign-In not working:**
- Check that OAuth client IDs are correct
- Verify redirect URIs are configured in Google Cloud Console
- Make sure OAuth consent screen is configured

**Apple Sign-In not working:**
- Ensure you have Sign in with Apple enabled in Apple Developer account
- Check that capability is added to your Xcode project
- Test on real iOS device (works better than simulator)

## Security Best Practices

1. **Never commit Firebase config to public repos:**
   - Add `.env` file for sensitive keys
   - Use environment variables

2. **Enable Firebase Security Rules:**
   - Go to Firestore/Storage and set proper security rules
   - Don't allow public read/write access

3. **Enable App Check:**
   - Protect your Firebase resources from abuse
   - Configure in Firebase Console > App Check

4. **Password Requirements:**
   - Minimum 6 characters (enforced in app)
   - Consider adding complexity requirements

## Next Steps

After authentication is working:

1. **Add User Profiles:**
   - Store user data in Firestore
   - Implement profile creation/editing

2. **Add Password Reset:**
   - Implement "Forgot Password" flow
   - Use Firebase's `sendPasswordResetEmail`

3. **Add Email Verification:**
   - Send verification emails on signup
   - Require verification before full access

4. **Add Social Profile Data:**
   - Fetch user's name/photo from Google/Apple
   - Save to user profile

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [React Native Firebase](https://rnfirebase.io/)

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Check Expo logs: `npx expo start --dev-client`
3. Review Firebase Authentication documentation
4. Check GitHub issues for similar problems
