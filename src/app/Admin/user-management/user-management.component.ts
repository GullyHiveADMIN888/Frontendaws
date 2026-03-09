// components/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { UserManagementService } from './services/user-management.service';
import { User, Role, UserStats, UserListRequest } from './models/user-management.model';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.css'],
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
export class UserManagementComponent implements OnInit {
  // Data
  users: User[] = [];
  roles: Role[] = [];
  stats: UserStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    blockedUsers: 0,
    deletedUsers: 0,
    usersByRole: {},
    todayRegistrations: 0,
    thisWeekRegistrations: 0,
    thisMonthRegistrations: 0
  };

  // Pagination
  page = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  // Filters
  search: string = '';
  
  // Change selectedRoleId to string to match dropdown
  selectedRoleId: string = '';
  selectedRoleName: string = '';
  
  // Status filters as strings
  isActive: string = '';
  isBlocked: string = '';
  
  // Date and time filters
  createdFrom?: string;
  createdFromTime: string = '00:00';
  createdTo?: string;
  createdToTime: string = '23:59';
  
  sortBy: string = 'created_at';
  sortDesc: boolean = true;

  // UI State
  initialLoading = true;
  loading = false;
  expandedUserId: number | null = null;
  selectedUsers: Set<number> = new Set();
  
  // Modal states
  showBlockModal = false;
  showRoleModal = false;
  showEditModal = false;
  
  // Selected user for modals
  selectedUser?: User;
  blockReason: string = '';
  selectedRoleIds: number[] = [];
  editUserData: any = {};

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showAlert = false;

  // Dropdown state
  dropdownOpenForUserId: number | null = null;

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Alert/Message system
  showMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    // Auto-hide after 3 seconds for success/info messages
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    }
  }

  hideMessage(): void {
    this.showAlert = false;
  }

  // Helper method to format date for input
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Combine date and time into ISO string
  getCreatedFromDateTime(): string | undefined {
    if (!this.createdFrom) return undefined;
    const dateTime = new Date(this.createdFrom + 'T' + (this.createdFromTime || '00:00'));
    return dateTime.toISOString();
  }

  getCreatedToDateTime(): string | undefined {
    if (!this.createdTo) return undefined;
    const dateTime = new Date(this.createdTo + 'T' + (this.createdToTime || '23:59'));
    return dateTime.toISOString();
  }

  loadData(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadStats();
  }

  loadUsers(): void {
    this.loading = true;

    // Convert string values from dropdowns to proper types for API
    const roleId = this.selectedRoleId === '' ? undefined : Number(this.selectedRoleId);
    
    // Convert string to boolean or undefined
    const isActiveValue = this.isActive === '' ? undefined : this.isActive === 'true';
    const isBlockedValue = this.isBlocked === '' ? undefined : this.isBlocked === 'true';

    const request: UserListRequest = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      roleId: roleId,
      roleName: this.selectedRoleName || undefined,
      isActive: isActiveValue,
      isBlocked: isBlockedValue,
      createdFrom: this.getCreatedFromDateTime(),
      createdTo: this.getCreatedToDateTime(),
      sortBy: this.sortBy,
      sortDesc: this.sortDesc
    };

    this.userService.getUsers(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data || [];
          this.totalCount = response.totalCount || 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        } else {
          this.showMessage(response.message || 'Failed to load users', 'error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showMessage('Failed to load users', 'error');
        this.loading = false;
        this.initialLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  loadStats(): void {
    this.userService.getUserStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.initialLoading = false;
      }
    });
  }

  // Filter Actions
  applyFilters(): void {
    this.page = 1;
    this.selectedUsers.clear();
    this.closeAllDropdowns();
    this.loadUsers();
  }

  resetFilters(): void {
    // Clear all filters including dates
    this.search = '';
    this.selectedRoleId = '';
    this.selectedRoleName = '';
    this.isActive = '';
    this.isBlocked = '';
    // Clear dates
    this.createdFrom = undefined;
    this.createdFromTime = '00:00';
    this.createdTo = undefined;
    this.createdToTime = '23:59';
    this.sortBy = 'created_at';
    this.sortDesc = true;
    this.page = 1;
    this.selectedUsers.clear();
    this.closeAllDropdowns();
    this.loadUsers();
  }

  // Updated setDateRange to include time
  setDateRange(range: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth'): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (range) {
      case 'today':
        this.createdFrom = this.formatDateForInput(today);
        this.createdFromTime = '00:00';
        this.createdTo = this.formatDateForInput(today);
        this.createdToTime = '23:59';
        break;
        
      case 'yesterday':
        this.createdFrom = this.formatDateForInput(yesterday);
        this.createdFromTime = '00:00';
        this.createdTo = this.formatDateForInput(yesterday);
        this.createdToTime = '23:59';
        break;
        
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        this.createdFrom = this.formatDateForInput(last7Days);
        this.createdFromTime = '00:00';
        this.createdTo = this.formatDateForInput(today);
        this.createdToTime = '23:59';
        break;
        
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        this.createdFrom = this.formatDateForInput(last30Days);
        this.createdFromTime = '00:00';
        this.createdTo = this.formatDateForInput(today);
        this.createdToTime = '23:59';
        break;
        
      case 'thismonth':
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.createdFrom = this.formatDateForInput(firstDayThisMonth);
        this.createdFromTime = '00:00';
        this.createdTo = this.formatDateForInput(today);
        this.createdToTime = '23:59';
        break;
        
      case 'lastmonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        this.createdFrom = this.formatDateForInput(firstDayLastMonth);
        this.createdFromTime = '00:00';
        this.createdTo = this.formatDateForInput(lastDayLastMonth);
        this.createdToTime = '23:59';
        break;
    }
    
    this.applyFilters();
  }

  // Time change handlers
  onCreatedFromDateChange(event: any): void {
    this.createdFrom = event.target.value;
  }

  onCreatedFromTimeChange(event: any): void {
    this.createdFromTime = event.target.value || '00:00';
  }

  onCreatedToDateChange(event: any): void {
    this.createdTo = event.target.value;
  }

  onCreatedToTimeChange(event: any): void {
    this.createdToTime = event.target.value || '23:59';
  }

  // User Actions
  toggleUser(userId: number): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
    this.closeAllDropdowns();
  }

  toggleUserSelection(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  selectAllUsers(): void {
    if (this.selectedUsers.size === this.users.length) {
      this.selectedUsers.clear();
    } else {
      this.users.forEach(user => this.selectedUsers.add(user.id));
    }
  }

  // Dropdown Actions
  toggleDropdown(userId: number): void {
    this.dropdownOpenForUserId = this.dropdownOpenForUserId === userId ? null : userId;
    if (this.expandedUserId === userId) {
      this.expandedUserId = null;
    }
  }

  closeAllDropdowns(): void {
    this.dropdownOpenForUserId = null;
  }

  // Modal Actions - keep as before
  openBlockModal(user: User): void {
    this.selectedUser = user;
    this.blockReason = '';
    this.showBlockModal = true;
    this.closeAllDropdowns();
  }

  closeBlockModal(): void {
    this.showBlockModal = false;
    this.selectedUser = undefined;
    this.blockReason = '';
  }

  confirmBlockUser(): void {
    if (!this.selectedUser || !this.blockReason || this.blockReason.length < 5) {
      this.showMessage('Please provide a reason (minimum 5 characters)', 'warning');
      return;
    }

    this.userService.blockUser(this.selectedUser.id, this.blockReason).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(response.message || 'User blocked successfully', 'success');
          this.loadUsers();
        } else {
          this.showMessage(response.message || 'Failed to block user', 'error');
        }
        this.closeBlockModal();
      },
      error: (error) => {
        this.showMessage('Failed to block user', 'error');
        this.closeBlockModal();
      }
    });
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.selectedRoleIds = [...user.roleIds];
    this.showRoleModal = true;
    this.closeAllDropdowns();
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedUser = undefined;
    this.selectedRoleIds = [];
  }

  toggleRoleSelection(roleId: number): void {
    const index = this.selectedRoleIds.indexOf(roleId);
    if (index > -1) {
      this.selectedRoleIds.splice(index, 1);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  saveRoleChanges(): void {
    if (!this.selectedUser) return;

    this.userService.updateUserRoles(this.selectedUser.id, this.selectedRoleIds).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(response.message || 'Roles updated successfully', 'success');
          this.loadUsers();
        } else {
          this.showMessage(response.message || 'Failed to update roles', 'error');
        }
        this.closeRoleModal();
      },
      error: (error) => {
        this.showMessage('Failed to update user roles', 'error');
        this.closeRoleModal();
      }
    });
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.editUserData = {
      displayName: user.displayName,
      email: user.email,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      blockReason: user.blockReason || ''
    };
    this.showEditModal = true;
    this.closeAllDropdowns();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = undefined;
    this.editUserData = {};
  }

  saveUserChanges(): void {
    if (!this.selectedUser) return;

    this.userService.updateUser(this.selectedUser.id, this.editUserData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(response.message || 'User updated successfully', 'success');
          this.loadUsers();
        } else {
          this.showMessage(response.message || 'Failed to update user', 'error');
        }
        this.closeEditModal();
      },
      error: (error) => {
        this.showMessage('Failed to update user', 'error');
        this.closeEditModal();
      }
    });
  }

  // Status Management - keep as before
  activateUser(user: User): void {
    if (confirm(`Activate user ${user.displayName}?`)) {
      this.userService.activateUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage(response.message || 'User activated successfully', 'success');
            this.loadUsers();
          } else {
            this.showMessage(response.message || 'Failed to activate user', 'error');
          }
        },
        error: (error) => {
          this.showMessage('Failed to activate user', 'error');
        }
      });
    }
  }

  deactivateUser(user: User): void {
    if (confirm(`Deactivate user ${user.displayName}?`)) {
      this.userService.deactivateUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage(response.message || 'User deactivated successfully', 'success');
            this.loadUsers();
          } else {
            this.showMessage(response.message || 'Failed to deactivate user', 'error');
          }
        },
        error: (error) => {
          this.showMessage('Failed to deactivate user', 'error');
        }
      });
    }
  }

  unblockUser(user: User): void {
    if (confirm(`Unblock user ${user.displayName}?`)) {
      this.userService.unblockUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage(response.message || 'User unblocked successfully', 'success');
            this.loadUsers();
          } else {
            this.showMessage(response.message || 'Failed to unblock user', 'error');
          }
        },
        error: (error) => {
          this.showMessage('Failed to unblock user', 'error');
        }
      });
    }
  }

  softDeleteUser(user: User): void {
    if (confirm(`Soft delete user ${user.displayName}? This action can be reversed.`)) {
      this.userService.softDeleteUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage(response.message || 'User deleted successfully', 'success');
            this.loadUsers();
            this.loadStats();
          } else {
            this.showMessage(response.message || 'Failed to delete user', 'error');
          }
        },
        error: (error) => {
          this.showMessage('Failed to delete user', 'error');
        }
      });
    }
  }

  restoreUser(user: User): void {
    if (confirm(`Restore user ${user.displayName}?`)) {
      this.userService.restoreUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage(response.message || 'User restored successfully', 'success');
            this.loadUsers();
            this.loadStats();
          } else {
            this.showMessage(response.message || 'Failed to restore user', 'error');
          }
        },
        error: (error) => {
          this.showMessage('Failed to restore user', 'error');
        }
      });
    }
  }

  // Bulk Actions - keep as before
  bulkActivate(): void {
    if (this.selectedUsers.size === 0) {
      this.showMessage('Please select users first', 'warning');
      return;
    }

    if (confirm(`Activate ${this.selectedUsers.size} selected users?`)) {
      this.showMessage('Bulk activation feature coming soon', 'info');
    }
  }

  bulkDeactivate(): void {
    if (this.selectedUsers.size === 0) {
      this.showMessage('Please select users first', 'warning');
      return;
    }

    if (confirm(`Deactivate ${this.selectedUsers.size} selected users?`)) {
      this.showMessage('Bulk deactivation feature coming soon', 'info');
    }
  }

  // Pagination - keep as before
  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadUsers();
    }
  }

  getStartIndex(): number {
    return ((this.page - 1) * this.pageSize) + 1;
  }

  getEndIndex(): number {
    const end = this.page * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Helper methods
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActiveFilters(): number {
    let count = 0;
    if (this.search && this.search.trim() !== '') count++;
    if (this.selectedRoleId !== '') count++;
    if (this.selectedRoleName && this.selectedRoleName.trim() !== '') count++;
    if (this.isActive !== '') count++;
    if (this.isBlocked !== '') count++;
    if (this.createdFrom && this.createdFrom.trim() !== '') count++;
    if (this.createdTo && this.createdTo.trim() !== '') count++;
    return count;
  }
}