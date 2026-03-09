import { Component, OnInit } from '@angular/core';
import { ServicePackageService, City, ServiceCategory, ServiceSubCategory } from './services/service-package.service';
import { ServicePackage, ServicePackageCreateDto, ServicePackageUpdateDto } from './models/service-package.model';

@Component({
    selector: 'app-service-package-master',
    templateUrl: './service-package-master.component.html',
    styleUrls: ['./service-package-master.component.css'],
    standalone: false
})
export class ServicePackageMasterComponent implements OnInit {
  // Data properties
  servicePackages: ServicePackage[] = [];
  filteredPackages: ServicePackage[] = [];
  
  // Dropdown data properties
  cities: City[] = [];
  serviceCategories: ServiceCategory[] = [];
  serviceSubCategories: ServiceSubCategory[] = [];
  
  // Grouped subcategories for UI display
  groupedSubCategories: {categoryId: number, categoryName: string, subcategories: ServiceSubCategory[]}[] = [];

  // UI state properties
  initialLoading = true;
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentPackage: ServicePackage = this.getEmptyPackage();
  modalLoading: boolean = false;

  // Stats properties
  totalPackages: number = 0;
  activePackages: number = 0;
  totalRevenue: number = 0;

  // Currency options
  currencyOptions = [
    { value: 'INR', label: '₹ INR' },
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'GBP', label: '£ GBP' }
  ];

  constructor(private servicePackageService: ServicePackageService) { }

  ngOnInit(): void {
    this.fetchServicePackages();
    this.fetchDropdownData();
  }

  // Get empty package template
  getEmptyPackage(): ServicePackage {
    return {
      id: 0,
      cityId: null,
      categoryId: 0,
      name: '',
      description: '',
      basePrice: 0,
      platformCharges: null,
      visitingCharges: null,
      totalPrice: 0,
      currency: 'INR',
      isActive: true,
      parameters: {},
      metadata: {},
      createdAt: '',
      updatedAt: ''
    };
  }

  // Fetch dropdown data (cities, categories, and subcategories)
  fetchDropdownData(): void {
    // Load cities
    this.servicePackageService.getCities().subscribe({
      next: (data) => {
        this.cities = data.filter(city => city.isActive);
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
      }
    });

    // Load service categories
    this.servicePackageService.getServiceCategories().subscribe({
      next: (data) => {
        this.serviceCategories = data.filter(cat => cat.isActive);
      },
      error: (err) => {
        console.error('Failed to load service categories:', err);
      }
    });
  }

  // Get category name for display
  getCategoryName(categoryId: number): string {
    const category = this.serviceCategories.find(c => c.id === categoryId);
    return category ? category.name : `Category #${categoryId}`;
  }

  // Get subcategory name for display
  getSubCategoryName(subCategoryId: number | string): string {
    if (!subCategoryId) return '';
    
    if (typeof subCategoryId === 'string') {
      // Try to parse string to number
      const id = parseInt(subCategoryId, 10);
      if (isNaN(id)) {
        // If it's not a number, return the string itself
        return subCategoryId;
      }
      subCategoryId = id;
    }
    
    const subCategory = this.serviceSubCategories.find(s => s.id === subCategoryId);
    return subCategory ? subCategory.name : `Subcategory #${subCategoryId}`;
  }

  // When category changes in modal
  onCategoryChange(): void {
    // Reset name when category changes
    this.currentPackage.name = '';
    
    if (this.currentPackage.categoryId) {
      // Fetch subcategories for the selected category
      this.fetchSubCategoriesByCategory(this.currentPackage.categoryId);
    } else {
      this.groupedSubCategories = [];
    }
  }

  // When subcategory changes in modal
  onSubCategoryChange(): void {
    // This method can be used for additional logic when subcategory changes
  }

  // Helper method to get selected subcategory display name
  getSelectedSubCategoryDisplayName(): string {
    if (!this.currentPackage.name) return '';
    
    // Try to parse as number first
    const id = parseInt(this.currentPackage.name, 10);
    if (!isNaN(id)) {
      // Find subcategory in the current grouped list
      for (const group of this.groupedSubCategories) {
        const subCategory = group.subcategories.find(s => s.id === id);
        if (subCategory) {
          return subCategory.name;
        }
      }
      return `Subcategory #${id}`;
    }
    
    // If not a number, return the string itself
    return this.currentPackage.name;
  }

  // Calculate total price
  calculateTotalPrice(): number {
    const basePrice = this.currentPackage.basePrice || 0;
    const platformCharges = this.currentPackage.platformCharges || 0;
    const visitingCharges = this.currentPackage.visitingCharges || 0;
    
    this.currentPackage.totalPrice = basePrice + platformCharges + visitingCharges;
    return this.currentPackage.totalPrice;
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentPackage = this.getEmptyPackage();
    this.groupedSubCategories = [];
    this.showModal = true;
  }

  editPackage(pkg: ServicePackage): void {
    this.isEditMode = true;
    this.currentPackage = { ...pkg };
    this.groupedSubCategories = [];
    
    // Set the category ID and fetch subcategories for that category
    if (this.currentPackage.categoryId) {
      this.fetchSubCategoriesByCategoryForEdit(this.currentPackage.categoryId, pkg.name);
    }
    
    this.showModal = true;
  }

  // Helper to find subcategory by name and category
  findSubCategoryByName(name: string, categoryId: number): ServiceSubCategory | null {
    for (const group of this.groupedSubCategories) {
      if (group.categoryId === categoryId) {
        const subCat = group.subcategories.find(s => s.name === name);
        if (subCat) return subCat;
      }
    }
    return null;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPackage = this.getEmptyPackage();
    this.groupedSubCategories = [];
    this.modalLoading = false;
  }

  savePackage(): void {
    if (this.isEditMode) {
      this.updatePackage();
    } else {
      this.createPackage();
    }
  }

  createPackage(): void {
    // Validate required fields
    if (!this.currentPackage.name) {
      alert('Subcategory selection is required!');
      return;
    }
    if (!this.currentPackage.categoryId) {
      alert('Category is required!');
      return;
    }
    if (!this.currentPackage.basePrice || this.currentPackage.basePrice <= 0) {
      alert('Base price must be greater than 0!');
      return;
    }

    // Ensure basePrice is a number
    const basePrice = Number(this.currentPackage.basePrice);
    if (isNaN(basePrice)) {
      alert('Please enter a valid number for base price!');
      return;
    }

    // Ensure optional charges are valid numbers or null
    const platformCharges = this.currentPackage.platformCharges 
      ? Number(this.currentPackage.platformCharges) 
      : null;
    
    const visitingCharges = this.currentPackage.visitingCharges 
      ? Number(this.currentPackage.visitingCharges) 
      : null;

    // Get subcategory name from the selected ID
    let subCategoryName = this.currentPackage.name;
    const subCategoryId = parseInt(this.currentPackage.name, 10);
    
    if (!isNaN(subCategoryId)) {
      // Find subcategory in current grouped list
      for (const group of this.groupedSubCategories) {
        const subCategory = group.subcategories.find(s => s.id === subCategoryId);
        if (subCategory) {
          subCategoryName = subCategory.name;
          break;
        }
      }
    }

    const createDto: ServicePackageCreateDto = {
      cityId: this.currentPackage.cityId,
      categoryId: this.currentPackage.categoryId,
      name: subCategoryName.trim(),
      description: this.currentPackage.description?.trim() || null,
      basePrice: basePrice,
      platformCharges: platformCharges,
      visitingCharges: visitingCharges,
      currency: this.currentPackage.currency,
      isActive: this.currentPackage.isActive
    };

    this.modalLoading = true;

    this.servicePackageService.createServicePackage(createDto)
      .subscribe({
        next: () => {
          this.fetchServicePackages();
          this.closeModal();
          alert('Service package created successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error creating service package:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 409) {
            alert('Service package with this name already exists');
          } else if (err.status === 404) {
            alert('City or Category not found');
          } else {
            alert('Failed to create service package. Please try again.');
          }
        }
      });
  }

  updatePackage(): void {
    // Validate required fields
    if (!this.currentPackage.name) {
      alert('Subcategory selection is required!');
      return;
    }
    if (!this.currentPackage.categoryId) {
      alert('Category is required!');
      return;
    }

    // Ensure basePrice is a number
    const basePrice = Number(this.currentPackage.basePrice);
    if (!basePrice || basePrice <= 0) {
      alert('Base price must be greater than 0!');
      return;
    }
    if (isNaN(basePrice)) {
      alert('Please enter a valid number for base price!');
      return;
    }

    // Ensure optional charges are valid numbers or null
    const platformCharges = this.currentPackage.platformCharges 
      ? Number(this.currentPackage.platformCharges) 
      : null;
    
    const visitingCharges = this.currentPackage.visitingCharges 
      ? Number(this.currentPackage.visitingCharges) 
      : null;

    // Get subcategory name from the selected ID
    let subCategoryName = this.currentPackage.name;
    const subCategoryId = parseInt(this.currentPackage.name, 10);
    
    if (!isNaN(subCategoryId)) {
      // Find subcategory in current grouped list
      for (const group of this.groupedSubCategories) {
        const subCategory = group.subcategories.find(s => s.id === subCategoryId);
        if (subCategory) {
          subCategoryName = subCategory.name;
          break;
        }
      }
    }

    const updateData: ServicePackageUpdateDto = {
      cityId: this.currentPackage.cityId,
      categoryId: this.currentPackage.categoryId,
      name: subCategoryName.trim(),
      description: this.currentPackage.description?.trim() || null,
      basePrice: basePrice,
      platformCharges: platformCharges,
      visitingCharges: visitingCharges,
      currency: this.currentPackage.currency,
      isActive: this.currentPackage.isActive
    };

    this.modalLoading = true;

    this.servicePackageService.updateServicePackage(this.currentPackage.id, updateData)
      .subscribe({
        next: () => {
          this.fetchServicePackages();
          this.closeModal();
          alert('Service package updated successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error updating service package:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 404) {
            alert('Service package not found');
          } else if (err.status === 409) {
            alert('Service package with this name already exists');
          } else {
            alert('Failed to update service package. Please try again.');
          }
        }
      });
  }

  // Fetch all service packages
  fetchServicePackages(): void {
    this.loading = true;
    this.error = null;

    this.servicePackageService.getAllServicePackages()
      .subscribe({
        next: (data) => {
          this.servicePackages = data;
          this.filteredPackages = [...data];
          this.calculateStats();
          this.loading = false;
          this.initialLoading = false; 
        },
        error: (err) => {
          this.error = 'Failed to load service packages. Please try again.';
          this.loading = false;
          this.initialLoading = false; 
          console.error('Error fetching service packages:', err);
        }
      });
  }

  calculateStats(): void {
    this.totalPackages = this.servicePackages.length;
    this.activePackages = this.servicePackages.filter(p => p.isActive).length;
    this.totalRevenue = this.servicePackages.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
  }

  filterPackages(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPackages = [...this.servicePackages];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredPackages = this.servicePackages.filter(pkg =>
      pkg.name.toLowerCase().includes(term) ||
      (pkg.description && pkg.description.toLowerCase().includes(term))
    );
  }

  refreshData(): void {
    this.fetchServicePackages();
    this.fetchDropdownData();
    this.searchTerm = '';
  }

  toggleActive(pkg: ServicePackage): void {
    const newStatus = !pkg.isActive;

    const updateData: ServicePackageUpdateDto = {
      cityId: pkg.cityId,
      categoryId: pkg.categoryId,
      name: pkg.name,
      description: pkg.description,
      basePrice: pkg.basePrice,
      platformCharges: pkg.platformCharges,
      visitingCharges: pkg.visitingCharges,
      currency: pkg.currency,
      isActive: newStatus
    };

    pkg.updating = true;

    this.servicePackageService.updateServicePackage(pkg.id, updateData)
      .subscribe({
        next: () => {
          this.fetchServicePackages();
          alert(`Service package "${pkg.name}" is now ${newStatus ? 'active' : 'inactive'}`);
        },
        error: (err) => {
          pkg.updating = false;
          console.error('Error updating service package:', err);
          alert('Failed to update service package');
        }
      });
  }

  confirmDelete(pkg: ServicePackage): void {
    if (confirm(`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`)) {
      this.deletePackage(pkg);
    }
  }

  deletePackage(pkg: ServicePackage): void {
    pkg.deleting = true;

    this.servicePackageService.deleteServicePackage(pkg.id)
      .subscribe({
        next: () => {
          this.fetchServicePackages();
          alert(`Service package "${pkg.name}" deleted successfully`);
        },
        error: (err) => {
          pkg.deleting = false;
          console.error('Error deleting service package:', err);
          
          if (err.status === 400) {
            alert('Cannot delete this service package as it is being used in the system.');
          } else if (err.status === 404) {
            alert('Service package not found');
          } else {
            alert('Failed to delete service package');
          }
        }
      });
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper to get city name
  getCityName(cityId: number | null): string {
    if (!cityId) return 'No City';
    const city = this.cities.find(c => c.id === cityId);
    return city ? city.name : `City #${cityId}`;
  }

  // New method for fetching subcategories in edit mode
  fetchSubCategoriesByCategoryForEdit(categoryId: number, packageName: string): void {
    if (!categoryId) {
      this.groupedSubCategories = [];
      return;
    }

    this.servicePackageService.getServiceSubCategoriesByCategoryId(categoryId)
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
          
          // Now find the subcategory that matches the package name
          const matchingSubCat = activeSubcategories.find(s => s.name === packageName);
          if (matchingSubCat) {
            // Set the currentPackage.name to the subcategory ID (as string)
            this.currentPackage.name = matchingSubCat.id.toString();
          } else {
            // If no match found, leave it as is (it will show as blank)
            this.currentPackage.name = '';
          }
        },
        error: (err) => {
          console.error('Failed to load subcategories:', err);
          this.groupedSubCategories = [];
        }
      });
  }

  // Also update the regular fetch method to remove the edit logic
  fetchSubCategoriesByCategory(categoryId: number): void {
    if (!categoryId) {
      this.groupedSubCategories = [];
      return;
    }

    this.servicePackageService.getServiceSubCategoriesByCategoryId(categoryId)
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
}