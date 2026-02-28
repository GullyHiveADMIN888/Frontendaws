

import { Component, OnInit } from '@angular/core';
import { SellerService,  ProviderService, ProviderServicesResponse } from '../seller.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
   sellerId!: number;
  // UI state properties
  initialLoading = true;// For modal loading state

  constructor(private sellerService: SellerService) {}

totalLeads = 0;
totalResponses = 0;
acceptedResponses = 0;
pendingResponses = 0;
totalBalance=0;
coverageArea = {
  cityId: null as number | null,
  areaIds: [] as number[]
};
// ngOnInit() {
//   this.sellerService.getDashboardData().subscribe(d => {
//     this.user = d;
//     this.sellerId = d.sellerId;

//     // Leads
//     this.sellerService.getLeads().subscribe(leads => {
//       this.totalLeads = leads.length;
//     });

//     // Responses (NOW sellerId exists)
//     this.sellerService.getMyResponses(this.sellerId).subscribe(res => {
//       const responses = res.data;
//       this.totalResponses = responses.length;
//       this.acceptedResponses = responses.filter(r => r.status === 'accepted').length;
//       this.pendingResponses = responses.filter(r => r.status === 'pending').length;
//         this.totalBalance = d.totalBalance || 0;
//     });

//     // Load services
//   //  this.loadProviderServices(this.sellerId);
//   });
// }
ngOnInit() {
  this.initialLoading = true;

  this.sellerService.getDashboardData().subscribe({
    next: (d) => {
      this.user = d;
      this.sellerId = d.sellerId;
      this.totalBalance = d.totalBalance || 0;

      // Leads
      this.sellerService.getLeads().subscribe({
        next: (leads) => {
          this.totalLeads = leads.length;

          // Responses (call after leads)
          this.sellerService.getMyResponses(this.sellerId).subscribe({
            next: (res) => {
              const responses = res.data;

              this.totalResponses = responses.length;
              this.acceptedResponses =
                responses.filter(r => r.status === 'accepted').length;
              this.pendingResponses =
                responses.filter(r => r.status === 'pending').length;

              // 🔥 STOP LOADER HERE
              this.initialLoading = false;
            },
            error: (err) => {
              console.error(err);
              this.initialLoading = false;
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.initialLoading = false;
        }
      });
    },
    error: (err) => {
      console.error(err);
      this.initialLoading = false;
    }
  });
}

  loadDashboardData(): void {

 
    this.sellerService.getDashboardData().subscribe({
      next: dashboard => {
        console.log('Dashboard data:', dashboard);
        this.user = dashboard; // 👈 STORE FULL DASHBOARD
          this.initialLoading = false;
      },
      error: err => 
      {
          this.initialLoading = false;
        console.error('Failed to load dashboard data', err)
      }
    });
  }

  // Services
  services: { categoryId: number; subCategoryIds: number[] }[] = [];
  selectedCategory: number | null = null;
  editCategoryId: number | null = null;
  editSubCategoryIds: number[] = [];

  // Dropdown options
  parentCategories: any[] = [];
  subCategories: any[] = [];
  cities: any[] = [];

 // pincodeInput = '';
  showServicesModal = false;

onCategoryChange(categoryId: number) {
  this.editCategoryId = categoryId;

  // Clear previously selected subcategories for new category
  this.editSubCategoryIds = [];

  // Fetch subcategories dynamically from API
  this.sellerService.getSubCategories(categoryId).subscribe(subs => {
    this.subCategories = subs;

    // If this category already has selected subcategories in services, prefill
    const existingService = this.services.find(s => s.categoryId === categoryId);
    if (existingService) {
      this.editSubCategoryIds = [...existingService.subCategoryIds];
    }

    // ✅ Load questions for selected subcategories
    this.subCategoryQuestions = []; // clear previous questions
    this.selectedQuestions = []; // clear previous selections
    this.editSubCategoryIds.forEach(subId => {
      this.loadQuestionsForSubCategory(subId, true);
    });
  });
}


isSubCategorySelected(subId: number): boolean {
  return this.editSubCategoryIds.includes(subId);
}


removeService(index: number) {
  this.services.splice(index, 1);
}




// Get category name from ID safely
getCategoryName(categoryId: number): string {
  const cat = this.parentCategories.find(c => c.id === categoryId);
  return cat ? cat.name : '';
}


getSubCategoryName(subId: number): string {
  const sub = this.subCategories.find(sc => sc.id === subId);
  return sub ? sub.name : '';
}

// Returns a comma-separated string of subcategory names for a service
getSubCategoryNames(service: { categoryId: number; subCategoryIds: number[] }): string {
  if (!service || !service.subCategoryIds) return '';
  return service.subCategoryIds
    .map(subId => this.getSubCategoryName(subId)) // call the existing helper
    .join(', ');
}







closeServicesModal() {
  this.showServicesModal = false;
}


saveServicesAndArea() {
  if (!this.sellerId) return;

  // Add currently editing category if not already in updatedServices
  if (this.editCategoryId && this.editSubCategoryIds.length > 0) {
    const exists = this.updatedServices.find(s => s.categoryId === this.editCategoryId);
    if (exists) {
      exists.subCategoryIds = [...this.editSubCategoryIds];
    } else {
      this.updatedServices.push({
        categoryId: this.editCategoryId,
        subCategoryIds: [...this.editSubCategoryIds]
      });
    }
  }

  // 🔹 Only send unchecked questions
  const uncheckedQuestions = this.subCategoryQuestions
    .filter(q => !this.selectedQuestions.includes(q.id))
    .map(q => ({
      categoryId: this.editCategoryId!,
      subCategoryId: q.subCategoryId,
      questionId: q.id,
      isChecked: false
    }));

  const payload = {
    services: this.updatedServices, 
  
  serviceArea: this.coverageArea,
    questions: uncheckedQuestions  
  };

  this.sellerService.updateServicesAndArea(this.sellerId, payload).subscribe({
    next: () => {
      console.log('Saved successfully');
      this.showServicesModal = false;

      // Reset updatedServices after successful save
      this.updatedServices = [];
    },
    error: err => console.error(err)
  });
}




addService() {
  if (!this.editCategoryId || this.editSubCategoryIds.length === 0) return;

  const existing = this.services.find(s => s.categoryId === this.editCategoryId);
  if (existing) {
    existing.subCategoryIds = [...this.editSubCategoryIds];
  } else {
    this.services.push({
      categoryId: this.editCategoryId,
      subCategoryIds: [...this.editSubCategoryIds]
    });
  }

  // reset selections
  this.editCategoryId = null;
  this.editSubCategoryIds = [];
  this.subCategories = [];
}



subCategoryQuestions: any[] = []; // questions for selected subcategory
selectedQuestions: number[] = [];  // question IDs checked by user
serviceProviderQuestions: number[] = []; // existing checked questions from backend



// New array to track only edited services
updatedServices: { categoryId: number; subCategoryIds: number[] }[] = [];

toggleSubCategory(subId: number) {
  const index = this.editSubCategoryIds.indexOf(subId);

  if (index > -1) {
    // Remove subcategory
    this.editSubCategoryIds.splice(index, 1);

    // Remove questions
    const removedQuestionIds = this.subCategoryQuestions
      .filter(q => q.subCategoryId === subId)
      .map(q => q.id);

    this.subCategoryQuestions =
      this.subCategoryQuestions.filter(q => q.subCategoryId !== subId);

    this.selectedQuestions =
      this.selectedQuestions.filter(id => !removedQuestionIds.includes(id));

  } else {
    // Add new subcategory
    this.editSubCategoryIds.push(subId);
    this.loadQuestionsForSubCategory(subId);
  }

  if (!this.editCategoryId) return;

  // Update only updatedServices (not all old services)
  const existing = this.updatedServices.find(s => s.categoryId === this.editCategoryId);

  if (this.editSubCategoryIds.length === 0) {
    // Remove category if no subcategories
    if (existing) {
      this.updatedServices = this.updatedServices.filter(s => s.categoryId !== this.editCategoryId);
    }
  } else {
    if (existing) {
      existing.subCategoryIds = [...this.editSubCategoryIds];
    } else {
      this.updatedServices.push({
        categoryId: this.editCategoryId,
        subCategoryIds: [...this.editSubCategoryIds]
      });
    }
  }
}



loadQuestionsForSubCategory(subId: number, isInitialLoad: boolean = false) {

  this.sellerService.getQuestionsBySubCategory(subId).subscribe(res => {

    const questions = res.data.map((q: any) => ({

      ...q,
      subCategoryId: subId,

      // unchecked stored in DB → invert
      checked: !this.serviceProviderQuestions.includes(q.id)
    }));


    // remove old questions of this subcategory
    this.subCategoryQuestions =
      this.subCategoryQuestions.filter(q => q.subCategoryId !== subId);

    this.subCategoryQuestions.push(...questions);


    // sync selected array
    questions.forEach(q => {

      const exists = this.selectedQuestions.includes(q.id);

      if (q.checked && !exists) {
        this.selectedQuestions.push(q.id);
      }

      if (!q.checked && exists) {
        this.selectedQuestions =
          this.selectedQuestions.filter(id => id !== q.id);
      }

    });

  });
}



removeQuestionsForSubCategory(subId: number) {
  this.subCategoryQuestions = this.subCategoryQuestions.filter(q => q.subCategoryId !== subId);
}

toggleQuestion(questionId: number): void {
  const index = this.selectedQuestions.indexOf(questionId);
  if (index > -1) {
    this.selectedQuestions.splice(index, 1);
  } else {
    this.selectedQuestions.push(questionId);
  }
}





areas: { id: number, name: string }[] = [];


onCityChange(cityId: number) {
  if (!cityId) {
    this.areas = [];
    this.selectedAreaIds = [];
    return;
  }

  this.selectedAreaIds = []; // reset previous selections

  this.sellerService.getAreasByCity(cityId).subscribe(res => {
    this.areas = res.map(a => ({
      id: Number(a.id),
      name: a.area_name
    }));
  });
}

// openEditServices() {
//   if (!this.sellerId) return;

//   this.sellerService.getProviderServices(this.sellerId).subscribe({
//     next: (data) => {
//        console.log("Full provider services data:", data);
//       // 1️⃣ Load services, categories, cities
//       this.services = data.providerServices ?? [];
//       this.parentCategories = data.categories ?? [];
//       this.cities = data.cities ?? [];

      
//       if (data.serviceAreas && data.serviceAreas.length > 0) {

//   const firstCity = data.serviceAreas[0].cityId;

//   this.coverageArea.cityId = firstCity;

//   this.coverageArea.areaIds = data.serviceAreas.map(a => a.areaId);

//   this.onCityChange(firstCity);
// }

//       // 4️⃣ Preselect first service category/subcategories
//       if (this.services.length > 0) {
//         const firstService = this.services[0];
//         this.editCategoryId = firstService.categoryId;
//         this.editSubCategoryIds = [...firstService.subCategoryIds];

//         this.sellerService.getSubCategories(this.editCategoryId)
//           .subscribe(res => this.subCategories = res);
//       }

//       // Show modal
//       this.showServicesModal = true;
//     },
//     error: err => console.error(err)
//   });
// }
openEditServices() {
  if (!this.sellerId) return;

  this.sellerService.getProviderServices(this.sellerId).subscribe({
    next: (data) => {
      console.log("Full provider services data:", data);

      // Load services, categories, cities
      this.services = data.providerServices ?? [];
      this.parentCategories = data.categories ?? [];
      this.cities = data.cities ?? [];

      // ❌ Missing before: preselected question IDs
      this.serviceProviderQuestions = data.providerQuestionIds || [];

      // Preselect coverage areas
      if (data.serviceAreas && data.serviceAreas.length > 0) {
        const firstCity = data.serviceAreas[0].cityId;
        this.coverageArea.cityId = firstCity;
        this.coverageArea.areaIds = data.serviceAreas.map(a => a.areaId);
        this.onCityChange(firstCity);
      }

      // Preselect first service
      if (this.services.length > 0) {
        const firstService = this.services[0];
        this.editCategoryId = firstService.categoryId;
        this.editSubCategoryIds = [...firstService.subCategoryIds];

        this.sellerService.getSubCategories(this.editCategoryId)
          .subscribe(res => this.subCategories = res);

        // ✅ Load questions for subcategories
        this.editSubCategoryIds.forEach(subId => {
          this.loadQuestionsForSubCategory(subId, true);
        });
      }

      this.showServicesModal = true;
    },
    error: err => console.error(err)
  });
}


dropdownOpen = false;
areaSearch = '';


get selectedAreas() {
  return this.areas.filter(a =>
    this.coverageArea.areaIds.includes(a.id)
  );
}

// Toggle dropdown visibility
toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}




// Remove tag when clicking X
filteredAreas(): { id: number; name: string }[] {
  const search = this.areaSearch?.toLowerCase() || '';
  return this.areas.filter(a =>
    !this.coverageArea.areaIds.includes(a.id) && // ❌ exclude already selected
    a.name.toLowerCase().includes(search)
  );
}

toggleAreaSelection(area: {id: number, name: string}) {
  const idx = this.coverageArea.areaIds.indexOf(area.id);

  if (idx > -1) {
    // Already selected → remove it
    this.coverageArea.areaIds.splice(idx, 1);
  } else {
    // Not selected → add it
    this.coverageArea.areaIds.push(area.id);
  }

  // Keep dropdown open for multi-select
  this.dropdownOpen = true;

  // Clear search text
  this.areaSearch = '';
}

removeArea(area: {id: number, name: string}, event: Event) {
  event.stopPropagation();
  const idx = this.coverageArea.areaIds.indexOf(area.id);
  if (idx > -1) {
    this.coverageArea.areaIds.splice(idx, 1);
  }
}
// areas: { id: number, name: string }[] = [];
selectedAreaIds: number[] = [];
serviceArea: { cityId?: number, areaId?: number, areaName?: string } = {};
}







