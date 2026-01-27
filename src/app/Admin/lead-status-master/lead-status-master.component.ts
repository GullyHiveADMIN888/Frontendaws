import { Component, OnInit } from '@angular/core';
import { LeadStatusService } from './services/lead-status.service';
import { LeadStatus, LeadStatusCreateDto, LeadStatusUpdateDto } from './models/lead-status.model';

@Component({
  selector: 'app-lead-status-master',
  templateUrl: './lead-status-master.component.html',
  styleUrls: ['./lead-status-master.component.css']
})
export class LeadStatusMasterComponent implements OnInit {
  // Data properties
  leadStatuses: LeadStatus[] = [];
  filteredStatuses: LeadStatus[] = [];

  // UI state properties
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentStatus: LeadStatus = this.getEmptyStatus();
  modalLoading: boolean = false;

  // Stats properties
  totalStatuses: number = 0;
  activeStatuses: number = 0;

  constructor(private leadStatusService: LeadStatusService) { }

  ngOnInit(): void {
    this.fetchLeadStatuses();
  }

  // Get empty status template
  getEmptyStatus(): LeadStatus {
    return {
      id: 0,
      name: '',
      isActive: true
    };
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentStatus = this.getEmptyStatus();
    this.showModal = true;
  }

  editStatus(status: LeadStatus): void {
    this.isEditMode = true;
    this.currentStatus = { ...status };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentStatus = this.getEmptyStatus();
    this.modalLoading = false;
  }

  saveStatus(): void {
    if (this.isEditMode) {
      this.updateStatus();
    } else {
      this.createStatus();
    }
  }

  createStatus(): void {
    // Validate required fields
    if (!this.currentStatus.name.trim()) {
      alert('Status name is required!');
      return;
    }

    const createDto: LeadStatusCreateDto = {
      name: this.currentStatus.name.trim()
    };

    this.modalLoading = true;

    this.leadStatusService.createLeadStatus(createDto)
      .subscribe({
        next: () => {
          this.fetchLeadStatuses();
          this.closeModal();
          alert('Lead status created successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error creating lead status:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 409) {
            alert('Lead status with this name already exists');
          } else {
            alert('Failed to create lead status. Please try again.');
          }
        }
      });
  }

  updateStatus(): void {
    // Validate required fields
    if (!this.currentStatus.name.trim()) {
      alert('Status name is required!');
      return;
    }

    const updateData: LeadStatusUpdateDto = {
      name: this.currentStatus.name.trim(),
      isActive: this.currentStatus.isActive
    };

    this.modalLoading = true;

    this.leadStatusService.updateLeadStatus(this.currentStatus.id, updateData)
      .subscribe({
        next: () => {
          this.fetchLeadStatuses();
          this.closeModal();
          alert('Lead status updated successfully!');
        },
        error: (err) => {
          this.modalLoading = false;
          console.error('Error updating lead status:', err);
          if (err.status === 400) {
            alert('Validation error: ' + (err.error?.message || 'Please check your input'));
          } else if (err.status === 404) {
            alert('Lead status not found');
          } else if (err.status === 409) {
            alert('Lead status with this name already exists');
          } else {
            alert('Failed to update lead status. Please try again.');
          }
        }
      });
  }

  // Fetch all lead statuses
  fetchLeadStatuses(): void {
    this.loading = true;
    this.error = null;

    this.leadStatusService.getAllLeadStatuses()
      .subscribe({
        next: (data) => {
          this.leadStatuses = data;
          this.filteredStatuses = [...data];
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load lead statuses. Please try again.';
          this.loading = false;
          console.error('Error fetching lead statuses:', err);
        }
      });
  }

  calculateStats(): void {
    this.totalStatuses = this.leadStatuses.length;
    this.activeStatuses = this.leadStatuses.filter(s => s.isActive).length;
  }

  filterStatuses(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStatuses = [...this.leadStatuses];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredStatuses = this.leadStatuses.filter(status =>
      status.name.toLowerCase().includes(term)
    );
  }

  refreshData(): void {
    this.fetchLeadStatuses();
    this.searchTerm = '';
  }

  toggleActive(status: LeadStatus): void {
    const newStatus = !status.isActive;

    const updateData: LeadStatusUpdateDto = {
      name: status.name,
      isActive: newStatus
    };

    status.updating = true;

    this.leadStatusService.updateLeadStatus(status.id, updateData)
      .subscribe({
        next: () => {
          this.fetchLeadStatuses();
          alert(`Lead status "${status.name}" is now ${newStatus ? 'active' : 'inactive'}`);
        },
        error: (err) => {
          status.updating = false;
          console.error('Error updating lead status:', err);
          alert('Failed to update lead status');
        }
      });
  }

  confirmDelete(status: LeadStatus): void {
    if (confirm(`Are you sure you want to delete "${status.name}"? This action cannot be undone.`)) {
      this.deleteStatus(status);
    }
  }

  deleteStatus(status: LeadStatus): void {
    status.deleting = true;

    this.leadStatusService.deleteLeadStatus(status.id)
      .subscribe({
        next: () => {
          this.fetchLeadStatuses();
          alert(`Lead status "${status.name}" deleted successfully`);
        },
        error: (err) => {
          status.deleting = false;
          console.error('Error deleting lead status:', err);
          
          if (err.status === 400) {
            alert('Cannot delete this lead status as it is being used in the system.');
          } else if (err.status === 404) {
            alert('Lead status not found');
          } else {
            alert('Failed to delete lead status');
          }
        }
      });
  }
}