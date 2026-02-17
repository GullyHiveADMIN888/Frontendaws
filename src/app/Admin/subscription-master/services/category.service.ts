// src/app/features/admin/subscription-plan/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { ServiceCategory } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;

  constructor(private http: HttpClient) {}

  searchCategories(searchTerm?: string, limit: number = 20): Observable<ServiceCategory[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<{success: boolean, data: ServiceCategory[]}>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error searching categories:', error);
          return of([]);
        })
      );
  }

  getActiveCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/active`);
  }
}