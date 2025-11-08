# Using Your Web Client ID - Step by Step

This guide shows you exactly how to use your Firebase Web Client ID with Supabase Google OAuth.

## What You Need

- ✅ Your **Web Client ID** (from Firebase)
- ✅ Your **Client Secret** (from Google Cloud Console)
- ✅ Your **Supabase Project** (already set up)

## Step 1: Get Your Client Secret

If you only have the Web Client ID, you need to get the Client Secret:

### Option A: From Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **General** tab
4. Scroll down to **Your apps** section
5. Click on your web app
6. The **Client Secret** is not shown here - you need to get it from Google Cloud Console

### Option B: From Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the same project (the one linked to your Firebase project)
3. Go to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (this is your Web Client ID)
5. Click on it to view details
6. Copy the **Client Secret** (you may need to click "Show" to reveal it)

## Step 2: Configure Redirect URIs

Before using your Client ID, you need to add authorized redirect URIs:

### In Google Cloud Console:

1. Go to **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. Under **Authorized redirect URIs**, click **+ ADD URI**
4. Add these URIs:

   **For Production:**
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-supabase-project-ref>` with your actual Supabase project reference (e.g., `abcdefghijklmnop`)

   **For Local Development:**
   ```
   http://localhost:3000/api/auth/callback
   ```

5. Click **SAVE**

### How to Find Your Supabase Project Ref:

1. Go to your Supabase Dashboard
2. Look at your project URL: `https://app.supabase.com/project/<project-ref>`
3. The `<project-ref>` is what you need (usually a long string like `abcdefghijklmnop`)

## Step 3: Configure in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** → **Providers**

2. **Enable Google Provider**
   - Find **Google** in the list of providers
   - Toggle **Enable Google provider** to **ON**

3. **Enter Your Credentials**
   - **Client ID (for OAuth)**: Paste your Web Client ID here
   - **Client Secret (for OAuth)**: Paste your Client Secret here

4. **Optional Settings:**
   - **Scopes**: Leave default (usually `email profile`)
   - **Authorized Client IDs**: Leave empty (unless you have multiple)

5. **Click SAVE**

## Step 4: Test the Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the login page:**
   ```
   http://localhost:3000/login
   ```

3. **Click "Sign in with Google"**
   - You should be redirected to Google's sign-in page
   - After signing in, you'll be redirected back to your app
   - You should end up at `/dashboard`

## Troubleshooting

### Error: "Redirect URI mismatch"

**Problem:** The redirect URI in Google Cloud Console doesn't match what Supabase expects.

**Solution:**
1. Check that you added the correct redirect URI:
   - Production: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Development: `http://localhost:3000/api/auth/callback`
2. Make sure there are no extra spaces or typos
3. The URI must match exactly (including `http` vs `https`)

### Error: "Invalid client ID"

**Problem:** The Client ID is incorrect or not properly configured.

**Solution:**
1. Verify the Client ID is correctly pasted in Supabase Dashboard
2. Make sure you're using the OAuth 2.0 Client ID, not an API Key
3. Check that the Google provider is enabled in Supabase
4. Verify the Client ID is from the correct Google Cloud project

### Error: "Invalid client secret"

**Problem:** The Client Secret is incorrect or missing.

**Solution:**
1. Get the Client Secret from Google Cloud Console (not Firebase Console)
2. Make sure you copied the entire secret (no spaces)
3. If the secret was reset, get the new one and update Supabase

### Authentication works but user is not created

**Problem:** User signs in but no user record is created in Supabase.

**Solution:**
1. Check Supabase Dashboard → Authentication → Users
2. Users are automatically created on first sign-in
3. If you need to link to your database tables, create a trigger or use the `auth.users` table

## Quick Checklist

- [ ] Got Client Secret from Google Cloud Console
- [ ] Added redirect URIs in Google Cloud Console:
  - [ ] `https://<project-ref>.supabase.co/auth/v1/callback`
  - [ ] `http://localhost:3000/api/auth/callback`
- [ ] Enabled Google provider in Supabase Dashboard
- [ ] Pasted Client ID in Supabase Dashboard
- [ ] Pasted Client Secret in Supabase Dashboard
- [ ] Saved the configuration
- [ ] Tested the authentication flow

## What Happens After Setup

Once configured:

1. ✅ Users can sign in with Google
2. ✅ User sessions are automatically managed
3. ✅ Users are created in Supabase Auth
4. ✅ Routes are protected (via middleware)
5. ✅ User data is available in your app

## Next Steps

After successful authentication:

1. **Create user profiles** - Link Supabase Auth users to your database tables
2. **Set up RLS policies** - Protect data based on authenticated user
3. **Add user profile page** - Display user information
4. **Customize the login experience** - Style the login page

## Need Help?

- Check the full setup guide: `docs/GOOGLE-AUTH-SETUP.md`
- Quick start guide: `docs/GOOGLE-AUTH-QUICK-START.md`
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2

