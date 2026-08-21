import { api, extractData } from "@/src/lib/api";
import { getRefreshToken } from "@/src/lib/secureToken";
import { getDeviceId } from "@/src/utils/getDeviceID";

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
};

export type AuthMeResponse = {
  userId?: string;
  id?: string;
  email: string;
};

export type RegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
};

export type RegisterPayload = {
  email: string;
  password: string;
  dealerName: string;
  phoneNumber?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// ── Register (README §1: includes deviceId) ──
export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const deviceId = await getDeviceId();
  const { data } = await api.post<RegisterResponse>("/auth/register", {
    ...payload,
    deviceId,
  });
  return data;
}

// ── Login ──
export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const deviceId = await getDeviceId();
  const { data } = await api.post<TokenResponse>("/auth/login", {
    ...payload,
    deviceId,
  });

  return data;
}

// ── Logout (README §1: DELETE /auth/logout with refresh_token body) ──
export async function logout(): Promise<void> {
  const refresh_token = await getRefreshToken();
  await api.delete("/auth/logout", {
    data: refresh_token ? { refresh_token } : {},
  });
}

// ── Refresh Token (README §1: POST /auth/refresh with refresh_token + deviceId) ──
export async function refreshToken(): Promise<TokenResponse> {
  const deviceId = await getDeviceId();
  const refresh_token = await getRefreshToken();
  const { data } = await api.post<TokenResponse>("/auth/refresh", {
    ...(refresh_token ? { refresh_token } : {}),
    deviceId,
  });
  return data;
}

// ── Get Current User ──
export async function fetchMe(
  token?: string,
): Promise<{ id?: string; email: string }> {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const response = await api.get("/auth/me", config);

  const userData = extractData<AuthMeResponse>(response);
  if (!userData || !userData.email) {
    throw new Error("Format response auth/me dari server tidak sesuai.");
  }

  return {
    id: userData.id ?? userData.userId,
    email: userData.email,
  };
}
