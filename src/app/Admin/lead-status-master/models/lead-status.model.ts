export interface LeadStatus {
  id: number;
  name: string;
  isActive: boolean;
  saving?: boolean;
  updating?: boolean;
  deleting?: boolean;
}

export interface LeadStatusCreateDto {
  name: string;
}

export interface LeadStatusUpdateDto {
  name: string;
  isActive: boolean;
}