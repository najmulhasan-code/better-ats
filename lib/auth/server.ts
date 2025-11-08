/**
 * Server-Side Authentication Utilities
 * 
 * Use these functions in Server Components and API Routes only
 */

import { createClient } from '../supabase/server';

/**
 * Get the current authenticated user (server-side)
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

