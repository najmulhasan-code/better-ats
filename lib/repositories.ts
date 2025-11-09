/**
 * Repository Pattern for Database Access
 * Provides a clean abstraction layer for database operations
 */

import { prisma } from './prisma';

/**
 * Application Repository
 * Handles candidate/application database operations
 */
export const applicationRepository = {
  /**
   * Find candidate with related data (job posting, company, etc.)
   * Note: In this codebase, "application" refers to a Candidate record
   */
  async findWithRelations(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        company: true,
        applicationResponses: true,
      },
    });

    if (!candidate) {
      return null;
    }

    // Transform to match the expected interface
    // Map job to jobPosting for backward compatibility
    return {
      ...candidate,
      jobPosting: candidate.job,
      candidate: {
        ...candidate,
        resumeUrl: candidate.resumeFile, // Map resumeFile to resumeUrl
      },
      // Also include direct access to job and resumeFile
      job: candidate.job,
      resumeFile: candidate.resumeFile,
      coverLetter: candidate.coverLetter,
    };
  },
};

