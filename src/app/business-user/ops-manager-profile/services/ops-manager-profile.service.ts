import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface OpsManagerProfile {
  userId: number;
  name: string;
  mobile: string;
  email: string;
  mobileVerified: boolean;
  emailVerified: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  mobile: string;
  email: string;
  password?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: OpsManagerProfile;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdateMobileRequest {
  mobile: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OpsManagerProfileService {
  private apiUrl = `${environment.apiBaseUrl}/business-user/ops-manager/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ success: boolean; data: OpsManagerProfile }> {
    return this.http.get<{ success: boolean; data: OpsManagerProfile }>(`${this.apiUrl}`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.put<UpdateProfileResponse>(`${this.apiUrl}`, request);
  }

  updateEmail(request: UpdateEmailRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/update-email`, request);
  }

  // Update mobile (backend only - without OTP verification)
  updateMobile(request: UpdateMobileRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/update-mobile`, request);
  }
}