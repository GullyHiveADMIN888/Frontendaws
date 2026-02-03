

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

  constructor(private sellerService: SellerService) {}

totalLeads = 0;
totalResponses = 0;
acceptedResponses = 0;
pendingResponses = 0;


ngOnInit() {
  this.sellerService.getDashboardData().subscribe(d => {
    this.user = d;
    this.sellerId = d.sellerId;

    // Leads
    this.sellerService.getLeads().subscribe(leads => {
      this.totalLeads = leads.length;
    });

    // Responses (NOW sellerId exists)
    this.sellerService.getMyResponses(this.sellerId).subscribe(res => {
      const responses = res.data;
      this.totalResponses = responses.length;
      this.acceptedResponses = responses.filter(r => r.status === 'accepted').length;
      this.pendingResponses = responses.filter(r => r.status === 'pending').length;
    });

    // Load services
    this.loadProviderServices(this.sellerId);
  });
}


  loadDashboardData(): void {
    this.sellerService.getDashboardData().subscribe({
      next: dashboard => {
        console.log('Dashboard data:', dashboard);
        this.user = dashboard; // 👈 STORE FULL DASHBOARD
      },
      error: err => console.error('Failed to load dashboard data', err)
    });
  }

  // Services
  services: { categoryId: number; subCategoryIds: number[] }[] = [];
  selectedCategory: number | null = null;
  //selectedSubCategory: number | null = null;
  editCategoryId: number | null = null;
  editSubCategoryIds: number[] = [];

  // Dropdown options
  parentCategories: any[] = [];
  subCategories: any[] = [];
  cities: any[] = [];

  // Service area
  serviceArea: {
    type: 'city_radius' | 'polygon' | 'pincode_list' | '';
    cityId?: number;
    radiusKm?: number;
    pincodes: string[];
  } = { type: 'city_radius', pincodes: [] };

  pincodeInput = '';
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
// onCategoryChange(categoryId: number) {

//   this.editCategoryId = categoryId;

//   // ✅ HARD RESET
//   this.editSubCategoryIds = [];
//   this.subCategoryQuestions = [];
//   this.selectedQuestions = [];

//   // Fetch subcategories
//   this.sellerService.getSubCategories(categoryId).subscribe(subs => {

//     this.subCategories = subs;

//     // Check if provider already has services in this category
//     const existingService = this.services.find(s => s.categoryId === categoryId);

//     if (existingService) {

//       this.editSubCategoryIds = [...existingService.subCategoryIds];

//       // ✅ Load questions for each subcategory
//       this.editSubCategoryIds.forEach(subId => {
//         this.loadQuestionsForSubCategory(subId, true);
//       });
//     }
//   });
// }


isSubCategorySelected(subId: number): boolean {
  return this.editSubCategoryIds.includes(subId);
}

addPincode() {
  if (this.pincodeInput && !this.serviceArea.pincodes.includes(this.pincodeInput)) {
    this.serviceArea.pincodes.push(this.pincodeInput);
    this.pincodeInput = '';
  }
}

removePincode(index: number) {
  this.serviceArea.pincodes.splice(index, 1);
}

removeService(index: number) {
  this.services.splice(index, 1);
}


