# 🚨 SECURITY INCIDENT - API Key Exposure

## What Happened
A Google Maps API key was accidentally committed to the repository in commit `7da0302` and pushed to GitHub.

**Exposed API Key**: `AIzaSyBGb6g5mqyFHgIJYIVTpob-1tnUsA2ROQY`

## Immediate Actions Required

### 1. REVOKE THE EXPOSED API KEY (DO THIS FIRST!)

**⚠️ CRITICAL: You MUST revoke this key immediately!**

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find the API key: `AIzaSyBGb6g5mqyFHgIJYIVTpob-1tnUsA2ROQY`
3. Click on it and select **"Delete"** or **"Regenerate"**
4. Create a NEW API key to replace it

### 2. Clean Git History

The API key has been removed from the files, but it still exists in git history. To remove it completely:

```bash
cd /Users/Apple/projects/goodfitapp/agoodfit_app

# Option 1: Amend the last commit (if it's the most recent commit)
git add app.json .env.example
git commit --amend -m "Add Google auth configuration (API keys in .env)"

# Force push to overwrite GitHub history
git push --force-with-lease origin main
```

**OR if you want to keep the commit but just remove the key:**

```bash
# Add the fixed files
git add app.json .env.example
git commit -m "SECURITY: Remove exposed API keys from app.json"

# Remove the key from ALL previous commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json || true" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force-with-lease --all
git push --force-with-lease --tags
```

### 3. Update Local Configuration

The API key is now stored in `.env` file (which is gitignored). To use it:

1. Edit `.env` and replace with your NEW API key (after revoking the old one)
2. Never commit `.env` to git (it's already in .gitignore)
3. Share `.env.example` with your team as a template

### 4. Configure Environment Variables for Deployment

For production/staging environments:

**Expo EAS Build:**
```bash
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value your_new_api_key
```

**Or add to eas.json:**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "your_new_api_key"
      }
    }
  }
}
```

## Prevention Measures

1. ✅ Added `.env` to `.gitignore` (already there)
2. ✅ Created `.env.example` as a template
3. ✅ Removed hardcoded API keys from `app.json`
4. 🔄 TODO: Set up environment variable loading in app configuration

## Next Steps

1. **IMMEDIATELY** revoke the exposed API key in Google Cloud Console
2. Generate a new API key
3. Update the new key in `.env` file
4. Clean git history using one of the commands above
5. Force push to GitHub
6. Consider enabling API key restrictions:
   - Application restrictions (limit to specific bundle IDs)
   - API restrictions (limit to specific Google APIs)
   - Usage quotas and alerts

## Lessons Learned

- Never commit API keys, secrets, or credentials to git
- Always use environment variables for sensitive data
- Review changes before committing with `git diff`
- Use tools like `git-secrets` or pre-commit hooks to prevent this

## Timeline

- **2026-01-07 22:25**: API key committed in "Worked on google auth" commit
- **2026-01-10**: Security issue discovered
- **2026-01-10**: API key removed from codebase, .env setup created

---

**Status**: 🔴 API KEY STILL NEEDS TO BE REVOKED IN GOOGLE CLOUD CONSOLE
