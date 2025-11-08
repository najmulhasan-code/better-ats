/**
 * Candidate Repository
 * 
 * Repository for Candidate model with custom business logic
 */

import { prisma } from '../prisma';
import { BaseRepository } from './base.repository';
import type {
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
  CandidateWhereInput,
} from '../prisma/types';

export class CandidateRepository extends BaseRepository<
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
  CandidateWhereInput
> {
  protected model = prisma.candidate;

  /**
   * Find candidate by email
   */
  async findByEmail(email: string) {
    return this.findUnique({ email });
  }

  /**
   * Search candidates
   */
  async search(query: string) {
    return this.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      } as CandidateWhereInput,
    });
  }

  /**
   * Get candidate with applications
   */
  async findWithApplications(id: string) {
    return this.findUnique({ id }, {
      include: {
        applications: {
          include: {
            jobPosting: {
              include: {
                company: true,
              },
            },
            interviews: true,
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Get candidate statistics
   */
  async getStatistics(id: string) {
    const candidate = await this.findWithApplications(id);
    if (!candidate) return null;

    const applications = candidate.applications || [];
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications: applications.length,
      statusCounts,
      interviewsCount: applications.reduce((sum, app) => sum + (app.interviews?.length || 0), 0),
    };
  }
}

export const candidateRepository = new CandidateRepository();

