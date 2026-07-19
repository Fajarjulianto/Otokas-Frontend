import { Platform } from "react-native";

import * as Application from "expo-application";
import { getDeviceId } from "../getDeviceID";

// ── Mocks ──
jest.mock("expo-application", () => ({
  getAndroidId: jest.fn(),
  getIosIdForVendorAsync: jest.fn(),
}));

describe("getDeviceId", () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    jest.resetAllMocks();
    // Restore original platform
    Object.defineProperty(Platform, "OS", { value: originalOS });
  });

  // ── Android ──
  describe("Android", () => {
    beforeEach(() => {
      Object.defineProperty(Platform, "OS", { value: "android" });
    });

    it("returns Android ID when available", async () => {
      (Application.getAndroidId as jest.Mock).mockReturnValue("android-123");
      const id = await getDeviceId();
      expect(id).toBe("android-123");
    });

    it('returns "unknown-android" when Android ID is empty', async () => {
      (Application.getAndroidId as jest.Mock).mockReturnValue("");
      const id = await getDeviceId();
      expect(id).toBe("unknown-android");
    });

    it('returns "unknown-android" when Android ID is null', async () => {
      (Application.getAndroidId as jest.Mock).mockReturnValue(null);
      const id = await getDeviceId();
      expect(id).toBe("unknown-android");
    });
  });

  // ── iOS ──
  describe("iOS", () => {
    beforeEach(() => {
      Object.defineProperty(Platform, "OS", { value: "ios" });
    });

    it("returns iOS Vendor ID when available", async () => {
      (Application.getIosIdForVendorAsync as jest.Mock).mockResolvedValue(
        "ios-vendor-456"
      );
      const id = await getDeviceId();
      expect(id).toBe("ios-vendor-456");
    });

    it('returns "unknown-ios" when iOS Vendor ID is null', async () => {
      (Application.getIosIdForVendorAsync as jest.Mock).mockResolvedValue(null);
      const id = await getDeviceId();
      expect(id).toBe("unknown-ios");
    });
  });

  // ── Other platforms ──
  it('returns "unknown-device" for unsupported platform', async () => {
    Object.defineProperty(Platform, "OS", { value: "web" });
    const id = await getDeviceId();
    expect(id).toBe("unknown-device");
  });

  // ── Error handling ──
  it('returns "fallback-id" when an exception is thrown', async () => {
    Object.defineProperty(Platform, "OS", { value: "android" });
    (Application.getAndroidId as jest.Mock).mockImplementation(() => {
      throw new Error("Simulated failure");
    });
    const id = await getDeviceId();
    expect(id).toBe("fallback-id");
  });
});
