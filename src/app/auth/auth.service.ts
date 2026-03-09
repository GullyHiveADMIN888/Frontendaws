import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

 // import { environment } from '../../environments/environment'
  import { environment } from '../../environments/environment.prod';



import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from '@angular/fire/auth';

// For seller not call by url
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

interface RegistrationResponse {
  userId: string;
  token: string;
  role: string;
  name?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })



export class AuthService implements CanActivate {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  public recaptchaVerifier?: RecaptchaVerifier;
  private confirmationResult?: ConfirmationResult;



  constructor(private http: HttpClient, private router: Router, public auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object) { }


  // For seller not call by url
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      // No token → redirect to login
      this.router.navigate(['/login']);
      return false;
    }

    // Optional: check role or expiry here
    return true;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      username,
      password
    });
  }

  // Register

  submitRegistration(formData: FormData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, formData);
  }

  // auth.service.ts
  saveAuth(token: string, role: string, name?: string, userId?: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId || ''); // Store ID
    if (name) localStorage.setItem('name', name);
  }

  // redirectByRole(role: string) {
  //   const routes: Record<string, string> = {
  //     Admin: '/admin',
  //     SuperAdmin: '/admin',
  //     Buyer: '/buyer',
  //     Seller: '/seller'
  //   };

  //   this.router.navigate([routes[role] ?? '/login']);
  // }

  redirectByRole(role: string, providerType?: string | null) {
  const routes: Record<string, string> = {
    Admin: '/admin',
    SuperAdmin: '/admin',
    Buyer: '/buyer'
  };

  // Special case for Seller
  if (role === 'Seller') {

    if (providerType === 'business') {
      this.router.navigate(['/business']);
      return;
    }

    // default seller (individual)
    this.router.navigate(['/seller']);
    return;
  }

  this.router.navigate([routes[role] ?? '/login']);
}

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getRole() {
    return localStorage.getItem('role');
  }
  // getter for userId
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
  // Service Categories APIs
  getParentCategories(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/parents`,
    );
  }
  //`${environment.apiBaseUrl}/parents`
  getSubCategories(parentId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/${parentId}/children`
    );
  }


  getStates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/states`);
  }

  getCities(stateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cities/${stateId}`);
  }

  getAreasByCity(cityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/areas/${cityId}`);
  }
  getHowKnow(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/how-to-know`);
  }

  checkMobileExists(mobile: string) {
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/check-mobile`,
      { params: { mobile } }
    );
  }
   checkEmailExists(email: string) {
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/check-email`,
      { params: { email } }
    );
  }
  // AuthService.ts
  updatePasswordByMobile(data: { mobile: string; newPassword: string }) {
    return this.http.post(`${this.apiUrl}/update-password`, data).toPromise();
  }

  async verifyOtp(otp: string) {
    if (!this.confirmationResult) {
      throw new Error('OTP not requested');
    }

    const result = await this.confirmationResult.confirm(otp);

    // 🔥 VERY IMPORTANT
    this.clearRecaptcha();

    return result;
  }
  private async initRecaptcha(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.recaptchaVerifier) {
      return; // ✅ already rendered
    }

    this.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha-container',
      { size: 'invisible' }
    );

    await this.recaptchaVerifier.render();
  }
  async sendOtp(mobile: string): Promise<void> {
    await this.initRecaptcha();

    const phoneNumber = `+91${mobile}`;
    this.confirmationResult = await signInWithPhoneNumber(
      this.auth,
      phoneNumber,
      this.recaptchaVerifier!
    );
  }
  async resendOtp(mobile: string): Promise<void> {
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }

    const phoneNumber = `+91${mobile}`;
    this.confirmationResult = await signInWithPhoneNumber(
      this.auth,
      phoneNumber,
      this.recaptchaVerifier!
    );
  }
  clearRecaptcha() {
    this.recaptchaVerifier?.clear();
    this.recaptchaVerifier = undefined;
    this.confirmationResult = undefined;
  }

  verifyMobileOnServer(userId: string, phone: string) {
    console.log('verifyMobileOnServer called with:', userId, phone);

    return this.http.post(`${this.apiUrl}/verify-mobile`, {
      userId,
      phone
    });
  }
  // 🔹 Send Email OTP
  sendEmailOtp(payload: { userId: number; email: string; fullName: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/send-email-otp`, payload);
  }

  // 🔹 Verify Email OTP
  verifyEmailOtp(payload: { otp: string; token: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email-otp`, payload);
  }

}

