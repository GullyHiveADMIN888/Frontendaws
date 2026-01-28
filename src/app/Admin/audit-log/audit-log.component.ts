import { Component, OnInit } from '@angular/core';
import { AuditLog } from './models/audit-log.model';
import { PagedResult } from './models/paged-result.model';
import { AuditLogService } from './services/audit-log.service';

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

  entityType?: string;
  action: string = '';
  actorUserId?: number;
  
  // Date and time filters
  startDate?: string;
  startTime: string = '00:00';
  endDate?: string;
  endTime: string = '23:59';

  expandedRowId: number | null = null;
  loading = false;

  constructor(private auditService: AuditLogService) {}

  ngOnInit(): void {
    this.initializeDateFilters();
    this.loadLogs();
  }

  initializeDateFilters(): void {
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.endDate = this.formatDateForInput(today);
    this.endTime = '23:59';
    this.startDate = this.formatDateForInput(thirtyDaysAgo);
    this.startTime = '00:00';
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Combine date and time into ISO string
  getStartDateTime(): string | undefined {
    if (!this.startDate) return undefined;
    const dateTime = new Date(this.startDate + 'T' + (this.startTime || '00:00'));
    return dateTime.toISOString();
  }

  getEndDateTime(): string | undefined {
    if (!this.endDate) return undefined;
    const dateTime = new Date(this.endDate + 'T' + (this.endTime || '23:59'));
    return dateTime.toISOString();
  }

  loadLogs(): void {
    this.loading = true;

    this.auditService.getAuditLogs({
      entityType: this.entityType,
      action: this.action,
      actorUserId: this.actorUserId,
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
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.loading = false;
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
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.entityType = undefined;
    this.action = '';
    this.actorUserId = undefined;
    this.initializeDateFilters();
    this.pageNumber = 1;
    this.loadLogs();
  }

  setDateRange(range: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth'): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (range) {
      case 'today':
        this.startDate = this.formatDateForInput(today);
        this.startTime = '00:00';
        this.endDate = this.formatDateForInput(today);
        this.endTime = '23:59';
        break;
        
      case 'yesterday':
        this.startDate = this.formatDateForInput(yesterday);
        this.startTime = '00:00';
        this.endDate = this.formatDateForInput(yesterday);
        this.endTime = '23:59';
        break;
        
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        this.startDate = this.formatDateForInput(last7Days);
        this.startTime = '00:00';
        this.endDate = this.formatDateForInput(today);
        this.endTime = '23:59';
        break;
        
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        this.startDate = this.formatDateForInput(last30Days);
        this.startTime = '00:00';
        this.endDate = this.formatDateForInput(today);
        this.endTime = '23:59';
        break;
        
      case 'thismonth':
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = this.formatDateForInput(firstDayThisMonth);
        this.startTime = '00:00';
        this.endDate = this.formatDateForInput(today);
        this.endTime = '23:59';
        break;
        
      case 'lastmonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        this.startDate = this.formatDateForInput(firstDayLastMonth);
        this.startTime = '00:00';
        this.endDate = this.formatDateForInput(lastDayLastMonth);
        this.endTime = '23:59';
        break;
    }
    
    this.applyFilters();
  }

  // Time change handlers to update the filters
  onStartDateChange(event: any): void {
    this.startDate = event.target.value;
  }

  onStartTimeChange(event: any): void {
    this.startTime = event.target.value || '00:00';
  }

  onEndDateChange(event: any): void {
    this.endDate = event.target.value;
  }

  onEndTimeChange(event: any): void {
    this.endTime = event.target.value || '23:59';
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
    if (this.entityType) count++;
    if (this.action) count++;
    if (this.actorUserId) count++;
    if (this.startDate) count++;
    if (this.endDate) count++;
    return count;
  }
}