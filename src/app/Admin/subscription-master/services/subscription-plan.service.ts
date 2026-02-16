// src/app/features/admin/subscription-plan/services/subscription-plan.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { SubscriptionPlan, SubscriptionPlanCreateDto, SubscriptionPlanUpdateDto, SubscriptionPlanFilter } from '../models/subscription-plan.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private apiUrl = `${environment.apiBaseUrl}/admin/subscription-plans`;

  constructor(private http: HttpClient) { }

  getSubscriptionPlans(filter: SubscriptionPlanFilter): Observable<PagedResult<SubscriptionPlan>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }
    if (filter.subject) {
      params = params.set('subject', filter.subject);
    }
    if (filter.tier) {
      params = params.set('tier', filter.tier);
    }
    if (filter.cityId) {
      params = params.set('cityId', filter.cityId.toString());
    }
    if (filter.categoryId) {
      params = params.set('categoryId', filter.categoryId.toString());
    }
    if (filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }
    if (filter.minPrice) {
      params = params.set('minPrice', filter.minPrice.toString());
    }
    if (filter.maxPrice) {
      params = params.set('maxPrice', filter.maxPrice.toString());
    }
    if (filter.minDuration) {
      params = params.set('minDuration', filter.minDuration.toString());
    }
    if (filter.maxDuration) {
      params = params.set('maxDuration', filter.maxDuration.toString());
    }
    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter.sortOrder) {
      params = params.set('sortOrder', filter.sortOrder);
    }

    return this.http.get<PagedResult<SubscriptionPlan>>(this.apiUrl, { params });
  }

  getSubscriptionPlan(id: number): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.apiUrl}/${id}`);
  }

  createSubscriptionPlan(plan: SubscriptionPlanCreateDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, plan);
  }

  updateSubscriptionPlan(id: number, plan: SubscriptionPlanUpdateDto): Observable<{ success: boolean, id: number }> {
    return this.http.put<{ success: boolean, id: number }>(`${this.apiUrl}/${id}`, plan);
  }

  deleteSubscriptionPlan(id: number): Observable<{ success: boolean, id: number }> {
    return this.http.delete<{ success: boolean, id: number }>(`${this.apiUrl}/${id}`);
  }

  togglePlanStatus(id: number): Observable<{ success: boolean, id: number }> {
    return this.http.patch<{ success: boolean, id: number }>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

}