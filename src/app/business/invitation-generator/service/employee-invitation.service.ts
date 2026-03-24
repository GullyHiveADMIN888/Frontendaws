import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { environment } from '../../../../environments/environment.prod';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

export interface GenerateInvitationDto {
  role?: string;
  email?: string;
  regionId?: number;
}

export interface EmployeeInvitationResponse {
  id: number;
  inviteToken: string;
  inviteLink: string;
  businessId: number;
  businessLegalName: string;
  ownerUserId: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  emailSent?: boolean;  
  email?: string;     
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
}

export interface InviterAddress {
  line1: string;
  line2: string;
  locality: string;
  landmark: string;
  cityName: string;
  stateName: string;
  areaName: string;
  pincode: string;
  fullAddress: string;
}

export interface EmployeeInvitationDetails {
  id: number;
  inviteToken: string;
  businessId: number;
  businessLegalName: string;
  ownerUserId: number;
  inviterAddress: InviterAddress;
  status: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface ValidateInvitationResponse {
  isValid: boolean;
  status: string;
  message: string;
}

export interface RegionDto {
  id: number;
  name: string;
  regionType: string;
  parentRegionId: number | null;
  cityId: number | null;
  cityName: string | null;
  parentRegionName: string | null;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class EmployeeInvitationService {
  private apiUrl = `${environment.apiBaseUrl}/member-invitations`;

  constructor(private http: HttpClient) { }

  generateInvitation(dto: GenerateInvitationDto): Observable<EmployeeInvitationResponse> {
    return this.http.post<EmployeeInvitationResponse>(`${this.apiUrl}/generate`, dto);
  }

  validateInvitation(token: string): Observable<ValidateInvitationResponse> {
    return this.http.get<ValidateInvitationResponse>(`${this.apiUrl}/validate/${token}`);
  }

  getInvitationDetails(token: string): Observable<EmployeeInvitationDetails> {
    return this.http.get<EmployeeInvitationDetails>(`${this.apiUrl}/details/${token}`);
  }

  sendInvitationEmail(token: string, email: string): Observable<SendEmailResponse> {
    return this.http.post<SendEmailResponse>(`${this.apiUrl}/send-email`, {
      inviteToken: token,
      email: email
    });
  }
  submitEmployeeRegistration(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-member`, formData);
  }

  getRegions(searchTerm: string = '', limit: number = 20): Observable<RegionDto[]> {
  let params = new HttpParams()
    .set('search', searchTerm || '')
    .set('limit', limit.toString())
    .set('regionType', 'city')
    .set('page', '1');
  
  return this.http.get<any>(`${environment.apiBaseUrl}/provider_User_Admin/regions/search`, { params })
    .pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      })
    );
}
}