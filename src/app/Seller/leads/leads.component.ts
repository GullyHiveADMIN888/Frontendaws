
import { Component, OnInit } from '@angular/core';

import { SellerService, Lead } from '../seller.service';

// @Component({
//   selector: 'app-leads',
//   templateUrl: './leads.component.html',
//   styleUrls: ['./leads.component.css']
// })
// export class LeadsComponent implements OnInit {
//   filterStatus: 'all' | 'new' | 'responded' | 'viewed' = 'all';
//   leads: Lead[] = [];
//   loading = true;

//   constructor(private sellerService: SellerService) {}

//   ngOnInit(): void {
//     this.loadLeads();
//   }

//   loadLeads() {
//     this.sellerService.getLeads().subscribe({
//       next: (data) => {
//         this.leads = data.map(l => ({
//           ...l,
//           name: l.customerName,     // map API fields to template
//           service: l.serviceName,
//           location: l.location,
//           budget: l.budgetMin && l.budgetMax ? `₹${l.budgetMin} - ₹${l.budgetMax}` : 'N/A',
//           status: l.status,
//           time: new Date(l.createdAt).toLocaleString()
//         }));
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Failed to load leads', err);
//         this.loading = false;
//       }
//     });
//   }

//   setFilter(status: any) {
//     this.filterStatus = status;
//   }

//   get filteredLeads() {
//     return this.filterStatus === 'all'
//       ? this.leads
//       : this.leads.filter(l => l.status === this.filterStatus);
//   }
// }



// @Component({
//   selector: 'app-leads',
//   templateUrl: './leads.component.html',
//   styleUrls: ['./leads.component.css']
// })
// export class LeadsComponent implements OnInit {

//   filterStatus: 'all' | 'new' | 'responded' | 'viewed' = 'all';
//   leads: Lead[] = [];
//   loading = true;

//   // Pagination
//   currentPage = 1;
//   pageSize = 10;
//   totalPages = 1;

//   constructor(private sellerService: SellerService) {}

//   ngOnInit(): void {
//     this.loadLeads();
//   }

//   loadLeads() {
//     this.sellerService.getLeads().subscribe({
//       next: (data) => {
//         this.leads = data.map(l => ({
//           ...l,
//           location: l.location,
//           budget: l.budgetMin && l.budgetMax
//             ? `₹${l.budgetMin} - ₹${l.budgetMax}`
//             : 'N/A',
//           time: new Date(l.createdAt).toLocaleString()
//         }));

//         this.updatePagination();
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Failed to load leads', err);
//         this.loading = false;
//       }
//     });
//   }

//   setFilter(status: any) {
//     this.filterStatus = status;
//     this.currentPage = 1;
//     this.updatePagination();
//   }

//   get filteredLeads(): Lead[] {
//     return this.filterStatus === 'all'
//       ? this.leads
//       : this.leads.filter(l => l.status === this.filterStatus);
//   }

//   get paginatedLeads(): Lead[] {
//     const start = (this.currentPage - 1) * this.pageSize;
//     return this.filteredLeads.slice(start, start + this.pageSize);
//   }

//   updatePagination() {
//     this.totalPages = Math.ceil(this.filteredLeads.length / this.pageSize) || 1;
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   prevPage() {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   goToPage(page: number) {
//     this.currentPage = page;
//   }

//   get pages(): number[] {
//     return Array.from({ length: this.totalPages }, (_, i) => i + 1);
//   }

//   // Count helpers
//   get totalLeads() {
//     return this.filteredLeads.length;
//   }

//   get startIndex() {
//     return this.totalLeads === 0
//       ? 0
//       : (this.currentPage - 1) * this.pageSize + 1;
//   }

//   get endIndex() {
//     return Math.min(this.currentPage * this.pageSize, this.totalLeads);
//   }
// }


@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit {

  filterStatus: 'all' | 'new' | 'responded' | 'viewed' = 'all';
  leads: Lead[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads() {
    this.sellerService.getLeads().subscribe({
      next: (data) => {
        this.leads = data.map(l => ({
          ...l,
          location: l.location,
          budget: l.budgetMin && l.budgetMax
            ? `₹${l.budgetMin} - ₹${l.budgetMax}`
            : 'N/A',
          time: new Date(l.createdAt).toLocaleString()
        }));

        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load leads', err);
        this.loading = false;
      }
    });
  }

  setFilter(status: any) {
    this.filterStatus = status;
    this.currentPage = 1;
    this.updatePagination();
  }

  get filteredLeads(): Lead[] {
    return this.filterStatus === 'all'
      ? this.leads
      : this.leads.filter(l => l.status === this.filterStatus);
  }

  get paginatedLeads(): Lead[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLeads.length / this.pageSize) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Count helpers
  get totalLeads() {
    return this.filteredLeads.length;
  }

  get startIndex() {
    return this.totalLeads === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.totalLeads);
  }
}
