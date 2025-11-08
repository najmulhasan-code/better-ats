# Google Authentication - Quick Start

## What Was Implemented

✅ **Complete Google OAuth authentication flow** using Supabase's built-in Google provider

### Files Created/Updated:

1. **API Routes:**
   - `app/api/auth/google/route.ts` - Initiates Google OAuth
   - `app/api/auth/callback/route.ts` - Handles OAuth callback
   - `app/api/auth/signout/route.ts` - Signs out user
   - `app/api/auth/user/route.ts` - Gets current user

2. **Utilities:**
   - `lib/auth.ts` - Authentication helper functions
   - `middleware.ts` - Protects routes and handles auth state

3. **Components:**
   - `components/landing/Login.tsx` - Updated with functional Google sign-in buttons

## Setup Steps

### 1. Configure Google OAuth in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and toggle it **ON**
3. Get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select a project
   - Enable **Google+ API** or **Google Identity Services**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Add authorized redirect URI:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - For local development, also add:
     ```
     http://localhost:3000/api/auth/callback
     ```
4. Copy **Client ID** and **Client Secret**
5. Paste them in Supabase Dashboard → Google provider settings
6. Click **Save**

### 2. Test the Authentication

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected to `/dashboard`

## Using Your Firebase Web Client ID

**Important:** Even though you have a Firebase Web Client ID, you should use it in **Supabase's Google OAuth settings**, not directly in the code.

### Why?

- Supabase handles all OAuth complexity
- Integrated with your existing Supabase setup
- Works with Row Level Security (RLS)
- Automatic session management
- No additional dependencies needed

### How to Use Your Firebase Client ID:

1. Your Firebase Web Client ID is actually a **Google OAuth Client ID**
2. Use it in Supabase Dashboard → Authentication → Providers → Google
3. Paste the **Client ID** in the "Client ID (for OAuth)" field
4. Get the **Client Secret** from Google Cloud Console (same project)

## Features

✅ **Google Sign-In/Sign-Up** - Single button for both actions
✅ **Protected Routes** - `/dashboard` requires authentication
✅ **Automatic Redirects** - Redirects to login if not authenticated
✅ **Error Handling** - Shows error messages on login page
✅ **Loading States** - Shows loading indicators during auth
✅ **Session Management** - Automatic session refresh via middleware

## Usage Examples

### Sign In with Google (Client-side)

```typescript
import { signInWithGoogle } from '@/lib/auth/client';

await signInWithGoogle('/dashboard');
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
if (user) {
  console.log('User email:', user.email);
}

const authenticated = await isAuthenticated();
```

### Protect API Routes

```typescript
import { getCurrentUser } from '@/lib/auth/server';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // User is authenticated, proceed...
}
```

## Route Protection

The `middleware.ts` automatically:
- ✅ Protects `/dashboard` routes
- ✅ Redirects unauthenticated users to `/login`
- ✅ Redirects authenticated users away from `/login`
- ✅ Refreshes expired sessions

## Troubleshooting

### "Redirect URI mismatch"

**Solution:**
1. Add the correct redirect URI in Google Cloud Console:
   - Production: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Development: `http://localhost:3000/api/auth/callback`

### "Invalid client ID"

**Solution:**
1. Verify Client ID is correctly set in Supabase Dashboard
2. Make sure you're using OAuth Client ID, not API Key
3. Check that Google provider is enabled in Supabase

### "User not authenticated after login"

**Solution:**
1. Check Supabase Dashboard → Authentication → Providers → Google is enabled
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
3. Check browser console for errors
4. Verify redirect URI matches exactly in Google Cloud Console

## Next Steps

1. ✅ Configure Google OAuth in Supabase Dashboard
2. ✅ Test the authentication flow
3. 🔄 Create user profiles after authentication
4. 🔄 Set up RLS policies based on authenticated user
5. 🔄 Add user profile page
6. 🔄 Customize the login page design

## Documentation

- Full setup guide: `docs/GOOGLE-AUTH-SETUP.md`
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2

