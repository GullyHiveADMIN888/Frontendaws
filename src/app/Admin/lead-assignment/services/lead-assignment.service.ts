// services/lead-assignment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import {
    PagedResult,
    LeadAssignment,
    LeadAssignmentFilter,
    Provider,
    Category,
    Subcategory,
    City,
    Area
} from '../models/lead-assignment.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class LeadAssignmentService {
    private apiUrl = `${environment.apiBaseUrl}/admin/lead-assignments`;
    private providersApiUrl = `${environment.apiBaseUrl}/admin/providers`;
    private categoriesApiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;
    private citiesApiUrl = `${environment.apiBaseUrl}/admin/cities`;
    private areasApiUrl = `${environment.apiBaseUrl}/admin/area-master`;
    private subcategoriesApiUrl = `${environment.apiBaseUrl}/admin/sub-category-master`;

    constructor(private http: HttpClient) { }

    getLeadAssignments(query: LeadAssignmentFilter): Observable<PagedResult<LeadAssignment>> {
        let params = new HttpParams()
            .set('pageNumber', query.pageNumber.toString())
            .set('pageSize', query.pageSize.toString());

        if (query.searchTerm) {
            params = params.set('searchTerm', query.searchTerm);
        }
        if (query.providerId) {
            params = params.set('providerId', query.providerId.toString());
        }
        if (query.cityId) {
            params = params.set('cityId', query.cityId.toString());
        }
        if (query.areaId) {
            params = params.set('areaId', query.areaId.toString());
        }
        if (query.categoryId) {
            params = params.set('categoryId', query.categoryId.toString());
        }
        if (query.subcategoryId) {
            params = params.set('subcategoryId', query.subcategoryId.toString());
        }
        if (query.offerStatus) {
            params = params.set('offerStatus', query.offerStatus);
        }
        if (query.leadType) {
            params = params.set('leadType', query.leadType);
        }
        if (query.leadStatus) {
            params = params.set('leadStatus', query.leadStatus);
        }
        if (query.flowType) {
            params = params.set('flowType', query.flowType);
        }
        if (query.startDate) {
            params = params.set('startDate', query.startDate);
        }
        if (query.endDate) {
            params = params.set('endDate', query.endDate);
        }
        if (query.sortBy) {
            params = params.set('sortBy', query.sortBy);
        }
        if (query.sortOrder) {
            params = params.set('sortOrder', query.sortOrder);
        }

        return this.http.get<PagedResult<LeadAssignment>>(this.apiUrl, { params });
    }

    getProviderById(id: number): Observable<Provider> {
        return this.http.get<Provider>(`${this.providersApiUrl}/${id}`);
    }

    searchProviders(searchTerm?: string, limit: number = 20): Observable<Provider[]> {
        let params = new HttpParams().set('limit', limit.toString());

        if (searchTerm && searchTerm.trim()) {
            params = params.set('search', searchTerm.trim());
        }

        return this.http.get<{ success: boolean, data: Provider[] }>(`${this.providersApiUrl}/search`, { params })
            .pipe(
                map(response => response.data || []),
                catchError((error: any) => {
                    console.error('Error in provider search:', error);
                    return of([]);
                })
            );
    }

    // Search categories
    searchCategories(searchTerm?: string, limit: number = 20): Observable<Category[]> {
        let params = new HttpParams().set('limit', limit.toString());

        if (searchTerm && searchTerm.trim()) {
            params = params.set('search', searchTerm.trim());
        }

        return this.http.get<{ success: boolean, data: Category[] }>(`${this.categoriesApiUrl}/search`, { params })
            .pipe(
                map(response => response.data || []),
                catchError((error: any) => {
                    console.error('Error in category search:', error);
                    return of([]);
                })
            );
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<{ success: boolean, data: Category[] }>(this.categoriesApiUrl)
            .pipe(
                map(response => response.data || []),
                catchError((error: any) => {
                    console.error('Error fetching categories:', error);
                    return of([]);
                })
            );
    }

    getSubcategoriesByCategory(categoryId: number): Observable<Subcategory[]> {
    const url = `${this.subcategoriesApiUrl}/by-category/${categoryId}`;
    console.log('Fetching subcategories from URL:', url);
    
    // The API returns a direct array, not an object with success/data wrapper
    return this.http.get<Subcategory[]>(url)
        .pipe(
            map(response => {
                console.log('Subcategories API raw response:', response);
                return response || []; // Return the array directly
            }),
            catchError((error) => {
                console.error('Error loading subcategories:', error);
                return of([]);
            })
        );
}


    getCities(): Observable<City[]> {
        return this.http.get<{ success: boolean, data: City[] }>(this.citiesApiUrl)
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    getAreas(cityId?: number): Observable<Area[]> {
        let params = new HttpParams();
        if (cityId) {
            params = params.set('cityId', cityId.toString());
        }
        return this.http.get<{ success: boolean, data: Area[] }>(`${this.citiesApiUrl}/areas`, { params })
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    getAreasByCity(cityId: number): Observable<Area[]> {
        return this.http.get<{ success: boolean, data: Area[] }>(`${this.areasApiUrl}/by-city/${cityId}`)
            .pipe(
                map(response => response.data || []),
                catchError((error) => {
                    console.error('Error loading areas:', error);
                    return of([]);
                })
            );
    }

    getOfferStatuses(): Observable<string[]> {
        return of(['offered', 'seen', 'dismissed', 'expired', 'unlocked', 'committed', 'not_selected']);
    }

    getLeadTypes(): Observable<string[]> {
        return of(['b2c', 'b2b']);
    }

    getLeadStatuses(): Observable<string[]> {
        return of(['new', 'routed', 'provider_unlocked', 'in_progress', 'cancelled', 'closed', 'stale_expired']);
    }

    getFlowTypes(): Observable<string[]> {
        return of(['standard', 'confirmed']);
    }

    getOfferStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'offered': 'bg-blue-100 text-blue-800',
            'seen': 'bg-green-100 text-green-800',
            'dismissed': 'bg-red-100 text-red-800',
            'expired': 'bg-gray-100 text-gray-800',
            'unlocked': 'bg-yellow-100 text-yellow-800',
            'committed': 'bg-purple-100 text-purple-800',
            'not_selected': 'bg-gray-50 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getLeadTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'b2c': 'bg-green-100 text-green-800',
            'b2b': 'bg-purple-100 text-purple-800'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }
}