import { Component, OnInit, ViewChild, ElementRef, HostListener, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { LeadService } from './services/lead.service';
import {
    Lead,
    LeadFilter,
    PagedResult,
    Category,
    Subcategory,
    City,
    Area,
    Customer,
    CreateLeadDto,
    UpdateLeadDto,
    ManualAssignment,
    Provider
} from './models/lead.model';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-lead-list',
    templateUrl: './lead-list.component.html',
    styleUrls: ['./lead-list.component.css'],
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
export class LeadListComponent implements OnInit {
    Math = Math;

    leads: Lead[] = [];
    selectedLead: Lead | null = null;
    totalCount = 0;
    pageNumber = 1;
    pageSize = 25;
    totalPages = 0;
    expandedRowId: number | null = null;
    loading = false;
    initialLoading = true;

    // Modal states
    showViewModal = false;
    showCreateModal = false;
    showEditModal = false;
    showAssignmentModal = false;

    // Stats
    totalB2cLeads = 0;
    totalB2bLeads = 0;
    totalInstantLeads = 0;

    // Filter form
    filterForm!: FormGroup;

    // Create/Edit form
    leadForm!: FormGroup;
    isSubmitting = false;

    // Assignment form
    assignmentForm!: FormGroup;
    selectedLeadForAssignment: Lead | null = null;

    // Provider search properties for assignment
    filteredAssignmentProviders: Provider[] = [];
    showAssignmentProviderDropdown = false;
    selectedAssignmentProvider: Provider | null = null;
    loadingAssignmentProviders = false;
    providerSearchError = false;

    // Category search properties
    filteredCategories: Category[] = [];
    showCategoryDropdown = false;
    selectedCategory: Category | null = null;
    loadingCategories = false;
    categorySearchError = false;

    // City search properties
    filteredCities: City[] = [];
    showCityDropdown = false;
    selectedCity: City | null = null;
    loadingCities = false;
    citySearchError = false;

    // Customer search properties
    filteredCustomers: Customer[] = [];
    showCustomerDropdown = false;
    selectedCustomer: Customer | null = null;
    loadingCustomers = false;
    customerSearchError = false;

    // Filter options
    categories: Category[] = [];
    subcategories: Subcategory[] = [];
    cities: City[] = [];
    areas: Area[] = [];
    leadTypes: string[] = [];
    flowTypes: string[] = [];
    confirmedStatuses: string[] = [];
    timePreferences: string[] = [];
    sources: string[] = [];

    @ViewChild('categorySearchInput') categorySearchInputElement!: ElementRef;
    @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
    @ViewChild('citySearchInput') citySearchInputElement!: ElementRef;
    @ViewChild('cityDropdown') cityDropdown!: ElementRef;
    @ViewChild('customerSearchInput') customerSearchInputElement!: ElementRef;
    @ViewChild('customerDropdown') customerDropdown!: ElementRef;
    @ViewChild('assignmentProviderSearchInput') assignmentProviderSearchInputElement!: ElementRef;
    @ViewChild('assignmentProviderDropdown') assignmentProviderDropdown!: ElementRef;

    constructor(
        @Inject(FormBuilder) private fb: FormBuilder,
        private leadService: LeadService
    ) { }

    ngOnInit(): void {
        this.loadFilterOptions();
        this.initFilterForm();
        this.initLeadForm();
        this.initAssignmentForm();
        this.setupCategorySearch();
        this.setupCitySearch();
        this.setupCustomerSearch();
        this.setupAssignmentProviderSearch();
        this.loadLeads();
    }

    // Custom Validators - FIXED: Start date can be in past, End date cannot be in past or before start date
    dateRangeValidator(group: AbstractControl): ValidationErrors | null {
        const startDate = group.get('scheduledStart')?.value;
        const endDate = group.get('scheduledEnd')?.value;

        // If no end date, no validation needed
        if (!endDate) {
            return null;
        }

        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if end date is less than today (can't be in the past)
        if (end < today) {
            return { endDatePast: true };
        }

        // If start date exists, check if end date is less than start date
        if (startDate) {
            const start = new Date(startDate);
            if (end < start) {
                return { endDateBeforeStart: true };
            }
        }

        return null;
    }

    budgetRangeValidator(group: AbstractControl): ValidationErrors | null {
        const budgetMin = group.get('budgetMin')?.value;
        const budgetMax = group.get('budgetMax')?.value;

        if (!budgetMin || !budgetMax) {
            return null;
        }

        if (budgetMin < 0 || budgetMax < 0) {
            return { negativeBudget: true };
        }

        if (budgetMax < budgetMin) {
            return { maxLessThanMin: true };
        }

        return null;
    }

    loadFilterOptions(): void {
        // Load static options
        this.leadService.getLeadTypes().subscribe({
            next: (types) => this.leadTypes = types,
            error: (error) => console.error('Error loading lead types:', error)
        });

        this.leadService.getFlowTypes().subscribe({
            next: (types) => this.flowTypes = types,
            error: (error) => console.error('Error loading flow types:', error)
        });

        this.leadService.getTimePreferences().subscribe({
            next: (prefs) => this.timePreferences = prefs,
            error: (error) => console.error('Error loading time preferences:', error)
        });

        this.leadService.getSources().subscribe({
            next: (sources) => this.sources = sources,
            error: (error) => console.error('Error loading sources:', error)
        });

        // Load dynamic options
        this.leadService.getCategories().subscribe({
            next: (categories) => this.categories = categories,
            error: (error) => console.error('Error loading categories:', error)
        });

        this.leadService.getCities().subscribe({
            next: (cities) => this.cities = cities,
            error: (error) => console.error('Error loading cities:', error)
        });
    }

    initFilterForm(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.filterForm = this.fb.group({
            searchTerm: [''],
            categorySearch: [''],
            categoryId: [''],
            subcategoryId: [{ value: '', disabled: true }],
            citySearch: [''],
            cityId: [''],
            areaId: [''],
            leadType: [''],
            flowType: [''],
            confirmedStatus: [''],
            startDate: [this.formatDateForInput(thirtyDaysAgo)],
            startTime: ['00:00'],
            endDate: [this.formatDateForInput(today)],
            endTime: ['23:59']
        });

        // Subscribe to category changes to load subcategories
        this.filterForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
            this.loadSubcategories(categoryId);
        });

        // Subscribe to city changes to load areas
        this.filterForm.get('cityId')?.valueChanges.subscribe(cityId => {
            this.loadAreas(cityId);
        });
    }

    initLeadForm(): void {
    this.leadForm = this.fb.group({
        customerSearch: [''],
        customerUserId: [''],
        leadType: ['', Validators.required],
        description: ['', Validators.required],
        budgetMin: [''],
        budgetMax: [''],
        timePreference: [''],
        scheduledStart: [''],
        scheduledEnd: [''],
        // isInstant: [false], // Removed in new schema
        source: ['', Validators.required],
        flowType: ['', Validators.required],
        categorySearch: [''],
        categoryId: [''],
        subcategoryId: [{ value: '', disabled: true }],
        citySearch: [''],
        cityId: [''],
        areaId: [''],
        pincode: ['']
    }, { 
        validators: [this.dateRangeValidator, this.budgetRangeValidator] 
    });

    // Subscribe to category changes in form
    this.leadForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
        this.loadFormSubcategories(categoryId);
    });

    // Subscribe to city changes in form
    this.leadForm.get('cityId')?.valueChanges.subscribe(cityId => {
        this.loadFormAreas(cityId);
    });
}
    initAssignmentForm(): void {
        this.assignmentForm = this.fb.group({
            providerSearch: [''],
            providerId: ['', Validators.required],
            offerWave: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
            pplPrice: ['', [Validators.min(0), Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
            isFreeLead: [false],
            offerExpiresAt: ['', this.futureDateValidator],
            notes: ['', [Validators.maxLength(500)]]
        });
    }

    futureDateValidator(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        const selectedDate = new Date(control.value);
        const now = new Date();

        if (selectedDate < now) {
            return { pastDate: true };
        }

        return null;
    }

    // Check if lead is expired
    isLeadExpired(lead: Lead): boolean {
        if (!lead.scheduledEnd) return false;

        const scheduledEnd = new Date(lead.scheduledEnd);
        const now = new Date();

        return scheduledEnd < now;
    }

    // Check if assignment should be disabled
    isAssignmentDisabled(lead: Lead): boolean {
        return this.isLeadExpired(lead);
    }

    // Setup Assignment Provider Search
    setupAssignmentProviderSearch(): void {
        this.assignmentForm.get('providerSearch')?.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchTerm => {
                    if (!searchTerm?.trim()) {
                        this.loadingAssignmentProviders = false;
                        return of([]);
                    }

                    this.loadingAssignmentProviders = true;
                    this.providerSearchError = false;

                    return this.leadService.searchProviders(searchTerm.trim(), 10).pipe(
                        catchError(error => {
                            console.error('Error searching providers:', error);
                            this.providerSearchError = true;
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
                    this.providerSearchError = true;
                }
            });
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

    selectAssignmentProvider(provider: Provider): void {
        this.selectedAssignmentProvider = provider;
        this.assignmentForm.patchValue({
            providerId: provider.id,
            providerSearch: `${provider.displayName || provider.businessName} (${provider.email})`
        }, { emitEvent: false });
        this.showAssignmentProviderDropdown = false;
        this.filteredAssignmentProviders = [];
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

    // Setup customer search
    setupCustomerSearch(): void {
        this.leadForm.get('customerSearch')?.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {
                if (searchTerm && searchTerm.trim()) {
                    this.searchCustomers(searchTerm);
                } else {
                    this.filteredCustomers = [];
                    this.showCustomerDropdown = false;
                }
            });
    }

    searchCustomers(searchTerm: string): void {
        this.loadingCustomers = true;
        this.customerSearchError = false;

        this.leadService.searchCustomers(searchTerm.trim(), 10).subscribe({
            next: (customers) => {
                this.filteredCustomers = customers;
                this.loadingCustomers = false;
                if (customers && customers.length > 0) {
                    this.showCustomerDropdown = true;
                } else {
                    this.showCustomerDropdown = false;
                }
            },
            error: (error) => {
                console.error('Error searching customers:', error);
                this.loadingCustomers = false;
                this.customerSearchError = true;
                this.filteredCustomers = [];
            }
        });
    }

    onCustomerSearchInput(): void {
        const searchTerm = this.leadForm.get('customerSearch')?.value;
        if (searchTerm && searchTerm.trim()) {
            if (this.selectedCustomer && searchTerm !== this.getCustomerDisplayName(this.selectedCustomer)) {
                this.clearCustomerSelection();
            }
            this.showCustomerDropdown = true;
        } else {
            this.filteredCustomers = [];
            this.showCustomerDropdown = false;
            this.clearCustomerSelection();
        }
    }

    onCustomerSearchClick(): void {
        const searchTerm = this.leadForm.get('customerSearch')?.value;
        if (searchTerm && searchTerm.trim() && this.filteredCustomers.length > 0) {
            this.showCustomerDropdown = true;
        }
    }

    onCustomerInputKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setTimeout(() => {
                    const firstItem = document.querySelector('.customer-dropdown-item');
                    if (firstItem instanceof HTMLElement) firstItem.focus();
                });
                break;
            case 'Escape':
                this.showCustomerDropdown = false;
                break;
            case 'Enter':
                if (this.filteredCustomers.length === 1 && !this.selectedCustomer) {
                    this.selectCustomer(this.filteredCustomers[0]);
                }
                break;
        }
    }

    selectCustomer(customer: Customer): void {
        this.selectedCustomer = customer;
        this.leadForm.patchValue({
            customerUserId: customer.id,
            customerSearch: this.getCustomerDisplayName(customer)
        }, { emitEvent: false });
        this.showCustomerDropdown = false;
        this.filteredCustomers = [];
    }

    clearCustomerSelection(): void {
        this.selectedCustomer = null;
        this.leadForm.patchValue({
            customerUserId: null,
            customerSearch: ''
        }, { emitEvent: false });
        this.filteredCustomers = [];
        this.showCustomerDropdown = false;
    }

    getCustomerDisplayName(customer: Customer): string {
        if (!customer) return '';
        const displayName = customer.name || 'Unknown';
        const email = customer.email ? ` (${customer.email})` : '';
        return `${displayName}${email}`;
    }

    // Setup category search
    setupCategorySearch(): void {
        this.filterForm.get('categorySearch')?.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {
                if (searchTerm && searchTerm.trim()) {
                    this.searchCategories(searchTerm);
                } else {
                    this.filteredCategories = [];
                    this.showCategoryDropdown = false;
                }
            });
    }

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

    onCategorySearchInput(): void {
        const searchTerm = this.filterForm.get('categorySearch')?.value;
        if (searchTerm && searchTerm.trim()) {
            if (this.selectedCategory && searchTerm !== this.selectedCategory.name) {
                this.clearCategorySelection();
            }
            this.showCategoryDropdown = true;
        } else {
            this.filteredCategories = [];
            this.showCategoryDropdown = false;
            this.clearCategorySelection();
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
                if (this.filteredCategories.length === 1 && !this.selectedCategory) {
                    this.selectCategory(this.filteredCategories[0]);
                }
                break;
        }
    }

    selectCategory(category: Category): void {
        this.selectedCategory = category;
        this.filterForm.patchValue({
            categoryId: category.id,
            categorySearch: category.name
        }, { emitEvent: true });
        this.showCategoryDropdown = false;
        this.filteredCategories = [];
    }

    clearCategorySelection(): void {
        this.selectedCategory = null;
        this.filterForm.patchValue({
            categoryId: null,
            categorySearch: ''
        }, { emitEvent: true });
        this.filteredCategories = [];
        this.showCategoryDropdown = false;
        this.subcategories = [];
    }

    // Form category search methods
    onFormCategorySearchInput(): void {
        const searchTerm = this.leadForm.get('categorySearch')?.value;
        if (searchTerm && searchTerm.trim()) {
            this.searchFormCategories(searchTerm);
            this.showCategoryDropdown = true;
        } else {
            this.filteredCategories = [];
            this.showCategoryDropdown = false;
        }
    }

    searchFormCategories(searchTerm: string): void {
        this.loadingCategories = true;
        this.leadService.searchCategories(searchTerm.trim(), 10).subscribe({
            next: (categories) => {
                this.filteredCategories = categories;
                this.loadingCategories = false;
            },
            error: (error) => {
                console.error('Error searching categories:', error);
                this.loadingCategories = false;
                this.filteredCategories = [];
            }
        });
    }

    selectFormCategory(category: Category): void {
        this.leadForm.patchValue({
            categoryId: category.id,
            categorySearch: category.name
        }, { emitEvent: true });
        this.showCategoryDropdown = false;
        this.filteredCategories = [];
    }

    // Subcategory methods
    loadingSubcategories = false;

    loadSubcategories(categoryId?: number): void {
        if (categoryId) {
            this.loadingSubcategories = true;
            this.disableSubcategoryControl();

            this.leadService.getSubcategoriesByCategory(categoryId).subscribe({
                next: (subcategories) => {
                    this.subcategories = subcategories;
                    this.loadingSubcategories = false;
                    if (subcategories && subcategories.length > 0) {
                        this.enableSubcategoryControl();
                    } else {
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
            this.subcategories = [];
            this.loadingSubcategories = false;
            this.disableSubcategoryControl();
        }
    }

    loadFormSubcategories(categoryId?: number): void {
        if (categoryId) {
            this.loadingSubcategories = true;
            this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });

            this.leadService.getSubcategoriesByCategory(categoryId).subscribe({
                next: (subcategories) => {
                    this.subcategories = subcategories;
                    this.loadingSubcategories = false;
                    if (subcategories && subcategories.length > 0) {
                        this.leadForm.get('subcategoryId')?.enable({ emitEvent: false });
                    } else {
                        this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });
                        this.leadForm.patchValue({ subcategoryId: '' }, { emitEvent: false });
                    }
                },
                error: (error) => {
                    console.error('Error loading subcategories:', error);
                    this.subcategories = [];
                    this.loadingSubcategories = false;
                    this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });
                    this.leadForm.patchValue({ subcategoryId: '' }, { emitEvent: false });
                }
            });
        } else {
            this.subcategories = [];
            this.loadingSubcategories = false;
            this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });
            this.leadForm.patchValue({ subcategoryId: '' }, { emitEvent: false });
        }
    }

    enableSubcategoryControl(): void {
        this.filterForm.get('subcategoryId')?.enable({ emitEvent: false });
    }

    disableSubcategoryControl(): void {
        this.filterForm.get('subcategoryId')?.disable({ emitEvent: false });
        this.filterForm.patchValue({ subcategoryId: '' }, { emitEvent: false });
    }

    // Setup city search
    setupCitySearch(): void {
        this.filterForm.get('citySearch')?.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {
                if (searchTerm && searchTerm.trim()) {
                    this.searchCities(searchTerm);
                } else {
                    this.filteredCities = [];
                    this.showCityDropdown = false;
                }
            });
    }

    searchCities(searchTerm: string): void {
        this.loadingCities = true;
        this.citySearchError = false;

        this.leadService.getCities().subscribe({
            next: (cities) => {
                this.filteredCities = cities.filter(c =>
                    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice(0, 10);
                this.loadingCities = false;
                if (this.filteredCities.length > 0) {
                    this.showCityDropdown = true;
                } else {
                    this.showCityDropdown = false;
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

    onCitySearchInput(): void {
        const searchTerm = this.filterForm.get('citySearch')?.value;

        if (searchTerm && searchTerm.trim()) {
            if (this.selectedCity && searchTerm !== this.selectedCity.name) {
                this.clearCitySelection();
            }
            this.searchCities(searchTerm);
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

    selectCity(city: City): void {
        this.selectedCity = city;
        this.filterForm.patchValue({
            cityId: city.id,
            citySearch: city.name
        });
        this.showCityDropdown = false;
        this.filteredCities = [];
        this.loadAreas(city.id);
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
    }

    // Form city search methods
    onFormCitySearchInput(): void {
        const searchTerm = this.leadForm.get('citySearch')?.value;

        if (searchTerm && searchTerm.trim()) {
            this.searchFormCities(searchTerm);
            this.showCityDropdown = true;
        } else {
            this.filteredCities = [];
            this.showCityDropdown = false;
        }
    }

    searchFormCities(searchTerm: string): void {
        this.loadingCities = true;
        this.leadService.getCities().subscribe({
            next: (cities) => {
                this.filteredCities = cities.filter(c =>
                    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice(0, 10);
                this.loadingCities = false;
            },
            error: (error) => {
                console.error('Error searching cities:', error);
                this.loadingCities = false;
                this.filteredCities = [];
            }
        });
    }

    selectFormCity(city: City): void {
        this.leadForm.patchValue({
            cityId: city.id,
            citySearch: city.name
        });
        this.showCityDropdown = false;
        this.filteredCities = [];
        this.loadFormAreas(city.id);
    }

    loadingAreas = false;

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

    loadFormAreas(cityId?: number): void {
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

    formatDateForInput(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    formatDateTimeForInput(date?: string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
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

    loadLeads(): void {
        this.loading = true;

        const formValues = this.filterForm.value;
        const filter: LeadFilter = {
            searchTerm: formValues.searchTerm || undefined,
            categoryId: formValues.categoryId || undefined,
            subcategoryId: formValues.subcategoryId || undefined,
            cityId: formValues.cityId || undefined,
            areaId: formValues.areaId || undefined,
            leadType: formValues.leadType || undefined,
            flowType: formValues.flowType || undefined,
            confirmedStatus: formValues.confirmedStatus || undefined,
            startDate: this.getStartDateTime(),
            endDate: this.getEndDateTime(),
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        };

        this.leadService.getLeads(filter).subscribe({
            next: (res: PagedResult<Lead>) => {
                this.leads = res.items;
                this.totalCount = res.totalCount;
                this.totalPages = Math.ceil(this.totalCount / this.pageSize);
                this.calculateStats();
                this.loading = false;
                this.initialLoading = false;
            },
            error: (error) => {
                console.error('Error loading leads:', error);
                this.loading = false;
                this.initialLoading = false;
            }
        });
    }

    calculateStats(): void {
        this.totalB2cLeads = this.leads.filter(l => l.leadType === 'b2c').length;
        this.totalB2bLeads = this.leads.filter(l => l.leadType === 'b2b').length;
        this.totalInstantLeads = this.leads.filter(l => l.timePreference === 'instant').length;
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        // Category dropdown
        if (this.categorySearchInputElement?.nativeElement?.contains(event.target) ||
            this.categoryDropdown?.nativeElement?.contains(event.target)) {
            return;
        }

        // City dropdown
        if (this.citySearchInputElement?.nativeElement?.contains(event.target) ||
            this.cityDropdown?.nativeElement?.contains(event.target)) {
            return;
        }

        // Customer dropdown
        if (this.customerSearchInputElement?.nativeElement?.contains(event.target) ||
            this.customerDropdown?.nativeElement?.contains(event.target)) {
            return;
        }

        // Assignment provider dropdown
        if (this.assignmentProviderSearchInputElement?.nativeElement?.contains(event.target) ||
            this.assignmentProviderDropdown?.nativeElement?.contains(event.target)) {
            return;
        }

        this.showCategoryDropdown = false;
        this.showCityDropdown = false;
        this.showCustomerDropdown = false;
        this.showAssignmentProviderDropdown = false;
    }

    // Modal methods
    openViewModal(lead: Lead): void {
        this.selectedLead = lead;
        this.showViewModal = true;
    }

    closeViewModal(): void {
        this.showViewModal = false;
        this.selectedLead = null;
    }

    openCreateModal(): void {
        this.resetLeadForm();
        this.showCreateModal = true;
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
        this.resetLeadForm();
    }

    openEditModal(lead: Lead): void {
        this.selectedLead = lead;
        this.populateEditForm(lead);
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.selectedLead = null;
        this.resetLeadForm();
    }

    // Assignment Modal Methods
    openAssignmentModal(lead: Lead): void {
        if (this.isLeadExpired(lead)) {
            Swal.fire({
                icon: 'error',
                title: 'Lead Expired',
                text: 'Cannot assign lead because the scheduled end date has passed.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        this.selectedLeadForAssignment = lead;
        this.showAssignmentModal = true;
        this.resetAssignmentForm();
    }

    closeAssignmentModal(): void {
        this.showAssignmentModal = false;
        this.selectedLeadForAssignment = null;
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

    // Assign to Provider
    assignToProvider(): void {
        if (!this.selectedLeadForAssignment || this.assignmentForm.invalid) {
            Object.keys(this.assignmentForm.controls).forEach(key => {
                this.assignmentForm.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.assignmentForm.value;
        const assignment: ManualAssignment = {
            leadId: this.selectedLeadForAssignment.id,
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
                Swal.fire('Success!', 'Lead assigned to provider successfully.', 'success');
                this.loadLeads();
            },
            error: (error) => {
                console.error('Error assigning lead:', error);
                Swal.fire('Error!', error.error?.error || 'Failed to assign lead', 'error');
            }
        });
    }

    resetLeadForm(): void {
        this.leadForm.reset({
            // isInstant: false, // Removed in new schema
            source: 'manual'
        });
        this.clearCustomerSelection();
        this.selectedCategory = null;
        this.selectedCity = null;
        this.subcategories = [];
        this.areas = [];
    }

    populateEditForm(lead: Lead): void {
        this.leadForm.patchValue({
            customerUserId: lead.customerUserId,
            customerSearch: lead.customerDisplayName ? `${lead.customerDisplayName}${lead.customerEmail ? ' (' + lead.customerEmail + ')' : ''}` : '',
            leadType: lead.leadType,
            description: lead.description,
            budgetMin: lead.budgetMin,
            budgetMax: lead.budgetMax,
            timePreference: lead.timePreference,
            scheduledStart: this.formatDateTimeForInput(lead.scheduledStart),
            scheduledEnd: this.formatDateTimeForInput(lead.scheduledEnd),
            // isInstant: lead.isInstant, // Removed in new schema
            source: lead.source,
            flowType: lead.flowType,
            categorySearch: lead.categoryName,
            categoryId: lead.categoryId,
            citySearch: lead.cityName,
            cityId: lead.cityId
        });

        if (lead.customerUserId) {
            this.selectedCustomer = {
                id: lead.customerUserId,
                name: lead.customerDisplayName || '',
                email: lead.customerEmail || '',
                phone: lead.customerPhone || ''
            };
        }

        if (lead.categoryId && lead.categoryName) {
            this.selectedCategory = {
                id: lead.categoryId,
                name: lead.categoryName,
                isActive: true
            };
        }

        if (lead.cityId && lead.cityName) {
            this.selectedCity = {
                id: lead.cityId,
                name: lead.cityName,
                state: ''
            };
        }

        if (lead.categoryId) {
            this.loadFormSubcategoriesWithValue(lead.categoryId, lead.subcategoryId);
        }

        if (lead.cityId) {
            this.loadFormAreasWithValue(lead.cityId, lead.areaId);
        }
    }

    loadFormSubcategoriesWithValue(categoryId: number, subcategoryId?: number): void {
        this.loadingSubcategories = true;
        this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });

        this.leadService.getSubcategoriesByCategory(categoryId).subscribe({
            next: (subcategories) => {
                this.subcategories = subcategories;
                this.loadingSubcategories = false;

                if (subcategories && subcategories.length > 0) {
                    this.leadForm.get('subcategoryId')?.enable({ emitEvent: false });

                    if (subcategoryId) {
                        const subcategoryExists = subcategories.some(s => s.id === subcategoryId);
                        if (subcategoryExists) {
                            setTimeout(() => {
                                this.leadForm.patchValue({
                                    subcategoryId: subcategoryId
                                }, { emitEvent: false });
                            }, 100);
                        }
                    }
                } else {
                    this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });
                    this.leadForm.patchValue({ subcategoryId: null }, { emitEvent: false });
                }
            },
            error: (error) => {
                console.error('Error loading subcategories:', error);
                this.subcategories = [];
                this.loadingSubcategories = false;
                this.leadForm.get('subcategoryId')?.disable({ emitEvent: false });
                this.leadForm.patchValue({ subcategoryId: null }, { emitEvent: false });
            }
        });
    }

    loadFormAreasWithValue(cityId: number, areaId?: number): void {
        this.loadingAreas = true;

        this.leadService.getAreasByCity(cityId).subscribe({
            next: (areas) => {
                this.areas = areas;
                this.loadingAreas = false;

                if (areaId) {
                    const areaExists = areas.some(a => a.id === areaId);
                    if (areaExists) {
                        setTimeout(() => {
                            this.leadForm.patchValue({
                                areaId: areaId
                            }, { emitEvent: false });
                        }, 100);
                    }
                }
            },
            error: (error) => {
                console.error('Error loading areas:', error);
                this.areas = [];
                this.loadingAreas = false;
            }
        });
    }


    

    createLead(): void {
    // Check if form is invalid
    if (this.leadForm.invalid) {
        // Mark all fields as touched to show validation errors
        Object.keys(this.leadForm.controls).forEach(key => {
            const control = this.leadForm.get(key);
            control?.markAsTouched();
        });
        
        // Check for custom validators errors
        const errors = this.leadForm.errors;
        if (errors) {
            if (errors['endDatePast']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'End date cannot be in the past'
                });
                return;
            } else if (errors['endDateBeforeStart']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'End date cannot be before start date'
                });
                return;
            } else if (errors['maxLessThanMin']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Maximum budget cannot be less than minimum budget'
                });
                return;
            } else if (errors['negativeBudget']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Budget cannot be negative'
                });
                return;
            }
        }
        
        // Show generic error if no specific error found
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please fill in all required fields correctly'
        });
        return;
    }

    this.isSubmitting = true;
    const formValue = this.leadForm.value;

    // Set confirmedStatus based on flowType
    const confirmedStatus = formValue.flowType === 'confirmed' ? 'draft' : null;

    // Validate date range again before sending
    if (formValue.scheduledStart && formValue.scheduledEnd) {
        const startDate = new Date(formValue.scheduledStart);
        const endDate = new Date(formValue.scheduledEnd);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (endDate < today) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'End date cannot be in the past'
            });
            this.isSubmitting = false;
            return;
        }

        if (endDate < startDate) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'End date cannot be before start date'
            });
            this.isSubmitting = false;
            return;
        }
    }

    // Validate budget range
    if (formValue.budgetMin && formValue.budgetMax) {
        const min = Number(formValue.budgetMin);
        const max = Number(formValue.budgetMax);

        if (min < 0 || max < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Budget cannot be negative'
            });
            this.isSubmitting = false;
            return;
        }

        if (max < min) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Maximum budget cannot be less than minimum budget'
            });
            this.isSubmitting = false;
            return;
        }
    }

    // Prepare DTO
    const dto: CreateLeadDto = {
        customerUserId: formValue.customerUserId || undefined,
        leadType: formValue.leadType,
        description: formValue.description,
        budgetMin: formValue.budgetMin ? Number(formValue.budgetMin) : undefined,
        budgetMax: formValue.budgetMax ? Number(formValue.budgetMax) : undefined,
        timePreference: formValue.timePreference || undefined,
        scheduledStart: formValue.scheduledStart ? new Date(formValue.scheduledStart).toISOString() : undefined,
        scheduledEnd: formValue.scheduledEnd ? new Date(formValue.scheduledEnd).toISOString() : undefined,
        // isInstant: formValue.isInstant, // Removed in new schema
        source: formValue.source,
        flowType: formValue.flowType,
        confirmedStatus: confirmedStatus,
        categoryId: formValue.categoryId || undefined,
        subcategoryId: formValue.subcategoryId || undefined,
        cityId: formValue.cityId || undefined,
        areaId: formValue.areaId || undefined
    };

    console.log('Sending DTO:', dto);

    this.leadService.createLead(dto).subscribe({
        next: (response) => {
            this.isSubmitting = false;
            this.closeCreateModal();
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Lead created successfully.',
                timer: 2000,
                showConfirmButton: false
            });
            this.loadLeads();
        },
        error: (error) => {
            this.isSubmitting = false;
            console.error('Error creating lead:', error);
            console.error('Error details:', error.error);

            // Show validation errors from backend
            let errorMessage = 'Failed to create lead';
            
            if (error.error) {
                if (error.error.errors) {
                    // Handle ASP.NET Core validation errors
                    const errors = error.error.errors;
                    errorMessage = Object.keys(errors)
                        .map(key => `${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]}`)
                        .join('\n');
                } else if (error.error.error) {
                    errorMessage = error.error.error;
                } else if (error.error.title) {
                    errorMessage = error.error.title;
                    if (error.error.detail) {
                        errorMessage += '\n' + error.error.detail;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
            }

            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                footer: 'Check console for details'
            });
        }
    });
}

