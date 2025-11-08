/**
 * Prisma Test Utilities
 * 
 * Utilities for testing with Prisma
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

/**
 * Create a test Prisma client
 */
export function createTestPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'test' ? ['error'] : [],
  });
}

/**
 * Reset the test database
 */
export async function resetTestDatabase(prisma: PrismaClient) {
  // Delete all records in reverse order of dependencies
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.company.deleteMany();
}

/**
 * Seed test database with minimal data
 */
export async function seedTestDatabase(prisma: PrismaClient) {
  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      website: 'https://test.example.com',
    },
  });

  // Create test job posting
  const jobPosting = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      title: 'Test Job',
      status: 'PUBLISHED',
    },
  });

  // Create test candidate
  const candidate = await prisma.candidate.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    },
  });

  return {
    company,
    jobPosting,
    candidate,
  };
}

/**
 * Helper to run tests with a clean database
 */
export async function withTestDatabase<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = createTestPrismaClient();

  try {
    await resetTestDatabase(prisma);
    return await callback(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Mock Prisma client for unit tests
 * Note: Install jest or vitest to use this with a test framework
 */
export function createMockPrismaClient() {
  // This is a basic mock structure
  // In a real test setup, use your test framework's mocking utilities
  return {
    company: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
      delete: async () => null,
    },
    jobPosting: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
      delete: async () => null,
    },
    candidate: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
      delete: async () => null,
    },
    application: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
      delete: async () => null,
    },
    interview: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
      delete: async () => null,
    },
    $transaction: async (callback: any) => callback({}),
    $disconnect: async () => {},
  } as any;
}

/**
 * Helper to create test data factories
 */
export const testFactories = {
  company: (overrides?: any) => ({
    name: 'Test Company',
    website: 'https://test.example.com',
    ...overrides,
  }),

  jobPosting: (companyId: string, overrides?: any) => ({
    companyId,
    title: 'Test Job',
    status: 'PUBLISHED' as const,
    ...overrides,
  }),

  candidate: (overrides?: any) => ({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    ...overrides,
  }),

  application: (jobPostingId: string, candidateId: string, overrides?: any) => ({
    jobPostingId,
    candidateId,
    status: 'APPLIED' as const,
    ...overrides,
  }),

  interview: (applicationId: string, overrides?: any) => ({
    applicationId,
    status: 'SCHEDULED' as const,
    scheduledAt: new Date(),
    ...overrides,
  }),
};

