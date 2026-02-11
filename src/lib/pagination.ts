import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PaginatedResponse,
  PaginationParams,
  PrismaOrderBy,
} from '@/types/pagination';
import { NextRequest } from 'next/server';

/**
 * Extracts pagination parameters from URL search params
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString(), 10)
    )
  );

  // Parse sort model from ag-grid
  const sortModelParam = searchParams.get('sortModel');
  let sortModel;

  if (sortModelParam) {
    try {
      sortModel = JSON.parse(sortModelParam);
    } catch {
      sortModel = [];
    }
  }

  // Parse filter model from ag-grid
  const filterModelParam = searchParams.get('filterModel');
  let filterModel;

  if (filterModelParam) {
    try {
      filterModel = JSON.parse(filterModelParam);
    } catch {
      filterModel = {};
    }
  }

  return {
    page,
    pageSize,
    sortModel,
    filterModel,
  };
}

/**
 * Converts ag-grid sort model to Prisma orderBy format
 */
export function convertSortModelToPrisma(
  sortModel?: Array<{ colId: string; sort: 'asc' | 'desc' }>
): PrismaOrderBy[] {
  if (!sortModel || sortModel.length === 0) {
    return [];
  }

  return sortModel.map((sort) => ({
    [sort.colId]: sort.sort,
  }));
}

/**
 * Creates a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Calculates skip value for Prisma queries
 */
export function getSkipValue(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export type AgGridFilterModel = {
  type?: string;
  filterType?: string;
  filter?: string;
  filterTo?: string;
  operator?: string;
  condition1?: AgGridFilterModel;
  condition2?: AgGridFilterModel;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Converts ag-grid filter model to Prisma where conditions
 */
export function convertFilterModelToPrisma(
  filterModel?: Record<string, AgGridFilterModel>
): Record<string, unknown> {
  if (!filterModel || Object.keys(filterModel).length === 0) {
    return {};
  }

  const where: Record<string, unknown> = {};

  Object.entries(filterModel).forEach(([field, filter]) => {
    if (!filter) return;

    if (filter.filterType === 'date') {
      if (filter.dateFrom && filter.dateTo) {
        where[field] = {
          gte: new Date(filter.dateFrom),
          lte: new Date(filter.dateTo),
        };
      } else if (filter.dateFrom) {
        where[field] = {
          gte: new Date(filter.dateFrom),
        };
      } else if (filter.dateTo) {
        where[field] = {
          lte: new Date(filter.dateTo),
        };
      }
      return;
    }

    const filterType = filter.type || filter.filterType;
    switch (filterType) {
      case 'contains':
        where[field] = {
          contains: filter.filter,
          mode: 'insensitive',
        };
        break;

      case 'notContains':
        where[field] = {
          not: {
            contains: filter.filter,
            mode: 'insensitive',
          },
        };
        break;

      case 'equals':
        where[field] = {
          equals: filter.filter,
          mode: 'insensitive',
        };
        break;

      case 'notEqual':
        where[field] = {
          not: filter.filter,
        };
        break;

      case 'startsWith':
        where[field] = {
          startsWith: filter.filter,
          mode: 'insensitive',
        };
        break;

      case 'endsWith':
        where[field] = {
          endsWith: filter.filter,
          mode: 'insensitive',
        };
        break;

      case 'blank':
        where[field] = {
          OR: [{ equals: null }, { equals: '' }],
        };
        break;

      case 'notBlank':
        where[field] = {
          AND: [{ not: null }, { not: '' }],
        };
        break;

      case 'greaterThan':
        where[field] = {
          gt: new Date(filter.filter!),
        };
        break;

      case 'lessThan':
        where[field] = {
          lt: new Date(filter.filter!),
        };
        break;

      case 'greaterThanOrEqual':
        where[field] = {
          gte: new Date(filter.filter!),
        };
        break;

      case 'lessThanOrEqual':
        where[field] = {
          lte: new Date(filter.filter!),
        };
        break;

      case 'inRange':
        where[field] = {
          gte: new Date(filter.filter!),
          lte: new Date(filter.filterTo!),
        };
        break;

      default:
        if (filter.operator && filter.condition1 && filter.condition2) {
          const condition1 = convertSingleFilterToPrisma(
            field,
            filter.condition1
          );
          const condition2 = convertSingleFilterToPrisma(
            field,
            filter.condition2
          );

          if (filter.operator === 'AND') {
            where[field] = {
              AND: [condition1[field], condition2[field]],
            };
          } else if (filter.operator === 'OR') {
            where.OR = [condition1, condition2];
          }
        }
        break;
    }
  });

  return where;
}

/**
 * Helper function to convert a single filter condition to Prisma format
 */
function convertSingleFilterToPrisma(
  field: string,
  condition: {
    type?: string;
    filter?: string;
    filterType?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (condition.filterType === 'date') {
    if (condition.dateFrom && condition.dateTo) {
      result[field] = {
        gte: new Date(condition.dateFrom),
        lte: new Date(condition.dateTo),
      };
    } else if (condition.dateFrom) {
      result[field] = {
        gte: new Date(condition.dateFrom),
      };
    } else if (condition.dateTo) {
      result[field] = {
        lte: new Date(condition.dateTo),
      };
    }
    return result;
  }

  switch (condition.type) {
    case 'contains':
      result[field] = {
        contains: condition.filter,
        mode: 'insensitive',
      };
      break;
    case 'equals':
      result[field] = {
        equals: condition.filter,
        mode: 'insensitive',
      };
      break;
    default:
      result[field] = {
        contains: condition.filter,
        mode: 'insensitive',
      };
  }

  return result;
}
