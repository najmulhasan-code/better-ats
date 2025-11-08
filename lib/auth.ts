<<<<<<< HEAD
// This simulates the current logged-in user's company
// In production, this would come from your auth session (Supabase, NextAuth, etc.)

export const CURRENT_COMPANY = {
  slug: 'demo-company',
  name: 'Demo Company',
  id: 'company-1',
};

// In production, this would be:
// export async function getCurrentCompany() {
//   const session = await getSession();
//   return await db.companies.findById(session.user.companyId);
// }
=======
/**
 * Authentication Utilities - Barrel Export
 * 
 * This file re-exports client and server functions from separate files.
 * This allows Next.js to properly tree-shake and avoid bundling server code in client components.
 * 
 * For better tree-shaking, import directly from:
 * - @/lib/auth.client for client-side functions (Client Components)
 * - @/lib/auth.server for server-side functions (Server Components, API Routes)
 * 
 * This barrel file is provided for convenience, but direct imports are preferred.
 */

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

>>>>>>> 1de30ff8c50732e5245f452ea091ec23c61ae7e4
