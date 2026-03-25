
import { Component, OnInit, Input , Output, EventEmitter } from '@angular/core';
import { SellerService, Lead } from '../business.service';

@Component({
    selector: 'app-leads',
    templateUrl: './leads.component.html',
    styleUrls: ['./leads.component.css'],
    standalone: false
})

export class LeadsComponent implements OnInit {


  leads: Lead[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalPages = 1;
  selectedLead: Lead | null = null;
  showLeadModal = false;
  totalLeadss: number = 0;


  // Send Quote form fields
  quoteAmount: string = '';
  quoteMessage: string = '';

@Output() leadPurchased = new EventEmitter<number>();

  @Input() totalBalance: number = 0;
  constructor(private sellerService: SellerService) { }

 
ngOnInit(): void {
  this.loadLeads(1);
}


  filterStatus: 'all' | 'offered' | 'unlocked' | 'committed' | 'quoted' | 'accepted' | 'rejected' = 'all';

  statuses = [
    { label: 'All', value: 'all' },
    { label: 'New', value: 'offered' },
    { label: 'Unlocked', value: 'unlocked' },
    { label: 'Quoted', value: 'quoted' },
    { label: 'PrePaid', value: 'committed' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' }
  ];

//  loadLeads(page: number = 1) {
//   this.loading = true;
  
//   let request$;
 
//  const quoteStatuses = ['submitted', 'yg', 'ghg'];
    
//     if (quoteStatuses.includes(this.filterStatus)) {
//       // Use quoted API with status parameter
//       request$ = this.sellerService.getQuotedLeads(page, this.pageSize, this.filterStatus);
//     }
//   else {
//     //  For 'all', 'offered', 'unlocked', 'committed'
//     // Pass status parameter (undefined for 'all', otherwise the status)
//     const statusParam = this.filterStatus === 'all' ? undefined : this.filterStatus;
//     request$ = this.sellerService.getLeads(page, this.pageSize, statusParam);
//   }
  
//   request$.subscribe({
//     next: (res) => {
//       console.log('API Response:', res);
//       const leadsData = res.data;
//       const pagination = res.pagination;
      
//       this.currentPage = pagination?.page ?? page;
//       this.totalPages = pagination?.totalPages ?? 1;
//       this.totalLeadss = pagination?.totalCount ?? 0;
//       this.pageSize = pagination?.pageSize ?? this.pageSize;
      
//       this.leads = (leadsData || []).map((l: any) => ({
//         ...l,
//         offerStatus: l.offerStatus ?? 'offered',
//         description: l.description || 'No description provided',
//         location: l.location || 'N/A',
//         time: this.timeAgo(l.createdAt),
//         isPurchased: l.isPurchased ?? false,
//         unlockedCount: Number(l.unlockedCount ?? 0),
//         committedCount: Number(l.committedCount ?? 0),
//         hasQuote: l.hasQuote ?? false,
//       }));
      
//       this.loading = false;
//     },
//     error: (err) => {
//       console.error('Error loading leads:', err);
//       this.loading = false;
//     }
//   });
// }
loadLeads(page: number = 1) {
  this.loading = true;

  let request$;

  // For 'all', 'offered', 'unlocked', 'committed', 'accepted', etc.
  // Pass undefined for 'all', otherwise pass the selected status
  const statusParam = this.filterStatus === 'all' ? undefined : this.filterStatus;

  request$ = this.sellerService.getLeads(page, this.pageSize, statusParam);

  request$.subscribe({
    next: (res) => {
      console.log('API Response:', res);

      const leadsData = res.data;
      const pagination = res.pagination;

      this.currentPage = pagination?.page ?? page;
      this.totalPages = pagination?.totalPages ?? 1;
      this.totalLeadss = pagination?.totalCount ?? 0;
      this.pageSize = pagination?.pageSize ?? this.pageSize;

      this.leads = (leadsData || []).map((l: any) => ({
        ...l,
        offerStatus: l.offerStatus ?? 'offered',
        description: l.description || 'No description provided',
        location: l.location || 'N/A',
        time: this.timeAgo(l.createdAt),
        isPurchased: l.isPurchased ?? false,
        unlockedCount: Number(l.unlockedCount ?? 0),
        committedCount: Number(l.committedCount ?? 0),
        hasQuote: l.hasQuote ?? false,
      }));

      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading leads:', err);
      this.loading = false;
    }
  });
}
  setFilter(offerStatus: any) {
    this.filterStatus = offerStatus;
    this.currentPage = 1;  // Reset to first page
    this.loadLeads(1);      // Fetch new data from backend
  }

  // Pagination methods that call API
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadLeads(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadLeads(this.currentPage - 1);
    }
  }

// Component
goToPage(page: number) {
  if (page !== this.currentPage) {
    this.loadLeads(page);
  }
}

get pages(): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = 5;
  
  if (this.totalPages <= maxVisible) {
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (this.currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(this.totalPages);
    } else if (this.currentPage >= this.totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(this.totalPages);
    }
  }
  
  return pages;
}

