/**
 * Authentication Module
 * Central export point for all auth functions
 */

// Client-side exports (safe for client components)
export {
  signInWithGoogle,
  signOut,
  getCurrentUserClient,
} from './client';

// Client-side hooks
export {
  useCurrentUser,
  useCurrentCompany,
} from './hooks';

// Server-side exports (use dynamic import for better tree-shaking)
export async function getCurrentUser() {
  const { getCurrentUser: fn } = await import('./server');
  return fn();
}

export async function isAuthenticated() {
  const { isAuthenticated: fn } = await import('./server');
  return fn();
}

export async function getCurrentUserWithCompany() {
  const { getCurrentUserWithCompany: fn } = await import('./server');
  return fn();
}

export async function getCurrentCompany() {
  const { getCurrentCompany: fn } = await import('./helpers');
  return fn();
}
