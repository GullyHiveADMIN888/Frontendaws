
import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../auth.service';
import { forkJoin } from 'rxjs';

import { Auth, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';

// from data not reset when back 
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-step1-basic-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step1-basic-info.component.html'
})
export class Step1BasicInfoComponent {
  @Input() formData: any;
  @Input() errors: any;
  @Output() inputChange = new EventEmitter<{ field: string, value: any }>();
  @Output() next = new EventEmitter<void>();
  @Output() sendOTP = new EventEmitter<void>();

   togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  showPassword: boolean = false; // new property
  profilePreview: string = '';
  fileInputId = 'profile-upload-' + Math.random().toString(36).substring(2);

  parentCategories: any[] = [];
  subCategories: any[] = [];

 
  //..otp

@Input() isMobileVerified = false;
//..

  professionalTypes = [
    { label: 'Independent Professional', value: 'individual' },
    { label: 'MSME / Agency', value: 'msme' },
    { label: 'Company / Corporate', value: 'company' }
  ];


  constructor(private authService: AuthService,  @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {  
    this.authService.getParentCategories().subscribe(res => {
      this.parentCategories = res;
    });
  }
}


  onCategoryChange(categoryId: number) {
  const id = Number(categoryId);
  this.formData.serviceCategoryId = id;
  this.inputChange.emit({ field: 'serviceCategoryId', value: id });

  // Reset subcategories
  this.formData.subCategoryIds = [];
  this.subCategories = [];

  // if (id) {
  //   this.authService.getSubCategories(id).subscribe(res => {
  //     this.subCategories = res;

  //     // Optional: preselect or reset subcategories
  //     this.inputChange.emit({ field: 'subCategoryIds', value: this.formData.subCategoryIds });
  //   });
  // }
  this.authService.getSubCategories(id).subscribe(res => {
  this.subCategories = res;

  // Tell parent whether subcategories exist
  this.inputChange.emit({
    field: 'hasSubCategories',
    value: res.length > 0
  });
});

}

toggleSubCategory(subId: number) {
  if (!this.formData.subCategoryIds) this.formData.subCategoryIds = [];
  const idx = this.formData.subCategoryIds.indexOf(subId);
  if (idx > -1) this.formData.subCategoryIds.splice(idx, 1);
  else this.formData.subCategoryIds.push(subId);

  // Emit after every toggle
  this.inputChange.emit({ field: 'subCategoryIds', value: this.formData.subCategoryIds });
}

  onProfilePictureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // --- FILE VALIDATION ---
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('File size should be less than 5 MB');
            input.value = ''; // reset input
            return;
        }
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            alert('Only PNG or JPG allowed');
            input.value = ''; // reset input
            return;
        }

        // --- PREVIEW ---
        const reader = new FileReader();
        reader.onloadend = () => this.profilePreview = reader.result as string;
        reader.readAsDataURL(file);

        // --- EMIT TO PARENT ---
        this.inputChange.emit({ field: 'profilePicture', value: file });
    } else {
        this.removeProfilePicture();
    }
}


  removeProfilePicture() {
    this.profilePreview = '';
    this.inputChange.emit({ field: 'profilePicture', value: null });
    const fileInput = document.getElementById(this.fileInputId) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  private generatePreview(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => this.profilePreview = reader.result as string;
    reader.readAsDataURL(file);
  }


onInputFieldChange(field: string, value: any, event?: Event) {
 this.formData[field] = value; 
  if (field === 'mobile') {
    const input = event?.target as HTMLInputElement;

    // 🔥 digits only
    value = value.replace(/\D/g, '').slice(0, 10);

    // 🔥 update DOM input value
    if (input) {
      input.value = value;
    }
  }

  this.inputChange.emit({ field, value });

  if (this.errors?.[field]) {
    delete this.errors[field];
  }
}






  //...otp recapcta 
onSendOTP() {
  const mobile = this.formData?.mobile;

  if (!mobile) {
    this.errors.mobile = 'Mobile number is required';
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    this.errors.mobile = 'Mobile number must be 10 digits';
    return;
  }


  // 🔥 Call API to check mobile
  this.authService.checkMobileExists(mobile).subscribe({
    next: (response) => {
      if (response.exists) {
        this.errors.mobile = 'Mobile number already registered';
        return;
      }

      // ✅ If mobile NOT exists → send OTP
      this.authService.sendOtp(mobile).then(() => {
        this.sendOTP.emit();
      });

    },
    error: (err) => {
      this.errors.mobile = 'Something went wrong';
      console.error(err);
    }
  });
}
//......



// onNextClick() {
//   const mobile = this.formData?.mobile;
//    const email = this.formData?.email;

//   // if (!mobile) {
//   //   this.errors.mobile = 'Mobile number is required';
//   //   return;
//   // }

//   if (!/^\d{10}$/.test(mobile)) {
//     this.errors.mobile = 'Mobile number must be 10 digits';
//     return;
//   }

//   // 🔥 Only check mobile existence
//   this.authService.checkMobileExists(mobile).subscribe({
//     next: (response) => {

//       if (response.exists) {
//         this.errors.mobile = 'Mobile number already registered';
//         return;
//       }

//       // ✅ Mobile not exists → go next
//       this.next.emit();
//     },
//     error: () => {
//       this.errors.mobile = 'Something went wrong';
//     }
//   });
//    // 🔥 Only check email existence
//   this.authService.checkEmailExists(email).subscribe({
//     next: (response) => {

//       if (response.exists) {
//         this.errors.email = 'Email id already registered';
//         return;
//       }

//       // ✅ Mobile not exists → go next
//       this.next.emit();
//     },
//     error: () => {
//       this.errors.mobile = 'Something went wrong';
//     }
//   });
// }




validateStep1(): boolean {
  this.errors = {};

  const name = this.formData.fullName?.trim();

  if (!name) {
    this.errors.fullName = 'Full Name is required';
  }
  else if (name.length < 3) {
    this.errors.fullName = 'Full Name must be at least 3 characters';
  }
  else if (!/^[A-Za-z\u0900-\u097F\s.-]+$/.test(name)) {
    this.errors.fullName = 'Full Name contains invalid characters';
  }

  if (!this.formData.email?.trim()) {
    this.errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(this.formData.email)) {
    this.errors.email = 'Enter a valid email';
  }

  if (!this.formData.mobile?.trim()) {
    this.errors.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(this.formData.mobile)) {
    this.errors.mobile = 'Enter valid 10-digit mobile';
  }

  if (!this.formData.serviceCategoryId) {
    this.errors.serviceCategoryId = 'Select a service category';
  }

  if (this.formData.hasSubCategories) {
    if (!this.formData.subCategoryIds?.length) {
      this.errors.subCategoryIds = 'Select at least one service subcategory';
    }
  }

  if (!this.formData.password?.trim()) {
    this.errors.password = 'Password is required';
  }
  else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(this.formData.password)) {
    this.errors.password =
      'Password must include 1 uppercase, 1 number & 1 special character';
  }

  if (!this.formData.professionalType?.trim()) {
    this.errors.professionalType = 'Select professional type';
  }

  return Object.keys(this.errors).length === 0;
}

onNextClick() {

  // 🔴 1️⃣ Local validation first
  if (!this.validateStep1()) {
    this.scrollToFirstError();
    return;
  }

  const mobile = this.formData.mobile;
  const email = this.formData.email;

  // 🔴 2️⃣ Check mobile + email existence together
  forkJoin({
    mobileRes: this.authService.checkMobileExists(mobile),
    emailRes: this.authService.checkEmailExists(email)
  }).subscribe({
    next: ({ mobileRes, emailRes }) => {

      let hasError = false;

      if (mobileRes.exists) {
        this.errors.mobile = 'Mobile number already registered';
        hasError = true;
        this.scrollToFirstError();
      }

      if (emailRes.exists) {
        this.errors.email = 'Email id already registered';
        hasError = true;
        this.scrollToFirstError();
      }

      // ✅ 3️⃣ Only emit if NO errors
      if (!hasError) {
        this.next.emit();
        
      }
    },
    error: () => {
      this.errors.mobile = 'Something went wrong. Please try again.';
      this.scrollToFirstError();
    }
  });
}



ngOnChanges(changes: SimpleChanges) {
  if (changes['formData'] && this.formData) {

    // ✅ Restore Category + Subcategories
    const catId = this.formData.serviceCategoryId;
    if (catId) {
      this.authService.getSubCategories(catId).subscribe(res => {
        this.subCategories = res;

        this.inputChange.emit({
          field: 'hasSubCategories',
          value: res.length > 0
        });

        if (!this.formData.subCategoryIds) {
          this.formData.subCategoryIds = [];
        }
      });
    }

    // ✅ Restore Professional Type
    if (this.formData.professionalType) {
      this.inputChange.emit({
        field: 'professionalType',
        value: this.formData.professionalType
      });
    }

    // ✅ Restore Profile Preview
    if (this.formData.profilePicture && !this.profilePreview) {
      if (typeof this.formData.profilePicture === 'string') {
        this.profilePreview = this.formData.profilePicture;
      } else {
        this.generatePreview(this.formData.profilePicture);
      }
    }
  }
}

scrollToFirstError() {
  setTimeout(() => {
    const firstErrorElement = document.querySelector('.text-red-500');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

}
