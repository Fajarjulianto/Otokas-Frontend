import { randomUUID } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "otokas_device_id";

function createDeviceId(): string {
  try {
    if (typeof randomUUID === "function") {
      return randomUUID();
    }
  } catch {
    // WebCrypto can be unavailable on non-secure web origins.
  }

  return `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getDeviceId(): Promise<string> {
  // SecureStore is native-only. Use localStorage on web so development in
  // Expo Web does not throw an expected SecureStore availability error.
  if (Platform.OS === "web") {
    try {
      const savedId = globalThis.localStorage?.getItem(DEVICE_ID_KEY);
      if (savedId) {
        return savedId;
      }

      const newId = createDeviceId();
      globalThis.localStorage?.setItem(DEVICE_ID_KEY, newId);
      return newId;
    } catch {
      return createDeviceId();
    }
  }

  try {
    const savedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (savedId) {
      return savedId;
    }

    const newId = createDeviceId();

    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error("Gagal mengambil Device ID:", error);
    return createDeviceId();
  }
}
