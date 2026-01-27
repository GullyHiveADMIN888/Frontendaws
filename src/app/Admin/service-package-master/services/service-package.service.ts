import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicePackage, ServicePackageCreateDto, ServicePackageUpdateDto } from '../models/service-package.model';
import { environment } from '../../../../environments/environment.prod';

// Add new interfaces for dropdown data
export interface City {
  id: number;
  name: string;
  state: number;
  country: string;
  tier: number;
  centerLat: number;
  centerLong: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  isLeaf: boolean;
  isActive: boolean;
  displayOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicePackageService {
  private apiUrl = `${environment.apiBaseUrl}/admin/service-packages`;
  private citiesUrl = `${environment.apiBaseUrl}/admin/cities`;
  private categoriesUrl = `${environment.apiBaseUrl}/admin/service-category-master`;

  constructor(private http: HttpClient) {}

  // Existing methods remain unchanged
  getAllServicePackages(): Observable<ServicePackage[]> {
    return this.http.get<ServicePackage[]>(this.apiUrl);
  }

  getServicePackageById(id: number): Observable<ServicePackage> {
    return this.http.get<ServicePackage>(`${this.apiUrl}/${id}`);
  }

  createServicePackage(createDto: ServicePackageCreateDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, createDto);
  }

  updateServicePackage(id: number, updateDto: ServicePackageUpdateDto): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/${id}`, updateDto);
  }

  deleteServicePackage(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  // NEW: Get cities for dropdown
  getCities(): Observable<City[]> {
    return this.http.get<City[]>(this.citiesUrl);
  }

  // NEW: Get service categories for dropdown
  getServiceCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(this.categoriesUrl);
  }
}