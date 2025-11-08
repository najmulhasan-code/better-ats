/**
 * Prisma Client Setup
 * 
 * Enhanced Prisma client with extensions, middleware, and optimizations
 */

import { PrismaClient } from '@prisma/client';
import {
  candidateExtensions,
  applicationExtensions,
  jobPostingExtensions,
  interviewExtensions,
} from './prisma/extensions';
import {
  createLoggingMiddleware,
  createValidationMiddleware,
} from './prisma/middleware';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please check your .env.local file.'
  );
}

/**
 * Create Prisma client with extensions and middleware
 */
function createPrismaClient() {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Add middleware (using $use - still supported, though extensions are preferred)
  // Note: In Prisma 5+, consider using extensions instead of middleware for better type safety
  try {
    baseClient.$use(createLoggingMiddleware());
    baseClient.$use(createValidationMiddleware());
  } catch (error) {
    // Middleware might not be available in all Prisma versions
    // Extensions are the recommended approach for Prisma 5+
    console.warn('Could not apply middleware:', error);
  }

  // Apply extensions
  let client = baseClient;
  
  try {
    // Apply extensions one by one for better compatibility
    client = client.$extends(candidateExtensions);
    client = client.$extends(applicationExtensions);
    client = client.$extends(jobPostingExtensions);
    client = client.$extends(interviewExtensions);
  } catch (error) {
    console.warn('Could not apply all extensions:', error);
    // Fallback to base client if extensions fail
    client = baseClient;
  }

  // Connection pool event handlers
  baseClient.$on('beforeExit' as never, async () => {
    console.log('Prisma client disconnecting...');
  });

  return client;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export types
export type PrismaClientType = typeof prisma;

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

