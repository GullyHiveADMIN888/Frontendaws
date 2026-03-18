import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeInvitationService, EmployeeInvitationDetails, ValidateInvitationResponse } from '../../Admin/invitation-generator/service/employee-invitation.service';
import { AuthService, SendOtpEmailWithoutUserIdRequest, VerifyOtpEmailWithoutUserIdRequest } from '../../auth/auth.service';
import { OTPVerificationWithoutIdComponent } from '../../auth/otp-verification-without-id/otp-verification-without-id.component';
import { firstValueFrom } from 'rxjs';
// ========== IMPORT FOR EMAIL OTP COMPONENT - COMMENTED OUT ==========
// Uncomment when email OTP is enabled
// import { OtpEmailVerificationWithoutIdComponent } from '../../auth/otp-verification-without-id/otp-email-verification-without-id.component';

@Component({
  selector: 'app-employee-registration',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    OTPVerificationWithoutIdComponent,
    // ========== EMAIL OTP COMPONENT IMPORT - COMMENTED OUT ==========
    // Uncomment when email OTP is enabled
    // OtpEmailVerificationWithoutIdComponent
  ],
  templateUrl: './employee-registration.component.html',
  styleUrls: ['./employee-registration.component.css']
})
export class EmployeeRegistrationComponent implements OnInit {
  @ViewChild('mobileOtpComponent') mobileOtpComponent!: OTPVerificationWithoutIdComponent;
  
  // ========== EMAIL OTP VIEWCHILD - COMMENTED OUT ==========
  // Uncomment when email OTP is enabled
  // @ViewChild('emailOtpComponent') emailOtpComponent!: OtpEmailVerificationWithoutIdComponent;

  registrationForm: FormGroup;
  invitationDetails: EmployeeInvitationDetails | null = null;
  isLoading = true;
  isSubmitting = false;
  showSuccess = false;
  errorMessage: string | null = null;
  
  // Mobile OTP States
  showMobileOtp = false;
  mobileVerified = false;
  mobileVerificationInProgress = false;
  mobileOtpSent = false;
  
  // ========== EMAIL OTP STATES - COMMENTED OUT ==========
  // Uncomment these when email OTP is enabled
  /*
  showEmailOtp = false;
  emailVerified = false;
  emailVerificationInProgress = false;
  emailOtpSent = false;
  emailOtpToken: string | null = null;
  */
  
  // File upload
  selectedFile: File | null = null;
  isFileInvalid = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: EmployeeInvitationService,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      employeeName: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      // Email is still required but without OTP verification for now
      email: ['', [Validators.required, Validators.email]],
      aadharId: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    
    if (!token) {
      this.errorMessage = 'No invitation token provided';
      this.isLoading = false;
      return;
    }

