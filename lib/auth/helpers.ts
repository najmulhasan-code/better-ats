/**
 * Auth Helper Functions
 * Utilities to get current user context
 */

import { getCurrentUserWithCompany } from './server';
import { headers } from 'next/headers';

/**
 * Get current user's company (server-side only)
 * Replacement for CURRENT_COMPANY mock
 *
 * Usage in Server Components:
 *   const company = await getCurrentCompany();
 *   if (!company) redirect('/onboarding');
 */
export async function getCurrentCompany() {
  const user = await getCurrentUserWithCompany();
  if (!user) return null;
  return user.company;
}

/**
 * Require authentication in Server Component
 * Throws error if not authenticated (caught by error boundary)
 */
export async function requireAuth() {
  const user = await getCurrentUserWithCompany();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Get user context from middleware-injected headers
 * Faster than database query
 */
export async function getUserFromHeaders() {
  const headersList = await headers();
  const companySlug = headersList.get('x-company-slug');
  const userEmail = headersList.get('x-user-email');
  const userRole = headersList.get('x-user-role');

  if (!companySlug || !userEmail) return null;

  return {
    email: userEmail,
    companySlug,
    role: userRole || 'recruiter',
  };
}
