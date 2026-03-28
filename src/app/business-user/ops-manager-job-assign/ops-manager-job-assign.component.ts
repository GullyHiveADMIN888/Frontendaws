import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OpsManagerJobService, Job, Worker, AssignJobRequest } from '../ops-manager-job/services/ops-manager-job.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-ops-manager-job-assign',
  templateUrl: './ops-manager-job-assign.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [OpsManagerJobService]
})
export class OpsManagerJobAssignComponent implements OnInit {
  // Job data
  job: Job | null = null;
  jobId: number = 0;

  // Worker selection
  workers: Worker[] = [];
  filteredWorkers: Worker[] = [];
  selectedWorker: Worker | null = null;
  searchTerm: string = '';
  isDropdownOpen: boolean = false;

  // Loading states
  isLoading: boolean = true;
  isSearching: boolean = false;
  isSubmitting: boolean = false;

  // Search debounce
  private searchSubject = new Subject<string>();

  // Alert system
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: OpsManagerJobService
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.jobId) {
      this.loadJobDetails();
      this.loadWorkers();
      
      // Setup search debounce
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.performSearch(searchTerm);
      });
    } else {
      this.showAlert('Invalid job ID', 'error');
      setTimeout(() => this.goBack(), 2000);
    }
  }

  // Load job details
  loadJobDetails(): void {
    this.jobService.getJobById(this.jobId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.job = response.data;
        } else {
          this.showAlert(response.message || 'Failed to load job details', 'error');
          setTimeout(() => this.goBack(), 2000);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading job:', err);
        this.showAlert('Error loading job details', 'error');
        this.isLoading = false;
        setTimeout(() => this.goBack(), 2000);
      }
    });
  }

  // Load all workers initially
  loadWorkers(): void {
    this.isSearching = true;
    this.jobService.searchWorkers('').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.workers = response.data;
          this.filteredWorkers = response.data;
          console.log('Workers loaded:', this.workers.length);
        } else {
          console.error('Failed to load workers:', response.message);
          this.workers = [];
          this.filteredWorkers = [];
        }
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error loading workers:', err);
        this.workers = [];
        this.filteredWorkers = [];
        this.isSearching = false;
      }
    });
  }

  // Handle search input change with debounce
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Perform actual search
  performSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // If search term is empty, show all workers
      this.filteredWorkers = this.workers;
      return;
    }

    this.isSearching = true;
    this.jobService.searchWorkers(searchTerm).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.filteredWorkers = response.data;
          console.log('Search results:', this.filteredWorkers.length);
        } else {
          this.filteredWorkers = [];
        }
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error searching workers:', err);
        this.filteredWorkers = [];
        this.isSearching = false;
      }
    });
  }

  // Select a worker
  selectWorker(worker: Worker): void {
    this.selectedWorker = worker;
    this.searchTerm = this.getWorkerDisplayName(worker);
    this.isDropdownOpen = false;
  }

  // Clear selected worker
  clearSelection(): void {
    this.selectedWorker = null;
    this.searchTerm = '';
    this.filteredWorkers = this.workers;
  }

  // Toggle dropdown
  toggleDropdown(): void {
    if (!this.isDropdownOpen) {
      // Reset to show all workers when opening dropdown
      this.filteredWorkers = this.workers;
      this.searchTerm = '';
    }
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Get display name for worker
  getWorkerDisplayName(worker: Worker): string {
    const name = worker.name || worker.displayName || worker.legalName;
    return `${name} (${worker.email})`;
  }

  // Format date
  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format currency
  formatCurrency(amount: number | null, currency: string = 'INR'): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-yellow-100 text-yellow-800',
      'customer_not_present': 'bg-orange-100 text-orange-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status display text
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show',
      'customer_not_present': 'Customer Not Present'
    };
    return statusMap[status] || status;
  }

  // Submit assignment
  onSubmit(): void {
    if (!this.selectedWorker) {
      this.showAlert('Please select a worker to assign', 'error');
      return;
    }

    this.isSubmitting = true;

    const request: AssignJobRequest = {
      jobId: this.jobId,
      workerUserId: this.selectedWorker.userId,
      workerProviderProfileId: this.selectedWorker.providerProfileId
    };

    this.jobService.assignJob(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showAlert('Job assigned successfully!', 'success');
          setTimeout(() => {
            this.goBack();
          }, 2000);
        } else {
          this.showAlert(response.message || 'Failed to assign job', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error assigning job:', err);
        const errorMessage = err.error?.message || err.error?.error || 'Failed to assign job. Please try again.';
        this.showAlert(errorMessage, 'error');
      }
    });
  }

  // Go back to jobs list
  goBack(): void {
    this.router.navigate(['/provider_User_Ops_Manager/jobs']);
  }

  // Show alert message
  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => this.clearAlert(), 5000);
  }

  // Clear alert message
  clearAlert(): void {
    this.alertMessage = '';
  }
}