import { api, extractData } from "@/src/lib/api";
import type { UpdateProfilePayload, UserProfile } from "@/src/types/user";

// ── Fetch Profile ──
export async function fetchProfile(): Promise<UserProfile> {
  const response = await api.get("/users/profile");
  const userData = extractData<UserProfile>(response);
  if (!userData) {
    throw new Error("Gagal mengambil data profil dari server.");
  }

  return userData;
}

// ── Update Profile ──
export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const response = await api.patch("/users/profile", payload);
  return extractData<UserProfile>(response);
}

// ── Request Password Reset ──
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/users/request-password-reset", { email });
}

// ── Reset Password (README §4: email + otp + newPassword) ──
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> {
  await api.post("/users/reset-password", { email, otp, newPassword });
}

// ── Verify Email ──
export async function verifyEmail(email: string, token: string): Promise<void> {
  await api.post("/users/verify-email", { email, token });
}
