export interface Lead {
    id: number;
    customerUserId?: number;
    leadType: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    timePreference?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    isInstant: boolean;
    leadQualityScore?: number;
    source: string;
    flowType: string;
    confirmedStatus: string;
    categoryId?: number;
    categoryName?: string;
    subcategoryId?: number;
    subcategoryName?: string;
    cityId?: number;
    cityName?: string;
    areaId?: number;
    areaName?: string;
    pincode?: string;
    customerDisplayName?: string;
    customerEmail?: string;
    customerPhone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeadFilter {
    pageNumber: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    categoryId?: number;
    subcategoryId?: number;
    cityId?: number;
    areaId?: number;
    leadType?: string;
    flowType?: string;
    confirmedStatus?: string;
    customerUserId?: number;
    startDate?: string;
    endDate?: string;
}

export interface CreateLeadDto {
    customerUserId?: number;
    leadType: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    timePreference?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    isInstant: boolean;
    source: string;
    flowType: string;
    categoryId?: number;
    subcategoryId?: number;
    cityId?: number;
    areaId?: number;
    pincode?: string;
    confirmedStatus: string | null;
}

export interface UpdateLeadDto {
    customerUserId?: number;
    leadType: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    timePreference?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    isInstant: boolean;
    source: string;
    flowType: string;
    confirmedStatus: string | null;
    categoryId?: number;
    subcategoryId?: number;
    cityId?: number;
    areaId?: number;
    pincode?: string;
}

export interface Category {
    id: number;
    name: string;
    isActive: boolean;
}

export interface Subcategory {
    id: number;
    name: string;
    categoryId: number;
    isActive: boolean;
}

export interface City {
    id: number;
    name: string;
    state: string;
}

export interface Area {
    id: number;
    areaName: string;
    cityId: number;
    pincode?: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface ManualAssignment {
    leadId: number;
    providerId: number;
    offerWave: number;
    pplPrice?: number;
    isFreeLead: boolean;
    offerExpiresAt?: string;
    notes?: string;
}

export interface Provider {
    id: number;
    displayName: string;
    email: string;
    phone: string;
    businessName?: string;
    providerType?: string;
    avgRating?: number;
    totalJobsCompleted?: number;
    providerTier?: string;
}