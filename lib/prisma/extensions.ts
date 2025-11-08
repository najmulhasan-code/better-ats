/**
 * Prisma Client Extensions
 * 
 * Custom methods and computed fields for Prisma models
 */

import { Prisma } from '@prisma/client';

/**
 * Candidate Model Extensions
 */
export const candidateExtensions = Prisma.defineExtension({
  name: 'candidateExtensions',
  model: {
    candidate: {
      /**
       * Get full name of candidate
       */
      async getFullName(id: string) {
        const candidate = await this.findUnique({ where: { id } });
        if (!candidate) return null;
        return `${candidate.firstName} ${candidate.lastName}`;
      },

      /**
       * Search candidates by name or email
       */
      async search(query: string) {
        return this.findMany({
          where: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        });
      },
    },
  },
  result: {
    candidate: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(candidate) {
          return `${candidate.firstName} ${candidate.lastName}`;
        },
      },
      initials: {
        needs: { firstName: true, lastName: true },
        compute(candidate) {
          return `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();
        },
      },
    },
  },
});

/**
 * Application Model Extensions
 */
export const applicationExtensions = Prisma.defineExtension({
  name: 'applicationExtensions',
  model: {
    application: {
      /**
       * Get applications by status
       */
      async getByStatus(status: string) {
        return this.findMany({
          where: { status: status as any },
          include: {
            candidate: true,
            jobPosting: {
              include: {
                company: true,
              },
            },
          },
        });
      },

      /**
       * Get application statistics
       */
      async getStatistics(jobPostingId?: string) {
        const where = jobPostingId ? { jobPostingId } : {};
        
        const [total, byStatus] = await Promise.all([
          this.count({ where }),
          this.groupBy({
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
      },
    },
  },
});

/**
 * Job Posting Model Extensions
 */
export const jobPostingExtensions = Prisma.defineExtension({
  name: 'jobPostingExtensions',
  model: {
    jobPosting: {
      /**
       * Get published job postings
       */
      async getPublished() {
        return this.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            company: true,
            applications: {
              include: {
                candidate: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      },

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
          },
          include: {
            company: true,
          },
        });
      },

      /**
       * Get application count for a job posting
       */
      async getApplicationCount(id: string) {
        return this.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                applications: true,
              },
            },
          },
        });
      },
    },
  },
});

/**
 * Interview Model Extensions
 */
export const interviewExtensions = Prisma.defineExtension({
  name: 'interviewExtensions',
  model: {
    interview: {
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
          },
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
      },

      /**
       * Get interviews by status
       */
      async getByStatus(status: string) {
        return this.findMany({
          where: { status: status as any },
          include: {
            application: {
              include: {
                candidate: true,
                jobPosting: true,
              },
            },
          },
        });
      },
    },
  },
});

// Export individual extensions for flexible usage
// They can be combined when creating the Prisma client

