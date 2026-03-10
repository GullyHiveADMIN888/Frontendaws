import { Component, Input } from '@angular/core';

import { SellerService, DashboardData } from '../business.service';

@Component({
    selector: 'app-profile-completion',
    templateUrl: './profile-completion.component.html',
    standalone: false
})
export class ProfileCompletionComponent {
  completionPercentage = 75;
  @Input() user: any; 
   sellerId!: number;

     constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.sellerService.getDashboardData().subscribe({
      next: dashboard => {
        console.log('Dashboard data:', dashboard);
        this.user = dashboard;           // full dashboard
        this.sellerId = dashboard.sellerId; // sellerId
      },
      error: err => console.error('Failed to load dashboard data', err)
    });
  }
}
