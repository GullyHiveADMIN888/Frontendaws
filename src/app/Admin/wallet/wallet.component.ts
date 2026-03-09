import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WalletService } from './services/wallet.service';
import {
  UserWalletDto,
  WalletFilter,
  PagedResult,
  CreateWalletDto,
  UpdateWalletDto,
  BulkUpdateWalletDto,
  User,
  WalletDetailDto
} from './models/wallet.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-wallet-list',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.css'],
    standalone: false
})
export class WalletListComponent implements OnInit {
  Math = Math;

  wallets: UserWalletDto[] = [];
  selectedWallet: UserWalletDto | null = null;
  selectedSingleWallet: UserWalletDto | null = null;
  selectedEditType: 'cashable' | 'non_cashable' = 'cashable';
  selectedBulkUser: UserWalletDto | null = null;

  totalCount = 0;
  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  expandedRowId: number | null = null;
  loading = false;
  initialLoading = true;

  // Stats
  totalCashableBalance = 0;
  totalNonCashableBalance = 0;
  totalCombinedBalance = 0;

  // Modal states
  showCreateModal = false;
  showBulkUpdateModal = false;
  showSingleEditModal = false;

  // Filter form
  filterForm!: FormGroup;

  // Create form
  walletForm!: FormGroup;
  isSubmitting = false;

  // Bulk update form
  bulkUpdateForm!: FormGroup;

  // Single edit form
  singleEditForm!: FormGroup;

  // User search properties
  filteredUsers: User[] = [];
  showUserDropdown = false;
  selectedUser: User | null = null;
  loadingUsers = false;
  userSearchError = false;

  // Create user search properties
  filteredCreateUsers: User[] = [];
  showCreateUserDropdown = false;
  selectedCreateUser: User | null = null;
  loadingCreateUsers = false;
  createUserSearchError = false;

  // Filter options
  walletTypes: string[] = [];
  walletAmountTypes: string[] = [];
  currencies: string[] = [];

