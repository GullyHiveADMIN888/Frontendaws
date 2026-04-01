// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { OpsManagerJobService, Job, Worker, AssignJobRequest } from '../ops-manager-job/services/ops-manager-job.service';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

// @Component({
//   selector: 'app-ops-manager-job-assign',
//   templateUrl: './ops-manager-job-assign.component.html',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   providers: [OpsManagerJobService]
// })
// export class OpsManagerJobAssignComponent implements OnInit {
//   // Job data
//   job: Job | null = null;
//   jobId: number = 0;

//   // Worker selection
//   workers: Worker[] = [];
//   filteredWorkers: Worker[] = [];
//   selectedWorker: Worker | null = null;
//   searchTerm: string = '';
//   isDropdownOpen: boolean = false;

//   // Loading states
//   isLoading: boolean = true;
//   isSearching: boolean = false;
//   isSubmitting: boolean = false;

//   // Search debounce
//   private searchSubject = new Subject<string>();

//   // Alert system
//   alertMessage: string = '';
//   alertType: 'success' | 'error' = 'success';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private jobService: OpsManagerJobService
//   ) { }

//   ngOnInit(): void {
//     this.jobId = Number(this.route.snapshot.paramMap.get('id'));
//     if (this.jobId) {
//       this.loadJobDetails();
//       this.loadWorkers();

//       // Setup search debounce
//       this.searchSubject.pipe(
//         debounceTime(300),
//         distinctUntilChanged()
//       ).subscribe(searchTerm => {
//         this.performSearch(searchTerm);
//       });
//     } else {
//       this.showAlert('Invalid job ID', 'error');
//       setTimeout(() => this.goBack(), 2000);
//     }
//   }

//   // Load job details
//   loadJobDetails(): void {
//     this.jobService.getJobById(this.jobId).subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           this.job = response.data;
//         } else {
//           this.showAlert(response.message || 'Failed to load job details', 'error');
//           setTimeout(() => this.goBack(), 2000);
//         }
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error loading job:', err);
//         this.showAlert('Error loading job details', 'error');
//         this.isLoading = false;
//         setTimeout(() => this.goBack(), 2000);
//       }
//     });
//   }

//   // Load all workers initially
//   loadWorkers(): void {
//     this.isSearching = true;
//     this.jobService.searchWorkers('').subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           this.workers = response.data;
//           this.filteredWorkers = response.data;
//         } else {
//           console.error('Failed to load workers:', response.message);
//           this.workers = [];
//           this.filteredWorkers = [];
//         }
//         this.isSearching = false;
//       },
//       error: (err) => {
//         console.error('Error loading workers:', err);
//         this.workers = [];
//         this.filteredWorkers = [];
//         this.isSearching = false;
//       }
//     });
//   }

//   // Handle search input change with debounce
//   onSearchChange(): void {
//     this.searchSubject.next(this.searchTerm);
//   }

//   // Perform actual search
//   performSearch(searchTerm: string): void {
//     if (!searchTerm.trim()) {
//       // If search term is empty, show all workers
//       this.filteredWorkers = this.workers;
//       return;
//     }

//     this.isSearching = true;
//     this.jobService.searchWorkers(searchTerm).subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           this.filteredWorkers = response.data;
//         } else {
//           this.filteredWorkers = [];
//         }
//         this.isSearching = false;
//       },
//       error: (err) => {
//         console.error('Error searching workers:', err);
//         this.filteredWorkers = [];
//         this.isSearching = false;
//       }
//     });
//   }

//   // Select a worker
//   selectWorker(worker: Worker): void {
//     this.selectedWorker = worker;
//     this.searchTerm = this.getWorkerDisplayName(worker);
//     this.isDropdownOpen = false;
//   }

//   // Clear selected worker
//   clearSelection(): void {
//     this.selectedWorker = null;
//     this.searchTerm = '';
//     this.filteredWorkers = this.workers;
//   }

//   // Toggle dropdown
//   toggleDropdown(): void {
//     if (!this.isDropdownOpen) {
//       // Reset to show all workers when opening dropdown
//       this.filteredWorkers = this.workers;
//       this.searchTerm = '';
//     }
//     this.isDropdownOpen = !this.isDropdownOpen;
//   }

//   // Get display name for worker
//   getWorkerDisplayName(worker: Worker): string {
//     const name = worker.name || worker.displayName || worker.legalName;
//     return `${name} (${worker.email})`;
//   }

