import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { HttpClientModule } from '@angular/common/http'; 
import { CompanyJob } from './models/company.model';
import { SellerService } from '../seller.service';

@Component({
  selector: 'app-company-job',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  // ✅ add CommonModule here
  templateUrl: './company-job.component.html',
  styleUrls: ['./company-job.component.css']
})
export class CompanyJobComponent implements OnInit {
  companyJobs: CompanyJob[] = [];
  pageNumber: number = 1;
  pageSize: number = 25;
  totalCount: number = 0;
  isLoading: boolean = false;

  constructor(private jobService: SellerService) {}

  ngOnInit(): void {
    this.loadCompanyJobs();
  }

 loadCompanyJobs(page: number = 1) {
    this.isLoading = true;
    this.jobService.getCompanyJobs(page, this.pageSize).subscribe({
      next: res => {
        if (res.success) {
          this.companyJobs = res.data.map(job => ({
            ...job,
            showDetails: false // Initialize toggle
          }));
          this.pageNumber = res.pageNumber;
          this.totalCount = res.totalCount;
        }
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > Math.ceil(this.totalCount / this.pageSize)) return;
    this.loadCompanyJobs(newPage);
  }

  completeJob(job: CompanyJob) {
    // call backend API to mark job as completed
    console.log('Complete job', job.id);
    job.status = 'completed';
  }
  get totalPages(): number {
  return Math.ceil(this.totalCount / this.pageSize);
}
}