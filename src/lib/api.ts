import {
  deleteRefreshToken,
  deleteToken,
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from "@/src/lib/secureToken";
import { getDeviceId } from "@/src/utils/getDeviceID";
import type { AxiosResponse } from "axios";
import axios from "axios";

const PUBLIC_AUTH_PATHS = [
  "/auth/register",
  "/auth/login",
  "/auth/refresh",
  "/users/forgot-password",
  "/users/reset-password",
  "/users/verify-email",
];

function isPublicAuthRequest(url?: string): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => url?.startsWith(path));
}

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function normalizeBaseUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;

  const trimmedUrl = rawUrl.replace(/\/+$/, "");
  return trimmedUrl.endsWith("/api/v1")
    ? trimmedUrl
    : `${trimmedUrl}/api/v1`;
}

export const api = axios.create({
  baseURL: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (!isPublicAuthRequest(config.url) && !config.headers.Authorization) {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isPublicRequest = isPublicAuthRequest(originalRequest?.url);

    if (status === 401 && !isPublicRequest && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
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
        const newRefreshToken =
          data?.refresh_token ?? data?.data?.refresh_token;

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

    const responseData = error.response?.data;
    const apiError = responseData?.error;
    let message =
      apiError?.message ?? responseData?.message ?? error.message;

    if (
      typeof message === "string" &&
      message.toLowerCase().includes("invalid credential")
    ) {
      message = "Email atau password salah";
    } else if (Array.isArray(message)) {
      message = message.join(", ");
    }

    if (
      originalRequest?.url?.startsWith("/auth/register") &&
      status >= 500 &&
      /registration failed/i.test(message)
    ) {
      message =
        "Server gagal membuat akun. Coba gunakan email yang belum terdaftar. Jika tetap gagal, layanan registrasi backend perlu diperiksa.";
    }

    return Promise.reject(
      new ApiError(
        message || "Terjadi kesalahan pada server",
        status,
        responseData,
      ),
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