//   // Format date
//   formatDate(date: string | null): string {
//     if (!date) return '-';
//     return new Date(date).toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   // Format currency
//   formatCurrency(amount: number | null, currency: string = 'INR'): string {
//     if (amount === null || amount === undefined) return '-';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2
//     }).format(amount);
//   }

//   // Get status badge class
//   getStatusBadgeClass(status: string): string {
//     const statusMap: { [key: string]: string } = {
//       'in_progress': 'bg-blue-100 text-blue-800',
//       'completed': 'bg-green-100 text-green-800',
//       'cancelled': 'bg-red-100 text-red-800',
//       'no_show': 'bg-yellow-100 text-yellow-800',
//       'customer_not_present': 'bg-orange-100 text-orange-800'
//     };
//     return statusMap[status] || 'bg-gray-100 text-gray-800';
//   }

//   // Get status display text
//   getStatusDisplayText(status: string): string {
//     const statusMap: { [key: string]: string } = {
//       'in_progress': 'In Progress',
//       'completed': 'Completed',
//       'cancelled': 'Cancelled',
//       'no_show': 'No Show',
//       'customer_not_present': 'Customer Not Present'
//     };
//     return statusMap[status] || status;
//   }

//   // Helper method to check if worker is already assigned
//   isWorkerAlreadyAssigned(workerId: number): boolean {
//     if (!this.job?.assignedWorkers) return false;
//     return this.job.assignedWorkers.some(assigned => assigned.member_id === workerId);
//   }

//   // Get worker status text for display
//   getWorkerStatusText(status: string): string {
//     const statusMap: { [key: string]: string } = {
//       'assigned': 'Assigned',
//       'accepted': 'Accepted',
//       'checked_in': 'Checked In',
//       'completed': 'Completed',
//       'dropped': 'Dropped'
//     };
//     return statusMap[status] || status;
//   }

//   // Submit assignment
//   onSubmit(): void {
//     if (!this.selectedWorker) {
//       this.showAlert('Please select a worker to assign', 'error');
//       return;
//     }

//     // Check if worker is already assigned
//     if (this.isWorkerAlreadyAssigned(this.selectedWorker.userId)) {
//       this.showAlert('This worker is already assigned to this job!', 'error');
//       return;
//     }

//     this.isSubmitting = true;

//     const request: AssignJobRequest = {
//       jobId: this.jobId,
//       workerUserId: this.selectedWorker.userId,
//       workerProviderProfileId: this.selectedWorker.providerProfileId
//     };

//     this.jobService.assignJob(request).subscribe({
//       next: (response) => {
//         this.isSubmitting = false;
//         if (response.success) {
//           this.showAlert('Job assigned successfully!', 'success');
//           // Reload job details to show updated assigned workers
//           this.loadJobDetails();
//           setTimeout(() => {
//             this.goBack();
//           }, 2000);
//         } else {
//           this.showAlert(response.message || 'Failed to assign job', 'error');
//         }
//       },
//       error: (err) => {
//         this.isSubmitting = false;
//         console.error('Error assigning job:', err);
//         const errorMessage = err.error?.message || err.error?.error || 'Failed to assign job. Please try again.';
//         this.showAlert(errorMessage, 'error');
//       }
//     });
//   }

//   // Go back to jobs list
//   goBack(): void {
//     this.router.navigate(['/provider_User_Ops_Manager/jobs']);
//   }

//   // Show alert message
//   showAlert(message: string, type: 'success' | 'error'): void {
//     this.alertMessage = message;
//     this.alertType = type;
//     setTimeout(() => this.clearAlert(), 5000);
//   }

