// services/user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { 
  User, 
  Role, 
  UserStats, 
  UserListRequest, 
  ApiResponse 
} from '../models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiBaseUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  // Get users with pagination and filters
  getUsers(request: UserListRequest): Observable<ApiResponse<User[]>> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.search) {
      params = params.set('search', request.search);
    }
    if (request.roleId) {
      params = params.set('roleId', request.roleId.toString());
    }
    if (request.roleName) {
      params = params.set('roleName', request.roleName);
    }
    if (request.isActive !== undefined) {
      params = params.set('isActive', request.isActive.toString());
    }
    if (request.isBlocked !== undefined) {
      params = params.set('isBlocked', request.isBlocked.toString());
    }
    if (request.createdFrom) {
      params = params.set('createdFrom', request.createdFrom);
    }
    if (request.createdTo) {
      params = params.set('createdTo', request.createdTo);
    }
    if (request.sortBy) {
      params = params.set('sortBy', request.sortBy);
    }
    if (request.sortDesc !== undefined) {
      params = params.set('sortDesc', request.sortDesc.toString());
    }

    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  // Get single user by ID
  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  // Update user
  updateUser(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  // Block user
  blockUser(id: number, reason: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/block`, { reason });
  }

  // Unblock user
  unblockUser(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/unblock`, {});
  }

  // Activate user
  activateUser(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/activate`, {});
  }

  // Deactivate user
  deactivateUser(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  // Soft delete user
  softDeleteUser(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}/soft-delete`);
  }

  // Restore user
  restoreUser(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/restore`, {});
  }

  // Update user roles
  updateUserRoles(id: number, roleIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/roles`, { roleIds });
  }

  // Add role to user
  addRoleToUser(id: number, roleId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/roles/add`, { roleId });
  }

  // Remove role from user
  removeRoleFromUser(id: number, roleId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/roles/remove`, { roleId });
  }

  // Get all roles
  getAllRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/roles`);
  }

  // Get user statistics
  getUserStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.apiUrl}/stats`);
  }
}