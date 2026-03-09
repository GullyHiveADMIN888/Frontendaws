import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerQuoteService } from './services/customer-quote.service';
import {
  CustomerQuoteDto,
  CustomerQuoteFilterDto,
  CustomerPagedResult,
  CustomerQuoteSummaryDto
} from './models/customer-quote.models';

@Component({
    selector: 'app-customer-quotes',
    templateUrl: './customer-quotes.component.html',
    styleUrls: ['./customer-quotes.component.css'],
    standalone: false
})
export class CustomerQuotesComponent implements OnInit {
  Math = Math;
  searchTerm: string = '';
  
  quotes: CustomerQuoteDto[] = [];
  totalQuotes = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  loading = false;
  
  summary: CustomerQuoteSummaryDto | null = null;
  
  // Filter
  filter: CustomerQuoteFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'submitted_at',
    sortOrder: 'desc',
    searchTerm: '',
    status: '',
    fromDate: null,
    toDate: null
  };

  quickFilter: string = '';
  expandedNotes: Set<number> = new Set<number>();
  
  // Expanded quotes
  expandedQuotes: Set<number> = new Set<number>();

  constructor(
    private quoteService: CustomerQuoteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
    this.loadSummary();
  }

  clearSearch(): void {
  this.searchTerm = '';
  this.loadQuotes();
}

toggleNotes(quote: CustomerQuoteDto): void {
  if (this.expandedNotes.has(quote.id)) {
    this.expandedNotes.delete(quote.id);
  } else {
    this.expandedNotes.add(quote.id);
  }
}

  loadQuotes(): void {
  this.loading = true;
  this.filter.pageNumber = this.currentPage;
  this.filter.searchTerm = this.searchTerm || undefined;
  
  this.quoteService.getUserQuotes(this.filter).subscribe({
    next: (result: CustomerPagedResult<CustomerQuoteDto>) => {
      this.quotes = result.items;
      this.totalQuotes = result.totalCount;
      this.totalPages = result.totalPages;
      this.loading = false;
      console.log('Quotes loaded:', this.quotes);
    },
    error: (err) => {
      console.error('Error loading quotes:', err);
      this.loading = false;
    }
  });
}

  loadSummary(): void {
    this.quoteService.getQuotesSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        console.log('Summary loaded:', this.summary);
      },
      error: (err) => {
        console.error('Error loading summary:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadQuotes();
  }

  setQuickFilter(period: string): void {
    this.quickFilter = period;
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    
    switch(period) {
      case 'today':
        this.filter.fromDate = today;
        this.filter.toDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filter.fromDate = weekStart;
        this.filter.toDate = new Date();
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filter.fromDate = monthStart;
        this.filter.toDate = new Date();
        break;
      default:
        this.filter.fromDate = null;
        this.filter.toDate = null;
    }
    
    this.currentPage = 1;
    this.loadQuotes();
  }

  toggleQuoteExpand(quote: CustomerQuoteDto): void {
    if (this.expandedQuotes.has(quote.id)) {
      this.expandedQuotes.delete(quote.id);
    } else {
      this.expandedQuotes.add(quote.id);
    }
  }

  isQuoteExpanded(quote: CustomerQuoteDto): boolean {
    return this.expandedQuotes.has(quote.id);
  }

  getStatusBadgeClass(quote: CustomerQuoteDto): string {
    switch(quote.status?.toLowerCase()) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'withdrawn':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  isExpiringSoon(quote: CustomerQuoteDto): boolean {
    if (!quote.validUntil || !quote.lead?.scheduledEnd) return false;
    const validUntil = new Date(quote.lead.scheduledEnd);
    const today = new Date();
    const diffDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  getLineItemsSummary(lineItems: any[]): string {
    if (!lineItems || lineItems.length === 0) return 'No line items';
    if (lineItems.length === 1) return lineItems[0].description || '1 item';
    return `${lineItems.length} items`;
  }

  getActiveQuotesCount(): number {
    if (!this.summary) return 0;
    return (this.summary.submittedcount || 0);
  }

  getAveragePrice(): number {
    if (!this.summary) return 0;
    const avg = (this.summary.avgminprice || 0 + this.summary.avgmaxprice || 0) / 2;
    return avg;
  }

  acceptQuote(quote: CustomerQuoteDto): void {
    if (confirm('Are you sure you want to accept this quote?')) {
      this.quoteService.acceptQuote(quote.id).subscribe({
        next: () => {
          this.loadQuotes();
          this.loadSummary();
        },
        error: (err) => {
          console.error('Error accepting quote:', err);
        }
      });
    }
  }

  rejectQuote(quote: CustomerQuoteDto): void {
    if (confirm('Are you sure you want to reject this quote?')) {
      this.quoteService.rejectQuote(quote.id).subscribe({
        next: () => {
          this.loadQuotes();
          this.loadSummary();
        },
        error: (err) => {
          console.error('Error rejecting quote:', err);
        }
      });
    }
  }

  viewLeadDetails(leadId: number): void {
    this.router.navigate(['/customer/leads', leadId]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Handle any global click events if needed
  }
}