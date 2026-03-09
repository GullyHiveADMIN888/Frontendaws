import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerAuthService } from '../services/customer-auth.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
    selector: 'app-customer-step1-basic-info',
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-step1-basic-info.component.html'
})
export class CustomerStep1BasicInfoComponent implements OnInit, OnChanges {
  @Input() formData: any;
  @Input() errors: any;
  @Output() inputChange = new EventEmitter<{ field: string; value: any }>();
  @Output() next = new EventEmitter<void>();

  profilePreview: string = '';
  fileInputId = 'profile-upload-' + Math.random().toString(36).substring(2);
  showPassword = false;
  
  // Mobile check
  mobileCheckMessage = '';
  mobileExists = false;
  mobileChecking = false;
  private mobileCheckSubject = new Subject<string>();

  // Email check
  emailExists = false;
  emailChecking = false;
  private emailCheckSubject = new Subject<string>();

  // Field touched state
  touchedFields: Set<string> = new Set();

  constructor(private customerAuthService: CustomerAuthService) {
    // Debounce mobile number check
    this.mobileCheckSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(mobile => {
        if (!mobile || !this.isValidMobile(mobile)) {
          return [];
        }
        this.mobileChecking = true;
        return this.customerAuthService.checkMobile(mobile);
      })
    ).subscribe({
      next: (response) => {
        this.mobileExists = response.exists;
        this.mobileCheckMessage = response.message;
        this.mobileChecking = false;
        
        // Update error state
        if (response.exists) {
          this.updateFieldError('mobile', 'This mobile number is already registered');
        } else {
          if (this.errors?.['mobile'] === 'This mobile number is already registered') {
            this.clearFieldError('mobile');
          }
        }
      },
      error: (err) => {
        console.error('Mobile check failed:', err);
        this.mobileChecking = false;
      }
    });

