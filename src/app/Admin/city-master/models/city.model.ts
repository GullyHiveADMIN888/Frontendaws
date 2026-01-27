export interface City {
  id: number;
  name: string;
  state: number;
  country: string;
  tier: number;
  centerLat: number;
  centerLong: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  updating?: boolean;
  deleting?: boolean;
}

export interface CreateCity {
  name: string;
  state: number;
  country: string;
  tier: number;
  centerLat: number;
  centerLong: number;
}

export interface UpdateCity {
  name: string;
  state: number;
  country: string;
  tier: number;
  centerLat: number;
  centerLong: number;
  isActive: boolean;
}

export interface State {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}