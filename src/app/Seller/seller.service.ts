

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map,BehaviorSubject  } from 'rxjs';
// import { environment } from '../../environments/environment';
import { environment } from '../../environments/environment.prod';

// --- Dashboard & Stats ---
export interface SellerStats {
  totalLeads: number;
  totalResponses: number;
  totalEarnings: number;
}

export interface Lead {
  id: number;
  customerName: string;
  serviceName: string;
  location: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  createdAt: string;
  name?: string;
  service?: string;
  time?: string;
  budget?: string;
  avatar?: string;
  leadType?: string;
  timePreference?: string;
  serviceSubCategoryName?: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  scheduleLabel?: string;
  isPurchased: boolean; // 🔥 important
  phone?: string;
  email?: string;
  leadPrice?: string;
  unlockedCount?: string;
  committedCount?: string;  
  priceBreakdown?: { [key: string]: number }; // parsed JSON
  basePrice?: string;
  visitingPrice?: string;
  providerPrice?: number;

}


export interface DashboardData {
  sellerId: number;
  name: string;
  email: string;
  stats: SellerStats;
  recentLeads: Lead[];
   profilePictureUrl?: string; // ← add this
}


export interface PublicProfile {
  sellerId: number;
  legalName: string;
  displayName: string;
  email: string;
  phone: string;
  providerType: string;
  status: string;
  baseCity: string;
  profilePictureUrl?: string;
 // Ratings & stats
  avgRating: number;
  ratingCount: number;
  totalJobsCompleted: number;
  totalDisputes: number;
  disputeRate: number;

   // ✅ Address (primary)
  addressId?: number;
  addressLabel?: string;
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  landmark?: string;
  addressCity?: string;
  state?: string;
  pincode?: string;
  description?: string;
  createdAt: string;
  // optional
  services?: string[];
  portfolioImages?: string[];
  reviews?: Review[];
 addressState?: string;
  website?: string;
  linkedin?: string;
  addressCityId?: number;
addressStateId?: number;
 
}


export interface Review {
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Response {
  id: number;
  leadId: number;
  leadName: string;
  service: string;
  quoteAmount: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
// Help FAQ model
export interface HelpCategory {
  id: number;
  title: string;
  description: string;
  icon: string;
  articles: number;
}

export interface HelpFaq {
  id: number;
  question: string;
  answer: string;
}
export interface Referral {
  id: number;
  code: string;
  referrer_user_id: number;
  referrer_role: string;
  referred_type: string;
  referred_user_id: number;
  source: string;
  created_at: string;
   // optional UI fields
  name?: string;
  avatar?: string;
  joinedDate?: string;
  status: 'pending' | 'approved' | 'paid'; // ✅ add this
  earnings?: string;
  amount?: number;   // numeric for totals
}

// ────────────── MODELS ──────────────

export interface ProviderService {
  categoryId: number;
  subCategoryIds: number[];
}

export interface ProviderServicesResponse {
  providerServices: ProviderService[];
  serviceArea: {
    type: 'city_radius' | 'polygon' | 'pincode_list';
    cityId?: number;
    radiusKm?: number;
    pincodes: string[];
  };
  categories: any[];
  subCategories: any[];
  cities: any[];
  providerQuestionIds: number[];
}




@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = `${environment.apiBaseUrl}/seller`;
  
 // BehaviorSubject will store sellerId and emit it to subscribers
  private sellerIdSubject = new BehaviorSubject<number | null>(null);
  sellerId$ = this.sellerIdSubject.asObservable(); // Observable for components

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
          this.sellerIdSubject.next(res.data.sellerId);
           // Prepend base URL to profile picture if it exists
        if (res.data.profilePictureUrl) {
          res.data.profilePictureUrl = environment.assetUrl + res.data.profilePictureUrl;
        }

          return res.data;
        })
      );
  }

  
  // --- All Leads ---
  // getLeads(): Observable<Lead[]> {
  //   const providerId = Number(localStorage.getItem('userId'));
  //   return this.http
  //     .get<{ success: boolean; data: Lead[] }>(
  //       `${this.apiUrl}/leads`,
  //       { headers: this.getHeaders() }
  //     )
  //     .pipe(map(res => res.data));
  // }


getLeads(): Observable<Lead[]> {
  return this.http
    .get<{ success: boolean; data: Lead[] }>(
      `${this.apiUrl}/leads`, // no userId needed
      { headers: this.getHeaders() } // token carries userId
    )
    .pipe(map(res => res.data));
}


  // 🔹 Buy Lead
  buyLead(leadId: number): Observable<any> {
    const sellerId = Number(localStorage.getItem('sellerId'));

    return this.http.post(
      `${this.apiUrl}/leads/${leadId}/buy?sellerId=${sellerId}`,
      {}
    );
  }

