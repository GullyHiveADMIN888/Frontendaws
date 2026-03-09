import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LeadAssignment,
  Provider,
  Category,
  Subcategory,
  City,
  Area,
  LeadAssignmentFilter,
  PagedResult,
  ManualAssignment
} from './models/lead-assignment.model';
import { LeadAssignmentService } from './services/lead-assignment.service';
import { CityService } from './services/city.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-lead-assignment',
    templateUrl: './lead-assignment.component.html',
    styleUrls: ['./lead-assignment.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,          
        ReactiveFormsModule,   
        RouterModule,           
        HeaderComponent,
        FooterComponent
    ]
})
export class LeadAssignmentComponent implements OnInit {
  Math = Math;

  assignments: LeadAssignment[] = [];
  totalCount = 0;
  totalOffered = 0;
  totalAccepted = 0;
  totalRejected = 0;
  totalPending = 0;
  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  expandedRowId: number | null = null;
  loading = false;

  // Filter form
  filterForm!: FormGroup;

  // Provider search properties
  filteredProviders: Provider[] = [];
  showProviderDropdown = false;
  selectedProvider: Provider | null = null;
  loadingProviders = false;
  providerSearchError = false;
  private providerSearchTerms = new Subject<string>();

  // City search properties
  filteredCities: City[] = [];
  showCityDropdown = false;
  selectedCity: City | null = null;
  loadingCities = false;
  citySearchError = false;
  private citySearchTerms = new Subject<string>();

  // Category search properties
  filteredCategories: Category[] = [];
  showCategoryDropdown = false;
  selectedCategory: Category | null = null;
  selectedFilterCategory: Category | null = null;
  loadingCategories = false;
  categorySearchError = false;
  private categorySearchTerms = new Subject<string>();

  // Filter options
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  cities: City[] = [];
  areas: Area[] = [];
  offerStatuses: string[] = [];
  leadTypes: string[] = [];
  leadStatuses: string[] = [];
  flowTypes: string[] = [];

  // Manual Assignment Properties
  showAssignmentModal = false;
  selectedAssignmentForAssignment: LeadAssignment | null = null;
  availableProviders: Provider[] = [];
  selectedAssignmentProvider: Provider | null = null;
  filteredAssignmentProviders: Provider[] = [];
  showAssignmentProviderDropdown = false;
  loadingAssignmentProviders = false;
  assignmentForm!: FormGroup;

  @ViewChild('providerSearchInput') providerSearchInputElement!: ElementRef;
  @ViewChild('providerDropdown') providerDropdown!: ElementRef;
  @ViewChild('citySearchInput') citySearchInputElement!: ElementRef;
  @ViewChild('cityDropdown') cityDropdown!: ElementRef;
  @ViewChild('categorySearchInput') categorySearchInputElement!: ElementRef;
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
  @ViewChild('filterCategoryDropdown') filterCategoryDropdown!: ElementRef;
  @ViewChild('assignmentProviderSearchInput') assignmentProviderSearchInputElement!: ElementRef;
  @ViewChild('assignmentProviderDropdown') assignmentProviderDropdown!: ElementRef;

  initialLoading: boolean = true;
  loadingSubcategories: boolean = false;
  loadingAreas: boolean = false;

  constructor(
    private leadService: LeadAssignmentService,
    private cityService: CityService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.initFilterForm();
    this.initAssignmentForm();
    this.setupProviderSearch();
    this.setupCitySearch();
    this.setupCategorySearch();
    this.setupAssignmentProviderSearch();
    this.loadAssignments();
  }

  // Initialize Filter Form
  initFilterForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm = this.fb.group({
      searchTerm: [''],
      providerId: [''],
      providerSearch: [''],
      citySearch: [''],
      cityId: [''],
      areaId: [''],
      categorySearch: [''],
      categoryId: [''],
      subcategoryId: [{ value: '', disabled: true }],
      offerStatus: [''],
      leadType: [''],
      leadStatus: [''],
      flowType: [''],
      startDate: [this.formatDateForInput(thirtyDaysAgo)],
      startTime: ['00:00'],
      endDate: [this.formatDateForInput(today)],
      endTime: ['23:59']
    });

