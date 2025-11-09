/**
 * Server-Side Authentication
 * Use in Server Components and API Routes only
 */

import { createClient } from '../supabase/server';
import { prisma } from '../prisma';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get or create user profile in database
 * Links Supabase auth user to our User table
 */
export async function getUserProfile(supabaseUser: SupabaseUser) {
  // Check if user exists in our database
  let user = await prisma.user.findUnique({
    where: { email: supabaseUser.email! },
    include: { company: true }
  });

  // If user doesn't exist, this is their first login
  if (!user) {
    // For now, we'll need to create their company or assign them
    // You can implement company creation flow here
    throw new Error('User profile not found. Please complete onboarding.');
  }

  return user;
}

/**
 * Get current user with company info
 */
export async function getCurrentUserWithCompany() {
  const supabaseUser = await getCurrentUser();
  if (!supabaseUser) return null;

  try {
    const user = await getUserProfile(supabaseUser);
    return user;
  } catch {
    return null;
  }
}