// getPublicProfile(sellerId: number) {
//   return this.http.get<{ success: boolean; data: PublicProfile }>(
//       `${this.apiUrl}/completeProfile/${sellerId}`,
//       { headers: this.getHeaders() }
//     )
//     .pipe(map(res => res.data));
// }



getPublicProfile(sellerId: number) {
  return this.http
    .get<{ success: boolean; data: PublicProfile }>(
      `${this.apiUrl}/completeProfile/${sellerId}`,
      { headers: this.getHeaders() }
    )
    .pipe(
      map(res => {
        const profile = res.data;

        if (profile.profilePictureUrl) {
          profile.profilePictureUrl = environment.assetUrl  + profile.profilePictureUrl;
        }

        return profile;
      })
    );
}

sharableProfile(sellerId: number) {
  return this.http
    .get<{ success: boolean; data: PublicProfile }>(
      `${this.apiUrl}/sharableeProfile/${sellerId}`
    )
    .pipe(
      map(res => {
        const profile = res.data;

        if (profile.profilePictureUrl) {
          profile.profilePictureUrl = environment.assetUrl  + profile.profilePictureUrl;
        }

        return profile;
      })
    );
}

updateProfile(sellerId: number, payload: FormData) {
  return this.http.post(`${this.apiUrl}/updateProfile/${sellerId}`, payload, {
    headers: this.getHeaders() // Do NOT set Content-Type; browser handles multipart
  });
}


   // Pass sellerId here
 getMyResponses(sellerId: number): Observable<{ success: boolean, data: Response[] }> {
  return this.http.get<{ success: boolean, data: Response[] }>(
    `${this.apiUrl}/responses/seller/${sellerId}`,
    { headers: this.getHeaders() }
  );
}


// Helps
 getHelpFaqs(): Observable<{ categories: HelpCategory[]; faqs: HelpFaq[] }> {
    return this.http
      .get<{ success: boolean; categories: HelpCategory[]; faqs: HelpFaq[] }>
      (
        `${this.apiUrl}/faqs`,
         { headers: this.getHeaders() }
      )
      .pipe(
        map(res => ({
          categories: res.categories,
          faqs: res.faqs
        }))
      );
  }

 // Fetch referrals
getReferrals(sellerId: number): Observable<Referral[]> {
  return this.http.get<{ success: boolean; data: Referral[] }>(
    `${this.apiUrl}/refer/${sellerId}`,
    { headers: this.getHeaders() }
  ).pipe(map(res => res.data));
}

  // Service Categories APIs
getParentCategories(): Observable<any[]> {
  return this.http.get<any[]>(
     `${environment.apiBaseUrl}/auth/parents`,
  );
}
 //`${environment.apiBaseUrl}/parents`
getSubCategories(parentId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiBaseUrl}/auth/${parentId}/children/`
  );
}

 // 🔹 Get cities
  getCities(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/cities`,
      { headers: this.getHeaders() }
    );
  }

getProviderServices(providerId: number): Observable<ProviderServicesResponse> {
  return this.http
    .get<{ success: boolean; data: ProviderServicesResponse }>(
      `${this.apiUrl}/services/${providerId}`,
      { headers: this.getHeaders() }
    )
    .pipe(map(res => res.data));
}


  // 🔹 Update services + area
  updateServicesAndArea(providerId: number, payload: any) {
    return this.http.post(
      `${this.apiUrl}/update-services/${providerId}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

getStates(): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiBaseUrl}/auth/states`);
}

getCitiess(stateId: number): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiBaseUrl}/auth/cities/${stateId}`);
}

changePassword(sellerId: number, data: any) {
  return this.http.post(
    `${this.apiUrl}/change-password/${sellerId}`,
    data
  );
}



// GET
getBankDetails(sellerId: number) {
  return this.http.get<any>(
    `${this.apiUrl}/bank-details/${sellerId}`,
    { headers: this.getHeaders() }
  );
}

// SAVE / UPDATE
saveBankDetails(payload: any) {
  return this.http.post(
    `${this.apiUrl}/bank-details`,
    payload,
    { headers: this.getHeaders() }
  );
}

// DELETE
deleteBankDetails(sellerId: number) {
  return this.http.delete(
    `${this.apiUrl}/bank-details/${sellerId}`,
    { headers: this.getHeaders() }
  );
}

// Buy Leads
buyLeads(leadId: number) {
  const providerId = Number(localStorage.getItem('userId'));
  //  const providerId = 42;

  return this.http.post(
    `${this.apiUrl}/buy`,
    {
      leadId: leadId,
      providerId: providerId
    },
    {
      headers: this.getHeaders()
    }
  );
}

sendQuote(payload: any) {
  return this.http.post(
    `${this.apiUrl}/quotes`,
    payload,
    { headers: this.getHeaders() }
  );
}



getQuestionsBySubCategory(subCategoryId: number) {
  return this.http.get<{ success: boolean; data: any[] }>(
    `${this.apiUrl}/by-subcategory/${subCategoryId}`
  );
}


}

