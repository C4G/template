export interface PaginationParams {
  page: number;
  pageSize: number;
  sortModel?: Array<{
    colId: string;
    sort: 'asc' | 'desc';
  }>;
  filterModel?: {
    [key: string]: {
      type: string;
      filter?: string;
      filterTo?: string;
      operator?: string;
      condition1?: {
        type: string;
        filter: string;
      };
      condition2?: {
        type: string;
        filter: string;
      };
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PrismaOrderBy {
  [key: string]: 'asc' | 'desc';
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
