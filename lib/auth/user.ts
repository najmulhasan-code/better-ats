/**
 * User Management Utilities
 * Create/update user profiles, manage company associations
 */

import { prisma } from '../prisma';
import type { User } from '@supabase/supabase-js';

/**
 * Get or create user in database after first Supabase login
 * This runs after successful Google OAuth
 */
export async function getOrCreateUser(supabaseUser: User) {
  const email = supabaseUser.email!;
  const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name;
  const avatarUrl = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture;

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  });

  if (user) {
    // Update avatar/name if changed
    if (user.avatarUrl !== avatarUrl || user.name !== name) {
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          avatarUrl: avatarUrl || user.avatarUrl
        },
        include: { company: true }
      });
    }
    return user;
  }

  // First-time login - user needs onboarding
  // For now, throw error to redirect to onboarding
  // Later you can create default company or assign them
  throw new Error('USER_NEEDS_ONBOARDING');
}

/**
 * Create a new user with their company
 * Called during onboarding flow
 */
export async function createUserWithCompany(data: {
  email: string;
  name: string;
  avatarUrl?: string;
  companyName: string;
  companySlug: string;
  role?: string;
}) {
  // Create company and user in transaction
  return await prisma.$transaction(async (tx) => {
    // Create company
    const company = await tx.company.create({
      data: {
        slug: data.companySlug,
        name: data.companyName,
      }
    });

    // Create user
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        companySlug: company.slug,
        role: data.role || 'admin', // First user is admin
      },
      include: { company: true }
    });

    return user;
  });
}

/**
 * Add a recruiter to an existing company
 */
export async function addRecruiterToCompany(data: {
  email: string;
  name: string;
  avatarUrl?: string;
  companySlug: string;
  role?: string;
}) {
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      companySlug: data.companySlug,
      role: data.role || 'recruiter',
    },
    include: { company: true }
  });
}
