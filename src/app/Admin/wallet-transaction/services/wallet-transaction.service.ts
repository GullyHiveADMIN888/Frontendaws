import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { PagedResult, WalletTransaction, WalletTransactionFilter, User } from '../models/wallet-transaction.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WalletTransactionService {
  private apiUrl = `${environment.apiBaseUrl}/admin/wallet-transactions`;
  private userApiUrl = `${environment.apiBaseUrl}/admin/users`;

  constructor(private http: HttpClient) { }

  getWalletTransactions(query: WalletTransactionFilter): Observable<PagedResult<WalletTransaction>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }
    if (query.userId) {
      params = params.set('userId', query.userId.toString());
    }
    if (query.email) {
      params = params.set('email', query.email);
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
    if (query.txnType) {
      params = params.set('txnType', query.txnType);
    }
    if (query.direction) {
      params = params.set('direction', query.direction);
    }

    return this.http.get<PagedResult<WalletTransaction>>(this.apiUrl, { params });
  }

  searchUsers(searchTerm?: string, limit: number = 20): Observable<User[]> {
    let params = new HttpParams().set('limit', limit.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<{ success: boolean, data: User[] }>(`${this.userApiUrl}/search`, { params })
      .pipe(
        map(response => response.data || []),
        catchError((error: any) => {
          console.error('Error in user search:', error);
          return of([]);
        })
      );
  }

  getWalletTypes(): Observable<string[]> {
    return of(['customer', 'provider', 'partner']);
  }

  getWalletAmountTypes(): Observable<string[]> {
    return of(['cashable', 'non_cashable']);
  }
}