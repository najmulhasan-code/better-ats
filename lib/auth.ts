/**
 * Authentication Utilities
 *
 * This file provides both:
 * 1. Mock auth (CURRENT_COMPANY) for development with localStorage
 * 2. Production Supabase auth (re-exported from auth.client and auth.server)
 *
 * For better tree-shaking in production, import directly from:
 * - @/lib/auth.client for client-side functions (Client Components)
 * - @/lib/auth.server for server-side functions (Server Components, API Routes)
 */

// ============================================================================
// MOCK AUTH (for localStorage development)
// ============================================================================
// This simulates the current logged-in user's company
// Used by existing code until migration to Supabase is complete

export const CURRENT_COMPANY = {
  slug: 'demo-company',
  name: 'Demo Company',
  id: 'company-1',
};

// ============================================================================
// PRODUCTION SUPABASE AUTH
// ============================================================================
// Re-export client functions (safe for client components)
export {
  signInWithGoogle,
  signOut,
  getCurrentUserClient,
} from './auth.client';

// Re-export server functions (only used server-side, won't be bundled in client)
// Using dynamic import pattern that Next.js can tree-shake
export async function getCurrentUser() {
  const { getCurrentUser: serverGetCurrentUser } = await import('./auth.server');
  return serverGetCurrentUser();
}

export async function isAuthenticated(): Promise<boolean> {
  const { isAuthenticated: serverIsAuthenticated } = await import('./auth.server');
  return serverIsAuthenticated();
}
