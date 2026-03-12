import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

import { SellerService } from '../business.service';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
    selector: 'app-seller-layout',
    imports: [RouterOutlet, RouterModule],
    templateUrl: './business-layout.component.html'
})
export class SellerLayoutComponent implements OnInit {
  showUserMenu = false;
  user: any;
   sellerId!: number;

  constructor(private sellerService: SellerService,
  private router: Router) {
     // ✅ Auto close dropdown on route change
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.showUserMenu = false;
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  
  loadUserData(): void {
    this.sellerService.getDashboardData().subscribe({
      next: dashboard => {
        console.log('Navbar Dashboard data:', dashboard);
        this.user = dashboard;
         this.sellerId = dashboard.sellerId; // ✅ CORRECT FIELD
      },
      error: err => console.error('Failed to load dashboard data', err)
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }


logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('sellerId');
  this.sellerService.clearSession();
  localStorage.clear(); // ✅ safest
  //this.router.navigate(['/login']);
  this.router.navigate(['/']);
}

  // Helper to get initials
get userInitials(): string {
  if (!this.user?.name) return 'S'; // fallback
  const names = this.user.name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
}

 private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}
