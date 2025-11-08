/**
 * Prisma Query Helpers
 * 
 * Utility functions for common query patterns, pagination, and optimization
 */

import { Prisma } from '@prisma/client';
import type { PaginatedResponse } from './types';

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Cursor-based pagination options
 */
export interface CursorPaginationOptions {
  cursor?: string;
  take: number;
}

/**
 * Offset-based pagination result
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create paginated query
 */
export function createPaginatedQuery<T>(
  model: any,
  options: PaginationOptions & {
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
  }
): Promise<PaginationResult<T>> {
  const { page, pageSize, where, include, select, orderBy } = options;
  const skip = (page - 1) * pageSize;

  return Promise.all([
    model.findMany({
      skip,
      take: pageSize,
      where,
      include,
      select,
      orderBy,
    }),
    model.count({ where }),
  ]).then(([data, total]) => {
    const totalPages = Math.ceil(total / pageSize);
    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  });
}

/**
 * Cursor-based pagination
 */
export function createCursorPagination<T>(
  model: any,
  options: CursorPaginationOptions & {
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
    cursorField?: string;
  }
): Promise<{ data: T[]; nextCursor: string | null }> {
  const { cursor, take, where, include, select, orderBy, cursorField = 'id' } = options;

  const query: any = {
    take: take + 1, // Fetch one extra to determine if there's a next page
    where,
    include,
    select,
    orderBy,
  };

  if (cursor) {
    query.cursor = { [cursorField]: cursor };
    query.skip = 1;
  }

  return model.findMany(query).then((data: T[]) => {
    const hasNext = data.length > take;
    const items = hasNext ? data.slice(0, -1) : data;
    const nextCursor = hasNext ? (items[items.length - 1] as any)[cursorField] : null;

    return {
      data: items,
      nextCursor,
    };
  });
}

// ============================================================================
// SELECT OPTIMIZATION
// ============================================================================

/**
 * Create optimized select for common queries
 */
export const selectHelpers = {
  /**
   * Minimal company fields
   */
  companyMinimal: {
    id: true,
    name: true,
    website: true,
  } satisfies Prisma.CompanySelect,

  /**
   * Minimal job posting fields
   */
  jobPostingMinimal: {
    id: true,
    title: true,
    location: true,
    employmentType: true,
    status: true,
    createdAt: true,
  } satisfies Prisma.JobPostingSelect,

  /**
   * Minimal candidate fields
   */
  candidateMinimal: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  } satisfies Prisma.CandidateSelect,

  /**
   * Minimal application fields
   */
  applicationMinimal: {
    id: true,
    status: true,
    appliedAt: true,
  } satisfies Prisma.ApplicationSelect,
};

// ============================================================================
// AGGREGATION HELPERS
// ============================================================================

/**
 * Get count with where clause
 */
export async function getCount(model: any, where?: any): Promise<number> {
  return model.count({ where });
}

/**
 * Get grouped counts
 */
export async function getGroupedCount(
  model: any,
  groupBy: string | string[],
  where?: any
): Promise<Record<string, number>> {
  const result = await model.groupBy({
    by: Array.isArray(groupBy) ? groupBy : [groupBy],
    where,
    _count: true,
  });

  return result.reduce((acc: Record<string, number>, item: any) => {
    const key = Array.isArray(groupBy)
      ? groupBy.map((field) => item[field]).join('-')
      : item[groupBy];
    acc[key] = item._count;
    return acc;
  }, {});
}

/**
 * Get statistics for a model
 */
export async function getStatistics(model: any, where?: any) {
  const [total, byStatus] = await Promise.all([
    model.count({ where }),
    model.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
  };
}

// ============================================================================
// SEARCH HELPERS
// ============================================================================

/**
 * Create search query for text fields
 */
export function createSearchQuery(
  fields: string[],
  searchTerm: string,
  mode: 'insensitive' | 'default' = 'insensitive'
): Prisma.StringFilter {
  return {
    contains: searchTerm,
    mode,
  };
}

/**
 * Create multi-field search query
 */
export function createMultiFieldSearch(
  fields: string[],
  searchTerm: string
): Prisma.Enumerable<{ [key: string]: { contains: string; mode: 'insensitive' } }> {
  return fields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive' as const,
    },
  })) as any;
}

// ============================================================================
// FILTER HELPERS
// ============================================================================

/**
 * Create date range filter
 */
export function createDateRangeFilter(
  startDate?: Date,
  endDate?: Date
): Prisma.DateTimeFilter | undefined {
  if (!startDate && !endDate) return undefined;

  const filter: Prisma.DateTimeFilter = {};
  if (startDate) filter.gte = startDate;
  if (endDate) filter.lte = endDate;

  return filter;
}

/**
 * Create status filter
 */
export function createStatusFilter(status?: string | string[]): any {
  if (!status) return undefined;
  if (Array.isArray(status)) {
    return { in: status };
  }
  return status;
}

