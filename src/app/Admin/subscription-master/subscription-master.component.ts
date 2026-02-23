import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../admin.service';
import { SubscriptionPlan, SubscriptionPlanFilter, SUBJECT_OPTIONS, TIER_OPTIONS, CURRENCY_OPTIONS } from './models/subscription-plan.model';
import { City } from './models/city.model';
import { ServiceCategory } from './models/category.model';
import { PagedResult } from './models/paged-result.model';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { CityService } from './services/city.service';
import { CategoryService } from './services/category.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-subscription-master',
  templateUrl: './subscription-master.component.html',
  styleUrls: ['./subscription-master.component.css']
})
export class SubscriptionMasterComponent implements OnInit {
  // Data properties
  plans: SubscriptionPlan[] = [];
  filteredPlans: SubscriptionPlan[] = [];

  // Pagination
  pageNumber: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;
  totalPages: number = 0;

  // UI state properties
  initialLoading = true;
  loading: boolean = false;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentPlan: SubscriptionPlan = this.getEmptyPlan();
  modalLoading: boolean = false;

  // Filter form
  filterForm!: FormGroup;

  // Plan form
  planForm!: FormGroup;

  // City search properties
  filteredCities: City[] = [];
  showCityDropdown: boolean = false;
  selectedCity: City | null = null;
  selectedFilterCity: City | null = null;
  loadingCities: boolean = false;
  citySearchError: boolean = false;
  private citySearchTerms = new Subject<string>();

  // Category search properties
  filteredCategories: ServiceCategory[] = [];
  showCategoryDropdown: boolean = false;
  selectedCategory: ServiceCategory | null = null;
  selectedFilterCategory: ServiceCategory | null = null;
  loadingCategories: boolean = false;
  categorySearchError: boolean = false;
  private categorySearchTerms = new Subject<string>();

  // Stats properties
  totalPlans: number = 0;
  activePlans: number = 0;
  avgPrice: number = 0;
  avgDuration: number = 0;

  // Enums for dropdowns
  subjectOptions = SUBJECT_OPTIONS;
  tierOptions = TIER_OPTIONS;
  currencyOptions = CURRENCY_OPTIONS;

  // Expanded plan ID for details view
  expandedPlanId: number | null = null;

