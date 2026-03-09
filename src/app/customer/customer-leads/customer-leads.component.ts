// import { Component, OnInit, HostListener } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CustomerLeadService } from './services/customer-lead.service';
// import {
//   CustomerLeadDto,
//   CustomerCreateLeadDto,
//   CustomerLeadFilterDto,
//   CustomerPagedResult,
//   CategoryDto,
//   SubcategoryDto,
//   CityDto,
//   AreaDto
// } from './models/customer-lead.models';

// @Component({
//   selector: 'app-customer-leads',
//   templateUrl: './customer-leads.component.html',
//   styleUrls: ['./customer-leads.component.css']
// })
// export class CustomerLeadsComponent implements OnInit {
//   expandedLeads: Set<number> = new Set<number>();
//   Math = Math;

//   user = {
//     name: 'John Doe'
//   };

//   leads: CustomerLeadDto[] = [];
//   totalLeads = 0;
//   currentPage = 1;
//   pageSize = 10;
//   totalPages = 0;
//   loading = false;
//   searchTerm = '';

//   showCreateModal = false;
//   currentStep = 1;
//   totalSteps = 7;

//   categories: CategoryDto[] = [];
//   subcategories: SubcategoryDto[] = [];
//   cities: CityDto[] = [];
//   areas: AreaDto[] = [];

//   selectedCategory: CategoryDto | null = null;
//   selectedSubcategory: SubcategoryDto | null = null;
//   selectedCity: CityDto | null = null;
//   selectedArea: AreaDto | null = null;

//   leadForm: FormGroup;

//   timePreferences = [
//     { value: 'instant', label: 'Instant', icon: 'ri-flashlight-line', description: 'Immediate service required' },
//     { value: 'today', label: 'Today', icon: 'ri-sun-line', description: 'Need service today' },
//     { value: 'scheduled', label: 'Scheduled', icon: 'ri-calendar-event-line', description: 'Schedule for later' }
//   ];

//   flowTypes = [
//     { value: 'standard', label: 'Standard', description: 'Regular lead with no confirmation needed' },
//     { value: 'confirmed', label: 'Confirmed', description: 'Lead requires confirmation before proceeding' }
//   ];

//   // City search properties
//   citySearchTerm: string = '';
//   filteredCities: CityDto[] = [];
//   showCityDropdown: boolean = false;
//   loadingCities: boolean = false;
//   citySearchTimeout: any;
//   popularCities: CityDto[] = []; // For default options

//   // Area search properties
//   areaSearchTerm: string = '';
//   filteredAreas: AreaDto[] = [];
//   showAreaDropdown: boolean = false;
//   loadingAreas: boolean = false;
//   areaSearchTimeout: any;
//   popularAreas: AreaDto[] = []; // For default options

//   constructor(
//     private leadService: CustomerLeadService,
//     private fb: FormBuilder
//   ) {
//     this.leadForm = this.fb.group({
//       description: ['', Validators.required],
//       budgetMin: [null],
//       budgetMax: [null],
//       timePreference: ['today', Validators.required],
//       scheduledStart: [null],
//       scheduledEnd: [null],
//       isInstant: [false],
//       flowType: ['standard', Validators.required]
//     });
//   }

//   ngOnInit(): void {
//     this.loadLeads();
//     this.loadMasterData();
//     this.loadPopularCities(); // Load default cities

//     this.leadForm.get('timePreference')?.valueChanges.subscribe(value => {
//       if (value === 'today' || value === 'this_week' || value === 'this_month') {
//         this.setDatesForPreference(value);
//       }
//     });
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.city-search-container')) {
//       this.showCityDropdown = false;
//     }
//     if (!target.closest('.area-search-container')) {
//       this.showAreaDropdown = false;
//     }
//   }

//   loadMasterData(): void {
//     this.leadService.getCategories().subscribe({
//       next: (data) => this.categories = data,
//       error: (err) => console.error('Error loading categories:', err)
//     });
//   }

//   // Load popular/default cities (you can modify this based on your requirements)
//   loadPopularCities(): void {
//     // Load some default cities (e.g., major cities)
//     this.leadService.getCities('', 5).subscribe({
//       next: (cities) => {
//         this.popularCities = cities;
//       },
//       error: (err) => console.error('Error loading popular cities:', err)
//     });
//   }

