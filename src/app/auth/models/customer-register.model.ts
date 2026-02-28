export interface CustomerRegisterRequest {
  mobile: string;
  fullName: string;
  email: string;
  password: string;
  preferredLanguage?: string;
  cityId?: number | null;
  
  // Address fields (optional)
  addressLine1?: string;
  addressLine2?: string;
  areaId?: number | null;
  landmark?: string;
  pinCode?: string;
  
  // Marketing attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  
  // Referral
  referralCode?: string;
  
  // Profile picture
  profilePicture?: File;
}

export interface CustomerRegistrationResponse {
  userId: number;
  message: string;
  token: string;
  role: string;
  name: string;
}

export interface MobileCheckResponse {
  exists: boolean;
  message: string;
}

export interface EmailCheckResponse {
  exists: boolean;
  message: string;
}
