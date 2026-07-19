import * as Application from "expo-application";
import { Platform } from "react-native";

export async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === "android") {
      return Application.getAndroidId() || "unknown-android";
    }

    if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId || "unknown-ios";
    }

    return "unknown-device";
  } catch (error) {
    console.error("Gagal mengambil Device ID:", error);
    return "fallback-id";
  }
}
