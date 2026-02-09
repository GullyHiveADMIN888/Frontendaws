
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



  // Send Quote form fields
quoteAmount: number | null = null;
quoteMessage: string = '';


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
        //  time: new Date(l.createdAt).toLocaleString(),
          scheduleLabel:
            isScheduled && l.scheduledStart && l.scheduledEnd
              ? `${new Date(l.scheduledStart).toLocaleString()} - ${new Date(l.scheduledEnd).toLocaleString()}`
              : 'Flexible / Anytime',
          time: this.timeAgo(l.createdAt),
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
 timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
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

closeSendQuoteModal() {
  this.showSendQuoteModal = false;
  this.quoteAmount = null;
  this.quoteMessage = '';
}

handleSendQuote(lead: any) {
  this.selectedLead = lead;

  if (lead.isPurchased) {
    this.quoteAmount = null;
    this.quoteMessage = '';
    this.showSendQuoteModal = true;
  } else {
    this.showPaymentModal = true;
  }
}

  confirmBuyLead() {
  const lead = this.selectedLead;
  if (!lead) return;

  this.sellerService.buyLeads(lead.id).subscribe({
    next: (res: any) => {
      // ✅ Mark as purchased locally
      lead.isPurchased = true;
      lead.leadPrice = `₹${res.pplPrice}`;

      // ✅ Close modal
      this.showPaymentModal = false;

      alert(`Lead purchased successfully for ₹${res.pplPrice}`);
    },

    error: (err) => {
      console.error('Failed to buy lead', err);

      // ✅ Show backend message if available
      const message =
        err?.error?.message ||
        'Failed to purchase lead. Please try again.';

      alert(message);
    }
  });
}


sendQuote() {
  if (!this.selectedLead) return;

  const payload = {
    leadId: this.selectedLead.id,
    priceMin: this.quoteAmount,          // bind input
    priceMax: this.quoteAmount,          // or different field if needed
    notes: this.quoteMessage,
    validUntil: null                     // optional
  };

  this.sellerService.sendQuote(payload).subscribe({
    next: () => {
      alert('Quote sent successfully');
      this.closeSendQuoteModal();
    },
    error: (err) => {
      alert(err?.error?.message || 'Failed to send quote');
    }
  });
}



}
