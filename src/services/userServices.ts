import { api, extractData } from "@/src/lib/api";
import type { UpdateProfilePayload, UserProfile } from "@/src/types/user";

// ── Fetch Profile ──
export async function fetchProfile(options?: {
  signal?: AbortSignal;
  accessToken?: string;
}): Promise<UserProfile> {
  const response = await api.get(
    "/users/profile",
    options
      ? {
          signal: options.signal,
          ...(options.accessToken
            ? { authTokenOverride: options.accessToken, skipAuthRefresh: true }
            : {}),
        }
      : undefined,
  );
  const userData = extractData<UserProfile>(response);
  if (
    !userData ||
    typeof userData.dealerName !== "string" ||
    !userData.dealerName.trim() ||
    !userData.email
  ) {
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

export async function changePassword(
  newPassword: string,
  currentPassword: string,
): Promise<{ message?: string }> {
  const response = await api.post("/users/change-password", {
    newPassword,
    currentPassword,
  });
  return extractData<{ message?: string }>(response);
}

// ── Request Password Reset ──
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/users/request-password-reset", { email });
}

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
