// worker-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { WorkerManagementService, WorkerProfile, ApiResponse } from './services/worker-management.service';

@Component({
  selector: 'app-worker-management',
  templateUrl: './worker-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [WorkerManagementService]
})
export class WorkerManagementComponent implements OnInit {
  // Modal state
  showModal = false;
  
  // Search fields
  searchEmail: string = '';
  
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
  
  // Workers list (to be implemented later)
  workers: any[] = [];
  
  // Alert system
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  
  // Loading states
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(private workerService: WorkerManagementService) {}

  ngOnInit(): void {
    // Any initialization if needed
    this.loadWorkerStatistics();
  }

  // Load worker statistics (optional)
  loadWorkerStatistics(): void {
    this.workerService.getWorkerStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Worker stats:', response.data);
          // Use statistics as needed
        }
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  // Open the modal
  openModal(): void {
    this.showModal = true;
    this.resetProfile();
    this.searchEmail = '';
  }

  // Close the modal
  closeModal(): void {
    this.showModal = false;
    this.resetProfile();
    this.searchEmail = '';
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

  // Fetch provider by email
  fetchProvider(): void {
    if (!this.searchEmail || !this.isValidEmail(this.searchEmail)) {
      this.showAlert('Please enter a valid email address', 'error');
      return;
    }

    this.isLoading = true;

    this.workerService.getProviderByEmail(this.searchEmail).subscribe({
      next: (response: ApiResponse<WorkerProfile>) => {
        this.isLoading = false;
        
        if (response && response.success && response.data) {
          this.mapProfileData(response.data);
          this.showAlert('Provider fetched successfully!', 'success');
          
          // Auto-hide alert after 3 seconds
          setTimeout(() => this.clearAlert(), 3000);
        } else {
          this.showAlert('Provider not found', 'error');
          this.resetProfile();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching provider:', err);
        
        if (err.status === 404) {
          this.showAlert('Provider not found with this email', 'error');
        } else if (err.status === 400) {
          this.showAlert('Invalid email format', 'error');
        } else {
          this.showAlert('Error fetching provider. Please try again.', 'error');
        }
        
        this.resetProfile();
        
        // Auto-hide alert after 3 seconds
        setTimeout(() => this.clearAlert(), 3000);
      }
    });
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

  // Save user (to be implemented later)
  saveUser(): void {
    if (!this.profile.email) {
      this.showAlert('No provider data to save. Please fetch a provider first.', 'error');
      setTimeout(() => this.clearAlert(), 3000);
      return;
    }

    this.isSaving = true;

    // Check if worker already exists
    this.workerService.validateWorkerEmail(this.profile.email).subscribe({
      next: (validation) => {
        if (validation.success && validation.data?.exists) {
          this.isSaving = false;
          this.showAlert('This worker is already added!', 'error');
          setTimeout(() => this.clearAlert(), 3000);
        } else {
          // Add new worker
          const workerData = {
            providerId: this.profile.providerId || undefined,
            sellerId: this.profile.sellerId || undefined,
            name: this.profile.displayName,
            email: this.profile.email,
            phone: this.profile.phone,
            role: 'worker',
            status: 'active',
            addedAt: new Date(),
            profile: this.profile
          };

          this.workerService.addWorker(workerData).subscribe({
            next: (response) => {
              this.isSaving = false;
              if (response.success) {
                this.showAlert('Worker added successfully!', 'success');
                this.closeModal();
                this.loadWorkers(); // Refresh workers list
              } else {
                this.showAlert('Failed to add worker', 'error');
              }
              setTimeout(() => this.clearAlert(), 3000);
            },
            error: (err) => {
              this.isSaving = false;
              console.error('Error adding worker:', err);
              this.showAlert('Error adding worker. Please try again.', 'error');
              setTimeout(() => this.clearAlert(), 3000);
            }
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error validating email:', err);
        // If validation fails, proceed with add (fallback)
        this.addWorkerDirectly();
      }
    });
  }

  // Fallback method to add worker directly
  private addWorkerDirectly(): void {
    const workerData = {
      providerId: this.profile.providerId || undefined,
      sellerId: this.profile.sellerId || undefined,
      name: this.profile.displayName,
      email: this.profile.email,
      phone: this.profile.phone,
      role: 'worker',
      status: 'active',
      addedAt: new Date(),
      profile: this.profile
    };

    this.workerService.addWorker(workerData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.showAlert('Worker added successfully!', 'success');
          this.closeModal();
          this.loadWorkers();
        } else {
          this.showAlert('Failed to add worker', 'error');
        }
        setTimeout(() => this.clearAlert(), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error adding worker:', err);
        this.showAlert('Error adding worker. Please try again.', 'error');
        setTimeout(() => this.clearAlert(), 3000);
      }
    });
  }

  // Load workers list (to be implemented)
  loadWorkers(): void {
    this.workerService.getAllWorkers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.workers = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading workers:', err);
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