//   // Load popular/default areas for selected city
//   loadPopularAreas(cityId: number): void {
//     this.leadService.getAreasBySearch(cityId, '', 5).subscribe({
//       next: (areas) => {
//         this.popularAreas = areas;
//       },
//       error: (err) => console.error('Error loading popular areas:', err)
//     });
//   }

//   loadLeads(): void {
//     this.loading = true;
//     const filter: CustomerLeadFilterDto = {
//       pageNumber: this.currentPage,
//       pageSize: this.pageSize,
//       searchTerm: this.searchTerm || undefined,
//       sortBy: 'created_at',
//       sortOrder: 'desc'
//     };

//     this.leadService.getUserLeads(filter).subscribe({
//       next: (result: CustomerPagedResult<CustomerLeadDto>) => {
//         this.leads = result.items;
//         this.totalLeads = result.totalCount;
//         this.totalPages = result.totalPages;
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Error loading leads:', err);
//         this.loading = false;
//       }
//     });
//   }

//   onSearch(): void {
//     this.currentPage = 1;
//     this.loadLeads();
//   }

//   onPageChange(page: number): void {
//     this.currentPage = page;
//     this.loadLeads();
//   }

//   openCreateModal(): void {
//     this.showCreateModal = true;
//     this.currentStep = 1;
//     this.resetSelections();
//   }

//   closeCreateModal(): void {
//     this.showCreateModal = false;
//     this.currentStep = 1;
//     this.leadForm.reset({ timePreference: 'today', flowType: 'standard' });
//     this.resetSelections();
//   }

//   resetSelections(): void {
//     this.selectedCategory = null;
//     this.selectedSubcategory = null;
//     this.selectedCity = null;
//     this.selectedArea = null;
//     this.subcategories = [];
//     this.areas = [];
//     this.citySearchTerm = '';
//     this.filteredCities = [];
//     this.showCityDropdown = false;
//     this.areaSearchTerm = '';
//     this.filteredAreas = [];
//     this.showAreaDropdown = false;
//     this.popularAreas = []; // Reset popular areas
//   }

//   nextStep(): void {
//     if (this.canProceed()) {
//       this.currentStep++;
//     }
//   }

//   prevStep(): void {
//     if (this.currentStep > 1) {
//       this.currentStep--;
//     }
//   }

//   canProceed(): boolean {
//     switch (this.currentStep) {
//       case 1: return !!this.selectedCategory;
//       case 2: return true;
//       case 3: return !!this.selectedCity;
//       case 4: return true;
//       case 5: return true;
//       case 6: return this.leadForm.get('timePreference')?.valid ?? false;
//       case 7: return (this.leadForm.get('flowType')?.valid ?? false) &&
//         (this.leadForm.get('description')?.valid ?? false);
//       default: return false;
//     }
//   }

//   onCategorySelect(category: CategoryDto): void {
//     this.selectedCategory = category;
//     this.selectedSubcategory = null;
//     this.loadSubcategories(category.id);
//   }

//   loadSubcategories(categoryId: number): void {
//     this.leadService.getSubcategories(categoryId).subscribe({
//       next: (data) => this.subcategories = data,
//       error: (err) => console.error('Error loading subcategories:', err)
//     });
//   }

//   onSubcategorySelect(subcategory: SubcategoryDto): void {
//     this.selectedSubcategory = subcategory;
//     // this.nextStep();
//   }

//   // City search methods
//   searchCities(searchTerm: string): void {
//     if (this.citySearchTimeout) {
//       clearTimeout(this.citySearchTimeout);
//     }

//     this.citySearchTimeout = setTimeout(() => {
//       if (searchTerm.length >= 2) {
//         this.loadingCities = true;
//         this.leadService.getCities(searchTerm, 20).subscribe({
//           next: (cities) => {
//             this.filteredCities = cities;
//             this.showCityDropdown = true;
//             this.loadingCities = false;
//           },
//           error: (err) => {
//             console.error('Error searching cities:', err);
//             this.filteredCities = [];
//             this.loadingCities = false;
//           }
//         });
//       } else {
//         // Show popular cities when search term is less than 2 characters
//         this.filteredCities = this.popularCities;
//         this.showCityDropdown = true;
//       }
//     }, 300);
//   }