loadProviderServices(providerId: number) {
  this.sellerService.getProviderServices(providerId).subscribe({
    next: (data) => {

      console.log('Provider services API data:', data);

      // ✅ FIXED HERE
      this.services = data.providerServices.map(s => ({
        categoryId: s.categoryId,
        subCategoryIds: s.subCategoryIds
      }));

      if (data.serviceArea) {
  this.serviceArea = {
    type: data.serviceArea.type,
    cityId: data.serviceArea.cityId,
    radiusKm: data.serviceArea.radiusKm,
    pincodes: Array.isArray(data.serviceArea.pincodes)
      ? [...data.serviceArea.pincodes]
      : []
  };
}


      // ✅ load dropdown reference data
      this.parentCategories = data.categories;
      this.subCategories = data.subCategories;
      this.cities = data.cities;
      this.serviceProviderQuestions = data.providerQuestionIds || [];
      if (this.services.length > 0) {
        this.onCategoryChange(this.services[0].categoryId);
      }
    },
    error: err => console.error(err)
  });
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


openEditServices() {
  if (!this.sellerId) return;

  this.sellerService.getProviderServices(this.sellerId).subscribe({
    next: (data) => {
      this.services = data.providerServices ?? [];
      this.parentCategories = data.categories ?? [];
      this.cities = data.cities ?? [];
     // this.serviceArea = data.serviceArea ?? { type: '', pincodes: [] };
     this.serviceArea = {
  type: data.serviceArea?.type ?? '',
  cityId: data.serviceArea?.cityId,
  radiusKm: data.serviceArea?.radiusKm,
  pincodes: Array.isArray(data.serviceArea?.pincodes)
    ? [...data.serviceArea.pincodes]
    : []
};

      if (this.services.length > 0) {
        const firstService = this.services[0];
        this.editCategoryId = firstService.categoryId;
        this.editSubCategoryIds = [...firstService.subCategoryIds];

        // Load subcategories dynamically
        this.sellerService.getSubCategories(this.editCategoryId)
          .subscribe(res => this.subCategories = res);
      }

      this.showServicesModal = true; // ✅ open popup
    },
    error: err => console.error(err)
  });
}

// openEditServices() {
//   if (!this.sellerId) return;

//   this.sellerService.getProviderServices(this.sellerId).subscribe({
//     next: (data) => {
//       this.services = data.providerServices ?? [];
//       this.parentCategories = data.categories ?? [];
//       this.cities = data.cities ?? [];
//       this.serviceArea = {
//         type: data.serviceArea?.type ?? '',
//         cityId: data.serviceArea?.cityId,
//         radiusKm: data.serviceArea?.radiusKm,
//         pincodes: Array.isArray(data.serviceArea?.pincodes)
//           ? [...data.serviceArea.pincodes]
//           : []
//       };

//       // Reset category/subcategory selections
//       this.editCategoryId = null;
//       this.subCategories = [];
//       this.editSubCategoryIds = [];
//       this.subCategoryQuestions = [];
//       this.selectedQuestions = [];

//       // Preload only if there is a selected category
//       if (this.services.length > 0) {
//         const firstService = this.services[0];
//         if (firstService.categoryId) {
//           this.editCategoryId = firstService.categoryId;
//           this.editSubCategoryIds = [...firstService.subCategoryIds];
//           this.onCategoryChange(this.editCategoryId, true); // true = preload questions
//         }
//       }

//       this.showServicesModal = true;
//     },
//     error: err => console.error(err)
//   });
// }





closeServicesModal() {
  this.showServicesModal = false;
}


// saveServicesAndArea() {
//   if (!this.sellerId) return;

//   const payload = {
//     services: this.services,
//     serviceArea: this.serviceArea,
//     questions: this.subCategoryQuestions
//   .filter(q => !this.selectedQuestions.includes(q.id))
//   .map(({ id, subCategoryId }) => ({
//     categoryId: this.editCategoryId!,
//     subCategoryId,
//     questionId: id,
//     isChecked: false
//   }))

//   };

//   this.sellerService.updateServicesAndArea(this.sellerId, payload).subscribe({
//     next: () => {
//       console.log('Saved successfully');
//       this.showServicesModal = false;
//     },
//     error: err => console.error(err)
//   });
// }
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
    services: this.updatedServices,  // Only send updated selections
    serviceArea: this.serviceArea,
    questions: uncheckedQuestions  // 🔹 Send only false questions
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



// toggleSubCategory(subId: number) {

//   const index = this.editSubCategoryIds.indexOf(subId);

//   if (index > -1) {

//     // ✅ Remove subcategory
//     this.editSubCategoryIds.splice(index, 1);

//     // Get question ids to remove
//     const removedQuestionIds = this.subCategoryQuestions
//       .filter(q => q.subCategoryId === subId)
//       .map(q => q.id);

//     // Remove questions
//     this.subCategoryQuestions =
//       this.subCategoryQuestions.filter(q => q.subCategoryId !== subId);

//     // Remove selections
//     this.selectedQuestions =
//       this.selectedQuestions.filter(id => !removedQuestionIds.includes(id));

//   } else {

//     this.editSubCategoryIds.push(subId);
//     this.loadQuestionsForSubCategory(subId);
//   }
// }

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


}







