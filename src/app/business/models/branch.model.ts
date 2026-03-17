export interface Branch {
  id: number;
  name: string;
  businessId: number;
  isActive: boolean;

  line1: string | null;
  line2: string | null;
  pincode: string | null;

  stateId?: number | null;
  cityId?: number | null;
  areaId?: number | null;
   areaIds?: number[],

  stateName?: string | null;
  cityName?: string | null;
  areaName?: string | null;
  businessName?: string | null;
}