import { Component, OnInit } from '@angular/core';
import { LeadPricingConfigService } from './services/lead-pricing-config.service';
import {
  LeadPricingConfigDto,
  LeadPricingConfigCreateDto,
  LeadPricingConfigUpdateDto,
  ServiceCategory,
  ServiceSubCategory,
  CityTierEnum,
  PaginatedResponse
} from './models/lead-pricing-config.model';

@Component({
  selector: 'app-lead-pricing-config',
  templateUrl: './lead-pricing-config.component.html',
  styleUrls: ['./lead-pricing-config.component.css']
})
export class LeadPricingConfigComponent implements OnInit {
  // Data properties
  configs: LeadPricingConfigDto[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedCityTier: string = '';
  selectedCategoryId: string = '';
  selectedSubcategoryId: string = '';
  isActiveFilter: string = '';

  // Pagination properties
  page: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  // Dropdown data
  serviceCategories: ServiceCategory[] = [];
  serviceSubCategories: ServiceSubCategory[] = [];

  // Grouped subcategories
  groupedSubCategories: { categoryId: number, categoryName: string, subcategories: ServiceSubCategory[] }[] = [];

  // UI state
  loading: boolean = true;
  initialLoading = true;
  error: string | null = null;
  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';

  // Modal state
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentConfig: any = this.getEmptyConfig();
  modalLoading: boolean = false;

  // Stats
  totalConfigs: number = 0;
  activeConfigs: number = 0;
  averageBasePrice: number = 0;
  averageMultiplier: number = 0;

  // Loading states for individual configs
  loadingConfigIds = new Set<number>();
  deletingConfigIds = new Set<number>();

  // City tier options - Updated with correct values for both UI and backend
  cityTierOptions = [
    { value: 'X', display: 'X', description: 'Metro Cities' },
    { value: 'Y', display: 'Y', description: 'Tier 2 Cities' },
    { value: 'Z', display: 'Z', description: 'Tier 3 Cities' }
  ];

  //modal message
  modalErrorMessage: string = '';
  modalErrorType: 'error' | 'warning' | 'info' = 'error';

  constructor(private configService: LeadPricingConfigService) { }

  ngOnInit(): void {
    this.applyFilters();
    this.fetchDropdownData();
  }

  // Get empty configuration template
  getEmptyConfig(): any {
    return {
      id: 0,
      cityTier: null,
      categoryId: 0,
      basePrice: null,
      platformMultiplier: 1.0,
      providerTierMultiplier: 'null',
      isActive: true,
      subcatId: null
    };
  }

  // Show alert message
  showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  // Hide alert message
  hideMessage(): void {
    this.showAlert = false;
  }

  // Apply filters
  applyFilters(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {
      pageNumber: this.page,
      pageSize: this.pageSize
    };

    console.log('Current filter values:', {
      cityTier: this.selectedCityTier,
      categoryId: this.selectedCategoryId,
      subcategoryId: this.selectedSubcategoryId,
      isActive: this.isActiveFilter
    });

    // Only add filters if they have values
    if (this.selectedCityTier) {
      // Backend expects 'X', 'Y', 'Z' strings for filtering
      filters.cityTier = this.selectedCityTier;
    }

    if (this.selectedCategoryId) {
      filters.categoryId = parseInt(this.selectedCategoryId);
    }

    if (this.selectedSubcategoryId) {
      filters.subcatId = parseInt(this.selectedSubcategoryId);
    }

    if (this.isActiveFilter !== '') {
      filters.isActive = this.isActiveFilter === 'true';
    }

    console.log('Sending filters to backend:', filters);

    this.configService.getConfigsWithPagination(filters)
      .subscribe({
        next: (response: PaginatedResponse<LeadPricingConfigDto>) => {
          console.log('Service response received:', response);

          this.configs = response.data || [];
          this.totalCount = response.pagination?.totalCount || this.configs.length;
          this.page = response.pagination?.pageNumber || 1;
          this.pageSize = response.pagination?.pageSize || 10;
          this.totalPages = response.pagination?.totalPages ||
            Math.ceil(this.totalCount / this.pageSize);

          console.log('Loaded configs:', this.configs.length);
          this.calculateStats();
          this.loading = false;
          this.initialLoading = false; 
        },
        error: (err) => {
          console.error('Error in applyFilters:', err);
          console.error('Error response:', err.error);
          this.error = 'Failed to load pricing configurations. Please try again.';
          this.loading = false;
          this.initialLoading = false; 
          this.showMessage('Failed to load configurations', 'error');
        }
      });
  }

  // Reset all filters
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCityTier = '';
    this.selectedCategoryId = '';
    this.selectedSubcategoryId = '';
    this.isActiveFilter = '';
    this.page = 1;
    this.pageSize = 10;
    this.groupedSubCategories = [];
    this.applyFilters();
  }

