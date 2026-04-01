// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-employee-details',
//   standalone: true,
//   imports: [],
//   templateUrl: './employee-details.component.html',
//   styleUrl: './employee-details.component.css',
// })
// export class EmployeeDetailsComponent {

// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerService } from '../business.service';
import { EmployeeDetails } from '../models/EmployeeDetails.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css',
})
// export class EmployeeDetailsComponent implements OnInit {

//  employees: EmployeeDetails[] = [];
//   pageNumber = 1;
//   pageSize = 25;
//   totalCount = 0;
//   isLoading = false;

//   constructor(private service: SellerService) {}

//   ngOnInit(): void {
//     this.loadEmployees();
//   }

//   loadEmployees() {
   
//     this.isLoading = true;

//     this.service.getProviderUsers( this.pageNumber, this.pageSize)
//       .subscribe({
//         next: (res) => {
//           this.employees = res.items;
//           this.totalCount = res.totalCount;
//           this.isLoading = false;
//         },
//         error: () => this.isLoading = false
//       });
//   }

//   onPageChange(page: number) {
//     this.pageNumber = page;
//     this.loadEmployees();
//   }

//   get totalPages(): number {
//     return Math.ceil(this.totalCount / this.pageSize);
//   }
//     get pages(): number[] {
//     const pagesToShow = 5;
//     let start = Math.max(this.pageNumber - 2, 1);
//     let end = Math.min(start + pagesToShow - 1, this.totalPages);
//     start = Math.max(end - pagesToShow + 1, 1);
//     return Array.from({ length: end - start + 1 }, (_, i) => start + i);
//   }
// }
export class EmployeeDetailsComponent implements OnInit {

  employees: EmployeeDetails[] = [];
  pageNumber = 1;
  pageSize = 25;
  totalCount = 0;
  isLoading = false;

  // Modal state
  showStatusModal = false;
  showTransferModal = false;
  selectedEmployee: EmployeeDetails | null = null;
  statusDescription = '';
  transferCity = '';
  transferDescription = '';

  constructor(private service: SellerService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this.service.getProviderUsers(this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.employees = res.items;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.loadEmployees();
  }

  // ---------- Status Modal ----------
  openStatusModal(emp: EmployeeDetails) {
    this.selectedEmployee = emp;
    this.statusDescription = '';
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedEmployee = null;
  }

  submitStatusChange() {
    if (!this.selectedEmployee) return;
    // Call your API to change status, pass selectedEmployee.userId & statusDescription
    console.log('Change Status:', this.selectedEmployee.userId, this.statusDescription);

    // Update locally for demo
    this.selectedEmployee.status = this.selectedEmployee.status === 'active' ? 'inactive' : 'active';
    this.closeStatusModal();
  }

  // ---------- Transfer Modal ----------
  openTransferModal(emp: EmployeeDetails) {
    this.selectedEmployee = emp;
    this.transferCity = '';
    this.transferDescription = '';
    this.showTransferModal = true;
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedEmployee = null;
  }

  submitTransfer() {
    if (!this.selectedEmployee) return;
    // Call your API to transfer employee, pass selectedEmployee.userId, transferCity & transferDescription
    console.log('Transfer Employee:', this.selectedEmployee.userId, this.transferCity, this.transferDescription);

    // Optional: Update region locally for demo
    this.selectedEmployee.regionName = this.transferCity;
    this.closeTransferModal();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}