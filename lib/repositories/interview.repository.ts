/**
 * Interview Repository
 * 
 * Repository for Interview model with custom business logic
 */

import { prisma } from '../prisma';
import { BaseRepository } from './base.repository';
import type {
  Interview,
  InterviewCreateInput,
  InterviewUpdateInput,
  InterviewWhereInput,
} from '../prisma/types';

export class InterviewRepository extends BaseRepository<
  Interview,
  InterviewCreateInput,
  InterviewUpdateInput,
  InterviewWhereInput
> {
  protected model = prisma.interview;

  /**
   * Get upcoming interviews
   */
  async getUpcoming(days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return this.findMany({
      where: {
        scheduledAt: {
          gte: new Date(),
          lte: date,
        },
        status: 'SCHEDULED',
      } as InterviewWhereInput,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  /**
   * Get interviews by status
   */
  async getByStatus(status: string) {
    return this.findMany({
      where: {
        status: status as any,
      } as InterviewWhereInput,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  /**
   * Get interviews by application
   */
  async getByApplication(applicationId: string) {
    return this.findMany({
      where: {
        applicationId,
      } as InterviewWhereInput,
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  /**
   * Get interview with full relations
   */
  async findWithRelations(id: string) {
    return this.findUnique({ id }, {
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });
  }
}

export const interviewRepository = new InterviewRepository();

