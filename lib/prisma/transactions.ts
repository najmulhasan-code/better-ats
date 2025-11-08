/**
 * Prisma Transaction Helpers
 * 
 * Utility functions for transactions and batch operations
 */

import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

// ============================================================================
// TRANSACTION HELPERS
// ============================================================================

/**
 * Execute a function within a transaction
 */
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback, {
    maxWait: 5000, // Maximum time to wait for a transaction slot
    timeout: 10000, // Maximum time the transaction can run
  });
}

/**
 * Execute multiple operations in parallel within a transaction
 */
export async function parallelTransaction<T>(
  operations: Array<(tx: Prisma.TransactionClient) => Promise<T>>
): Promise<T[]> {
  return withTransaction(async (tx) => {
    return Promise.all(operations.map((op) => op(tx)));
  });
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch create records
 */
export async function batchCreate<T extends Prisma.ModelName>(
  model: T,
  data: any[],
  options?: { skipDuplicates?: boolean }
): Promise<{ count: number }> {
  const modelClient = (prisma as any)[model.toLowerCase()] as any;
  
  if (options?.skipDuplicates) {
    return modelClient.createMany({
      data,
      skipDuplicates: true,
    });
  }
  
  return modelClient.createMany({
    data,
  });
}

/**
 * Batch update records
 */
export async function batchUpdate<T extends Prisma.ModelName>(
  model: T,
  where: any,
  data: any
): Promise<{ count: number }> {
  const modelClient = (prisma as any)[model.toLowerCase()] as any;
  return modelClient.updateMany({
    where,
    data,
  });
}

/**
 * Batch delete records
 */
export async function batchDelete<T extends Prisma.ModelName>(
  model: T,
  where: any
): Promise<{ count: number }> {
  const modelClient = (prisma as any)[model.toLowerCase()] as any;
  return modelClient.deleteMany({
    where,
  });
}

// ============================================================================
// NESTED WRITES
// ============================================================================

/**
 * Create application with candidate and job posting in one transaction
 */
export async function createApplicationWithRelations(data: {
  candidate: Prisma.CandidateCreateInput;
  jobPostingId: string;
  coverLetter?: string;
  status?: string;
}) {
  return withTransaction(async (tx) => {
    // Create or find candidate
    const candidate = await tx.candidate.upsert({
      where: { email: data.candidate.email! },
      update: data.candidate,
      create: data.candidate,
    });

    // Create application
    const application = await tx.application.create({
      data: {
        candidateId: candidate.id,
        jobPostingId: data.jobPostingId,
        coverLetter: data.coverLetter,
        status: data.status as any || 'APPLIED',
      },
      include: {
        candidate: true,
        jobPosting: {
          include: {
            company: true,
          },
        },
      },
    });

    return application;
  });
}

/**
 * Create job posting with company in one transaction
 */
export async function createJobPostingWithCompany(data: {
  company: Prisma.CompanyCreateInput;
  jobPosting: Omit<Prisma.JobPostingCreateInput, 'company'>;
}) {
  return withTransaction(async (tx) => {
    // Create or find company
    const company = await tx.company.upsert({
      where: { name: data.company.name },
      update: data.company,
      create: data.company,
    });

    // Create job posting
    const jobPosting = await tx.jobPosting.create({
      data: {
        ...data.jobPosting,
        company: {
          connect: { id: company.id },
        },
      },
      include: {
        company: true,
      },
    });

    return jobPosting;
  });
}

/**
 * Update application status and create interview in one transaction
 */
export async function updateApplicationAndCreateInterview(
  applicationId: string,
  newStatus: string,
  interviewData: Prisma.InterviewCreateInput
) {
  return withTransaction(async (tx) => {
    // Update application status
    const application = await tx.application.update({
      where: { id: applicationId },
      data: { status: newStatus as any },
    });

    // Create interview
    const interview = await tx.interview.create({
      data: {
        ...interviewData,
        application: {
          connect: { id: applicationId },
        },
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    });

    return { application, interview };
  });
}

// ============================================================================
// TRANSACTION EXAMPLES
// ============================================================================

/**
 * Example: Transfer application between job postings
 */
export async function transferApplication(
  applicationId: string,
  newJobPostingId: string
) {
  return withTransaction(async (tx) => {
    // Check if application exists
    const application = await tx.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Check if candidate already applied to new job posting
    const existingApplication = await tx.application.findUnique({
      where: {
        uq_application_job_candidate: {
          jobPostingId: newJobPostingId,
          candidateId: application.candidateId,
        },
      },
    });

    if (existingApplication) {
      throw new Error('Candidate already applied to this job posting');
    }

    // Update application
    const updatedApplication = await tx.application.update({
      where: { id: applicationId },
      data: {
        jobPostingId: newJobPostingId,
        status: 'APPLIED',
      },
      include: {
        candidate: true,
        jobPosting: {
          include: {
            company: true,
          },
        },
      },
    });

    return updatedApplication;
  });
}