updateLead(): void {
    if (!this.selectedLead) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'No lead selected for update'
        });
        return;
    }

    // Check if form is invalid
    if (this.leadForm.invalid) {
        // Mark all fields as touched to show validation errors
        Object.keys(this.leadForm.controls).forEach(key => {
            const control = this.leadForm.get(key);
            control?.markAsTouched();
        });
        
        // Check for custom validators errors
        const errors = this.leadForm.errors;
        if (errors) {
            if (errors['endDatePast']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'End date cannot be in the past'
                });
                return;
            } else if (errors['endDateBeforeStart']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'End date cannot be before start date'
                });
                return;
            } else if (errors['maxLessThanMin']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Maximum budget cannot be less than minimum budget'
                });
                return;
            } else if (errors['negativeBudget']) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Budget cannot be negative'
                });
                return;
            }
        }
        
        // Show generic error if no specific error found
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please fill in all required fields correctly'
        });
        return;
    }

    this.isSubmitting = true;
    const formValue = this.leadForm.value;

    // Set confirmedStatus based on flowType
    const confirmedStatus = formValue.flowType === 'confirmed' ? 'draft' : null;

    // Validate date range again before sending
    if (formValue.scheduledStart && formValue.scheduledEnd) {
        const startDate = new Date(formValue.scheduledStart);
        const endDate = new Date(formValue.scheduledEnd);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (endDate < today) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'End date cannot be in the past'
            });
            this.isSubmitting = false;
            return;
        }

        if (endDate < startDate) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'End date cannot be before start date'
            });
            this.isSubmitting = false;
            return;
        }
    }

    // Validate budget range
    if (formValue.budgetMin && formValue.budgetMax) {
        const min = Number(formValue.budgetMin);
        const max = Number(formValue.budgetMax);

        if (min < 0 || max < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Budget cannot be negative'
            });
            this.isSubmitting = false;
            return;
        }

        if (max < min) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Maximum budget cannot be less than minimum budget'
            });
            this.isSubmitting = false;
            return;
        }
    }

    // Prepare DTO
    const dto: UpdateLeadDto = {
        customerUserId: formValue.customerUserId || undefined,
        leadType: formValue.leadType,
        description: formValue.description,
        budgetMin: formValue.budgetMin ? Number(formValue.budgetMin) : undefined,
        budgetMax: formValue.budgetMax ? Number(formValue.budgetMax) : undefined,
        timePreference: formValue.timePreference || undefined,
        scheduledStart: formValue.scheduledStart ? new Date(formValue.scheduledStart).toISOString() : undefined,
        scheduledEnd: formValue.scheduledEnd ? new Date(formValue.scheduledEnd).toISOString() : undefined,
        // isInstant: formValue.isInstant, // Removed in new schema
        source: formValue.source,
        flowType: formValue.flowType,
        confirmedStatus: confirmedStatus,
        categoryId: formValue.categoryId || undefined,
        subcategoryId: formValue.subcategoryId || undefined,
        cityId: formValue.cityId || undefined,
        areaId: formValue.areaId || undefined
    };

    console.log('Sending update DTO:', dto);

    this.leadService.updateLead(this.selectedLead.id, dto).subscribe({
        next: (response) => {
            this.isSubmitting = false;
            this.closeEditModal();
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Lead updated successfully.',
                timer: 2000,
                showConfirmButton: false
            });
            this.loadLeads();
        },
        error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating lead:', error);
            console.error('Error details:', error.error);

            // Show validation errors from backend
            let errorMessage = 'Failed to update lead';
            
            if (error.error) {
                if (error.error.errors) {
                    // Handle ASP.NET Core validation errors
                    const errors = error.error.errors;
                    errorMessage = Object.keys(errors)
                        .map(key => `${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]}`)
                        .join('\n');
                } else if (error.error.error) {
                    errorMessage = error.error.error;
                } else if (error.error.title) {
                    errorMessage = error.error.title;
                    if (error.error.detail) {
                        errorMessage += '\n' + error.error.detail;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
            }

            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                footer: 'Check console for details'
            });
        }
    });
}

    getLeadTypeColor(type: string): string {
        return this.leadService.getLeadTypeColor(type);
    }

    getFlowTypeColor(type: string): string {
        return this.leadService.getFlowTypeColor(type);
    }

    getConfirmedStatusColor(status: string): string {
        return this.leadService.getConfirmedStatusColor(status);
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
        this.loadLeads();
    }

    resetFilters(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.filterForm.reset({
            searchTerm: '',
            categorySearch: '',
            categoryId: '',
            subcategoryId: '',
            citySearch: '',
            cityId: '',
            areaId: '',
            leadType: '',
            flowType: '',
            confirmedStatus: '',
            startDate: this.formatDateForInput(thirtyDaysAgo),
            startTime: '00:00',
            endDate: this.formatDateForInput(today),
            endTime: '23:59'
        });

        this.clearCategorySelection();
        this.clearCitySelection();
        this.areas = [];
        this.subcategories = [];
        this.pageNumber = 1;
        this.loadLeads();
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
            this.loadLeads();
        }
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.pageNumber = page;
            this.loadLeads();
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
        if (formValues.categoryId) count++;
        if (formValues.subcategoryId) count++;
        if (formValues.cityId) count++;
        if (formValues.areaId) count++;
        if (formValues.leadType) count++;
        if (formValues.flowType) count++;
        if (formValues.confirmedStatus) count++;
        if (formValues.startDate) count++;
        if (formValues.endDate) count++;

        return count;
    }

    deleteLead(id: number): void {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.leadService.deleteLead(id).subscribe({
                    next: (response) => {
                        if (response.success) {
                            Swal.fire('Deleted!', 'Lead has been deleted.', 'success');
                            this.loadLeads();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting lead:', error);
                        Swal.fire('Error!', error.error?.error || 'Failed to delete lead', 'error');
                    }
                });
            }
        });
    }

    // Helper method to get validation error messages
    getValidationErrorMessage(controlName: string): string {
        const control = this.leadForm.get(controlName);
        if (!control || !control.errors || !control.touched) return '';

        if (control.errors['required']) return 'This field is required';
        if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
        if (control.errors['maxlength']) return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
        if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
        if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
        if (control.errors['pattern']) return 'Please enter a valid value';

        return 'Invalid value';
    }

    // Helper method to get today's date and time for min attribute
    getTodayDateTime(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}