//   onCitySelect(city: CityDto): void {
//     this.selectedCity = city;
//     this.citySearchTerm = city.name;
//     this.showCityDropdown = false;
//     this.selectedArea = null;
//     this.areaSearchTerm = '';
//     this.filteredAreas = [];
//     this.loadPopularAreas(city.id); // Load default areas for this city
//   }

//   onCityInputFocus(): void {
//     // Show popular cities when input is focused
//     this.filteredCities = this.popularCities;
//     this.showCityDropdown = true;
//   }

//   clearCitySelection(): void {
//     this.selectedCity = null;
//     this.citySearchTerm = '';
//     this.filteredCities = [];
//     this.selectedArea = null;
//     this.areaSearchTerm = '';
//     this.filteredAreas = [];
//     this.popularAreas = [];
//   }

//   // Area search methods
//   searchAreas(searchTerm: string): void {
//     const cityId = this.selectedCity?.id;

//     if (!cityId) {
//       return;
//     }

//     if (this.areaSearchTimeout) {
//       clearTimeout(this.areaSearchTimeout);
//     }

//     this.areaSearchTimeout = setTimeout(() => {
//       if (searchTerm.length >= 2) {
//         this.loadingAreas = true;

//         this.leadService.getAreasBySearch(cityId, searchTerm, 20).subscribe({
//           next: (areas) => {
//             this.filteredAreas = areas;
//             this.showAreaDropdown = true;
//             this.loadingAreas = false;
//           },
//           error: (err) => {
//             console.error('Error searching areas:', err);
//             this.filteredAreas = [];
//             this.loadingAreas = false;
//           }
//         });
//       } else {
//         // Show popular areas when search term is less than 2 characters
//         this.filteredAreas = this.popularAreas;
//         this.showAreaDropdown = true;
//       }
//     }, 300);
//   }

//   onAreaSelect(area: AreaDto): void {
//     this.selectedArea = area;
//     this.areaSearchTerm = area.areaName;
//     this.showAreaDropdown = false;
//     // this.nextStep();
//   }

//   onAreaInputFocus(): void {
//     // Show popular areas when input is focused
//     if (this.selectedCity) {
//       this.filteredAreas = this.popularAreas;
//       this.showAreaDropdown = true;
//     }
//   }

//   clearAreaSelection(): void {
//     this.selectedArea = null;
//     this.areaSearchTerm = '';
//     this.filteredAreas = [];
//   }

//   setBudget(budget: { min: number; max: number }): void {
//     this.leadForm.patchValue({
//       budgetMin: budget.min,
//       budgetMax: budget.max
//     });
//   }

//   setTimePreference(pref: string): void {
//     this.leadForm.patchValue({ timePreference: pref });

//     // Set isInstant based on preference
//     if (pref === 'instant') {
//       this.leadForm.patchValue({ isInstant: true });
//       // Set scheduled dates to null for instant
//       this.leadForm.patchValue({
//         scheduledStart: null,
//         scheduledEnd: null
//       });
//     } else {
//       this.leadForm.patchValue({ isInstant: false });
//     }

//     // Set dates for today or scheduled
//     this.setDatesForPreference(pref);

//     // Automatically move to next step after selection
//     // this.nextStep(); // Uncomment if you want auto-advance
//   }

//   setDatesForPreference(pref: string): void {
//     const now = new Date();
//     const today = new Date(now.setHours(0, 0, 0, 0));
//     const currentTime = new Date(); // For instant, we might want current time

//     switch (pref) {
//       case 'instant':
//         // For instant, set to current time with small window
//         this.leadForm.patchValue({
//           scheduledStart: currentTime.toISOString(),
//           scheduledEnd: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
//           isInstant: true
//         });
//         break;

//       case 'today':
//         // Today: start from now, end at end of day
//         this.leadForm.patchValue({
//           scheduledStart: currentTime.toISOString(),
//           scheduledEnd: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(), // End of today
//           isInstant: false
//         });
//         break;

//       case 'scheduled':
//         // For scheduled, we don't set dates automatically - user will pick
//         // But we can set default to tomorrow if helpful
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);

//         this.leadForm.patchValue({
//           scheduledStart: null, // Let user pick
//           scheduledEnd: null,   // Let user pick
//           isInstant: false
//         });
//         break;

//       default:
//         this.leadForm.patchValue({
//           scheduledStart: null,
//           scheduledEnd: null,
//           isInstant: false
//         });
//     }
//   }

//   setFlowType(flowType: string): void {
//     this.leadForm.patchValue({ flowType });
//   }

