# Field Name Reference - Firebase to Django Migration

Quick reference for field name changes when migrating from Firebase to Django API.

---

## 🔄 Field Name Mappings

### User Fields

| Firebase (camelCase) | Django (snake_case) | Type |
|---------------------|---------------------|------|
| `user.uid` | `user.id` | string → **number** |
| `user.displayName` | `user.display_name` | string |
| `user.photoURL` | `user.avatar_url` | string \| null |
| `user.onlineStatus` | `user.online_status` | 'online' \| 'offline' \| 'away' |
| `user.lastSeen` | `user.last_seen` | string (ISO) |
| `user.firstName` | `user.first_name` | string |
| `user.lastName` | `user.last_name` | string |
| `user.fullName` | `user.full_name` | string |
| `user.createdAt` | `user.created_at` | string (ISO) |
| `user.updatedAt` | `user.updated_at` | string (ISO) |

### Activity Fields

| Firebase (camelCase) | Django (snake_case) | Type |
|---------------------|---------------------|------|
| `activity.id` | `activity.id` | string → **number** |
| `activity.startTime` | `activity.start_time` | Date → **string (ISO)** |
| `activity.endTime` | `activity.end_time` | Date → **string (ISO)** |
| `activity.caloriesBurned` | `activity.calories_burned` | number |
| `activity.averageSpeed` | `activity.average_speed` | number |
| `activity.elevationGain` | `activity.elevation_gain` | number |
| `activity.heartRateAvg` | `activity.heart_rate_avg` | number |
| `activity.heartRateMax` | `activity.heart_rate_max` | number |
| `activity.startLatitude` | `activity.start_latitude` | number |
| `activity.startLongitude` | `activity.start_longitude` | number |
| `activity.startAddress` | `activity.start_address` | string |
| `activity.createdAt` | `activity.created_at` | string (ISO) |
| `activity.updatedAt` | `activity.updated_at` | string (ISO) |

### Goals Fields

| Firebase (camelCase) | Django (snake_case) |
|---------------------|---------------------|
| `goals.selectedGoals` | `goals.selected_goals` |
| `goals.dailyStepGoal` | `goals.daily_step_goal` |
| `goals.weeklyWorkoutGoal` | `goals.weekly_workout_goal` |
| `goals.dailyCalorieGoal` | `goals.daily_calorie_goal` |

### Stats Fields

| Firebase (camelCase) | Django (snake_case) |
|---------------------|---------------------|
| `stats.currentStreak` | `stats.current_streak` |
| `stats.longestStreak` | `stats.longest_streak` |
| `stats.lastActivityDate` | `stats.last_activity_date` |
| `stats.totalWorkouts` | `stats.total_workouts` |
| `stats.totalMinutes` | `stats.total_minutes` |
| `stats.totalCalories` | `stats.total_calories` |
| `stats.totalDistance` | `stats.total_distance` |

### Preferences Fields

| Firebase (camelCase) | Django (snake_case) |
|---------------------|---------------------|
| `prefs.emailNotifications` | `prefs.email_notifications` |
| `prefs.pushNotifications` | `prefs.push_notifications` |
| `prefs.activityReminders` | `prefs.activity_reminders` |
| `prefs.profileVisibility` | `prefs.profile_visibility` |
| `prefs.showStatsPublicly` | `prefs.show_stats_publicly` |

---

## 📝 Common Patterns

### Accessing User Data

```typescript
// ❌ Old (Firebase)
user.uid
user.displayName
user.photoURL

// ✅ New (Django)
user.id
user.display_name
user.avatar_url
```

### Accessing Activity Data

```typescript
// ❌ Old (Firebase)
activity.startTime
activity.endTime
activity.caloriesBurned

// ✅ New (Django)
activity.start_time
activity.end_time
activity.calories_burned
```

### Working with Dates

```typescript
// ❌ Old (Firebase)
const date = activity.startTime; // Date object
const formatted = date.toLocaleDateString();

// ✅ New (Django)
const date = new Date(activity.start_time); // Parse ISO string
const formatted = date.toLocaleDateString();
```

