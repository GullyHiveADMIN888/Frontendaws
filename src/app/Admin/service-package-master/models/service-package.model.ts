export interface ServicePackage {
  id: number;
  cityId: number | null;
  categoryId: number;
  name: string;
  description: string | null;
  basePrice: number;
  platformCharges?: number | null;
  visitingCharges?: number | null;
  totalPrice: number;
  currency: string;
  isActive: boolean;
  parameters: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  updating?: boolean;
  deleting?: boolean;
}

export interface ServicePackageCreateDto {
  cityId: number | null;
  categoryId: number;
  name: string;
  description: string | null;
  basePrice: number;
  platformCharges?: number | null;
  visitingCharges?: number | null;
  currency: string;
  isActive: boolean;
  parameters?: any;
  metadata?: any;
}

export interface ServicePackageUpdateDto {
  cityId: number | null;
  categoryId: number;
  name: string;
  description: string | null;
  basePrice: number;
  platformCharges?: number | null;
  visitingCharges?: number | null;
  currency: string;
  isActive: boolean;
  parameters?: any;
  metadata?: any;
}