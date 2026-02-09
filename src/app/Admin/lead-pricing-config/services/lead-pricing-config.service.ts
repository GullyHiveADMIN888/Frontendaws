import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  LeadPricingConfigDto, 
  LeadPricingConfigCreateDto, 
  LeadPricingConfigUpdateDto,
  ServiceCategory,
  ServiceSubCategory,
  PaginatedResponse,
  ApiResponse
} from '../models/lead-pricing-config.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LeadPricingConfigService {
  private apiUrl = `${environment.apiBaseUrl}/admin/lead-pricing-config`;
  private categoriesUrl = `${environment.apiBaseUrl}/admin/service-category-master`;
  private subCategoriesUrl = `${environment.apiBaseUrl}/admin/sub-category-master`;

  constructor(private http: HttpClient) {}

  // Get all pricing configurations with pagination and filters
getConfigsWithPagination(filters: any): Observable<PaginatedResponse<LeadPricingConfigDto>> {
  let params = new HttpParams();
  
  console.log('Building filters:', filters);
  
  // Add filters to params - using IDs now
  if (filters.cityTier) {
    params = params.set('cityTier', filters.cityTier);
    console.log('Added cityTier filter:', filters.cityTier);
  }
  
  if (filters.categoryId) {
    params = params.set('categoryId', filters.categoryId);
    console.log('Added categoryId filter:', filters.categoryId);
  }
  
  if (filters.subcatId) {
    params = params.set('subcatId', filters.subcatId);
    console.log('Added subcatId filter:', filters.subcatId);
  }
  
  if (filters.isActive !== undefined && filters.isActive !== '') {
    params = params.set('isActive', filters.isActive.toString());
    console.log('Added isActive filter:', filters.isActive);
  }
  
  if (filters.pageNumber) {
    params = params.set('pageNumber', filters.pageNumber.toString());
  }
  
  if (filters.pageSize) {
    params = params.set('pageSize', filters.pageSize.toString());
  }
  
  if (filters.sortBy) {
    params = params.set('sortBy', filters.sortBy);
  }
  
  if (filters.sortDescending !== undefined) {
    params = params.set('sortDescending', filters.sortDescending.toString());
  }
  
  if (filters.cityTier !== undefined && filters.cityTier !== null && filters.cityTier !== '') {
    params = params.set('cityTier', filters.cityTier.toString());
    console.log('Added cityTier filter:', filters.cityTier);
  }

  console.log('Final params:', params.toString());

  return this.http.get<any>(this.apiUrl, { params }).pipe(
    map((response: any) => {
      console.log('Raw response from pricing config API:', response);
      
      // Handle response format
      if (response && response.pagination) {
        return {
          success: response.success || true,
          data: response.data || [],
          pagination: response.pagination
        };
      }
      
      // Array response (backward compatibility)
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
          pagination: {
            totalCount: response.length,
            pageNumber: filters.pageNumber || 1,
            pageSize: filters.pageSize || 10,
            totalPages: Math.ceil(response.length / (filters.pageSize || 10))
          }
        };
      }
      
      // Default
      return {
        success: response?.success || true,
        data: response?.data || response || [],
        pagination: {
          totalCount: response?.totalCount || (Array.isArray(response?.data) ? response.data.length : 0),
          pageNumber: filters.pageNumber || 1,
          pageSize: filters.pageSize || 10,
          totalPages: Math.ceil((response?.totalCount || (Array.isArray(response?.data) ? response.data.length : 0)) / (filters.pageSize || 10))
        }
      };
    }),
    catchError(error => {
      console.error('Error in getConfigsWithPagination:', error);
      return of({
        success: false,
        data: [],
        pagination: {
          totalCount: 0,
          pageNumber: filters.pageNumber || 1,
          pageSize: filters.pageSize || 10,
          totalPages: 0
        }
      });
    })
  );
}

  // Get all configurations (without pagination - for backward compatibility)
  getAllConfigs(): Observable<LeadPricingConfigDto[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response as LeadPricingConfigDto[];
        } else if (response && response.data && Array.isArray(response.data)) {
          return response.data as LeadPricingConfigDto[];
        } else if (response && response.success && Array.isArray(response.data)) {
          return response.data as LeadPricingConfigDto[];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error in getAllConfigs:', error);
        return of([]);
      })
    );
  }

  // Get configuration by ID
  getConfigById(id: number): Observable<LeadPricingConfigDto> {
    return this.http.get<ApiResponse<LeadPricingConfigDto>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error in getConfigById:', error);
        throw error;
      })
    );
  }

  // Get configuration by city tier and category
  getConfigByCityTierAndCategory(cityTier: string, categoryId: number): Observable<LeadPricingConfigDto> {
    return this.http.get<ApiResponse<LeadPricingConfigDto>>(`${this.apiUrl}/by-city-tier-category/${cityTier}/${categoryId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error in getConfigByCityTierAndCategory:', error);
        throw error;
      })
    );
  }

  // Create new configuration
  createConfig(createDto: LeadPricingConfigCreateDto): Observable<{ success: boolean; message: string; configId?: number }> {
    return this.http.post<{ success: boolean; message: string; configId?: number }>(this.apiUrl, createDto);
  }

  // Update configuration
  updateConfig(id: number, updateDto: LeadPricingConfigUpdateDto): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, updateDto);
  }

  // Delete configuration
  deleteConfig(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Get service categories for dropdown
  // services/lead-pricing-config.service.ts - Update getServiceCategories method
    getServiceCategories(): Observable<ServiceCategory[]> {
    return this.http.get<any>(this.categoriesUrl).pipe(
        map((response: any) => {
        console.log('Categories response:', response); // Debug log
        
        // Handle different response formats
        if (Array.isArray(response)) {
            return response as ServiceCategory[];
        } else if (response && response.data && Array.isArray(response.data)) {
            return response.data as ServiceCategory[];
        } else if (response && response.success && Array.isArray(response.data)) {
            return response.data as ServiceCategory[];
        } else if (response && Array.isArray(response.categories)) {
            return response.categories as ServiceCategory[];
        }
        return [];
        }),
        catchError(error => {
        console.error('Error in getServiceCategories:', error);
        return of([]);
        })
    );
    }

  // Get subcategories by category ID
  // services/lead-pricing-config.service.ts - Update getSubCategoriesByCategoryId method
getSubCategoriesByCategoryId(categoryId: number): Observable<ServiceSubCategory[]> {
  const url = `${this.subCategoriesUrl}/by-category/${categoryId}`;
  console.log('Making subcategories request to:', url);
  
  return this.http.get<any>(url).pipe(
    map((response: any) => {
      console.log('Subcategories raw response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('Format: Direct array');
        return response as ServiceSubCategory[];
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Format: Response with data array');
        return response.data as ServiceSubCategory[];
      } else if (response && response.success && Array.isArray(response.data)) {
        console.log('Format: Success object with data array');
        return response.data as ServiceSubCategory[];
      } else if (response && Array.isArray(response.subcategories)) {
        console.log('Format: Subcategories array');
        return response.subcategories as ServiceSubCategory[];
      } else if (response && response.subcategories && Array.isArray(response.subcategories)) {
        console.log('Format: Object with subcategories array');
        return response.subcategories as ServiceSubCategory[];
      }
      console.log('Format: No valid data found, returning empty array');
      return [];
    }),
    catchError(error => {
      console.error('Error in getSubCategoriesByCategoryId:', error);
      console.error('Error URL:', url);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      return of([]);
    })
  );
}
}