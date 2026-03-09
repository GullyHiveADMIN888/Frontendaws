import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,          
        ReactiveFormsModule,   
        RouterModule
    ]
})
export class HeaderComponent {
  showDropdown: boolean = false;
  adminName: string = 'Admin';

  constructor(private router: Router) {}

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  goToDashboard(): void {
    this.closeDropdown();
    this.router.navigate(['/admin/dashboard']);
  }

  goToProfile(): void {
    this.closeDropdown();
    // Navigate to profile page when created
    // this.router.navigate(['/admin/profile']);
    alert('Profile page coming soon!');
  }

  goToSettings(): void {
    this.closeDropdown();
    // Navigate to settings page when created
    // this.router.navigate(['/admin/settings']);
    alert('Settings page coming soon!');
  }

  goToChangePassword(): void {
  this.router.navigate(['/admin/change-password']);
  this.showDropdown = false; // Close the dropdown
}

  logout(): void {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // localStorage.removeItem('userData');
    
    // Clear any other authentication related data
    sessionStorage.clear();
    
    this.closeDropdown();
    
    // Redirect to login page or home page
    this.router.navigate(['/']);
    
    // Optional: Reload the page to clear any state
    window.location.reload();
  }
}