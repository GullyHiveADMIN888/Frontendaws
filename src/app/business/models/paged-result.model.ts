// paged-result.model.ts
export interface PagedResult<T> {
  items: T[];          // The array of data (e.g., Branch[])
  totalCount: number;  // Total number of items in the database
  pageNumber: number;  // Current page number
  pageSize: number;    // Number of items per page
}