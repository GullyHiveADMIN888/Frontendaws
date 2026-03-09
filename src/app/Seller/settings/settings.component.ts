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
    styleUrls: ['./settings.component.css'],
    standalone: false
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
     // this.showUserMenu = false;
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
          // { 
          //   icon: 'ri-briefcase-line', 
          //   title: 'Business Details', 
          //   description: 'Manage your business information and credentials', 
          //   link: ['/seller/settings/business'] 
          // },
          { 
            icon: 'ri-lock-line', 
            title: 'Legal Identity Address Proof', 
            description: 'Manage your business information and credentials', 
            link: ['/seller/leagelIdentity/business', this.sellerId] 
          }
          // { 
          //   icon: 'ri-tools-line', 
          //   title: 'Services & Pricing', 
          //   description: 'Edit services you offer and pricing', 
          //   link: ['/seller/settings/services'] 
          // },
          // { 
          //   icon: 'ri-tools-line', 
          //   title: 'Services & Pricingssss', 
          //   description: 'Edit services you offer and pricing', 
          //   link: ['/seller/settings/services'] 
          // }
        ]
      },
      // {
      //   title: 'Availability & Notifications',
      //   items: [
      //     { icon: 'ri-calendar-line', title: 'Availability', description: 'Set your working hours and schedule', link: ['/seller/settings/availability'] },
      //     { icon: 'ri-notification-line', title: 'Notifications', description: 'Manage email and push notifications', link: ['/seller/settings/notifications'] }
      //   ]
      // },
      {
        title: 'Account & Security',
        items: [
          { icon: 'ri-lock-line', title: 'Password & Security', description: 'Change password and security settings', link: ['/seller/settings/security'] },
           { 
            icon: 'ri-tools-line', 
            title: 'Bank Account Management', 
            description: 'Edit services you offer and pricing', 
            link: ['/seller/settings/services'] 
          }
          // { icon: 'ri-bank-card-line', title: 'Payment Methods', description: 'Manage your payment and billing information', link: ['/seller/settings/payment'] },
          // { icon: 'ri-shield-check-line', title: 'Privacy Settings', description: 'Control your privacy and data preferences', link: ['/seller/settings/privacy'] }
         
        ]
      }
    ];
  }

  // navigateTo(link: string | any[]) {
  //   if (Array.isArray(link)) {
  //     this.router.navigate(link);
  //   } else {
  //     this.router.navigateByUrl(link);
  //   }
  // }
navigateTo(link: string | any[]) {

  const urlTree = Array.isArray(link)
    ? this.router.createUrlTree(link)
    : this.router.parseUrl(link);

  const canMatch = this.router.serializeUrl(urlTree);

  const match = this.router.config.some(route =>
    canMatch.startsWith('/' + (route.path ?? ''))
  );

  if (match) {
    this.router.navigateByUrl(urlTree);
  } else {
    console.warn('Route does not exist. Staying on same page.');
  }
}



  showChangePasswordModal = false;

passwordData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

currentPasswordRequired = false;
passwordErrorMessage = '';
weakPassword = false;

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
    oldPassword: this.passwordData.currentPassword, 
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
        alert(err?.error?.message || 'Old Password is Wrong, Failed to update password');
      }
    });
}


onSettingClick(item: SettingItem) {
  if (item.title === 'Password & Security') {
    this.openChangePassword(); // 🔐 open modal
  } 
  else if (item.title === 'Bank Account Management') {
    this.openAddBankDetails(); // 🏦 open bank modal
  } 
  else if (item.title === 'Legal Identity Address Proof') {
  this.openLegalIdentityModal();
}
  else {
    this.navigateTo(item.link); // ➡️ normal navigation
  }
}


