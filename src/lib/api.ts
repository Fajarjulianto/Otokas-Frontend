import {
  deleteRefreshToken,
  deleteToken,
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from "@/src/lib/secureToken";
import { getDeviceId } from "@/src/utils/getDeviceID";
import axios from "axios";
import type { AxiosResponse } from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Request Interceptor: inject token from SecureStore ──
api.interceptors.request.use(async (config) => {
  if (!config.headers.Authorization) {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response Interceptor: 401 auto-refresh + error formatting ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // README §1: POST /auth/refresh with refresh_token + deviceId.
        const deviceId = await getDeviceId();
        const refresh_token = await getRefreshToken();
        const { data } = await api.post("/auth/refresh", {
          ...(refresh_token ? { refresh_token } : {}),
          deviceId,
        });

        const newToken =
          data?.access_token ??
          data?.token ??
          data?.accessToken ??
          data?.data?.token;
        const newRefreshToken = data?.refresh_token ?? data?.data?.refresh_token;

        if (newToken) {
          await saveToken(newToken);
          if (newRefreshToken) {
            await saveRefreshToken(newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — clear stored credentials
        await deleteToken();
        await deleteRefreshToken();
        // Optionally: could emit an event here to force re-login
      }
    }

    const apiError = error.response?.data?.error;
    let message =
      apiError?.message ?? error.response?.data?.message ?? error.message;

    if (
      typeof message === "string" &&
      message.toLowerCase().includes("invalid credential")
    ) {
      message = "Email atau password salah";
    } else if (Array.isArray(message)) {
      message = message.join(", ");
    }

    return Promise.reject(
      new Error(message || "Terjadi kesalahan pada server"),
    );
  },
);

/**
 * Extracts the actual data payload from a wrapped API response.
 * Handles both `{ data: { data: T } }` and `{ data: T }` formats.
 */
export function extractData<T>(response: AxiosResponse): T {
  return response.data?.data ?? response.data;
}