    this.validateAndLoadInvitation(token);
  }

  validateAndLoadInvitation(token: string): void {
    this.invitationService.validateInvitation(token).subscribe({
      next: (validation: ValidateInvitationResponse) => {
        if (validation.isValid) {
          this.loadInvitationDetails(token);
        } else {
          this.errorMessage = validation.message || 'Invalid or expired invitation';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error validating invitation:', error);
        this.errorMessage = 'Failed to validate invitation. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadInvitationDetails(token: string): void {
    this.invitationService.getInvitationDetails(token).subscribe({
      next: (details) => {
        this.invitationDetails = details;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invitation details:', error);
        this.errorMessage = 'Failed to load invitation details';
        this.isLoading = false;
      }
    });
  }

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    if (fieldName === 'confirmPassword') {
      return (field?.invalid || this.registrationForm.hasError('passwordMismatch')) && 
             (field?.dirty || field?.touched || this.registrationForm.touched);
    }
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // ========== UPDATED isFormValid - REMOVED emailVerified CHECK ==========
  isFormValid(): boolean {
    return this.registrationForm.valid && 
           this.mobileVerified && 
           // Email verification check is removed for now
           // Uncomment the line below when email OTP is enabled
           // this.emailVerified && 
           this.selectedFile !== null;
  }

  // ==================== MOBILE OTP METHODS ====================
  async sendMobileOtp(): Promise<void> {
    const mobile = this.registrationForm.get('mobile')?.value;
    
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    this.mobileVerificationInProgress = true;
    
    try {
      console.log('Sending OTP to AuthService (raw):', mobile);
      
      // AuthService will add +91 internally
      await this.authService.sendOtp(mobile);
      
      this.mobileOtpSent = true;
      this.showMobileOtp = true;
      this.mobileVerificationInProgress = false;
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      this.mobileVerificationInProgress = false;
      alert(error.message || 'Failed to send OTP. Please try again.');
    }
  }

  onMobileVerified(): void {
    this.mobileVerified = true;
    this.showMobileOtp = false;
    alert('Mobile number verified successfully!');
  }

  onMobileBack(): void {
    this.showMobileOtp = false;
    this.mobileVerificationInProgress = false;
  }

  // ========== EMAIL OTP METHODS - COMMENTED OUT ==========
  // Uncomment all email-related methods when email OTP is enabled
  /*
  async sendEmailOtp(): Promise<void> {
    const email = this.registrationForm.get('email')?.value;
    const employeeName = this.registrationForm.get('employeeName')?.value;
    
    if (!email || !this.isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!employeeName) {
      alert('Please enter employee name first');
      return;
    }

    this.emailVerificationInProgress = true;
    
    try {
      const payload: SendOtpEmailWithoutUserIdRequest = {
        email: email,
        fullName: employeeName
      };
      
      const response = await firstValueFrom(this.authService.sendOtpEmailWithoutUserId(payload));
      
      this.emailOtpToken = response.token;
      this.emailOtpSent = true;
      this.showEmailOtp = true;
      this.emailVerificationInProgress = false;
      
    } catch (error: any) {
      console.error('Error sending email OTP:', error);
      this.emailVerificationInProgress = false;
      
      if (error.error?.message) {
        alert(error.error.message);
      } else {
        alert('Failed to send email OTP. Please try again.');
      }
    }
  }

  async onEmailVerified(event: { otp: string }): Promise<void> {
    if (!this.emailOtpToken) {
      alert('Email verification token missing');
      return;
    }

    const email = this.registrationForm.get('email')?.value;

    try {
      const payload: VerifyOtpEmailWithoutUserIdRequest = {
        otp: event.otp,
        token: this.emailOtpToken,
        email: email
      };
      
      await firstValueFrom(this.authService.verifyOtpEmailWithoutUserId(payload));
      
      this.emailVerified = true;
      this.showEmailOtp = false;
      alert('Email verified successfully!');
    } catch (error: any) {
      console.error('Error verifying email OTP:', error);
      
      if (error.error?.message) {
        alert(error.error.message);
      } else {
        alert('Failed to verify email OTP');
      }
    }
  }

  onEmailBack(): void {
    this.showEmailOtp = false;
    this.emailVerificationInProgress = false;
  }
  */

  // ==================== FILE UPLOAD ====================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        this.isFileInvalid = true;
        this.selectedFile = null;
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.isFileInvalid = true;
        this.selectedFile = null;
        return;
      }
      
      this.selectedFile = file;
      this.isFileInvalid = false;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ==================== FORM SUBMISSION ====================
  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      
      if (!this.selectedFile) {
        this.isFileInvalid = true;
      }
      
      if (!this.mobileVerified) {
        alert('Please verify your mobile number');
      } 
      // ========== EMAIL VERIFICATION CHECK - COMMENTED OUT ==========
      // Uncomment when email OTP is enabled
      /*
      else if (!this.emailVerified) {
        alert('Please verify your email address');
      }
      */
      else {
        alert('Please fill all required fields');
      }
      return;
    }

    this.isSubmitting = true;
    
    try {
      const formData = new FormData();
      formData.append('memberName', this.registrationForm.get('employeeName')?.value);
      formData.append('mobile', this.registrationForm.get('mobile')?.value);
      formData.append('email', this.registrationForm.get('email')?.value);
      formData.append('aadharId', this.registrationForm.get('aadharId')?.value);
      formData.append('password', this.registrationForm.get('password')?.value);
      formData.append('invitationToken', this.route.snapshot.queryParams['token']);
      formData.append('businessId', this.invitationDetails?.businessId.toString() || '');
      
      if (this.selectedFile) {
        formData.append('aadharFile', this.selectedFile);
      }

      const response = await firstValueFrom(this.invitationService.submitEmployeeRegistration(formData));
      
      this.isSubmitting = false;
      this.showSuccess = true;
      
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      this.isSubmitting = false;
      alert(error.error?.error || error.message || 'Registration failed. Please try again.');
    }
  }

  // ========== UPDATED resetForm - REMOVED EMAIL STATE RESETS ==========
  resetForm(): void {
    this.registrationForm.reset();
    this.mobileVerified = false;
    this.mobileOtpSent = false;
    this.showMobileOtp = false;
    // ========== EMAIL STATE RESETS - COMMENTED OUT ==========
    // Uncomment when email OTP is enabled
    /*
    this.emailVerified = false;
    this.emailOtpSent = false;
    this.showEmailOtp = false;
    this.emailOtpToken = null;
    */
    this.selectedFile = null;
    this.isFileInvalid = false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}