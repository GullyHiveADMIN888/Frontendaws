// components/wallet-ledger/wallet-transaction.component.ts
import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WalletTransaction, User, WalletTransactionFilter, PagedResult } from './models/wallet-transaction.model';
import { WalletTransactionService } from './services/wallet-transaction.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-wallet-transaction',
  templateUrl: './wallet-transaction.component.html',
  styleUrls: ['./wallet-transaction.component.css']
})
export class WalletTransactionComponent implements OnInit {
  Math = Math;
  
  transactions: WalletTransaction[] = [];
  totalCount = 0;
  totalCredits = 0;
  totalDebits = 0;
  netBalance = 0;
  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  expandedRowId: number | null = null;
  loading = false;
  
  // Filter form
  filterForm!: FormGroup;
  
  // User search properties
  filteredUsers: User[] = [];
  showUserDropdown = false;
  selectedUser: User | null = null;
  loadingUsers = false;
  searchError = false;
  initialLoading = true;
  
  // Filter options
  walletTypes: string[] = [];
  walletAmountTypes: string[] = [];
  transactionTypes: string[] = []; 
  directions: string[] = ['credit', 'debit']; 
  
  // Subject for user search
  private searchTerms = new Subject<string>();

  @ViewChild('userSearchInput') userSearchInputElement!: ElementRef;
  @ViewChild('userDropdown') userDropdown!: ElementRef;

  constructor(
    private walletService: WalletTransactionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.initFilterForm();
    this.setupUserSearch();
    this.loadTransactions();
  }

  loadFilterOptions(): void {
    this.walletService.getWalletTypes().subscribe(types => this.walletTypes = types);
    this.walletService.getWalletAmountTypes().subscribe(types => this.walletAmountTypes = types);
    this.loadTransactionTypes(); 
  }

  loadTransactionTypes(): void {
    this.transactionTypes = [
      'payment_topup',
      'lead_purchase',
      'lead_refund',
      'partner_earning',
      'admin_adjustment',
      'job_payout',
      'job_payout_reverse'
    ];
    
  }

  initFilterForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm = this.fb.group({
      searchTerm: [''],
      userId: [''],
      userSearch: [''],
      walletType: [''],
      walletAmountType: [''],
      txnType: [''], 
      direction: [''], 
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
          if (searchTerm && this.selectedUser) {
            const currentDisplay = `${this.selectedUser.name} (${this.selectedUser.email})`;
            if (searchTerm !== currentDisplay) {
              this.clearUserSelection();
            }
          }
          
          if (!searchTerm?.trim()) {
            this.filteredUsers = [];
            this.showUserDropdown = false;
            this.clearUserSelection();
          }
        }),
        switchMap(searchTerm => {
          if (!searchTerm?.trim()) {
            this.loadingUsers = false;
            return of([]);
          }
          
          this.loadingUsers = true;
          this.searchError = false;
          
          return this.walletService.searchUsers(searchTerm.trim(), 10).pipe(
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

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStartDateTime(): string | undefined {
    const startDate = this.filterForm.get('startDate')?.value;
    const startTime = this.filterForm.get('startTime')?.value || '00:00';
    
    if (!startDate) return undefined;
    const dateTime = new Date(startDate + 'T' + startTime + ':00');
    return dateTime.toISOString();
  }

  getEndDateTime(): string | undefined {
    const endDate = this.filterForm.get('endDate')?.value;
    const endTime = this.filterForm.get('endTime')?.value || '23:59';
    
    if (!endDate) return undefined;
    const dateTime = new Date(endDate + 'T' + endTime + ':00');
    return dateTime.toISOString();
  }

  loadTransactions(): void {
    this.loading = true;
    
    const formValues = this.filterForm.value;
    const filter: WalletTransactionFilter = {
      searchTerm: formValues.searchTerm || undefined,
      userId: formValues.userId || undefined,
      // email: formValues.email || undefined,
      walletType: formValues.walletType || undefined,
      walletAmountType: formValues.walletAmountType || undefined,
      txnType: formValues.txnType || undefined, 
      direction: formValues.direction || undefined, 
      startDate: this.getStartDateTime(),
      endDate: this.getEndDateTime(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    // console.log('Applying filters:', filter); 

    this.walletService.getWalletTransactions(filter).subscribe({
      next: (res: PagedResult<WalletTransaction>) => {
        this.transactions = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.calculateTotals();
        this.loading = false;
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading = false;
        this.initialLoading = false;
      }
    });
  }

  calculateTotals(): void {
    this.totalCredits = this.transactions
      .filter(t => t.direction?.toLowerCase() === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.totalDebits = this.transactions
      .filter(t => t.direction?.toLowerCase() === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.netBalance = this.totalCredits - this.totalDebits;
    
    // console.log('Totals calculated:', { 
    //   credits: this.totalCredits, 
    //   debits: this.totalDebits, 
    //   netBalance: this.netBalance,
    //   transactions: this.transactions 
    // });
  }

  getTransactionIcon(direction: string, txnType: string): string {
    if (direction?.toLowerCase() === 'credit') {
      return '💰';
    } else {
      switch (txnType?.toLowerCase()) {
        case 'refund': return '↩️';
        case 'cancellation': return '❌';
        case 'withdrawal': return '🏧';
        case 'deposit': return '📥';
        case 'bonus': return '🎁';
        case 'commission': return '💼';
        default: return '💸';
      }
    }
  }

  getTransactionClass(direction: string): string {
    return direction?.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600';
  }

  formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    
    this.filterForm.patchValue({
      userId: user.id,
      userSearch: `${user.name} (${user.email})`
    }, { emitEvent: false });
    
    this.showUserDropdown = false;
    this.filteredUsers = [];
  }

  clearUserSelection(): void {
    this.selectedUser = null;
    
    this.filterForm.patchValue({
      userId: '',
      userSearch: ''
    }, { emitEvent: false });
    
    this.filteredUsers = [];
    this.showUserDropdown = false;
  }

  onUserInputClick(): void {
    const searchTerm = this.filterForm.get('userSearch')?.value;
    if (searchTerm?.trim() && !this.selectedUser && this.filteredUsers.length > 0) {
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

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadTransactions();
  }

  resetFilters(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm.patchValue({
      searchTerm: '',
      userId: '',
      userSearch: '',
      walletType: '',
      walletAmountType: '',
      txnType: '', 
      direction: '', 
      startDate: this.formatDateForInput(thirtyDaysAgo),
      startTime: '00:00',
      endDate: this.formatDateForInput(today),
      endTime: '23:59'
    });

    this.clearUserSelection();
    this.pageNumber = 1;
    this.loadTransactions();
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

  changePage(delta: number): void {
    const newPage = this.pageNumber + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadTransactions();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadTransactions();
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
    
    if (formValues.searchTerm) count++;
    if (formValues.userId) count++;
    if (formValues.walletType) count++;
    if (formValues.walletAmountType) count++;
    if (formValues.txnType) count++;
    if (formValues.direction) count++; 
    if (formValues.startDate) count++;
    if (formValues.endDate) count++;
    
    return count;
  }
}