  // ✅ Count helpers using API data
  get totalLeads(): number {
    return this.totalLeadss;
  }

  get startIndex(): number {
    if (this.totalLeadss === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalLeadss);
  }

  openQuoteModal(lead: any) {
    if (this.expandedLeadId === lead.leadId) {
      this.expandedLeadId = undefined;
      return;
    }

    this.expandedLeadId = lead.leadId;
    this.loadingAssignments = true;

    this.sellerService.getQuoteAssignments(lead.leadId).subscribe({
      next: (res: any) => {
        lead.quoteDetails = (res.data || []).map((q: any) => ({
          providerName: q.providerName,
          priceMin: q.priceMin,
          priceMax: q.priceMax,
          message: q.notes || 'No message available',
          status: q.status,
          submittedAt: this.formatDate(q.submittedAt)
        }));
        this.loadingAssignments = false;
      },
      error: () => {
        this.loadingAssignments = false;
      }
    });
  }

 
 expandedLeadId?: number
 loadingAssignments: boolean = false;

formatDate(date: string): string {
  const d = new Date(date);

  const day = d.getDate().toString().padStart(2, '0');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

  timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  get filteredLeads(): Lead[] {
  switch (this.filterStatus) {
    case 'quoted':
      return this.leads.filter(l => l.hasQuote);  // only leads with quote
    // case 'accepted':
    //   return this.leads.filter(l => l.isAccepted); // only accepted leads
    case 'all':
      return this.leads;
    default:
      return this.leads.filter(l => l.offerStatus === this.filterStatus);
  }
}

  get paginatedLeads(): Lead[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLeads.length / this.pageSize) || 1;
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

canShowQuoteButton(lead: any): boolean {
  // Hide if status is committed/accepted/rejected or already purchased
  return !['committed', 'not_selected'].includes(lead.offerStatus);
}
// Determine if the Assign button should be visible
canShowAssignButton(lead: any): boolean {
  // Only show if lead is purchased AND status is not committed/accepted/rejected
  return lead.isPurchased && !['unlocked' , 'not_selected'].includes(lead.offerStatus);
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
    next: (res: any) => {

       console.log("BUY LEAD API RESPONSE:", res);   // 👈 ADD THIS


      lead.isPurchased = true;
      lead.leadPrice = `₹${res.pplPrice}`;

      // update values dynamically from backend
      lead.unlockedCount = res.unlockedCount ?? lead.unlockedCount;
      lead.committedCount = res.committedCount ?? lead.committedCount;
      lead.offerStatus = res.offerStatus ?? lead.offerStatus;
        // 🔥 update wallet
  this.totalBalance = res.walletBalance;
console.log( res.walletBalance);
  // send to dashboard
  this.leadPurchased.emit(res.walletBalance);
      // trigger UI refresh
      this.leads = [...this.leads];

      // ✅ IMPORTANT
      this.updatePagination();

      this.showPaymentModal = false;
      this.showConfirmModal = false;
      this.showSendQuoteModal = true;

      alert(`Lead purchased successfully for ₹${res.pplPrice}`);
    },

    error: (err) => {
      console.error('Failed to buy lead', err);

      const message =
        err?.error?.message ||
        'Failed to purchase lead. Please try again.';

      alert(message);
      this.showConfirmModal = false;
    }
  });
}


  
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


  //Lead Assignmnents

showAssignModal = false;
selectedEmployeeId:number | null = null;
employees:any[] = [];
selectedEmployee:any = null;

openAssignModal(lead:any){

this.selectedLead = lead;
this.showAssignModal = true;

this.loadProviderUsers();

}
closeAssignModal(){
  this.showAssignModal = false;

  // reset dropdown selection
  this.selectedEmployeeId = null;

  // reset selected employee details
  this.selectedEmployee = null;

  // reset selected lead
  this.selectedLead = null;

  // optional: clear employee list
  this.employees = [];


}
loadProviderUsers(){
  this.sellerService.getProviderUsers(this.currentPage, this.pageSize).subscribe((res:any)=>{
    console.log("EMPLOYEES:", res);
    this.employees = res;
  })
}
onEmployeeChange(){

  this.selectedEmployee = this.employees.find(
    e => e.id == this.selectedEmployeeId
  );

  console.log("Selected Employee:", this.selectedEmployee);

}
assignJob(){

  if(!this.selectedEmployeeId) return;

  const payload = {
    leadId: this.selectedLead!.leadId,
    employeeId: this.selectedEmployeeId
  }

  this.sellerService.assignJob(payload)
  .subscribe(()=>{

    alert("Job assigned successfully");

    this.closeAssignModal();

  })

}

}
