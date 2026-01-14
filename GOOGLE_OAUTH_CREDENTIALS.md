# Google OAuth Setup - Required Information

## Your Android App Details

**Package Name:** `com.goodfitapp.AGoodFit`

**SHA-1 Certificate Fingerprint (Debug):**
```
8B:69:20:B0:44:5D:40:4C:2D:ED:04:30:91:27:C5:1E:20:2A:00:24
```

**SHA-256 Certificate Fingerprint (Debug):**
```
C5:5C:06:83:66:88:DD:AC:25:8F:AF:9E:78:68:5D:89:04:C2:0F:DD:5E:94:6D:48:36:31:B7:98:A3:10:A7:10
```

## Your iOS App Details

**Bundle Identifier:** `com.goodfitapp.AGoodFit`

---

## Step-by-Step: Create Google OAuth Credentials

### 1. Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 2. Create or Select a Project

1. Click the project dropdown at the top
2. Click "New Project" or select an existing one
3. Name it "GoodFit" or similar

### 3. Enable Required APIs

1. Go to **APIs & Services > Library**
2. Search for and enable:
   - **Google+ API** (or **People API**)
   - **Google Maps SDK for Android**
   - **Google Maps SDK for iOS**

### 4. Create OAuth 2.0 Credentials

#### For Android:

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: **A Good Fit**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`
   - Add test users if needed
4. Back to **Create Credentials > OAuth 2.0 Client ID**
5. Select **Android**
6. Enter:
   - **Name:** GoodFit Android Client
   - **Package name:** `com.goodfitapp.AGoodFit`
   - **SHA-1 certificate fingerprint:** `8B:69:20:B0:44:5D:40:4C:2D:ED:04:30:91:27:C5:1E:20:2A:00:24`
7. Click **Create**
8. **COPY THE CLIENT ID** - You'll need this!

#### For iOS:

1. Click **Create Credentials > OAuth 2.0 Client ID**
2. Select **iOS**
3. Enter:
   - **Name:** GoodFit iOS Client
   - **Bundle ID:** `com.goodfitapp.AGoodFit`
4. Click **Create**
5. **COPY THE CLIENT ID** - You'll need this!

#### For Web (Required for Expo):

1. Click **Create Credentials > OAuth 2.0 Client ID**
2. Select **Web application**
3. Enter:
   - **Name:** GoodFit Web Client (Expo)
   - **Authorized JavaScript origins:** Leave empty for now
   - **Authorized redirect URIs:**
     - `https://auth.expo.io/@YOUR_EXPO_USERNAME/a-good-fit`
     - Replace `YOUR_EXPO_USERNAME` with your actual Expo username
4. Click **Create**
5. **COPY THE CLIENT ID** - You'll need this!

### 5. Create Google Maps API Keys

#### For Android:

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Click **Restrict Key** (or edit the key)
4. Under **Application restrictions:**
   - Select **Android apps**
   - Click **Add an item**
   - Package name: `com.goodfitapp.AGoodFit`
   - SHA-1: `8B:69:20:B0:44:5D:40:4C:2D:ED:04:30:91:27:C5:1E:20:2A:00:24`
5. Under **API restrictions:**
   - Select **Restrict key**
   - Check **Maps SDK for Android**
6. Click **Save**
7. **COPY THE API KEY**

#### For iOS:

1. Click **Create Credentials > API Key**
2. Click **Restrict Key**
3. Under **Application restrictions:**
   - Select **iOS apps**
   - Click **Add an item**
   - Bundle ID: `com.goodfitapp.AGoodFit`
4. Under **API restrictions:**
   - Select **Restrict key**
   - Check **Maps SDK for iOS**
5. Click **Save**
6. **COPY THE API KEY**

---

## 6. Update Your App Configuration

### Update `.env` file:

Edit `/Users/Apple/projects/goodfitapp/agoodfit_app/.env`:

```env
# Google Maps API Keys
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com

# Backend API URL
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### Update `src/contexts/AuthContext.tsx`:

Replace these lines (15-17):

```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com';
```

With your actual Client IDs from Google Cloud Console.

### Update `app.json` (for Google Maps):

Replace the placeholder API keys:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_MAPS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_MAPS_API_KEY"
        }
      }
    }
  }
}
```

---

## 7. Testing

After configuration:

1. Rebuild your app: `npx expo prebuild --clean`
2. Run on device: `npx expo run:android` or `npx expo run:ios`
3. Test Google Sign-In from the Welcome screen
4. Test GPS tracking with Google Maps

---

## Important Notes

🔒 **Security:**
- Never commit `.env` to git (already in .gitignore)
- Keep your API keys and Client IDs secret
- Use different credentials for production

⚠️ **Debug vs Production:**
- The SHA-1 fingerprint above is for DEBUG keystore
- For production, you'll need to generate a release keystore and get its SHA-1
- Add the production SHA-1 to Google Cloud Console before releasing

📝 **OAuth Consent Screen:**
- For testing, your app can be in "Testing" mode
- Add yourself and testers as test users
- For public release, you'll need to verify the app and publish the consent screen

---

## Checklist

- [ ] Create Google Cloud project
- [ ] Enable Google+ API / People API
- [ ] Enable Google Maps SDK for Android
- [ ] Enable Google Maps SDK for iOS
- [ ] Create Android OAuth Client ID
- [ ] Create iOS OAuth Client ID
- [ ] Create Web OAuth Client ID (for Expo)
- [ ] Create Android Maps API Key
- [ ] Create iOS Maps API Key
- [ ] Update `.env` with all credentials
- [ ] Update `AuthContext.tsx` with OAuth Client IDs
- [ ] Update `app.json` with Maps API Keys
- [ ] Test Google Sign-In
- [ ] Test Google Maps GPS tracking

---

**Need Help?**
- Google Cloud Console: https://console.cloud.google.com/
- Google Sign-In Documentation: https://developers.google.com/identity
- Expo Google Authentication: https://docs.expo.dev/guides/google-authentication/
