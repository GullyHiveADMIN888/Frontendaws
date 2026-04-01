import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface AssignedWorker {
  member_id: number | null;
  slot_no: number;
  role: string;
  status: string;
  assigned_at: string;
  worker_name: string;
  worker_email: string;
  worker_phone: string;
  is_team_lead: boolean;
  is_primary_contact: boolean;
}

export interface Job {
  id: number;
  leadId: number;
  primaryProviderId: number;
  customerUserId: number | null;
  cityId: number;
  addressId: number | null;
  jobStatus: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  customerConfirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  baseAmount: number | null;
  finalAmount: number | null;
  currency: string;
  customerNotes: string | null;
  providerNotes: string | null;
  checkedInAt: string | null;
  noShowAt: string | null;
  customerNotPresentAt: string | null;
  acceptedQuoteId: number | null;
  createdAt: string;
  updatedAt: string;
  providerLegalName: string | null;
  providerDisplayName: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  cityName: string | null;
  providerName: string;
  // New fields
  assignmentStatus: 'assigned' | 'unassigned';
  assignedWorkersCount: number;
  assignedWorkers: AssignedWorker[];
}



export interface WorkerAvailabilitySlot {
  memberId: number;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  status: string;
  currentJobId: number | null;
  isAvailable: boolean;
}

export interface Worker {
  id: number;
  userId: number;
  providerProfileId: number;
  name: string;
  email: string;
  phone: string;
  legalName: string;
  displayName: string;
  providerType: string;
  profilePictureUrl: string;
  memberId: number | null;
  isAvailable: boolean;
  availabilityStatus: string;
  availableSlots: WorkerAvailabilitySlot[];
}

export interface WorkerSearchResponse {
  success: boolean;
  data: Worker[];
  jobId?: number;
  message?: string;
}

export interface AssignJobRequest {
  jobId: number;
  workerUserId: number;
  workerProviderProfileId: number;
}

export interface AssignJobResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface JobListRequest {
  page: number;
  pageSize: number;
  jobStatus?: string;
  assignmentStatus?: string;
  cityId?: number;
  providerId?: number;
  scheduledStartFrom?: string;
  scheduledStartTo?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface JobListResponse {
  success: boolean;
  data: Job[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  message?: string;
}

export interface JobDetailResponse {
  success: boolean;
  data: Job;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OpsManagerJobService {
  private apiUrl = `${environment.apiBaseUrl}/business-user/ops-manager`;

  constructor(private http: HttpClient) { }

  /**
   * Get list of jobs with pagination and filters
   */
  getJobs(request: JobListRequest): Observable<JobListResponse> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('pageSize', request.pageSize.toString())
      .set('sortBy', request.sortBy || 'scheduled_start')
      .set('sortOrder', request.sortOrder || 'desc');

    if (request.jobStatus) {
      params = params.set('jobStatus', request.jobStatus);
    }
    if (request.assignmentStatus) {
      params = params.set('assignmentStatus', request.assignmentStatus);
    }
    if (request.cityId) {
      params = params.set('cityId', request.cityId.toString());
    }
    if (request.providerId) {
      params = params.set('providerId', request.providerId.toString());
    }
    if (request.scheduledStartFrom) {
      params = params.set('scheduledStartFrom', request.scheduledStartFrom);
    }
    if (request.scheduledStartTo) {
      params = params.set('scheduledStartTo', request.scheduledStartTo);
    }
    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }

    return this.http.get<JobListResponse>(`${this.apiUrl}/jobs`, { params });
  }

  /**
   * Get job details by ID
   */
  getJobById(id: number): Observable<JobDetailResponse> {
    return this.http.get<JobDetailResponse>(`${this.apiUrl}/jobs/${id}`);
  }

  /**
   * Get available job statuses for filter dropdown
   */
  getJobStatuses(): Observable<{ success: boolean; data: Array<{ value: string; label: string }> }> {
    return this.http.get<{ success: boolean; data: Array<{ value: string; label: string }> }>(`${this.apiUrl}/jobs/statuses`);
  }

  /**
   * Search workers under current manager
   */
  // searchWorkers(searchTerm: string): Observable<WorkerSearchResponse> {
  //   let params = new HttpParams();
  //   if (searchTerm) {
  //     params = params.set('search', searchTerm);
  //   }
  //   return this.http.get<WorkerSearchResponse>(`${this.apiUrl}/jobs/workers/search`, { params });
  // }
  searchWorkers(searchTerm: string, jobId?: number): Observable<WorkerSearchResponse> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (jobId) {
      params = params.set('jobId', jobId.toString());
    }
    return this.http.get<WorkerSearchResponse>(`${this.apiUrl}/jobs/workers/search`, { params });
  }

  /**
  * Assign job to a worker
  */
  assignJob(request: AssignJobRequest): Observable<AssignJobResponse> {
    return this.http.post<AssignJobResponse>(`${this.apiUrl}/jobs/assign`, request);
  }
}