/**
 * Prisma Error Handling
 * 
 * Custom error handlers and utilities for Prisma errors
 */

import { Prisma } from '@prisma/client';

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PrismaError extends Error {
  constructor(
    message: string,
    public code?: string,
    public meta?: any
  ) {
    super(message);
    this.name = 'PrismaError';
  }
}

export class NotFoundError extends PrismaError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND'
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends PrismaError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UniqueConstraintError extends PrismaError {
  constructor(field: string, value: string) {
    super(
      `Unique constraint violation: ${field} with value ${value} already exists`,
      'UNIQUE_CONSTRAINT'
    );
    this.name = 'UniqueConstraintError';
  }
}

export class ForeignKeyError extends PrismaError {
  constructor(field: string, value: string) {
    super(
      `Foreign key constraint violation: ${field} with value ${value} does not exist`,
      'FOREIGN_KEY'
    );
    this.name = 'ForeignKeyError';
  }
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Handle Prisma errors and convert to custom errors
 */
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target.join(', ') : 'field';
        throw new UniqueConstraintError(field, 'unknown');

      case 'P2003':
        // Foreign key constraint violation
        const fieldName = error.meta?.field_name as string | undefined;
        throw new ForeignKeyError(fieldName || 'field', 'unknown');

      case 'P2025':
        // Record not found
        throw new NotFoundError('Record');

      case 'P2000':
        // Value too long
        throw new ValidationError(
          `Value too long for field: ${error.meta?.target}`,
          error.meta?.target as string
        );

      case 'P2001':
        // Record does not exist
        throw new NotFoundError('Record');

      default:
        throw new PrismaError(
          error.message,
          error.code,
          error.meta
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new ValidationError(error.message);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new PrismaError(
      `Database connection error: ${error.message}`,
      'INITIALIZATION_ERROR'
    );
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new PrismaError(
      'Database engine panic. Please try again.',
      'RUST_PANIC'
    );
  }

  // Re-throw if not a Prisma error
  throw error;
}

/**
 * Wrap a Prisma operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handlePrismaError(error);
    throw error; // This will never be reached, but TypeScript needs it
  }
}

/**
 * Safe find operation that returns null instead of throwing
 */
export async function safeFindUnique<T>(
  operation: () => Promise<T | null>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return null;
      }
    }
    handlePrismaError(error);
    throw error;
  }
}

/**
 * Retry a Prisma operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on validation errors or not found errors
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof UniqueConstraintError ||
        error instanceof ForeignKeyError
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

/**
 * Convert error to API response format
 */
export function errorToResponse(error: unknown): {
  success: false;
  error: string;
  code?: string;
  field?: string;
} {
  if (error instanceof PrismaError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      field: error instanceof ValidationError ? error.field : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unknown error occurred',
  };
}

