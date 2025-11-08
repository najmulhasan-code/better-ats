/**
 * Application Service
 * 
 * Business logic layer for applications
 */

import { applicationRepository } from '../repositories';
import { candidateRepository } from '../repositories';
import { jobPostingRepository } from '../repositories';
import { createApplicationWithRelations } from '../prisma/transactions';
import { handlePrismaError, NotFoundError } from '../prisma/errors';
import type { ApplicationCreateInput } from '../prisma/types';

export class ApplicationService {
  /**
   * Create application with candidate if doesn't exist
   */
  async createApplication(data: {
    candidate: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
    jobPostingId: string;
    coverLetter?: string;
  }) {
    try {
      // Check if job posting exists
      const jobPosting = await jobPostingRepository.findUnique({ id: data.jobPostingId });
      if (!jobPosting) {
        throw new NotFoundError('JobPosting', data.jobPostingId);
      }

      // Create application with relations
      return await createApplicationWithRelations({
        candidate: data.candidate,
        jobPostingId: data.jobPostingId,
        coverLetter: data.coverLetter,
      });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateStatus(applicationId: string, status: string) {
    try {
      const application = await applicationRepository.findUnique({ id: applicationId });
      if (!application) {
        throw new NotFoundError('Application', applicationId);
      }

      return await applicationRepository.update(
        { id: applicationId },
        { status: status as any }
      );
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Get application statistics
   */
  async getStatistics(jobPostingId?: string) {
    try {
      return await applicationRepository.getStatistics(jobPostingId);
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Get applications by candidate
   */
  async getByCandidate(candidateId: string) {
    try {
      return await applicationRepository.getByCandidate(candidateId);
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Get applications by job posting
   */
  async getByJobPosting(jobPostingId: string) {
    try {
      return await applicationRepository.getByJobPosting(jobPostingId);
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }
}

export const applicationService = new ApplicationService();