//   submitLead(): void {
//     if (!this.selectedCategory || !this.selectedCity || !this.leadForm.valid) {
//       return;
//     }

//     const leadData: CustomerCreateLeadDto = {
//       leadType: 'b2c',
//       description: this.leadForm.get('description')?.value,
//       budgetMin: this.leadForm.get('budgetMin')?.value,
//       budgetMax: this.leadForm.get('budgetMax')?.value,
//       timePreference: this.leadForm.get('timePreference')?.value,
//       scheduledStart: this.leadForm.get('scheduledStart')?.value,
//       scheduledEnd: this.leadForm.get('scheduledEnd')?.value,
//       isInstant: this.leadForm.get('isInstant')?.value,
//       source: 'link',
//       categoryId: this.selectedCategory.id,
//       subcategoryId: this.selectedSubcategory?.id,
//       cityId: this.selectedCity.id,
//       areaId: this.selectedArea?.id,
//       flowType: this.leadForm.get('flowType')?.value
//     };

//     this.leadService.createLead(leadData).subscribe({
//       next: (newLead) => {
//         this.closeCreateModal();
//         this.loadLeads();
//       },
//       error: (err) => {
//         console.error('Error creating lead:', err);
//       }
//     });
//   }

//   deleteLead(id: number): void {
//     if (confirm('Are you sure you want to delete this lead?')) {
//       this.leadService.deleteLead(id).subscribe({
//         next: () => {
//           this.loadLeads();
//         },
//         error: (err) => {
//           console.error('Error deleting lead:', err);
//         }
//       });
//     }
//   }

//   viewLeadDetails(lead: CustomerLeadDto): void {
//     console.log('View lead:', lead);
//   }
//   toggleLeadExpand(lead: CustomerLeadDto): void {
//     if (this.expandedLeads.has(lead.id)) {
//       this.expandedLeads.delete(lead.id);
//     } else {
//       this.expandedLeads.add(lead.id);
//     }
//   }

//   isLeadExpanded(lead: CustomerLeadDto): boolean {
//     return this.expandedLeads.has(lead.id);
//   }

//   getStatusBadgeClass(lead: CustomerLeadDto): string {
//     if (lead.committedCount > 0) return 'bg-green-100 text-green-800';
//     if (lead.unlockedCount > 0) return 'bg-blue-100 text-blue-800';
//     if (lead.offeredCount > 0) return 'bg-yellow-100 text-yellow-800';
//     if (lead.expiredCount > 0) return 'bg-gray-100 text-gray-800';
//     return 'bg-purple-100 text-purple-800';
//   }

//   getStatusText(lead: CustomerLeadDto): string {
//     if (lead.committedCount > 0) return 'Committed';
//     if (lead.unlockedCount > 0) return 'Unlocked';
//     if (lead.offeredCount > 0) return 'Active';
//     if (lead.expiredCount > 0) return 'Expired';
//     return 'New';
//   }
// }

import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CustomerLeadService } from './services/customer-lead.service';
import {
  CustomerLeadDto,
  CustomerCreateLeadDto,
  CustomerLeadFilterDto,
  CustomerPagedResult,
  CategoryDto,
  SubcategoryDto,
  CityDto,
  AreaDto
} from './models/customer-lead.models';

@Component({
    selector: 'app-customer-leads',
    templateUrl: './customer-leads.component.html',
    styleUrls: ['./customer-leads.component.css'],
    standalone: false
})
export class CustomerLeadsComponent implements OnInit {
  expandedLeads: Set<number> = new Set<number>();
  Math = Math;

  user = {
    name: 'John Doe'
  };

  leads: CustomerLeadDto[] = [];
  totalLeads = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  loading = false;
  searchTerm = '';

  showCreateModal = false;
  currentStep = 1;
  totalSteps = 7;

  categories: CategoryDto[] = [];
  subcategories: SubcategoryDto[] = [];
  cities: CityDto[] = [];
  areas: AreaDto[] = [];

  selectedCategory: CategoryDto | null = null;
  selectedSubcategory: SubcategoryDto | null = null;
  selectedCity: CityDto | null = null;
  selectedArea: AreaDto | null = null;

  leadForm: FormGroup;

  // Form submission tracking
  formSubmitted = false;

