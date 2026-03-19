
import { Component, OnInit, Input , Output, EventEmitter } from '@angular/core';
import { SellerService, Lead } from '../business.service';

@Component({
    selector: 'app-leads',
    templateUrl: './leads.component.html',
    styleUrls: ['./leads.component.css'],
    standalone: false
})

export class LeadsComponent implements OnInit {

 filterStatus: 'all' | 'offered' | 'unlocked' | 'quated' | 'accepted' | 'committed' = 'all';
 statuses = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'offered' },
  { label: 'Unlocked', value: 'unlocked' },
  { label: 'Confirmed', value: 'committed' },
  { label: 'Quated', value: 'quated' },
  { label: 'Accepted', value: 'accepted' }
];
  leads: Lead[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;
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
 
//   loadLeads(page: number = 1) {
//   this.loading = true;

//   this.sellerService.getLeads(page, this.pageSize).subscribe({
//     next: (res) => {

//       const leadsData = res.data;
//       const pagination = res.pagination;

//       this.currentPage = pagination.page;
//       this.totalPages = pagination.totalPages;
//       this.totalLeadss = pagination.totalCount;

//       this.leads = leadsData.map((l: any) => {
//         const isScheduled = l.timePreference === 'scheduled';

//         return {
//           ...l,
//           offerStatus: l.offerStatus ?? 'offered',
//           description: l.description || 'No description provided',
//           location: l.location || 'N/A',
//           time: this.timeAgo(l.createdAt),
//           isPurchased: l.isPurchased ?? false,
//           unlockedCount: Number(l.unlockedCount ?? 0),
//           committedCount: Number(l.committedCount ?? 0)
//         };
//       });

//       this.loading = false;
//     },
//     error: (err) => {
//       console.error(err);
//       this.loading = false;
//     }
//   });
// }
loadLeads(page: number = 1) {
  this.loading = true;

  let request$;

  // Call different API based on filter
  if (this.filterStatus === 'quated') {
    request$ = this.sellerService.getQuotedLeads(page, this.pageSize);
  } else if (this.filterStatus === 'accepted') {
    request$ = this.sellerService.getAcceptedLeads(page, this.pageSize);
  } else {
    // default/all/offered/unlocked/committed
    request$ = this.sellerService.getLeads(page, this.pageSize);
  }

  request$.subscribe({
    next: (res) => {
      console.log(res.data);
      const leadsData = res.data;
      const pagination = res.pagination;

      this.currentPage = pagination.page;
      this.totalPages = pagination.totalPages;
      this.totalLeadss = pagination.totalCount;

      this.leads = leadsData.map((l: any) => {
        const isScheduled = l.timePreference === 'scheduled';
        return {
          ...l,
          offerStatus: l.offerStatus ?? 'offered',
          description: l.description || 'No description provided',
          location: l.location || 'N/A',
          time: this.timeAgo(l.createdAt),
          isPurchased: l.isPurchased ?? false,
          unlockedCount: Number(l.unlockedCount ?? 0),
          committedCount: Number(l.committedCount ?? 0),
           hasQuote: l.hasQuote ?? false,   
        };
      });

      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
    }
  });
}
// setFilter(offerStatus: any) {
//   this.filterStatus = offerStatus;
//   this.currentPage = 1;

//   // Load leads based on selected filter
//   this.loadLeads(this.currentPage);

//   // Automatically open modal for Quated or Accepted
//   if (offerStatus === 'quated' || offerStatus === 'accepted') {
//     // Wait for the leads to be loaded first
//     const checkLeadsLoaded = setInterval(() => {
//       if (!this.loading && this.leads.length > 0) {
//         clearInterval(checkLeadsLoaded);

//         const firstLead = this.leads[0]; // pick the first lead
//         if (firstLead) {
//           if (offerStatus === 'quated') {
//             this.openQuotedModal(firstLead);
//           } else if (offerStatus === 'accepted') {
//             this.openAcceptedModal(firstLead);
//           }
//         }
//       }
//     }, 100); // check every 100ms
//   }
// }
  setFilter(offerStatus: any)
   {
  //  this.filterStatus = status;
    this.filterStatus = offerStatus;
    this.currentPage = 1;
    this.updatePagination();
  }
expandedLeadId?: number
  openQuoteModal(lead: any) {
  this.closeLeadModal(); // optional but recommended

  // this.selectedQuoteLead = lead;
  // this.showQuoteModal = true;

  // this.loadingAssignments = true;

  // this.sellerService.getQuoteAssignments(lead.leadId).subscribe({
  //   next: (res: any) => {
  //     this.assignments = res.data || [];
  //     this.loadingAssignments = false;
  //   },
  //   error: () => {
  //     this.loadingAssignments = false;
  //   }
  // });
}
// expandedLeadId: number | null = null;

// openQuoteModal(lead: any) {
//   // Toggle open/close
//   if (this.expandedLeadId === lead.leadId) {
//     this.expandedLeadId = null;
//     return;
//   }

//   this.expandedLeadId = lead.leadId;

//   // Dummy data
//   lead.quoteDetails = [
//     {
//       providerName: 'ABC Services',
//       price: 2500,
//       message: 'We can complete this in 2 days'
//     },
//     {
//       providerName: 'XYZ Solutions',
//       price: 2200,
//       message: 'Best quality guaranteed'
//     }
//   ];
// }
  timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  
 
  // get filteredLeads(): Lead[] {
  //   return this.filterStatus === 'all'
  //     ? this.leads
  //    // : this.leads.filter(l => l.status === this.filterStatus);
  //    : this.leads.filter(l => l.offerStatus === this.filterStatus);
  // }
  get filteredLeads(): Lead[] {
  switch (this.filterStatus) {
    case 'quated':
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

 
nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadLeads(this.currentPage);
  }
}
  // prevPage() {
  //   if (this.currentPage > 1) this.currentPage--;
  // }
  prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadLeads(this.currentPage);
  }
}

  goToPage(page: number) {
  this.currentPage = page;
  this.loadLeads(page);
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

this.loadEmployees();

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
loadEmployees(){
  this.sellerService.getBusinessUsers().subscribe((res:any)=>{
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
assignLead(){

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