validatePasswords() {

  const { currentPassword, newPassword, confirmPassword } = this.passwordData;

  // Reset all errors
  this.passwordMismatch = false;
  this.sameAsCurrent = false;
  this.weakPassword = false;
  this.passwordErrorMessage = '';
  this.currentPasswordRequired = false;

  // 🔴 Current Password Required
  if (!currentPassword?.trim()) {
    this.currentPasswordRequired = true;
  }

  // 🔴 New Password Required
  if (!newPassword?.trim()) {
    this.weakPassword = true;
    this.passwordErrorMessage = 'New password is required';
    return;
  }

  // 🔐 Strong Password Regex
  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  if (!strongPasswordRegex.test(newPassword)) {
    this.weakPassword = true;
    this.passwordErrorMessage =
      'Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character';
  }

  // ❌ New must not equal current
  if (currentPassword && newPassword === currentPassword) {
    this.sameAsCurrent = true;
  }

  // ❌ Confirm must match
  if (confirmPassword && newPassword !== confirmPassword) {
    this.passwordMismatch = true;
  }
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

saveBankDetails() {
  this.errors = {};

  const bankName = this.bankDetails.bankName?.trim();
  const accountNumber = this.bankDetails.accountNumber?.trim();
  const ifsc = this.bankDetails.ifsc?.trim();

  // ✅ Bank Name
  if (!bankName) {
    this.errors.bankName = 'Bank Name is required';
  } 
  else if (bankName.length < 3) {
    this.errors.bankName = 'Bank Name must be at least 3 characters';
  }
  else if (!/^[A-Za-z\s]+$/.test(bankName)) {
    this.errors.bankName = 'Bank Name should contain only letters';
  }

  // ✅ Account Number
  if (!accountNumber) {
    this.errors.accountNumber = 'Account Number is required';
  }
  else if (!/^\d{9,18}$/.test(accountNumber)) {
    this.errors.accountNumber = 'Account Number must be 9 to 18 digits';
  }

  // ✅ IFSC Validation (Indian format)
  if (!ifsc) {
    this.errors.ifsc = 'IFSC Code is required';
  }
  else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    this.errors.ifsc = 'Invalid IFSC Code format';
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
onBankNameInput(event: Event) {
  const keyboardEvent = event as KeyboardEvent;

  // Allow A-Z, a-z, Hindi characters and basic editing keys
  const regex = /^[a-zA-Z\u0900-\u097F\s]$/;
  if (!regex.test(keyboardEvent.key) &&
      !['Backspace','Tab','ArrowLeft','ArrowRight','Delete'].includes(keyboardEvent.key)) {
    keyboardEvent.preventDefault();
  }
}

onAccountNumberInput(event: Event) {
  const keyboardEvent = event as KeyboardEvent;

  // Only numbers allowed
  if (!/^[0-9]$/.test(keyboardEvent.key) &&
      !['Backspace','Tab','ArrowLeft','ArrowRight','Delete'].includes(keyboardEvent.key)) {
    keyboardEvent.preventDefault();
  }
}


onIfscInput(event: Event) {
  const keyboardEvent = event as KeyboardEvent;

  // Only uppercase letters and numbers
  if (!/^[A-Z0-9]$/.test(keyboardEvent.key) &&
      !['Backspace','Tab','ArrowLeft','ArrowRight','Delete'].includes(keyboardEvent.key)) {
    keyboardEvent.preventDefault();
  }
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


legalIdentityData = {
  registrationType: '',
  registrationNumber: '',
  registrationDocumentFile: null as File | null, // ✅ actual File
  addressProofFile: null as File | null,        // ✅ actual File
  registrationDocumentUrl: '',                  // ✅ existing document URL
  addressProofUrl: '',
  registrationDocument: null as File | null,
  addressProof:null as File | null,
};
//...For Edit Identity
showLegalIdentityModal = false;

registrationTypes = [
  'GST Registration',
  'Aadhar Card',
  'E-Shram Card',
  'PAN Card',
  'Udyam Registration'
];
registrationFieldMap: any = {
  'PAN Card': 'pan',
  'GST Registration': 'gstin',
  'Udyam Registration': 'udyam_number',
  'Aadhar Card': 'aadhaar_number',
  'E-Shram Card': 'eshram_number'
};

openLegalIdentityModal() {
  this.sellerService.getLegalIdentity(this.sellerId)
    .subscribe((res: any) => {

      const provider = res.provider;
      const documents = res.documents;

      // 🔹 Dynamic detection using mapping
      Object.entries(this.registrationFieldMap).forEach(([type, field]) => {
        const key = field as keyof typeof provider; // ✅ cast to keyof provider
        if (provider[key]) {
          this.legalIdentityData.registrationType = type;
          this.legalIdentityData.registrationNumber = provider[key];
        }
      });

      // 🔹 Set document URLs
      documents.forEach((doc: any) => {
        if (doc.doc_type === 'registration')
          this.legalIdentityData.registrationDocumentUrl = doc.file_url;

        if (doc.doc_type === 'address_proof')
          this.legalIdentityData.addressProofUrl = doc.file_url;
      });

      this.showLegalIdentityModal = true;
    });
}
// updateLegalIdentity() {
//   const formData = new FormData();

//   formData.append('RegistrationType', this.legalIdentityData.registrationType);
//   formData.append('RegistrationNumber', this.legalIdentityData.registrationNumber);

//   // If you have file uploads
//   if (this.legalIdentityData.registrationDocument) {
//     formData.append('RegistrationDocument', this.legalIdentityData.registrationDocument);
//   }
//   if (this.legalIdentityData.addressProof) {
//     formData.append('AddressProofDocument', this.legalIdentityData.addressProof);
//   }

//   this.sellerService.updateLegalIdentity(
//       this.sellerId,
//       formData
//   ).subscribe(() => {
//     alert('Updated successfully');
//     this.showLegalIdentityModal = false;
//   });
// }
handleFileChange(field: 'registrationDocumentFile' | 'addressProofFile', event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  if (field === 'registrationDocumentFile') {
    this.legalIdentityData.registrationDocumentFile = file;
  } else {
    this.legalIdentityData.addressProofFile = file;
  }

  // Optional: preview image
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = () => {
      if (field === 'registrationDocumentFile') this.legalIdentityData.registrationDocumentUrl = reader.result as string;
      else this.legalIdentityData.addressProofUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

updateLegalIdentity() {
  const formData = new FormData();
  formData.append('RegistrationType', this.legalIdentityData.registrationType);
  formData.append('RegistrationNumber', this.legalIdentityData.registrationNumber);

  if (this.legalIdentityData.registrationDocumentFile) {
    formData.append('RegistrationDocument', this.legalIdentityData.registrationDocumentFile);
  }

  if (this.legalIdentityData.addressProofFile) {
    formData.append('AddressProofDocument', this.legalIdentityData.addressProofFile);
  }

  this.sellerService.updateLegalIdentity(this.sellerId, formData)
    .subscribe(() => {
      alert('Updated successfully');
      this.showLegalIdentityModal = false;
    });
}
}
