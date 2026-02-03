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
  isEditMode=false;


  showBankDetailsModal = false;

bankDetails = {
    id: null as number | null,   // bank record id (for edit)
  sellerId: null as number | null,
  bankName: '',
  accountNumber: '',
  ifsc: '',
  address: ''
};
errors: any = {};


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
          },
          { 
            icon: 'ri-tools-line', 
            title: 'Services & Pricingssss', 
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
          { icon: 'ri-shield-check-line', title: 'Privacy Settings', description: 'Control your privacy and data preferences', link: ['/seller/settings/privacy'] },
          { 
            icon: 'ri-tools-line', 
            title: 'Bank Account Management', 
            description: 'Edit services you offer and pricing', 
            link: ['/seller/settings/services'] 
          }
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

// onSettingClick(item: SettingItem) {
//   if (item.title === 'Password & Security') {
//     this.openChangePassword();   // 🔐 popup
//   } 
//   if (item.title === 'Services & Pricingssss') {
//   this.openAddBankDetails();
// }
//   else {
//     this.navigateTo(item.link);  // ➡️ normal navigation
//   }
// }
onSettingClick(item: SettingItem) {
  if (item.title === 'Password & Security') {
    this.openChangePassword(); // 🔐 open modal
  } 
  else if (item.title === 'Bank Account Management') {
    this.openAddBankDetails(); // 🏦 open bank modal
  } 
  else {
    this.navigateTo(item.link); // ➡️ normal navigation
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



openAddBankDetails() {
  if (!this.sellerId) {
    alert('User not logged in');
    return;
  }

  this.sellerService.getBankDetails(this.sellerId).subscribe({
    next: (res: any) => {
      const data = res?.data;

      if (data) {
        // ✅ EDIT MODE
        this.bankDetails = {
          id: data.id,
          sellerId: this.sellerId,
          bankName: data.bankAccountName,
          accountNumber: data.bankAccountNumber,
          ifsc: data.bankIfsc,
          address: data.bankAddress
        };
        this.isEditMode = true;
      } else {
        // ✅ INSERT MODE
        this.resetBankForm();
        this.isEditMode = false;
      }

      this.errors = {};
      this.showBankDetailsModal = true;
    },
    error: () => {
      alert('Failed to fetch bank details');
    }
  });
}

openEditBankDetails(existingData: any) {
  this.bankDetails = {
    id: existingData.id,
    sellerId: this.sellerId, // ✅ always bind sellerId
    bankName: existingData.bankName,
    accountNumber: existingData.accountNumber,
    ifsc: existingData.ifsc,
    address: existingData.address
  };

  this.errors = {};
  this.showBankDetailsModal = true;
}

// Submit function
saveBankDetails() {
  this.errors = {};

  if (!this.bankDetails.bankName) {
    this.errors.bankName = 'Bank Name is required';
  }
  if (!this.bankDetails.accountNumber) {
    this.errors.accountNumber = 'Account Number is required';
  }
  if (!this.bankDetails.ifsc) {
    this.errors.ifsc = 'IFSC Code is required';
  }

  if (Object.keys(this.errors).length > 0) return;

  const payload = {
    id: this.bankDetails.id,         // null → insert, value → update
    sellerId: this.sellerId,         // ✅ always from logged user
    bankAccountName: this.bankDetails.bankName,
    bankAccountNumber: this.bankDetails.accountNumber,
    bankIfsc: this.bankDetails.ifsc,
    bankAddress: this.bankDetails.address
  };

  this.sellerService.saveBankDetails(payload).subscribe({
    next: () => {
      alert(this.isEditMode ? 'Updated successfully' : 'Saved successfully');
      this.closeBankDetailsModal();
    },
    error: (err) => {
      alert(err?.error?.message || 'Failed to save');
    }
  });
}

deleteBankDetails() {
  this.sellerService.deleteBankDetails(this.sellerId).subscribe({
    next: () => {
      alert('Bank details deleted successfully');

      // reset form + close modal
      this.bankDetails = {
     id: null,
    sellerId: null,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    address: ''
  };
      this.errors = {};
      this.showBankDetailsModal = false;
    },
    error: (err) => {
      alert(err?.error?.message || 'Failed to delete bank details');
    }
  });
}

confirmDeleteBankDetails() {
  const confirmed = confirm(
    'Are you sure you want to delete your bank details? This action cannot be undone.'
  );

  if (!confirmed) return;

  this.deleteBankDetails();
}

// Remove error dynamically when user types
clearError(field: string) {
  if (this.errors[field]) {
    delete this.errors[field];
  }
}

// Close modal and reset form + errors

closeBankDetailsModal() {
  // Reset the form fields
  this.bankDetails = {
     id: null,
    sellerId: null,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    address: ''
  };
 this.errors = {};
  // Close the modal
  this.showBankDetailsModal = false;
}
resetBankForm() {
  this.bankDetails = {
    id: null,
    sellerId: this.sellerId,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    address: ''
  };
}


}
