import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SellerService, Referral } from '../seller.service';

@Component({
    selector: 'app-refer-earn',
    templateUrl: './refer-earn.component.html',
    standalone: false
})
export class ReferEarnComponent implements OnInit {
  sellerId!: number;
 // referralCode = 'JOHNDOE2024';
  referralLink = '';
  copied = false;

  referrals: Referral[] = [];
  totalEarnings = 0;
  activeReferrals = 0;
  pendingReferrals = 0;
  referralCode = '';
  constructor(private route: ActivatedRoute, private sellerService: SellerService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('sellerId');
      if (id) {
        this.sellerId = +id;
      //  this.referralLink = `https://gullyhivefrontend-z698.onrender.com/#/join?ref=${this.referrals.referralCode}`;
        this.loadReferralsAndEarnings();
      }
    });
  }

  copyLink() {
    navigator.clipboard.writeText(this.referralLink);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  private loadReferralsAndEarnings() {
    this.sellerService.getReferrals(this.sellerId).subscribe(refs => {
      this.referrals = refs.map(r => {
        // Create initials for avatar
        const initials = r.name
          ? r.name
              .split(' ')
              .map(n => n[0].toUpperCase())
              .join('')
          : `U${r.referred_user_id}`;

        // Ensure amount is numeric
        const amountNum = r.amount ? +r.amount : 0;

        return {
          ...r,
          avatar: initials,
         // joinedDate: r.joinedDate ? new Date(r.joinedDate).toLocaleDateString() : 'N/A',
          amount: amountNum,
          earnings: `$${amountNum}` // formatted for display
        };
      });
// ✅ Set referral code from first record
    if (this.referrals.length > 0 && this.referrals[0].referralCode) {
      this.referralCode = this.referrals[0].referralCode!;
      this.referralLink = `https://gullyhivefrontend-z698.onrender.com/#/join?ref=${this.referralCode}`;
    }

      // Calculate totals
      this.totalEarnings = this.referrals.reduce((sum, r) => sum + (r.amount ?? 0), 0);
      this.activeReferrals = this.referrals.filter(r => r.status === 'approved').length;
      this.pendingReferrals = this.referrals.filter(r => r.status === 'pending').length;
    });
  }
}
