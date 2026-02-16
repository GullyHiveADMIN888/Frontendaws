// models/wallet-transaction.model.ts
export interface WalletTransaction {
  id: number;
  walletId: number;
  txnType: string;
  direction: string; // 'credit' or 'debit'
  amount: number;
  currency: string;
  referenceType?: string;
  referenceId?: number;
  description?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
  
  // Wallet fields
  walletBalance: number;
  walletType: string;
  walletAmountType: string;
  
  // User fields
  userId: number;
  userEmail?: string;
  userDisplayName?: string;
}

export interface WalletTransactionFilter {
  searchTerm?: string;
  userId?: number;
  email?: string;
  walletType?: string;
  walletAmountType?: string;
  txnType?: string; 
  direction?: string; 
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}