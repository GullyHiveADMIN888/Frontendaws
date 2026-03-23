export interface CustomerLeadDto {
  id: number;
  customerUserId: number;
  leadType: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  timePreference: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  isInstant: boolean;
  leadQualityScore?: number;
  source: string;
  flowType: string;
  confirmedStatus?: string;
  createdAt: string;
  updatedAt: string;
  
  // Category fields
  categoryId: number;
  categoryName: string;
  
  // Subcategory fields
  subcategoryId?: number;
  subcategoryName?: string;
  
  // City fields
  cityId: number;
  cityName: string;
  
  // Area fields
  areaId?: number;
  areaName?: string;
  pincode?: string;
  
  // Assignment summary
  totalOffers: number;
  offeredCount: number;
  seenCount: number;
  dismissedCount: number;
  expiredCount: number;
  unlockedCount: number;
  committedCount: number;
  notSelectedCount: number;
}

export interface CustomerCreateLeadDto {
  leadType: string; // always 'b2c' for customer
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  timePreference: string; // 'today', 'this_week', 'this_month', 'flexible', 'scheduled'
  scheduledStart?: string;
  scheduledEnd?: string;
  // isInstant: boolean; // REMOVED in new schema
  source: string; // 'link', 'qr', 'code', 'manual'
  categoryId: number;
  subcategoryId?: number;
  cityId: number;
  areaId?: number;
  flowType: string; // 'standard' or 'confirmed'
}

export interface CustomerUpdateLeadDto {
  leadType: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  timePreference: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  isInstant: boolean;
  source?: string;
  categoryId: number;
  subcategoryId?: number;
  cityId: number;
  areaId?: number;
  flowType: string;
}

export interface CustomerLeadFilterDto {
  searchTerm?: string;
  categoryId?: number;
  subcategoryId?: number;
  cityId?: number;
  areaId?: number;
  leadType?: string;
  flowType?: string;
  confirmedStatus?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CustomerPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerLeadAssignmentSummaryDto {
  leadId: number;
  totalOffers: number;
  offeredCount: number;
  seenCount: number;
  dismissedCount: number;
  expiredCount: number;
  unlockedCount: number;
  committedCount: number;
  notSelectedCount: number;
  firstOfferDate?: string;
  lastOfferDate?: string;
  firstResponseDate?: string;
  lastResponseDate?: string;
  hasCommittedProvider: boolean;
  hasUnlockedProvider: boolean;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface SubcategoryDto {
  id: number;
  name: string;
  categoryId: number;
  description?: string;
}

export interface CityDto {
  id: number;
  name: string;
  state: number;
  stateName: string;
  country: string;
  tier: number;
  centerLat: number;
  centerLong: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AreaDto {
  id: number;
  areaName: string;
  cityId: number;
  pincode?: string;
}