import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Step1MsmeBasicInfoComponent } from '../step1-msme-basic-info/step1-msme-basic-info.component';
import { Step2MsmeBusinessDetailsComponent } from '../step2-msme-business-details/step2-msme-business-details.component';
import { Step3MsmeDocumentsComponent } from '../step3-msme-documents/step3-msme-documents.component';


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
     Step1MsmeBasicInfoComponent,
    Step2MsmeBusinessDetailsComponent,
    Step3MsmeDocumentsComponent


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
    firstName: '',
    lastName: '',
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
    confirmPassword: '',
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
    legalCompanyName: '',
    CompanyName: '',
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
    this.currentStep = 3;
  }




  goNextFromStep3() {
    this.currentStep = 4; // OTP
  }

  goNextFromStep4() {
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

  if (this.formData.providerType === 'INDIVIDUAL') {
    this.submitIndividualRegistration();
  }

  if (this.formData.providerType === 'MSME' || this.formData.providerType === 'COMPANY') {
    this.submitCompanyRegistration();
  }

}



  submitIndividualRegistration() {
    this.isSubmitting = true;

    const formData = new FormData();

    // Step 1
  //  formData.append('FullName', this.formData.fullName || '');
    const fullName = `${this.formData.firstName || ''} ${this.formData.lastName || ''}`.trim();

  formData.append('FullName', fullName);
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


submitCompanyRegistration() {

  this.isSubmitting = true;

  const formData = new FormData();

  formData.append('CompanyName', this.formData.companyName || '');
  formData.append('LegalCompanyName', this.formData.legalCompanyName || '');

     // Step 1
  //  formData.append('FullName', this.formData.fullName || '');
    const fullName = `${this.formData.firstName || ''} ${this.formData.lastName || ''}`.trim();

  formData.append('FullName', fullName);
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

  this.service.submitCompanyRegistration(formData).subscribe({
    next: (res:any) => this.handleSuccess(res),
    error: (err) => this.handleError(err)
  });

}
handleSuccess(res:any) {

  if (res.userId) {

    this.service.saveAuth(res.token, res.role, res.name, res.userId);

    this.formData.userId = res.userId;

    this.submitSuccess = true;

    this.showVerificationModal = true;
  }

  this.isSubmitting = false;
}

handleError(err:any) {

  console.error(err);
  this.isSubmitting = false;
}

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


  selectProviderType(type: string) {
  this.formData.providerType = type;

  if (type === 'INDIVIDUAL') {
    this.currentStep = 1;
  }

  if (type === 'MSME' || type === 'COMPANY') {
    this.currentStep = 10; 
    // or start a different flow later
  }
}

goNext() {
  this.currentStep++;
}


individualSteps = [1,2,3,4];
msmeSteps = [10,11,12];

get isIndividual() {
  return this.formData.providerType === 'INDIVIDUAL';
}

get isMsme() {
  return this.formData.providerType === 'MSME' || this.formData.providerType === 'COMPANY';
}
}