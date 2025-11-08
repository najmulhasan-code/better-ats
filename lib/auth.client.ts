/**
 * Client-Side Authentication Utilities
 * 
 * This file contains only client-side auth functions.
 * Import this in Client Components to avoid bundling server code.
 */

import { createClient } from './supabase/client';

/**
 * Sign in with Google (client-side)
 */
export async function signInWithGoogle(redirectTo: string = '/dashboard') {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out (client-side)
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * Get current user (client-side)
 */
export async function getCurrentUserClient() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

