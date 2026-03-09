import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CustomerStepIndicatorComponent } from '../customer-step-indicator/customer-step-indicator.component';
import { CustomerStep1BasicInfoComponent } from '../customer-step1-basic-info/customer-step1-basic-info.component';
import { CustomerStep2AddressComponent } from '../customer-step2-address/customer-step2-address.component';
import { CustomerStep3PreferencesComponent } from '../customer-step3-preferences/customer-step3-preferences.component';
import { CustomerAuthService } from '../services/customer-auth.service';

// Define the interface for form data
export interface CustomerRegisterRequest {
  fullName: string;
  email?: string;
  mobile: string;
  password: string;
  preferredLanguage: string;
  cityId?: number | null;

  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  areaId?: number | null;
  landmark?: string;
  pinCode?: string;

  // Marketing attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;

  // Referral
  referralCode?: string;

  // Profile picture
  profilePicture?: File;
}

@Component({
    selector: 'app-customer-register',
    imports: [
    RouterModule,
    CustomerStepIndicatorComponent,
    CustomerStep1BasicInfoComponent,
    CustomerStep2AddressComponent,
    CustomerStep3PreferencesComponent
],
    templateUrl: './customer-register.component.html'
})
export class CustomerRegisterComponent {
  currentStep = 1;
  submitSuccess = false;
  isSubmitting = false;

  formData: CustomerRegisterRequest = {
  fullName: '',
  email: '',  
  mobile: '',
  password: '',
  preferredLanguage: 'en',
  cityId: null,
  
  // Address fields
  addressLine1: '',
  addressLine2: '',
  areaId: null,
  landmark: '',
  pinCode: '',
  
  // Referral
  referralCode: '',
  
  // Attribution - will be captured from URL
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
  gclid: '',
  fbclid: ''
};



  errors: any = {};

  constructor(private customerAuthService: CustomerAuthService) {
    this.captureAttributionFromUrl();
  }

  // Capture UTM parameters from URL
  private captureAttributionFromUrl() {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);

      this.formData.utmSource = urlParams.get('utm_source') || '';
      this.formData.utmMedium = urlParams.get('utm_medium') || '';
      this.formData.utmCampaign = urlParams.get('utm_campaign') || '';
      this.formData.utmTerm = urlParams.get('utm_term') || '';
      this.formData.utmContent = urlParams.get('utm_content') || '';
      this.formData.gclid = urlParams.get('gclid') || '';
      this.formData.fbclid = urlParams.get('fbclid') || '';
    }
  }

  onInputChange(event: { field: string; value: any }) {
    // Handle the input change
    (this.formData as any)[event.field] = event.value;

    // Clear error for this field
    if (this.errors[event.field]) {
      delete this.errors[event.field];
    }
  }

  goToStep(step: number) {
    // Validate current step before proceeding
    if (step > this.currentStep) {
      if (this.currentStep === 1 && !this.validateStep1()) {
        return;
      }
      if (this.currentStep === 2 && !this.validateStep2()) {
        return;
      }
    }
    this.currentStep = step;
  }


validateStep1(): boolean {
  this.errors = {};

  // Full Name validation
  const name = this.formData.fullName?.trim();
  if (!name) {
    this.errors.fullName = 'Full Name is required';
  } else if (name.length < 3) {
    this.errors.fullName = 'Full Name must be at least 3 characters';
  } else if (!/^[A-Za-z\u0900-\u097F\s.-]+$/.test(name)) {
    this.errors.fullName = 'Full Name contains invalid characters';
  }

  // Email validation - NOW REQUIRED
  if (!this.formData.email?.trim()) {
    this.errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(this.formData.email)) {
    this.errors.email = 'Enter a valid email';
  } else if (this.formData.email.length > 100) {
    this.errors.email = 'Email cannot exceed 100 characters';
  }

  // Mobile validation
  if (!this.formData.mobile?.trim()) {
    this.errors.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(this.formData.mobile)) {
    this.errors.mobile = 'Enter valid 10-digit mobile';
  }

  // Password validation
  if (!this.formData.password?.trim()) {
    this.errors.password = 'Password is required';
  } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(this.formData.password)) {
    this.errors.password = 'Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character';
  }

  return Object.keys(this.errors).length === 0;
}

  validateStep2(): boolean {
    this.errors = {};

    // Address is optional, but if provided, validate
    if (this.formData.addressLine1 && !this.formData.areaId) {
      this.errors.areaId = 'Please select locality if you provide address';
    }

    if (this.formData.pinCode && !/^\d{6}$/.test(this.formData.pinCode)) {
      this.errors.pinCode = 'PIN Code must be exactly 6 digits';
    }

    return Object.keys(this.errors).length === 0;
  }

  validateStep3(): boolean {
    this.errors = {};
    // No mandatory validations for step 3
    return true;
  }

  submitForm() {
    // Validate all steps
    if (!this.validateStep1()) {
      this.currentStep = 1;
      return;
    }

    if (!this.validateStep2()) {
      this.currentStep = 2;
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    // Append all fields
    formData.append('FullName', this.formData.fullName || '');
    formData.append('Mobile', this.formData.mobile || '');
    formData.append('Password', this.formData.password || '');

    if (this.formData.email) formData.append('Email', this.formData.email);
    if (this.formData.preferredLanguage) formData.append('PreferredLanguage', this.formData.preferredLanguage);
    if (this.formData.cityId) formData.append('CityId', this.formData.cityId.toString());

    // Address fields
    if (this.formData.addressLine1) formData.append('AddressLine1', this.formData.addressLine1);
    if (this.formData.addressLine2) formData.append('AddressLine2', this.formData.addressLine2);
    if (this.formData.areaId) formData.append('AreaId', this.formData.areaId.toString());
    if (this.formData.landmark) formData.append('Landmark', this.formData.landmark);
    if (this.formData.pinCode) formData.append('PinCode', this.formData.pinCode);

    // Attribution
    if (this.formData.utmSource) formData.append('UtmSource', this.formData.utmSource);
    if (this.formData.utmMedium) formData.append('UtmMedium', this.formData.utmMedium);
    if (this.formData.utmCampaign) formData.append('UtmCampaign', this.formData.utmCampaign);
    if (this.formData.utmTerm) formData.append('UtmTerm', this.formData.utmTerm);
    if (this.formData.utmContent) formData.append('UtmContent', this.formData.utmContent);
    if (this.formData.gclid) formData.append('Gclid', this.formData.gclid);
    if (this.formData.fbclid) formData.append('Fbclid', this.formData.fbclid);

    // Referral
    if (this.formData.referralCode) formData.append('ReferralCode', this.formData.referralCode);

    // Profile picture
    if (this.formData.profilePicture) {
      formData.append('ProfilePicture', this.formData.profilePicture);
    }

    this.customerAuthService.registerCustomer(formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isSubmitting = false;
        this.submitSuccess = true;

        // Store token for auto-login if needed
        localStorage.setItem('auth_token', response.token);
      },
      error: (err) => {
        console.error('❌ Registration failed - Full error:', err);
        console.error('❌ Error status:', err.status);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error error:', err.error);
        this.isSubmitting = false;

        if (err.error?.message) {
          alert(err.error.message);
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    });
  }
}