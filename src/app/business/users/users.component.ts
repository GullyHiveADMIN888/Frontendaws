import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SellerService } from '../business.service';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  aadhaar_number:string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],   //  ADD HERE
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
  
})
export class UsersComponent {
alertMessage = '';
alertType: 'success' | 'error' = 'success';

showAlert(message: string, type: 'success' | 'error') {
  this.alertMessage = message;
  this.alertType = type;

  setTimeout(() => {
    this.alertMessage = '';
  }, 3000);
}

users: any[] = [];

ngOnInit() {
  this.loadUsers();
}

loadUsers() {
  this.sellerService.getBusinessUsers().subscribe((res:any) => {
    this.users = res;
  });
}


  showModal = false;

  newUser: User = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    role: '',
    aadhaar_number: ''
  };

searchId!: number;
profile:any = {};
  constructor(private sellerService: SellerService) { }
openModal(){
this.showModal = true;
}

resetForm(){
 this.searchEmail =''
  this.profile = {};
}

closeModal(){
  this.showModal = false;
  this.resetForm();
}

searchEmail: string = '';

// fetchProvider() {
//   if (!this.searchEmail) {
//     alert('Please enter an email');
//     return;
//   }

//   this.sellerService.getProviderProfileByEmail(this.searchEmail)
//     .subscribe(profile => {
//       this.profile = profile;
//     });
// }
// saveUser(){

// const payload = {
//   userId: this.profile.sellerId,
//   role: "member",
//   status: "active"
// };

// this.sellerService.saveBusinessUser(payload)
// .subscribe({

// next:(res:any)=>{

//   if(res.success){
//     alert("User Added Successfully");
//       // RELOAD USERS LIST
//           this.loadUsers();

//           //  Close modal
//           this.closeModal();
//   }
//   else{
//     alert("User already exists");
//   }

// },

// error:(err)=>{
//   console.error(err);
//   alert("Something went wrong");
// }

// });

// }
fetchProvider() {
  if (!this.searchEmail) {
    this.showAlert('Please enter an email', 'error');
    return;
  }

  this.sellerService.getProviderProfileByEmail(this.searchEmail)
    .subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: () => {
        this.showAlert('Provider not found', 'error');
      }
    });
}
saveUser() {

  const payload = {
    userId: this.profile.sellerId,
    role: "member",
    status: "active"
  };

  this.sellerService.saveBusinessUser(payload)
    .subscribe({

      next: (res: any) => {

        if (res.success) {

          this.showAlert("User added successfully", "success");

          this.loadUsers();
          this.closeModal();
        }
        else {
          this.showAlert(res.message || "User already exists", "error");
        }

      },

      error: (err) => {
        console.error(err);
        this.showAlert("Something went wrong", "error");
      }

    });
}
 

  deleteUser(id: number) {

  if (!confirm('Are you sure you want to delete this user?')) return;

  this.sellerService.deleteBusinessUser(id).subscribe({
    next: () => {
      this.users = this.users.filter(u => u.id !== id);
      this.showAlert('User deleted successfully', 'success');
    },
    error: () => {
      this.showAlert('Failed to delete user', 'error');
    }
  });
}
}