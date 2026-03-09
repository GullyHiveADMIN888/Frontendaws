


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SellerService, PublicProfile } from '../seller.service';

@Component({
    selector: 'app-public-profile',
    templateUrl: './public-profile.component.html',
    styleUrls: ['./public-profile.component.css'],
    standalone: false
})


export class PublicProfileComponent implements OnInit {
  profile!: PublicProfile;
  loading = true;
  errorMessage = '';
  sellerId!: number;

  constructor(
    private route: ActivatedRoute,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.sellerId = +id;
        this.loadProfile(this.sellerId);
      } else {
        this.errorMessage = 'Invalid seller ID';
        this.loading = false;
      }
    });
  }

  loadProfile(sellerId: number): void {
    this.loading = true;
    this.sellerService.getPublicProfile(sellerId).subscribe({
      next: (data) => {
        if (data) {
          this.profile = data;
        } else {
          this.errorMessage = 'Profile not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }

  getStars(rating: number) {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}





