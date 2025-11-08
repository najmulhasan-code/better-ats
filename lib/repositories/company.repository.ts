/**
 * Company Repository
 * 
 * Repository for Company model with custom business logic
 */

import { prisma } from '../prisma';
import { BaseRepository } from './base.repository';
import type { Company, CompanyCreateInput, CompanyUpdateInput, CompanyWhereInput } from '../prisma/types';

export class CompanyRepository extends BaseRepository<
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
  CompanyWhereInput
> {
  protected model = prisma.company;

  /**
   * Find company by name
   */
  async findByName(name: string) {
    return this.findFirst({
      name: {
        equals: name,
        mode: 'insensitive',
      },
    } as CompanyWhereInput);
  }

  /**
   * Get company with job postings
   */
  async findWithJobPostings(id: string) {
    return this.findUnique({ id }, {
      include: {
        jobPostings: {
          include: {
            applications: {
              include: {
                candidate: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Search companies by name
   */
  async search(query: string) {
    return this.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      } as CompanyWhereInput,
      include: {
        _count: {
          select: {
            jobPostings: true,
          },
        },
      },
    });
  }
}

export const companyRepository = new CompanyRepository();

