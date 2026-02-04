// area-master/services/area-master.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import {
  AreaMaster,
  AreaMasterCreateDto,
  AreaMasterUpdateDto,
  StateDto,
  CityDto
} from '../models/area-master.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AreaMasterService {
  private apiUrl = `${environment.apiBaseUrl}/admin/area-master`;

  constructor(private http: HttpClient) { }

  // Get all areas with pagination
  getAllAreasPaginated(
    page: number = 1,
    pageSize: number = 25,
    stateId?: number,
    cityId?: number,
    search?: string,
    isActive?: boolean
  ): Observable<{ data: AreaMaster[], pagination: PaginationInfo }> {
    return new Observable(observer => {
      let url = `${this.apiUrl}/paginated?page=${page}&pageSize=${pageSize}`;

      if (stateId) url += `&stateId=${stateId}`;
      if (cityId) url += `&cityId=${cityId}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (isActive !== undefined) url += `&isActive=${isActive}`;

      this.http.get<PaginatedApiResponse<AreaMaster[]>>(url).subscribe({
        next: (response) => {
          if (response.success && response.data && response.pagination) {
            observer.next({
              data: response.data,
              pagination: response.pagination
            });
          } else {
            observer.next({
              data: [],
              pagination: {
                page: 1,
                pageSize: pageSize,
                totalCount: 0,
                totalPages: 0
              }
            });
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // Get paginated areas by city ID
  getAreasByCityIdPaginated(
    cityId: number,
    page: number = 1,
    pageSize: number = 25
  ): Observable<{ data: AreaMaster[], pagination: PaginationInfo }> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/by-city/${cityId}/paginated?page=${page}&pageSize=${pageSize}`;

      this.http.get<PaginatedApiResponse<AreaMaster[]>>(url).subscribe({
        next: (response) => {
          if (response.success && response.data && response.pagination) {
            observer.next({
              data: response.data,
              pagination: response.pagination
            });
          } else {
            observer.next({
              data: [],
              pagination: {
                page: 1,
                pageSize: pageSize,
                totalCount: 0,
                totalPages: 0
              }
            });
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // Get paginated areas by state ID
  getAreasByStateIdPaginated(
    stateId: number,
    page: number = 1,
    pageSize: number = 25
  ): Observable<{ data: AreaMaster[], pagination: PaginationInfo }> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/by-state/${stateId}/paginated?page=${page}&pageSize=${pageSize}`;

      this.http.get<PaginatedApiResponse<AreaMaster[]>>(url).subscribe({
        next: (response) => {
          if (response.success && response.data && response.pagination) {
            observer.next({
              data: response.data,
              pagination: response.pagination
            });
          } else {
            observer.next({
              data: [],
              pagination: {
                page: 1,
                pageSize: pageSize,
                totalCount: 0,
                totalPages: 0
              }
            });
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // Keep original non-paginated methods for backward compatibility
  getAllAreas(): Observable<AreaMaster[]> {
    return new Observable(observer => {
      this.http.get<ApiResponse<AreaMaster[]>>(this.apiUrl).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getAreaById(id: number): Observable<AreaMaster> {
    return new Observable(observer => {
      this.http.get<ApiResponse<AreaMaster>>(`${this.apiUrl}/${id}`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.error(new Error('Area not found'));
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getAreasByCityId(cityId: number): Observable<AreaMaster[]> {
    return new Observable(observer => {
      this.http.get<ApiResponse<AreaMaster[]>>(`${this.apiUrl}/by-city/${cityId}`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getAreasByStateId(stateId: number): Observable<AreaMaster[]> {
    return new Observable(observer => {
      this.http.get<ApiResponse<AreaMaster[]>>(`${this.apiUrl}/by-state/${stateId}`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getAreaByPincode(pincode: string): Observable<AreaMaster> {
    return new Observable(observer => {
      this.http.get<ApiResponse<AreaMaster>>(`${this.apiUrl}/by-pincode/${pincode}`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.error(new Error('Area not found'));
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  createArea(areaData: AreaMasterCreateDto): Observable<number> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}`, areaData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create area');
          }
        }),
        catchError(error => {
          console.error('API Error in createArea:', error);
          // Check if error has a message from backend
          if (error.error && error.error.message) {
            throw new Error(error.error.message);
          } else if (error.message) {
            throw new Error(error.message);
          } else {
            throw new Error('Failed to create area. Please try again.');
          }
        })
      );
  }

  updateArea(id: number, updateDto: AreaMasterUpdateDto): Observable<boolean> {
    return new Observable(observer => {
      this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, updateDto).subscribe({
        next: (response) => {
          if (response.success) {
            observer.next(true);
          } else {
            observer.error(new Error(response.message || 'Failed to update area'));
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  deleteArea(id: number): Observable<boolean> {
    return new Observable(observer => {
      this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).subscribe({
        next: (response) => {
          if (response.success) {
            observer.next(true);
          } else {
            observer.error(new Error(response.message || 'Failed to delete area'));
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getStates(): Observable<StateDto[]> {
    return new Observable(observer => {
      this.http.get<ApiResponse<StateDto[]>>(`${this.apiUrl}/states`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getCitiesByStateId(stateId: number): Observable<CityDto[]> {
    return new Observable(observer => {
      this.http.get<ApiResponse<CityDto[]>>(`${this.apiUrl}/cities/by-state/${stateId}`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}