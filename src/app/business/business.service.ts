import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
//  import { environment } from '../../environments/environment.prod';
import { environment } from '../../environments/environment';


export interface DashboardData {
 businessId: number;
  name: string;
  email: string;
  profilePictureUrl?: string; 
  // ✅ Wallet balances
  totalBalance?: number;
  cashableBalance?: number;
  nonCashableBalance?: number;
}

@Injectable({
  providedIn: 'root'
})

export class BusinessService {

  private apiUrl = `${environment.apiBaseUrl}/business`;

  // store businessId and emit to subscribers
  private businessIdSubject = new BehaviorSubject<number | null>(null);
  businessId$ = this.businessIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- Auth Headers ---
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }



    // --- Dashboard ---
    getDashboardData(): Observable<DashboardData> {
      return this.http
        .get<{ success: boolean; data: DashboardData }>(
          `${this.apiUrl}/dashboard`,
          { headers: this.getHeaders() }
        )
        // .pipe(map(res => res.data));
        .pipe(
          map(res => {
            // Save sellerId globally
            this.businessIdSubject.next(res.data.businessId);
            // Prepend base URL to profile picture if it exists
            if (res.data.profilePictureUrl) {
              res.data.profilePictureUrl = environment.assetUrl + res.data.profilePictureUrl;
            }
  
            return res.data;
          })
        );
    }

}