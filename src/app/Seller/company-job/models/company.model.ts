export interface CompanyJob {
  id: number;
  jobId: number;
  companyName: string;
  assignedAt: string;
  status: string;
  slotNumber: number;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  leadId: number;
  leadDescription: string;
  leadStatus: string;

  cityName: string;
  areaName: string;

  categoryName: string;
  subCategoryName: string;
   showDetails?: boolean;
}
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pageNumber: number;
  totalCount: number;
}