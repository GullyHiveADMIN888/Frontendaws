export interface LeadAssignment {
    id: number;
    leadId: number;
    providerId: number;
    offerWave: number;
    offerStatus: string;
    offerExpiresAt?: string;
    offeredAt: string;
    respondedAt?: string;
    committedAt?: string;
    unlockedAt?: string;
    dismissedAt?: string;
    pplPrice?: number;
    isFreeLead: boolean;
    hasQuote: boolean;
    lastQuoteId?: number;
    leadStatus?: string;
    createdAt: string;
    updatedAt: string;

    // Provider (User) fields
    providerDisplayName: string;
    providerEmail: string;
    providerPhone: string;

    // Lead fields
    leadType: string;
    leadDescription?: string;
    budgetMin?: number;
    budgetMax?: number;
    timePreference: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    isInstant: boolean;
    leadQualityScore?: number;
    source?: string;
    flowType: string;
    confirmedStatus?: string;

    // Category fields
    categoryId?: number;
    categoryName?: string;

    // Subcategory fields
    subcategoryId?: number;
    subcategoryName?: string;

    // City fields
    cityId?: number;
    cityName?: string;

    // Area fields
    areaId?: number;
    areaName?: string;
    pincode?: string;

    // Customer fields
    customerUserId?: number;
    customerDisplayName?: string;
    customerEmail?: string;
    customerPhone?: string;
}

export interface LeadAssignmentFilter {
    pageNumber: number;
    pageSize: number;
    searchTerm?: string;
    providerId?: number;
    cityId?: number;
    areaId?: number;
    categoryId?: number;
    subcategoryId?: number;
    offerStatus?: string;
    leadType?: string;
    leadStatus?: string;
    flowType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
}

export interface Provider {
    id: number;
    displayName: string;
    email: string;
    phone: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Subcategory {
    id: number;
    name: string;
    categoryId: number;
}

export interface City {
    id: number;
    name: string;
}

export interface Area {
    id: number;
    areaName: string;
    pincode: string;
    cityId: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}