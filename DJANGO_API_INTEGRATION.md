# Django API Integration - Complete!

## ✅ What Was Done

The React Native app has been prepared to connect to the Django backend API, replacing Firebase.

---

## 📦 Packages Installed

- ✅ **axios** - HTTP client for API requests

---

## 🔧 New Services Created

### 1. API Configuration Service (`src/services/api.ts`)

**Features:**
- ✅ Axios instance with base URL configuration
- ✅ Automatic token injection in requests
- ✅ Automatic token refresh on 401 errors
- ✅ Request/response interceptors
- ✅ Token management utilities
- ✅ Error handling utilities

**Key Functions:**
```typescript
// Token Management
tokenManager.saveTokens(access, refresh)
tokenManager.getAccessToken()
tokenManager.getRefreshToken()
tokenManager.clearTokens()
tokenManager.hasTokens()

// Error Handling
handleApiError(error)
```

**Configuration:**
- Development API: `http://localhost:8000/api`
- Production API: `https://api.goodfit.com/api`
- Auto-detects environment with `__DEV__`

### 2. Auth Service (`src/services/authService.ts`)

**Replaced:** Firebase Authentication

**Features:**
- ✅ User registration
- ✅ User login (with JWT tokens)
- ✅ User logout
- ✅ Get current user profile
- ✅ Change password
- ✅ Update online status

**Key Functions:**
```typescript
authService.register(data)
authService.login(credentials)
authService.logout()
authService.getCurrentUser()
authService.changePassword(old, new)
authService.updateOnlineStatus(status)
authService.isAuthenticated()
```

**Data Types:**
- User interface with all profile fields
- UserGoals, UserStats, UserPreferences
- Authentication response with tokens

### 3. User Service (`src/services/userService.ts`)

**Replaced:** Firebase Firestore user operations

**Features:**
- ✅ Get user profile
- ✅ Update user profile
- ✅ Get/update user goals
- ✅ Get user stats
- ✅ Get/update user preferences
- ✅ Update online status

**Key Functions:**
```typescript
userService.getProfile()
userService.updateProfile(data)
userService.getGoals()
userService.updateGoals(goals)
userService.getStats()
userService.getPreferences()
userService.updatePreferences(prefs)
```

### 4. Activity Service (`src/services/activityService.ts`)

**Replaced:** Firebase Firestore activity operations

**Features:**
- ✅ Get recent activities
- ✅ Get all activities (with filters)
- ✅ Get activity by ID
- ✅ Create new activity
- ✅ Update activity
- ✅ Delete activity
- ✅ Get activity statistics
- ✅ Get daily summaries
- ✅ Get today's summary
- ✅ Update daily summary

**Key Functions:**
```typescript
activityService.getRecentActivities()
activityService.getActivities(filters)
activityService.getActivity(id)
activityService.createActivity(data)
activityService.updateActivity(id, data)
activityService.deleteActivity(id)
activityService.getStats(days)
activityService.getDailySummaries(days)
activityService.getTodaySummary()
```

---

## 🔄 Backup Files Created

Original Firebase services backed up:
- `authService.firebase.bak`
- `userService.firebase.bak`
- `activityService.firebase.bak`

These can be deleted once Django integration is verified.

---

## ⏳ Next Steps - Context Updates Required

The services are ready, but the contexts need to be updated to use them:

### 1. Update AuthContext (`src/contexts/AuthContext.tsx`)

**Changes needed:**
- Replace Firebase auth imports with Django authService
- Update register function to use `authService.register()`
- Update login function to use `authService.login()`
- Update logout function to use `authService.logout()`
- Update user state initialization
- Remove Firebase-specific code

### 2. Update UserContext (`src/contexts/UserContext.tsx`)

**Changes needed:**
- Replace Firebase Firestore imports with Django userService
- Update profile fetching to use `userService.getProfile()`
- Update stats fetching to use `userService.getStats()`
- Update goals fetching to use `userService.getGoals()`
- Update all update functions
- Remove Firestore listeners (use polling or refetch)

### 3. Update ActivityContext (`src/contexts/ActivityContext.tsx`)

**Changes needed:**
- Replace Firebase Firestore imports with Django activityService
- Update activities fetching to use `activityService.getRecentActivities()`
- Update create activity to use `activityService.createActivity()`
- Update edit activity to use `activityService.updateActivity()`
- Update delete activity to use `activityService.deleteActivity()`
- Remove Firestore listeners
- Update live tracking to save to Django API

---

## 🔑 Key Differences from Firebase

### Authentication
| Firebase | Django API |
|----------|------------|
| Email/password with Firebase SDK | Email/password with JWT tokens |
| Auto token refresh | Manual refresh with interceptor |
| Session-based | Token-based (access + refresh) |

