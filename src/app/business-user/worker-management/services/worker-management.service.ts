import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface WorkerProfile {
  providerId: number | null;
  sellerId: number | null;
  displayName: string;
  legalName: string;
  email: string;
  phone: string;
  providerType: string;
  status: string;
  baseCity: string;
  state: string;
  description: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  areaName: string;
  profilePictureUrl: string;
  totalJobsCompleted: number | null;
  totalDisputes: number | null;
  disputeRate: number | null;
  addressCity?: string;
  addressState?: string;
  locality?: string;
  addressLabel?: string;
  addressId?: number | null;
  addressCityId?: number | null;
  addressStateId?: number | null;
  areaId?: number | null;
  services?: string[];
  portfolioImages?: string[];
  reviews?: any[];
  createdAt?: string;
  avgRating?: number;
  ratingCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface InviteWorkerResponse {
  success: boolean;
  data?: {
    id: number;
    providerId: number;
    workerUserId: number;
    workerProviderProfileId: number;
    requestStatus: string;
    message: string;
    success: boolean;
  };
  message?: string;
}

export interface PendingInviteFilter {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PendingInviteItem {
  id: number;
  providerId: number;
  workerUserId: number;
  workerProviderProfileId: number;
  requestStatus: string;
  requestedByUserId: number;
  createdAt: string;
  workerName: string;
  workerEmail: string;
  workerPhone: string;
  workerLegalName: string;
  workerProviderType: string;
}

export interface PendingInviteListResponse {
  success: boolean;
  data: PendingInviteItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Worker {
  id: number;
  providerId: number;
  sellerId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  addedAt: Date;
  profile?: WorkerProfile;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerManagementService {
  private apiUrl = `${environment.apiBaseUrl}/business-user`;

  constructor(private http: HttpClient) {}

  // ========== NEW API FOR INVITES ==========
  
  /**
   * Invite a worker using new API
   */
  inviteWorker(email: string, requestSource: string = 'manual'): Observable<InviteWorkerResponse> {
    return this.http.post<InviteWorkerResponse>(`${this.apiUrl}/worker-invites`, { email, requestSource });
  }

  /**
   * Get pending invites with pagination and filters
   */
  getPendingInvites(filter: PendingInviteFilter): Observable<PendingInviteListResponse> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString())
      .set('sortBy', filter.sortBy || 'created_at')
      .set('sortOrder', filter.sortOrder || 'desc');
    
    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    
    return this.http.get<PendingInviteListResponse>(`${this.apiUrl}/worker-invites/pending`, { params });
  }

  // ========== OLD API FOR FETCHING WORKER DATA ==========
  
  /**
   * Fetch provider profile by email and phone (updated API)
   */
  getProviderByEmailAndPhone(email: string, phone?: string): Observable<ApiResponse<WorkerProfile>> {
    let params = new HttpParams().set('email', email);
    if (phone) {
      params = params.set('phone', phone);
    }
    return this.http.get<ApiResponse<WorkerProfile>>(`${environment.apiBaseUrl}/provider_User_Admin/getProviderProfileByEmail`, { params });
  }

  /**
   * Fetch provider profile by email only (for backward compatibility)
   */
  getProviderByEmail(email: string): Observable<ApiResponse<WorkerProfile>> {
    return this.getProviderByEmailAndPhone(email);
  }

  /**
   * Fetch provider profile by ID (OLD API)
   */
  getProviderById(providerId: number): Observable<ApiResponse<WorkerProfile>> {
    return this.http.get<ApiResponse<WorkerProfile>>(`${environment.apiBaseUrl}/business/getProviderProfileById/${providerId}`);
  }

  // ========== OTHER WORKER MANAGEMENT APIS ==========
  
  addWorker(workerData: Partial<Worker>): Observable<ApiResponse<Worker>> {
    return this.http.post<ApiResponse<Worker>>(`${this.apiUrl}/workers`, workerData);
  }

  validateWorkerEmail(email: string): Observable<ApiResponse<{ exists: boolean }>> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ApiResponse<{ exists: boolean }>>(`${this.apiUrl}/workers/validate-email`, { params });
  }

  getWorkerStatistics(): Observable<ApiResponse<{
    totalWorkers: number;
    activeWorkers: number;
    inactiveWorkers: number;
    pendingWorkers: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/workers/statistics`);
  }

  updateWorkerStatus(workerId: number, status: string): Observable<ApiResponse<Worker>> {
    return this.http.patch<ApiResponse<Worker>>(`${this.apiUrl}/workers/${workerId}/status`, { status });
  }

  searchWorkers(searchTerm: string): Observable<ApiResponse<Worker[]>> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<ApiResponse<Worker[]>>(`${this.apiUrl}/workers/search`, { params });
  }

  getWorkersByStatus(status: string): Observable<ApiResponse<Worker[]>> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ApiResponse<Worker[]>>(`${this.apiUrl}/workers/status`, { params });
  }
}