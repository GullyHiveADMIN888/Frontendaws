import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SellerService, PublicProfile } from '../seller.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

@Component({
    selector: 'app-sharable-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sharable-profile.component.html'
})
export class SharableProfileComponent implements OnInit {

  profile!: PublicProfile;
  loading = true;
  errorMessage = '';
  sellerId!: number;

  shareUrl = '';
  apiUrl = environment.apiBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.sellerId = +id;
        // this.shareUrl = `${this.apiUrl}/seller/sharableeProfile/${this.sellerId}`;
        this.shareUrl = `https://gullyhivefrontend-z698.onrender.com/#/SharableSeller/sharableProfile/${this.sellerId}`;
        this.loadProfile(this.sellerId);
      } else {
        this.errorMessage = 'Invalid seller ID';
        this.loading = false;
      }
    });
  }

  loadProfile(sellerId: number): void {
    this.sellerService.sharableProfile(sellerId).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Profile not found';
        this.loading = false;
      }
    });
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.shareUrl);
    alert('Profile link copied!');
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }

  getStars(rating: number) {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}