//   // Clear alert message
//   clearAlert(): void {
//     this.alertMessage = '';
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OpsManagerJobService, Job, Worker, AssignJobRequest, WorkerAvailabilitySlot } from '../ops-manager-job/services/ops-manager-job.service';
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

  // Tooltip
  tooltipWorker: Worker | null = null;
  tooltipPosition = { x: 0, y: 0 };

  // Alert system
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: OpsManagerJobService
  ) { }

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

  // Load all workers initially with jobId
  loadWorkers(): void {
    this.isSearching = true;
    this.jobService.searchWorkers('', this.jobId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.workers = response.data;
          this.filteredWorkers = response.data;
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

  // Perform actual search with jobId
  performSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // If search term is empty, show all workers
      this.filteredWorkers = this.workers;
      return;
    }

    this.isSearching = true;
    this.jobService.searchWorkers(searchTerm, this.jobId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.filteredWorkers = response.data;
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

  // Get availability status text for tooltip
  getAvailabilityStatusText(worker: Worker): string {
    switch (worker.availabilityStatus) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'assigned':
        return 'Assigned to another job';
      case 'not_available_at_scheduled_time':
        return `Not available at ${this.getFormattedTime()} (has other slots)`;
      case 'no_availability_for_date':
        return `No availability set for ${this.getFormattedDate()}`;
      case 'no_availability_records':
        return 'No availability records found';
      case 'no_member_record':
        return 'Worker not registered as member';
      default:
        return 'Availability unknown';
    }
  }

  // Get tooltip content HTML
  getTooltipContent(worker: Worker): string {
    if (worker.isAvailable) {
      if (worker.availableSlots && worker.availableSlots.length > 0) {
        const availableSlot = worker.availableSlots.find(slot => slot.isAvailable);
        if (availableSlot) {
          return `
            <div class="p-2">
              <div class="font-semibold mb-1">✅ Available</div>
              <div class="text-sm">Slot: ${this.formatTime(availableSlot.startTime)} - ${this.formatTime(availableSlot.endTime)}</div>
              <div class="text-xs text-gray-500 mt-1">Status: ${availableSlot.status}</div>
            </div>
          `;
        }
      }
      return '<div class="p-2"><div class="font-semibold">✅ Available</div></div>';
    } else {
      const statusText = this.getAvailabilityStatusText(worker);
      let details = '';

      if (worker.availableSlots && worker.availableSlots.length > 0) {
        details = '<div class="mt-2"><div class="font-semibold text-sm">Other available slots:</div>';
        worker.availableSlots.forEach(slot => {
          if (!slot.isAvailable) {
            details += `<div class="text-xs ml-2">• ${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)} (${slot.status})</div>`;
          }
        });
        details += '</div>';
      } else if (worker.availabilityStatus === 'no_availability_for_date') {
        details = '<div class="mt-2 text-xs">Please set availability for this date in the system.</div>';
      } else if (worker.availabilityStatus === 'no_availability_records') {
        details = '<div class="mt-2 text-xs">No availability records found. Please contact admin to set up availability.</div>';
      } else if (worker.availabilityStatus === 'no_member_record') {
        details = '<div class="mt-2 text-xs">Worker needs to be added as a member first.</div>';
      }

      return `
        <div class="p-2">
          <div class="font-semibold mb-1">❌ Not Available</div>
          <div class="text-sm">${statusText}</div>
          ${details}
        </div>
      `;
    }
  }

  // Get formatted time
  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Get formatted date
  getFormattedDate(): string {
    if (!this.job?.scheduledStart) return '';
    return new Date(this.job.scheduledStart).toLocaleDateString('en-IN');
  }

  // Get formatted time
  getFormattedTime(): string {
    if (!this.job?.scheduledStart) return '';
    return new Date(this.job.scheduledStart).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Show tooltip
  showTooltip(event: MouseEvent, worker: Worker): void {
    this.tooltipWorker = worker;
    this.tooltipPosition = { x: event.clientX + 10, y: event.clientY + 10 };
  }

  // Hide tooltip
  hideTooltip(): void {
    this.tooltipWorker = null;
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

  // Helper method to check if worker is already assigned
  isWorkerAlreadyAssigned(workerId: number): boolean {
    if (!this.job?.assignedWorkers) return false;
    return this.job.assignedWorkers.some(assigned => assigned.member_id === workerId);
  }

  // Get worker status text for display
  getWorkerStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'assigned': 'Assigned',
      'accepted': 'Accepted',
      'checked_in': 'Checked In',
      'completed': 'Completed',
      'dropped': 'Dropped'
    };
    return statusMap[status] || status;
  }

  // Submit assignment
  onSubmit(): void {
    if (!this.selectedWorker) {
      this.showAlert('Please select a worker to assign', 'error');
      return;
    }

    // Check if worker is already assigned
    if (this.isWorkerAlreadyAssigned(this.selectedWorker.userId)) {
      this.showAlert('This worker is already assigned to this job!', 'error');
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
          // Reload job details to show updated assigned workers
          this.loadJobDetails();
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