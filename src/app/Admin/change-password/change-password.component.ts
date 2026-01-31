import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  // Form
  passwordForm: FormGroup;
  
  // UI State
  loading: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  
  // Admin Info
  adminId: number = 0; // Will be fetched from localStorage
  adminName: string = '';
  adminEmail: string = '';
  lastChangedDays: number = 0; // Will be calculated or fetched from API
  passwordStrength: string = 'N/A'; 
  
  // Password strength tracking
  strengthScore: number = 0;
  hasLength: boolean = false;
  hasUppercase: boolean = false;
  hasLowercase: boolean = false;
  hasNumber: boolean = false;
  hasSpecialChar: boolean = false;
  
  // API endpoint - Update this with your actual API URL
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.passwordForm = this.createForm();
  }

  ngOnInit(): void {
    // Get admin info from localStorage
    this.loadAdminInfoFromLocalStorage();
    
    // Subscribe to password changes for strength calculation
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.calculatePasswordStrength(password);
    });
  }

  loadAdminInfoFromLocalStorage(): void {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.adminId = parseInt(userId, 10);
        console.log('Admin ID from localStorage:', this.adminId);
      } else {
        console.error('userId not found in localStorage');
        this.errorMessage = 'User ID not found. Please login again.';
        this.adminId = 0;
      }

      // Get additional admin info if available
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.adminName = user.name || 'Admin User';
          this.adminEmail = user.email || 'admin@example.com';
        } catch (e) {
          console.error('Error parsing userData from localStorage:', e);
        }
      }

      // Get last password change date if available
      const lastPasswordChange = localStorage.getItem('lastPasswordChange');
      if (lastPasswordChange) {
        try {
          const lastChangeDate = new Date(lastPasswordChange);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastChangeDate.getTime());
          this.lastChangedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (e) {
          console.error('Error calculating last password change:', e);
        }
      }

    } catch (error) {
      console.error('Error loading admin info from localStorage:', error);
      this.errorMessage = 'Error loading user information. Please login again.';
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  };

  // Calculate password strength
  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.strengthScore = 0;
      this.resetStrengthFlags();
      return;
    }

    this.hasLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[@$!%*?&]/.test(password);

    // Calculate score (0-4)
    let score = 0;
    if (this.hasLength) score++;
    if (this.hasUppercase) score++;
    if (this.hasLowercase) score++;
    if (this.hasNumber) score++;
    if (this.hasSpecialChar) score++;
    
    this.strengthScore = Math.min(4, Math.floor(score * 0.8)); // Scale to 0-4
    this.passwordStrength = this.getStrengthLabel();
  }

  resetStrengthFlags(): void {
    this.hasLength = false;
    this.hasUppercase = false;
    this.hasLowercase = false;
    this.hasNumber = false;
    this.hasSpecialChar = false;
  }

  getStrengthLabel(): string {
    switch (this.strengthScore) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'None';
    }
  }

  // Toggle password visibility
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Change password
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    if (this.adminId === 0) {
      this.errorMessage = 'User ID not found. Please login again.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      oldPassword: this.passwordForm.get('oldPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    console.log('Changing password for adminId:', this.adminId);
    console.log('Payload:', { ...payload, newPassword: '***', oldPassword: '***' }); // Don't log actual passwords

    // Call API
    this.http.post(`${this.apiUrl}/change-password/${this.adminId}`, payload)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage = 'Your password has been changed successfully! You will be redirected to dashboard shortly.';
          
          // Update last password change in localStorage
          const today = new Date();
          localStorage.setItem('lastPasswordChange', today.toISOString());
          
          // Reset form
          this.passwordForm.reset();
          this.resetStrengthFlags();
          this.strengthScore = 0;
          
          // Update last changed days
          this.lastChangedDays = 0;
          this.passwordStrength = this.getStrengthLabel();
          
          // Redirect after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 3000);
        },
        error: (error) => {
          this.loading = false;
          
          console.error('Password change API error:', error);
          
          if (error.status === 400) {
            if (error.error && typeof error.error === 'string') {
              this.errorMessage = error.error;
            } else {
              this.errorMessage = 'Current password is incorrect. Please try again.';
            }
          } else if (error.status === 401) {
            this.errorMessage = 'Unauthorized access. Please login again.';
          } else if (error.status === 404) {
            this.errorMessage = 'User not found. Please check your account.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'Failed to change password. Please check your connection and try again.';
          }
        }
      });
  }

  // Reset form
  resetForm(): void {
    this.passwordForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.resetStrengthFlags();
    this.strengthScore = 0;
  }

  // Cancel
  cancel(): void {
    if (this.passwordForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/admin/dashboard']);
      }
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  // Clear error
  clearError(): void {
    this.errorMessage = '';
  }

  // Helper to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}