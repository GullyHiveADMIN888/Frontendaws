import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import {
  CustomerLeadDto,
  CustomerCreateLeadDto,
  CustomerUpdateLeadDto,
  CustomerLeadFilterDto,
  CustomerPagedResult,
  CustomerLeadAssignmentSummaryDto,
  CategoryDto,
  SubcategoryDto,
  CityDto,
  AreaDto
} from '../models/customer-lead.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerLeadService {
  private baseUrl = `${environment.apiBaseUrl}/customer/leads`;

  constructor(private http: HttpClient) {}

  // Lead management
  getUserLeads(filter: CustomerLeadFilterDto): Observable<CustomerPagedResult<CustomerLeadDto>> {
    let params = new HttpParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<CustomerPagedResult<CustomerLeadDto>>(this.baseUrl, { params });
  }

  getLeadById(id: number): Observable<CustomerLeadDto> {
    return this.http.get<CustomerLeadDto>(`${this.baseUrl}/${id}`);
  }

  createLead(dto: CustomerCreateLeadDto): Observable<CustomerLeadDto> {
    return this.http.post<CustomerLeadDto>(this.baseUrl, dto);
  }

  updateLead(id: number, dto: CustomerUpdateLeadDto): Observable<CustomerLeadDto> {
    return this.http.put<CustomerLeadDto>(`${this.baseUrl}/${id}`, dto);
  }

  deleteLead(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  getLeadAssignmentSummary(id: number): Observable<CustomerLeadAssignmentSummaryDto> {
    return this.http.get<CustomerLeadAssignmentSummaryDto>(`${this.baseUrl}/${id}/summary`);
  }

  // Master data for dropdowns
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${environment.apiBaseUrl}/admin/service-category-master`);
  }

  getSubcategories(categoryId: number): Observable<SubcategoryDto[]> {
    return this.http.get<SubcategoryDto[]>(`${environment.apiBaseUrl}/admin/sub-category-master/by-category/${categoryId}`);
  }

  // getCities(): Observable<CityDto[]> {
  //   return this.http.get<CityDto[]>(`${environment.apiBaseUrl}/admin/cities`);
  // }
  // In customer-lead.service.ts

getCities(searchTerm: string = '', limit: number = 20): Observable<CityDto[]> {
  let params = new HttpParams()
    .set('search', searchTerm)
    .set('limit', limit.toString());
  
  return this.http.get<any>(`${environment.apiBaseUrl}/admin/cities/search`, { params })
    .pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
}

getAreasBySearch(cityId: number, searchTerm: string = '', limit: number = 20): Observable<AreaDto[]> {
  let params = new HttpParams()
    .set('search', searchTerm)
    .set('limit', limit.toString());
  
  return this.http.get<any>(`${environment.apiBaseUrl}/admin/area-master/search/by-city/${cityId}`, { params })
    .pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
}
 

getAreas(cityId: number): Observable<AreaDto[]> {
  return this.http.get<any>(`${environment.apiBaseUrl}/admin/area-master/by-city/${cityId}`)
    .pipe(
      map(response => {
        // Check if response has the expected structure
        if (response && response.success && Array.isArray(response.data)) {
          return response.data; // Return just the array
        }
        // If response is already an array (fallback)
        if (Array.isArray(response)) {
          return response;
        }
        // Log warning and return empty array
        console.warn('Unexpected API response structure for areas:', response);
        return [];
      })
    );
}
}