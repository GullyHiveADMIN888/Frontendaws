export interface EmployeeDetails {
  providerUserId: number;
  providerId: number;
  userId: number;
  providerRole: string;
  status: string;

  userName: string;
  userEmail: string;
  userPhone: string;

  regionId?: number;
  opsRole: string;
  regionName: string;
  regionType: string;
  parentRegionId?: number;
  cityId?: number;
}