import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerService } from '../seller.service';
import { CompanyInvitation } from './models/CompanyInvitation.model';

@Component({
  selector: 'app-company-invitations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './company-invitations.component.html',
  styleUrls: ['./company-invitations.component.css']
})
export class CompanyInvitationsComponent {
  invitations: CompanyInvitation[] = [];
  pageNumber = 1;         
  pageSize = 10;           
  totalCount = 0;  
  isLoading: boolean = false;  
  errorMessage = '';      

  constructor(private service: SellerService) {}

  ngOnInit() {
    this.loadInvitations();
  }

// loadInvitations() {
//   this.isLoading = true;        // start loader
//   this.errorMessage = '';        // clear previous errors

//   this.service.getInvitations(this.pageNumber, this.pageSize).subscribe({
//     next: (res) => {
//       this.invitations = res.items;
//       this.totalCount = res.totalCount;
//       this.isLoading = false;    // stop loader
//     },
//     error: (err) => {
//       console.error('Error loading invitations:', err);
//       this.errorMessage = 'Failed to load invitations. Please try again.';
//       this.isLoading = false;    // stop loader even on error
//       this.invitations = [];     // clear table if error
//     }
//   });
// }
  // Pagination helpers
  loadInvitations() {
  this.isLoading = true;        // start loader
  this.errorMessage = '';       // clear previous errors

  this.service.getInvitations(this.pageNumber, this.pageSize).subscribe({
    next: (res) => {
      // Map each invitation to add a showDetails flag for collapse/expand
      this.invitations = res.items.map((invite: CompanyInvitation) => ({
  ...invite,
  showDetails: false
}));
      
      this.totalCount = res.totalCount;
      this.isLoading = false;  // stop loader
    },
    error: (err) => {
      console.error('Error loading invitations:', err);
      this.errorMessage = 'Failed to load invitations. Please try again.';
      this.invitations = [];    // clear table if error
      this.isLoading = false;   // stop loader even on error
    }
  });
}
  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadInvitations();
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadInvitations();
    }
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadInvitations();
    }
  }

get totalPages(): number {
  return Math.ceil(this.totalCount / this.pageSize);
}

selectedInvite: any = null;
modalAction: 'approve' | 'reject' = 'approve';
showModal = false;

openModal(invite: CompanyInvitation, action: 'approve' | 'reject') {
  this.selectedInvite = invite;
  this.modalAction = action;
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
  this.selectedInvite = null;
}

confirmAction() {
  if (!this.selectedInvite) return;

  // Call service to approve/reject
  // this.service.handleInvitation(this.selectedInvite.id, this.modalAction).subscribe({
  //   next: () => {
  //     this.loadInvitations(); // refresh data
  //     this.closeModal();
  //   },
  //   error: (err) => {
  //     console.error(err);
  //     this.closeModal();
  //   }
  // });
}


}