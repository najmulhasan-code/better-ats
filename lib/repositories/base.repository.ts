/**
 * Base Repository Pattern
 * 
 * Generic repository interface and base implementation
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { handlePrismaError, NotFoundError } from '../prisma/errors';
import type { PaginationResult } from '../prisma/query-helpers';
import { createPaginatedQuery } from '../prisma/query-helpers';

/**
 * Base repository interface
 */
export interface IRepository<T, TCreate, TUpdate, TWhere> {
  findMany(options?: {
    where?: TWhere;
    include?: any;
    select?: any;
    orderBy?: any;
    take?: number;
    skip?: number;
  }): Promise<T[]>;

  findUnique(where: any, options?: { include?: any; select?: any }): Promise<T | null>;

  findFirst(where: TWhere, options?: { include?: any; select?: any }): Promise<T | null>;

  create(data: TCreate): Promise<T>;

  update(where: any, data: TUpdate): Promise<T>;

  delete(where: any): Promise<T>;

  count(where?: TWhere): Promise<number>;

  paginate(
    options: {
      page: number;
      pageSize: number;
      where?: TWhere;
      include?: any;
      select?: any;
      orderBy?: any;
    }
  ): Promise<PaginationResult<T>>;
}

/**
 * Base repository implementation
 */
export abstract class BaseRepository<T, TCreate, TUpdate, TWhere>
  implements IRepository<T, TCreate, TUpdate, TWhere>
{
  protected abstract model: any;

  async findMany(options?: {
    where?: TWhere;
    include?: any;
    select?: any;
    orderBy?: any;
    take?: number;
    skip?: number;
  }): Promise<T[]> {
    try {
      return await this.model.findMany(options || {});
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async findUnique(
    where: any,
    options?: { include?: any; select?: any }
  ): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where,
        ...options,
      });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async findFirst(
    where: TWhere,
    options?: { include?: any; select?: any }
  ): Promise<T | null> {
    try {
      return await this.model.findFirst({
        where,
        ...options,
      });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async create(data: TCreate): Promise<T> {
    try {
      return await this.model.create({ data });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async update(where: any, data: TUpdate): Promise<T> {
    try {
      return await this.model.update({
        where,
        data,
      });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async delete(where: any): Promise<T> {
    try {
      return await this.model.delete({ where });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async count(where?: TWhere): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }

  async paginate(options: {
    page: number;
    pageSize: number;
    where?: TWhere;
    include?: any;
    select?: any;
    orderBy?: any;
  }): Promise<PaginationResult<T>> {
    try {
      return await createPaginatedQuery(this.model, options);
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  }
}

