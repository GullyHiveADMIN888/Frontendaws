import { Component, OnInit } from '@angular/core';
import { ServicePackageService, City, ServiceCategory } from './services/service-package.service';
import { ServicePackage, ServicePackageCreateDto, ServicePackageUpdateDto } from './models/service-package.model';

@Component({
  selector: 'app-service-package-master',
  templateUrl: './service-package-master.component.html',
  styleUrls: ['./service-package-master.component.css']
})
export class ServicePackageMasterComponent implements OnInit {
  // Data properties
  servicePackages: ServicePackage[] = [];
  filteredPackages: ServicePackage[] = [];
  
  // Dropdown data properties
  cities: City[] = [];
  serviceCategories: ServiceCategory[] = [];

  // UI state properties
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
      currency: 'INR',
      isActive: true,
      parameters: {},
      metadata: {},
      createdAt: '',
      updatedAt: ''
    };
  }

  // Fetch dropdown data (cities and categories)
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

  // Helper methods to get names for display
  getCityName(cityId: number | null): string {
    if (!cityId) return 'No City';
    const city = this.cities.find(c => c.id === cityId);
    return city ? city.name : `City #${cityId}`;
  }

  getCategoryName(categoryId: number): string {
    const category = this.serviceCategories.find(c => c.id === categoryId);
    return category ? category.name : `Category #${categoryId}`;
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentPackage = this.getEmptyPackage();
    this.showModal = true;
  }

  editPackage(pkg: ServicePackage): void {
    this.isEditMode = true;
    this.currentPackage = { ...pkg };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPackage = this.getEmptyPackage();
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
    if (!this.currentPackage.name.trim()) {
      alert('Package name is required!');
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

    const createDto: ServicePackageCreateDto = {
      cityId: this.currentPackage.cityId,
      categoryId: this.currentPackage.categoryId,
      name: this.currentPackage.name.trim(),
      description: this.currentPackage.description?.trim() || null,
      basePrice: basePrice,
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
    if (!this.currentPackage.name.trim()) {
      alert('Package name is required!');
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

    const updateData: ServicePackageUpdateDto = {
      cityId: this.currentPackage.cityId,
      categoryId: this.currentPackage.categoryId,
      name: this.currentPackage.name.trim(),
      description: this.currentPackage.description?.trim() || null,
      basePrice: basePrice,
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
        },
        error: (err) => {
          this.error = 'Failed to load service packages. Please try again.';
          this.loading = false;
          console.error('Error fetching service packages:', err);
        }
      });
  }

  calculateStats(): void {
    this.totalPackages = this.servicePackages.length;
    this.activePackages = this.servicePackages.filter(p => p.isActive).length;
    this.totalRevenue = this.servicePackages.reduce((sum, p) => sum + p.basePrice, 0);
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
    this.fetchDropdownData(); // Also refresh dropdown data
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
}