    // Debounce email check
    this.emailCheckSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (!email || !this.isValidEmail(email)) {
          return [];
        }
        this.emailChecking = true;
        return this.customerAuthService.checkEmail(email);
      })
    ).subscribe({
      next: (response) => {
        this.emailExists = response.exists;
        this.emailChecking = false;
        
        // Update error state
        if (response.exists) {
          this.updateFieldError('email', 'This email is already registered');
        } else {
          if (this.errors?.['email'] === 'This email is already registered') {
            this.clearFieldError('email');
          }
        }
      },
      error: (err) => {
        console.error('Email check failed:', err);
        this.emailChecking = false;
      }
    });
  }

  ngOnInit() {
    if (this.formData?.profilePicture) {
      this.generatePreview(this.formData.profilePicture);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData'] && this.formData?.profilePicture && !this.profilePreview) {
      if (typeof this.formData.profilePicture === 'string') {
        this.profilePreview = this.formData.profilePicture;
      } else {
        this.generatePreview(this.formData.profilePicture);
      }
    }
  }

  // Computed properties
  get isPasswordWeak(): boolean {
    return this.formData?.password?.length > 0 && this.formData.password.length < 6;
  }

  get isPasswordMedium(): boolean {
    return this.formData?.password?.length >= 6 && !this.hasPasswordStrongCriteria();
  }

  get isPasswordStrong(): boolean {
    return this.formData?.password?.length >= 6 && this.hasPasswordStrongCriteria();
  }

  get passwordStrengthClass(): string {
    if (this.isPasswordWeak) return 'bg-red-500';
    if (this.isPasswordMedium) return 'bg-yellow-500';
    if (this.isPasswordStrong) return 'bg-green-500';
    return 'bg-gray-200';
  }

  get isMobileValidAndAvailable(): boolean {
    return this.formData?.mobile && 
           this.isValidMobile(this.formData.mobile) && 
           !this.mobileExists && 
           !this.errors?.['mobile'];
  }

  get shouldShowMobileSuccess(): boolean {
    return this.touchedFields.has('mobile') && 
           this.isMobileValidAndAvailable;
  }

  get isEmailValidAndAvailable(): boolean {
    return this.formData?.email && 
           this.isValidEmail(this.formData.email) && 
           !this.emailExists && 
           !this.errors?.['email'];
  }

  get shouldShowEmailSuccess(): boolean {
    return this.touchedFields.has('email') && 
           this.formData?.email && 
           this.isEmailValidAndAvailable;
  }

  get hasErrors(): boolean {
    return Object.keys(this.errors || {}).length > 0;
  }

  get errorList(): string[] {
    return Object.values(this.errors || {});
  }

  // Validation methods
  isValidMobile(mobile: string): boolean {
    return /^\d{10}$/.test(mobile);
  }

  isValidEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  isValidName(name: string): boolean {
    return /^[A-Za-z\u0900-\u097F\s.-]+$/.test(name);
  }

  hasPasswordStrongCriteria(): boolean {
    const password = this.formData?.password || '';
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password);
  }

  onInput(field: string, value: any) {
    this.formData[field] = value;
    this.touchedFields.add(field);
    this.inputChange.emit({ field, value });

    // Validate field on input
    this.validateField(field, value);

    // Trigger mobile check
    if (field === 'mobile' && value && this.isValidMobile(value)) {
      this.mobileCheckSubject.next(value);
    }
    
    // Trigger email check
    if (field === 'email' && value && this.isValidEmail(value)) {
      this.emailCheckSubject.next(value);
    }
  }

  onBlur(field: string) {
    this.touchedFields.add(field);
    this.validateField(field, this.formData[field]);
  }

  validateField(field: string, value: any): boolean {
  switch(field) {
    case 'fullName':
      if (!value?.trim()) {
        this.updateFieldError(field, 'Full Name is required');
        return false;
      } else if (value.trim().length < 3) {
        this.updateFieldError(field, 'Full Name must be at least 3 characters');
        return false;
      } else if (value.trim().length > 100) {
        this.updateFieldError(field, 'Full Name cannot exceed 100 characters');
        return false;
      } else if (!this.isValidName(value)) {
        this.updateFieldError(field, 'Full Name contains invalid characters');
        return false;
      }
      this.clearFieldError(field);
      return true;

    case 'email':
      // Email is now REQUIRED
      if (!value?.trim()) {
        this.updateFieldError(field, 'Email is required');
        return false;
      } else if (value.length > 100) {
        this.updateFieldError(field, 'Email cannot exceed 100 characters');
        return false;
      } else if (!this.isValidEmail(value)) {
        this.updateFieldError(field, 'Enter a valid email address');
        return false;
      }
      
      // Check email existence (if not already checked)
      if (this.emailExists) {
        this.updateFieldError(field, 'This email is already registered');
        return false;
      }
      
      this.clearFieldError(field);
      return true;

    case 'mobile':
      if (!value?.trim()) {
        this.updateFieldError(field, 'Mobile number is required');
        return false;
      } else if (!this.isValidMobile(value)) {
        this.updateFieldError(field, 'Mobile number must be exactly 10 digits');
        return false;
      }
      return true;

    case 'password':
      if (!value?.trim()) {
        this.updateFieldError(field, 'Password is required');
        return false;
      } else if (value.length < 6) {
        this.updateFieldError(field, 'Password must be at least 6 characters');
        return false;
      } else if (value.length > 100) {
        this.updateFieldError(field, 'Password cannot exceed 100 characters');
        return false;
      } else if (!this.hasPasswordStrongCriteria()) {
        this.updateFieldError(field, 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character');
        return false;
      }
      this.clearFieldError(field);
      return true;

    case 'referralCode':
      if (value && value.length > 50) {
        this.updateFieldError(field, 'Referral code cannot exceed 50 characters');
        return false;
      }
      this.clearFieldError(field);
      return true;

    default:
      return true;
  }
}



  private updateFieldError(field: string, message: string) {
    if (!this.errors) this.errors = {};
    this.errors[field] = message;
  }

  private clearFieldError(field: string) {
    if (this.errors && this.errors[field]) {
      delete this.errors[field];
    }
  }

  onMobileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = value;
    this.onInput('mobile', value);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onProfilePictureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5 MB');
        input.value = '';
        return;
      }

      // Validate file type
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
        alert('Only PNG, JPG, JPEG, or GIF files are allowed');
        input.value = '';
        return;
      }

      // Validate file name length
      if (file.name.length > 255) {
        alert('File name is too long');
        input.value = '';
        return;
      }

      // Generate preview
      this.generatePreview(file);

      // Emit to parent
      this.inputChange.emit({ field: 'profilePicture', value: file });
    }
  }

  private generatePreview(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => this.profilePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeProfilePicture() {
    this.profilePreview = '';
    this.inputChange.emit({ field: 'profilePicture', value: null });
    const fileInput = document.getElementById(this.fileInputId) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  isFieldValid(field: string): boolean {
    if (!this.touchedFields.has(field)) return true;
    return !this.errors?.[field];
  }

  getFieldClass(field: string): string {
    if (!this.touchedFields.has(field)) return 'border-gray-300';
    return this.errors?.[field] ? 'border-red-500' : 'border-green-500';
  }

  onNext() {
  // Validate all fields - email is now required
  const fields = ['fullName', 'email', 'mobile', 'password'];
  let isValid = true;

  fields.forEach(field => {
    this.touchedFields.add(field);
    if (!this.validateField(field, this.formData[field])) {
      isValid = false;
    }
  });

  // Check mobile existence
  if (this.mobileExists) {
    this.updateFieldError('mobile', 'This mobile number is already registered');
    isValid = false;
  }

  // Check email existence
  if (this.formData.email && this.emailExists) {
    this.updateFieldError('email', 'This email is already registered');
    isValid = false;
  }

  if (isValid) {
    this.next.emit();
  } else {
    // Scroll to first error
    const firstError = document.querySelector('.border-red-500');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
}