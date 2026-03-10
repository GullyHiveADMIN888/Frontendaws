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
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],   // ✅ ADD HERE
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
  
})
export class UsersComponent {

  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@gmail.com', phone: '9876543210', role: 'Admin' },
    { id: 2, name: 'Sarah Khan', email: 'sarah@gmail.com', phone: '9123456780', role: 'Manager' }
  ];

  showModal = false;

  newUser: User = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    role: ''
  };

searchId!: number;
businessId: number = 1; // hardcoded
profile:any = {};
  constructor(private sellerService: SellerService) { }
openModal(){
this.showModal = true;
}

closeModal(){
this.showModal = false;
}


fetchProvider() {

  this.sellerService.getPublicProfile(this.searchId)
  .subscribe(profile => {

    this.profile = profile;

  });

}

saveUser(){

const payload = {

businessId: this.businessId,   // logged in business id
userId: this.profile.sellerId,
role: "member",
status: "active"

};

this.sellerService.saveBusinessUser(payload)
.subscribe({

next: (res:any) => {

alert("User Added Successfully");

this.closeModal();

},

error: (err) => {

console.error(err);

}

});

}

  addUser() {
    this.newUser.id = Date.now();
    this.users.push({ ...this.newUser });

    this.newUser = { id: 0, name: '', email: '', phone: '', role: '' };
    this.closeModal();
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }
}