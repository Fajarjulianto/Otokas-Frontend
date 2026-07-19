import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/src/constants/storage";
import * as SecureStore from "expo-secure-store";

/**
 * Secure token storage using expo-secure-store.
 * Tokens are encrypted at rest using the device's keychain (iOS) / keystore (Android).
 */

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Refresh token (README §1: POST /auth/refresh accepts refresh_token) ──
export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
