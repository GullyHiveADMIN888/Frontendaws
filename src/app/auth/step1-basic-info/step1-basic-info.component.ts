
import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../auth.service';

import { Auth, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';
import { RecaptchaVerifier } from 'firebase/auth';

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

  onCategoryChange(categoryId: string) {
  if (!categoryId) return;

  const id = Number(categoryId);

  this.formData.serviceCategoryId = id;
  this.inputChange.emit({ field: 'serviceCategoryId', value: id });

  this.formData.subCategoryIds = [];
  this.subCategories = [];

  this.authService.getSubCategories(id).subscribe(res => {
    this.subCategories = res;
  });
}


  toggleSubCategory(subId: number) {
    if (!this.formData.subCategoryIds) {
      this.formData.subCategoryIds = [];
    }

    const index = this.formData.subCategoryIds.indexOf(subId);

    if (index > -1) {
      this.formData.subCategoryIds.splice(index, 1);
    } else {
      this.formData.subCategoryIds.push(subId);
    }

    // Emit changes
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


  // onSendOTP() { this.sendOTP.emit(); }
//   onSendOTP() {

//   const mobile = this.formData?.mobile;

//   // 🔴 Required check
//   if (!mobile) {
//     this.errors.mobile = 'Mobile number is required';
//     return;
//   }

//   // 🔴 10-digit validation
//   if (!/^\d{10}$/.test(mobile)) {
//     this.errors.mobile = 'Mobile number must be 10 digits';
//     return;
//   }

//   // ✅ Valid → proceed
//   this.sendOTP.emit();
// }


async onSendOTP() {
  const mobile = this.formData?.mobile;

  if (!mobile) {
    this.errors.mobile = 'Mobile number is required';
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    this.errors.mobile = 'Mobile number must be 10 digits';
    return;
  }

  try {
    await this.authService.sendOtp(mobile);
    this.sendOTP.emit(); // open OTP modal
  } catch (err: any) {
    this.errors.mobile = err.message || 'OTP failed';
  }
}



  onNextClick() { this.next.emit(); }


 

}
