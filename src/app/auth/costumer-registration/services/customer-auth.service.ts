import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerRegistrationResponse, EmailCheckResponse, MobileCheckResponse } from '../../models/customer-register.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private baseUrl = environment.apiBaseUrl + '/auth';

  constructor(private http: HttpClient) {}

  // Customer registration
  registerCustomer(formData: FormData): Observable<CustomerRegistrationResponse> {
    return this.http.post<CustomerRegistrationResponse>(`${this.baseUrl}/register-customer`, formData);
  }

  // Check if mobile is already registered
  checkMobile(mobile: string): Observable<MobileCheckResponse> {
    return this.http.get<MobileCheckResponse>(`${this.baseUrl}/check-mobile-customer`, {
      params: { mobile }
    });
  }

  // Get states for dropdown
  getStates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/states`);
  }

  // Get cities by state
  getCities(stateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cities/${stateId}`);
  }

  // Get areas by city
  getAreasByCity(cityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/areas/${cityId}`);
  }

    // Check if email is already registered
  checkEmail(email: string): Observable<EmailCheckResponse> {
    return this.http.get<EmailCheckResponse>(`${this.baseUrl}/check-email-customer`, {
      params: { email }
    });
  }
}