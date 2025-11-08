/**
 * Job Posting Repository
 * 
 * Repository for JobPosting model with custom business logic
 */

import { prisma } from '../prisma';
import { BaseRepository } from './base.repository';
import type {
  JobPosting,
  JobPostingCreateInput,
  JobPostingUpdateInput,
  JobPostingWhereInput,
} from '../prisma/types';

export class JobPostingRepository extends BaseRepository<
  JobPosting,
  JobPostingCreateInput,
  JobPostingUpdateInput,
  JobPostingWhereInput
> {
  protected model = prisma.jobPosting;

  /**
   * Get published job postings
   */
  async getPublished() {
    return this.findMany({
      where: {
        status: 'PUBLISHED',
      } as JobPostingWhereInput,
      include: {
        company: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Search job postings
   */
  async search(query: string) {
    return this.findMany({
      where: {
        AND: [
          { status: 'PUBLISHED' },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      } as JobPostingWhereInput,
      include: {
        company: true,
      },
    });
  }

  /**
   * Get job postings by company
   */
  async getByCompany(companyId: string) {
    return this.findMany({
      where: {
        companyId,
      } as JobPostingWhereInput,
      include: {
        company: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get job posting with applications
   */
  async findWithApplications(id: string) {
    return this.findUnique({ id }, {
      include: {
        company: true,
        applications: {
          include: {
            candidate: true,
            interviews: true,
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });
  }
}

export const jobPostingRepository = new JobPostingRepository();

