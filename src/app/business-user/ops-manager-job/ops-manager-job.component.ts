import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OpsManagerJobService, Job, JobListRequest } from './services/ops-manager-job.service';

@Component({
  selector: 'app-ops-manager-job',
  templateUrl: './ops-manager-job.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [OpsManagerJobService]
})
export class OpsManagerJobComponent implements OnInit {
  Math = Math;
  
  // Modal state
  showJobModal = false;
  selectedJob: Job | null = null;

  // Jobs list
  jobs: Job[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  // Filters
  searchTerm: string = '';
  statusFilter: string = '';
  cityFilter: number | null = null;
  providerFilter: number | null = null;
  dateFrom: string = '';
  dateTo: string = '';

  // Sorting
  sortBy: string = 'scheduled_start';
  sortOrder: string = 'desc';

  // Available statuses for filter dropdown
  jobStatuses: Array<{ value: string; label: string }> = [];

  // Alert system
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  // Loading states
  isLoading: boolean = false;
  isPageLoading: boolean = true;

  constructor(
    private jobService: OpsManagerJobService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadJobStatuses();
    this.loadJobs();
  }

  // Load job statuses for filter dropdown
  loadJobStatuses(): void {
    this.jobService.getJobStatuses().subscribe({
      next: (response) => {
        if (response.success) {
          this.jobStatuses = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading job statuses:', err);
      }
    });
  }

  // Load jobs with pagination and filters
  loadJobs(): void {
    this.isLoading = true;

    const request: JobListRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    if (this.statusFilter) {
      request.jobStatus = this.statusFilter;
    }
    if (this.cityFilter) {
      request.cityId = this.cityFilter;
    }
    if (this.providerFilter) {
      request.providerId = this.providerFilter;
    }
    if (this.dateFrom) {
      request.scheduledStartFrom = this.dateFrom;
    }
    if (this.dateTo) {
      request.scheduledStartTo = this.dateTo;
    }
    if (this.searchTerm) {
      request.searchTerm = this.searchTerm;
    }

    console.log('Fetching jobs with request:', request);

    this.jobService.getJobs(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isPageLoading = false;

        if (response.success) {
          this.jobs = response.data;
          this.totalCount = response.pagination.totalCount;
          this.totalPages = response.pagination.totalPages;
          console.log('Jobs loaded:', this.jobs.length);
        } else {
          this.showAlert(response.message || 'Failed to load jobs', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isPageLoading = false;
        console.error('Error loading jobs:', err);
        this.showAlert('Error loading jobs. Please try again.', 'error');
      }
    });
  }

  // Search/filter handlers
  onSearch(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  onCityFilterChange(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  onProviderFilterChange(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  onDateFilterChange(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.loadJobs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJobs();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.cityFilter = null;
    this.providerFilter = null;
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.loadJobs();
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

  // Open job details modal
  openJobModal(job: Job): void {
    this.selectedJob = job;
    this.showJobModal = true;
  }

  // Close job details modal
  closeJobModal(): void {
    this.showJobModal = false;
    this.selectedJob = null;
  }

  // Navigate to assign page
  goToAssign(jobId: number): void {
    this.closeJobModal();
    this.router.navigate(['/provider_User_Ops_Manager/jobs/assign', jobId]);
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