import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, catchError, of } from 'rxjs';
import { PagedResult } from '../models/paged-result.model';
import { AuditLog, User } from '../models/audit-log.model';
import { environment } from '../../../../environments/environment.prod';

export interface AuditLogQuery {
  entityType?: string;
  action?: string;
  actorUserId?: number;
  startDate?: string;
  endDate?: string;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiBaseUrl}/admin/audit`;
  private userApiUrl = `${environment.apiBaseUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAuditLogs(query: AuditLogQuery): Observable<PagedResult<AuditLog>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.entityType) {
      params = params.set('entityType', query.entityType);
    }
    if (query.action) {
      params = params.set('action', query.action);
    }
    if (query.actorUserId) {
      params = params.set('actorUserId', query.actorUserId.toString());
    }
    if (query.startDate) {
      params = params.set('startDate', query.startDate);
    }
    if (query.endDate) {
      params = params.set('endDate', query.endDate);
    }

    return this.http.get<PagedResult<AuditLog>>(this.apiUrl, { params });
  }

  searchUsers(searchTerm?: string, limit: number = 20): Observable<User[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    // FIX: Use the correct userApiUrl and add error handling
    return this.http.get<{success: boolean, data: User[]}>(`${this.userApiUrl}/search`, { params })
      .pipe(
        map(response => {
          console.log('User search response:', response); // Debug log
          return response.data || [];
        }),
        catchError((error: any) => {
          console.error('Error in user search:', error);
          return of([]); // Return empty array on error
        })
      );
  }
}