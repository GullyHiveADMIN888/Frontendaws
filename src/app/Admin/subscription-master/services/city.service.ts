// src/app/features/admin/subscription-plan/services/city.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { City } from '../models/city.model';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = `${environment.apiBaseUrl}/admin/cities`;

  constructor(private http: HttpClient) {}

  searchCities(searchTerm?: string, limit: number = 20): Observable<City[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<{success: boolean, data: City[]}>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error searching cities:', error);
          return of([]);
        })
      );
  }

  getActiveCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/active`);
  }
}