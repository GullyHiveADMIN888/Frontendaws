export enum CityTierEnum {
  X = 0,
  Y = 1,
  Z = 2
}

export interface LeadPricingConfigDto {
  id: number;
  cityTier: CityTierEnum;
  categoryId: number;
  basePrice: number | null;
  platformMultiplier: number;
  providerTierMultiplier: string | null;
  isActive: boolean;
  subcatId: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  subcategoryName?: string;
  updating?: boolean;
  deleting?: boolean;
}

export interface LeadPricingConfigCreateDto {
  cityTier: CityTierEnum;
  categoryId: number;
  basePrice: number | null;
  platformMultiplier: number;
  providerTierMultiplier: string | null;
  isActive: boolean;
  subcatId: number | null;
}

export interface LeadPricingConfigUpdateDto {
  cityTier: CityTierEnum;
  categoryId: number;
  basePrice: number | null;
  platformMultiplier: number;
  providerTierMultiplier: string | null;
  isActive: boolean;
  subcatId: number | null;
}

export interface ServiceCategory {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  isLeaf: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface ServiceSubCategory {
  id: number;
  categoryId: number;
  name: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}