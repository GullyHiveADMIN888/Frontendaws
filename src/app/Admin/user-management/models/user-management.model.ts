// models/user.model.ts
export interface User {
  id: number;
  phone: string;
  email: string;
  displayName: string;
  profilePhotoUrl?: string;
  status: string;
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  roles: string[];
  roleIds: number[];
  cityName?: string;
  stateName?: string;
  hasBusiness: boolean;
  hasProviderProfile: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  userCount: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
  deletedUsers: number;
  usersByRole: { [key: string]: number };
  todayRegistrations: number;
  thisWeekRegistrations: number;
  thisMonthRegistrations: number;
}

export interface UserListRequest {
  page: number;
  pageSize: number;
  search?: string;
  roleId?: number;
  roleName?: string;
  isActive?: boolean;
  isBlocked?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface PagedResult<T> {
  success: boolean;
  data: T[];
  totalCount: number;
}

export interface UserUpdateRequest {
  displayName?: string;
  email?: string;
  roleIds?: number[];
  isActive?: boolean;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface BlockUserRequest {
  reason: string;
}

export interface UpdateRolesRequest {
  roleIds: number[];
}

export interface AddRoleRequest {
  roleId: number;
}

export interface RemoveRoleRequest {
  roleId: number;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  totalCount?: number;
  message?: string;
}