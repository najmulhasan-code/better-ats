/**
 * Authentication API Routes
 * 
 * Consolidated auth routes in one file to reduce merge conflicts.
 * Handles: Google OAuth, OAuth callback, sign out, and user info
 * 
 * Routes:
 * - GET  /api/auth/google?redirect_to=/dashboard
 * - GET  /api/auth/callback?code=...&next=/dashboard
 * - GET  /api/auth/user
 * - POST /api/auth/signout
 */

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth.server';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/google?redirect_to=/dashboard
 * Initiates Google OAuth sign-in flow
 */
async function handleGoogleAuth(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirect_to') || '/dashboard';

    // Get the origin URL for redirect
    const origin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = origin.startsWith('http') ? origin : `${protocol}://${origin}`;
    const redirectUrl = `${baseUrl}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    // Sign in with Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Redirect to Google OAuth page
    if (data.url) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/callback?code=...&next=/dashboard
 * Handles OAuth callback from Google and redirects user
 */
async function handleCallback(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (code) {
      const supabase = await createClient();
      
      // Exchange code for session (Supabase handles this automatically)
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(exchangeError.message)}`,
            request.url
          )
        );
      }

      // Successfully authenticated, redirect to dashboard
      return NextResponse.redirect(new URL(next, request.url));
    }

    // If no code and no error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

/**
 * GET /api/auth/user
 * Returns the currently authenticated user
 */
async function handleGetUser() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/signout
 * Signs out the current user
 */
async function handleSignOut() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred during sign out' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Route Handlers
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug?.[0] || '';
  const url = new URL(request.url);

  // Route based on slug
  switch (slug) {
    case 'google':
      return handleGoogleAuth(request);
    
    case 'callback':
      return handleCallback(request);
    
    case 'user':
      return handleGetUser();
    
    default:
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug?.[0] || '';

  // Route based on slug
  switch (slug) {
    case 'signout':
      return handleSignOut();
    
    default:
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
  }
}

