// Lead Pricing Engine Models
export interface LeadPricingEngine {
  id: number;
  name: string;
  startDate: string;
  endDate: string | null;
  leadPriceConfigId: number;
  leadPriceConfigName?: string; // For display
  isHike: boolean;
  percentageChange: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPricingEngineCreateDto {
  name: string;
  startDate: string;
  endDate: string | null;
  leadPriceConfigId: number;
  isHike: boolean;
  percentageChange: number;
}

export interface LeadPricingEngineUpdateDto {
  name: string;
  startDate: string;
  endDate: string | null;
  leadPriceConfigId: number;
  isHike: boolean;
  percentageChange: number;
}

export interface LeadPricingEngineFilterDto {
  searchTerm?: string;
  leadPriceConfigId?: number;
  isHike?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

// Dropdown Option for Lead Pricing Config
export interface LeadPricingConfigDropdownDto {
  id: number;
  displayName: string;
  cityTier: string;
  categoryName?: string;
  subcatName?: string;
  basePrice: number;
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// export interface DropdownOption {
//   id: number;
//   displayName: string;
// }
export interface DropdownOption {
  id: number;
  displayName: string;
  cityTier: number | string;
  categoryId: number;
  categoryName?: string;
  subcatId?: number;
  subcatName?: string;
  basePrice?: number | null;
  normalBasePrice?: number | null;
  isActive: boolean;
  priceComparison?: {
    hasDifference: boolean;
    differenceType: 'higher' | 'lower' | 'equal';
    differencePercentage: number;
    currentPrice: number | null;
    normalPrice: number | null;
  };
}