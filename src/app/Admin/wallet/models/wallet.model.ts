
export interface WalletDto {
    id: number;
    userId: number;
    walletType: string;
    balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    walletAmountType: string;
    userDisplayName?: string;
    userEmail?: string;
    userPhone?: string;
}

export interface WalletDetailDto {
    id: number;
    balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    walletAmountType: string;
}

export interface UserWalletDto {
    userId: number;
    userDisplayName: string;
    userEmail: string;
    userPhone: string;
    cashableWallet: WalletDetailDto | null;
    nonCashableWallet: WalletDetailDto | null;
    totalBalance: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface WalletFilter {
    searchTerm?: string;
    userId?: number;
    walletType?: string;
    walletAmountType?: string;
    startDate?: string;
    endDate?: string;
    pageNumber: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: string;
}

export interface CreateWalletDto {
    userId: number;
    walletType: string;
    balance: number;
    currency: string;
    walletAmountType: string;
}

export interface UpdateWalletDto {
    balance: number;
    currency: string;
    walletAmountType: string;
}

export interface BulkUpdateWalletDto {
    userId: number;
    walletType: string;
    cashableBalance?: number;
    nonCashableBalance?: number;
    currency: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}