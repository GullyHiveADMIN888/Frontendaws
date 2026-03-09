import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SellerService, Response } from '../seller.service';

@Component({
    selector: 'app-responses',
    templateUrl: './responses.component.html',
    styleUrls: ['./responses.component.css'],
    standalone: false
})
export class ResponsesComponent implements OnInit {
  responses: any[] = [];
  loading = true;
  sellerId!: number;

  constructor(
    private sellerService: SellerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read sellerId from the route
    this.route.paramMap.subscribe(params => {
      const id = params.get('sellerId');
      if (id) {
        this.sellerId = +id; // convert string to number
        this.loadResponses();
      }
    });
  }

  loadResponses() {
    if (!this.sellerId) return;

    this.sellerService.getMyResponses(this.sellerId).subscribe({
      next: res => {
        this.responses = res.data.map((r: Response) => ({
          ...r,
          quote: `₹${r.quoteAmount}`,
          sentDate: this.timeAgo(r.createdAt)
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load responses', err);
        this.loading = false;
      }
    });
  }

  getCount(status: string) {
    return this.responses.filter(r => r.status === status).length;
  }

  timeAgo(date: string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  }
}
