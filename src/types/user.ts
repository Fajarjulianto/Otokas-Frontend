// User types

export interface UserProfile {
  id: string;
  dealerName: string;
  email: string;
  deviceId?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isPremium?: boolean;
  subdomain?: string;
  fullDomain?: string;
  phoneNumber?: string | null;
  address?: string | null;
}

export type User = UserProfile;

export interface UpdateProfilePayload {
  dealerName?: string;
  phoneNumber?: string | null;
  address?: string | null;
}
