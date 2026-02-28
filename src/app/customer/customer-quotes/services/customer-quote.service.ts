import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import {
  CustomerQuoteDto,
  CustomerQuoteDetailDto,
  CustomerQuoteFilterDto,
  CustomerPagedResult,
  CustomerQuoteSummaryDto
} from '../models/customer-quote.models';

@Injectable({
  providedIn: 'root'  // This makes it available application-wide
})
export class CustomerQuoteService {
  private baseUrl = `${environment.apiBaseUrl}/customer/quotes`;

  constructor(private http: HttpClient) {}

  getUserQuotes(filter: CustomerQuoteFilterDto): Observable<CustomerPagedResult<CustomerQuoteDto>> {
    let params = new HttpParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<CustomerPagedResult<CustomerQuoteDto>>(this.baseUrl, { params });
  }

  getQuoteById(id: number): Observable<CustomerQuoteDto> {
    return this.http.get<CustomerQuoteDto>(`${this.baseUrl}/${id}`);
  }

  getQuoteDetails(id: number): Observable<CustomerQuoteDetailDto> {
    return this.http.get<CustomerQuoteDetailDto>(`${this.baseUrl}/${id}/details`);
  }

  getQuotesByLeadId(leadId: number, filter: CustomerQuoteFilterDto): Observable<CustomerPagedResult<CustomerQuoteDto>> {
    let params = new HttpParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<CustomerPagedResult<CustomerQuoteDto>>(`${this.baseUrl}/lead/${leadId}`, { params });
  }

  getQuotesSummary(): Observable<CustomerQuoteSummaryDto> {
    return this.http.get<CustomerQuoteSummaryDto>(`${this.baseUrl}/stats/summary`);
  }

  acceptQuote(quoteId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${quoteId}/accept`, {});
  }

  rejectQuote(quoteId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${quoteId}/reject`, {});
  }
}