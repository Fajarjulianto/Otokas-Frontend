import { randomUUID } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "otokas_device_id";

export async function getDeviceId(): Promise<string> {
  try {
    const savedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (savedId) {
      return savedId;
    }

    const newId =
      typeof randomUUID === "function"
        ? randomUUID()
        : `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error("Gagal mengambil Device ID:", error);
    return typeof randomUUID === "function"
      ? randomUUID()
      : `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
