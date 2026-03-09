export interface CustomerQuoteDto {
  id: number;
  leadId: number;
  providerId: number;
  assignmentId?: number;
  status: string;
  priceMin?: number;
  priceMax?: number;
  visitFeeIncluded: boolean;
  notes?: string;
  lineItems?: any[];
  validUntil?: Date;
  submittedAt: Date;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  provider?: CustomerQuoteProviderDto;
  lead?: CustomerQuoteLeadDto;
}

export interface CustomerQuoteProviderDto {
  id: number;
  userId: number;
  providerType: string;
  status: string;
  legalName?: string;
  description?: string;
  avgRating: number;
  ratingCount: number;
  totalJobsCompleted: number;
  profilePictureUrl?: string;
  providerTier: string;
  isVerified: boolean;
  isActive: boolean;
  user?: CustomerQuoteUserDto;
}

export interface CustomerQuoteUserDto {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerQuoteLeadDto {
  id: number;
  leadType: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  timePreference: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  leadStatus: string;
  createdAt: Date;
  categoryId: number;
  categoryName?: string;
  subcategoryId?: number;
  subcategoryName?: string;
  cityId: number;
  cityName?: string;
  areaId?: number;
  areaName?: string;
  pincode?: string;
}

export interface CustomerQuoteDetailDto {
  quote: CustomerQuoteDto;
  assignmentSummary?: CustomerLeadAssignmentSummaryDto;
  history?: CustomerQuoteHistoryDto[];
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
  firstOfferDate?: Date;
  lastOfferDate?: Date;
  firstResponseDate?: Date;
  lastResponseDate?: Date;
}

export interface CustomerQuoteHistoryDto {
  id: number;
  quoteId: number;
  status: string;
  notes?: string;
  createdAt: Date;
  changedBy?: string;
}

export interface CustomerQuoteFilterDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: string;
  leadId?: number;
  fromDate?: Date | null;
  toDate?: Date | null;
  sortBy?: string;
  sortOrder?: string;
}

export interface CustomerPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CustomerQuoteSummaryDto {
  totalquotes: number;
  totalleadswithquotes: number;
  totaluniqueproviders: number;
  submittedcount: number;
  acceptedcount: number;
  rejectedcount: number;
  expiredcount: number;
  withdrawncount: number;
  minprice: number;
  maxprice: number;
  avgminprice: number;
  avgmaxprice: number;
  lastquotedate?: string | Date;  // API returns as string, can convert to Date
  quoteslast7days: number;
  quoteslast30days: number;
}