import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditLog, User } from './models/audit-log.model';
import { PagedResult } from './models/paged-result.model';
import { AuditLogService } from './services/audit-log.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  totalCount = 0;
  todaysLogs = 0;
  uniqueUsers = 0;
  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  expandedRowId: number | null = null;
  loading = false;
  initialLoading = true;
  
  // Filter form
  filterForm!: FormGroup;
  
  // User search properties
  filteredUsers: User[] = [];
  showUserDropdown = false;
  selectedUser: User | null = null;
  loadingUsers = false;
  searchError = false;
  
  // Subject for user search
  private searchTerms = new Subject<string>();

  @ViewChild('userSearchInput') userSearchInputElement!: ElementRef;
  @ViewChild('userDropdown') userDropdown!: ElementRef;

  constructor(
    private auditService: AuditLogService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeDateFilters();
    this.initFilterForm();
    this.setupUserSearch();
    this.loadLogs();
  }

  initFilterForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm = this.fb.group({
      entityType: [''],
      action: [''],
      actorUserId: [''],
      userSearch: [''],
      startDate: [this.formatDateForInput(thirtyDaysAgo)],
      startTime: ['00:00'],
      endDate: [this.formatDateForInput(today)],
      endTime: ['23:59']
    });
  }

  setupUserSearch(): void {
    this.filterForm.get('userSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchTerm => {
          console.log('User search term:', searchTerm);
          
          // Clear selection if user starts typing a different name
          if (searchTerm && this.selectedUser) {
            const currentDisplay = `${this.selectedUser.name} (${this.selectedUser.email})`;
            if (searchTerm !== currentDisplay) {
              this.clearUserSelection();
            }
          }
          
          // Clear results if search term is empty
          if (!searchTerm.trim()) {
            this.filteredUsers = [];
            this.showUserDropdown = false;
            this.clearUserSelection();
          }
        }),
        switchMap(searchTerm => {
          if (!searchTerm || !searchTerm.trim()) {
            this.loadingUsers = false;
            return of([]);
          }
          
          this.loadingUsers = true;
          this.searchError = false;
          
          return this.auditService.searchUsers(searchTerm.trim(), 10).pipe(
            catchError(error => {
              console.error('Error searching users:', error);
              this.searchError = true;
              this.loadingUsers = false;
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (users) => {
          console.log('Search results:', users);
          this.filteredUsers = users;
          this.loadingUsers = false;
          this.showUserDropdown = users.length > 0;
        },
        error: (error) => {
          console.error('Error in search subscription:', error);
          this.loadingUsers = false;
          this.searchError = true;
        }
      });
  }

  initializeDateFilters(): void {
    // Already handled in form initialization
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStartDateTime(): string | undefined {
    const startDate = this.filterForm.get('startDate')?.value;
    const startTime = this.filterForm.get('startTime')?.value || '00:00';
    
    if (!startDate) return undefined;
    const dateTime = new Date(startDate + 'T' + startTime);
    return dateTime.toISOString();
  }

  getEndDateTime(): string | undefined {
    const endDate = this.filterForm.get('endDate')?.value;
    const endTime = this.filterForm.get('endTime')?.value || '23:59';
    
    if (!endDate) return undefined;
    const dateTime = new Date(endDate + 'T' + endTime);
    return dateTime.toISOString();
  }

  loadLogs(): void {
    this.loading = true;
    
    const formValues = this.filterForm.value;
    
    this.auditService.getAuditLogs({
      entityType: formValues.entityType || undefined,
      action: formValues.action || undefined,
      actorUserId: formValues.actorUserId || undefined,
      startDate: this.getStartDateTime(),
      endDate: this.getEndDateTime(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: (res: PagedResult<AuditLog>) => {
        this.logs = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.loading = false;
        this.initialLoading = false;
      }
    });
  }

  calculateStats(): void {
    const today = new Date().toDateString();
    this.todaysLogs = this.logs.filter(log => 
      new Date(log.createdAt).toDateString() === today
    ).length;
    const uniqueUserIds = new Set(this.logs.map(log => log.actorUserId));
    this.uniqueUsers = uniqueUserIds.size;
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm.patchValue({
      entityType: '',
      action: '',
      actorUserId: '',
      userSearch: '',
      startDate: this.formatDateForInput(thirtyDaysAgo),
      startTime: '00:00',
      endDate: this.formatDateForInput(today),
      endTime: '23:59'
    });

    this.clearUserSelection();
    this.pageNumber = 1;
    this.loadLogs();
  }

  setDateRange(range: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth'): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let startDate: Date = today;
    let endDate: Date = today;
    
    switch (range) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = yesterday;
        endDate = yesterday;
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = today;
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        endDate = today;
        break;
      case 'thismonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'lastmonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }
    
    this.filterForm.patchValue({
      startDate: this.formatDateForInput(startDate),
      startTime: '00:00',
      endDate: this.formatDateForInput(endDate),
      endTime: '23:59'
    });
    
    this.applyFilters();
  }

  // User search methods
  selectUser(user: User): void {
    console.log('User selected:', user);
    this.selectedUser = user;
    
    // Update form values
    this.filterForm.patchValue({
      actorUserId: user.id,
      userSearch: `${user.name} (${user.email})`
    }, { emitEvent: false }); // Don't trigger userSearch valueChanges
    
    this.showUserDropdown = false;
    this.filteredUsers = [];
  }

  clearUserSelection(): void {
    console.log('Clearing user selection');
    this.selectedUser = null;
    
    // Update form values
    this.filterForm.patchValue({
      actorUserId: '',
      userSearch: ''
    }, { emitEvent: false }); // Don't trigger userSearch valueChanges
    
    this.filteredUsers = [];
    this.showUserDropdown = false;
  }

  onUserInputClick(): void {
    console.log('Input clicked');
    // If we have search results and no user selected, show dropdown
    const searchTerm = this.filterForm.get('userSearch')?.value;
    if (searchTerm && searchTerm.trim() && !this.selectedUser && this.filteredUsers.length > 0) {
      this.showUserDropdown = true;
    }
  }

  onUserInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setTimeout(() => {
          const firstItem = document.querySelector('.user-dropdown-item');
          if (firstItem instanceof HTMLElement) firstItem.focus();
        });
        break;
      case 'Escape':
        this.showUserDropdown = false;
        break;
      case 'Enter':
        if (this.filteredUsers.length === 1 && !this.selectedUser) {
          this.selectUser(this.filteredUsers[0]);
        }
        break;
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.userSearchInputElement?.nativeElement.contains(event.target) || 
        this.userDropdown?.nativeElement?.contains(event.target)) {
      return;
    }
    this.showUserDropdown = false;
  }

  toggleRow(id: number): void {
    this.expandedRowId = this.expandedRowId === id ? null : id;
  }

  formatJson(value: string | null): string {
    if (!value) return 'N/A';
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  changePage(delta: number): void {
    const newPage = this.pageNumber + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadLogs();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadLogs();
    }
  }

  getStartIndex(): number {
    return ((this.pageNumber - 1) * this.pageSize) + 1;
  }

  getEndIndex(): number {
    const end = this.pageNumber * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.pageNumber - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getActiveFilters(): number {
    let count = 0;
    const formValues = this.filterForm.value;
    
    if (formValues.entityType) count++;
    if (formValues.action) count++;
    if (formValues.actorUserId) count++;
    if (formValues.startDate) count++;
    if (formValues.endDate) count++;
    
    return count;
  }
}