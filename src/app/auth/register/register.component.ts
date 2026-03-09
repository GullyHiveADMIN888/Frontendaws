
import { Component, OnInit } from '@angular/core';

import { StepIndicatorComponent } from '../step-indicator/step-indicator.component';
import { Step1BasicInfoComponent } from '../step1-basic-info/step1-basic-info.component';
import { Step2LegalIdentityComponent } from '../step2-legal-identity/step2-legal-identity.component';
import { Step3ProfessionalDetailsComponent } from '../step3-professional-details/step3-professional-details.component';
import { OTPVerificationComponent } from '../otp-verification/otp-verification.component';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
// For identity type validation
import { ViewChild } from '@angular/core';


@Component({
    selector: 'app-register',
    imports: [
    RouterModule,
    StepIndicatorComponent,
    Step1BasicInfoComponent,
    Step2LegalIdentityComponent,
    Step3ProfessionalDetailsComponent,
    OTPVerificationComponent
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

    businessName: '',
    registrationType: null,
    registrationNumber: '',
    selfOverview: '',
    skillsBackground: '',
    achievements: '',
    businessAddress: '',
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
    stateId: null,
    areaId: null,
    cityId: null as number | null,
    // professionalType: '',
    serviceCategoryId: null,
    professionalType: null,
    howToKnowId: null,
    howToKnowOther: '',
  };

  errors: any = {};

  //otp...
  showOtpModal = false;
  isMobileVerified = false;
  //...
  successMessage = '';

  //last otp
  showVerificationModal = false;
  verificationType: 'mobile' | 'email' | null = null;
  //...




  onInputChange(event: { field: string; value: any }) {
    this.formData[event.field] = event.value;

    // 🔥 CLEAR ERROR AS USER TYPES
    if (this.errors[event.field]) {
      delete this.errors[event.field];
    }
  }

  // For identity type validation
  @ViewChild(Step2LegalIdentityComponent) step2Component!: Step2LegalIdentityComponent;
  //...

  /* 🔹 STEP NAVIGATION */
  goToStep(step: number) {
    this.currentStep = step;
    //this.showOTP = false;
  }


  goNextFromStep1() {
    // // 🔴 Step validation first
    // if (!this.validateStep1()) {
    //   return;
    // }

    // 🔴 Mobile NOT verified → STOP + ALERT
    // if (!this.isMobileVerified) {
    //   alert('Please verify your mobile number before continuing.');
    //   return;
    // }


    // ✅ All good → go to Legal Identity
    this.currentStep = 3;
  }




  goNextFromStep3() {
    // // Step 3 fields
    // if (!this.validateStep3()) return;

    // // Validate identity number
    // const step2Valid = this.step2Component?.validateIdentityNumber();
    // if (!step2Valid) {
    //   // Focus the field if needed
    //   alert(this.errors.registrationNumber || 'Please correct your identity number.');
    //   return;
    // }

    this.currentStep = 4; // OTP
  }

  goNextFromStep4() {
    // if (this.validateStep4()) {
    //   // this.currentStep = 5; // OTP
    // }
  }

  /* 🔹 OTP FLOW */
  openOTP() {
    this.currentStep = 2;
  }

  /* OTP VERIFIED */
  onOTPVerified() {
    this.isMobileVerified = true;
    this.showOtpModal = false;
    this.showVerificationModal = false;
    //  this.currentStep = 1;
    // this.showVerificationModal = false; // close modal completely if desired
    this.successMessage = 'Mobile number verified successfully!';
  }


  // ✅ Inject the service here
  constructor(private service: AuthService) { }


  submitForm() {
   // if (!this.validateStep4()) return;

    this.isSubmitting = true;

    const formData = new FormData();

    // Step 1
    formData.append('FullName', this.formData.fullName || '');
    formData.append('Email', this.formData.email || '');
    formData.append('Mobile', this.formData.mobile || '');
    formData.append('ProfessionalType', this.formData.professionalType || '');


    // ✅ Service Category IDs
    formData.append('ServiceCategoryId', this.formData.serviceCategoryId?.toString() || '');
    (this.formData.subCategoryIds || []).forEach((id: number) => {
      formData.append('SubCategoryIds[]', id.toString());
    });


    // Step 2
    formData.append('BusinessName', this.formData.businessName || '');
    formData.append('RegistrationType', this.formData.registrationType || '');
    formData.append('RegistrationNumber', this.formData.registrationNumber || '');

    formData.append('Password', this.formData.password || '');
    if (this.formData.registrationDocument) formData.append('RegistrationDocument', this.formData.registrationDocument);
    if (this.formData.addressProof) formData.append('AddressProof', this.formData.addressProof);


    formData.append('Line1', this.formData.line1 || '');
    formData.append('Line2', this.formData.line2 || '');
    // formData.append('Locality', this.formData.locality || '');
    formData.append('AreaId', this.formData.areaId?.toString() || '');

    formData.append('Landmark', this.formData.landmark || '');

    formData.append('StateId', this.formData.stateId?.toString() || '');
    formData.append('CityId', this.formData.cityId?.toString() || '');
    formData.append('PinCode', this.formData.pinCode || '');

    // Step 3
    formData.append('SelfOverview', this.formData.selfOverview || '');
    formData.append('SkillsBackground', this.formData.skillsBackground || '');
    formData.append('Achievements', this.formData.achievements || '');
    if (this.formData.profilePicture)
      formData.append('ProfilePicture', this.formData.profilePicture);
    // Convert selected area IDs into serviceAreas array
    this.formData.serviceAreas = (this.formData.selectedAreaIds || []).map((id: number) => ({
      areaId: id,
      cityId: this.formData.cityId
    }));

    (this.formData.serviceAreas || []).forEach((area: any, index: number) => {
      formData.append(`ServiceAreas[${index}].AreaId`, area.areaId.toString());
      formData.append(`ServiceAreas[${index}].CityId`, area.cityId.toString());

      formData.append('HowToKnowId', this.formData.howToKnowId?.toString() || '');

      if (this.formData.howToKnowId === 6) {
        formData.append('HowToKnowOther', this.formData.howToKnowOther || '');
      }
    });




 

    this.service.submitRegistration(formData).subscribe({
      next: (res: any) => {
        console.log('Backend response:', res);

        if (res.userId) {
          this.service.saveAuth(res.token, res.role, res.name, res.userId);
          this.formData.userId = res.userId;
          this.isSubmitting = false;
          this.submitSuccess = true;
          // 👉 ONLY open verification modal here
          this.showVerificationModal = true;
        }

        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.isSubmitting = false;
      }
    });
  }







  // validateStep1(): boolean {
  //   this.errors = {};

  //   const name = this.formData.fullName?.trim();

  //   if (!name) {
  //     this.errors.fullName = 'Full Name is required';
  //   }
  //   else if (name.length < 3) {
  //     this.errors.fullName = 'Full Name must be at least 3 characters';
  //   }
  //   else if (!/^[A-Za-z\u0900-\u097F\s.-]+$/.test(name)) {
  //     this.errors.fullName = 'Full Name contains invalid characters';
  //   }


  //   if (!this.formData.email?.trim()) {
  //     this.errors.email = 'Email is required';
  //   } else if (!/^\S+@\S+\.\S+$/.test(this.formData.email)) {
  //     this.errors.email = 'Enter a valid email';
  //   }

  //   if (!this.formData.mobile?.trim()) {
  //     this.errors.mobile = 'Mobile number is required';
  //   } else if (!/^\d{10}$/.test(this.formData.mobile)) {
  //     this.errors.mobile = 'Enter valid 10-digit mobile';
  //   }

  //   if (!this.formData.serviceCategoryId) {
  //     this.errors.serviceCategoryId = 'Select a service category';
  //   }

  //   // 🔹 SUBCATEGORY VALIDATION
  //   if (this.formData.hasSubCategories) {
  //     if (!this.formData.subCategoryIds?.length) {
  //       this.errors.subCategoryIds = 'Select at least one service subcategory';
  //     }
  //   }


  //   if (!this.formData.password?.trim()) {
  //     this.errors.password = 'Password is required';
  //   }
  //   else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(this.formData.password)) {
  //     this.errors.password =
  //       'Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character';
  //   }

  //   if (!this.formData.professionalType?.trim()) {
  //     this.errors.professionalType = 'Select professional type';
  //   }

  //   return Object.keys(this.errors).length === 0;
  // }


  // validateStep3(): boolean {
  //   this.errors = {};
  //   if (!this.formData.businessName?.length) {
  //     this.errors.businessName = 'Business name required';
  //   }
  //   if (!this.formData.registrationType?.length) {
  //     this.errors.registrationType = 'Select registration type';
  //   }
  //   if (!this.formData.registrationNumber?.length) {
  //     this.errors.registrationNumber = 'Registration number required';
  //   }
  //   if (!this.formData.registrationDocument) {
  //     this.errors.registrationDocument = 'Upload registration document';
  //   }
  //   if (!this.formData.addressProof) {
  //     this.errors.addressProof = 'Upload address proof';
  //   }
  //   if (!this.formData.line1?.trim()) {
  //     this.errors.line1 = 'Line 1 is required';
  //   }
  //   if (!this.formData.stateId) {
  //     this.errors.stateId = 'Select state';
  //   }

  //   if (!this.formData.cityId) {
  //     this.errors.city = 'Select city';
  //   }

  //   if (!this.formData.pinCode?.trim()) {
  //     this.errors.pinCode = 'PIN Code is required';
  //   } else if (!/^\d{6}$/.test(this.formData.pinCode)) {
  //     this.errors.pinCode = 'PIN Code must be exactly 6 digits';
  //   }



  //   return Object.keys(this.errors).length === 0;
  // }

  // validateStep4(): boolean {
  //   this.errors = {};

  //   if (!this.formData.selfOverview || this.formData.selfOverview.trim().length < 150) {
  //     this.errors.selfOverview = 'Minimum 150 characters required';
  //   }

  //   if (!this.formData.skillsBackground || this.formData.skillsBackground.trim().length < 50) {
  //     this.errors.skillsBackground = 'Minimum 50 characters required';
  //   }
  //   if (!this.formData.howToKnowId) {
  //     this.errors.howToKnowId = 'Please select an option';
  //   }

  //   // ShowOtherInput logic should be checked via the selected ID
  //   if (this.formData.howToKnowId === 6 && (!this.formData.howToKnowOther || this.formData.howToKnowOther.trim() === '')) {
  //     this.errors.howToKnowOther = 'Please specify how you heard about us';
  //   }

  //   return Object.keys(this.errors).length === 0;
  // }



  async openMobileVerification() {
    this.verificationType = 'mobile';
    this.showOtpModal = true;

    try {
      await this.service.sendOtp(this.formData?.mobile);
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP');
    }
  }



  closeVerificationModal() {

    // Close UI
    this.showVerificationModal = false;
    this.showOtpModal = false;

    // Optional: clear mobile/email
    this.formData.mobile = '';
    this.formData.email = '';

    // 🔥 CLEAR FIREBASE STATE SAFELY
    this.service.clearRecaptcha();
  }
  // Back from OTP
  handleOtpBack() {

    this.showOtpModal = false; // hide OTP
    this.service.clearRecaptcha(); // 🔥 clear Firebase state
  }

  openEmailVerification() {
    if (!this.formData.email || !this.formData.userId) {
      alert('Email or User ID missing!');
      return;
    }

    this.verificationType = 'email';

    this.service.sendEmailOtp({
      userId: this.formData.userId,
      email: this.formData.email,
      fullName: this.formData.fullName
    }).subscribe({
      next: (res: any) => {
        console.log('Email OTP sent response:', res);

        this.formData.emailOtpToken = res.token;

        if (!res.token) {
          alert('OTP token not received from server');
          return;
        }

        // ✅ Open modal ONLY after success
        this.showOtpModal = true;
      },
      error: (err) => {
        console.error('Send email OTP error:', err);
        alert('Failed to send email OTP');
      }
    });
  }

  onOTPVerifiedEmail(event: { otp: string }) {
    if (this.verificationType === 'email') {
      if (!this.formData.emailOtpToken) {
        alert('OTP token missing!');
        return;
      }

      this.service.verifyEmailOtp({
        otp: event.otp,
        token: this.formData.emailOtpToken
      }).subscribe({
        next: () => {
          alert('Email verified successfully!');
          this.showOtpModal = false;
          this.showVerificationModal = false;

          // Mark email verified in local state
          this.formData.isEmailVerified = true;
        },
        error: () => {
          alert('Invalid or expired OTP');
        }
      });
    }
    else if (this.verificationType === 'mobile') {
      this.isMobileVerified = true;
      this.showOtpModal = false;
      this.showVerificationModal = false;
    }
  }
}
