import { Component, OnInit ,Input} from '@angular/core';
import { SellerService, Lead } from '../seller.service';

@Component({
    selector: 'app-recent-leads',
    templateUrl: './recent-leads.component.html',
    standalone: false
})
export class RecentLeadsComponent implements OnInit {
  leads: Lead[] = [];
  loading = true;
@Input() user: any;


  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadRecentLeads();
  }

  loadRecentLeads() {
    this.sellerService.getLeads().subscribe({
      next: (data) => {
        this.leads = data.map((l: Lead) => ({
          ...l,

          // Map API → UI
          name: l.customerName,
          service: l.serviceName,
          location: l.location,
          budget:
            l.budgetMin && l.budgetMax
              ? `₹${l.budgetMin} - ₹${l.budgetMax}`
              : 'N/A',
          time: this.timeAgo(l.createdAt),
          avatar: this.getAvatar(l.customerName)
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recent leads', err);
        this.loading = false;
      }
    });
  }

  getAvatar(name: string): string {
    if (!name) return 'NA';
    const parts = name.split(' ');
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }

  timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'new':
        return 'bg-orange-100 text-orange-700';
      case 'responded':
        return 'bg-green-100 text-green-700';
      case 'viewed':
        return 'bg-gray-100 text-gray-700';
      default:
        return '';
    }
  }
}