### Data Fetching
| Firebase | Django API |
|----------|------------|
| Real-time listeners | HTTP requests (polling if needed) |
| `onSnapshot()` | `api.get()` or `useEffect` with interval |
| Document references | ID-based REST endpoints |
| NoSQL structure | SQL structure (normalized) |

### Error Handling
| Firebase | Django API |
|----------|------------|
| Firebase error codes | HTTP status codes |
| `error.code` | `error.response.status` |
| `error.message` | `error.response.data.message` |

---

## 🌐 API Endpoints Used

### Authentication (`/api/auth/`)
- `POST /auth/register/` - Register
- `POST /auth/login/` - Login
- `POST /auth/logout/` - Logout
- `POST /auth/token/refresh/` - Refresh token
- `GET /auth/profile/` - Get profile
- `PATCH /auth/profile/update/` - Update profile
- `POST /auth/password/change/` - Change password
- `GET /auth/goals/` - Get goals
- `PATCH /auth/goals/` - Update goals
- `GET /auth/stats/` - Get stats
- `GET /auth/preferences/` - Get preferences
- `PATCH /auth/preferences/` - Update preferences
- `POST /auth/status/` - Update online status

### Activities (`/api/activities/`)
- `GET /activities/` - List activities
- `POST /activities/` - Create activity
- `GET /activities/<id>/` - Get activity
- `PATCH /activities/<id>/` - Update activity
- `DELETE /activities/<id>/` - Delete activity
- `GET /activities/recent/` - Recent activities
- `GET /activities/stats/` - Activity stats
- `GET /activities/summaries/` - Daily summaries
- `GET /activities/summaries/today/` - Today's summary
- `POST /activities/summaries/update/` - Update summary

---

## 🔒 Token Management

### How It Works
1. User logs in → Receives access + refresh tokens
2. Tokens saved to AsyncStorage
3. Access token included in all requests
4. On 401 error → Automatically refresh access token
5. If refresh fails → Clear tokens, redirect to login

### Token Storage
```typescript
// Saved in AsyncStorage
'access_token' → JWT access token (7 days)
'refresh_token' → JWT refresh token (30 days)
```

### Automatic Refresh
- Happens transparently in axios interceptor
- Queues failed requests during refresh
- Retries all queued requests after refresh
- Clears tokens if refresh fails

---

## 🚀 Testing the Integration

### 1. Start Django Backend
```bash
cd backend
export DJANGO_ENV=development
export DJANGO_SETTINGS_MODULE=goodfit_api.settings
python manage.py runserver
```

### 2. Update Contexts (Required)
- Update AuthContext
- Update UserContext
- Update ActivityContext

### 3. Start React Native App
```bash
cd agoodfit_app
npm start
```

### 4. Test Features
- [ ] Register new account
- [ ] Login with credentials
- [ ] View profile
- [ ] Create activity
- [ ] View activities list
- [ ] View activity details
- [ ] Delete activity
- [ ] Update profile
- [ ] Logout

---

## 🐛 Troubleshooting

### "Network Error" or "Connection Refused"
**Solution:** Ensure Django backend is running on `http://localhost:8000`

### "401 Unauthorized"
**Solution:** Check if tokens are saved. Try logging out and back in.

### "CORS Error"
**Solution:** Django development settings allow all origins. If issue persists, check CORS settings in Django.

### Tokens Not Saving
**Solution:** Check AsyncStorage permissions. Clear app data and try again.

### API Not Found (404)
**Solution:** Verify API endpoint URLs match Django backend URLs.

---

## 📊 Performance Considerations

### Polling vs Real-time
- Firebase had real-time listeners
- Django uses HTTP polling
- Consider implementing:
  - Pull-to-refresh for manual updates
  - Periodic background refresh (every 30s)
  - WebSockets for real-time updates (future enhancement)

### Caching
- Consider caching API responses
- Use React Query or SWR for better data management
- Reduce unnecessary API calls

---

## ✅ Benefits of Django API

1. **Full Control** - Own your backend
2. **Better Performance** - Optimized SQL queries
3. **Lower Costs** - No Firebase pricing tiers
4. **Easier Debugging** - Clear API responses
5. **More Flexible** - Add custom endpoints easily
6. **Better Security** - Control authentication fully
7. **Scalability** - Deploy anywhere

---

## 📝 Summary

- ✅ Axios installed
- ✅ API configuration created with auto token refresh
- ✅ Auth service created (replacing Firebase Auth)
- ✅ User service created (replacing Firestore)
- ✅ Activity service created (replacing Firestore)
- ⏳ Contexts need updating (next step)
- ⏳ Testing required after context updates

**Next:** Update the three contexts (Auth, User, Activity) to use the new Django API services!
