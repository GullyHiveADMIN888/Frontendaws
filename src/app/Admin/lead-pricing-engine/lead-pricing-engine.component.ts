import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { LeadPricingEngineService } from './services/lead-pricing-engine.service';
import {
  LeadPricingEngine,
  LeadPricingEngineFilterDto,
  DropdownOption
} from './models/lead-pricing-engine.model';

@Component({
  selector: 'app-lead-pricing-engine',
  templateUrl: './lead-pricing-engine.component.html',
  styleUrls: ['./lead-pricing-engine.component.css']
})
export class LeadPricingEngineComponent implements OnInit, OnDestroy {
  Math = Math;
  private destroy$ = new Subject<void>();
  private searchConfigSubject = new Subject<string>();

  // ============= DATA =============
  pricingEngines: LeadPricingEngine[] = [];
  configOptions: DropdownOption[] = [];
  selectedConfig: DropdownOption | null = null;
  selectedEngine: LeadPricingEngine | null = null;

  // Cache for config display names
  configDisplayCache = new Map<number, string>();

  // ============= PAGINATION =============
  page = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  // ============= FILTERS =============
  filter: LeadPricingEngineFilterDto = {
    searchTerm: '',
    leadPriceConfigId: undefined,
    isHike: undefined,
    fromDate: undefined,
    toDate: undefined,
    sortBy: 'startDate',
    sortDesc: true
  };

  // ============= UI STATE =============
  initialLoading = true;
  loading = false;
  expandedEngineId: number | null = null;
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // ============= FORMS =============
  createForm: FormGroup;
  editForm: FormGroup;

  // ============= DROPDOWN STATE =============
  configDropdownLoading = false;
  configDropdownSearch = '';

  // ============= ALERT MESSAGES =============
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert = false;

  constructor(
    private fb: FormBuilder,
    private pricingEngineService: LeadPricingEngineService
  ) {
    this.createForm = this.createPricingEngineForm();
    this.editForm = this.createPricingEngineForm();
  }

