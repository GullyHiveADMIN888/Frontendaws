
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIndicatorComponent } from '../step-indicator/step-indicator.component';
import { Step1BasicInfoComponent } from '../step1-basic-info/step1-basic-info.component';
import { Step2LegalIdentityComponent } from '../step2-legal-identity/step2-legal-identity.component';
import { Step3ProfessionalDetailsComponent } from '../step3-professional-details/step3-professional-details.component';
import { OTPVerificationComponent } from '../otp-verification/otp-verification.component';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StepIndicatorComponent,
    Step1BasicInfoComponent,
    Step2LegalIdentityComponent,
    Step3ProfessionalDetailsComponent,
    OTPVerificationComponent,

  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  currentStep = 1;

  // showOTP = false;
  submitSuccess = false;
  isSubmitting = false;

  formData: any = {
    fullName: '',
    email: '',
    mobile: '',
    serviceCategory: [],
    coverageArea: '',
    professionalType: '',
    businessName: '',
    registrationType: '',
    registrationNumber: '',
    selfOverview: '',
    skillsBackground: '',
    achievements: '',
    businessAddress: '',
    state: '',
    city: '',
    plotNumber: '',
    pinCode: '',
    role: '',
    password: '',
    registrationDocument: File,
    addressProof: File,




    // Step 2 - Business Address
    line1: '',
    line2: '',

    locality: '',
    landmark: '',
    // eg. Seller/Admin


    // Step 3 - Service Areas
    areaType: '',                 // city/radius/pincode
    cityId: null as number | null,
    radiusKm: null as number | null,
    pincodes: '',                 // comma-separated string

    // Optional: more backend fields if needed



  };

  errors: any = {};

  //otp...
  showOtpModal = false;
  isMobileVerified = false;
  //...


  onInputChange(event: { field: string; value: any }) {
    this.formData[event.field] = event.value;

    // 🔥 CLEAR ERROR AS USER TYPES
    if (this.errors[event.field]) {
      delete this.errors[event.field];
    }
  }


  /* 🔹 STEP NAVIGATION */
  goToStep(step: number) {
    this.currentStep = step;
    //this.showOTP = false;
  }
  goNextFromStep1() {
    // if (this.validateStep1()) {
    //   this.currentStep = 3; // OTP
    // }
    // 🔴 Step validation first
    if (!this.validateStep1()) {
      return;
    }

    // 🔴 Mobile NOT verified → STOP + ALERT
    // if (!this.isMobileVerified) {
    //   alert('Please verify your mobile number before continuing.');
    //   return;
    // }

    // ✅ All good → go to Legal Identity
    this.currentStep = 3;
  }
  goNextFromStep3() {
    if (this.validateStep3()) {
      this.currentStep = 4; // OTP
    }
  }
  goNextFromStep4() {
    if (this.validateStep4()) {
      // this.currentStep = 5; // OTP
    }
  }

  /* 🔹 OTP FLOW */
  openOTP() {
    this.currentStep = 2;
  }

  /* OTP VERIFIED */
  onOTPVerified() {
    this.isMobileVerified = true;
    this.showOtpModal = false;
    this.currentStep = 1;
  }


  // ✅ Inject the service here
  constructor(private service: AuthService) { }


  submitForm() {
    if (!this.validateStep4()) return;

    this.isSubmitting = true;

    const formData = new FormData();

    // Step 1
    formData.append('FullName', this.formData.fullName || '');
    formData.append('Email', this.formData.email || '');
    formData.append('Mobile', this.formData.mobile || '');
    // formData.append('CoverageArea', this.formData.coverageArea || '');
    formData.append('ProfessionalType', this.formData.professionalType || '');
    formData.append('ServiceCategory', JSON.stringify(this.formData.serviceCategory || []));


    // ✅ Service Category IDs
    formData.append('ServiceCategoryId', this.formData.serviceCategoryId?.toString() || '');
    (this.formData.subCategoryIds || []).forEach((id: number) => {
      formData.append('SubCategoryIds[]', id.toString());
    });

    if (this.formData.profilePicture) formData.append('ProfilePicture', this.formData.profilePicture);

    // Step 2
    formData.append('BusinessName', this.formData.businessName || '');
    formData.append('RegistrationType', this.formData.registrationType || '');
    formData.append('RegistrationNumber', this.formData.registrationNumber || '');
    // Instead of sending state name:
    formData.append('State', this.formData.stateId?.toString() || '');
    formData.append('City', this.formData.cityId?.toString() || '');

    formData.append('PlotNumber', this.formData.plotNumber || '');
    formData.append('PinCode', this.formData.pinCode || '');
    formData.append('Role', 'Seller');
    formData.append('Password', this.formData.password || '');
    if (this.formData.registrationDocument) formData.append('RegistrationDocument', this.formData.registrationDocument);
    if (this.formData.addressProof) formData.append('AddressProof', this.formData.addressProof);




    formData.append('Line1', this.formData.line1 || '');
    formData.append('Line2', this.formData.line2 || '');
    formData.append('Locality', this.formData.locality || '');
    formData.append('Landmark', this.formData.landmark || '');

    formData.append('StateId', this.formData.stateId?.toString() || '');
    formData.append('CityId', this.formData.cityId?.toString() || '');
    formData.append('PinCode', this.formData.pinCode || '');

    formData.append('AreaType', this.formData.areaType || '');
    formData.append('ServiceCityId', this.formData.cityId?.toString() || '');
    formData.append('RadiusKm', this.formData.radiusKm?.toString() || '');
    formData.append('Pincodes', this.formData.pincodes || '');



    // Step 3
    formData.append('SelfOverview', this.formData.selfOverview || '');
    formData.append('SkillsBackground', this.formData.skillsBackground || '');
    formData.append('Achievements', this.formData.achievements || '');
    if (this.formData.profilePicture)
      formData.append('ProfilePicture', this.formData.profilePicture);



    this.service.submitRegistration(formData).subscribe({
      next: (res) => {
        console.log('Backend response:', res);
        this.isSubmitting = false;
        this.submitSuccess = true; // show success message
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.isSubmitting = false;
      }
    });
  }







  validateStep1(): boolean {
    this.errors = {};

    if (!this.formData.fullName?.trim()) {
      this.errors.fullName = 'Full Name is required';
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
    if (!this.formData.subCategoryIds?.length) {
      this.errors.subCategoryIds = 'Select at least one service subCategoory';
    }

    // if (!this.formData.coverageArea?.trim()) {
    //   this.errors.coverageArea = 'Coverage area is required';
    // }
    if (!this.formData.password?.trim()) {
      this.errors.password = 'password is required';
    }

    if (!this.formData.professionalType?.trim()) {
      this.errors.professionalType = 'Select professional type';
    }

    return Object.keys(this.errors).length === 0;
  }









  validateStep3(): boolean {
    this.errors = {};
    if (!this.formData.businessName?.length) {
      this.errors.businessName = 'Business name required';
    }
    if (!this.formData.registrationType?.length) {
      this.errors.registrationType = 'Select registration type';
    }
    if (!this.formData.registrationNumber?.length) {
      this.errors.registrationNumber = 'Registration number required';
    }
    if (!this.formData.registrationDocument) {
      this.errors.registrationDocument = 'Upload registration document';
    }
    if (!this.formData.addressProof) {
      this.errors.addressProof = 'Upload address proof';
    }
    if (!this.formData.line1?.trim()) {
      this.errors.line1 = 'Line 1 is required';
    }
    return Object.keys(this.errors).length === 0;
  }

  validateStep4(): boolean {
    this.errors = {};

    if (!this.formData.selfOverview || this.formData.selfOverview.trim().length < 150) {
      this.errors.selfOverview = 'Minimum 150 characters required';
    }

    if (!this.formData.skillsBackground || this.formData.skillsBackground.trim().length < 50) {
      this.errors.skillsBackground = 'Minimum 50 characters required';
    }

    return Object.keys(this.errors).length === 0;
  }




}
