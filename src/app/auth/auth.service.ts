import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
 // import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';



import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from '@angular/fire/auth';

  



@Injectable({ providedIn: 'root' })



export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

   private recaptchaVerifier?: RecaptchaVerifier;
  private confirmationResult?: ConfirmationResult;



  constructor(private http: HttpClient, private router: Router, private auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      username,
      password
    });
  }

  // Register
  
submitRegistration(formData: FormData) {
  return this.http.post(`${this.apiUrl}/register`, formData);
}






  // auth.service.ts
saveAuth(token: string, role: string, name?: string, userId?: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('userId', userId || ''); // Store ID
  if (name) localStorage.setItem('name', name);
}



  redirectByRole(role: string) {
    const routes: Record<string, string> = {
      Admin: '/admin',
      SuperAdmin: '/admin',
      Buyer: '/buyer',
      Seller: '/seller'
    };

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

// AuthService.ts
getStates(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/states`);
}

getCities(stateId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/cities/${stateId}`);
}

  /** 🔹 Verify OTP */
  async verifyOtp(otp: string) {
    if (!this.confirmationResult) {
      throw new Error('OTP not requested');
    }
    return this.confirmationResult.confirm(otp);
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

}

