import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerManagementService, WorkerProfile, ApiResponse, PendingInviteItem, PendingInviteFilter, PendingInviteListResponse } from './services/worker-management.service';

@Component({
  selector: 'app-worker-management',
  templateUrl: './worker-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [WorkerManagementService]
})
export class WorkerManagementComponent implements OnInit {
  Math = Math;
  // Modal state
  showModal = false;

  // Search fields
  searchEmail: string = '';
  searchPhone: string = '';

  // Profile data from API
  profile: WorkerProfile = {
    providerId: null,
    sellerId: null,
    displayName: '',
    legalName: '',
    email: '',
    phone: '',
    providerType: '',
    status: '',
    baseCity: '',
    state: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    areaName: '',
    profilePictureUrl: '',
    totalJobsCompleted: null,
    totalDisputes: null,
    disputeRate: null
  };

  // Workers list
  workers: any[] = [];

  // Pending invites
  pendingInvites: PendingInviteItem[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  // Filters
  searchTerm: string = '';
  statusFilter: string = 'pending';

  // Sorting
  sortBy: string = 'created_at';
  sortOrder: string = 'desc';

  // Alert system
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  // Loading states
  isLoading: boolean = false;
  isSaving: boolean = false;
  isPageLoading: boolean = true;
  isTableLoading: boolean = false;

  constructor(private workerService: WorkerManagementService) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  // Load all data on page load
  async loadAllData(): Promise<void> {
    this.isPageLoading = true;

    try {
      await this.loadPendingInvites();
    } catch (error) {
      console.error('Error loading page data:', error);
    } finally {
      setTimeout(() => {
        this.isPageLoading = false;
      }, 500);
    }
  }

  // Load pending invites with pagination and filters
  loadPendingInvites(): Promise<void> {
    this.isTableLoading = true;
    return new Promise((resolve, reject) => {
      const filter: PendingInviteFilter = {
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchTerm || undefined,
        status: this.statusFilter || undefined,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder
      };

      console.log('Fetching pending invites with filter:', filter);

      this.workerService.getPendingInvites(filter).subscribe({
        next: (response: PendingInviteListResponse) => {
          console.log('Raw API Response:', response);
          console.log('Response data:', response.data);
          console.log('Response success:', response.success);
          console.log('Total count:', response.totalCount);

          if (response.success) {
            if (response.data && response.data.length > 0) {
              console.log('First item structure:', response.data[0]);
            }

            this.pendingInvites = response.data;
            this.totalCount = response.totalCount;
            this.totalPages = response.totalPages;

            console.log('Mapped pendingInvites:', this.pendingInvites);
            console.log('Pending invites count after mapping:', this.pendingInvites.length);
          } else {
            console.error('API returned success false:', response);
          }
          this.isTableLoading = false;
          resolve();
        },
        error: (err) => {
          console.error('Error loading pending invites:', err);
          console.error('Error details:', err.error);
          this.isTableLoading = false;
          reject(err);
        }
      });
    });
  }

  // Search/filter handlers
  onSearch(): void {
    this.currentPage = 1;
    this.loadPendingInvites();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadPendingInvites();
  }

  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.loadPendingInvites();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPendingInvites();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadPendingInvites();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'pending';
    this.currentPage = 1;
    this.loadPendingInvites();
  }

  // Helper method to generate page numbers
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Open the modal
  openModal(): void {
    this.showModal = true;
    this.resetProfile();
    this.searchEmail = '';
    this.searchPhone = '';
  }

  // Close the modal
  closeModal(): void {
    this.showModal = false;
    this.resetProfile();
    this.searchEmail = '';
    this.searchPhone = '';
    this.isLoading = false;
    this.isSaving = false;
  }

  // Reset profile data
  resetProfile(): void {
    this.profile = {
      providerId: null,
      sellerId: null,
      displayName: '',
      legalName: '',
      email: '',
      phone: '',
      providerType: '',
      status: '',
      baseCity: '',
      state: '',
      description: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      pincode: '',
      areaName: '',
      profilePictureUrl: '',
      totalJobsCompleted: null,
      totalDisputes: null,
      disputeRate: null
    };
  }

  // Map API response to profile object
  mapProfileData(data: WorkerProfile): void {
    this.profile = {
      providerId: data.providerId || null,
      sellerId: data.sellerId || null,
      displayName: data.displayName || '',
      legalName: data.legalName || '',
      email: data.email || '',
      phone: data.phone || '',
      providerType: data.providerType || '',
      status: data.status || '',
      baseCity: data.baseCity || '',
      state: data.state || '',
      description: data.description || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      landmark: data.landmark || '',
      pincode: data.pincode || '',
      areaName: data.areaName || '',
      profilePictureUrl: data.profilePictureUrl || '',
      totalJobsCompleted: data.totalJobsCompleted || null,
      totalDisputes: data.totalDisputes || null,
      disputeRate: data.disputeRate || null
    };
  }

  // Fetch provider by email and phone (BOTH REQUIRED)
  fetchProvider(): void {
    // Both email and phone are required
    if (!this.searchEmail || !this.searchEmail.trim()) {
      this.showAlert('Email address is required', 'error');
      return;
    }

    if (!this.searchPhone || !this.searchPhone.trim()) {
      this.showAlert('Mobile number is required', 'error');
      return;
    }

    // Validate email format
    if (!this.isValidEmail(this.searchEmail)) {
      this.showAlert('Please enter a valid email address', 'error');
      return;
    }

    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(this.searchPhone)) {
      this.showAlert('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    this.isLoading = true;

    // Call API with both email and phone
    this.workerService.getProviderByEmailAndPhone(this.searchEmail, this.searchPhone).subscribe({
      next: (response: ApiResponse<WorkerProfile>) => {
        this.isLoading = false;

        if (response && response.success && response.data) {
          this.mapProfileData(response.data);
          this.showAlert('Worker found!', 'success');
          setTimeout(() => this.clearAlert(), 3000);
        } else {
          this.showAlert('Worker not found with the provided email and phone', 'error');
          this.resetProfile();
          setTimeout(() => this.clearAlert(), 3000);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching worker:', err);

        if (err.status === 404) {
          this.showAlert('Worker not found with the provided email and phone', 'error');
        } else if (err.status === 400) {
          this.showAlert('Invalid request. Please check the provided information.', 'error');
        } else {
          this.showAlert('Error fetching worker. Please try again.', 'error');
        }

        this.resetProfile();
        setTimeout(() => this.clearAlert(), 3000);
      }
    });
  }

  // Save user - Invite the worker
  saveUser(): void {
    if (!this.profile.email) {
      this.showAlert('No worker data to invite. Please fetch a worker first.', 'error');
      setTimeout(() => this.clearAlert(), 3000);
      return;
    }

    this.isSaving = true;

    this.workerService.inviteWorker(this.profile.email, 'manual').subscribe({
      next: (response) => {
        this.isSaving = false;

        if (response.success) {
          this.showAlert('Worker invited successfully!', 'success');
          this.closeModal();
          this.loadPendingInvites();
        } else {
          this.showAlert(response.message || 'Failed to invite worker', 'error');
        }
        setTimeout(() => this.clearAlert(), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error inviting worker:', err);
        const errorMessage = err.error?.message || err.error?.error || 'Failed to invite worker. Please try again.';
        this.showAlert(errorMessage, 'error');
        setTimeout(() => this.clearAlert(), 3000);
      }
    });
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Show alert message
  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
  }

  // Clear alert message
  clearAlert(): void {
    this.alertMessage = '';
  }
}