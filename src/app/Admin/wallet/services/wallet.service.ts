
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import {
    PagedResult,
    UserWalletDto,
    WalletDto,
    WalletFilter,
    CreateWalletDto,
    UpdateWalletDto,
    BulkUpdateWalletDto,
    User
} from '../models/wallet.model';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    private apiUrl = `${environment.apiBaseUrl}/admin/wallets`;
    private usersApiUrl = `${environment.apiBaseUrl}/admin/users`;

    constructor(private http: HttpClient) { }

    // Wallet CRUD Operations
    getWallets(query: WalletFilter): Observable<PagedResult<UserWalletDto>> {
        let params = new HttpParams()
            .set('pageNumber', query.pageNumber.toString())
            .set('pageSize', query.pageSize.toString());

        if (query.searchTerm) {
            params = params.set('searchTerm', query.searchTerm);
        }
        if (query.userId) {
            params = params.set('userId', query.userId.toString());
        }
        if (query.walletType) {
            params = params.set('walletType', query.walletType);
        }
        if (query.walletAmountType) {
            params = params.set('walletAmountType', query.walletAmountType);
        }
        if (query.startDate) {
            params = params.set('startDate', query.startDate);
        }
        if (query.endDate) {
            params = params.set('endDate', query.endDate);
        }
        if (query.sortBy) {
            params = params.set('sortBy', query.sortBy);
        }
        if (query.sortOrder) {
            params = params.set('sortOrder', query.sortOrder);
        }

        return this.http.get<PagedResult<UserWalletDto>>(this.apiUrl, { params });
    }

    getWalletById(id: number): Observable<WalletDto> {
        return this.http.get<WalletDto>(`${this.apiUrl}/${id}`);
    }

    getWalletsByUserId(userId: number): Observable<UserWalletDto> {
        return this.http.get<UserWalletDto>(`${this.apiUrl}/user/${userId}`);
    }

    createWallet(dto: CreateWalletDto): Observable<WalletDto> {
        return this.http.post<WalletDto>(this.apiUrl, dto);
    }

    updateWallet(id: number, dto: UpdateWalletDto): Observable<WalletDto> {
        return this.http.put<WalletDto>(`${this.apiUrl}/${id}`, dto);
    }

    bulkUpdateWallets(dto: BulkUpdateWalletDto): Observable<UserWalletDto> {
        return this.http.put<UserWalletDto>(`${this.apiUrl}/user/${dto.userId}/bulk`, dto);
    }

    deleteWallet(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
    }

    deleteWalletByUserAndType(userId: number, walletType: string, walletAmountType: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(
            `${this.apiUrl}/user/${userId}/type/${walletType}/${walletAmountType}`
        );
    }

    deleteAllUserWallets(userId: number, walletType: string = 'provider'): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(
            `${this.apiUrl}/user/${userId}/all?walletType=${walletType}`
        );
    }

    // User Search
    searchUsers(searchTerm?: string, limit: number = 20): Observable<User[]> {
        let params = new HttpParams()
            .set('limit', limit.toString());

        if (searchTerm && searchTerm.trim()) {
            params = params.set('search', searchTerm.trim());
        }

        return this.http.get<{ success: boolean; data: User[] }>(`${this.usersApiUrl}/search`, { params })
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    // Enums/Lookup Methods
    getWalletTypes(): Observable<string[]> {
        return of(['provider', 'customer', 'partner']);
    }

    getWalletAmountTypes(): Observable<string[]> {
        return of(['cashable', 'non_cashable']);
    }

    getCurrencies(): Observable<string[]> {
        return of(['INR', 'USD', 'EUR']);
    }

    // Helper methods for styling
    getWalletAmountTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'cashable': 'bg-green-100 text-green-800',
            'non_cashable': 'bg-orange-100 text-orange-800'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    formatCurrency(amount: number, currency: string = 'INR'): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}