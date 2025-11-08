/**
 * Prisma Middleware
 * 
 * Middleware for logging, validation, and audit trails
 */

import { Prisma } from '@prisma/client';

/**
 * Query logging middleware
 */
export function createLoggingMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    const duration = after - before;
    
    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn(`[Prisma] Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Prisma] ${params.model}.${params.action} - ${duration}ms`);
    }
    
    return result;
  };
}

/**
 * Audit trail middleware
 * Tracks who created/updated records (requires user context)
 */
export function createAuditMiddleware(getUserId?: () => string | null) {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const userId = getUserId?.() || null;
    
    // Add audit fields for create operations
    if (params.action === 'create') {
      if (params.args.data) {
        // Note: This is a placeholder. In a real app, you'd need to add
        // createdBy/updatedBy fields to your schema or use a separate audit table
        if (userId && typeof params.args.data === 'object') {
          // (params.args.data as any).createdBy = userId;
        }
      }
    }
    
    // Add audit fields for update operations
    if (params.action === 'update' || params.action === 'updateMany') {
      if (params.args.data && typeof params.args.data === 'object') {
        // (params.args.data as any).updatedBy = userId;
      }
    }
    
    return next(params);
  };
}

/**
 * Soft delete middleware
 * Intercepts delete operations and sets a deletedAt timestamp instead
 * Note: Requires deletedAt field in schema
 */
export function createSoftDeleteMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    // Intercept delete operations
    if (params.action === 'delete') {
      // Change to update with deletedAt
      return next({
        ...params,
        action: 'update',
        args: {
          ...params.args,
          data: {
            deletedAt: new Date(),
          },
        },
      });
    }
    
    // Intercept deleteMany operations
    if (params.action === 'deleteMany') {
      // Change to updateMany with deletedAt
      return next({
        ...params,
        action: 'updateMany',
        args: {
          ...params.args,
          data: {
            deletedAt: new Date(),
          },
        },
      });
    }
    
    // Filter out soft-deleted records in find operations
    if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
      if (!params.args.where) {
        params.args.where = {};
      }
      (params.args.where as any).deletedAt = null;
    }
    
    return next(params);
  };
}

/**
 * Validation middleware
 * Validates data before it hits the database
 */
export function createValidationMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    // Validate email format
    if (params.model === 'Candidate' && params.action === 'create') {
      const email = (params.args.data as any)?.email;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }
    }
    
    // Validate required fields
    if (params.action === 'create' || params.action === 'update') {
      const data = params.args.data;
      if (data && typeof data === 'object') {
        // Add custom validation logic here
        // Example: Ensure jobPostingId exists when creating application
        if (params.model === 'Application' && params.action === 'create') {
          const jobPostingId = (data as any).jobPostingId;
          if (!jobPostingId) {
            throw new Error('jobPostingId is required');
          }
        }
      }
    }
    
    return next(params);
  };
}

