// File: src/app/Seller/company-invitations/models/CompanyInvitation.model.ts

export interface CompanyInvitation {
  id: number;
  requestStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestSource: string;
  createdAt: string;

  requestedByUserId: number;
  requestedByName: string;
  requestedByEmail: string;
  requestedByPhone: string;

  providerId: number;
  companyName: string;

  categories: string;      
  subCategories: string; 
  showDetails?: boolean; 
}