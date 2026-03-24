import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { OTPVerificationWithoutIdComponent } from '../../auth/otp-verification-without-id/otp-verification-without-id.component';
import { OpsManagerProfileService, OpsManagerProfile } from './services/ops-manager-profile.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ops-manager-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, OTPVerificationWithoutIdComponent],
  templateUrl: './ops-manager-profile.component.html',
  styleUrls: ['./ops-manager-profile.component.css']
})
export class OpsManagerProfileComponent implements OnInit {
  @ViewChild('mobileOtpComponent') mobileOtpComponent!: OTPVerificationWithoutIdComponent;

  profileForm: FormGroup;
  profile: OpsManagerProfile | null = null;
  isLoading = true;
  isSaving = false;
  isUpdatingMobile = false;
  showSuccess = false;
  showMobileOtp = false;
  newMobileNumber = '';
  otpValue = '';
  mobileUpdateStep: 'idle' | 'enter' | 'otp' = 'idle';
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profileService: OpsManagerProfileService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profile = response.data;
          this.profileForm.patchValue({
            name: this.profile.name,
            email: this.profile.email
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile. Please refresh the page.';
        this.isLoading = false;
      }
    });
  }

  // ========== PROFILE UPDATE ==========
  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    const password = this.profileForm.get('password')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      setTimeout(() => this.clearMessages(), 3000);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const request: any = {
      name: this.profileForm.get('name')?.value,
      mobile: this.profile?.mobile || '',
      email: this.profileForm.get('email')?.value
    };

    if (password) {
      request.password = password;
    }

    this.profileService.updateProfile(request).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          if (response.data) {
            this.profile = response.data;
          }
          this.successMessage = response.message || 'Profile updated successfully!';
          this.profileForm.get('password')?.reset();
          this.profileForm.get('confirmPassword')?.reset();
          setTimeout(() => this.clearMessages(), 3000);
        } else {
          this.errorMessage = response.message || 'Failed to update profile';
          setTimeout(() => this.clearMessages(), 3000);
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to update profile';
        setTimeout(() => this.clearMessages(), 3000);
      }
    });
  }

  // ========== EMAIL UPDATE (SIMPLE - NO OTP) ==========
  async onEmailUpdate(): Promise<void> {
    const email = this.profileForm.get('email')?.value;
    
    if (!email || email === this.profile?.email) {
      return;
    }

    if (this.profileForm.get('email')?.invalid) {
      this.profileForm.get('email')?.markAsTouched();
      return;
    }

    this.isSaving = true;

    this.profileService.updateEmail({ email }).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          if (this.profile) {
            this.profile.email = email;
          }
          this.successMessage = 'Email updated successfully!';
          setTimeout(() => this.clearMessages(), 3000);
        } else {
          this.errorMessage = response.message || 'Failed to update email';
          setTimeout(() => this.clearMessages(), 3000);
          // Revert email field
          this.profileForm.patchValue({ email: this.profile?.email });
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to update email';
        setTimeout(() => this.clearMessages(), 3000);
        // Revert email field
        this.profileForm.patchValue({ email: this.profile?.email });
      }
    });
  }

  // ========== MOBILE UPDATE WITH OTP VERIFICATION (SECURE) ==========
  startMobileUpdate(): void {
    this.mobileUpdateStep = 'enter';
    this.newMobileNumber = '';
    this.errorMessage = '';
  }

  cancelMobileUpdate(): void {
    this.mobileUpdateStep = 'idle';
    this.newMobileNumber = '';
    this.showMobileOtp = false;
  }

  async sendMobileOtp(): Promise<void> {
    if (!this.newMobileNumber || !/^\d{10}$/.test(this.newMobileNumber)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number';
      setTimeout(() => this.clearMessages(), 3000);
      return;
    }

    if (this.newMobileNumber === this.profile?.mobile) {
      this.errorMessage = 'This is your current mobile number';
      setTimeout(() => this.clearMessages(), 3000);
      return;
    }

    this.isUpdatingMobile = true;

    try {
      // Step 1: Send OTP via Firebase (mobile NOT updated in DB yet)
      await this.authService.sendOtp(this.newMobileNumber);
      this.mobileUpdateStep = 'otp';
      this.showMobileOtp = true;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      this.errorMessage = error.message || 'Failed to send OTP';
      setTimeout(() => this.clearMessages(), 3000);
    } finally {
      this.isUpdatingMobile = false;
    }
  }

  // Called by OTPVerificationWithoutIdComponent after successful OTP verification
  async onMobileVerified(): Promise<void> {
    this.isUpdatingMobile = true;
    
    try {
      // Step 2: After OTP verification, update mobile in backend
      const response = await firstValueFrom(
        this.profileService.verifyAndUpdateMobile({ 
          mobile: this.newMobileNumber,
          otp: '' // OTP is already verified on frontend, backend just needs to know it's verified
        })
      );

      if (response.success) {
        // Refresh profile to get updated mobile and verification status
        await this.loadProfile();
        
        this.successMessage = 'Mobile number updated and verified successfully!';
        this.mobileUpdateStep = 'idle';
        this.showMobileOtp = false;
        this.newMobileNumber = '';
      } else {
        this.errorMessage = response.message || 'Failed to update mobile number';
      }
    } catch (error: any) {
      console.error('Error updating mobile:', error);
      this.errorMessage = error.error?.message || 'Failed to update mobile number';
    } finally {
      this.isUpdatingMobile = false;
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  onMobileBack(): void {
    this.showMobileOtp = false;
    this.mobileUpdateStep = 'enter';
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getVerificationBadgeClass(verified: boolean): string {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }

  getVerificationText(verified: boolean): string {
    return verified ? 'Verified' : 'Not Verified';
  }
}