import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
//  import { environment } from '../../environments/environment';
 import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiBaseUrl}/home`;
  private adminApiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAdminDashboard() {
    return this.http.get(`${this.apiUrl}/admin`);
  }

  // Service Category Master APIs
  getServiceCategories(): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/service-category-master`);
  }

  getServiceCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/service-category-master/${id}`);
  }

  createServiceCategory(data: any): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/service-category-master`, data);
  }
   updateServiceCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/service-category-master/${id}`, data);
  }

  deleteServiceCategory(id: number): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/service-category-master/${id}`);
  }

  toggleCategoryStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.adminApiUrl}/service-category-master/${id}/status`, { isActive });
  }
}
