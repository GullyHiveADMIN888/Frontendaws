

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
  });
}

toggleSubCategory(subId: number) {
  const index = this.editSubCategoryIds.indexOf(subId);
  if (index > -1) this.editSubCategoryIds.splice(index, 1);
  else this.editSubCategoryIds.push(subId);
}
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

      // ✅ service area
      // if (data.serviceArea) {
      //   this.serviceArea = {
      //     type: data.serviceArea.type,
      //     cityId: data.serviceArea.cityId,
      //     radiusKm: data.serviceArea.radiusKm,
      //     pincodes: data.serviceArea.pincodes || []
      //   };
      // }
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

      if (this.services.length > 0) {
        this.onCategoryChange(this.services[0].categoryId);
      }
    },
    error: err => console.error(err)
  });
}

// dashboard.component.ts

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



closeServicesModal() {
  this.showServicesModal = false;
}

saveServicesAndArea() {
  if (!this.sellerId) return;

  const payload = {
    services: this.services,       // your categories + subcategories
    serviceArea: this.serviceArea  // city/radius/pincode info
  };

  this.sellerService.updateServicesAndArea(this.sellerId, payload).subscribe({
    next: (res) => {
      console.log('Services updated successfully', res);
      this.showServicesModal = false; // close modal
    },
    error: (err) => {
      console.error('Failed to update services', err);
    }
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

}