  // ============= LIFECYCLE HOOKS =============
  ngOnInit(): void {
    this.loadPricingEngines();
    this.loadConfigOptions();
    this.setupConfigSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============= FORM INITIALIZATION =============
  private createPricingEngineForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      startDate: [this.getTodayDate(), Validators.required],
      endDate: [null],
      leadPriceConfigId: [null, Validators.required],
      isHike: [true, Validators.required],
      percentageChange: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // ============= ALERT SYSTEM =============
  showMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    }
  }

  hideMessage(): void {
    this.showAlert = false;
  }

  // ============= DATA LOADING =============
  loadPricingEngines(): void {
    this.loading = true;

    this.pricingEngineService.getLeadPricingEngines({
      page: this.page,
      pageSize: this.pageSize,
      ...this.filter
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.pricingEngines = result.items;
          this.totalCount = result.totalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.loading = false;
          this.initialLoading = false; 

          // Load config names for all unique config IDs in the result
          this.loadConfigNamesForEngines();
        },
        error: (error) => {
          console.error('Error loading pricing engines:', error);
          this.showMessage('Failed to load pricing engines', 'error');
          this.loading = false;
          this.initialLoading = false;
        }
      });
  }

  /**
   * Load config display names for all unique config IDs in the current page
   */
  private loadConfigNamesForEngines(): void {
    const uniqueConfigIds = [...new Set(this.pricingEngines.map(e => e.leadPriceConfigId))];

    uniqueConfigIds.forEach(configId => {
      if (!this.configDisplayCache.has(configId)) {
        this.pricingEngineService.getLeadPricingConfigById(configId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (option) => {
              this.configDisplayCache.set(configId, option.displayName);
            },
            error: (err) => {
              console.error(`Failed to load config ${configId}:`, err);
              this.configDisplayCache.set(configId, `Config #${configId}`);
            }
          });
      }
    });
  }

  loadConfigOptions(searchTerm: string = ''): void {
  this.configDropdownLoading = true;
  this.configOptions = []; // Clear immediately
  
  this.pricingEngineService.getLeadPricingConfigsForDropdown(searchTerm)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (options) => {
        this.configOptions = options;
        options.forEach(opt => {
          this.configDisplayCache.set(opt.id, opt.displayName);
        });
        this.configDropdownLoading = false;
      },
      error: (error) => {
        console.error('Error loading config options:', error);
        this.configDropdownLoading = false;
        this.configOptions = [];
      }
    });
}

  private setupConfigSearch(): void {
  this.searchConfigSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(searchTerm => {
      this.configDropdownLoading = true;
      this.configOptions = []; // Clear previous options
      return this.pricingEngineService.getLeadPricingConfigsForDropdown(searchTerm);
    }),
    takeUntil(this.destroy$)
  ).subscribe({
    next: (options) => {
      this.configOptions = options;
      options.forEach(opt => {
        this.configDisplayCache.set(opt.id, opt.displayName);
      });
      this.configDropdownLoading = false;
    },
    error: (error) => {
      console.error('Error searching configs:', error);
      this.configDropdownLoading = false;
      this.configOptions = [];
    }
  });
}

  onConfigSearch(event: any): void {
  const searchTerm = event.target.value;
  this.configDropdownSearch = searchTerm;
  
  if (!searchTerm || searchTerm.trim() === '') {
    // When search is cleared, load all configs
    this.loadConfigOptions(''); // This will get all configs
  } else {
    // Trigger search with the term
    this.searchConfigSubject.next(searchTerm);
  }
}

  // ============= FILTER METHODS =============
  applyFilters(): void {
    this.page = 1;
    this.loadPricingEngines();
  }

  resetFilters(): void {
    this.filter = {
      searchTerm: '',
      leadPriceConfigId: undefined,
      isHike: undefined,
      fromDate: undefined,
      toDate: undefined,
      sortBy: 'startDate',
      sortDesc: true
    };
    this.page = 1;
    this.loadPricingEngines();
  }

  setDateRange(range: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth'): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (range) {
      case 'today':
        this.filter.fromDate = this.formatDateForInput(today);
        this.filter.toDate = this.formatDateForInput(today);
        break;
      case 'yesterday':
        this.filter.fromDate = this.formatDateForInput(yesterday);
        this.filter.toDate = this.formatDateForInput(yesterday);
        break;
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        this.filter.fromDate = this.formatDateForInput(last7Days);
        this.filter.toDate = this.formatDateForInput(today);
        break;
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        this.filter.fromDate = this.formatDateForInput(last30Days);
        this.filter.toDate = this.formatDateForInput(today);
        break;
      case 'thismonth':
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filter.fromDate = this.formatDateForInput(firstDayThisMonth);
        this.filter.toDate = this.formatDateForInput(today);
        break;
      case 'lastmonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        this.filter.fromDate = this.formatDateForInput(firstDayLastMonth);
        this.filter.toDate = this.formatDateForInput(lastDayLastMonth);
        break;
    }

    this.applyFilters();
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filter.searchTerm) count++;
    if (this.filter.leadPriceConfigId) count++;
    if (this.filter.isHike !== undefined) count++;
    if (this.filter.fromDate) count++;
    if (this.filter.toDate) count++;
    return count;
  }

  // ============= PAGINATION =============
  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadPricingEngines();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadPricingEngines();
    }
  }

  getStartIndex(): number {
    return ((this.page - 1) * this.pageSize) + 1;
  }

  getEndIndex(): number {
    const end = this.page * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ============= MODAL METHODS =============
  openCreateModal(): void {
    this.createForm.reset({
      name: '',
      startDate: this.getTodayDate(),
      endDate: null,
      leadPriceConfigId: null,
      isHike: true,
      percentageChange: 0
    });
    this.selectedConfig = null;
    this.configDropdownSearch = '';
    this.loadConfigOptions();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset();
    this.selectedConfig = null;
    this.configOptions = [];
    this.configDropdownSearch = '';
  }

  onCreateConfigSelect(option: DropdownOption): void {
    this.selectedConfig = option;
    this.createForm.patchValue({
      leadPriceConfigId: option.id
    });
    this.createForm.get('leadPriceConfigId')?.markAsTouched();
    this.configDropdownSearch = '';
    this.configOptions = [];

    // Cache this config
    this.configDisplayCache.set(option.id, option.displayName);
  }

  createPricingEngine(): void {
    if (this.createForm.invalid) {
      Object.keys(this.createForm.controls).forEach(key => {
        this.createForm.get(key)?.markAsTouched();
      });
      this.showMessage('Please fill all required fields correctly', 'warning');
      return;
    }

    const formValue = this.createForm.value;
    const dto = {
      ...formValue,
      endDate: formValue.endDate || null
    };

    this.pricingEngineService.createLeadPricingEngine(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (id) => {
          this.showMessage('Pricing engine created successfully', 'success');
          this.closeCreateModal();
          this.loadPricingEngines();
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to create pricing engine', 'error');
        }
      });
  }

  openEditModal(engine: LeadPricingEngine): void {
    this.selectedEngine = engine;

    // Load the selected config to show its name
    this.pricingEngineService.getLeadPricingConfigById(engine.leadPriceConfigId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (option) => {
          this.selectedConfig = option;
          this.configDisplayCache.set(option.id, option.displayName);
          this.loadConfigOptions();
        },
        error: (error) => {
          console.error('Error loading config:', error);
          this.loadConfigOptions();
        }
      });

    this.editForm.patchValue({
      name: engine.name,
      startDate: engine.startDate.split('T')[0],
      endDate: engine.endDate ? engine.endDate.split('T')[0] : null,
      leadPriceConfigId: engine.leadPriceConfigId,
      isHike: engine.isHike,
      percentageChange: engine.percentageChange
    });

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editForm.reset();
    this.selectedEngine = null;
    this.selectedConfig = null;
    this.configOptions = [];
    this.configDropdownSearch = '';
  }

  onEditConfigSelect(option: DropdownOption): void {
    this.selectedConfig = option;
    this.editForm.patchValue({
      leadPriceConfigId: option.id
    });
    this.editForm.get('leadPriceConfigId')?.markAsTouched();
    this.configDropdownSearch = '';
    this.configOptions = [];

    // Cache this config
    this.configDisplayCache.set(option.id, option.displayName);
  }

  updatePricingEngine(): void {
    if (!this.selectedEngine) return;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      this.showMessage('Please fill all required fields correctly', 'warning');
      return;
    }

    const formValue = this.editForm.value;
    const dto = {
      ...formValue,
      endDate: formValue.endDate || null
    };

    this.pricingEngineService.updateLeadPricingEngine(this.selectedEngine.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.showMessage(message, 'success');
          this.closeEditModal();
          this.loadPricingEngines();
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to update pricing engine', 'error');
        }
      });
  }

  openDeleteModal(engine: LeadPricingEngine): void {
    this.selectedEngine = engine;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEngine = null;
  }

  deletePricingEngine(): void {
    if (!this.selectedEngine) return;

    this.pricingEngineService.deleteLeadPricingEngine(this.selectedEngine.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.showMessage(message, 'success');
          this.closeDeleteModal();
          this.loadPricingEngines();
        },
        error: (error) => {
          this.showMessage(error.message || 'Failed to delete pricing engine', 'error');
          this.closeDeleteModal();
        }
      });
  }

  // ============= UTILITY METHODS =============
  toggleExpand(engineId: number): void {
    this.expandedEngineId = this.expandedEngineId === engineId ? null : engineId;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPercentageClass(isHike: boolean, percentage: number): string {
    if (isHike) {
      return 'text-green-600 font-bold';
    } else {
      return 'text-red-600 font-bold';
    }
  }

  getPercentageSymbol(isHike: boolean): string {
    return isHike ? '+' : '-';
  }

  getStatusBadge(engine: LeadPricingEngine): { text: string; class: string } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(engine.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = engine.endDate ? new Date(engine.endDate) : null;
    if (endDate) endDate.setHours(0, 0, 0, 0);

    if (startDate > today) {
      return { text: 'Upcoming', class: 'bg-yellow-100 text-yellow-800' };
    } else if (endDate && endDate < today) {
      return { text: 'Expired', class: 'bg-gray-100 text-gray-800' };
    } else {
      return { text: 'Active', class: 'bg-green-100 text-green-800' };
    }
  }

  /**
   * Get config display name from cache or load it
   */
  getConfigDisplayName(configId: number): string {
    if (!configId) return 'N/A';

    // Check cache first
    if (this.configDisplayCache.has(configId)) {
      return this.configDisplayCache.get(configId) || `Config #${configId}`;
    }

    // If not in cache, load it
    this.pricingEngineService.getLeadPricingConfigById(configId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (option) => {
          this.configDisplayCache.set(configId, option.displayName);
        },
        error: () => {
          this.configDisplayCache.set(configId, `Config #${configId}`);
        }
      });

    return `Config #${configId}`; // Temporary while loading
  }

  /**
   * Format tier number to letter (0->X, 1->Y, 2->Z)
   */
  formatTier(tier: number | string): string {
    return this.pricingEngineService.formatTier(tier);
  }

  // Add to lead-pricing-engine.component.ts
  getActiveRulesCount(): number {
    if (!this.pricingEngines || this.pricingEngines.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.pricingEngines.filter(engine => {
      const startDate = new Date(engine.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = engine.endDate ? new Date(engine.endDate) : null;
      if (endDate) endDate.setHours(0, 0, 0, 0);

      return startDate <= today && (!endDate || endDate >= today);
    }).length;
  }

  getUpcomingRulesCount(): number {
    if (!this.pricingEngines || this.pricingEngines.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.pricingEngines.filter(engine => {
      const startDate = new Date(engine.startDate);
      startDate.setHours(0, 0, 0, 0);
      return startDate > today;
    }).length;
  }

  // Add these methods to LeadPricingEngineComponent

  /**
   * Get price comparison for a config
   */
  getPriceComparison(configId: number): any {
    const config = this.configOptions.find(c => c.id === configId);
    if (!config) return null;

    return this.pricingEngineService.getPriceComparison(config);
  }

  /**
   * Get price display with styling
   */
  getPriceDisplayWithStyle(config: DropdownOption): {
    displayText: string;
    priceClass: string;
    badgeClass: string;
    badgeText: string;
  } {
    const comparison = this.pricingEngineService.getPriceComparison(config);

    const result = {
      displayText: comparison.displayText,
      priceClass: 'text-gray-900',
      badgeClass: '',
      badgeText: ''
    };

    if (comparison.hasDifference) {
      if (comparison.differenceType === 'higher') {
        result.priceClass = 'text-green-600 font-semibold';
        result.badgeClass = 'bg-green-100 text-green-800';
        result.badgeText = `▲ ${Math.abs(comparison.differencePercentage).toFixed(1)}% Premium`;
      } else {
        result.priceClass = 'text-red-600 font-semibold';
        result.badgeClass = 'bg-red-100 text-red-800';
        result.badgeText = `▼ ${Math.abs(comparison.differencePercentage).toFixed(1)}% Discount`;
      }
    } else if (config.basePrice && config.normalBasePrice) {
      result.badgeClass = 'bg-gray-100 text-gray-700';
      result.badgeText = 'Standard Price';
    } else if (!config.basePrice && config.normalBasePrice) {
      result.badgeClass = 'bg-amber-100 text-amber-800';
      result.badgeText = 'Using Default Price';
    }

    return result;
  }

  /**
   * Format price for display in table
   */
  formatPriceWithComparison(engine: LeadPricingEngine): string {
    const configId = engine.leadPriceConfigId;
    const config = this.configOptions.find(c => c.id === configId);

    if (!config) {
      return `Config #${configId}`;
    }

    const currentPrice = config.basePrice ?? config.normalBasePrice;
    const normalPrice = config.normalBasePrice;

    if (!currentPrice && !normalPrice) {
      return 'Price not set';
    }

    if (!currentPrice) {
      return `₹${normalPrice} (Default)`;
    }

    if (!normalPrice) {
      return `₹${currentPrice}`;
    }

    if (currentPrice !== normalPrice) {
      const diff = ((currentPrice - normalPrice) / normalPrice) * 100;
      const symbol = currentPrice > normalPrice ? '▲' : '▼';
      return `₹${currentPrice} (₹${normalPrice}) ${symbol} ${Math.abs(diff).toFixed(1)}%`;
    }

    return `₹${currentPrice} (Normal: ₹${normalPrice})`;
  }

  /**
   * Get price class for styling
   */
  getPriceClassForConfig(configId: number): string {
    const config = this.configOptions.find(c => c.id === configId);
    if (!config) return '';

    const currentPrice = config.basePrice ?? config.normalBasePrice;
    const normalPrice = config.normalBasePrice;

    if (currentPrice && normalPrice && currentPrice !== normalPrice) {
      return currentPrice > normalPrice ? 'text-green-600' : 'text-red-600';
    }

    return 'text-gray-900';
  }
}