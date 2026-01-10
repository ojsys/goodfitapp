# Google Authentication Setup Guide

This guide explains how to set up Google authentication for the GoodFit app.

## Backend Setup (Django) ✅ COMPLETED

The Django backend is already configured with Google authentication:

### 1. Installed Package
- `google-auth==2.36.0` - for verifying Google ID tokens

### 2. Created Endpoint
- **URL**: `/auth/google-login/`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "id_token": "google_id_token_here"
  }
  ```
- **Response**:
  ```json
  {
    "user": { /* user object */ },
    "tokens": {
      "access": "jwt_access_token",
      "refresh": "jwt_refresh_token"
    },
    "message": "Google login successful",
    "is_new_user": true/false
  }
  ```

### 3. How It Works
1. React Native sends Google ID token to Django
2. Django verifies the token with Google servers
3. Django creates or retrieves user based on email
4. Django returns JWT tokens for app authentication

## Frontend Setup (React Native/Expo) ✅ COMPLETED

The React Native app is configured to use Google Sign-In with Expo.

### 1. Installed Packages
Already installed in package.json:
- `expo-auth-session` - For OAuth authentication
- `expo-web-browser` - For opening OAuth web browser
- `expo-apple-authentication` - For Apple Sign-In (iOS only)

### 2. Updated Files
- `src/services/authService.ts` - Added `googleLogin()` method
- `src/contexts/AuthContext.tsx` - Added `googleSignIn()` and `appleSignIn()` methods
- `src/screens/auth/WelcomeAuthScreen.tsx` - Already has Google Sign-In button

## Required: Google Cloud Console Setup

To make Google Sign-In work, you need to configure OAuth credentials:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** (or **Google People API**)

### Step 2: Create OAuth 2.0 Credentials

#### For Web (Required for Expo)
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Select **Web application**
4. Name it "GoodFit Web Client"
5. Add authorized redirect URIs:
   - `https://auth.expo.io/@YOUR_EXPO_USERNAME/agoodfit-app`
   - For local development: `http://localhost:19006`
6. Save and copy the **Client ID**

#### For iOS (Optional - for standalone app)
1. Create another OAuth client
2. Select **iOS**
3. Enter your app's bundle identifier (from app.json)
4. Save and copy the **iOS Client ID**

#### For Android (Optional - for standalone app)
1. Create another OAuth client
2. Select **Android**
3. Enter package name and SHA-1 certificate fingerprint
4. Save and copy the **Android Client ID**

### Step 3: Update React Native App

Edit `src/contexts/AuthContext.tsx` and replace the placeholder values:

```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com'; // Optional
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ACTUAL_ANDROID_CLIENT_ID.apps.googleusercontent.com'; // Optional
```

### Step 4: Update app.json (Expo Config)

Add Google configuration to your `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "YOUR_SHA1_HASH"
        }
      }
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "config": {
        "googleSignIn": {
          "reservedClientId": "YOUR_IOS_CLIENT_ID"
        }
      }
    }
  }
}
```

## Testing Google Sign-In

### Local Development (Expo Go)
1. Make sure backend is running: `cd backend && python manage.py runserver`
2. Start Expo: `cd agoodfit_app && npm start`
3. Open app in Expo Go
4. Tap "Continue with Google"
5. Complete Google OAuth flow
6. You should be logged in!

### What Happens
1. User taps "Continue with Google"
2. Expo opens Google OAuth in browser
3. User selects Google account and grants permissions
4. Google returns ID token to React Native
5. React Native sends ID token to Django backend at `/auth/google-login/`
6. Django verifies token and creates/retrieves user
7. Django returns JWT tokens
8. React Native stores tokens and user is logged in

## Troubleshooting

### "Invalid client" error
- Make sure you're using the correct Client ID for your platform
- Check that redirect URIs are correctly configured in Google Cloud Console

### "Token verification failed"
- Ensure your backend has internet access to verify tokens with Google
- Check that the ID token is being sent correctly from frontend

### "Email not provided by Google"
- User's Google account must have an email address
- Ensure you're requesting the 'email' scope

## Security Notes

1. **Never commit credentials**: Keep your Client IDs in environment variables or secure storage
2. **Production**: Use different OAuth clients for development and production
3. **Token storage**: JWT tokens are securely stored using expo-secure-store
4. **HTTPS**: In production, always use HTTPS for your Django backend

## Next Steps

1. Get Google OAuth credentials from Google Cloud Console
2. Update the Client IDs in `AuthContext.tsx`
3. Test Google Sign-In in development
4. Configure production credentials before deploying
5. (Optional) Implement Apple Sign-In backend endpoint

## Apple Sign-In (TODO)

The frontend already has Apple Sign-In UI, but the backend endpoint is not implemented yet. To add it:

1. Create an Apple Developer account
2. Configure Sign in with Apple capability
3. Create a backend endpoint similar to Google login
4. Update `appleSignIn()` method in AuthContext to call the backend
