import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import {
  LeadPricingEngine,
  LeadPricingEngineCreateDto,
  LeadPricingEngineUpdateDto,
  LeadPricingEngineFilterDto,
  ApiResponse,
  PagedResult,
  DropdownOption
} from '../models/lead-pricing-engine.model';

interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LeadPricingEngineService {
  // API endpoints
  private engineApiUrl = `${environment.apiBaseUrl}/admin/lead-pricing-engines`;
  private configApiUrl = `${environment.apiBaseUrl}/admin/lead-pricing-config`;
  private subCategoryApiUrl = `${environment.apiBaseUrl}/admin/sub-category-master`;

  // Cache for subcategories
  private subCategoryCache = new Map<number, string>();
  private subCategoryCacheLoaded = false;

  constructor(private http: HttpClient) {
    this.loadSubCategories();
  }

  // ==================== SUBCATEGORY CACHE METHODS ====================

  /**
   * Load all subcategories and cache them
   */
  private loadSubCategories(): Observable<Map<number, string>> {
    if (this.subCategoryCacheLoaded) {
      return of(this.subCategoryCache);
    }

    return this.http.get<any>(this.subCategoryApiUrl).pipe(
      tap(response => {
        let subcategories: SubCategory[] = [];
        
        // Handle different response formats
        if (Array.isArray(response)) {
          subcategories = response;
        } else if (response?.data && Array.isArray(response.data)) {
          subcategories = response.data;
        } else if (response?.items && Array.isArray(response.items)) {
          subcategories = response.items;
        }

        this.subCategoryCache.clear();
        subcategories.forEach(sub => {
          if (sub.isActive !== false) { // Only cache active subcategories
            this.subCategoryCache.set(sub.id, sub.name);
          }
        });
        this.subCategoryCacheLoaded = true;
        // console.log('Subcategory cache loaded:', this.subCategoryCache.size, 'items');
      }),
      map(() => this.subCategoryCache),
      catchError(error => {
        console.error('Error loading subcategories:', error);
        return of(this.subCategoryCache);
      })
    );
  }

  /**
   * Get subcategory name by ID
   */
  getSubcategoryName(subcatId: number): string {
    if (!subcatId) return 'N/A';

    if (this.subCategoryCache.has(subcatId)) {
      return this.subCategoryCache.get(subcatId) || `Subcategory ${subcatId}`;
    }

    // If not in cache, try to load it asynchronously
    this.loadSubCategories().subscribe();
    return `Subcategory ${subcatId}`;
  }

  // ==================== LEAD PRICING ENGINE METHODS ====================

  /**
   * Get all pricing engines with pagination, filtering and sorting
   */
  getLeadPricingEngines(request: LeadPricingEngineFilterDto & { page: number; pageSize: number }): Observable<PagedResult<LeadPricingEngine>> {
    let params = new HttpParams()
      .set('pageNumber', request.page.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }
    if (request.leadPriceConfigId) {
      params = params.set('leadPriceConfigId', request.leadPriceConfigId.toString());
    }
    if (request.isHike !== undefined) {
      params = params.set('isHike', request.isHike.toString());
    }
    if (request.fromDate) {
      params = params.set('fromDate', request.fromDate);
    }
    if (request.toDate) {
      params = params.set('toDate', request.toDate);
    }
    if (request.sortBy) {
      params = params.set('sortBy', request.sortBy);
    }
    if (request.sortDesc !== undefined) {
      params = params.set('sortDesc', request.sortDesc.toString());
    }

    return this.http.get<any>(this.engineApiUrl, { params }).pipe(
      map(response => {
        // Handle different response formats
        let items: LeadPricingEngine[] = [];
        let totalCount = 0;
        let pageNumber = request.page;
        let pageSize = request.pageSize;

        if (response?.data && Array.isArray(response.data)) {
          items = response.data;
          totalCount = response.totalCount || response.pagination?.totalCount || items.length;
          pageNumber = response.pageNumber || response.pagination?.pageNumber || request.page;
          pageSize = response.pageSize || response.pagination?.pageSize || request.pageSize;
        } else if (Array.isArray(response)) {
          items = response;
          totalCount = items.length;
        }

        return {
          items: items,
          totalCount: totalCount,
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: Math.ceil(totalCount / pageSize)
        };
      }),
      catchError(error => {
        console.error('Error in getLeadPricingEngines:', error);
        return of({
          items: [],
          totalCount: 0,
          pageNumber: request.page,
          pageSize: request.pageSize,
          totalPages: 0
        });
      })
    );
  }

  /**
   * Get single pricing engine by ID
   */
  getLeadPricingEngine(id: number): Observable<LeadPricingEngine> {
    return this.http.get<any>(`${this.engineApiUrl}/${id}`).pipe(
      map(response => {
        let engine: LeadPricingEngine;
        
        if (response?.data) {
          engine = response.data;
        } else {
          engine = response;
        }

        if (!engine) {
          throw new Error('Failed to load pricing engine');
        }
        
        return engine;
      }),
      catchError(error => {
        console.error('Error in getLeadPricingEngine:', error);
        throw error;
      })
    );
  }

  /**
   * Create new pricing engine
   */
  createLeadPricingEngine(dto: LeadPricingEngineCreateDto): Observable<number> {
    return this.http.post<any>(this.engineApiUrl, dto).pipe(
      map(response => {
        if (response?.success === false) {
          throw new Error(response.message || 'Failed to create pricing engine');
        }
        
        // Handle different response formats
        if (response?.data?.leadPricingEngineId) {
          return response.data.leadPricingEngineId;
        } else if (response?.leadPricingEngineId) {
          return response.leadPricingEngineId;
        } else if (response?.id) {
          return response.id;
        }
        
        return 0;
      }),
      catchError(error => {
        console.error('Error in createLeadPricingEngine:', error);
        throw error;
      })
    );
  }

  /**
   * Update existing pricing engine
   */
  updateLeadPricingEngine(id: number, dto: LeadPricingEngineUpdateDto): Observable<string> {
    return this.http.put<any>(`${this.engineApiUrl}/${id}`, dto).pipe(
      map(response => {
        if (response?.success === false) {
          throw new Error(response.message || 'Failed to update pricing engine');
        }
        return response?.message || 'Updated successfully';
      }),
      catchError(error => {
        console.error('Error in updateLeadPricingEngine:', error);
        throw error;
      })
    );
  }

  /**
   * Delete pricing engine
   */
  deleteLeadPricingEngine(id: number): Observable<string> {
    return this.http.delete<any>(`${this.engineApiUrl}/${id}`).pipe(
      map(response => {
        if (response?.success === false) {
          throw new Error(response.message || 'Failed to delete pricing engine');
        }
        return response?.message || 'Deleted successfully';
      }),
      catchError(error => {
        console.error('Error in deleteLeadPricingEngine:', error);
        throw error;
      })
    );
  }

  // ==================== LEAD PRICING CONFIG METHODS ====================

  /**
   * Get all active lead pricing configs for dropdown with subcategory names and price comparison
   */
  getLeadPricingConfigsForDropdown(searchTerm?: string): Observable<DropdownOption[]> {
    // Ensure subcategories are loaded first
    return this.loadSubCategories().pipe(
      switchMap(() => {
        let params = new HttpParams()
          .set('pageNumber', '1')
          .set('pageSize', '50')
          .set('isActive', 'true');

        if (searchTerm && searchTerm.trim()) {
          params = params.set('searchTerm', searchTerm.trim());
        }

        return this.http.get<any>(this.configApiUrl, { params }).pipe(
          map(response => {
            let configs: any[] = [];

            // Handle different response formats
            if (Array.isArray(response)) {
              configs = response;
            } else if (response?.data && Array.isArray(response.data)) {
              configs = response.data;
            } else if (response?.items && Array.isArray(response.items)) {
              configs = response.items;
            }

            // console.log('Raw configs from API:', configs); // Debug log

            return configs.map(config => {
              // IMPORTANT: Extract both prices correctly
              const basePrice = config.basePrice !== undefined && config.basePrice !== null 
                ? Number(config.basePrice) 
                : null;
              
              const normalBasePrice = config.normalBasePrice !== undefined && config.normalBasePrice !== null 
                ? Number(config.normalBasePrice) 
                : null;

              // Get subcategory name from cache
              let subcatName = config.subcatName;
              if (config.subcatId && !subcatName) {
                subcatName = this.subCategoryCache.get(config.subcatId) || 
                           this.getSubcategoryName(config.subcatId);
              }

              // Create the dropdown option with both prices
              const dropdownOption: DropdownOption = {
                id: config.id,
                displayName: '', // Will be set after formatting
                cityTier: config.cityTier,
                categoryId: config.categoryId,
                categoryName: config.categoryName,
                subcatId: config.subcatId,
                subcatName: subcatName,
                basePrice: basePrice,
                normalBasePrice: normalBasePrice, // CRITICAL: Explicitly set normalBasePrice
                isActive: config.isActive !== false
              };

              // Set the display name using the complete config object
              dropdownOption.displayName = this.formatConfigDisplayName(dropdownOption);

              return dropdownOption;
            });
          })
        );
      })
    );
  }

  /**
   * Get single config by ID with subcategory name and price comparison
   */
  getLeadPricingConfigById(id: number): Observable<DropdownOption> {
    // Ensure subcategories are loaded first
    return this.loadSubCategories().pipe(
      switchMap(() => {
        return this.http.get<any>(`${this.configApiUrl}/${id}`).pipe(
          map(response => {
            let config: any = response;
            
            // Handle different response formats
            if (response?.data) {
              config = response.data;
            }

            // IMPORTANT: Extract both prices correctly
            const basePrice = config.basePrice !== undefined && config.basePrice !== null 
              ? Number(config.basePrice) 
              : null;
            
            const normalBasePrice = config.normalBasePrice !== undefined && config.normalBasePrice !== null 
              ? Number(config.normalBasePrice) 
              : null;

            // Get subcategory name from cache
            let subcatName = config.subcatName;
            if (config.subcatId && !subcatName) {
              subcatName = this.subCategoryCache.get(config.subcatId) || 
                         this.getSubcategoryName(config.subcatId);
            }

            // Create the dropdown option with both prices
            const dropdownOption: DropdownOption = {
              id: config.id,
              displayName: '', // Will be set after formatting
              cityTier: config.cityTier,
              categoryId: config.categoryId,
              categoryName: config.categoryName,
              subcatId: config.subcatId,
              subcatName: subcatName,
              basePrice: basePrice,
              normalBasePrice: normalBasePrice, // CRITICAL: Explicitly set normalBasePrice
              isActive: config.isActive !== false
            };

            // Set the display name using the complete config object
            dropdownOption.displayName = this.formatConfigDisplayName(dropdownOption);

            return dropdownOption;
          })
        );
      })
    );
  }

  /**
   * Format config details into readable display name with full price comparison
   * Example: "Tier X - Home Services - Cooler Repair - ₹105 - (Normal: ₹100) - ▲ 5.0%"
   */
  private formatConfigDisplayName(config: any): string {
    const parts = [];

    // Convert tier number to letter: 0->X, 1->Y, 2->Z
    let tierLetter = 'X';
    if (config.cityTier === 0 || config.cityTier === '0') tierLetter = 'X';
    else if (config.cityTier === 1 || config.cityTier === '1') tierLetter = 'Y';
    else if (config.cityTier === 2 || config.cityTier === '2') tierLetter = 'Z';
    else tierLetter = config.cityTier?.toString() || 'X';

    parts.push(`Tier ${tierLetter}`);

    // Category
    if (config.categoryName) {
      parts.push(config.categoryName);
    } else if (config.categoryId) {
      parts.push(`Category ${config.categoryId}`);
    }

    // Subcategory
    if (config.subcatName) {
      parts.push(config.subcatName);
    } else if (config.subcatId) {
      const subcatName = this.getSubcategoryName(config.subcatId);
      parts.push(subcatName);
    }

    // IMPORTANT: Get both prices from the config object
    const currentPrice = config.basePrice !== undefined && config.basePrice !== null 
      ? Number(config.basePrice) 
      : null;
    
    const normalPrice = config.normalBasePrice !== undefined && config.normalBasePrice !== null 
      ? Number(config.normalBasePrice) 
      : null;

    // Price display logic
    if (currentPrice !== null) {
      parts.push(`₹${currentPrice}`);
    } else if (normalPrice !== null) {
      parts.push(`₹${normalPrice}`);
    } else {
      parts.push('₹0');
    }

    // Normal price and comparison
    if (normalPrice !== null) {
      if (currentPrice !== null) {
        if (currentPrice !== normalPrice) {
          parts.push(`(Normal: ₹${normalPrice})`);
          
          // Calculate and add percentage difference
          const diff = ((currentPrice - normalPrice) / normalPrice) * 100;
          const symbol = currentPrice > normalPrice ? '▲' : '▼';
          parts.push(`${symbol} ${Math.abs(diff).toFixed(1)}%`);
        } else {
          parts.push(`(Normal: ₹${normalPrice})`);
        }
      } else {
        // No current price, using normal price
        parts.push(`(Default: ₹${normalPrice})`);
      }
    }

    // Inactive indicator
    if (config.isActive === false) {
      parts.push('(Inactive)');
    }

    return parts.join(' - ');
  }

  /**
   * Get comprehensive price comparison object
   */
  getPriceComparison(config: any): {
    currentPrice: number | null;
    normalPrice: number | null;
    hasDifference: boolean;
    differenceType: 'higher' | 'lower' | 'equal';
    differencePercentage: number;
    displayText: string;
    priceClass: string;
    badgeClass: string;
    badgeText: string;
  } {
    // IMPORTANT: Extract both prices correctly
    const currentPrice = config?.basePrice !== undefined && config?.basePrice !== null 
      ? Number(config.basePrice) 
      : null;
    
    const normalPrice = config?.normalBasePrice !== undefined && config?.normalBasePrice !== null 
      ? Number(config.normalBasePrice) 
      : null;

    // console.log('Price comparison for config:', {
    //   configId: config?.id,
    //   currentPrice,
    //   normalPrice,
    //   rawConfig: config
    // });

    // Initialize result
    const result = {
      currentPrice: currentPrice,
      normalPrice: normalPrice,
      hasDifference: false,
      differenceType: 'equal' as 'higher' | 'lower' | 'equal',
      differencePercentage: 0,
      displayText: '',
      priceClass: 'text-gray-900',
      badgeClass: '',
      badgeText: ''
    };

    // Case 1: No prices at all
    if (currentPrice === null && normalPrice === null) {
      result.displayText = 'Price not set';
      result.priceClass = 'text-gray-400';
      result.badgeClass = 'bg-gray-100 text-gray-600';
      result.badgeText = 'No Price';
      return result;
    }

    // Case 2: Only normal price exists (using default)
    if (currentPrice === null && normalPrice !== null) {
      result.displayText = `₹${normalPrice} (Default)`;
      result.priceClass = 'text-amber-600';
      result.badgeClass = 'bg-amber-100 text-amber-800';
      result.badgeText = 'Default Price';
      return result;
    }

    // Case 3: Only current price exists (custom price, no normal defined)
    if (currentPrice !== null && normalPrice === null) {
      result.displayText = `₹${currentPrice}`;
      result.priceClass = 'text-blue-600';
      result.badgeClass = 'bg-blue-100 text-blue-800';
      result.badgeText = 'Custom Price';
      return result;
    }

    // Case 4: Both prices exist
    if (currentPrice !== null && normalPrice !== null) {
      if (currentPrice !== normalPrice) {
        result.hasDifference = true;
        result.differenceType = currentPrice > normalPrice ? 'higher' : 'lower';
        result.differencePercentage = ((currentPrice - normalPrice) / normalPrice) * 100;
        
        const symbol = currentPrice > normalPrice ? '▲' : '▼';
        const diffText = `${symbol} ${Math.abs(result.differencePercentage).toFixed(1)}%`;
        result.displayText = `₹${currentPrice} (Normal: ₹${normalPrice}) ${diffText}`;
        
        // Set styling based on price difference
        if (currentPrice > normalPrice) {
          result.priceClass = 'text-green-600 font-semibold';
          result.badgeClass = 'bg-green-100 text-green-800';
          result.badgeText = `▲ ${Math.abs(result.differencePercentage).toFixed(1)}% Premium`;
        } else {
          result.priceClass = 'text-red-600 font-semibold';
          result.badgeClass = 'bg-red-100 text-red-800';
          result.badgeText = `▼ ${Math.abs(result.differencePercentage).toFixed(1)}% Discount`;
        }
      } else {
        result.displayText = `₹${currentPrice} (Normal: ₹${normalPrice})`;
        result.priceClass = 'text-gray-900';
        result.badgeClass = 'bg-gray-100 text-gray-700';
        result.badgeText = 'Standard Price';
      }
    }

    return result;
  }

  /**
   * Convert tier number to letter (0->X, 1->Y, 2->Z)
   */
  formatTier(tier: number | string): string {
    if (tier === 0 || tier === '0') return 'X';
    if (tier === 1 || tier === '1') return 'Y';
    if (tier === 2 || tier === '2') return 'Z';
    return tier?.toString() || 'X';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return 'Not set';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}