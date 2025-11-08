# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication with Supabase.

## Option 1: Using Supabase's Built-in Google OAuth (Recommended)

Supabase has built-in support for Google OAuth, which is the easiest and recommended approach.

### Step 1: Configure Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to **Authentication** → **Providers**
   - Find **Google** in the list

2. **Enable Google Provider**
   - Toggle **Enable Google provider** to ON

3. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Google+ API** (or Google Identity Services)
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - For local development: `http://localhost:3000/api/auth/callback`
   - Copy the **Client ID** and **Client Secret**

4. **Configure in Supabase**
   - Paste **Client ID** in the "Client ID (for OAuth)" field
   - Paste **Client Secret** in the "Client Secret (for OAuth)" field
   - Click **Save**

### Step 2: Update Your Application

The application is already set up! Just make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected to `/dashboard`

## Option 2: Using Firebase Web Client ID (Alternative)

If you prefer to use Firebase directly instead of Supabase's OAuth, you can use your Firebase Web Client ID.

### Step 1: Install Firebase SDK

```bash
npm install firebase
```

### Step 2: Create Firebase Configuration

Create `lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### Step 3: Update Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note:** Using Firebase Auth directly means you won't be able to use Supabase's authentication features. We recommend using Supabase's built-in Google OAuth instead.

## Current Implementation

The current implementation uses **Supabase's built-in Google OAuth** (Option 1), which is recommended because:

1. ✅ Integrated with your existing Supabase setup
2. ✅ Works seamlessly with Supabase Auth
3. ✅ No additional dependencies needed
4. ✅ Handles sessions and tokens automatically
5. ✅ Works with Row Level Security (RLS) policies

## Files Created

- `app/api/auth/google/route.ts` - Initiates Google OAuth
- `app/api/auth/callback/route.ts` - Handles OAuth callback
- `app/api/auth/signout/route.ts` - Signs out user
- `app/api/auth/user/route.ts` - Gets current user
- `lib/auth.ts` - Authentication utilities
- `middleware.ts` - Protects routes and handles auth

## Usage

### Sign In with Google (Client-side)

```typescript
import { signInWithGoogle } from '@/lib/auth/client';

await signInWithGoogle('/dashboard'); // Redirects to /dashboard after login
```

### Sign Out (Client-side)

```typescript
import { signOut } from '@/lib/auth/client';

await signOut();
```

### Check Authentication (Server-side)

```typescript
import { getCurrentUser, isAuthenticated } from '@/lib/auth/server';

const user = await getCurrentUser();
const authenticated = await isAuthenticated();
```

### Protect Routes

The middleware automatically protects `/dashboard` routes. Unauthenticated users are redirected to `/login`.

## Troubleshooting

### "Redirect URI mismatch"

- Make sure you've added the correct redirect URI in Google Cloud Console
- For Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`
- For local dev: `http://localhost:3000/api/auth/callback`

### "Invalid client ID"

- Verify your Google Client ID is correctly set in Supabase Dashboard
- Make sure you're using the OAuth Client ID, not the API Key

### "User not authenticated"

- Check that Supabase Auth is enabled
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Make sure the Google provider is enabled in Supabase Dashboard

## Next Steps

1. Set up Google OAuth in Supabase Dashboard
2. Test the authentication flow
3. Customize the login page if needed
4. Add user profile creation after authentication
5. Set up RLS policies based on authenticated user

