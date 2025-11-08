/**
 * Application Repository
 * 
 * Repository for Application model with custom business logic
 */

import { prisma } from '../prisma';
import { BaseRepository } from './base.repository';
import type {
  Application,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationWhereInput,
} from '../prisma/types';

export class ApplicationRepository extends BaseRepository<
  Application,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationWhereInput
> {
  protected model = prisma.application;

  /**
   * Get applications by status
   */
  async getByStatus(status: string) {
    return this.findMany({
      where: {
        status: status as any,
      } as ApplicationWhereInput,
      include: {
        candidate: true,
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
    });
  }

  /**
   * Get applications by candidate
   */
  async getByCandidate(candidateId: string) {
    return this.findMany({
      where: {
        candidateId,
      } as ApplicationWhereInput,
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
    });
  }

  /**
   * Get applications by job posting
   */
  async getByJobPosting(jobPostingId: string) {
    return this.findMany({
      where: {
        jobPostingId,
      } as ApplicationWhereInput,
      include: {
        candidate: true,
        interviews: true,
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

  /**
   * Get application with full relations
   */
  async findWithRelations(id: string) {
    return this.findUnique({ id }, {
      include: {
        candidate: true,
        jobPosting: {
          include: {
            company: true,
          },
        },
        interviews: {
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Get application statistics
   */
  async getStatistics(jobPostingId?: string) {
    const where = jobPostingId ? { jobPostingId } : {};
    
    const [total, byStatus] = await Promise.all([
      this.count(where as ApplicationWhereInput),
      prisma.application.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const applicationRepository = new ApplicationRepository();

