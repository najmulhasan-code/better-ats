/**
 * Database utilities and helpers
 * 
 * This file provides helpers for using Prisma and Supabase together
 */

import { prisma } from './prisma';
import { createClient } from './supabase/server';

/**
 * Get Prisma client for database queries
 * Use this for type-safe database operations
 */
export { prisma };

/**
 * Get Supabase client for Supabase services
 * Use this for authentication, real-time, and storage
 */
export async function getSupabaseClient() {
  return await createClient();
}

/**
 * Example: Get authenticated user and their data
 */
export async function getAuthenticatedUserData() {
  const supabase = await getSupabaseClient();
  
  // Get authenticated user from Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  // Use Prisma to get user's data from database
  // Assuming you have a users table or link via email
  const userData = await prisma.candidate.findUnique({
    where: { email: user.email! },
    include: {
      applications: {
        include: {
          jobPosting: {
            include: {
              company: true,
            },
          },
        },
      },
    },
  });

  return {
    authUser: user,
    candidateData: userData,
  };
}

/**
 * Example: Create application with real-time notification
 */
export async function createApplicationWithNotification(applicationData: {
  jobPostingId: string;
  candidateId: string;
  coverLetter?: string;
}) {
  // 1. Create application using Prisma (type-safe)
  const application = await prisma.application.create({
    data: applicationData,
    include: {
      candidate: true,
      jobPosting: {
        include: {
          company: true,
        },
      },
    },
  });

  // 2. Optionally: Use Supabase to send real-time notification
  // (This would typically be done via Supabase Edge Function or trigger)
  
  return application;
}

