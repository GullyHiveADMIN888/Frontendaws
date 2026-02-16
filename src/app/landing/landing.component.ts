
import { Auth, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';
import { RecaptchaVerifier } from 'firebase/auth';

import {
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
}  from '@angular/core';
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval,Subscription } from 'rxjs';
 // import { environment } from '../../environments/environment';
 import { environment } from '../../environments/environment.prod';


import {  Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {  isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';


import {  HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
//import { OTPVerificationComponent } from '../auth/otp-verification/otp-verification.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule]
})
export class LandingPageComponent implements OnInit, OnDestroy {
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
 
// OTP Modal state

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


  // API Configuration
  private readonly apiUrl = `${environment.apiBaseUrl}`; 
  // Common .NET Core ports: 7045, 5000, 5001, 7245


showPasswordPopup = false;
newPassword = '';
confirmPassword = '';
passwordError = '';

  popularServices = [
    { 
      name: 'Home Cleaning', 
      icon: 'ri-home-smile-line',
      image: 'https://readdy.ai/api/search-image?query=professional%20home%20cleaning%20service%20with%20modern%20equipment%20and%20cleaning%20supplies%20in%20bright%20clean%20interior%2C%20simple%20minimalist%20background%20with%20natural%20lighting%20and%20organized%20workspace%20aesthetic&width=120&height=120&seq=pop-home-cleaning-001&orientation=squarish'
    },
    { 
      name: 'AC Repair', 
      icon: 'ri-temp-cold-line',
      image: 'https://readdy.ai/api/search-image?query=air%20conditioner%20repair%20technician%20with%20professional%20tools%20working%20on%20AC%20unit%2C%20simple%20clean%20background%20with%20modern%20equipment%20and%20technical%20workspace%20aesthetic&width=120&height=120&seq=pop-ac-repair-002&orientation=squarish'
    },
    { 
      name: 'Electrician', 
      icon: 'ri-flashlight-line',
      image: 'https://readdy.ai/api/search-image?query=professional%20electrician%20with%20electrical%20tools%20and%20wiring%20equipment%20in%20modern%20workspace%2C%20simple%20clean%20background%20with%20safety%20gear%20and%20organized%20technical%20setup%20aesthetic&width=120&height=120&seq=pop-electrician-003&orientation=squarish'
    },
    { 
      name: 'Plumber', 
      icon: 'ri-drop-line',
      image: 'https://readdy.ai/api/search-image?query=professional%20plumber%20with%20plumbing%20tools%20and%20pipes%20in%20clean%20workspace%2C%20simple%20minimalist%20background%20with%20modern%20equipment%20and%20organized%20technical%20aesthetic&width=120&height=120&seq=pop-plumber-004&orientation=squarish'
    },
    { 
      name: 'Pest Control', 
      icon: 'ri-bug-line',
      image: 'https://readdy.ai/api/search-image?query=pest%20control%20specialist%20in%20protective%20gear%20with%20professional%20equipment%20and%20safety%20tools%2C%20simple%20clean%20background%20with%20modern%20workspace%20and%20organized%20setup%20aesthetic&width=120&height=120&seq=pop-pest-control-005&orientation=squarish'
    },
    { 
      name: 'Painting', 
      icon: 'ri-paint-brush-line',
      image: 'https://readdy.ai/api/search-image?query=professional%20painter%20with%20painting%20tools%20brushes%20and%20color%20palette%20in%20clean%20workspace%2C%20simple%20minimalist%20background%20with%20modern%20equipment%20and%20artistic%20setup%20aesthetic&width=120&height=120&seq=pop-painting-006&orientation=squarish'
    }
  ];

  serviceCategories = [
    {
      title: 'Home Cleaning & Housekeeping',
      description: 'Professional cleaning services for homes and small commercial spaces',
      servicesCount: '8 services available',
      subcategories: [
        { name: 'Deep Cleaning', image: 'https://readdy.ai/api/search-image?query=professional%20deep%20cleaning%20service%20with%20modern%20equipment%20in%20bright%20home%20interior&width=200&height=150&seq=deep-cleaning-sub-001&orientation=landscape' },
        { name: 'Regular Cleaning', image: 'https://readdy.ai/api/search-image?query=regular%20home%20cleaning%20service%20with%20cleaning%20supplies%20in%20modern%20home&width=200&height=150&seq=regular-cleaning-sub-002&orientation=landscape' },
        { name: 'Kitchen Cleaning', image: 'https://readdy.ai/api/search-image?query=professional%20kitchen%20cleaning%20service%20in%20modern%20kitchen%20with%20clean%20surfaces&width=200&height=150&seq=kitchen-cleaning-sub-003&orientation=landscape' },
        { name: 'Bathroom Cleaning', image: 'https://readdy.ai/api/search-image?query=bathroom%20cleaning%20service%20with%20sparkling%20clean%20modern%20bathroom&width=200&height=150&seq=bathroom-cleaning-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Repairs & Maintenance',
      description: 'Expert electricians, plumbers, and carpenters for all home repair needs',
      servicesCount: '7 services available',
      subcategories: [
        { name: 'Electrical Work', image: 'https://readdy.ai/api/search-image?query=electrician%20working%20on%20electrical%20panel%20with%20professional%20tools&width=200&height=150&seq=electrical-sub-001&orientation=landscape' },
        { name: 'Plumbing', image: 'https://readdy.ai/api/search-image?query=plumber%20fixing%20pipes%20with%20professional%20plumbing%20tools&width=200&height=150&seq=plumbing-sub-002&orientation=landscape' },
        { name: 'Carpentry', image: 'https://readdy.ai/api/search-image?query=carpenter%20working%20on%20wooden%20furniture%20with%20woodworking%20tools&width=200&height=150&seq=carpentry-sub-003&orientation=landscape' },
        { name: 'Door & Window', image: 'https://readdy.ai/api/search-image?query=technician%20installing%20door%20and%20window%20in%20modern%20home&width=200&height=150&seq=door-window-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Appliance Repair & Service',
      description: 'Complete repair and maintenance for all home appliances',
      servicesCount: '10 services available',
      subcategories: [
        { name: 'AC Repair', image: 'https://readdy.ai/api/search-image?query=technician%20repairing%20air%20conditioner%20unit%20with%20professional%20tools&width=200&height=150&seq=ac-repair-sub-001&orientation=landscape' },
        { name: 'Refrigerator', image: 'https://readdy.ai/api/search-image?query=technician%20servicing%20refrigerator%20with%20diagnostic%20equipment&width=200&height=150&seq=refrigerator-sub-002&orientation=landscape' },
        { name: 'Washing Machine', image: 'https://readdy.ai/api/search-image?query=technician%20repairing%20washing%20machine%20with%20tools&width=200&height=150&seq=washing-machine-sub-003&orientation=landscape' },
        { name: 'Microwave', image: 'https://readdy.ai/api/search-image?query=technician%20servicing%20microwave%20oven%20in%20modern%20kitchen&width=200&height=150&seq=microwave-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Painting & Home Improvement',
      description: 'Transform your space with professional painting and improvement services',
      servicesCount: '7 services available',
      subcategories: [
        { name: 'Interior Painting', image: 'https://readdy.ai/api/search-image?query=painter%20painting%20interior%20walls%20with%20roller%20in%20modern%20room&width=200&height=150&seq=interior-painting-sub-001&orientation=landscape' },
        { name: 'Exterior Painting', image: 'https://readdy.ai/api/search-image?query=painters%20working%20on%20exterior%20house%20painting%20with%20scaffolding&width=200&height=150&seq=exterior-painting-sub-002&orientation=landscape' },
        { name: 'Waterproofing', image: 'https://readdy.ai/api/search-image?query=waterproofing%20specialist%20applying%20waterproof%20coating%20on%20walls&width=200&height=150&seq=waterproofing-sub-003&orientation=landscape' },
        { name: 'Wall Texture', image: 'https://readdy.ai/api/search-image?query=professional%20applying%20decorative%20wall%20texture%20in%20modern%20interior&width=200&height=150&seq=wall-texture-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Pest Control',
      description: 'Comprehensive pest control solutions for homes and commercial spaces',
      servicesCount: '7 services available',
      subcategories: [
        { name: 'Cockroach Control', image: 'https://readdy.ai/api/search-image?query=pest%20control%20specialist%20treating%20for%20cockroaches%20in%20kitchen&width=200&height=150&seq=cockroach-control-sub-001&orientation=landscape' },
        { name: 'Termite Control', image: 'https://readdy.ai/api/search-image?query=termite%20control%20treatment%20being%20applied%20to%20wooden%20structures&width=200&height=150&seq=termite-control-sub-002&orientation=landscape' },
        { name: 'Bed Bug Control', image: 'https://readdy.ai/api/search-image?query=bed%20bug%20treatment%20service%20in%20bedroom%20with%20professional%20equipment&width=200&height=150&seq=bedbug-control-sub-003&orientation=landscape' },
        { name: 'Rodent Control', image: 'https://readdy.ai/api/search-image?query=rodent%20control%20specialist%20setting%20up%20safe%20traps%20in%20home&width=200&height=150&seq=rodent-control-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Packers & Movers',
      description: 'Reliable relocation services for homes, offices, and vehicles',
      servicesCount: '6 services available',
      subcategories: [
        { name: 'Home Shifting', image: 'https://readdy.ai/api/search-image?query=movers%20loading%20household%20furniture%20into%20moving%20truck&width=200&height=150&seq=home-shifting-sub-001&orientation=landscape' },
        { name: 'Office Relocation', image: 'https://readdy.ai/api/search-image?query=professional%20movers%20relocating%20office%20equipment%20and%20furniture&width=200&height=150&seq=office-relocation-sub-002&orientation=landscape' },
        { name: 'Vehicle Transport', image: 'https://readdy.ai/api/search-image?query=car%20being%20loaded%20onto%20vehicle%20transport%20carrier&width=200&height=150&seq=vehicle-transport-sub-003&orientation=landscape' },
        { name: 'Packing Services', image: 'https://readdy.ai/api/search-image?query=professional%20packers%20carefully%20wrapping%20and%20boxing%20items&width=200&height=150&seq=packing-services-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Beauty & Grooming at Home',
      description: 'Professional salon services delivered to your doorstep',
      servicesCount: '4 services available',
      subcategories: [
        { name: 'Hair Styling', image: 'https://readdy.ai/api/search-image?query=professional%20hairstylist%20styling%20hair%20at%20home%20with%20tools&width=200&height=150&seq=hair-styling-sub-001&orientation=landscape' },
        { name: 'Facial & Skincare', image: 'https://readdy.ai/api/search-image?query=beautician%20providing%20facial%20treatment%20at%20home%20with%20products&width=200&height=150&seq=facial-skincare-sub-002&orientation=landscape' },
        { name: 'Makeup', image: 'https://readdy.ai/api/search-image?query=makeup%20artist%20applying%20professional%20makeup%20at%20home&width=200&height=150&seq=makeup-sub-003&orientation=landscape' },
        { name: 'Spa & Massage', image: 'https://readdy.ai/api/search-image?query=massage%20therapist%20providing%20relaxing%20spa%20treatment%20at%20home&width=200&height=150&seq=spa-massage-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Home Health & Elderly Care',
      description: 'Compassionate healthcare services in the comfort of your home',
      servicesCount: '6 services available',
      subcategories: [
        { name: 'Nursing Care', image: 'https://readdy.ai/api/search-image?query=professional%20nurse%20providing%20medical%20care%20at%20home&width=200&height=150&seq=nursing-care-sub-001&orientation=landscape' },
        { name: 'Physiotherapy', image: 'https://readdy.ai/api/search-image?query=physiotherapist%20helping%20patient%20with%20exercises%20at%20home&width=200&height=150&seq=physiotherapy-sub-002&orientation=landscape' },
        { name: 'Elderly Care', image: 'https://readdy.ai/api/search-image?query=caregiver%20assisting%20elderly%20person%20with%20daily%20activities&width=200&height=150&seq=elderly-care-sub-003&orientation=landscape' },
        { name: 'Baby Care', image: 'https://readdy.ai/api/search-image?query=professional%20nanny%20caring%20for%20baby%20in%20nursery&width=200&height=150&seq=baby-care-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Interior & Renovation',
      description: 'Complete interior design and renovation solutions for your home',
      servicesCount: '7 services available',
      subcategories: [
        { name: 'Interior Design', image: 'https://readdy.ai/api/search-image?query=interior%20designer%20presenting%20design%20plans%20for%20modern%20home&width=200&height=150&seq=interior-design-sub-001&orientation=landscape' },
        { name: 'Modular Kitchen', image: 'https://readdy.ai/api/search-image?query=modern%20modular%20kitchen%20installation%20with%20sleek%20cabinets&width=200&height=150&seq=modular-kitchen-sub-002&orientation=landscape' },
        { name: 'False Ceiling', image: 'https://readdy.ai/api/search-image?query=workers%20installing%20modern%20false%20ceiling%20with%20lighting&width=200&height=150&seq=false-ceiling-sub-003&orientation=landscape' },
        { name: 'Flooring', image: 'https://readdy.ai/api/search-image?query=professional%20installing%20modern%20flooring%20in%20home%20interior&width=200&height=150&seq=flooring-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Home Security & Smart Devices',
      description: 'Advanced security systems and smart home technology installation',
      servicesCount: '5 services available',
      subcategories: [
        { name: 'CCTV Installation', image: 'https://readdy.ai/api/search-image?query=technician%20installing%20CCTV%20security%20camera%20system&width=200&height=150&seq=cctv-installation-sub-001&orientation=landscape' },
        { name: 'Smart Locks', image: 'https://readdy.ai/api/search-image?query=smart%20door%20lock%20installation%20with%20digital%20keypad&width=200&height=150&seq=smart-locks-sub-002&orientation=landscape' },
        { name: 'Home Automation', image: 'https://readdy.ai/api/search-image?query=smart%20home%20automation%20system%20with%20control%20panel&width=200&height=150&seq=home-automation-sub-003&orientation=landscape' },
        { name: 'Alarm Systems', image: 'https://readdy.ai/api/search-image?query=security%20alarm%20system%20installation%20in%20modern%20home&width=200&height=150&seq=alarm-systems-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Vehicle Services',
      description: 'Convenient doorstep vehicle maintenance and repair services',
      servicesCount: '4 services available',
      subcategories: [
        { name: 'Car Wash', image: 'https://readdy.ai/api/search-image?query=professional%20car%20washing%20service%20at%20doorstep&width=200&height=150&seq=car-wash-sub-001&orientation=landscape' },
        { name: 'Bike Service', image: 'https://readdy.ai/api/search-image?query=mechanic%20servicing%20motorcycle%20with%20tools%20and%20parts&width=200&height=150&seq=bike-service-sub-002&orientation=landscape' },
        { name: 'Car Repair', image: 'https://readdy.ai/api/search-image?query=auto%20mechanic%20repairing%20car%20engine%20with%20diagnostic%20tools&width=200&height=150&seq=car-repair-sub-003&orientation=landscape' },
        { name: 'Detailing', image: 'https://readdy.ai/api/search-image?query=professional%20car%20detailing%20service%20with%20polishing%20equipment&width=200&height=150&seq=detailing-sub-004&orientation=landscape' }
      ]
    },
    {
      title: 'Professional Services',
      description: 'Expert legal, financial, and business consultation services',
      servicesCount: '7 services available',
      subcategories: [
        { name: 'Legal Consultation', image: 'https://readdy.ai/api/search-image?query=lawyer%20providing%20legal%20consultation%20with%20documents&width=200&height=150&seq=legal-consultation-sub-001&orientation=landscape' },
        { name: 'Tax Filing', image: 'https://readdy.ai/api/search-image?query=accountant%20working%20on%20tax%20filing%20documents%20and%20calculator&width=200&height=150&seq=tax-filing-sub-002&orientation=landscape' },
        { name: 'Business Consulting', image: 'https://readdy.ai/api/search-image?query=business%20consultant%20presenting%20strategy%20to%20clients&width=200&height=150&seq=business-consulting-sub-003&orientation=landscape' },
        { name: 'Financial Planning', image: 'https://readdy.ai/api/search-image?query=financial%20advisor%20discussing%20investment%20plans%20with%20charts&width=200&height=150&seq=financial-planning-sub-004&orientation=landscape' }
      ]
    }
  ];

  testimonials = [
    {
      name: 'Raven Green',
      role: 'Marketing Director',
      company: 'TechStart Solutions',
      content: 'GULLYHIVE connected us with an amazing digital marketing team that increased our online leads by 300%. The quality of professionals on this platform is outstanding.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20businesswoman%20with%20confident%20smile%20in%20modern%20office%2C%20European%20features%2C%20business%20attire%2C%20natural%20lighting&width=200&height=200&seq=testimonial-001&orientation=squarish',
      rating: 5
    },
    {
      name: 'Mark Johnson',
      role: 'CEO',
      company: 'Johnson & Associates',
      content: 'Finding the right web developer was crucial for our business. GULLYHIVE made it simple and we found someone who exceeded our expectations. Highly recommended!',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20businessman%20with%20friendly%20expression%20in%20corporate%20setting%2C%20European%20features%2C%20formal%20business%20attire%2C%20natural%20lighting&width=200&height=200&seq=testimonial-002&orientation=squarish',
      rating: 5
    },
    {
      name: 'Sophie Williams',
      role: 'Founder',
      company: 'Creative Boutique',
      content: 'The brand designer we found through GULLYHIVE transformed our entire visual identity. The process was smooth and the results speak for themselves.',
      avatar: 'https://readdy.ai/api/search-image?query=creative%20female%20entrepreneur%20with%20artistic%20background%20in%20modern%20workspace%2C%20European%20features%2C%20stylish%20business%20casual%2C%20natural%20lighting&width=200&height=200&seq=testimonial-003&orientation=squarish',
      rating: 5
    }
  ];

  private subscription?: Subscription;


//  constructor(
//     private http: HttpClient,
//     private fb: FormBuilder,
//     private authService: AuthService,
//     @Inject(PLATFORM_ID) private platformId: any
//   ) {
//     // Initialize login form
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       rememberMe: [false]
//     });
//   }

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private auth: Auth, @Inject(PLATFORM_ID) private platformId: any) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });


  // Forgot password form
  this.forgotPasswordForm = this.fb.group({
    mobile: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]] // Indian 10-digit mobile number
  });
}
  //   @Input() mobile = '';
  // @Output() onVerified = new EventEmitter<void>();
  // @Output() onBack = new EventEmitter<void>();
  

  // ngOnInit(): void {
  //   this.setupScrollListener();
  //   this.loadRememberedEmail();
  // }

  // ngOnDestroy(): void {
  //   this.subscription?.unsubscribe();
  // }

    ngOnInit(): void {
    this.setupScrollListener();
    this.loadRememberedEmail();
    //  if (isPlatformBrowser(this.platformId)) {
    //   this.startTimer();
    //   setTimeout(() => this.focusInput(0), 0);
    // }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
      this.stopTimer();
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

  nextTestimonial(): void {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
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
};

this.http.post(`${this.apiUrl}/auth/login`, loginPayload)
  .subscribe({
    next: res => this.handleLoginSuccess(res),
    error: err => this.handleLoginError(err)
  });

 
  

  // Handle remember me functionality
  if (isPlatformBrowser(this.platformId)) {
    if (formValue.rememberMe) {
      localStorage.setItem('rememberedEmail', formValue.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }

  // Make API call to .NET Core 8 backend
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
      }
    });
}
  private handleLoginSuccess(response: any): void {
    this.isLoggingIn = false;
    
    if (response.token) {
      // Store authentication data using your AuthService
      if (this.authService) {
        this.authService.saveAuth(response.token, response.role, response.name, response.userId);
      } else {
        // Fallback: Store directly in localStorage
        localStorage.setItem('token', response.token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      // Close modal
      this.closeLoginModal();
      
      // Redirect user based on role
      if (this.authService) {
        this.authService.redirectByRole(response.role);
      } else {
        // Fallback redirect
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
      case 400:
        this.loginError = 'Invalid request. Please check your input';
        break;
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
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    this.loginData = { email: '', password: '' };
    this.loginError = '';
    this.isLoggingIn = false;
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
}

// closeForgotPasswordModal() {
//   this.showForgotPasswordModal = false;
//    this.showOtpModal = false;
//   this.otp = Array(6).fill('');
//   this.timer = 60;
//   this.canResend = false;
//   this.error = '';
//   this.otpMobile = '';
//   this.stopTimer();
// }
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

// async sendOtp() {
//   if (this.forgotPasswordForm.invalid) return;

//   this.isSendingOtp = true;
//   const mobile = this.forgotPasswordForm.value.mobile;

//   try {
//     await this.authService.sendOtp(mobile);

//     this.otpMobile = `+91${mobile}`;
//     this.showOtpModal = true;
//     this.showForgotPasswordModal = false;

//     this.startTimer();
//     setTimeout(() => this.focusInput(0), 0);
//   } catch (e: any) {
//     alert(e.message);
//   } finally {
//     this.isSendingOtp = false;
//   }
// }
async sendOtp() {
  if (this.forgotPasswordForm.invalid) return;

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

    // 🔥 STEP 2: Send OTP via Firebase
    await this.authService.sendOtp(mobile);

    this.otpMobile = `+91${mobile}`;
    this.showOtpModal = true;
    this.showForgotPasswordModal = false;

    this.startTimer();
    setTimeout(() => this.focusInput(0), 0);

  } catch (e: any) {
    this.error = e.message || 'Failed to send OTP';
  } finally {
    this.isSendingOtp = false;
  }
}


// async onVerify() {
//   const otpValue = this.otp.join('');
//   if (otpValue.length !== 6) return;

//   try {
//     await this.authService.verifyOtp(otpValue);
//     alert('OTP verified!');
//   } catch {
//     this.error = 'Invalid OTP';
//   }
// }



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

// async onVerify() {
//   const otpValue = this.otp.join('');
//   if (otpValue.length !== 6) return;

//   this.isVerifying = true;

//   try {
//     // 1️⃣ Verify OTP via Firebase
//     await this.authService.verifyOtp(otpValue);

//     // 2️⃣ Call backend to reset password
//     const newPassword = await this.authService.resetPasswordByMobile(
//       this.otpMobile.replace('+91', '')
//     );

//     // 3️⃣ Send new password via Firebase SMS
//     const appVerifier = this.authService.recaptchaVerifier!;
//     await signInWithPhoneNumber(this.authService.auth, this.otpMobile, appVerifier)
//       .then((confirmationResult) => {
//         confirmationResult.confirm(newPassword); // Optional if you want SMS to show new password
//       });

//     alert('New password sent to your mobile number');
//     this.showOtpModal = false;

//   } catch (e: any) {
//     this.error = e.message || 'OTP verification failed';
//   } finally {
//     this.isVerifying = false;
//   }
// }
async onVerify() {
  const otpValue = this.otp.join('');
  if (otpValue.length !== 6) return;

  this.isVerifying = true;
  this.error = '';

  try {
    // 1️⃣ Verify OTP via Firebase
    await this.authService.verifyOtp(otpValue);

    // ✅ CLOSE OTP MODAL
    this.showOtpModal = false;

    // ✅ OPEN PASSWORD POPUP
    this.showPasswordPopup = true;

  } catch (e: any) {
    this.error = e.message || 'OTP verification failed';
  } finally {
    this.isVerifying = false;
  }
}

async submitNewPassword() {
  this.passwordError = '';

  if (!this.newPassword || this.newPassword.length < 6) {
    this.passwordError = 'Password must be at least 6 characters';
    return;
  }

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
    this.passwordError = e.message || 'Failed to update password';
  }
}
closePasswordPopup() {
  this.showPasswordPopup = false;
  this.newPassword = '';
  this.confirmPassword = '';
  this.passwordError = '';
}

 
}

// Helper function for RxJS
function throwError(errorFactory: () => any): any {
  return (errorFactory());
}





 