  @ViewChild('userSearchInput') userSearchInputElement!: ElementRef;
  @ViewChild('userDropdown') userDropdown!: ElementRef;
  @ViewChild('createUserSearchInput') createUserSearchInputElement!: ElementRef;
  @ViewChild('createUserDropdown') createUserDropdown!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService
  ) { }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.initFilterForm();
    this.initWalletForm();
    this.initBulkUpdateForm();
    this.initSingleEditForm();
    this.setupUserSearch();
    this.setupCreateUserSearch();
    this.loadWallets();
  }

  loadFilterOptions(): void {
    this.walletService.getWalletTypes().subscribe({
      next: (types) => this.walletTypes = types,
      error: (error) => console.error('Error loading wallet types:', error)
    });

    this.walletService.getWalletAmountTypes().subscribe({
      next: (types) => this.walletAmountTypes = types,
      error: (error) => console.error('Error loading wallet amount types:', error)
    });

    this.walletService.getCurrencies().subscribe({
      next: (currencies) => this.currencies = currencies,
      error: (error) => console.error('Error loading currencies:', error)
    });
  }

  initFilterForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm = this.fb.group({
      searchTerm: [''],
      userSearch: [''],
      userId: [''],
      walletType: [''],
      walletAmountType: [''],
      startDate: [this.formatDateForInput(thirtyDaysAgo)],
      startTime: ['00:00'],
      endDate: [this.formatDateForInput(today)],
      endTime: ['23:59']
    });
  }

  initWalletForm(): void {
    this.walletForm = this.fb.group({
        userSearch: [''],
        userId: ['', Validators.required],
        walletType: [null, Validators.required],
        walletAmountType: [null, Validators.required],
        balance: [0, [
            Validators.required,
            Validators.min(0),
            Validators.max(100000),
            Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]],
        currency: ['INR']
    });
}

  initBulkUpdateForm(): void {
    this.bulkUpdateForm = this.fb.group({
        cashableBalance: ['', [
            Validators.min(0),
            Validators.max(100000),
            Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]],
        nonCashableBalance: ['', [
            Validators.min(0),
            Validators.max(100000),
            Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]],
        currency: ['INR']
    });
}

  initSingleEditForm(): void {
    this.singleEditForm = this.fb.group({
        balance: ['', [
            Validators.required,
            Validators.min(0),
            Validators.max(100000),
            Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]],
        currency: ['INR'],
        walletAmountType: ['', Validators.required]
    });
}

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Setup user search for filter
  setupUserSearch(): void {
    this.filterForm.get('userSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchUsers(searchTerm);
        } else {
          this.filteredUsers = [];
          this.showUserDropdown = false;
        }
      });
  }

  // Setup user search for create modal
  setupCreateUserSearch(): void {
    this.walletForm.get('userSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim()) {
          this.searchCreateUsers(searchTerm);
        } else {
          this.filteredCreateUsers = [];
          this.showCreateUserDropdown = false;
        }
      });
  }

  searchUsers(searchTerm: string): void {
    this.loadingUsers = true;
    this.userSearchError = false;

    this.walletService.searchUsers(searchTerm.trim(), 10).subscribe({
      next: (users) => {
        this.filteredUsers = users;
        this.loadingUsers = false;
        if (users && users.length > 0) {
          this.showUserDropdown = true;
        } else {
          this.showUserDropdown = false;
        }
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.loadingUsers = false;
        this.userSearchError = true;
        this.filteredUsers = [];
      }
    });
  }

  searchCreateUsers(searchTerm: string): void {
    this.loadingCreateUsers = true;
    this.createUserSearchError = false;

    this.walletService.searchUsers(searchTerm.trim(), 10).subscribe({
      next: (users) => {
        this.filteredCreateUsers = users;
        this.loadingCreateUsers = false;
        if (users && users.length > 0) {
          this.showCreateUserDropdown = true;
        } else {
          this.showCreateUserDropdown = false;
        }
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.loadingCreateUsers = false;
        this.createUserSearchError = true;
        this.filteredCreateUsers = [];
      }
    });
  }

  // Filter user search handlers
  onUserSearchInput(): void {
    const searchTerm = this.filterForm.get('userSearch')?.value;
    if (searchTerm && searchTerm.trim()) {
      if (this.selectedUser && searchTerm !== this.getUserDisplayName(this.selectedUser)) {
        this.clearUserSelection();
      }
      this.showUserDropdown = true;
    } else {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      this.clearUserSelection();
    }
  }

  onUserSearchClick(): void {
    const searchTerm = this.filterForm.get('userSearch')?.value;
    if (searchTerm && searchTerm.trim() && this.filteredUsers.length > 0) {
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

  selectUser(user: User): void {
    this.selectedUser = user;
    this.filterForm.patchValue({
      userId: user.id,
      userSearch: this.getUserDisplayName(user)
    }, { emitEvent: false });
    this.showUserDropdown = false;
    this.filteredUsers = [];
  }

  clearUserSelection(): void {
    this.selectedUser = null;
    this.filterForm.patchValue({
      userId: null,
      userSearch: ''
    }, { emitEvent: false });
    this.filteredUsers = [];
    this.showUserDropdown = false;
  }

  // Create user search handlers
  onCreateUserSearchInput(): void {
    const searchTerm = this.walletForm.get('userSearch')?.value;
    if (searchTerm && searchTerm.trim()) {
      if (this.selectedCreateUser && searchTerm !== this.getUserDisplayName(this.selectedCreateUser)) {
        this.clearCreateUserSelection();
      }
      this.showCreateUserDropdown = true;
    } else {
      this.filteredCreateUsers = [];
      this.showCreateUserDropdown = false;
      this.clearCreateUserSelection();
    }
  }

  onCreateUserSearchClick(): void {
    const searchTerm = this.walletForm.get('userSearch')?.value;
    if (searchTerm && searchTerm.trim() && this.filteredCreateUsers.length > 0) {
      this.showCreateUserDropdown = true;
    }
  }

  onCreateUserInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setTimeout(() => {
          const firstItem = document.querySelector('.create-user-dropdown-item');
          if (firstItem instanceof HTMLElement) firstItem.focus();
        });
        break;
      case 'Escape':
        this.showCreateUserDropdown = false;
        break;
      case 'Enter':
        if (this.filteredCreateUsers.length === 1 && !this.selectedCreateUser) {
          this.selectCreateUser(this.filteredCreateUsers[0]);
        }
        break;
    }
  }

  selectCreateUser(user: User): void {
    this.selectedCreateUser = user;
    this.walletForm.patchValue({
      userId: user.id,
      userSearch: this.getUserDisplayName(user)
    }, { emitEvent: false });
    this.showCreateUserDropdown = false;
    this.filteredCreateUsers = [];
  }

  clearCreateUserSelection(): void {
    this.selectedCreateUser = null;
    this.walletForm.patchValue({
      userId: null,
      userSearch: ''
    }, { emitEvent: false });
    this.filteredCreateUsers = [];
    this.showCreateUserDropdown = false;
  }

  getUserDisplayName(user: User): string {
    if (!user) return '';
    const displayName = user.name || 'Unknown';
    const email = user.email ? ` (${user.email})` : '';
    return `${displayName}${email}`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Filter user dropdown
    if (this.userSearchInputElement?.nativeElement?.contains(event.target) ||
      this.userDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    // Create user dropdown
    if (this.createUserSearchInputElement?.nativeElement?.contains(event.target) ||
      this.createUserDropdown?.nativeElement?.contains(event.target)) {
      return;
    }

    this.showUserDropdown = false;
    this.showCreateUserDropdown = false;
  }

  loadWallets(): void {
    this.loading = true;

    const formValues = this.filterForm.value;

    // Combine date and time for start date
    let startDateTime: string | undefined;
    if (formValues.startDate) {
      const startTime = formValues.startTime || '00:00';
      startDateTime = new Date(formValues.startDate + 'T' + startTime + ':00').toISOString();
    }

    // Combine date and time for end date
    let endDateTime: string | undefined;
    if (formValues.endDate) {
      const endTime = formValues.endTime || '23:59';
      endDateTime = new Date(formValues.endDate + 'T' + endTime + ':00').toISOString();
    }

    const filter: WalletFilter = {
      searchTerm: formValues.searchTerm || undefined,
      userId: formValues.userId || undefined,
      walletType: formValues.walletType || undefined,
      walletAmountType: formValues.walletAmountType || undefined,
      startDate: startDateTime,
      endDate: endDateTime,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: 'total_balance',
      sortOrder: 'desc'
    };

    this.walletService.getWallets(filter).subscribe({
      next: (res: PagedResult<UserWalletDto>) => {
        this.wallets = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.calculateStats();
        this.loading = false;
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading wallets:', error);
        this.loading = false;
        this.initialLoading = false;
        Swal.fire('Error!', 'Failed to load wallets', 'error');
      }
    });
  }

  calculateStats(): void {
    this.totalCashableBalance = this.wallets.reduce((sum, wallet) =>
      sum + (wallet.cashableWallet?.balance || 0), 0);
    this.totalNonCashableBalance = this.wallets.reduce((sum, wallet) =>
      sum + (wallet.nonCashableWallet?.balance || 0), 0);
    this.totalCombinedBalance = this.totalCashableBalance + this.totalNonCashableBalance;
  }

  // Modal methods
  openCreateModal(): void {
    this.resetWalletForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetWalletForm();
    this.clearCreateUserSelection();
  }

  openBulkUpdateModal(wallet?: UserWalletDto): void {
    if (wallet) {
        // Called with wallet from row
        this.selectedBulkUser = wallet;
        this.showBulkUpdateModal = true;
        this.resetBulkUpdateForm();
        
        this.bulkUpdateForm.patchValue({
            cashableBalance: wallet.cashableWallet?.balance,
            nonCashableBalance: wallet.nonCashableWallet?.balance,
            currency: wallet.cashableWallet?.currency || wallet.nonCashableWallet?.currency || 'INR'
        });
    } else if (this.selectedUser) {
        // Called from header with selected user from filter
        this.walletService.getWalletsByUserId(this.selectedUser.id).subscribe({
            next: (userWallet) => {
                this.selectedBulkUser = userWallet;
                this.showBulkUpdateModal = true;
                this.resetBulkUpdateForm();
                
                this.bulkUpdateForm.patchValue({
                    cashableBalance: userWallet.cashableWallet?.balance,
                    nonCashableBalance: userWallet.nonCashableWallet?.balance,
                    currency: userWallet.cashableWallet?.currency || userWallet.nonCashableWallet?.currency || 'INR'
                });
            },
            error: (error) => {
                console.error('Error loading user wallets:', error);
                Swal.fire('Error!', 'Failed to load user wallets', 'error');
            }
        });
    } else {
        Swal.fire({
            title: 'Select User',
            text: 'Please select a user first to perform bulk update',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    }
}

  closeBulkUpdateModal(): void {
    this.showBulkUpdateModal = false;
    this.selectedBulkUser = null;
    this.resetBulkUpdateForm();
  }

  openEditModal(wallet: UserWalletDto): void {
    this.selectedBulkUser = wallet; 
    this.showBulkUpdateModal = true;
    this.resetBulkUpdateForm();
    
    // Pre-fill the form with existing values if needed
    this.bulkUpdateForm.patchValue({
        cashableBalance: wallet.cashableWallet?.balance,
        nonCashableBalance: wallet.nonCashableWallet?.balance,
        currency: wallet.cashableWallet?.currency || wallet.nonCashableWallet?.currency || 'INR'
    });
}

  openSingleWalletEditModal(wallet: UserWalletDto, type: 'cashable' | 'non_cashable'): void {
    this.selectedSingleWallet = wallet;
    this.selectedEditType = type;

    const walletData = type === 'cashable' ? wallet.cashableWallet : wallet.nonCashableWallet;
    if (walletData) {
      this.singleEditForm.patchValue({
        balance: walletData.balance,
        currency: walletData.currency,
        walletAmountType: type
      });
    }

    this.showSingleEditModal = true;
  }

  closeSingleEditModal(): void {
    this.showSingleEditModal = false;
    this.selectedSingleWallet = null;
    this.singleEditForm.reset();
  }

  // Form reset methods
  resetWalletForm(): void {
    this.walletForm.reset({
      walletType: 'provider',
      balance: 0,
      currency: 'INR'
    });
  }

  resetBulkUpdateForm(): void {
    this.bulkUpdateForm.reset({
      currency: 'INR'
    });
  }

  // CRUD operations
  createWallet(): void {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.walletForm.controls).forEach(key => {
        this.walletForm.get(key)?.markAsTouched();
        this.walletForm.get(key)?.markAsDirty();
    });

    if (this.walletForm.invalid) {
        Swal.fire({
            title: 'Validation Error',
            text: 'Please fix the validation errors before submitting',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    this.isSubmitting = true;
    const formValue = this.walletForm.value;

    const dto: CreateWalletDto = {
        userId: formValue.userId,
        walletType: formValue.walletType,
        balance: Number(formValue.balance),
        currency: formValue.currency,
        walletAmountType: formValue.walletAmountType
    };

    this.walletService.createWallet(dto).subscribe({
        next: (response) => {
            this.isSubmitting = false;
            this.closeCreateModal();
            Swal.fire('Success!', 'Wallet created successfully.', 'success');
            this.loadWallets();
        },
        error: (error) => {
            this.isSubmitting = false;
            console.error('Error creating wallet:', error);
            Swal.fire('Error!', error.error?.error || 'Failed to create wallet', 'error');
        }
    });
}

  bulkUpdateWallets(): void {
    if (!this.selectedBulkUser) return;

    // Mark all fields as touched to trigger validation display
    Object.keys(this.bulkUpdateForm.controls).forEach(key => {
        this.bulkUpdateForm.get(key)?.markAsTouched();
        this.bulkUpdateForm.get(key)?.markAsDirty();
    });

    // Check if form has any validation errors
    if (this.bulkUpdateForm.invalid) {
        Swal.fire({
            title: 'Validation Error',
            text: 'Please fix the validation errors before submitting',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    this.isSubmitting = true;
    const formValue = this.bulkUpdateForm.value;

    // Helper function to parse balance values
    const parseBalance = (value: any): number | undefined => {
        if (value === '' || value === null || value === undefined) {
            return undefined;
        }
        return Number(value);
    };

    const dto: BulkUpdateWalletDto = {
        userId: this.selectedBulkUser.userId,
        walletType: 'provider',
        cashableBalance: parseBalance(formValue.cashableBalance),
        nonCashableBalance: parseBalance(formValue.nonCashableBalance),
        currency: formValue.currency
    };

    // Validate that at least one field has a value
    if (dto.cashableBalance === undefined && dto.nonCashableBalance === undefined) {
        Swal.fire({
            title: 'Validation Error',
            text: 'Please provide at least one balance to update',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        this.isSubmitting = false;
        return;
    }

    console.log('Sending DTO:', dto);

    this.walletService.bulkUpdateWallets(dto).subscribe({
        next: (response) => {
            this.isSubmitting = false;
            this.closeBulkUpdateModal();
            Swal.fire('Success!', 'Wallets updated successfully.', 'success');
            this.loadWallets();
        },
        error: (error) => {
            this.isSubmitting = false;
            console.error('Error bulk updating wallets:', error);
            Swal.fire('Error!', error.error?.error || 'Failed to update wallets', 'error');
        }
    });
}

  updateSingleWallet(): void {
    if (!this.selectedSingleWallet) return;

    // Mark all fields as touched to trigger validation display
    Object.keys(this.singleEditForm.controls).forEach(key => {
        this.singleEditForm.get(key)?.markAsTouched();
        this.singleEditForm.get(key)?.markAsDirty();
    });

    if (this.singleEditForm.invalid) {
        Swal.fire({
            title: 'Validation Error',
            text: 'Please fix the validation errors before submitting',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    this.isSubmitting = true;
    const formValue = this.singleEditForm.value;

    const walletData = this.selectedEditType === 'cashable'
        ? this.selectedSingleWallet.cashableWallet
        : this.selectedSingleWallet.nonCashableWallet;

    if (!walletData) {
        Swal.fire('Error!', 'Wallet not found', 'error');
        this.isSubmitting = false;
        return;
    }

    const dto: UpdateWalletDto = {
        balance: Number(formValue.balance),
        currency: formValue.currency,
        walletAmountType: formValue.walletAmountType
    };

    this.walletService.updateWallet(walletData.id, dto).subscribe({
        next: (response) => {
            this.isSubmitting = false;
            this.closeSingleEditModal();
            Swal.fire('Success!', 'Wallet updated successfully.', 'success');
            this.loadWallets();
        },
        error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating wallet:', error);
            Swal.fire('Error!', error.error?.error || 'Failed to update wallet', 'error');
        }
    });
}

  // Delete methods
  openDeleteModal(wallet: UserWalletDto): void {
    Swal.fire({
      title: 'Delete User Wallets',
      text: `Are you sure you want to delete all wallets for ${wallet.userDisplayName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAllUserWallets(wallet.userId);
      }
    });
  }

  openSingleWalletDeleteModal(wallet: UserWalletDto, type: 'cashable' | 'non_cashable'): void {
    const walletData = type === 'cashable' ? wallet.cashableWallet : wallet.nonCashableWallet;
    if (!walletData) return;

    Swal.fire({
      title: `Delete ${type} Wallet`,
      text: `Are you sure you want to delete the ${type} wallet for ${wallet.userDisplayName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteSingleWallet(wallet.userId, 'provider', type);
      }
    });
  }

  deleteSingleWallet(userId: number, walletType: string, walletAmountType: string): void {
    this.walletService.deleteWalletByUserAndType(userId, walletType, walletAmountType).subscribe({
      next: (response) => {
        Swal.fire('Deleted!', response.message, 'success');
        this.loadWallets();
      },
      error: (error) => {
        console.error('Error deleting wallet:', error);
        Swal.fire('Error!', error.error?.error || 'Failed to delete wallet', 'error');
      }
    });
  }

  deleteAllUserWallets(userId: number): void {
    this.walletService.deleteAllUserWallets(userId).subscribe({
      next: (response) => {
        Swal.fire('Deleted!', response.message, 'success');
        this.loadWallets();
      },
      error: (error) => {
        console.error('Error deleting wallets:', error);
        Swal.fire('Error!', error.error?.error || 'Failed to delete wallets', 'error');
      }
    });
  }

  // Utility methods
  formatCurrency(amount?: number, currency: string = 'INR'): string {
    if (amount === undefined || amount === null) return 'N/A';
    return this.walletService.formatCurrency(amount, currency);
  }

  getWalletDetails(wallet: UserWalletDto, type: string): WalletDetailDto | null {
    if (type === 'cashable') {
      return wallet.cashableWallet;
    } else if (type === 'non_cashable') {
      return wallet.nonCashableWallet;
    }
    return null;
  }

  toggleRow(id: number): void {
    this.expandedRowId = this.expandedRowId === id ? null : id;
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadWallets();
  }

  resetFilters(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm.reset({
      searchTerm: '',
      userSearch: '',
      userId: '',
      walletType: '',
      walletAmountType: '',
      startDate: this.formatDateForInput(thirtyDaysAgo),
      startTime: '00:00',
      endDate: this.formatDateForInput(today),
      endTime: '23:59'
    });

    this.clearUserSelection();
    this.pageNumber = 1;
    this.loadWallets();
  }

  changePage(delta: number): void {
    const newPage = this.pageNumber + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadWallets();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadWallets();
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
    if (formValues.startDate) count++;
    if (formValues.endDate) count++;

    return count;
  }
}