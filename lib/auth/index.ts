/**
 * Authentication Utilities - Main Export
 * 
 * This file exports the appropriate functions based on usage context.
 * For explicit imports, use:
 * - @/lib/auth/client for client-side functions
 * - @/lib/auth/server for server-side functions
 */

// Re-export client functions (for convenience, but prefer direct imports)
export * from './client';

// Server functions are not exported here to avoid bundling issues
// Import directly from './server' in server components/API routes

