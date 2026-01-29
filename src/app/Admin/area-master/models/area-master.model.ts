
export interface AreaMaster {
  id: number;
  stateId: number;
  cityId: number;
  areaName: string;
  pincode: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stateName?: string;
  cityName?: string;
  updating?: boolean;
  deleting?: boolean;
}

export interface AreaMasterCreateDto {
  stateId: number;
  cityId: number;
  areaName: string;
  pincode: string;
  description?: string;
  isActive: boolean;
}

export interface AreaMasterUpdateDto {
  stateId: number;
  cityId: number;
  areaName: string;
  pincode: string;
  description?: string;
  isActive: boolean;
}

export interface StateDto {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CityDto {
  id: number;
  stateId: number;
  name: string;
  stateName: string;
  isActive: boolean;
}