  // ViewChild references
  @ViewChild('citySearchInput') citySearchInputElement!: ElementRef;
  @ViewChild('cityDropdown') cityDropdown!: ElementRef;
  @ViewChild('filterCityDropdown') filterCityDropdown!: ElementRef;
  @ViewChild('categorySearchInput') categorySearchInputElement!: ElementRef;
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
  @ViewChild('filterCategoryDropdown') filterCategoryDropdown!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private adminService: AdminService,
    private planService: SubscriptionPlanService,
    private cityService: CityService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.initFilterForm();
    this.initPlanForm();
    this.setupCitySearch();
    this.setupCategorySearch();
    this.fetchPlans();
  }

  // Custom validators
  jsonValidator(control: AbstractControl): ValidationErrors | null {
    try {
      if (control.value) {
        JSON.parse(control.value);
      }
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  priceRangeValidator(group: AbstractControl): ValidationErrors | null {
    const minPrice = group.get('minPrice')?.value;
    const maxPrice = group.get('maxPrice')?.value;

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      return { priceRangeInvalid: true };
    }
    return null;
  }

  durationRangeValidator(group: AbstractControl): ValidationErrors | null {
    const minDuration = group.get('minDuration')?.value;
    const maxDuration = group.get('maxDuration')?.value;

    if (minDuration && maxDuration && Number(minDuration) > Number(maxDuration)) {
      return { durationRangeInvalid: true };
    }
    return null;
  }

  // Initialize filter form with validators
  initFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      subject: [''],
      tier: [''],
      citySearch: [''],
      cityId: [''],
      categorySearch: [''],
      categoryId: [''],
      isActive: [''],
      minPrice: ['', [Validators.min(0), Validators.pattern(/^\d*\.?\d{0,2}$/)]],
      maxPrice: ['', [Validators.min(0), Validators.pattern(/^\d*\.?\d{0,2}$/)]],
      minDuration: ['', [Validators.min(1), Validators.pattern(/^\d+$/)]],
      maxDuration: ['', [Validators.min(1), Validators.pattern(/^\d+$/)]],
      sortBy: ['created_at'],
      sortOrder: ['desc']
    }, {
      validators: [this.priceRangeValidator, this.durationRangeValidator]
    });
  }

  // Initialize plan form with validators
  initPlanForm(): void {
    this.planForm = this.fb.group({
      subject: ['', Validators.required],
      tier: ['', Validators.required],
      code: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9-]+$/)
      ]],
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [Validators.maxLength(500)]],
      priceAmount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      currency: ['INR', Validators.required],
      durationDays: [30, [
        Validators.required,
        Validators.min(1),
        Validators.max(3650)
      ]],
      citySearch: [''],
      cityId: [null],
      categorySearch: [''],
      categoryId: [null],
      entitlements: ['{}', [
        Validators.required,
        this.jsonValidator
      ]],
      isActive: [true]
    });
  }

  // Get empty plan template
  getEmptyPlan(): SubscriptionPlan {
    return {
      id: 0,
      subject: '',
      tier: '',
      code: '',
      name: '',
      description: null,
      priceAmount: 0,
      currency: 'INR',
      durationDays: 30,
      cityId: null,
      cityName: null,
      categoryId: null,
      categoryName: null,
      entitlements: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Check if filter form is valid
  isFilterFormValid(): boolean {
    if (this.filterForm.hasError('priceRangeInvalid')) {
      return false;
    }
    if (this.filterForm.hasError('durationRangeInvalid')) {
      return false;
    }
    return true;
  }

  // Setup city search (unchanged)
  setupCitySearch(): void {
    // For modal form
    this.planForm.get('citySearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          if (!searchTerm || !searchTerm.trim()) {
            this.filteredCities = [];
            this.showCityDropdown = false;
          }
        })
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchCities(searchTerm);
        }
      });

    // For filter form
    this.filterForm.get('citySearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchFilterCities(searchTerm);
        } else {
          this.filteredCities = [];
        }
      });
  }

  // Setup category search (unchanged)
  setupCategorySearch(): void {
    // For modal form
    this.planForm.get('categorySearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          if (!searchTerm || !searchTerm.trim()) {
            this.filteredCategories = [];
            this.showCategoryDropdown = false;
          }
        })
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchCategories(searchTerm);
        }
      });

    // For filter form
    this.filterForm.get('categorySearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchFilterCategories(searchTerm);
        } else {
          this.filteredCategories = [];
        }
      });
  }

  // Search cities for modal (unchanged)
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

  // Search cities for filter (unchanged)
  searchFilterCities(searchTerm: string): void {
    this.cityService.searchCities(searchTerm.trim(), 10).subscribe({
      next: (cities) => {
        this.filteredCities = cities;
      },
      error: (error) => {
        console.error('Error searching cities:', error);
        this.filteredCities = [];
      }
    });
  }

  // Search categories for modal (unchanged)
  searchCategories(searchTerm: string): void {
    this.loadingCategories = true;
    this.categorySearchError = false;

    this.categoryService.searchCategories(searchTerm.trim(), 10).subscribe({
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

  // Search categories for filter (unchanged)
  searchFilterCategories(searchTerm: string): void {
    this.categoryService.searchCategories(searchTerm.trim(), 10).subscribe({
      next: (categories) => {
        this.filteredCategories = categories;
      },
      error: (error) => {
        console.error('Error searching categories:', error);
        this.filteredCategories = [];
      }
    });
  }

  // Modal city search handlers (unchanged)
  onCitySearchInput(): void {
    const searchTerm = this.planForm.get('citySearch')?.value;

    if (searchTerm && searchTerm.trim()) {
      if (this.selectedCity) {
        const currentDisplay = `${this.selectedCity.name}, ${this.selectedCity.stateName}`;
        if (searchTerm !== currentDisplay) {
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
    const searchTerm = this.planForm.get('citySearch')?.value;
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
    this.planForm.patchValue({
      cityId: city.id,
      citySearch: `${city.name}, ${city.state}`
    });
    this.showCityDropdown = false;
    this.filteredCities = [];
  }

  clearCitySelection(): void {
    this.selectedCity = null;
    this.planForm.patchValue({
      cityId: null,
      citySearch: ''
    });
    this.filteredCities = [];
    this.showCityDropdown = false;
  }

  // Filter city search handlers (unchanged)
  onFilterCitySearchInput(): void {
    const searchTerm = this.filterForm.get('citySearch')?.value;

    if (searchTerm && searchTerm.trim()) {
      if (this.selectedFilterCity) {
        const currentDisplay = `${this.selectedFilterCity.name}, ${this.selectedFilterCity.state}`;
        if (searchTerm !== currentDisplay) {
          this.clearFilterCitySelection();
        }
      }
    } else {
      this.filteredCities = [];
      this.clearFilterCitySelection();
    }
  }

  onFilterCitySearchClick(): void {
    const searchTerm = this.filterForm.get('citySearch')?.value;
    if (searchTerm && searchTerm.trim() && this.filteredCities.length > 0) {
      this.showCityDropdown = true;
    }
  }

  selectFilterCity(city: City): void {
    this.selectedFilterCity = city;
    this.filterForm.patchValue({
      cityId: city.id,
      citySearch: `${city.name}, ${city.state}`
    });
    this.showCityDropdown = false;
    this.filteredCities = [];
    this.applyFilters();
  }

  clearFilterCitySelection(): void {
    this.selectedFilterCity = null;
    this.filterForm.patchValue({
      cityId: null,
      citySearch: ''
    });
    this.filteredCities = [];
    this.showCityDropdown = false;
    this.applyFilters();
  }

  // Modal category search handlers (unchanged)
  onCategorySearchInput(): void {
    const searchTerm = this.planForm.get('categorySearch')?.value;

    if (searchTerm && searchTerm.trim()) {
      if (this.selectedCategory) {
        if (searchTerm !== this.selectedCategory.name) {
          this.clearCategorySelection();
        }
      }
      this.showCategoryDropdown = true;
    } else {
      this.filteredCategories = [];
      this.showCategoryDropdown = false;
      this.clearCategorySelection();
    }
  }

  onCategorySearchClick(): void {
    const searchTerm = this.planForm.get('categorySearch')?.value;
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

  selectCategory(category: ServiceCategory): void {
    this.selectedCategory = category;
    this.planForm.patchValue({
      categoryId: category.id,
      categorySearch: category.name
    });
    this.showCategoryDropdown = false;
    this.filteredCategories = [];
  }

  clearCategorySelection(): void {
    this.selectedCategory = null;
    this.planForm.patchValue({
      categoryId: null,
      categorySearch: ''
    });
    this.filteredCategories = [];
    this.showCategoryDropdown = false;
  }

  // Filter category search handlers (unchanged)
  onFilterCategorySearchInput(): void {
    const searchTerm = this.filterForm.get('categorySearch')?.value;

    if (searchTerm && searchTerm.trim()) {
      if (this.selectedFilterCategory) {
        if (searchTerm !== this.selectedFilterCategory.name) {
          this.clearFilterCategorySelection();
        }
      }
    } else {
      this.filteredCategories = [];
      this.clearFilterCategorySelection();
    }
  }

  onFilterCategorySearchClick(): void {
    const searchTerm = this.filterForm.get('categorySearch')?.value;
    if (searchTerm && searchTerm.trim() && this.filteredCategories.length > 0) {
      this.showCategoryDropdown = true;
    }
  }

  selectFilterCategory(category: ServiceCategory): void {
    this.selectedFilterCategory = category;
    this.filterForm.patchValue({
      categoryId: category.id,
      categorySearch: category.name
    });
    this.showCategoryDropdown = false;
    this.filteredCategories = [];
    this.applyFilters();
  }

  clearFilterCategorySelection(): void {
    this.selectedFilterCategory = null;
    this.filterForm.patchValue({
      categoryId: null,
      categorySearch: ''
    });
    this.filteredCategories = [];
    this.showCategoryDropdown = false;
    this.applyFilters();
  }

  // Close dropdowns when clicking outside (unchanged)
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Modal city dropdown
    if (this.citySearchInputElement?.nativeElement?.contains(event.target) ||
      this.cityDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // Filter city dropdown
    if (this.filterCityDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // Modal category dropdown
    if (this.categorySearchInputElement?.nativeElement?.contains(event.target) ||
      this.categoryDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // Filter category dropdown
    if (this.filterCategoryDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    this.showCityDropdown = false;
    this.showCategoryDropdown = false;
  }

  // Fetch plans from server
  fetchPlans(): void {
    this.loading = true;
    this.error = null;

    const formValues = this.filterForm.value;
    const filter: SubscriptionPlanFilter = {
      searchTerm: formValues.searchTerm || undefined,
      subject: formValues.subject || undefined,
      tier: formValues.tier || undefined,
      cityId: formValues.cityId || undefined,
      categoryId: formValues.categoryId || undefined,
      isActive: formValues.isActive !== '' ? formValues.isActive === 'true' : undefined,
      minPrice: formValues.minPrice ? Number(formValues.minPrice) : undefined,
      maxPrice: formValues.maxPrice ? Number(formValues.maxPrice) : undefined,
      minDuration: formValues.minDuration ? Number(formValues.minDuration) : undefined,
      maxDuration: formValues.maxDuration ? Number(formValues.maxDuration) : undefined,
      sortBy: formValues.sortBy,
      sortOrder: formValues.sortOrder,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.planService.getSubscriptionPlans(filter).subscribe({
      next: (result: PagedResult<SubscriptionPlan>) => {
        this.plans = result.items;
        this.filteredPlans = [...result.items];
        this.totalCount = result.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false; 
      },
      error: (err) => {
        this.error = 'Failed to load subscription plans. Please try again.';
        this.loading = false;
        this.initialLoading = false; 
        console.error('Error fetching plans:', err);
      }
    });
  }

  // Calculate stats
  calculateStats(): void {
    this.totalPlans = this.plans.length;
    this.activePlans = this.plans.filter(p => p.isActive).length;

    if (this.plans.length > 0) {
      this.avgPrice = Math.round(this.plans.reduce((sum, p) => sum + p.priceAmount, 0) / this.plans.length);
      this.avgDuration = Math.round(this.plans.reduce((sum, p) => sum + p.durationDays, 0) / this.plans.length);
    } else {
      this.avgPrice = 0;
      this.avgDuration = 0;
    }
  }

  // Filter plans locally
  filterPlans(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPlans = [...this.plans];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredPlans = this.plans.filter(plan =>
      plan.name.toLowerCase().includes(term) ||
      plan.code.toLowerCase().includes(term) ||
      (plan.description && plan.description.toLowerCase().includes(term))
    );
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentPlan = this.getEmptyPlan();
    this.resetPlanForm();
    this.showModal = true;
  }

  editPlan(plan: SubscriptionPlan): void {
    this.isEditMode = true;
    this.currentPlan = { ...plan };

    this.planForm.patchValue({
      subject: plan.subject,
      tier: plan.tier,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceAmount: plan.priceAmount,
      currency: plan.currency,
      durationDays: plan.durationDays,
      cityId: plan.cityId,
      categoryId: plan.categoryId,
      entitlements: JSON.stringify(plan.entitlements, null, 2),
      isActive: plan.isActive
    });

    if (plan.cityId && plan.cityName) {
      this.selectedCity = {
        id: plan.cityId,
        name: plan.cityName,
        state: '',
        stateName: '',
        country: '',
        tier: '',
        centerLat: 0,
        centerLong: 0,
        isActive: true
      };
      this.planForm.patchValue({
        citySearch: plan.cityName
      });
    }

    if (plan.categoryId && plan.categoryName) {
      this.selectedCategory = {
        id: plan.categoryId,
        name: plan.categoryName,
        parentId: null,
        slug: '',
        description: null,
        isLeaf: false,
        isActive: true,
        displayOrder: 0
      };
      this.planForm.patchValue({
        categorySearch: plan.categoryName
      });
    }

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPlan = this.getEmptyPlan();
    this.resetPlanForm();
    this.modalLoading = false;
  }

  resetPlanForm(): void {
    this.planForm.reset({
      subject: '',
      tier: '',
      code: '',
      name: '',
      description: '',
      priceAmount: 0,
      currency: 'INR',
      durationDays: 30,
      citySearch: '',
      cityId: null,
      categorySearch: '',
      categoryId: null,
      entitlements: '{}',
      isActive: true
    });
    this.clearCitySelection();
    this.clearCategorySelection();
  }

  // Updated savePlan with validation
  savePlan(): void {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.planForm.controls).forEach(key => {
      this.planForm.get(key)?.markAsTouched();
    });

    if (this.planForm.invalid) {
      // Scroll to first error
      const firstError = document.querySelector('.ng-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const formValue = this.planForm.value;

    let entitlements = {};
    try {
      entitlements = JSON.parse(formValue.entitlements || '{}');
    } catch (e) {
      alert('Invalid JSON format for entitlements');
      return;
    }

    const planData = {
      subject: formValue.subject,
      tier: formValue.tier,
      code: formValue.code,
      name: formValue.name,
      description: formValue.description || null,
      priceAmount: Number(formValue.priceAmount),
      currency: formValue.currency,
      durationDays: Number(formValue.durationDays),
      cityId: formValue.cityId || null,
      categoryId: formValue.categoryId || null,
      entitlements: entitlements,
      isActive: formValue.isActive
    };

    this.modalLoading = true;

    if (this.isEditMode && this.currentPlan.id) {
      this.planService.updateSubscriptionPlan(this.currentPlan.id, planData).subscribe({
        next: () => {
          this.fetchPlans();
          this.closeModal();
          alert('Subscription plan updated successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error updating plan:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 409) {
            alert('Plan with this code already exists');
          } else {
            alert('Failed to update plan. Please try again.');
          }
        }
      });
    } else {
      this.planService.createSubscriptionPlan(planData).subscribe({
        next: () => {
          this.fetchPlans();
          this.closeModal();
          alert('Subscription plan created successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error creating plan:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 409) {
            alert('Plan with this code already exists');
          } else {
            alert('Failed to create plan. Please try again.');
          }
        }
      });
    }
  }

  // Filter methods - updated with validation check
  applyFilters(): void {
    if (!this.isFilterFormValid()) {
      return;
    }
    this.pageNumber = 1;
    this.fetchPlans();
  }

  resetFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      subject: '',
      tier: '',
      citySearch: '',
      cityId: '',
      categorySearch: '',
      categoryId: '',
      isActive: '',
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });

    this.selectedFilterCity = null;
    this.selectedFilterCategory = null;
    this.filteredCities = [];
    this.filteredCategories = [];
    this.showCityDropdown = false;
    this.showCategoryDropdown = false;

    this.pageNumber = 1;
    this.fetchPlans();
  }

  refreshData(): void {
    this.fetchPlans();
    this.searchTerm = '';
  }

  // Toggle active status
  toggleActive(plan: SubscriptionPlan): void {
    const newStatus = !plan.isActive;
    const originalStatus = plan.isActive;

    plan.isActive = newStatus;

    this.planService.togglePlanStatus(plan.id).subscribe({
      next: () => {
        console.log(`Plan ${plan.code} status updated to ${newStatus ? 'active' : 'inactive'}`);
        this.calculateStats();
      },
      error: (err) => {
        plan.isActive = originalStatus;
        console.error('Error updating plan status:', err);
        alert('Failed to update plan status. Please try again.');
      }
    });
  }

  // Delete confirmation
  confirmDelete(plan: SubscriptionPlan): void {
    if (confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      this.deletePlan(plan);
    }
  }

  deletePlan(plan: SubscriptionPlan): void {
    this.planService.deleteSubscriptionPlan(plan.id).subscribe({
      next: () => {
        this.fetchPlans();
        alert(`Plan "${plan.name}" deleted successfully`);
      },
      error: (err) => {
        console.error('Error deleting plan:', err);
        alert('Failed to delete plan');
      }
    });
  }

  // Pagination methods
  changePage(delta: number): void {
    const newPage = this.pageNumber + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.fetchPlans();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.fetchPlans();
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
    if (formValues.subject) count++;
    if (formValues.tier) count++;
    if (formValues.cityId) count++;
    if (formValues.categoryId) count++;
    if (formValues.minPrice) count++;
    if (formValues.maxPrice) count++;
    if (formValues.minDuration) count++;
    if (formValues.maxDuration) count++;
    if (formValues.isActive !== '') count++;

    return count;
  }

  // Helper methods for display
  getSubjectLabel(subject: string): string {
    const option = this.subjectOptions.find(o => o.value === subject);
    return option ? option.label : subject;
  }

  getTierLabel(tier: string): string {
    const option = this.tierOptions.find(o => o.value === tier);
    return option ? option.label : tier;
  }

  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return currency;
    }
  }

  formatPrice(amount: number, currency: string): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol} ${amount.toFixed(2)}`;
  }

  toggleDetails(plan: SubscriptionPlan): void {
    this.expandedPlanId = this.expandedPlanId === plan.id ? null : plan.id;
  }

  formatEntitlements(entitlements: any): string {
    if (!entitlements) return '{}';
    try {
      if (typeof entitlements === 'string') {
        return entitlements;
      }
      return JSON.stringify(entitlements, null, 2);
    } catch {
      return String(entitlements);
    }
  }

  // Get error message helper
  getErrorMessage(controlName: string): string {
    const control = this.planForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['invalidJson']) return 'Invalid JSON format';

    return 'Invalid value';
  }

  getTierDisplayValue(tier: string | number): string {
    // Convert to number if it's a string
    const tierValue = typeof tier === 'string' ? parseInt(tier, 10) : tier;

    switch (tierValue) {
      case 0:
        return 'X';
      case 1:
        return 'Y';
      case 2:
        return 'Z';
      default:
        return tier?.toString() || 'Unknown';
    }
  }
}