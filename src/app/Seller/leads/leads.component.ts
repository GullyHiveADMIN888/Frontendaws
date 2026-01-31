
import { Component, OnInit } from '@angular/core';

import { SellerService, Lead } from '../seller.service';


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
  selectedLead: Lead | null = null;
  showLeadModal = false;

  constructor(private sellerService: SellerService) { }

  ngOnInit(): void {
    this.loadLeads();
  }

loadLeads() {
  this.loading = true;

  this.sellerService.getLeads().subscribe({
    next: (data: any[]) => {
      this.leads = data.map((l: any) => {
        const isScheduled = l.timePreference === 'scheduled';

        // Parse price breakdown safely
        let priceBreakdown: { [key: string]: number } | undefined;
        if (l.priceBreakdown) {
          if (typeof l.priceBreakdown === 'string') {
            try {
              priceBreakdown = JSON.parse(l.priceBreakdown);
            } catch (err) {
              console.warn('Invalid priceBreakdown JSON for lead', l.id);
              priceBreakdown = undefined;
            }
          } else {
            priceBreakdown = l.priceBreakdown;
          }
        }

        return {
          ...l,
          description: l.description || 'No description provided',
          location: l.location || 'N/A',
          budget:
            l.budgetMin && l.budgetMax
              ? `₹${l.budgetMin} - ₹${l.budgetMax}`
              : 'Budget not specified',
          time: new Date(l.createdAt).toLocaleString(),
          scheduleLabel:
            isScheduled && l.scheduledStart && l.scheduledEnd
              ? `${new Date(l.scheduledStart).toLocaleString()} - ${new Date(l.scheduledEnd).toLocaleString()}`
              : 'Flexible / Anytime',

          leadPrice: l.leadPrice ? `${l.leadPrice}` : undefined,
          priceBreakdown: priceBreakdown,
          isPurchased: l.isPurchased ?? false,
        } as Lead;
      });

      this.updatePagination();
      this.loading = false;
    },
    error: (err) => {
      console.error('Failed to load leads', err);
      this.loading = false;
    }
  });
}


//   loadLeads() {
//   this.sellerService.getLeads().subscribe({
//     next: (data) => {
//       this.leads = data.map((l) => {
//         const isScheduled = l.timePreference === 'scheduled';

//         return {
//           ...l,

//           // ✅ Safe defaults
//           description: l.description || 'No description provided',
//           location: l.location || 'N/A',

//           // ✅ Budget formatting
//           budget:
//             l.budgetMin && l.budgetMax
//               ? `₹${l.budgetMin} - ₹${l.budgetMax}`
//               : 'Budget not specified',

//           // ✅ Date formatting
//           time: new Date(l.createdAt).toLocaleString(),

//           // ✅ Human-friendly schedule label
//           scheduleLabel: isScheduled && l.scheduledStart && l.scheduledEnd
//             ? `${new Date(l.scheduledStart).toLocaleString()} - ${new Date(l.scheduledEnd).toLocaleString()}`
//             : 'Flexible / Anytime'
//         };
//       });

//       this.updatePagination();
//       this.loading = false;
//     },
//     error: (err) => {
//       console.error('Failed to load leads', err);
//       this.loading = false;
//     }
//   });
// }


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

  openLeadDetails(lead: Lead) {
    this.selectedLead = lead;
    this.showLeadModal = true;
  }

  closeLeadModal() {
    this.showLeadModal = false;
    this.selectedLead = null;
  }




showPaymentModal = false;

buyLead() {
  this.showPaymentModal = true;
}

closePaymentModal() {
  this.showPaymentModal = false;
}

showSendQuoteModal = false;


handleSendQuote(lead: any) {
  this.selectedLead = lead;

  if (lead.isPurchased) {
    // ✅ Lead already purchased → open send quote modal
    this.showSendQuoteModal = true;
  } else {
    // ❌ Not purchased → redirect to buy lead
    this.showPaymentModal = true;
    
  }
}

closeSendQuoteModal() {
  this.showSendQuoteModal = false;
}


confirmBuyLead() {
  const lead = this.selectedLead;
  if (!lead) return;

  this.sellerService.buyLeads(lead.id).subscribe({
    next: (res: any) => {
      lead.isPurchased = true;
      lead.leadPrice = `₹${res.pplPrice}`;

      this.showPaymentModal = false;
      alert(`Lead purchased successfully for ₹${res.pplPrice}`);
    },
    error: (err) => {
      console.error('Failed to buy lead', err);
      alert('Failed to purchase lead. Please try again.');
    }
  });
}

  // buyLead() {
  //   if (!this.selectedLead) return;
  //   // 🔥 Call API here
  //   this.sellerService.buyLead(this.selectedLead.id).subscribe({
  //     next: () => {
  //       alert('Lead purchased successfully');
  //       this.closeLeadModal();
  //       this.loadLeads(); // refresh list
  //     },
  //     error: (err) => {
  //       alert(err?.error?.message || 'Failed to buy lead');
  //     }
  //   });
  // }




}
