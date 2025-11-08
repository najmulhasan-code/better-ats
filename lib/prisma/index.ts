/**
 * Prisma Module Exports
 * 
 * Centralized exports for all Prisma-related functionality
 */

// Main Prisma client
export { prisma, type PrismaClientType } from '../prisma';

// Types
export * from './types';

// Query helpers
export * from './query-helpers';

// Transactions
export * from './transactions';

// Error handling
export * from './errors';

// Extensions (internal use)
export * from './extensions';

// Middleware (internal use)
export * from './middleware';

// Test utilities
export * from './test-utils';

