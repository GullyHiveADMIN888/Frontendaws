import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../admin.service';
// import { environment } from '../../../environments/environment';
import { environment } from '../../../environments/environment.prod';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

interface ServiceCategory {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  isLeaf: boolean;
  isActive: boolean;
  displayOrder: number;
  saving?: boolean; // For loading state in modal
  updating?: boolean; // For loading state in toggle active
  deleting?: boolean; // For loading state in delete
}

// Create DTO interface to match backend
interface ServiceCategoryCreateDto {
  parentId: number | null;
  name: string;
  slug: string | null;
  description: string | null;
  isLeaf: boolean;
  displayOrder: number;
}

@Component({
    selector: 'app-category-master',
    templateUrl: './category-master.component.html',
    styleUrls: ['./category-master.component.css'],
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
export class CategoryMasterComponent implements OnInit {
  // Data properties
  categories: ServiceCategory[] = [];
  filteredCategories: ServiceCategory[] = [];

  // UI state properties
  initialLoading = true;
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentCategory: ServiceCategory = this.getEmptyCategory();
  modalLoading: boolean = false; // For modal loading state

  // Stats properties
  totalCategories: number = 0;
  activeCategories: number = 0;
  parentCategories: number = 0;
  leafCategories: number = 0;

  // API endpoint
  private apiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;

  constructor(
    private http: HttpClient,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.fetchCategories();
  }

  // Get empty category template
  getEmptyCategory(): ServiceCategory {
    return {
      id: 0,
      parentId: null,
      name: '',
      slug: '',
      description: '',
      isLeaf: false,
      isActive: true,
      displayOrder: 1
    };
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategory = this.getEmptyCategory();
    // Set default display order to next available
    this.currentCategory.displayOrder = this.categories.length > 0
      ? Math.max(...this.categories.map(c => c.displayOrder)) + 1
      : 1;
    this.showModal = true;
  }

  editCategory(category: ServiceCategory): void {
    this.isEditMode = true;
    // Create a deep copy to avoid modifying the original
    this.currentCategory = { ...category };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCategory = this.getEmptyCategory();
    this.modalLoading = false;
  }

  saveCategory(): void {
    if (this.isEditMode) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  // Generate slug from name if empty
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .trim();
  }

  createCategory(): void {
    // Generate slug if empty
    if (!this.currentCategory.slug && this.currentCategory.name) {
      this.currentCategory.slug = this.generateSlug(this.currentCategory.name);
    }

    // Validate required fields
    if (!this.currentCategory.name || !this.currentCategory.slug) {
      alert('Category name and slug are required!');
      return;
    }

    // Prepare DTO for backend
    const createDto: ServiceCategoryCreateDto = {
      parentId: this.currentCategory.parentId,
      name: this.currentCategory.name,
      slug: this.currentCategory.slug || null,
      description: this.currentCategory.description || null,
      isLeaf: this.currentCategory.isLeaf,
      displayOrder: this.currentCategory.displayOrder
    };

    console.log('Creating category with data:', createDto);

    // Show loading in modal
    this.modalLoading = true;

    this.http.post<ServiceCategory>(this.apiUrl, createDto)
      .subscribe({
        next: () => {
          // After successful creation, refresh data from server
          this.fetchCategories();
          this.closeModal();
          alert('Category created successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error creating category:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 409) {
            alert('Category with this name or slug already exists');
          } else {
            alert('Failed to create category. Please try again.');
          }
        }
      });
  }

  updateCategory(): void {
    // Generate slug if empty
    if (!this.currentCategory.slug && this.currentCategory.name) {
      this.currentCategory.slug = this.generateSlug(this.currentCategory.name);
    }

    // Validate required fields
    if (!this.currentCategory.name || !this.currentCategory.slug) {
      alert('Category name and slug are required!');
      return;
    }

    // For update, we should send the entire category object
    const updateData = {
      id: this.currentCategory.id,
      parentId: this.currentCategory.parentId,
      name: this.currentCategory.name,
      slug: this.currentCategory.slug || null,
      description: this.currentCategory.description || null,
      isLeaf: this.currentCategory.isLeaf,
      isActive: this.currentCategory.isActive,
      displayOrder: this.currentCategory.displayOrder
    };

    console.log('Updating category with data:', updateData);

    // Show loading in modal
    this.modalLoading = true;

    this.http.put<ServiceCategory>(`${this.apiUrl}/${this.currentCategory.id}`, updateData)
      .subscribe({
        next: () => {
          // After successful update, refresh data from server
          this.fetchCategories();
          this.closeModal();
          alert('Category updated successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error updating category:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 404) {
            alert('Category not found');
          } else if (err.status === 409) {
            alert('Category with this name or slug already exists');
          } else {
            alert('Failed to update category. Please try again.');
          }
        }
      });
  }

  // Auto-generate slug when name changes
  onNameChange(): void {
    if (!this.currentCategory.slug && this.currentCategory.name) {
      this.currentCategory.slug = this.generateSlug(this.currentCategory.name);
    }
  }

  // Fetch categories from server
  fetchCategories(): void {
    this.loading = true;
    this.error = null;

    this.http.get<ServiceCategory[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = [...data];
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
        this.initialLoading = false;
        console.error('Error fetching categories:', err);
      }
    });
  }

  calculateStats(): void {
    this.totalCategories = this.categories.length;
    this.activeCategories = this.categories.filter(c => c.isActive).length;
    this.parentCategories = this.categories.filter(c => c.parentId === null).length;
    this.leafCategories = this.categories.filter(c => c.isLeaf).length;
  }

  filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(term) ||
      category.slug.toLowerCase().includes(term) ||
      (category.description && category.description.toLowerCase().includes(term))
    );
  }

  refreshData(): void {
    this.fetchCategories();
    this.searchTerm = '';
  }

  toggleActive(category: ServiceCategory): void {
    const newStatus = !category.isActive;

    // Create update data with only the isActive field
    const updateData = {
      isActive: newStatus
    };

    // Show loading state on the specific button
    category.updating = true;

    // Try PATCH first (if supported), otherwise use PUT
    this.http.patch<ServiceCategory>(`${this.apiUrl}/${category.id}`, updateData)
      .subscribe({
        next: () => {
          // After successful toggle, refresh data from server
          this.fetchCategories();
          alert(`Category ${category.name} is now ${newStatus ? 'active' : 'inactive'}`);
        },
        error: (patchErr) => {
          // If PATCH fails with 405 (Method Not Allowed), try PUT with full object
          if (patchErr.status === 405) {
            const fullUpdateData = {
              id: category.id,
              parentId: category.parentId,
              name: category.name,
              slug: category.slug,
              description: category.description,
              isLeaf: category.isLeaf,
              isActive: newStatus,
              displayOrder: category.displayOrder
            };

            this.http.put<ServiceCategory>(`${this.apiUrl}/${category.id}`, fullUpdateData)
              .subscribe({
                next: () => {
                  this.fetchCategories();
                  alert(`Category ${category.name} is now ${newStatus ? 'active' : 'inactive'}`);
                },
                error: (putErr) => {
                  category.updating = false;
                  console.error('Error updating category status:', putErr);
                  alert('Failed to update category status');
                }
              });
          } else {
            category.updating = false;
            console.error('Error updating category status:', patchErr);
            alert('Failed to update category status');
          }
        }
      });
  }

  confirmDelete(category: ServiceCategory): void {
    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      this.deleteCategory(category);
    }
  }

  deleteCategory(category: ServiceCategory): void {
    // Show loading state on the specific button
    category.deleting = true;

    this.http.delete(`${this.apiUrl}/${category.id}`)
      .subscribe({
        next: () => {
          // After successful delete, refresh data from server
          this.fetchCategories();
          alert(`Category "${category.name}" deleted successfully`);
        },
        error: (err) => {
          category.deleting = false;
          console.error('Error deleting category:', err);
          alert('Failed to delete category');
        }
      });
  }

  changeDisplayOrder(categoryId: number, direction: 'up' | 'down'): void {
    alert(`Change display order ${direction} for category ID: ${categoryId}`);
  }
}