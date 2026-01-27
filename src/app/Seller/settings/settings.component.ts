import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SellerService } from '../seller.service';

interface SettingItem {
  icon: string;
  title: string;
  description: string;
  link: string | any[];
}

interface SettingCategory {
  title: string;
  items: SettingItem[];
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  childRouteActive = false;
  sellerId!: number;
  settingsCategories: SettingCategory[] = []; // ✅ component property

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sellerService: SellerService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.childRouteActive = !!this.route.firstChild;
    });
  }

  showCurrent = false;
  showNew = false;
  showConfirm = false;
  passwordMismatch = false;
  sameAsCurrent = false;

  // ngOnInit(): void {
  //   // Subscribe to sellerId from SellerService
  //   this.sellerService.sellerId$.subscribe(id => {
  //     if (id) {
  //       this.sellerId = id;
  //       this.buildSettingsMenu(); // build menu after sellerId is available
  //     }
  //   });
  // }


ngOnInit(): void {
  this.sellerService.sellerId$.subscribe(id => {
    if (id) {
      this.sellerId = id;
      this.buildSettingsMenu();
    }
  });
}


  buildSettingsMenu() {
    this.settingsCategories = [ // ✅ assign to component property
      {
        title: 'Profile Settings',
        items: [
          { 
            icon: 'ri-user-line', 
            title: 'My Profile', 
            description: 'Update your personal information and profile picture',  
            link: ['/seller/completeProfile', this.sellerId] // ✅ array for routerLink
          },
          { 
            icon: 'ri-briefcase-line', 
            title: 'Business Details', 
            description: 'Manage your business information and credentials', 
            link: ['/seller/settings/business'] 
          },
          { 
            icon: 'ri-tools-line', 
            title: 'Services & Pricing', 
            description: 'Edit services you offer and pricing', 
            link: ['/seller/settings/services'] 
          }
        ]
      },
      {
        title: 'Availability & Notifications',
        items: [
          { icon: 'ri-calendar-line', title: 'Availability', description: 'Set your working hours and schedule', link: ['/seller/settings/availability'] },
          { icon: 'ri-notification-line', title: 'Notifications', description: 'Manage email and push notifications', link: ['/seller/settings/notifications'] }
        ]
      },
      {
        title: 'Account & Security',
        items: [
          { icon: 'ri-lock-line', title: 'Password & Security', description: 'Change password and security settings', link: ['/seller/settings/security'] },
          { icon: 'ri-bank-card-line', title: 'Payment Methods', description: 'Manage your payment and billing information', link: ['/seller/settings/payment'] },
          { icon: 'ri-shield-check-line', title: 'Privacy Settings', description: 'Control your privacy and data preferences', link: ['/seller/settings/privacy'] }
        ]
      }
    ];
  }

  navigateTo(link: string | any[]) {
    if (Array.isArray(link)) {
      this.router.navigate(link);
    } else {
      this.router.navigateByUrl(link);
    }
  }




  showChangePasswordModal = false;

passwordData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

openChangePassword() {
  this.showChangePasswordModal = true;
}

closeChangePassword() {
  this.showChangePasswordModal = false;
  this.passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}

// changePassword() {
//    this.validatePasswords();
//   if (this.passwordMismatch || this.sameAsCurrent) {
//     alert('Passwords do not match');
//     return;
//   }

//   // 🔥 Call API here
//   this.sellerService.changePassword(this.passwordData).subscribe({
//     next: () => {
//       alert('Password updated successfully');
//       this.closeChangePassword();
//     },
//     error: () => {
//       alert('Failed to update password');
//     }
//   });
// }
changePassword() {
  this.validatePasswords();

  if (this.passwordMismatch || this.sameAsCurrent) {
    return;
  }

  if (!this.sellerId) {
    alert('Seller not logged in');
    return;
  }

  const payload = {
    // currentPassword: this.passwordData.currentPassword,
    // newPassword: this.passwordData.newPassword
    oldPassword: this.passwordData.currentPassword, // ✅ map correctly
    newPassword: this.passwordData.newPassword
  };

  this.sellerService
    .changePassword(this.sellerId, payload)
    .subscribe({
      next: () => {
        alert('Password updated successfully');
        this.closeChangePassword();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to update password');
      }
    });
}

onSettingClick(item: SettingItem) {
  if (item.title === 'Password & Security') {
    this.openChangePassword();   // 🔐 popup
  } else {
    this.navigateTo(item.link);  // ➡️ normal navigation
  }
}
validatePasswords() {
  const { currentPassword, newPassword, confirmPassword } = this.passwordData;

  this.passwordMismatch =
    !!newPassword &&
    !!confirmPassword &&
    newPassword !== confirmPassword;

  this.sameAsCurrent =
    !!currentPassword &&
    !!newPassword &&
    currentPassword === newPassword;
}

}
