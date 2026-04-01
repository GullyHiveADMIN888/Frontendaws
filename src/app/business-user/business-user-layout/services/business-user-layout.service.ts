import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface OpsManagerProfile {
  userId: number;
  name: string;
  mobile: string;
  email: string;
  mobileVerified: boolean;
  emailVerified: boolean;
}

export interface OpsManagerProfileResponse {
  success: boolean;
  data: OpsManagerProfile;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessUserLayoutService {
  private apiUrl = `${environment.apiBaseUrl}/business-user/ops-manager`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<OpsManagerProfile> {
    return this.http
      .get<OpsManagerProfileResponse>(`${this.apiUrl}/profile`)
      .pipe(map(res => res.data));
  }
}