    // Subscribe to city changes to load areas
    this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.loadAreas(cityId);
    });

    // Subscribe to category changes to load subcategories
    this.filterForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      this.loadSubcategories(categoryId);
    });
  }

  // Initialize Assignment Form
  initAssignmentForm(): void {
    this.assignmentForm = this.fb.group({
      providerSearch: [''],
      providerId: ['', Validators.required],
      offerWave: [1, [Validators.required, Validators.min(1)]],
      pplPrice: [''],
      isFreeLead: [false],
      offerExpiresAt: [''],
      notes: ['']
    });
  }

  // Load Filter Options
  loadFilterOptions(): void {
    // Load static options
    this.leadService.getOfferStatuses().subscribe(statuses => this.offerStatuses = statuses);
    this.leadService.getLeadTypes().subscribe(types => this.leadTypes = types);
    this.leadService.getLeadStatuses().subscribe(statuses => this.leadStatuses = statuses);
    this.leadService.getFlowTypes().subscribe(types => this.flowTypes = types);

    // Load dynamic options
    this.leadService.getCategories().subscribe(categories => this.categories = categories);
    this.leadService.getCities().subscribe(cities => this.cities = cities);
  }

  // Setup Provider Search
  setupProviderSearch(): void {
    this.filterForm.get('providerSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          if (searchTerm && this.selectedProvider) {
            const currentDisplay = `${this.selectedProvider.displayName} (${this.selectedProvider.email})`;
            if (searchTerm !== currentDisplay) {
              this.clearProviderSelection();
            }
          }

          if (!searchTerm?.trim()) {
            this.filteredProviders = [];
            this.showProviderDropdown = false;
            this.clearProviderSelection();
          }
        }),
        switchMap(searchTerm => {
          if (!searchTerm?.trim()) {
            this.loadingProviders = false;
            return of([]);
          }

          this.loadingProviders = true;
          this.providerSearchError = false;

          return this.leadService.searchProviders(searchTerm.trim(), 10).pipe(
            catchError(error => {
              console.error('Error searching providers:', error);
              this.providerSearchError = true;
              this.loadingProviders = false;
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (providers) => {
          this.filteredProviders = providers;
          this.loadingProviders = false;
          this.showProviderDropdown = providers.length > 0;
        },
        error: (error) => {
          console.error('Error in search subscription:', error);
          this.loadingProviders = false;
          this.providerSearchError = true;
        }
      });
  }

  // Setup Assignment Provider Search
  setupAssignmentProviderSearch(): void {
    this.assignmentForm.get('providerSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          if (searchTerm && this.selectedAssignmentProvider) {
            const currentDisplay = `${this.selectedAssignmentProvider.displayName} (${this.selectedAssignmentProvider.email})`;
            if (searchTerm !== currentDisplay) {
              this.clearAssignmentProviderSelection();
            }
          }

          if (!searchTerm?.trim()) {
            this.filteredAssignmentProviders = [];
            this.showAssignmentProviderDropdown = false;
            this.clearAssignmentProviderSelection();
          }
        }),
        switchMap(searchTerm => {
          if (!searchTerm?.trim()) {
            this.loadingAssignmentProviders = false;
            return of([]);
          }

          this.loadingAssignmentProviders = true;
          return this.leadService.searchProviders(searchTerm.trim(), 10).pipe(
            catchError(error => {
              console.error('Error searching providers:', error);
              this.loadingAssignmentProviders = false;
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (providers) => {
          this.filteredAssignmentProviders = providers;
          this.loadingAssignmentProviders = false;
          this.showAssignmentProviderDropdown = providers.length > 0;
        },
        error: (error) => {
          console.error('Error in provider search:', error);
          this.loadingAssignmentProviders = false;
        }
      });
  }

  // Setup Category Search
  setupCategorySearch(): void {
    this.filterForm.get('categorySearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          if (searchTerm && this.selectedFilterCategory) {
            if (searchTerm !== this.selectedFilterCategory.name) {
              this.clearFilterCategorySelection();
            }
          }

          if (!searchTerm || !searchTerm.trim()) {
            this.filteredCategories = [];
            this.showCategoryDropdown = false;
            this.clearFilterCategorySelection();
          }
        })
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchCategories(searchTerm);
        }
      });
  }

  // Setup City Search
  setupCitySearch(): void {
    this.filterForm.get('citySearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          if (searchTerm && this.selectedCity) {
            if (searchTerm !== this.selectedCity.name) {
              this.clearCitySelection();
            }
          }

          if (!searchTerm || !searchTerm.trim()) {
            this.filteredCities = [];
            this.showCityDropdown = false;
            this.clearCitySelection();
          }
        })
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchCities(searchTerm);
        }
      });
  }

  // Search Categories
  searchCategories(searchTerm: string): void {
    this.loadingCategories = true;
    this.categorySearchError = false;

    this.leadService.searchCategories(searchTerm.trim(), 10).subscribe({
      next: (categories) => {
        this.filteredCategories = categories;
        this.loadingCategories = false;
        if (categories.length > 0) {
          this.showCategoryDropdown = true;
        }
      },
      error: (error) => {
        console.error('Error searching categories:', error);
        this.loadingCategories = false;
        this.categorySearchError = true;
        this.filteredCategories = [];
      }
    });
  }

  // Search Cities
  searchCities(searchTerm: string): void {
    this.loadingCities = true;
    this.citySearchError = false;

    this.cityService.searchCities(searchTerm.trim(), 10).subscribe({
      next: (cities) => {
        this.filteredCities = cities;
        this.loadingCities = false;
        if (cities.length > 0) {
          this.showCityDropdown = true;
        }
      },
      error: (error) => {
        console.error('Error searching cities:', error);
        this.loadingCities = false;
        this.citySearchError = true;
        this.filteredCities = [];
      }
    });
  }

  // Load Subcategories
  loadSubcategories(categoryId?: number): void {
    console.log('Loading subcategories for category ID:', categoryId);
    
    if (categoryId) {
      this.loadingSubcategories = true;
      this.disableSubcategoryControl();
      
      this.leadService.getSubcategoriesByCategory(categoryId).subscribe({
        next: (subcategories) => {
          console.log('Subcategories API response:', subcategories);
          this.subcategories = subcategories;
          this.loadingSubcategories = false;
          
          if (subcategories && subcategories.length > 0) {
            this.enableSubcategoryControl();
            console.log('Subcategories loaded successfully:', subcategories.length);
          } else {
            console.log('No subcategories found for category ID:', categoryId);
            this.disableSubcategoryControl();
          }
        },
        error: (error) => {
          console.error('Error loading subcategories:', error);
          this.subcategories = [];
          this.loadingSubcategories = false;
          this.disableSubcategoryControl();
        }
      });
    } else {
      console.log('No category ID provided, clearing subcategories');
      this.subcategories = [];
      this.loadingSubcategories = false;
      this.disableSubcategoryControl();
    }
  }

  // Load Areas
  loadAreas(cityId?: number): void {
    if (cityId) {
      this.loadingAreas = true;
      this.leadService.getAreasByCity(cityId).subscribe({
        next: (areas) => {
          this.areas = areas;
          this.loadingAreas = false;
        },
        error: (error) => {
          console.error('Error loading areas:', error);
          this.areas = [];
          this.loadingAreas = false;
        }
      });
    } else {
      this.areas = [];
      this.loadingAreas = false;
    }
  }

  // Category Search Input Handlers
  onCategorySearchInput(): void {
    const searchTerm = this.filterForm.get('categorySearch')?.value;

    if (searchTerm && searchTerm.trim()) {
      if (this.selectedFilterCategory) {
        if (searchTerm !== this.selectedFilterCategory.name) {
          this.clearFilterCategorySelection();
        }
      }
      this.showCategoryDropdown = true;
    } else {
      this.filteredCategories = [];
      this.showCategoryDropdown = false;
      this.clearFilterCategorySelection();
    }
  }

  onCategorySearchClick(): void {
    const searchTerm = this.filterForm.get('categorySearch')?.value;
    if (searchTerm && searchTerm.trim() && this.filteredCategories.length > 0) {
      this.showCategoryDropdown = true;
    }
  }

  onCategoryInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setTimeout(() => {
          const firstItem = document.querySelector('.category-dropdown-item');
          if (firstItem instanceof HTMLElement) firstItem.focus();
        });
        break;
      case 'Escape':
        this.showCategoryDropdown = false;
        break;
      case 'Enter':
        if (this.filteredCategories.length === 1 && !this.selectedFilterCategory) {
          this.selectFilterCategory(this.filteredCategories[0]);
        }
        break;
    }
  }

  // City Search Input Handlers
  onCitySearchInput(): void {
    const searchTerm = this.filterForm.get('citySearch')?.value;

    if (searchTerm && searchTerm.trim()) {
      if (this.selectedCity) {
        if (searchTerm !== this.selectedCity.name) {
          this.clearCitySelection();
        }
      }
      this.showCityDropdown = true;
    } else {
      this.filteredCities = [];
      this.showCityDropdown = false;
      this.clearCitySelection();
    }
  }

  onCitySearchClick(): void {
    const searchTerm = this.filterForm.get('citySearch')?.value;
    if (searchTerm && searchTerm.trim() && this.filteredCities.length > 0) {
      this.showCityDropdown = true;
    }
  }

  onCityInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setTimeout(() => {
          const firstItem = document.querySelector('.city-dropdown-item');
          if (firstItem instanceof HTMLElement) firstItem.focus();
        });
        break;
      case 'Escape':
        this.showCityDropdown = false;
        break;
      case 'Enter':
        if (this.filteredCities.length === 1 && !this.selectedCity) {
          this.selectCity(this.filteredCities[0]);
        }
        break;
    }
  }

  // Provider Search Input Handlers
  onProviderInputClick(): void {
    const searchTerm = this.filterForm.get('providerSearch')?.value;
    if (searchTerm?.trim() && !this.selectedProvider && this.filteredProviders.length > 0) {
      this.showProviderDropdown = true;
    }
  }

  onProviderInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setTimeout(() => {
          const firstItem = document.querySelector('.provider-dropdown-item');
          if (firstItem instanceof HTMLElement) firstItem.focus();
        });
        break;
      case 'Escape':
        this.showProviderDropdown = false;
        break;
      case 'Enter':
        if (this.filteredProviders.length === 1 && !this.selectedProvider) {
          this.selectProvider(this.filteredProviders[0]);
        }
        break;
    }
  }

  // Assignment Provider Search Handlers
  onAssignmentProviderInputClick(): void {
    const searchTerm = this.assignmentForm.get('providerSearch')?.value;
    if (searchTerm?.trim() && !this.selectedAssignmentProvider && this.filteredAssignmentProviders.length > 0) {
      this.showAssignmentProviderDropdown = true;
    }
  }

  onAssignmentProviderInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setTimeout(() => {
          const firstItem = document.querySelector('.assignment-provider-dropdown-item');
          if (firstItem instanceof HTMLElement) firstItem.focus();
        });
        break;
      case 'Escape':
        this.showAssignmentProviderDropdown = false;
        break;
      case 'Enter':
        if (this.filteredAssignmentProviders.length === 1 && !this.selectedAssignmentProvider) {
          this.selectAssignmentProvider(this.filteredAssignmentProviders[0]);
        }
        break;
    }
  }

  // Selection Methods
  selectFilterCategory(category: Category): void {
    console.log('Category selected:', category);
    this.selectedFilterCategory = category;
    this.filterForm.patchValue({
      categoryId: category.id,
      categorySearch: category.name
    }, { emitEvent: true });
    this.showCategoryDropdown = false;
    this.filteredCategories = [];
  }

  selectCity(city: City): void {
    this.selectedCity = city;
    this.filterForm.patchValue({
      cityId: city.id,
      citySearch: city.name
    });
    this.showCityDropdown = false;
    this.filteredCities = [];
    this.loadAreas(city.id);
    this.applyFilters();
  }

  selectProvider(provider: Provider): void {
    this.selectedProvider = provider;
    this.filterForm.patchValue({
      providerId: provider.id,
      providerSearch: `${provider.displayName} (${provider.email})`
    }, { emitEvent: false });
    this.showProviderDropdown = false;
    this.filteredProviders = [];
    this.applyFilters();
  }

  selectAssignmentProvider(provider: Provider): void {
    this.selectedAssignmentProvider = provider;
    this.assignmentForm.patchValue({
      providerId: provider.id,
      providerSearch: `${provider.displayName || provider.businessName} (${provider.email})`
    }, { emitEvent: false });
    this.showAssignmentProviderDropdown = false;
    this.filteredAssignmentProviders = [];
  }

  // Clear Selection Methods
  clearFilterCategorySelection(): void {
    console.log('Clearing category selection');
    this.selectedFilterCategory = null;
    this.filterForm.patchValue({
      categoryId: null,
      categorySearch: ''
    }, { emitEvent: true });
    this.filteredCategories = [];
    this.showCategoryDropdown = false;
  }

  clearCitySelection(): void {
    this.selectedCity = null;
    this.filterForm.patchValue({
      cityId: null,
      citySearch: ''
    });
    this.filteredCities = [];
    this.showCityDropdown = false;
    this.areas = [];
    this.applyFilters();
  }

  clearProviderSelection(): void {
    this.selectedProvider = null;
    this.filterForm.patchValue({
      providerId: '',
      providerSearch: ''
    }, { emitEvent: false });
    this.filteredProviders = [];
    this.showProviderDropdown = false;
    this.applyFilters();
  }

  clearAssignmentProviderSelection(): void {
    this.selectedAssignmentProvider = null;
    this.assignmentForm.patchValue({
      providerId: '',
      providerSearch: ''
    }, { emitEvent: false });
    this.filteredAssignmentProviders = [];
    this.showAssignmentProviderDropdown = false;
  }

  // Control Methods
  enableSubcategoryControl(): void {
    this.filterForm.get('subcategoryId')?.enable({ emitEvent: false });
  }

  disableSubcategoryControl(): void {
    this.filterForm.get('subcategoryId')?.disable({ emitEvent: false });
    this.filterForm.patchValue({ subcategoryId: '' }, { emitEvent: false });
  }

  // Date Formatting Methods
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStartDateTime(): string | undefined {
    const startDate = this.filterForm.get('startDate')?.value;
    const startTime = this.filterForm.get('startTime')?.value || '00:00';

    if (!startDate) return undefined;
    const dateTime = new Date(startDate + 'T' + startTime + ':00');
    return dateTime.toISOString();
  }

  getEndDateTime(): string | undefined {
    const endDate = this.filterForm.get('endDate')?.value;
    const endTime = this.filterForm.get('endTime')?.value || '23:59';

    if (!endDate) return undefined;
    const dateTime = new Date(endDate + 'T' + endTime + ':00');
    return dateTime.toISOString();
  }

  // Load Assignments
  loadAssignments(): void {
    this.loading = true;

    const formValues = this.filterForm.value;
    const filter: LeadAssignmentFilter = {
      searchTerm: formValues.searchTerm || undefined,
      providerId: formValues.providerId || undefined,
      cityId: formValues.cityId || undefined,
      areaId: formValues.areaId || undefined,
      categoryId: formValues.categoryId || undefined,
      subcategoryId: formValues.subcategoryId || undefined,
      offerStatus: formValues.offerStatus || undefined,
      leadType: formValues.leadType || undefined,
      leadStatus: formValues.leadStatus || undefined,
      flowType: formValues.flowType || undefined,
      startDate: this.getStartDateTime(),
      endDate: this.getEndDateTime(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.leadService.getLeadAssignments(filter).subscribe({
      next: (res: PagedResult<LeadAssignment>) => {
        this.assignments = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.loading = false;
        this.initialLoading = false;
      }
    });
  }

  // Calculate Statistics
  calculateStats(): void {
    this.totalOffered = this.assignments.filter(a => a.offerStatus?.toLowerCase() === 'offered').length;
    this.totalAccepted = this.assignments.filter(a => a.offerStatus?.toLowerCase() === 'committed').length;
    this.totalRejected = this.assignments.filter(a => a.offerStatus?.toLowerCase() === 'dismissed').length;
    this.totalPending = this.assignments.filter(a =>
      ['offered', 'pending'].includes(a.offerStatus?.toLowerCase() || '')
    ).length;
  }

  // Modal Methods
  openAssignmentModal(assignment: LeadAssignment): void {
    this.selectedAssignmentForAssignment = assignment;
    this.showAssignmentModal = true;
    this.resetAssignmentForm();
  }

  closeAssignmentModal(): void {
    this.showAssignmentModal = false;
    this.selectedAssignmentForAssignment = null;
    this.resetAssignmentForm();
    this.filteredAssignmentProviders = [];
    this.selectedAssignmentProvider = null;
  }

  resetAssignmentForm(): void {
    this.assignmentForm.reset({
      offerWave: 1,
      isFreeLead: false
    });
  }

  // Assignment Method
  assignToProvider(): void {
    if (!this.selectedAssignmentForAssignment || this.assignmentForm.invalid) {
      Object.keys(this.assignmentForm.controls).forEach(key => {
        this.assignmentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.assignmentForm.value;
    const assignment: ManualAssignment = {
      leadId: this.selectedAssignmentForAssignment.leadId,
      providerId: formValue.providerId,
      offerWave: formValue.offerWave,
      pplPrice: formValue.pplPrice ? Number(formValue.pplPrice) : undefined,
      isFreeLead: formValue.isFreeLead,
      offerExpiresAt: formValue.offerExpiresAt ? new Date(formValue.offerExpiresAt).toISOString() : undefined,
      notes: formValue.notes
    };

    this.leadService.assignToProvider(assignment).subscribe({
      next: (response) => {
        this.closeAssignmentModal();
        alert('Lead assigned successfully!');
        this.loadAssignments();
      },
      error: (error) => {
        console.error('Error assigning lead:', error);
        alert(error.error?.error || 'Failed to assign lead');
      }
    });
  }

  // Click Outside Handler
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Provider dropdown
    if (this.providerSearchInputElement?.nativeElement?.contains(event.target) ||
      this.providerDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // City dropdown
    if (this.citySearchInputElement?.nativeElement?.contains(event.target) ||
      this.cityDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // Category dropdown
    if (this.categorySearchInputElement?.nativeElement?.contains(event.target) ||
      this.categoryDropdown?.nativeElement?.contains(event.target) ||
      this.filterCategoryDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // Assignment provider dropdown
    if (this.assignmentProviderSearchInputElement?.nativeElement?.contains(event.target) ||
      this.assignmentProviderDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    this.showProviderDropdown = false;
    this.showCityDropdown = false;
    this.showCategoryDropdown = false;
    this.showAssignmentProviderDropdown = false;
  }

  // Utility Methods
  getOfferStatusColor(status: string): string {
    return this.leadService.getOfferStatusColor(status);
  }

  getLeadTypeColor(type: string): string {
    return this.leadService.getLeadTypeColor(type);
  }

  getProviderTierColor(tier: string): string {
    return this.leadService.getProviderTierColor(tier);
  }

  formatCurrency(amount?: number, currency: string = 'INR'): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleRow(id: number): void {
    this.expandedRowId = this.expandedRowId === id ? null : id;
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadAssignments();
  }

  resetFilters(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm.reset({
      searchTerm: '',
      providerId: '',
      providerSearch: '',
      citySearch: '',
      cityId: '',
      areaId: '',
      categorySearch: '',
      categoryId: '',
      subcategoryId: '',
      offerStatus: '',
      leadType: '',
      leadStatus: '',
      flowType: '',
      startDate: this.formatDateForInput(thirtyDaysAgo),
      startTime: '00:00',
      endDate: this.formatDateForInput(today),
      endTime: '23:59'
    });

    this.clearProviderSelection();
    this.clearCitySelection();
    this.clearFilterCategorySelection();
    this.areas = [];
    this.subcategories = [];
    this.pageNumber = 1;
    this.loadAssignments();
  }

  setDateRange(range: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth'): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let startDate: Date = today;
    let endDate: Date = today;

    switch (range) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = yesterday;
        endDate = yesterday;
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = today;
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        endDate = today;
        break;
      case 'thismonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'lastmonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }

    this.filterForm.patchValue({
      startDate: this.formatDateForInput(startDate),
      startTime: '00:00',
      endDate: this.formatDateForInput(endDate),
      endTime: '23:59'
    });

    this.applyFilters();
  }

  changePage(delta: number): void {
    const newPage = this.pageNumber + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadAssignments();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadAssignments();
    }
  }

  getStartIndex(): number {
    return ((this.pageNumber - 1) * this.pageSize) + 1;
  }

  getEndIndex(): number {
    const end = this.pageNumber * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.pageNumber - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getActiveFilters(): number {
    let count = 0;
    const formValues = this.filterForm.value;

    if (formValues.searchTerm) count++;
    if (formValues.providerId) count++;
    if (formValues.cityId) count++;
    if (formValues.areaId) count++;
    if (formValues.categoryId) count++;
    if (formValues.subcategoryId) count++;
    if (formValues.offerStatus) count++;
    if (formValues.leadType) count++;
    if (formValues.leadStatus) count++;
    if (formValues.flowType) count++;
    if (formValues.startDate) count++;
    if (formValues.endDate) count++;

    return count;
  }
}