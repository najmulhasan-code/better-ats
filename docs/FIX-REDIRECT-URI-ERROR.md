# Fix Redirect URI Mismatch Error

## Error Message
```
Error 400: redirect_uri_mismatch
Access blocked: project-529195047845's request is invalid
```

## What This Means

Google OAuth is rejecting the request because the redirect URI in your Google Cloud Console doesn't match what Supabase is sending.

## Solution

### Step 1: Find Your Supabase Project Reference

1. Go to your **Supabase Dashboard**
2. Look at your project URL: `https://app.supabase.com/project/<project-ref>`
3. The `<project-ref>` is what you need (e.g., `abcdefghijklmnop`)

### Step 2: Add Correct Redirect URIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (project-529195047845)
3. Go to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (the one matching your Web Client ID)
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add **exactly** these URIs (one at a time):

   **For Production (Supabase):**
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your actual Supabase project reference.

   **For Local Development:**
   ```
   http://localhost:3000/api/auth/callback
   ```

   **Important Notes:**
   - The URI must match **exactly** (including `https` vs `http`)
   - No trailing slashes
   - No extra spaces
   - Case-sensitive

7. Click **SAVE**

### Step 3: Verify Your Supabase Configuration

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Make sure:
   - Google provider is **enabled** (toggled ON)
   - Client ID is correctly entered
   - Client Secret is correctly entered
3. Click **SAVE** (even if you didn't change anything)

### Step 4: Test Again

1. Clear your browser cache/cookies (or use incognito mode)
2. Try signing in again at `/login`

## Common Mistakes

### ❌ Wrong: Missing Protocol
```
your-project.supabase.co/auth/v1/callback
```

### ✅ Correct: With Protocol
```
https://your-project.supabase.co/auth/v1/callback
```

### ❌ Wrong: Trailing Slash
```
https://your-project.supabase.co/auth/v1/callback/
```

### ✅ Correct: No Trailing Slash
```
https://your-project.supabase.co/auth/v1/callback
```

### ❌ Wrong: Wrong Port
```
https://your-project.supabase.co:3000/auth/v1/callback
```

### ✅ Correct: No Port (default 443 for HTTPS)
```
https://your-project.supabase.co/auth/v1/callback
```

## How to Find Your Exact Redirect URI

### Option 1: Check Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Look for **Site URL** or **Redirect URLs**
3. The redirect URI should be: `https://<project-ref>.supabase.co/auth/v1/callback`

### Option 2: Check the Error Details

1. When you see the error, click **"See error details"** or **"Learn more"**
2. It might show the exact redirect URI that was used
3. Copy that exact URI and add it to Google Cloud Console

### Option 3: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try signing in again
4. Look for the OAuth request
5. Check the `redirect_uri` parameter in the request
6. Copy that exact value to Google Cloud Console

## Step-by-Step Checklist

- [ ] Found your Supabase project reference
- [ ] Opened Google Cloud Console → Credentials
- [ ] Found your OAuth 2.0 Client ID
- [ ] Added redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- [ ] Added redirect URI: `http://localhost:3000/api/auth/callback`
- [ ] Clicked SAVE in Google Cloud Console
- [ ] Verified Supabase Google provider is enabled
- [ ] Cleared browser cache/cookies
- [ ] Tested sign-in again

## Still Not Working?

### Check These Things:

1. **Project Match:**
   - Make sure you're using the OAuth Client ID from the correct Google Cloud project
   - The project ID should match: `project-529195047845`

2. **Wait Time:**
   - Sometimes Google takes a few minutes to update redirect URIs
   - Wait 2-3 minutes after saving, then try again

3. **Multiple Projects:**
   - Make sure you're editing the correct OAuth Client
   - Check that the Client ID matches what's in Supabase

4. **Supabase Project:**
   - Verify your Supabase project is active
   - Check that the project reference is correct

### Get Help:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for any errors related to OAuth

2. **Check Google Cloud Console:**
   - Go to APIs & Services → OAuth consent screen
   - Make sure the app is published (if required)
   - Check if there are any domain restrictions

3. **Test with Direct URL:**
   - Try accessing: `https://<project-ref>.supabase.co/auth/v1/callback`
   - This should show a Supabase page (not an error)

## Quick Fix Summary

1. **Get your Supabase project ref** from the dashboard URL
2. **Add redirect URI** in Google Cloud Console:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback`
3. **Save** and wait 2-3 minutes
4. **Try again**

## Example

If your Supabase project ref is `abcdefghijklmnop`, add:

```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
http://localhost:3000/api/auth/callback
```

Make sure these match **exactly** (no extra spaces, correct protocol, no trailing slash).