  // Get count of active filters
  getActiveFilters(): number {
    let count = 0;
    if (this.selectedCityTier) count++;
    if (this.selectedCategoryId) count++;
    if (this.selectedSubcategoryId) count++;
    if (this.isActiveFilter !== '') count++;
    return count;
  }

  // Fetch dropdown data
  fetchDropdownData(): void {
    this.loading = true;

    // Load service categories first
    this.configService.getServiceCategories()
      .subscribe({
        next: (data) => {
          this.serviceCategories = data.filter(cat => cat.isActive);
          console.log('Loaded categories:', this.serviceCategories);

          // Now apply filters to load data
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to load service categories:', err);
          this.showMessage('Failed to load categories', 'error');
          this.loading = false;
          this.applyFilters();
        }
      });
  }

  // Get category name
  getCategoryName(categoryId: number): string {
    if (!categoryId) return '';
    const category = this.serviceCategories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  // Get subcategory name
  getSubCategoryName(subcatId: number | null): string {
    if (!subcatId) return '';

    // Check in grouped subcategories first
    for (const group of this.groupedSubCategories) {
      const subCategory = group.subcategories.find(s => s.id === subcatId);
      if (subCategory) {
        return subCategory.name;
      }
    }

    // Then check in serviceSubCategories array
    const subCat = this.serviceSubCategories.find(s => s.id === subcatId);
    return subCat ? subCat.name : '';
  }

  // When category changes in filters
  onCategoryFilterChange(): void {
    // Reset subcategory when category changes
    this.selectedSubcategoryId = '';

    if (this.selectedCategoryId) {
      this.fetchSubCategoriesForFilter(parseInt(this.selectedCategoryId));
    } else {
      this.groupedSubCategories = [];
      this.serviceSubCategories = [];
    }
    this.page = 1;
  }

  // Fetch subcategories for filter dropdown
  fetchSubCategoriesForFilter(categoryId: number): void {
    if (!categoryId) {
      this.groupedSubCategories = [];
      this.serviceSubCategories = [];
      return;
    }

    console.log('Fetching subcategories for categoryId:', categoryId);

    this.configService.getSubCategoriesByCategoryId(categoryId)
      .subscribe({
        next: (data) => {
          console.log('Subcategories received:', data);
          this.serviceSubCategories = data;
          const category = this.serviceCategories.find(c => c.id === categoryId);
          const activeSubcategories = data.filter(s => s.isActive)
            .sort((a, b) => a.name.localeCompare(b.name));

          console.log('Active subcategories:', activeSubcategories);

          this.groupedSubCategories = [{
            categoryId,
            categoryName: category ? category.name : `Category #${categoryId}`,
            subcategories: activeSubcategories
          }];

          console.log('Grouped subcategories:', this.groupedSubCategories);
        },
        error: (err) => {
          console.error('Failed to load subcategories:', err);
          this.groupedSubCategories = [];
          this.serviceSubCategories = [];
        }
      });
  }

  // Calculate statistics
  calculateStats(): void {
    this.totalConfigs = this.totalCount;
    this.activeConfigs = this.configs.filter(c => c.isActive).length;

    // Calculate average base price (excluding null values)
    const validPrices = this.configs.filter(c => c.basePrice !== null).map(c => c.basePrice!);
    this.averageBasePrice = validPrices.length > 0
      ? validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
      : 0;

    // Calculate average multiplier
    this.averageMultiplier = this.configs.length > 0
      ? this.configs.reduce((sum, c) => sum + c.platformMultiplier, 0) / this.configs.length
      : 0;
  }

  // Client-side search
  performClientSideSearch(): void {
    if (!this.searchTerm.trim()) {
      // If search is cleared, reapply original filters
      this.applyFilters();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    // Filter the currently loaded data client-side
    this.configs = this.configs.filter(config =>
      (config.categoryName && config.categoryName.toLowerCase().includes(term)) ||
      this.getCityTierDisplay(config.cityTier).toLowerCase().includes(term) ||
      (config.subcategoryName && config.subcategoryName.toLowerCase().includes(term))
    );
  }

  // Get city tier display - convert enum to string
  getCityTierDisplay(cityTier: CityTierEnum): string {
    const tierName = CityTierEnum[cityTier];
    return tierName || 'Unknown';
  }

  // Get provider multiplier display
  getProviderMultiplierDisplay(jsonString: string | null): string {
    if (!jsonString || jsonString === 'null') return 'Not Set';

    try {
      const multipliers = JSON.parse(jsonString);
      const items = Object.entries(multipliers).map(([key, value]) => `${key}: ${value}x`);
      return items.join(', ');
    } catch (error) {
      return 'Invalid JSON';
    }
  }

  // Format currency
  formatCurrency(amount: number | null | undefined, currency: string = 'INR'): string {
    if (amount === null || amount === undefined) return 'Not Set';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Check if config is updating
  isConfigUpdating(configId: number): boolean {
    return this.loadingConfigIds.has(configId);
  }

  // Check if config is deleting
  isConfigDeleting(configId: number): boolean {
    return this.deletingConfigIds.has(configId);
  }

  // Pagination methods
  getStartIndex(): number {
    return (this.page - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.pageSize, this.totalCount);
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const pageNumbers: number[] = [];

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (this.page <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (this.page >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = this.page - 2; i <= this.page + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  }

  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.applyFilters();
    }
  }

  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.page = pageNum;
      this.applyFilters();
    }
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentConfig = this.getEmptyConfig();
    this.groupedSubCategories = [];
    this.showModal = true;
    this.modalErrorMessage = '';
  }

  editConfig(config: LeadPricingConfigDto): void {
    this.isEditMode = true;

    // Convert CityTierEnum to string for dropdown
    const cityTierString = CityTierEnum[config.cityTier] as string;

    console.log('Editing config:', {
      originalCityTier: config.cityTier,
      cityTierString: cityTierString,
      cityTierEnumValue: config.cityTier
    });

    this.currentConfig = {
      ...config,
      cityTier: cityTierString, // Store as string ('X', 'Y', 'Z') for dropdown
      providerTierMultiplier: config.providerTierMultiplier || 'null',
      subcatId: config.subcatId || null
    };

    this.groupedSubCategories = [];
    this.modalErrorMessage = '';

    // Fetch subcategories for the selected category
    if (this.currentConfig.categoryId) {
      this.fetchSubCategoriesByCategoryForEdit(this.currentConfig.categoryId);
    }

    this.showModal = true;
  }

  fetchSubCategoriesByCategoryForEdit(categoryId: number): void {
    this.configService.getSubCategoriesByCategoryId(categoryId)
      .subscribe({
        next: (data) => {
          const category = this.serviceCategories.find(c => c.id === categoryId);
          const activeSubcategories = data.filter(s => s.isActive)
            .sort((a, b) => a.name.localeCompare(b.name));

          this.groupedSubCategories = [{
            categoryId,
            categoryName: category ? category.name : `Category #${categoryId}`,
            subcategories: activeSubcategories
          }];
        },
        error: (err) => {
          console.error('Failed to load subcategories:', err);
          this.groupedSubCategories = [];
        }
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.currentConfig = this.getEmptyConfig();
    this.groupedSubCategories = [];
    this.modalLoading = false;
    this.modalErrorMessage = '';
  }

  saveConfig(): void {
    if (this.isEditMode) {
      this.updateConfig();
    } else {
      this.createConfig();
    }
  }

  createConfig(): void {
    console.log('Creating config with data:', this.currentConfig);

    // Reset modal error before validation
    this.modalErrorMessage = '';


    // Validate that if subcategory is selected, it belongs to the selected category
    if (this.currentConfig.subcatId) {
      const isValidSubcat = this.groupedSubCategories.some(group =>
        group.categoryId === this.currentConfig.categoryId &&
        group.subcategories.some(subcat => subcat.id === this.currentConfig.subcatId)
      );

      if (!isValidSubcat) {
        this.modalErrorMessage = 'Selected subcategory does not belong to the selected category!';
        this.modalErrorType = 'error';
        return;
      }
    }
    // Validate required fields
    if (!this.currentConfig.cityTier || this.currentConfig.cityTier.trim() === '') {
      this.showMessage('City tier is required!', 'error');
      return;
    }

    if (!this.currentConfig.categoryId || this.currentConfig.categoryId === 0) {
      this.showMessage('Category is required!', 'error');
      return;
    }

    // Validate that if subcategory is selected, it belongs to the selected category
    if (this.currentConfig.subcatId) {
      const isValidSubcat = this.groupedSubCategories.some(group =>
        group.categoryId === this.currentConfig.categoryId &&
        group.subcategories.some(subcat => subcat.id === this.currentConfig.subcatId)
      );

      if (!isValidSubcat) {
        this.showMessage('Selected subcategory does not belong to the selected category!', 'error');
        return;
      }
    }

    // Validate provider tier multiplier JSON
    if (this.currentConfig.providerTierMultiplier &&
      this.currentConfig.providerTierMultiplier !== 'null') {
      try {
        JSON.parse(this.currentConfig.providerTierMultiplier);
      } catch (error) {
        this.showMessage('Invalid JSON format for provider tier multiplier', 'error');
        return;
      }
    }

    // Convert string city tier to CityTierEnum for backend
    // IMPORTANT: The backend expects the enum value (0 for X, 1 for Y, 2 for Z)
    let cityTierEnum: CityTierEnum;
    switch (this.currentConfig.cityTier) {
      case 'X': cityTierEnum = CityTierEnum.X; break;
      case 'Y': cityTierEnum = CityTierEnum.Y; break;
      case 'Z': cityTierEnum = CityTierEnum.Z; break;
      default:
        this.showMessage('Invalid city tier selected!', 'error');
        return;
    }

    console.log('Converted city tier for backend:', {
      string: this.currentConfig.cityTier,
      enum: cityTierEnum,
      enumName: CityTierEnum[cityTierEnum]
    });

    const createDto: LeadPricingConfigCreateDto = {
      cityTier: cityTierEnum, // Use the enum value (0, 1, 2)
      categoryId: this.currentConfig.categoryId,
      basePrice: this.currentConfig.basePrice,
      platformMultiplier: this.currentConfig.platformMultiplier,
      providerTierMultiplier: this.currentConfig.providerTierMultiplier === 'null'
        ? null
        : this.currentConfig.providerTierMultiplier,
      isActive: this.currentConfig.isActive,
      subcatId: this.currentConfig.subcatId || null
    };

    console.log('Sending create DTO:', createDto);

    this.modalLoading = true;

    this.configService.createConfig(createDto)
      .subscribe({
        next: (response) => {
          this.modalLoading = false;
          console.log('Create response:', response);

          if (response.success) {
            this.closeModal();
            this.applyFilters();
            this.showMessage('Pricing configuration created successfully!', 'success');
          } else {
            // Handle backend validation errors
            if (response.message?.includes('already exists') ||
              response.message?.includes('duplicate') ||
              response.message?.includes('conflict')) {
              this.handleDuplicateConfigError(cityTierEnum);
            } else {
              this.showMessage(response.message || 'Failed to create configuration', 'error');
            }
          }
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error creating configuration:', err);
          console.error('Error details:', err.error);

          if (err.status === 400) {
            // Handle validation errors
            const errorMessage = this.extractErrorMessage(err);
            this.showMessage(errorMessage, 'error');
          } else if (err.status === 409) {
            // Handle duplicate/conflict errors
            this.handleDuplicateConfigError(cityTierEnum);
          } else {
            this.showMessage('Failed to create pricing configuration. Please try again.', 'error');
          }
        }
      });
  }

  // Helper method to extract error message from error response
  extractErrorMessage(err: any): string {
    if (err.error?.message) {
      return 'Validation error: ' + err.error.message;
    } else if (err.error?.errors) {
      // Handle multiple validation errors
      const errors = err.error.errors;
      if (typeof errors === 'object') {
        return 'Validation errors: ' + Object.values(errors).join(', ');
      }
      return 'Validation error: ' + errors;
    }
    return 'Validation error: Please check your input';
  }

  // Helper method to handle duplicate configuration errors
  handleDuplicateConfigError(cityTierEnum: CityTierEnum): void {
    const cityTierDisplay = this.getCityTierDisplay(cityTierEnum);
    const categoryName = this.getCategoryName(this.currentConfig.categoryId);

    let message = `A pricing configuration already exists for Tier ${cityTierDisplay}`;

    if (this.currentConfig.subcatId) {
      const subcatName = this.getSubCategoryName(this.currentConfig.subcatId);
      message += `, ${categoryName} category and ${subcatName} subcategory.`;
    } else {
      message += ` and ${categoryName} category.`;
    }

    message += ' Please edit the existing configuration or choose a different combination.';

    this.modalErrorMessage = message;
    this.modalErrorType = 'warning';
    // this.showMessage(message, 'warning');
  }

  updateConfig(): void {
    console.log('Updating config with data:', this.currentConfig);

    // Reset modal error before validation
    this.modalErrorMessage = '';
    // Validate required fields
    if (!this.currentConfig.cityTier || this.currentConfig.cityTier.trim() === '') {
      this.showMessage('City tier is required!', 'error');
      return;
    }

    if (!this.currentConfig.categoryId || this.currentConfig.categoryId === 0) {
      this.showMessage('Category is required!', 'error');
      return;
    }

    // Validate that if subcategory is selected, it belongs to the selected category
    if (this.currentConfig.subcatId) {
      const isValidSubcat = this.groupedSubCategories.some(group =>
        group.categoryId === this.currentConfig.categoryId &&
        group.subcategories.some(subcat => subcat.id === this.currentConfig.subcatId)
      );

      if (!isValidSubcat) {
        this.showMessage('Selected subcategory does not belong to the selected category!', 'error');
        return;
      }
    }

    // Validate provider tier multiplier JSON
    if (this.currentConfig.providerTierMultiplier &&
      this.currentConfig.providerTierMultiplier !== 'null') {
      try {
        JSON.parse(this.currentConfig.providerTierMultiplier);
      } catch (error) {
        this.showMessage('Invalid JSON format for provider tier multiplier', 'error');
        return;
      }
    }

    // Convert string city tier to CityTierEnum for backend
    let cityTierEnum: CityTierEnum;
    switch (this.currentConfig.cityTier) {
      case 'X': cityTierEnum = CityTierEnum.X; break;
      case 'Y': cityTierEnum = CityTierEnum.Y; break;
      case 'Z': cityTierEnum = CityTierEnum.Z; break;
      default:
        this.showMessage('Invalid city tier selected!', 'error');
        return;
    }

    console.log('Converted city tier for update:', {
      string: this.currentConfig.cityTier,
      enum: cityTierEnum,
      enumName: CityTierEnum[cityTierEnum]
    });

    const updateDto: LeadPricingConfigUpdateDto = {
      cityTier: cityTierEnum, // Use the enum value (0, 1, 2)
      categoryId: this.currentConfig.categoryId,
      basePrice: this.currentConfig.basePrice,
      platformMultiplier: this.currentConfig.platformMultiplier,
      providerTierMultiplier: this.currentConfig.providerTierMultiplier === 'null'
        ? null
        : this.currentConfig.providerTierMultiplier,
      isActive: this.currentConfig.isActive,
      subcatId: this.currentConfig.subcatId || null
    };

    console.log('Sending update DTO:', updateDto);

    this.modalLoading = true;

    this.configService.updateConfig(this.currentConfig.id, updateDto)
      .subscribe({
        next: (response) => {
          this.modalLoading = false;
          console.log('Update response:', response);

          if (response.success) {
            this.closeModal();
            this.applyFilters();
            this.showMessage('Pricing configuration updated successfully!', 'success');
          } else {
            // Handle backend validation errors
            if (response.message?.includes('already exists') ||
              response.message?.includes('duplicate') ||
              response.message?.includes('conflict')) {
              this.handleDuplicateConfigError(cityTierEnum);
            } else {
              this.showMessage(response.message || 'Failed to update configuration', 'error');
            }
          }
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error updating configuration:', err);
          console.error('Error details:', err.error);

          if (err.status === 400) {
            const errorMessage = this.extractErrorMessage(err);
            this.showMessage(errorMessage, 'error');
          } else if (err.status === 404) {
            this.showMessage('Configuration not found', 'error');
          } else if (err.status === 409) {
            this.handleDuplicateConfigError(cityTierEnum);
          } else {
            this.showMessage('Failed to update pricing configuration. Please try again.', 'error');
          }
        }
      });
  }
  // Toggle active status
  toggleActive(config: LeadPricingConfigDto): void {
    const newStatus = !config.isActive;

    const updateDto: LeadPricingConfigUpdateDto = {
      cityTier: config.cityTier,
      categoryId: config.categoryId,
      basePrice: config.basePrice,
      platformMultiplier: config.platformMultiplier,
      providerTierMultiplier: config.providerTierMultiplier,
      isActive: newStatus,
      subcatId: config.subcatId
    };

    this.loadingConfigIds.add(config.id);

    this.configService.updateConfig(config.id, updateDto)
      .subscribe({
        next: (response) => {
          this.loadingConfigIds.delete(config.id);
          if (response.success) {
            this.applyFilters();
            this.showMessage(`Configuration is now ${newStatus ? 'active' : 'inactive'}`, 'success');
          } else {
            this.showMessage('Failed to update configuration', 'error');
          }
        },
        error: (err) => {
          this.loadingConfigIds.delete(config.id);
          console.error('Error updating configuration:', err);
          this.showMessage('Failed to update configuration', 'error');
        }
      });
  }

  // Confirm delete
  confirmDelete(config: LeadPricingConfigDto): void {
    if (confirm(`Are you sure you want to delete this configuration for Tier ${this.getCityTierDisplay(config.cityTier)} and ${config.categoryName}?`)) {
      this.deleteConfig(config);
    }
  }

  // Delete configuration
  deleteConfig(config: LeadPricingConfigDto): void {
    this.deletingConfigIds.add(config.id);

    this.configService.deleteConfig(config.id)
      .subscribe({
        next: (response) => {
          this.deletingConfigIds.delete(config.id);
          if (response.success) {
            this.applyFilters();
            this.showMessage('Configuration deleted successfully', 'success');
          } else {
            this.showMessage(response.message || 'Failed to delete configuration', 'error');
          }
        },
        error: (err) => {
          this.deletingConfigIds.delete(config.id);
          console.error('Error deleting configuration:', err);

          if (err.status === 400) {
            this.showMessage('Cannot delete this configuration as it is being used in the system.', 'warning');
          } else if (err.status === 404) {
            this.showMessage('Configuration not found', 'error');
          } else {
            this.showMessage('Failed to delete configuration', 'error');
          }
        }
      });
  }

  // When category changes in modal
  onCategoryChange(): void {
    // Reset subcategory when category changes
    this.currentConfig.subcatId = null;

    if (this.currentConfig.categoryId) {
      this.fetchSubCategoriesByCategory(this.currentConfig.categoryId);
    } else {
      this.groupedSubCategories = [];
    }
  }

  // Fetch subcategories by category
  fetchSubCategoriesByCategory(categoryId: number): void {
    if (!categoryId) {
      this.groupedSubCategories = [];
      return;
    }

    this.configService.getSubCategoriesByCategoryId(categoryId)
      .subscribe({
        next: (data) => {
          const category = this.serviceCategories.find(c => c.id === categoryId);
          const activeSubcategories = data.filter(s => s.isActive)
            .sort((a, b) => a.name.localeCompare(b.name));

          this.groupedSubCategories = [{
            categoryId,
            categoryName: category ? category.name : `Category #${categoryId}`,
            subcategories: activeSubcategories
          }];
        },
        error: (err) => {
          console.error('Failed to load subcategories:', err);
          this.groupedSubCategories = [];
        }
      });
  }

  // Display increase/decrease in price compared to normal base price
  getPriceDisplay(config: LeadPricingConfigDto): {
    displayPrice: string;
    originalPrice: string;
    hasDifference: boolean;
    differenceType: 'higher' | 'lower' | 'equal';
    differencePercentage: number;
  } {
    const result = {
      displayPrice: this.formatCurrency(config.basePrice, 'INR'),
      originalPrice: this.formatCurrency(config.normalBasePrice, 'INR'),
      hasDifference: false,
      differenceType: 'equal' as 'higher' | 'lower' | 'equal',
      differencePercentage: 0
    };

    // If basePrice is null or undefined, show normalBasePrice
    if (config.basePrice === null || config.basePrice === undefined) {
      result.displayPrice = this.formatCurrency(config.normalBasePrice, 'INR');
      return result;
    }

    // Compare basePrice with normalBasePrice
    if (config.normalBasePrice && config.basePrice !== config.normalBasePrice) {
      result.hasDifference = true;
      result.differenceType = config.basePrice > config.normalBasePrice ? 'higher' : 'lower';

      // Calculate percentage difference
      if (config.normalBasePrice > 0) {
        result.differencePercentage = ((config.basePrice - config.normalBasePrice) / config.normalBasePrice) * 100;
      }
    }

    return result;
  }


}