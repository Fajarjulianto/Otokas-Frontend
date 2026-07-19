// User types (see README §4).

export interface UserProfile {
  id: string;
  dealerName: string;
  email: string;
  deviceId?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Optional convenience/UI fields (not guaranteed by the profile payload).
  isPremium?: boolean;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface User extends UserProfile {}

// README: PATCH /users/profile updates the dealer name. Extra fields are
// accepted for forward-compatibility and ignored by the backend if unused.
export interface UpdateProfilePayload {
  dealerName?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}
