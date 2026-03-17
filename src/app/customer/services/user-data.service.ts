// src/app/customer/services/user-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment.prod';

export interface UserData {
  id: number;
  phone: string;
  email: string | null;
  firebaseUid: string | null;
  displayName: string | null;
  preferredLanguage: string | null;
  defaultCityId: number | null;
  defaultCityName: string | null;
  isActive: boolean;
  marketingOptIn: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  blockReason: string | null;
  deletedAt: string | null;
  phoneE164: string;
  profilePhotoUrl: string | null;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  // Add a computed property for full image URL
  fullProfilePhotoUrl?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private apiUrl = `${environment.apiBaseUrl}/customer/user-data`;
  private assetUrl = environment.assetUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMyData(): Observable<UserData | null> {
    // Get token from localStorage directly
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<UserData>(this.apiUrl, { headers }).pipe(
      tap(userData => {
        // Construct full image URL if profile photo exists
        if (userData.profilePhotoUrl) {
          // Make sure the URL starts with a slash for proper concatenation
          const photoPath = userData.profilePhotoUrl.startsWith('/') 
            ? userData.profilePhotoUrl 
            : `/${userData.profilePhotoUrl}`;
          userData.fullProfilePhotoUrl = `${this.assetUrl}${photoPath}`;
        }
        
        // Save to localStorage for quick access
        this.saveUserDataToLocalStorage(userData);
      }),
      catchError(error => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    );
  }

  private saveUserDataToLocalStorage(userData: UserData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userId', userData.id.toString());
    localStorage.setItem('customerId', userData.id.toString());
    localStorage.setItem('name', userData.displayName || 'Customer');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('phone', userData.phone || '');
    if (userData.fullProfilePhotoUrl) {
      localStorage.setItem('profilePicture', userData.fullProfilePhotoUrl);
    } else if (userData.profilePhotoUrl) {
      // Fallback: construct URL if fullProfilePhotoUrl wasn't set
      const photoPath = userData.profilePhotoUrl.startsWith('/') 
        ? userData.profilePhotoUrl 
        : `/${userData.profilePhotoUrl}`;
      localStorage.setItem('profilePicture', `${this.assetUrl}${photoPath}`);
    }
  }

  getUserDataFromStorage(): UserData | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      // Ensure full image URL is set when retrieving from storage
      if (parsed.profilePhotoUrl && !parsed.fullProfilePhotoUrl) {
        const photoPath = parsed.profilePhotoUrl.startsWith('/') 
          ? parsed.profilePhotoUrl 
          : `/${parsed.profilePhotoUrl}`;
        parsed.fullProfilePhotoUrl = `${this.assetUrl}${photoPath}`;
      }
      return parsed;
    }
    return null;
  }

  clearUserData() {
    localStorage.removeItem('userData');
  }
}