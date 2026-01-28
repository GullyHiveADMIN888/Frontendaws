import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/paged-result.model';
import { AuditLog } from '../models/audit-log.model';
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
}