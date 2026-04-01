import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OpsManagerJobService, Job } from '../ops-manager-job/services/ops-manager-job.service';

@Component({
  selector: 'app-business-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './business-user-dashboard.component.html',
  styleUrl: './business-user-dashboard.component.css',
})
export class BusinessUserDashboardComponent implements OnInit {

  recentJobs: Job[] = [];
  isLoadingJobs = true;

  constructor(
    private router: Router,
    private jobService: OpsManagerJobService
  ) { }

  actions = [
    {
      title: 'Worker Management',
      icon: 'ri-team-line',
      link: '/provider_User_Ops_Manager/worker-management',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Jobs',
      icon: 'ri-briefcase-line',
      link: '/provider_User_Ops_Manager/jobs',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Profile',
      icon: 'ri-user-line',
      link: '/provider_User_Ops_Manager/profile',
      color: 'bg-green-50 text-green-600'
    }
  ];

  ngOnInit() {
    this.loadRecentJobs();
  }

  loadRecentJobs() {
    this.isLoadingJobs = true;
    this.jobService.getJobs({ page: 1, pageSize: 10, sortBy: 'scheduled_start', sortOrder: 'desc' }).subscribe({
      next: (res) => {
        if (res.success) {
          this.recentJobs = res.data;
        }
        this.isLoadingJobs = false;
      },
      error: () => {
        this.isLoadingJobs = false;
      }
    });
  }

  onAction(action: any) {
    if (action.link) {
      this.router.navigate([action.link]);
    }
  }

  goToJobAssign(jobId: number) {
    this.router.navigate(['/provider_User_Ops_Manager/jobs/assign', jobId]);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-yellow-100 text-yellow-800',
      'customer_not_present': 'bg-orange-100 text-orange-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show',
      'customer_not_present': 'Customer Not Present'
    };
    return statusMap[status] || status;
  }
}