  timePreferences = [
    { value: 'instant', label: 'Instant', icon: 'ri-flashlight-line', description: 'Immediate service required' },
    { value: 'today', label: 'Today', icon: 'ri-sun-line', description: 'Need service today' },
    { value: 'scheduled', label: 'Scheduled', icon: 'ri-calendar-event-line', description: 'Schedule for later' }
  ];

  flowTypes = [
    { value: 'standard', label: 'Standard', description: 'Regular lead with no confirmation needed' },
    { value: 'confirmed', label: 'Confirmed', description: 'Lead requires confirmation before proceeding' }
  ];

  // City search properties
  citySearchTerm: string = '';
  filteredCities: CityDto[] = [];
  showCityDropdown: boolean = false;
  loadingCities: boolean = false;
  citySearchTimeout: any;
  popularCities: CityDto[] = [];

  // Area search properties
  areaSearchTerm: string = '';
  filteredAreas: AreaDto[] = [];
  showAreaDropdown: boolean = false;
  loadingAreas: boolean = false;
  areaSearchTimeout: any;
  popularAreas: AreaDto[] = [];

  // Budget validation
  budgetMinTouched = false;
  budgetMaxTouched = false;

  constructor(
    private leadService: CustomerLeadService,
    private fb: FormBuilder
  ) {
    this.leadForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      budgetMin: [null, [Validators.min(0), Validators.max(1000000)]],
      budgetMax: [null, [Validators.min(0), Validators.max(1000000)]],
      timePreference: ['today', Validators.required],
      scheduledStart: [null],
      scheduledEnd: [null],
      isInstant: [false],
      flowType: ['standard', Validators.required]
    }, { validators: [this.dateRangeValidator, this.budgetRangeValidator] });
  }

  ngOnInit(): void {
    this.loadLeads();
    this.loadMasterData();
    this.loadPopularCities();

    this.leadForm.get('timePreference')?.valueChanges.subscribe(value => {
      this.onTimePreferenceChange(value);
    });

    // Real-time budget validation
    this.leadForm.get('budgetMin')?.valueChanges.subscribe(() => {
      this.leadForm.updateValueAndValidity({ emitEvent: false });
    });

    this.leadForm.get('budgetMax')?.valueChanges.subscribe(() => {
      this.leadForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.city-search-container')) {
      this.showCityDropdown = false;
    }
    if (!target.closest('.area-search-container')) {
      this.showAreaDropdown = false;
    }
  }

  // Custom Validators
  dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const timePreference = control.get('timePreference')?.value;
    const startDate = control.get('scheduledStart')?.value;
    const endDate = control.get('scheduledEnd')?.value;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timePreference === 'scheduled') {
      if (!startDate || !endDate) {
        return { required: true };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      // Start date cannot be in the past
      if (start < now) {
        return { startDateInPast: true };
      }

      // End date cannot be before start date
      if (end <= start) {
        return { endDateBeforeStart: true };
      }

      // End date cannot be more than 30 days from start
      const thirtyDaysLater = new Date(start);
      thirtyDaysLater.setDate(start.getDate() + 30);
      if (end > thirtyDaysLater) {
        return { maxDurationExceeded: true };
      }
    }

    return null;
  };

  budgetRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const budgetMin = control.get('budgetMin')?.value;
    const budgetMax = control.get('budgetMax')?.value;

    if (budgetMin && budgetMax) {
      if (budgetMin > budgetMax) {
        return { budgetMinGreaterThanMax: true };
      }

      // Budget range should be at least 100 if both are provided
      if (budgetMax - budgetMin < 50) {
        return { budgetRangeTooSmall: true };
      }
    }

    return null;
  };

  loadMasterData(): void {
    this.leadService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadPopularCities(): void {
    this.leadService.getCities('', 5).subscribe({
      next: (cities) => {
        this.popularCities = cities;
      },
      error: (err) => console.error('Error loading popular cities:', err)
    });
  }

  loadPopularAreas(cityId: number): void {
    this.leadService.getAreasBySearch(cityId, '', 5).subscribe({
      next: (areas) => {
        this.popularAreas = areas;
      },
      error: (err) => console.error('Error loading popular areas:', err)
    });
  }

  loadLeads(): void {
    this.loading = true;
    const filter: CustomerLeadFilterDto = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    };

    this.leadService.getUserLeads(filter).subscribe({
      next: (result: CustomerPagedResult<CustomerLeadDto>) => {
        this.leads = result.items;
        this.totalLeads = result.totalCount;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leads:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadLeads();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLeads();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.currentStep = 1;
    this.formSubmitted = false;
    this.resetSelections();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.currentStep = 1;
    this.formSubmitted = false;
    this.leadForm.reset({ 
      timePreference: 'today', 
      flowType: 'standard',
      description: '',
      budgetMin: null,
      budgetMax: null,
      scheduledStart: null,
      scheduledEnd: null,
      isInstant: false
    });
    this.resetSelections();
  }

  resetSelections(): void {
    this.selectedCategory = null;
    this.selectedSubcategory = null;
    this.selectedCity = null;
    this.selectedArea = null;
    this.subcategories = [];
    this.areas = [];
    this.citySearchTerm = '';
    this.filteredCities = [];
    this.showCityDropdown = false;
    this.areaSearchTerm = '';
    this.filteredAreas = [];
    this.showAreaDropdown = false;
    this.popularAreas = [];
    this.budgetMinTouched = false;
    this.budgetMaxTouched = false;
  }

  nextStep(): void {
    if (this.canProceed()) {
      // Validate current step before proceeding
      if (this.currentStep === 6) {
        this.validateTimePreference();
      }
      if (this.currentStep === 5) {
        this.validateBudget();
      }
      this.currentStep++;
    } else {
      // Show validation errors
      this.formSubmitted = true;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateTimePreference(): void {
    const timePref = this.leadForm.get('timePreference')?.value;
    if (timePref === 'scheduled') {
      this.leadForm.get('scheduledStart')?.markAsTouched();
      this.leadForm.get('scheduledEnd')?.markAsTouched();
    }
  }

  validateBudget(): void {
    this.budgetMinTouched = true;
    this.budgetMaxTouched = true;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: 
        return !!this.selectedCategory;
      
      case 2: 
        return true; // Subcategory is optional
      
      case 3: 
        return !!this.selectedCity;
      
      case 4: 
        return true; // Area is optional
      
      case 5: 
        // Budget validation
        const budgetMin = this.leadForm.get('budgetMin')?.value;
        const budgetMax = this.leadForm.get('budgetMax')?.value;
        
        if (budgetMin && budgetMin < 0) return false;
        if (budgetMax && budgetMax < 0) return false;
        if (budgetMin && budgetMax && budgetMin > budgetMax) return false;
        if (budgetMin && budgetMax && (budgetMax - budgetMin) < 50) return false;
        return true;
      
      case 6: 
        // Time preference validation
        const timePref = this.leadForm.get('timePreference')?.value;
        if (timePref === 'scheduled') {
          const start = this.leadForm.get('scheduledStart')?.value;
          const end = this.leadForm.get('scheduledEnd')?.value;
          
          if (!start || !end) return false;
          
          const startDate = new Date(start);
          const endDate = new Date(end);
          const now = new Date();
          
          if (startDate < now) return false;
          if (endDate <= startDate) return false;
          
          // Max 30 days duration
          const thirtyDaysLater = new Date(startDate);
          thirtyDaysLater.setDate(startDate.getDate() + 30);
          if (endDate > thirtyDaysLater) return false;
        }
        return this.leadForm.get('timePreference')?.valid ?? false;
      
      case 7: 
        return (this.leadForm.get('flowType')?.valid ?? false) &&
          (this.leadForm.get('description')?.valid ?? false);
      
      default: 
        return false;
    }
  }

  onCategorySelect(category: CategoryDto): void {
    this.selectedCategory = category;
    this.selectedSubcategory = null;
    this.loadSubcategories(category.id);
  }

  loadSubcategories(categoryId: number): void {
    this.leadService.getSubcategories(categoryId).subscribe({
      next: (data) => this.subcategories = data,
      error: (err) => console.error('Error loading subcategories:', err)
    });
  }

  onSubcategorySelect(subcategory: SubcategoryDto): void {
    this.selectedSubcategory = subcategory;
  }

  // City search methods
  searchCities(searchTerm: string): void {
    if (this.citySearchTimeout) {
      clearTimeout(this.citySearchTimeout);
    }

    this.citySearchTimeout = setTimeout(() => {
      if (searchTerm.length >= 2) {
        this.loadingCities = true;
        this.leadService.getCities(searchTerm, 20).subscribe({
          next: (cities) => {
            this.filteredCities = cities;
            this.showCityDropdown = true;
            this.loadingCities = false;
          },
          error: (err) => {
            console.error('Error searching cities:', err);
            this.filteredCities = [];
            this.loadingCities = false;
          }
        });
      } else {
        this.filteredCities = this.popularCities;
        this.showCityDropdown = true;
      }
    }, 300);
  }

  onCitySelect(city: CityDto): void {
    this.selectedCity = city;
    this.citySearchTerm = city.name;
    this.showCityDropdown = false;
    this.selectedArea = null;
    this.areaSearchTerm = '';
    this.filteredAreas = [];
    this.loadPopularAreas(city.id);
  }

  onCityInputFocus(): void {
    this.filteredCities = this.popularCities;
    this.showCityDropdown = true;
  }

  clearCitySelection(): void {
    this.selectedCity = null;
    this.citySearchTerm = '';
    this.filteredCities = [];
    this.selectedArea = null;
    this.areaSearchTerm = '';
    this.filteredAreas = [];
    this.popularAreas = [];
  }

  // Area search methods
  searchAreas(searchTerm: string): void {
    const cityId = this.selectedCity?.id;

    if (!cityId) {
      return;
    }

    if (this.areaSearchTimeout) {
      clearTimeout(this.areaSearchTimeout);
    }

    this.areaSearchTimeout = setTimeout(() => {
      if (searchTerm.length >= 2) {
        this.loadingAreas = true;

        this.leadService.getAreasBySearch(cityId, searchTerm, 20).subscribe({
          next: (areas) => {
            this.filteredAreas = areas;
            this.showAreaDropdown = true;
            this.loadingAreas = false;
          },
          error: (err) => {
            console.error('Error searching areas:', err);
            this.filteredAreas = [];
            this.loadingAreas = false;
          }
        });
      } else {
        this.filteredAreas = this.popularAreas;
        this.showAreaDropdown = true;
      }
    }, 300);
  }

  onAreaSelect(area: AreaDto): void {
    this.selectedArea = area;
    this.areaSearchTerm = area.areaName;
    this.showAreaDropdown = false;
  }

  onAreaInputFocus(): void {
    if (this.selectedCity) {
      this.filteredAreas = this.popularAreas;
      this.showAreaDropdown = true;
    }
  }

  clearAreaSelection(): void {
    this.selectedArea = null;
    this.areaSearchTerm = '';
    this.filteredAreas = [];
  }

  setBudget(budget: { min: number; max: number }): void {
    this.leadForm.patchValue({
      budgetMin: budget.min,
      budgetMax: budget.max
    });
    this.budgetMinTouched = true;
    this.budgetMaxTouched = true;
  }

  onTimePreferenceChange(pref: string): void {
    this.leadForm.patchValue({ timePreference: pref });

    if (pref === 'instant') {
      this.leadForm.patchValue({ 
        isInstant: true,
        scheduledStart: null,
        scheduledEnd: null
      });
    } else {
      this.leadForm.patchValue({ isInstant: false });
    }

    this.setDatesForPreference(pref);
  }

  setDatesForPreference(pref: string): void {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const currentTime = new Date();

    switch (pref) {
      case 'instant':
        this.leadForm.patchValue({
          scheduledStart: null,
          scheduledEnd: null,
          isInstant: true
        });
        break;

      case 'today':
        this.leadForm.patchValue({
          scheduledStart: currentTime.toISOString(),
          scheduledEnd: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
          isInstant: false
        });
        break;

      case 'scheduled':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        this.leadForm.patchValue({
          scheduledStart: null,
          scheduledEnd: null,
          isInstant: false
        });
        break;

      default:
        this.leadForm.patchValue({
          scheduledStart: null,
          scheduledEnd: null,
          isInstant: false
        });
    }
  }

  setFlowType(flowType: string): void {
    this.leadForm.patchValue({ flowType });
  }

  getBudgetMinError(): string {
    const control = this.leadForm.get('budgetMin');
    if (control?.hasError('min')) {
      return 'Minimum budget cannot be negative';
    }
    if (control?.hasError('max')) {
      return 'Maximum budget limit is ₹10,00,000';
    }
    return '';
  }

  getBudgetMaxError(): string {
    const control = this.leadForm.get('budgetMax');
    if (control?.hasError('min')) {
      return 'Maximum budget cannot be negative';
    }
    if (control?.hasError('max')) {
      return 'Maximum budget limit is ₹10,00,000';
    }
    return '';
  }

  getBudgetRangeError(): string {
    if (this.leadForm.hasError('budgetMinGreaterThanMax')) {
      return 'Minimum budget cannot be greater than maximum budget';
    }
    if (this.leadForm.hasError('budgetRangeTooSmall')) {
      return 'Budget range should be at least ₹50';
    }
    return '';
  }

  getDateError(): string {
    if (this.leadForm.hasError('startDateInPast')) {
      return 'Start date cannot be in the past';
    }
    if (this.leadForm.hasError('endDateBeforeStart')) {
      return 'End date must be after start date';
    }
    if (this.leadForm.hasError('maxDurationExceeded')) {
      return 'Service duration cannot exceed 30 days';
    }
    return '';
  }

  submitLead(): void {
    this.formSubmitted = true;

    if (!this.selectedCategory || !this.selectedCity || !this.leadForm.valid) {
      // Show validation errors
      if (this.leadForm.hasError('budgetMinGreaterThanMax')) {
        this.currentStep = 5;
      } else if (this.leadForm.hasError('startDateInPast') || 
                 this.leadForm.hasError('endDateBeforeStart') || 
                 this.leadForm.hasError('maxDurationExceeded')) {
        this.currentStep = 6;
      }
      return;
    }

    const leadData: CustomerCreateLeadDto = {
      leadType: 'b2c',
      description: this.leadForm.get('description')?.value?.trim(),
      budgetMin: this.leadForm.get('budgetMin')?.value,
      budgetMax: this.leadForm.get('budgetMax')?.value,
      timePreference: this.leadForm.get('timePreference')?.value,
      scheduledStart: this.leadForm.get('scheduledStart')?.value,
      scheduledEnd: this.leadForm.get('scheduledEnd')?.value,
      isInstant: this.leadForm.get('isInstant')?.value,
      source: 'link',
      categoryId: this.selectedCategory.id,
      subcategoryId: this.selectedSubcategory?.id,
      cityId: this.selectedCity.id,
      areaId: this.selectedArea?.id,
      flowType: this.leadForm.get('flowType')?.value
    };

    this.leadService.createLead(leadData).subscribe({
      next: (newLead) => {
        this.closeCreateModal();
        this.loadLeads();
      },
      error: (err) => {
        console.error('Error creating lead:', err);
        // Handle API validation errors
      }
    });
  }

  deleteLead(id: number): void {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.leadService.deleteLead(id).subscribe({
        next: () => {
          this.loadLeads();
        },
        error: (err) => {
          console.error('Error deleting lead:', err);
        }
      });
    }
  }

  viewLeadDetails(lead: CustomerLeadDto): void {
    console.log('View lead:', lead);
  }
  
  toggleLeadExpand(lead: CustomerLeadDto): void {
    if (this.expandedLeads.has(lead.id)) {
      this.expandedLeads.delete(lead.id);
    } else {
      this.expandedLeads.add(lead.id);
    }
  }

  isLeadExpanded(lead: CustomerLeadDto): boolean {
    return this.expandedLeads.has(lead.id);
  }

  getStatusBadgeClass(lead: CustomerLeadDto): string {
    if (lead.committedCount > 0) return 'bg-green-100 text-green-800';
    if (lead.unlockedCount > 0) return 'bg-blue-100 text-blue-800';
    if (lead.offeredCount > 0) return 'bg-yellow-100 text-yellow-800';
    if (lead.expiredCount > 0) return 'bg-gray-100 text-gray-800';
    return 'bg-purple-100 text-purple-800';
  }

  getStatusText(lead: CustomerLeadDto): string {
    if (lead.committedCount > 0) return 'Committed';
    if (lead.unlockedCount > 0) return 'Unlocked';
    if (lead.offeredCount > 0) return 'Active';
    if (lead.expiredCount > 0) return 'Expired';
    return 'New';
  }

  // Add this method to calculate duration
calculateDuration(): string {
  const start = this.leadForm.get('scheduledStart')?.value;
  const end = this.leadForm.get('scheduledEnd')?.value;
  
  if (!start || !end) return '';
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours > 0 ? diffHours + ' hour' + (diffHours > 1 ? 's' : '') : ''}`;
  } else {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }
}

// Add this method to get current date-time for min attribute
getCurrentDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
}