### Accessing Nested Data

```typescript
// ❌ Old (Firebase)
const streak = userProfile.stats.currentStreak;

// ✅ New (Django) - Option 1: Via userProfile
const streak = userProfile?.stats.current_streak;

// ✅ New (Django) - Option 2: Via separate state
const { stats } = useUser();
const streak = stats?.current_streak;
```

---

## 🚨 Type Changes (Important!)

### IDs: String → Number

```typescript
// ❌ Old (Firebase)
const activityId: string = activity.id;
if (activityId === '12345') { ... }

// ✅ New (Django)
const activityId: number = activity.id;
if (activityId === 12345) { ... }
```

### Timestamps: Date → ISO String

```typescript
// ❌ Old (Firebase)
const startTime: Date = activity.startTime;

// ✅ New (Django)
const startTime: string = activity.start_time; // ISO 8601
const startDate: Date = new Date(activity.start_time);
```

---

## 🔍 Finding All Occurrences

Use these regex patterns to find old field names:

### VS Code / IDE Search

**User fields:**
```regex
\.(uid|displayName|photoURL|onlineStatus|lastSeen|firstName|lastName|fullName|createdAt|updatedAt)
```

**Activity fields:**
```regex
\.(startTime|endTime|caloriesBurned|averageSpeed|elevationGain|heartRateAvg|heartRateMax|startLatitude|startLongitude|startAddress)
```

**Nested fields:**
```regex
\.(currentStreak|longestStreak|lastActivityDate|totalWorkouts|totalMinutes|totalCalories|totalDistance|selectedGoals|dailyStepGoal|weeklyWorkoutGoal|dailyCalorieGoal)
```

---

## ✅ Files Already Updated

- ✅ `src/contexts/AuthContext.tsx`
- ✅ `src/contexts/UserContext.tsx`
- ✅ `src/contexts/ActivityContext.tsx`
- ✅ `src/screens/auth/EmailAuthScreen.tsx`
- ✅ `src/screens/home/WorkoutTrackerScreen.tsx`
- ✅ `src/screens/home/ActivityDetailScreen.tsx`

---

## 📋 Files That May Need Updates

When you work on these files, update field names:

- `src/screens/profile/ProfileManagementScreen.tsx`
- `src/screens/home/MatchingDiscoveryScreen.tsx`
- `src/screens/events/EventsDiscoveryScreen.tsx`
- `src/screens/events/EventDetailsScreen.tsx`
- Any other screens that display user or activity data

---

## 💡 Tips

1. **Use TypeScript:** The compiler will catch type mismatches
2. **Check for undefined:** Use optional chaining (`?.`) when accessing nested fields
3. **Default values:** Use `|| []` or `|| {}` for arrays and objects
4. **Parse dates:** Always parse ISO strings to Date objects for display
5. **Number IDs:** Remember IDs are now numbers, not strings

---

## 🐛 Common Errors

### "slice is not a function"
```typescript
// ❌ Wrong
const items = activities.slice(0, 5);

// ✅ Correct
const items = (activities || []).slice(0, 5);
```

### "Cannot read property 'X' of undefined"
```typescript
// ❌ Wrong
const name = user.display_name;

// ✅ Correct
const name = user?.display_name;
```

### "Type 'string' is not assignable to type 'number'"
```typescript
// ❌ Wrong - comparing number to string
if (activity.id === '123') { ... }

// ✅ Correct
if (activity.id === 123) { ... }
```

### "Invalid Date"
```typescript
// ❌ Wrong - trying to format ISO string directly
activity.start_time.toLocaleDateString();

// ✅ Correct
new Date(activity.start_time).toLocaleDateString();
```

---

## 📚 Related Documentation

- See `CONTEXT_MIGRATION_COMPLETE.md` for full context migration details
- See `DJANGO_API_INTEGRATION.md` for API integration guide
- See TypeScript types in `src/services/authService.ts` and `src/services/activityService.ts`

---

**Last Updated:** January 2026
**Migration Status:** Contexts complete, UI components in progress
