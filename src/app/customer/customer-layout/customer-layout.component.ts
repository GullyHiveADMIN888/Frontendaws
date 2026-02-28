// src/app/customer/layout/customer-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { UserDataService, UserData } from '../services/user-data.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customer-layout',
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CustomerLayoutComponent implements OnInit {
  showUserMenu = false;
  userData: UserData | null = null;
  customerId: string | null = null;
  loading = true;
  
  // Make profilePicture editable
  profilePicture: string | null = null;
  private assetUrl = environment.assetUrl;

  get userInitials(): string {
    if (this.userData?.displayName) {
      const names = this.userData.displayName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    if (this.userData?.email) {
      return this.userData.email[0].toUpperCase();
    }
    
    if (this.userData?.phone) {
      return this.userData.phone.slice(-2).toUpperCase();
    }
    
    return 'C';
  }

  get displayName(): string {
    return this.userData?.displayName || 
           this.userData?.email?.split('@')[0] || 
           'Customer';
  }

  get email(): string {
    return this.userData?.email || 'No email provided';
  }

  get phone(): string {
    return this.userData?.phone || 'No phone provided';
  }

  get isEmailVerified(): boolean {
    return this.userData?.emailVerified || false;
  }

  get isPhoneVerified(): boolean {
    return this.userData?.phoneVerified || false;
  }

  get accountStatus(): string {
    return this.userData?.status || 'active';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.customerId = localStorage.getItem('customerId') || localStorage.getItem('userId');
  }

  loadUserData() {
    this.loading = true;
    
    // First try to get from storage
    const storedData = this.userDataService.getUserDataFromStorage();
    if (storedData) {
      this.userData = storedData;
      this.profilePicture = storedData.fullProfilePhotoUrl || storedData.profilePhotoUrl;
      this.loading = false;
    }

    // Then fetch fresh data from API
    this.userDataService.getMyData().subscribe({
      next: (data) => {
        if (data) {
          this.userData = data;
          this.profilePicture = data.fullProfilePhotoUrl || data.profilePhotoUrl;
          
          // Log for debugging
          console.log('Profile picture URL:', this.profilePicture);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load user data', error);
        this.loading = false;
        
        // Fallback to localStorage data if API fails
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage() {
    const userData: any = {
      displayName: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      phone: localStorage.getItem('phone'),
      profilePhotoUrl: localStorage.getItem('profilePicture')
    };
    
    if (userData.displayName || userData.email) {
      this.userData = userData as UserData;
      this.profilePicture = userData.profilePhotoUrl;
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.userDataService.clearUserData();
    this.authService.logout();
  }

  refreshUserData() {
    this.userDataService.getMyData().subscribe({
      next: (data) => {
        if (data) {
          this.userData = data;
          this.profilePicture = data.fullProfilePhotoUrl || data.profilePhotoUrl;
        }
      },
      error: (error) => console.error('Failed to refresh user data', error)
    });
  }

  // Method to handle image error
  onImageError() {
    console.log('Image failed to load:', this.profilePicture);
    this.profilePicture = null;
  }

  // Helper method to construct full image URL if needed
  getFullImageUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.assetUrl}${cleanPath}`;
  }
}