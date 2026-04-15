import { api } from "@/src/lib/api";

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// ── Register ──
export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

// ── Login ──
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

// ── Logout ──
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
