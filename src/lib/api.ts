import { notifySessionExpired } from "./authSession";
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
import {
  diagnosticMessage,
  diagnosticResponseData,
  diagnosticUrl,
} from "./networkDiagnostics";

const PUBLIC_AUTH_PATHS = [
  "/auth/register",
  "/auth/login",
  "/auth/refresh",
  "/users/forgot-password",
  "/users/request-password-reset",
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

const PRODUCTION_API_URL = "https://api.otokas.co.id/api/v1";

function normalizeBaseUrl(rawUrl?: string): string {
  // Expo Go/builds can start without the ignored local `.env` file. Keep a
  // production fallback so Axios never silently sends a relative request.
  const value = rawUrl?.trim() || PRODUCTION_API_URL;
  const trimmedUrl = value.replace(/\/+$/, "");

  return trimmedUrl.endsWith("/api/v1") ? trimmedUrl : `${trimmedUrl}/api/v1`;
}

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

if (__DEV__) {
  console.info("[api diagnostic: runtime config]", {
    envBaseURL: diagnosticUrl(process.env.EXPO_PUBLIC_API_URL),
    baseURL: diagnosticUrl(API_BASE_URL),
  });
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

declare module "axios" {
  interface AxiosRequestConfig {
    authTokenOverride?: string;
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

let pendingRefresh: Promise<string> | null = null;

async function renewAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await deleteToken();
    notifySessionExpired();
    throw new ApiError("Sesi login berakhir. Silakan masuk kembali.", 401);
  }
  try {
    const { data } = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
      deviceId: await getDeviceId(),
    });
    const payload = data?.data ?? data;
    if (typeof payload?.access_token !== "string" || !payload.access_token) {
      throw new ApiError("Respons pembaruan sesi tidak valid.", 401);
    }
    // A response for a previous account must not replace the current session.
    if ((await getRefreshToken()) !== refreshToken) {
      throw new ApiError("Sesi login sudah berubah. Silakan coba lagi.", 409);
    }
    await saveToken(payload.access_token);
    if (payload.refresh_token) await saveRefreshToken(payload.refresh_token);
    return payload.access_token;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : undefined;
    if (
      (status === 401 || status === 403) &&
      (await getRefreshToken()) === refreshToken
    ) {
      await Promise.all([deleteToken(), deleteRefreshToken()]);
      notifySessionExpired();
      throw new ApiError("Sesi login berakhir. Silakan masuk kembali.", 401);
    }
    // Network/server errors should not sign the user out.
    throw error;
  }
}

api.interceptors.request.use(async (config) => {
  if (isPublicAuthRequest(config.url)) {
    delete config.headers.Authorization;
  } else {
    const token = config.authTokenOverride ?? (await getToken());
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;
  }
  if (__DEV__) {
    console.info("[api diagnostic: prepared, not proof of send]", {
      at: new Date().toISOString(),
      baseURL: diagnosticUrl(config.baseURL),
      url: diagnosticUrl(config.url),
      fullURL: diagnosticUrl(api.getUri(config)),
      method: config.method,
      timeout: config.timeout,
      contentType: config.headers["Content-Type"],
      accept: config.headers.Accept,
      hasAuthorization: Boolean(config.headers.Authorization),
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.info("[api diagnostic: response received]", {
        at: new Date().toISOString(),
        url: diagnosticUrl(response.config.url),
        status: response.status,
        responseURL: diagnosticUrl(response.request?.responseURL),
      });
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.warn("[api diagnostic: error]", {
        at: new Date().toISOString(),
        message: diagnosticMessage(error.message),
        code:
          typeof error.code === "string" &&
          /^(ERR_[A-Z_]+|ECONNABORTED|ETIMEDOUT)$/.test(error.code)
            ? error.code
            : undefined,
        config: {
          baseURL: diagnosticUrl(error.config?.baseURL),
          url: diagnosticUrl(error.config?.url),
          method: error.config?.method,
          timeout: error.config?.timeout,
        },
        response: {
          status: error.response?.status,
          data: diagnosticResponseData(error.response?.data),
        },
        hasRequest: Boolean(error.request),
        responseURL: diagnosticUrl(error.request?.responseURL),
      });
    }
    const originalRequest = error.config;
    const status = error.response?.status;
    const isPublicRequest = isPublicAuthRequest(originalRequest?.url);

    if (
      status === 401 &&
      !isPublicRequest &&
      originalRequest &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const latestToken = await getToken();
      const sentAuthorization = originalRequest.headers?.Authorization;
      if (!latestToken || sentAuthorization === `Bearer ${latestToken}`) {
        if (!pendingRefresh)
          pendingRefresh = renewAccessToken().finally(() => {
            pendingRefresh = null;
          });
        await pendingRefresh;
      }
      // The request interceptor attaches the current SecureStore token.
      return api(originalRequest);
    }
    if (
      status === 401 &&
      !isPublicRequest &&
      originalRequest?._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      const token = await getToken();
      if (originalRequest.headers?.Authorization === `Bearer ${token}`) {
        await Promise.all([deleteToken(), deleteRefreshToken()]);
        notifySessionExpired();
      }
    }

    const responseData = error.response?.data;
    const apiError = responseData?.error;
    let message = apiError?.message ?? responseData?.message ?? error.message;

    if (!error.response) {
      message = `Tidak dapat terhubung ke server (${API_BASE_URL}). Periksa koneksi internet atau konfigurasi DNS/SSL API.`;
    }

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
