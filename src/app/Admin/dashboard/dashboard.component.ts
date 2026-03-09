// // admin/dashboard/dashboard.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HeaderComponent } from '../header/header.component';
// import { SidebarComponent } from '../sidebar/sidebar.component';
// import { FooterComponent } from '../footer/footer.component';
// import { StatsCardsComponent } from '../stats-cards/stats-cards.component';
// import { RecentLeadsComponent } from '../recent-leads/recent-leads.component';
// import { LeadChartComponent } from '../lead-chart/lead-chart.component';
// import { QuickActionsComponent } from '../quick-actions/quick-actions.component';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,  // Add this for standalone component
//   imports: [
//     CommonModule,
//     RouterModule,
//     HeaderComponent,
//     SidebarComponent,
//     FooterComponent,
//     StatsCardsComponent,
//     RecentLeadsComponent,
//     LeadChartComponent,
//     QuickActionsComponent
//   ],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent {
//   // Dashboard logic will go here
// }



import { Component, OnInit } from '@angular/core';

import { RouterModule, Router } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

import { AdminService } from '../admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-dashboard',
    // standalone: true,
    // imports: [
    //   CommonModule,
    //   RouterModule,
    //   HeaderComponent,
    //   FooterComponent,
    //   RouterModule
    // ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,          
        ReactiveFormsModule,   
        RouterModule,           
        HeaderComponent,
        FooterComponent
    ]
})
export class DashboardComponent implements OnInit {

  loading = true;
  error = '';
  welcomeMessage = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard() {
    this.adminService.getAdminDashboard().subscribe({
      next: (res: any) => {
        this.welcomeMessage = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 401 || err.status === 403) {
          // Token invalid OR role not Admin
          this.router.navigate(['/']);
        } else {
          this.error = 'Failed to load dashboard';
        }
      }
    });
  }
}
