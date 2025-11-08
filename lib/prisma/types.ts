/**
 * Prisma Type Exports and Helpers
 * 
 * Re-export Prisma types and create type helpers for better TypeScript usage
 */

import { Prisma } from '@prisma/client';

// ============================================================================
// RE-EXPORT COMMON TYPES
// ============================================================================

export type {
  Company,
  JobPosting,
  Candidate,
  Application,
  Interview,
  EmploymentType,
  JobPostingStatus,
  ApplicationStatus,
  InterviewType,
  InterviewStatus,
} from '@prisma/client';

// ============================================================================
// MODEL TYPES WITH RELATIONS
// ============================================================================

/**
 * Company with relations
 */
export type CompanyWithRelations = Prisma.CompanyGetPayload<{
  include: {
    jobPostings: true;
  };
}>;

/**
 * JobPosting with relations
 */
export type JobPostingWithRelations = Prisma.JobPostingGetPayload<{
  include: {
    company: true;
    applications: {
      include: {
        candidate: true;
      };
    };
  };
}>;

/**
 * Candidate with relations
 */
export type CandidateWithRelations = Prisma.CandidateGetPayload<{
  include: {
    applications: {
      include: {
        jobPosting: {
          include: {
            company: true;
          };
        };
      };
    };
  };
}>;

/**
 * Application with relations
 */
export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    candidate: true;
    jobPosting: {
      include: {
        company: true;
      };
    };
    interviews: true;
  };
}>;

/**
 * Interview with relations
 */
export type InterviewWithRelations = Prisma.InterviewGetPayload<{
  include: {
    application: {
      include: {
        candidate: true;
        jobPosting: {
          include: {
            company: true;
          };
        };
      };
    };
  };
}>;

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Company input type
 */
export type CompanyInput = Prisma.CompanyCreateInput;

/**
 * JobPosting input type
 */
export type JobPostingInput = Prisma.JobPostingCreateInput;

/**
 * Candidate input type
 */
export type CandidateInput = Prisma.CandidateCreateInput;

/**
 * Application input type
 */
export type ApplicationInput = Prisma.ApplicationCreateInput;

/**
 * Interview input type
 */
export type InterviewInput = Prisma.InterviewCreateInput;

// ============================================================================
// UPDATE TYPES
// ============================================================================

/**
 * Company update type
 */
export type CompanyUpdate = Prisma.CompanyUpdateInput;

/**
 * JobPosting update type
 */
export type JobPostingUpdate = Prisma.JobPostingUpdateInput;

/**
 * Candidate update type
 */
export type CandidateUpdate = Prisma.CandidateUpdateInput;

/**
 * Application update type
 */
export type ApplicationUpdate = Prisma.ApplicationUpdateInput;

/**
 * Interview update type
 */
export type InterviewUpdate = Prisma.InterviewUpdateInput;

// ============================================================================
// SELECT TYPES
// ============================================================================

/**
 * Create a select type for a model
 */
export type SelectFields<T, K extends keyof T> = Pick<T, K>;

/**
 * Company select fields
 */
export type CompanySelect = Prisma.CompanySelect;

/**
 * JobPosting select fields
 */
export type JobPostingSelect = Prisma.JobPostingSelect;

/**
 * Candidate select fields
 */
export type CandidateSelect = Prisma.CandidateSelect;

/**
 * Application select fields
 */
export type ApplicationSelect = Prisma.ApplicationSelect;

/**
 * Interview select fields
 */
export type InterviewSelect = Prisma.InterviewSelect;

// ============================================================================
// WHERE TYPES
// ============================================================================

/**
 * Company where type
 */
export type CompanyWhere = Prisma.CompanyWhereInput;

/**
 * JobPosting where type
 */
export type JobPostingWhere = Prisma.JobPostingWhereInput;

/**
 * Candidate where type
 */
export type CandidateWhere = Prisma.CandidateWhereInput;

/**
 * Application where type
 */
export type ApplicationWhere = Prisma.ApplicationWhereInput;

/**
 * Interview where type
 */
export type InterviewWhere = Prisma.InterviewWhereInput;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the type of a Prisma model
 */
export type ModelType<T extends Prisma.ModelName> = 
  T extends 'Company' ? Prisma.Company :
  T extends 'JobPosting' ? Prisma.JobPosting :
  T extends 'Candidate' ? Prisma.Candidate :
  T extends 'Application' ? Prisma.Application :
  T extends 'Interview' ? Prisma.Interview :
  never;

/**
 * API Response type helper
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Paginated response type
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

