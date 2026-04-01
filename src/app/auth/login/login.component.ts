// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   imports: [],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css',
// })
// export class LoginComponent {

// }




import { Auth, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';
import { RecaptchaVerifier } from 'firebase/auth';
import { OTPVerificationComponent } from '../otp-verification/otp-verification.component';
import {
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
}  from '@angular/core';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule , Router} from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval,Subscription } from 'rxjs';
// import { environment } from '../../environments/environment';
 import { environment } from '../../../environments/environment.prod';


import {  Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {  isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth.service';


import {  HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

// interface LoginComponent {
//   token: string;
//   role: string;
//   userId: number;
//   name: string;
//   email: string;
//   phone: string;
//   mobileVerified: boolean;
//   emailVerified: boolean;

//   emailOtpToken?: string;   // ✅ optional
//   isEmailVerified?: boolean;
// }
interface LoginResponse {
  token: string;
  role: string;
  userId: number;
  name: string;
  email: string;
  phone: string;
  mobileVerified: boolean;
  emailVerified: boolean;

  emailOtpToken?: string;   // ✅ optional
  isEmailVerified?: boolean;
}

 @Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
  styleUrl: './login.component.css',
    imports: [FormsModule, RouterModule, ReactiveFormsModule, OTPVerificationComponent]
})

export class LoginComponent implements OnInit, OnDestroy {
  scrolled = false;
  currentTestimonial = 0;
  showLoginModal = false;
  loginError = '';
  isLoggingIn = false;
  isSubmitting = false;
  submitStatus: 'idle' | 'success' | 'error' = 'idle';
  charCount = 0;


// Forgot Pass....
showForgotPasswordModal = false;
forgotPasswordForm: FormGroup;
isSendingOtp = false;
showOtpModal = false;
otpMobile = '';

otp: string[] = Array(6).fill('');
timer = 30;
canResend = false;
isVerifying = false;
  error = '';
// private otpTimerSubscription: Subscription | null = null;
 private timerSubscription: Subscription | null = null;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  // Firebase...
confirmationResult!: ConfirmationResult;
recaptchaVerifier!: RecaptchaVerifier;
//....

 loginForm: FormGroup;
  loginData = {
    email: '',
    password: ''
  };

  formData = {
    name: '',
    email: '',
    phone: '',
    service: '',
    location: '',
    message: ''
  };

showVerificationModal: boolean = false;
verificationType: 'mobile' | 'email' | null = null;
verificationTypes: 'forgot' | 'login' | null = null;
pendingLoginResponse!: LoginResponse;

verificationData = {
  phone: '',
  email: ''
};


  private readonly apiUrl = `${environment.apiBaseUrl}`;


showPasswordPopup = false;
newPassword = '';
confirmPassword = '';
passwordError = '';



  private subscription?: Subscription;


  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private auth: Auth, @Inject(PLATFORM_ID) private platformId: any,private router: Router) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
     // Captcha login
    // captcha: ['', Validators.required] 
     //...
  });


  // Forgot password form
  this.forgotPasswordForm = this.fb.group({
    mobile: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]] // Indian 10-digit mobile number
  });
}
  


  // Captcha login
// captchaUrl: string = '';


// loadCaptcha() {
//   this.http.get(`${this.apiUrl}/auth/captcha`, {
//     responseType: 'blob',
//     withCredentials: true
//   }).subscribe(blob => {
//     this.captchaUrl = URL.createObjectURL(blob);
//   });
// }


// refreshCaptcha() {
//   this.loadCaptcha();
// }




  private backHandler = this.handleBackButton.bind(this);





 

  // handleBackButton(): void {
  //   const isLoggedIn = localStorage.getItem('token');

  //   if (isLoggedIn) {
  //     // 🚀 EXIT APP (APK)
  //     if ((navigator as any).app?.exitApp) {
  //       (navigator as any).app.exitApp();
  //     } else {
  //       // fallback
  //       window.close();
  //     }
  //   } else {
  //     // If somehow not logged in
  //     this.router.navigate(['/auth/login'], { replaceUrl: true });
  //   }
  // }
