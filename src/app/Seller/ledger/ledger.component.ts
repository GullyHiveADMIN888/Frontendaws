
import { Component, OnInit } from '@angular/core';
import { SellerService, WalletTransaction } from '../seller.service';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
})

// export class LedgerComponent implements OnInit {
//   wallets: WalletTransaction[] = [];
//   sellerId!: number;

//   availableBalance: number = 0;
// currency: string = 'INR';


//   constructor(private sellerService: SellerService) {}

//   ngOnInit(): void {
//     this.sellerService.sellerId$.subscribe(id => {
//       if (id) {
//         this.sellerId = id;
//         this.loadWallets();
//       }
//     });
//   }


//  transactions: WalletTransaction[] = [];

// loadWallets() {
//   this.sellerService.getWalletTransactions(this.sellerId).subscribe({
//     next: (data) => {
//       this.transactions = data;

//       if (data.length > 0) {
//         this.availableBalance = data[0].balance; // wallet balance
//         this.currency = data[0].currency;        // wallet currency
//       }

//       console.log('Available Balance:', this.availableBalance);
//     },
//     error: (err) => console.error('Error loading wallets', err)
//   });
// }


// }

export class LedgerComponent implements OnInit {
  transactions: WalletTransaction[] = [];
  sellerId!: number;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 15;
  totalPages: number = 0;

  // Balances
  totalBalance: number = 0;
  cashableBalance: number = 0;
  nonCashableBalance: number = 0;
  currency: string = 'INR';

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.sellerId$.subscribe(id => {
      if (id) {
        this.sellerId = id;
        this.loadWallets();
      }
    });
  }

  // loadWallets() {
  //   this.sellerService.getWalletTransactions(this.sellerId).subscribe({
  //     next: (data) => {
  //       this.transactions = data;

  //       if (data.length > 0) {
  //         const first = data[0];
  //         this.totalBalance = first.total_balance;
  //         this.cashableBalance = first.cashable_balance ?? 0;
  //         this.nonCashableBalance = first.non_cashable_balance ?? 0;
  //         this.currency = first.currency;
  //       }

  //       console.log('Balances:', this.totalBalance, this.cashableBalance, this.nonCashableBalance);
  //     },
  //     error: (err) => console.error('Error loading wallets', err)
  //   });
  // }


   loadWallets() {
    this.sellerService.getWalletTransactions(this.sellerId).subscribe({
      next: (data) => {
        this.transactions = data;

        if (data.length > 0) {
          const first = data[0];
          this.totalBalance = first.total_balance;
          this.cashableBalance = first.cashable_balance ?? 0;
          this.nonCashableBalance = first.non_cashable_balance ?? 0;
          this.currency = first.currency;
        }

        this.totalPages = Math.ceil(this.transactions.length / this.pageSize);
        this.updatePagedTransactions();
      },
      error: (err) => console.error('Error loading wallets', err)
    });
  }

  updatePagedTransactions() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.transactions = this.transactions.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedTransactions();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedTransactions();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedTransactions();
    }
  }
}

