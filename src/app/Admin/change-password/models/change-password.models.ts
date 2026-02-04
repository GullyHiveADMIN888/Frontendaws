export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  timestamp: Date;
}