handleBackButton(): void {
  const isLoggedIn = localStorage.getItem('token');

  if (isLoggedIn) {
    // ✅ Call Android native interface
    if ((window as any).Android?.exitApp) {
      (window as any).Android.exitApp();
    } else {
      console.log('Exit not supported in this APK');
    }
  } else {
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}


  private exitApp(): void {
    console.log('Exiting APK...');

    // Capacitor (if used)
    // import { App } from '@capacitor/app';
    // App.exitApp();

    // fallback
    (window as any).close();
  }




//...
    ngOnInit(): void {
       // Captcha login
   //  this.loadCaptcha();
       //...
    this.setupScrollListener();
    this.loadRememberedEmail();
   
       // ✅ Clear navigation history (VERY IMPORTANT)
    history.pushState(null, '', location.href);

    // ✅ Attach ONE back handler only
    window.addEventListener('popstate', this.backHandler);
  }
// exitApp() {
//   const isWebView = this.authService.isWebView();

//   if (isWebView) {
//     // For Capacitor (best)
//     // App.exitApp();

//     // fallback (WebView)
//     console.log('Exit app triggered');
//   } else {
//     window.history.back();
//   }
// }
  



  ngOnDestroy(): void {
     window.removeEventListener('popstate', this.backHandler);
    this.subscription?.unsubscribe();
      this.stopTimer();


        window.removeEventListener('popstate', this.backHandler);
  }
  private loadRememberedEmail(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        this.loginForm.patchValue({
          email: savedEmail,
          rememberMe: true
        });
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  private setupScrollListener(): void {
    // Already handled by @HostListener
  }

  onInputChanges(field: keyof typeof this.formData, event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    this.formData[field] = input.value;
    
    if (field === 'message') {
      this.charCount = input.value.length;
    }
  }

  // Handle form input changes for template-driven form
  onLoginInputChange(field: 'email' | 'password', event: Event): void {
    const input = event.target as HTMLInputElement;
    this.loginData[field] = input.value;
    this.loginError = '';
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.formData.message.length > 500) {
      return;
    }

    this.isSubmitting = true;
    this.submitStatus = 'idle';

    const formBody = new HttpParams()
      .set('name', this.formData.name)
      .set('email', this.formData.email)
      .set('phone', this.formData.phone)
      .set('service', this.formData.service)
      .set('location', this.formData.location)
      .set('message', this.formData.message);

    this.subscription = this.http.post(
      'https://readdy.ai/api/form/d595s5uisj01hmefr1k0',
      formBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    ).subscribe({
      next: () => {
        this.submitStatus = 'success';
        this.formData = {
          name: '',
          email: '',
          phone: '',
          service: '',
          location: '',
          message: ''
        };
        this.charCount = 0;
        this.isSubmitting = false;
      },
      error: () => {
        this.submitStatus = 'error';
        this.isSubmitting = false;
      }
    });
  }



  

startTimer() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.canResend = true;
        this.stopTimer();
      }
    });
  }

stopTimer() {
    this.timerSubscription?.unsubscribe();
  }

focusNext(index: number) {
  const input = this.otpInputs?.toArray()[index];
  if (input) {
    // Remove non-digits from input
    input.nativeElement.value = input.nativeElement.value.replace(/\D/g, '').slice(-1);
    this.otp[index] = input.nativeElement.value; // optional if you want
  }

  // Move to next box
  if (this.otp[index] && index < this.otp.length - 1) {
    this.focusInput(index + 1);
  }
}



trackByIndex(index: number) {
  return index;
}




focusInput(index: number) {
    const input = this.otpInputs?.toArray()[index];
    if (input) input.nativeElement.focus();
  }


onInputChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, '').slice(-1);

  // ✅ STORE the digit
  this.otp[index] = value;
  this.error = '';

  // Move forward
  if (value && index < 5) {
    this.focusInput(index + 1);
  }
}

 onKeyDown(event: KeyboardEvent, index: number) {


  // ⬅️ Move left
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    if (index > 0) {
      this.focusInput(index - 1);
    }
    return;
  }

  // ➡️ Move right
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    if (index < 5) {
      this.focusInput(index + 1);
    }
    return;
  }

  if (event.key === 'Backspace') {
    if (this.otp[index]) {
      // Clear current box
      this.otp[index] = '';
    } else if (index > 0) {
      // Go to previous box
      this.focusInput(index - 1);
      this.otp[index - 1] = '';
    }
  }
}


onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedData = clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    pastedData.split('').forEach((char, i) => {
      this.otp[i] = char;
    });

    setTimeout(() => this.focusInput(Math.min(pastedData.length, 5)), 0);
  }


  // ========== .NET CORE 8 API LOGIN INTEGRATION ==========

onLoginSubmit(event: Event): void {
  event.preventDefault();
  this.loginError = '';
  
  // Mark all fields as touched to show validation errors
  this.loginForm.markAllAsTouched();
  
  // Check if form is valid
  if (this.loginForm.invalid) {
    // Get form errors
    const emailErrors = this.loginForm.get('email')?.errors;
    const passwordErrors = this.loginForm.get('password')?.errors;
    
    if (emailErrors?.['required'] || passwordErrors?.['required']) {
      this.loginError = 'Please fill in all fields';
    } else if (emailErrors?.['email']) {
      this.loginError = 'Please enter a valid email address';
    } else if (passwordErrors?.['minlength']) {
      this.loginError = 'Password must be at least 6 characters';
    } else {
      this.loginError = 'Please check your input';
    }
    
    return;
  }

  this.isLoggingIn = true;

  // Get values from reactive form
  const formValue = this.loginForm.value;
 const loginPayload = {
  username: this.loginForm.value.email,
  password: this.loginForm.value.password
 // captcha: this.loginForm.value.captcha
};


  // Handle remember me functionality
  if (isPlatformBrowser(this.platformId)) {
    if (formValue.rememberMe) {
      localStorage.setItem('rememberedEmail', formValue.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }

  // Make API call to .NET Core 8 backend
//  this.http.post(`${this.apiUrl}/auth/login`, loginPayload, { withCredentials: true })
    this.http.post(`${this.apiUrl}/auth/login`, loginPayload)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoggingIn = false;
        this.handleLoginError(error);
        return throwError(() => error);
      })
    )
    .subscribe({
      next: (response: any) => {
        this.handleLoginSuccess(response);
      },
      error: () => {
        // Error already handled in catchError
          this.loginForm.patchValue({ captcha: '' });
       //  this.refreshCaptcha(); 
         
      }
    });
}

  private handleLoginSuccess(response: any): void {
  this.isLoggingIn = false;

 // console.log('Login response:', response); 

  //  First check mobile verification
  if (!response.mobileVerified && !response.emailVerified) {

    // Store temporary data (DO NOT store token yet)
   this.verificationData = {
  phone: response.phone,
  email: response.email
};
 // console.log('verificationData set:', this.verificationData); //
    this.pendingLoginResponse = response; 
    this.showLoginModal=false;
    this.showVerificationModal = true;

    return; 
  }

  //  If verified → normal login
  if (response.token) {

    if (this.authService) {
      this.authService.saveAuth(
        response.token,
        response.role,
        response.name,
        response.userId
      );
    } else {
      localStorage.setItem('token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    this.closeLoginModal();

    if (this.authService) {
      this.authService.redirectByRole(response.role);
   //  this.authService.redirectByRole(response.role, response.providerType , response.businessUserId ,response.businessUserRole);
    } else {
      window.location.href = '/dashboard';
    }

  } else {
    this.loginError = 'Invalid response from server';
  }
}


  private handleLoginError(error: HttpErrorResponse): void {
    this.isLoggingIn = false;
    
    switch (error.status) {
      case 401:
        this.loginError = 'Invalid email or password';
        break;
      
      //  case 400:
      // if (error.error?.message === 'Invalid captcha') {
      //   this.loginError = 'Invalid captcha. Please try again.';
        
      //   // Clear captcha input
      //   this.loginForm.get('captcha')?.reset();
        
      //   // Refresh captcha image
      //   this.refreshCaptcha();
      // } else {
      //   this.loginError = 'Invalid request. Please check your input';
      // }
      // break;
      case 403:
        this.loginError = 'Account not verified. Please verify your email';
        break;
      case 404:
        this.loginError = 'Account not found. Please register first';
        break;
      case 0:
        this.loginError = 'Cannot connect to server. Please check your connection';
        break;
      case 500:
        this.loginError = 'Server error. Please try again later';
        break;
      default:
        this.loginError = error.error?.message || 'Login failed. Please try again';
        break;
    }
    
    // Log error for debugging
    console.error('Login error:', error);
  }

  // ========== MODAL METHODS ==========

  openLoginModal(): void {
    this.showLoginModal = true;
    this.loginError = '';
    this.loginData = { email: '', password: '' };
  //  this.refreshCaptcha();
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    this.loginData = { email: '', password: '' };
    this.loginError = '';
    this.isLoggingIn = false;


     // Reset full form (best way)
  this.loginForm.reset();

  // Optional: refresh captcha when modal opens next time
//  this.captchaUrl = '';
  }


  
  // ========== FORGOT PASSWORD ==========

 forgotPassword(event: Event) {
  event.preventDefault();
  this.showForgotPasswordModal = true;
  this.forgotPasswordForm.reset();
  this.isSendingOtp = false;
  this.otpMobile = '';
  this.otp = Array(6).fill('');
  this.timer = 60;
  this.canResend = false;
  this.error = '';
  //this.verificationTypes = 'forgot';
}


closeForgotPasswordModal() {
  this.showForgotPasswordModal = false;
  this.showOtpModal = false;

  this.otp = Array(6).fill('');
  this.timer = 30;
  this.canResend = false;
  this.error = '';
  this.otpMobile = '';
 // this.resendCount = 0;

  this.stopTimer();

  // ✅ NOW it's safe
  this.authService.clearRecaptcha();
}

async sendOtp() {
  if (this.forgotPasswordForm.invalid) return;
  this.error = ''; // 🔥 Clear old error
   this.verificationTypes = 'forgot';  // ✅ IMPORTANT

  const mobile = this.forgotPasswordForm.value.mobile;
  this.isSendingOtp = true;

  try {
    // 🔥 STEP 1: Check mobile exists
    const res = await this.authService
      .checkMobileExists(mobile)
      .toPromise();

    if (!res?.exists) {
      this.error = 'Mobile number not registered';
      return;
    }

  
    this.otpMobile = `+91${mobile}`;
    this.showOtpModals = true;
    this.showForgotPasswordModal = false;

      // 🔥 STEP 2: Send OTP via Firebase
    await this.authService.sendOtp(mobile);


    this.startTimer();
    setTimeout(() => this.focusInput(0), 0);


  } catch (e: any) {
    this.error = e.message || 'Failed to send OTP';
  } finally {
    this.isSendingOtp = false;
  }
}

async onResend() {
  if (!this.canResend) return;

  this.canResend = false;
  this.timer = 30;
  this.stopTimer();
  this.startTimer();

  try {
    await this.authService.resendOtp(this.otpMobile.replace('+91', ''));
  } catch (e: any) {
    alert(e.message);
  }
}
showOtpModals = false;


async onVerify() {
  const otpValue = this.otp.join('');
  if (otpValue.length !== 6) return;

  this.isVerifying = true;
  this.error = '';

  try {
    // 1️⃣ Verify Firebase OTP
    await this.authService.verifyOtp(otpValue);

    this.showOtpModal = false;
    this.showOtpModals = false;
    // 🔥 DIFFERENT FLOW BASED ON TYPE
    if (this.verificationTypes === 'forgot') {

      // 👉 Open password popup
      this.showPasswordPopup = true;
       this.showLoginModal = false;

    } 
    else if (this.verificationTypes === 'login') {

      // 👉 Call backend to mark mobile verified
      await this.authService.verifyMobileOnServer(
       this.pendingLoginResponse.userId.toString(),
        this.verificationData.phone
      ).toPromise();

      // 👉 Close verification modal
      this.showVerificationModal = false;

      // 👉 Open login modal again
      this.showLoginModal = true;

      alert('Mobile verified successfully. Please login again.');
    }

  } catch (e: any) {
    this.error = e.message || 'OTP verification failed';
  } finally {
    this.isVerifying = false;
  }
}


async submitNewPassword() {
  this.passwordError = '';

  // 1️⃣ Required check
  if (!this.newPassword?.trim()) {
    this.passwordError = 'Password is required';
    return;
  }

  // 2️⃣ Strong password check
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  if (!strongPasswordRegex.test(this.newPassword)) {
    this.passwordError =
      'Password must include 1 uppercase, 1 number & 1 special character';
    return;
  }

  // 3️⃣ Confirm password required
  if (!this.confirmPassword?.trim()) {
    this.passwordError = 'Confirm password is required';
    return;
  }

  // 4️⃣ Match check
  if (this.newPassword !== this.confirmPassword) {
    this.passwordError = 'Passwords do not match';
    return;
  }

  try {
    await this.authService.updatePasswordByMobile({
      mobile: this.otpMobile.replace('+91', ''),
      newPassword: this.newPassword
    });

    alert('Password updated successfully');

    this.closePasswordPopup();

  } catch (e: any) {
    this.passwordError = e?.error?.message || 'Failed to update password';
  }
}
closePasswordPopup() {
  this.showPasswordPopup = false;
  this.showOtpModals =false;
  this.newPassword = '';
  this.confirmPassword = '';
  this.passwordError = '';
}


async openMobileVerification() {
  this.verificationType = 'mobile';
  this.verificationTypes = 'login';   
  this.otpMobile = this.verificationData?.phone;

  try {
    await this.authService.sendOtp(this.verificationData?.phone);

    // Show OTP step inside verification modal
    this.showOtpModal = true;
  } catch (err) {
    console.error(err);
    alert('Failed to send OTP');
  }
}


closeVerificationModal() {

  // Close UI
  this.showVerificationModal = false;
   this.showLoginModal=true;
  // Optional: clear mobile/email
  this.verificationData.phone = '';
  this.verificationData.email = '';

  // 🔥 CLEAR FIREBASE STATE SAFELY
  this.authService.clearRecaptcha();
}
  // Back from OTP
handleOtpBack() {
  
  this.showOtpModal = false; // hide OTP
  this.authService.clearRecaptcha(); // 🔥 clear Firebase state
     this.showLoginModal=true;
}
   /* OTP VERIFIED */
  onOTPVerified() {
    this.showOtpModal = false;
    this.showVerificationModal = false;
       this.showLoginModal=true;
  }




  // Back from OTP
handleOtpBackotp() {
  
  this.showOtpModal = false; // hide OTP
  this.authService.clearRecaptcha(); // 🔥 clear Firebase state
     this.showLoginModal=false;
      this.showVerificationModal = true;
}


openEmailVerification() {
  if (!this.pendingLoginResponse.email || !this.pendingLoginResponse.userId) {
    alert('Email or User ID missing!');
    return;
  }

  this.verificationType = 'email';

  this.authService.sendEmailOtp({
    userId: this.pendingLoginResponse.userId,
    email: this.pendingLoginResponse.email,
    fullName: this.pendingLoginResponse.name
  }).subscribe({
    next: (res: any) => {
      console.log('Email OTP sent response:', res);

      this.pendingLoginResponse.emailOtpToken = res.token;

      if (!res.token) {
        alert('OTP token not received from server');
        return;
      }
 this.showVerificationModal = false;
    this.showOtpModal = true;
      // ✅ Open modal ONLY after success
     // this.showOtpModals = true;
    },
    error: (err) => {
      console.error('Send email OTP error:', err);
      alert('Failed to send email OTP');
    }
  });
}
// showOtpModals = true;

onOTPVerifiedEmail(event: { otp: string }) {
  if (this.verificationType === 'email') {
    if (!this.pendingLoginResponse.emailOtpToken) {
      alert('OTP token missing!');
      return;
    }

    this.authService.verifyEmailOtp({
      otp: event.otp,
      token: this.pendingLoginResponse.emailOtpToken
    }).subscribe({
      next: () => {
        alert('Email verified successfully!');
       // this.showOtpModals = false;
        this.showOtpModal = false;
        this.showVerificationModal = false;
        this.showLoginModal=true;
        // Mark email verified in local state
       // this.pendingLoginResponse.isEmailVerified = true;
      },
      error: () => {
        alert('Invalid or expired OTP');
      }
    });
  } 
  else if (this.verificationType === 'mobile') {
    this.isMobileVerified = true;
 //   this.showOtpModals = false;
    this.showVerificationModal = false;
     this.showOtpModal = false;
  }
}

isMobileVerified = false;


isMenuOpen = false;

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}

}

// Helper function for RxJS
function throwError(errorFactory: () => any): any {
  return (errorFactory());
}





 