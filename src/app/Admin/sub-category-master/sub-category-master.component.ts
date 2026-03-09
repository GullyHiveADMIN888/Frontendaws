import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../admin.service';
// import { environment } from '../../../environments/environment';
import { environment } from '../../../environments/environment.prod';
import { AdminModule } from "../admin.module";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  maxProviderUnlocks: number; 
  isActive: boolean;
  saving?: boolean; // For loading state in modal
  updating?: boolean; // For loading state in toggle active
  deleting?: boolean; // For loading state in delete
}

interface Category {
  id: number;
  name: string;
  isActive: boolean;
  maxProviderUnlocks: number; 
}

// Create DTO interface for backend
interface SubCategoryCreateDto {
  categoryId: number;
  name: string;
  isActive: boolean;
  maxProviderUnlocks: number; 
}

@Component({
    selector: 'app-sub-category-master',
    templateUrl: './sub-category-master.component.html',
    styleUrls: ['./sub-category-master.component.css'],
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
export class SubCategoryMasterComponent implements OnInit {
  // Data properties
  subCategories: SubCategory[] = [];
  filteredSubCategories: SubCategory[] = [];
  categories: Category[] = []; // For dropdown

  // UI state properties
  loading: boolean = true;
  initialLoading = true;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentSubCategory: SubCategory = this.getEmptySubCategory();
  modalLoading: boolean = false;

  // Stats properties
  totalSubCategories: number = 0;
  activeSubCategories: number = 0;
  inactiveSubCategories: number = 0;

  // API endpoints
  private subCategoryApiUrl = `${environment.apiBaseUrl}/admin/sub-category-master`;
  private categoryApiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;

  constructor(
    private http: HttpClient,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.fetchData();
  }

  // Fetch both categories and sub-categories
  fetchData(): void {
    this.loading = true;
    this.error = null;

    // Fetch categories first for dropdown
    this.http.get<Category[]>(this.categoryApiUrl).subscribe({
      next: (categories) => {
        this.categories = categories.filter(cat => cat.isActive); // Only active categories
        // Then fetch sub-categories
        this.fetchSubCategories();
      },
      error: (err) => {
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
        console.error('Error fetching categories:', err);
      }
    });
  }

  fetchSubCategories(): void {
    this.http.get<SubCategory[]>(this.subCategoryApiUrl).subscribe({
      next: (data) => {
        this.subCategories = data;
        this.filteredSubCategories = [...data];
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false; 
      },
      error: (err) => {
        this.error = 'Failed to load sub-categories. Please try again.';
        this.loading = false;
        this.initialLoading = false; 
        console.error('Error fetching sub-categories:', err);
      }
    });
  }

  // Get empty sub-category template
  getEmptySubCategory(): SubCategory {
    return {
      id: 0,
      categoryId: 0,
      name: '',
      isActive: true,
      maxProviderUnlocks: 0
    };
  }

  // Get category name by ID
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentSubCategory = this.getEmptySubCategory();
    // Set default to first active category if available
    if (this.categories.length > 0) {
      this.currentSubCategory.categoryId = this.categories[0].id;
    }
    this.showModal = true;
  }

  editSubCategory(subCategory: SubCategory): void {
    this.isEditMode = true;
    this.currentSubCategory = { ...subCategory };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSubCategory = this.getEmptySubCategory();
    this.modalLoading = false;
  }

  saveSubCategory(): void {
    if (this.isEditMode) {
      this.updateSubCategory();
    } else {
      this.createSubCategory();
    }
  }

  createSubCategory(): void {
    // Validate required fields
    if (!this.currentSubCategory.name || !this.currentSubCategory.categoryId || this.currentSubCategory.maxProviderUnlocks < 0) {
      alert('Sub-category name, parent category, and max provider unlock count are required!');
      return;
    }

    // Prepare DTO for backend
    const createDto: SubCategoryCreateDto = {
      categoryId: this.currentSubCategory.categoryId,
      name: this.currentSubCategory.name,
      isActive: this.currentSubCategory.isActive,
      maxProviderUnlocks: this.currentSubCategory.maxProviderUnlocks
    };

    console.log('Creating sub-category with data:', createDto);

    // Show loading in modal
    this.modalLoading = true;

    this.http.post<SubCategory>(this.subCategoryApiUrl, createDto)
      .subscribe({
        next: () => {
          // After successful creation, refresh data from server
          this.fetchData();
          this.closeModal();
          alert('Sub-category created successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error creating sub-category:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 409) {
            alert('Sub-category with this name already exists in this category');
          } else {
            alert('Failed to create sub-category. Please try again.');
          }
        }
      });
  }

  updateSubCategory(): void {
    // Validate required fields
    if (!this.currentSubCategory.name || !this.currentSubCategory.categoryId || this.currentSubCategory.maxProviderUnlocks < 0) {
      alert('Sub-category name, parent category, and max provider unlock count are required!');
      return;
    }

    // For update, we should send the entire sub-category object
    const updateData = {
      id: this.currentSubCategory.id,
      categoryId: this.currentSubCategory.categoryId,
      name: this.currentSubCategory.name,
      isActive: this.currentSubCategory.isActive,
      maxProviderUnlocks: this.currentSubCategory.maxProviderUnlocks
    };

    console.log('Updating sub-category with data:', updateData);

    // Show loading in modal
    this.modalLoading = true;

    this.http.put<SubCategory>(`${this.subCategoryApiUrl}/${this.currentSubCategory.id}`, updateData)
      .subscribe({
        next: () => {
          // After successful update, refresh data from server
          this.fetchData();
          this.closeModal();
          alert('Sub-category updated successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error updating sub-category:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 404) {
            alert('Sub-category not found');
          } else if (err.status === 409) {
            alert('Sub-category with this name already exists in this category');
          } else {
            alert('Failed to update sub-category. Please try again.');
          }
        }
      });
  }

  calculateStats(): void {
    this.totalSubCategories = this.subCategories.length;
    this.activeSubCategories = this.subCategories.filter(sc => sc.isActive).length;
    this.inactiveSubCategories = this.totalSubCategories - this.activeSubCategories;
  }

  filterSubCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSubCategories = [...this.subCategories];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredSubCategories = this.subCategories.filter(subCategory =>
      subCategory.name.toLowerCase().includes(term) ||
      this.getCategoryName(subCategory.categoryId).toLowerCase().includes(term)
    );
  }

  refreshData(): void {
    this.fetchData();
    this.searchTerm = '';
  }

  toggleActive(subCategory: SubCategory): void {
    const newStatus = !subCategory.isActive;
    
    // Create update data with full sub-category object, only isActive changed
    const updateData = {
      id: subCategory.id,
      categoryId: subCategory.categoryId,
      name: subCategory.name,
      isActive: newStatus
    };

    // Show loading state on the specific button
    subCategory.updating = true;

    this.http.put<SubCategory>(`${this.subCategoryApiUrl}/${subCategory.id}`, updateData)
      .subscribe({
        next: () => {
          // After successful toggle, refresh data from server
          this.fetchData();
          alert(`Sub-category ${subCategory.name} is now ${newStatus ? 'active' : 'inactive'}`);
        },
        error: (err) => {
          subCategory.updating = false;
          console.error('Error updating sub-category status:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 404) {
            alert('Sub-category not found');
          } else {
            alert('Failed to update sub-category status');
          }
        }
      });
  }

  confirmDelete(subCategory: SubCategory): void {
    if (confirm(`Are you sure you want to delete "${subCategory.name}"? This action cannot be undone.`)) {
      this.deleteSubCategory(subCategory);
    }
  }

  deleteSubCategory(subCategory: SubCategory): void {
    // Show loading state on the specific button
    subCategory.deleting = true;

    this.http.delete(`${this.subCategoryApiUrl}/${subCategory.id}`)
      .subscribe({
        next: () => {
          // After successful delete, refresh data from server
          this.fetchData();
          alert(`Sub-category "${subCategory.name}" deleted successfully`);
        },
        error: (err) => {
          subCategory.deleting = false;
          console.error('Error deleting sub-category:', err);
          alert('Failed to delete sub-category');
        }
      });
  }
}