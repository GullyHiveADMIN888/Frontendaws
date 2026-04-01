import { Component, Input, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-stats-cards',
    templateUrl: './stats-cards.component.html',
    standalone: false
})
export class StatsCardsComponent implements OnChanges {
  @Input() totalLeads = 0;
  @Input() totalResponses = 0;
  @Input() acceptedResponses = 0;
  @Input() pendingResponses = 0;

  stats: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}
@Input() totalBalance: number = 0;       // total wallet balance
@Input() cashableBalance: number = 0;    // optional
@Input() nonCashableBalance: number = 0; // optional
  ngOnChanges() {
    this.stats = [
      {
        label: 'New Leads',
        value: this.totalLeads,
        change: '+3 today',
        icon: 'ri-mail-line',
        color: 'bg-orange-50 text-orange-600',
        trend: 'up'
      },
      {
        label: 'Active Responses',
        value: this.totalResponses,
        change: `${this.pendingResponses} pending`,
        icon: 'ri-chat-3-line',
        color: 'bg-green-50 text-green-600',
        trend: 'up'
      },
      {
        label: 'Accepted Responses',
        value: this.acceptedResponses,
        change: '',
        icon: 'ri-check-line',
        color: 'bg-teal-50 text-teal-600',
        trend: 'up'
      },
      {
        label: 'Response Rate',
        value: this.totalResponses > 0
          ? `${Math.round((this.acceptedResponses / this.totalResponses) * 100)}%`
          : '0%',
        change: 'Excellent',
        icon: 'ri-line-chart-line',
        color: 'bg-indigo-50 text-indigo-600',
        trend: 'up'
      },
      {
        label: 'Wallet Balance',
        value: `₹${this.totalBalance.toLocaleString()}`, 
        change: 'Available Balance',
        icon: 'ri-wallet-3-line',
        color: 'bg-yellow-50 text-yellow-600',
        trend: 'up',
        route: 'ledger'  // relative route
      }
    ];
  }

  onCardClick(stat: any) {
    if (stat.route) {
      this.router.navigate([stat.route], { relativeTo: this.route });
    }
  }

//   onCardClick(stat: any) {
//   if (stat.route) {
//     const sellerId = Number(localStorage.getItem('sellerId')) || 0; // get sellerId
//         console.log('Seller ID from localStorage:', sellerId);
//     this.router.navigate([stat.route, sellerId], { relativeTo: this.route });
//   }
// }

}
