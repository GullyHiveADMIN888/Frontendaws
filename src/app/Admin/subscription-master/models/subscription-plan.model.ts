// src/app/features/admin/subscription-plan/models/subscription-plan.model.ts
export interface SubscriptionPlan {
  id: number;
  subject: string;
  tier: string;
  code: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationDays: number;
  cityId: number | null;
  cityName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  entitlements: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanCreateDto {
  subject: string;
  tier: string;
  code: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationDays: number;
  cityId: number | null;
  categoryId: number | null;
  entitlements: any;
  isActive: boolean;
}

export interface SubscriptionPlanUpdateDto {
  subject: string;
  tier: string;
  code: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationDays: number;
  cityId: number | null;
  categoryId: number | null;
  entitlements: any;
  isActive: boolean;
}

export interface SubscriptionPlanFilter {
  searchTerm?: string;
  subject?: string;
  tier?: string;
  cityId?: number;
  categoryId?: number;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: string;
  sortOrder?: string;
  pageNumber: number;
  pageSize: number;
}

// Enums for dropdowns
export const SUBJECT_OPTIONS = [
  { value: 'provider', label: 'Provider' },
  { value: 'business', label: 'Business' }
];

export const TIER_OPTIONS = [
  { value: 'pro', label: 'Pro' },
  { value: 'elite', label: 'Elite' }
];

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' }
];