
import { Component, OnInit, Input } from '@angular/core';

import { SellerService, Lead } from '../seller.service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit {

 // filterStatus: 'all' | 'new' | 'Unlocked' | 'responded' | 'viewed' = 'all';
 filterStatus: 'all' | 'offered' | 'unlocked' | 'responded' | 'viewed' | 'committed' = 'all';
 statuses = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'offered' },
  { label: 'Unlocked', value: 'unlocked' },
  { label: 'Confirmed', value: 'committed' },
  { label: 'Responded', value: 'responded' },
  { label: 'Viewed', value: 'viewed' }
];
  leads: Lead[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  selectedLead: Lead | null = null;
  showLeadModal = false;



  // Send Quote form fields
  quoteAmount: string = '';
  quoteMessage: string = '';

  @Input() totalBalance: number = 0;
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
            //  isPurchased: l.isPurchased === true || l.isPurchased === 'true',
            unlockedCount: Number(l.unlockedCount ?? 0),
            committedCount:  Number(l.committedCount ?? 0),
            lead_Id: l.leadId,
             areaName: l.areaName ?? '',
             areaId: l.areaId ?? null

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

  // setFilter(status: any)
   setFilter(offerStatus: any)
   {
  //  this.filterStatus = status;
    this.filterStatus = offerStatus;
    this.currentPage = 1;
    this.updatePagination();
  }

  get filteredLeads(): Lead[] {
    return this.filterStatus === 'all'
      ? this.leads
     // : this.leads.filter(l => l.status === this.filterStatus);
     : this.leads.filter(l => l.offerStatus === this.filterStatus);
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
    this.quoteAmount = '';
    this.quoteMessage = '';
  }

  handleSendQuote(lead: any) {
    this.selectedLead = lead;
    console.log(lead.isPurchased);
    if (lead.isPurchased) {
      this.quoteAmount = '';
      this.quoteMessage = '';
      this.showSendQuoteModal = true;
    } else {
      this.showPaymentModal = true;
    }
  }








  showConfirmModal = false;

  // Open the confirmation modal
  confirmPurchase() {
    if (!this.selectedLead) return;
    this.showConfirmModal = true;
  }

  // Close the modal
  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  confirmBuyLead() {
    const lead = this.selectedLead;
    if (!lead) return;

    this.sellerService.buyLead(lead.leadId).subscribe({
    //   this.sellerService.buyLead(lead.id).subscribe({
      next: (res: any) => {
        // ✅ Mark as purchased locally
        lead.isPurchased = true;
        lead.leadPrice = `₹${res.pplPrice}`;

        // ✅ ADD THIS LINE
        lead.unlockedCount = (lead.unlockedCount ?? 0) + 1;


        // ✅ Close modal
        this.showPaymentModal = false;
        this.showConfirmModal = false;
        this.showSendQuoteModal = true;
        alert(`Lead purchased successfully for ₹${res.pplPrice}`);
      },

      error: (err) => {
        console.error('Failed to buy lead', err);

        // ✅ Show backend message if available
        const message =
          err?.error?.message ||
          'Failed to purchase lead. Please try again.';

        alert(message);
        this.showConfirmModal = false;
      }
    });
  }




  // confirmBuyLead() {
  //   const lead = this.selectedLead;
  //   if (!lead) return;

  //   this.sellerService.buyLead(lead.id).subscribe({
  //     next: () => {
  //       // Fetch the updated lead from backend without refreshing the page
  //       this.sellerService.getLeadById(lead.id).subscribe({
  //         next: (updatedLead: Lead) => {
  //           // 1️⃣ Update the selectedLead modal
  //           this.selectedLead = updatedLead;

  //           // 2️⃣ Update the lead in the leads list
  //           const index = this.leads.findIndex(l => l.id === lead.id);
  //           if (index > -1) {
  //             this.leads[index] = updatedLead;
  //           }

  //           // 3️⃣ Update the wallet balance
  //           this.totalBalance = updatedLead.totalBalance ?? this.totalBalance;

  //           // 4️⃣ Update dashboard counts if needed
  //           this.refreshDashboardCounts(); 

  //           // 5️⃣ Close payment modal and open send quote modal
  //           this.showPaymentModal = false;
  //           this.showConfirmModal = false;
  //           this.showSendQuoteModal = true;

  //           alert(`Lead purchased successfully for ₹${updatedLead.leadPrice}`);
  //         },
  //         error: (err) => {
  //           console.error('Failed to fetch updated lead', err);
  //           alert('Lead purchased but failed to refresh its details.');
  //           this.showPaymentModal = false;
  //           this.showConfirmModal = false;
  //           this.showSendQuoteModal = true;
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Failed to buy lead', err);
  //       const message = err?.error?.message || 'Failed to purchase lead. Please try again.';
  //       alert(message);
  //       this.showConfirmModal = false;
  //     }
  //   });
  // }


  // refreshDashboardCounts() {
  //   this.sellerService.getDashboardData().subscribe(d => {
  //    this.totalBalance = d.totalBalance ?? 0; // if undefined, assign 0

  //     // this.totalLeads = d.totalLeads ;
  //     // this.totalResponses = d.totalResponses;
  //     // this.acceptedResponses = d.acceptedResponses;
  //     // this.pendingResponses = d.pendingResponses;
  //   });
  // }



  // sendQuote() {
  //   if (!this.selectedLead) return;

  //   const payload = {
  //     leadId: this.selectedLead.leadId,
  //     priceMin: this.quoteAmount,          // bind input
  //     priceMax: this.quoteAmount,          // or different field if needed
  //     notes: this.quoteMessage,
  //     validUntil: null                     // optional
  //   };

  //   this.sellerService.sendQuote(payload).subscribe({
  //     next: () => {
  //       alert('Quote sent successfully');
  //       this.closeSendQuoteModal();
  //     },
  //     error: (err) => {
  //       alert(err?.error?.message || 'Failed to send quote');
  //     }
  //   });
  // }
  isSendingQuote = false;

sendQuote() {
  if (!this.selectedLead) return;

  const message = this.quoteMessage?.trim() || '';
  const amount = Number(this.quoteAmount);

  // ✅ Message validation
  if (message.length < 150 || message.length > 2000) {
    alert('Message must be between 150 and 2000 characters.');
    return;
  }

  // ✅ Amount validation
  if (!amount || amount <= 0) {
    alert('Please enter a valid quote amount.');
    return;
  }

  const payload = {
    leadId: this.selectedLead.leadId,
    priceMin: amount,
    priceMax: amount,
    notes: message,
    validUntil: null
  };

  this.isSendingQuote = true; // add this property

  this.sellerService.sendQuote(payload).subscribe({
    next: () => {
      alert('Quote sent successfully');
      this.closeSendQuoteModal();
      this.quoteAmount = '';
      this.quoteMessage = '';
      this.isSendingQuote = false;
    },
    error: (err) => {
      alert(err?.error?.message || 'Failed to send quote');
      this.isSendingQuote = false;
    }
  });
}

  // Allow only digits and one dot, with proper navigation keys
  allowDecimal(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) return;

    const isNumber = /[0-9]/.test(event.key);
    const isDot = event.key === '.';

    // Prevent multiple dots
    if (isDot && this.quoteAmount.includes('.')) {
      event.preventDefault();
      return;
    }

    if (!isNumber && !isDot) {
      event.preventDefault();
    }

    // Prevent more than 2 digits after dot while typing
    if (this.quoteAmount.includes('.') && isNumber) {
      const decimalPart = this.quoteAmount.split('.')[1] || '';
      const selectionStart = (event.target as HTMLInputElement).selectionStart || 0;
      const cursorAfterDot = selectionStart - this.quoteAmount.indexOf('.') - 1;

      if (cursorAfterDot >= 2) {
        event.preventDefault();
        return;
      }
    }
  }

  // Sanitize input (handles paste, removes letters, limits 2 decimals)
  sanitizeDecimal() {
    if (!this.quoteAmount) return;

    let value = this.quoteAmount
      .replace(/[^0-9.]/g, '')       // remove letters
      .replace(/(\..*)\./g, '$1');   // allow only one dot

    // limit 2 decimals
    if (value.includes('.')) {
      const [whole, decimal] = value.split('.');
      value = whole + '.' + decimal.slice(0, 2);
    }

    this.quoteAmount = value;
  }


}
