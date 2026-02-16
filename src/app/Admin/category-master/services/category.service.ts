// src/app/admin/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CategoryFilter } from '../models/category.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/admin/service-categories`;

  constructor(private http: HttpClient) {}

  searchCategories(searchTerm?: string, limit: number = 20): Observable<Category[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<{success: boolean, data: Category[]}>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error searching categories:', error);
          return of([]);
        })
      );
  }

  getActiveCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/active`);
  }

  getAllCategories(filter: CategoryFilter): Observable<PagedResult<Category>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }
    if (filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }

    return this.http.get<PagedResult<Category>>(this.apiUrl, { params });
  }
}