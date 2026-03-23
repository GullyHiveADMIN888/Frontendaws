// worker-management.service.ts
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
  private apiUrl = `${environment.apiBaseUrl}/business`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch provider profile by email
   * @param email - Email address of the provider
   * @returns Observable with provider profile data
   */
  getProviderByEmail(email: string): Observable<ApiResponse<WorkerProfile>> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ApiResponse<WorkerProfile>>(`${this.apiUrl}/getProviderProfileByEmail`, { params });
  }

  /**
   * Fetch provider profile by ID
   * @param providerId - Provider ID
   * @returns Observable with provider profile data
   */
  getProviderById(providerId: number): Observable<ApiResponse<WorkerProfile>> {
    return this.http.get<ApiResponse<WorkerProfile>>(`${this.apiUrl}/getProviderProfileById/${providerId}`);
  }

  /**
   * Get all workers (to be implemented with backend API)
   * @returns Observable with list of workers
   */
  getAllWorkers(): Observable<ApiResponse<Worker[]>> {
    return this.http.get<ApiResponse<Worker[]>>(`${this.apiUrl}/workers`);
  }

  /**
   * Add a new worker (to be implemented with backend API)
   * @param workerData - Worker data to add
   * @returns Observable with added worker data
   */
  addWorker(workerData: Partial<Worker>): Observable<ApiResponse<Worker>> {
    return this.http.post<ApiResponse<Worker>>(`${this.apiUrl}/workers`, workerData);
  }

  /**
   * Update worker information (to be implemented with backend API)
   * @param workerId - Worker ID
   * @param workerData - Updated worker data
   * @returns Observable with updated worker data
   */
  updateWorker(workerId: number, workerData: Partial<Worker>): Observable<ApiResponse<Worker>> {
    return this.http.put<ApiResponse<Worker>>(`${this.apiUrl}/workers/${workerId}`, workerData);
  }

  /**
   * Delete a worker (to be implemented with backend API)
   * @param workerId - Worker ID to delete
   * @returns Observable with deletion status
   */
  deleteWorker(workerId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/workers/${workerId}`);
  }

  /**
   * Update worker status (activate/deactivate)
   * @param workerId - Worker ID
   * @param status - New status (active/inactive)
   * @returns Observable with updated worker
   */
  updateWorkerStatus(workerId: number, status: string): Observable<ApiResponse<Worker>> {
    return this.http.patch<ApiResponse<Worker>>(`${this.apiUrl}/workers/${workerId}/status`, { status });
  }

  /**
   * Search workers by name or email (to be implemented with backend API)
   * @param searchTerm - Search term
   * @returns Observable with filtered workers list
   */
  searchWorkers(searchTerm: string): Observable<ApiResponse<Worker[]>> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<ApiResponse<Worker[]>>(`${this.apiUrl}/workers/search`, { params });
  }

  /**
   * Get workers by status (to be implemented with backend API)
   * @param status - Worker status (active/inactive/pending)
   * @returns Observable with filtered workers
   */
  getWorkersByStatus(status: string): Observable<ApiResponse<Worker[]>> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ApiResponse<Worker[]>>(`${this.apiUrl}/workers/status`, { params });
  }

  /**
   * Validate if email already exists in workers list (to be implemented with backend API)
   * @param email - Email to validate
   * @returns Observable with validation result
   */
  validateWorkerEmail(email: string): Observable<ApiResponse<{ exists: boolean }>> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ApiResponse<{ exists: boolean }>>(`${this.apiUrl}/workers/validate-email`, { params });
  }

  /**
   * Get worker statistics (to be implemented with backend API)
   * @returns Observable with worker statistics
   */
  getWorkerStatistics(): Observable<ApiResponse<{
    totalWorkers: number;
    activeWorkers: number;
    inactiveWorkers: number;
    pendingWorkers: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/workers/statistics`);
  }

  /**
   * Bulk add workers (to be implemented with backend API)
   * @param workers - Array of workers to add
   * @returns Observable with bulk operation result
   */
  bulkAddWorkers(workers: Partial<Worker>[]): Observable<ApiResponse<{ added: number; failed: number; errors?: string[] }>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/workers/bulk`, { workers });
  }

  /**
   * Export workers list (to be implemented with backend API)
   * @param format - Export format (csv/excel)
   * @returns Observable with blob data for download
   */
  exportWorkers(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/workers/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Assign worker to projects (to be implemented with backend API)
   * @param workerId - Worker ID
   * @param projectIds - Array of project IDs
   * @returns Observable with assignment result
   */
  assignWorkerToProjects(workerId: number, projectIds: number[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/workers/${workerId}/assign-projects`, { projectIds });
  }

  /**
   * Get worker's assigned projects (to be implemented with backend API)
   * @param workerId - Worker ID
   * @returns Observable with list of projects
   */
  getWorkerProjects(workerId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/workers/${workerId}/projects`);
  }

  /**
   * Get worker's performance metrics (to be implemented with backend API)
   * @param workerId - Worker ID
   * @returns Observable with performance metrics
   */
  getWorkerPerformance(workerId: number): Observable<ApiResponse<{
    jobsCompleted: number;
    avgRating: number;
    totalEarnings: number;
    attendance: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/workers/${workerId}/performance`);
  }
}