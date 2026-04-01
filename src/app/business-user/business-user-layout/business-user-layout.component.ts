import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

import { BusinessUserService } from '../business-user.service';
import { BusinessUserLayoutService } from './services/business-user-layout.service';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-seller-layout',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './business-user-layout.component.html'
})
export class BusinessUserLayoutComponent implements OnInit {
  showUserMenu = false;
  user: any;
  sellerId!: number;

  constructor(
    private sellerService: BusinessUserService,
    private layoutService: BusinessUserLayoutService,
    private router: Router
  ) {
    // ✅ Auto close dropdown on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showUserMenu = false;
      });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.layoutService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
      },
      error: (err) => {
        console.error('Failed to load ops-manager profile', err);
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('sellerId');
    localStorage.clear(); // ✅ safest
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

