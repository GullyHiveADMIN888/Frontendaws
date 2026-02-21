// src/app/Admin/lead/services/lead.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import {
    PagedResult,
    Lead,
    LeadFilter,
    CreateLeadDto,
    UpdateLeadDto,
    Category,
    Subcategory,
    City,
    Area,
    Customer,
    ManualAssignment,
    Provider
} from '../models/lead.model';

@Injectable({
    providedIn: 'root'
})
export class LeadService {
    private apiUrl = `${environment.apiBaseUrl}/admin/leads`;
    private categoriesApiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;
    private subcategoriesApiUrl = `${environment.apiBaseUrl}/admin/sub-category-master`;
    private citiesApiUrl = `${environment.apiBaseUrl}/admin/cities/search`;
    private areasApiUrl = `${environment.apiBaseUrl}/admin/area-master`;
    private customersApiUrl = `${environment.apiBaseUrl}/admin/users`;
    private providersApiUrl = `${environment.apiBaseUrl}/admin/providers`;

    constructor(private http: HttpClient) { }

    // Lead CRUD Operations
    getLeads(query: LeadFilter): Observable<PagedResult<Lead>> {
        let params = new HttpParams()
            .set('pageNumber', query.pageNumber.toString())
            .set('pageSize', query.pageSize.toString());

        if (query.searchTerm) {
            params = params.set('searchTerm', query.searchTerm);
        }
        if (query.categoryId) {
            params = params.set('categoryId', query.categoryId.toString());
        }
        if (query.subcategoryId) {
            params = params.set('subcategoryId', query.subcategoryId.toString());
        }
        if (query.cityId) {
            params = params.set('cityId', query.cityId.toString());
        }
        if (query.areaId) {
            params = params.set('areaId', query.areaId.toString());
        }
        if (query.leadType) {
            params = params.set('leadType', query.leadType);
        }
        if (query.flowType) {
            params = params.set('flowType', query.flowType);
        }
        if (query.confirmedStatus) {
            params = params.set('confirmedStatus', query.confirmedStatus);
        }
        if (query.customerUserId) {
            params = params.set('customerUserId', query.customerUserId.toString());
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

        return this.http.get<PagedResult<Lead>>(this.apiUrl, { params });
    }

    getLeadById(id: number): Observable<Lead> {
        return this.http.get<Lead>(`${this.apiUrl}/${id}`);
    }

    createLead(dto: CreateLeadDto): Observable<Lead> {
        return this.http.post<Lead>(this.apiUrl, dto);
    }

    updateLead(id: number, dto: UpdateLeadDto): Observable<Lead> {
        return this.http.put<Lead>(`${this.apiUrl}/${id}`, dto);
    }

    deleteLead(id: number): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
    }

    // Search/Catalog Methods
    searchCustomers(searchTerm?: string, limit: number = 20): Observable<Customer[]> {
        let params = new HttpParams()
            .set('limit', limit.toString());

        if (searchTerm && searchTerm.trim()) {
            params = params.set('search', searchTerm.trim());
        }

        return this.http.get<{ success: boolean; data: Customer[] }>(`${this.customersApiUrl}/search`, { params })
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    searchCategories(searchTerm?: string, limit: number = 20): Observable<Category[]> {
        let params = new HttpParams().set('limit', limit.toString());

        if (searchTerm && searchTerm.trim()) {
            params = params.set('search', searchTerm.trim());
        }

        return this.http.get<{ success: boolean; data: Category[] }>(`${this.categoriesApiUrl}/search`, { params })
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<{ success: boolean; data: Category[] }>(this.categoriesApiUrl)
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    getSubcategoriesByCategory(categoryId: number): Observable<Subcategory[]> {
        const url = `${this.subcategoriesApiUrl}/by-category/${categoryId}`;
        return this.http.get<Subcategory[]>(url)
            .pipe(
                map(response => response || []),
                catchError((error) => {
                    console.error('Error loading subcategories:', error);
                    return of([]);
                })
            );
    }

    getCities(): Observable<City[]> {
        return this.http.get<{ success: boolean; data: City[] }>(this.citiesApiUrl)
            .pipe(
                map(response => response.data || []),
                catchError(() => of([]))
            );
    }

    getAreasByCity(cityId: number): Observable<Area[]> {
        return this.http.get<{ success: boolean; data: Area[] }>(`${this.areasApiUrl}/by-city/${cityId}`)
            .pipe(
                map(response => response.data || []),
                catchError((error) => {
                    console.error('Error loading areas:', error);
                    return of([]);
                })
            );
    }

    // Enums/Lookup Methods
    getLeadTypes(): Observable<string[]> {
        return of(['b2c', 'b2b']);
    }

    getFlowTypes(): Observable<string[]> {
        return of(['standard', 'confirmed']);
    }

    // getConfirmedStatuses(): Observable<string[]> {
    //     return of(['pending', 'confirmed', 'cancelled']);
    // }

    getTimePreferences(): Observable<string[]> {
        return of(['instant', 'today', 'scheduled']);
    }

    getSources(): Observable<string[]> {
        return of(['link', 'qr', 'code', 'manual']);
    }

    // Helper methods for styling
    getLeadTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'b2c': 'bg-green-100 text-green-800',
            'b2b': 'bg-purple-100 text-purple-800'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getFlowTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            'standard': 'bg-blue-100 text-blue-800',
            'confirmed': 'bg-yellow-100 text-yellow-800'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getConfirmedStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getAvailableProviders(
        categoryId?: number,
        subcategoryId?: number,
        cityId?: number,
        areaId?: number,
        detailed: boolean = false
    ): Observable<Provider[]> {
        let params = new HttpParams();
        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (subcategoryId) params = params.set('subcategoryId', subcategoryId.toString());
        if (cityId) params = params.set('cityId', cityId.toString());
        if (areaId) params = params.set('areaId', areaId.toString());
        if (detailed) params = params.set('detailed', 'true');
    
        return this.http.get<Provider[]>(`${this.providersApiUrl}/available`, { params });
    }
    
    // Update the existing searchProviders method to handle different response formats
    searchProviders(searchTerm?: string, limit: number = 20): Observable<Provider[]> {
        let params = new HttpParams().set('limit', limit.toString());
    
        if (searchTerm && searchTerm.trim()) {
            params = params.set('search', searchTerm.trim());
        }
    
        return this.http.get<Provider[] | { success: boolean; data: Provider[] }>(
            `${this.providersApiUrl}/search`, 
            { params }
        ).pipe(
            map(response => {
                if (Array.isArray(response)) {
                    return response;
                } else if (response && 'data' in response) {
                    return response.data || [];
                }
                return [];
            }),
            catchError((error) => {
                console.error('Error in provider search:', error);
                return of([]);
            })
        );
    }
    
    getProviderTierColor(tier: string): string {
        const colors: { [key: string]: string } = {
            'bronze': 'bg-amber-100 text-amber-800',
            'silver': 'bg-gray-200 text-gray-800',
            'gold': 'bg-yellow-100 text-yellow-800',
            'platinum': 'bg-purple-100 text-purple-800'
        };
        return colors[tier?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }
    assignToProvider(assignment: ManualAssignment): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/assign`, assignment);
    }
    
}