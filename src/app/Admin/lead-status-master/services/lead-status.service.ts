import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { LeadStatus, LeadStatusCreateDto, LeadStatusUpdateDto } from '../models/lead-status.model';

@Injectable({
  providedIn: 'root'
})
export class LeadStatusService {
  private apiUrl = `${environment.apiBaseUrl}/admin/lead-status-master`;

  constructor(private http: HttpClient) {}

  getAllLeadStatuses(): Observable<LeadStatus[]> {
    return this.http.get<LeadStatus[]>(this.apiUrl);
  }

  getLeadStatusById(id: number): Observable<LeadStatus> {
    return this.http.get<LeadStatus>(`${this.apiUrl}/${id}`);
  }

  createLeadStatus(leadStatus: LeadStatusCreateDto): Observable<LeadStatus> {
    return this.http.post<LeadStatus>(this.apiUrl, leadStatus);
  }

  updateLeadStatus(id: number, leadStatus: LeadStatusUpdateDto): Observable<LeadStatus> {
    return this.http.put<LeadStatus>(`${this.apiUrl}/${id}`, leadStatus);
  }

  deleteLeadStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}