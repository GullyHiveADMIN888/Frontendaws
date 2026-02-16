export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}

export interface CategoryFilter {
  searchTerm?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}