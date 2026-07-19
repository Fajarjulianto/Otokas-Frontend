// ── Mocks ──
import { api, extractData } from "@/src/lib/api";
import {
  fetchProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from "../userServices";

jest.mock("@/src/lib/api", () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
  extractData: jest.fn((response) => response.data?.data ?? response.data),
}));

describe("userServices", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── fetchProfile ──
  describe("fetchProfile", () => {
    it("sends GET /users/profile and returns extracted user", async () => {
      const profile = {
        id: "u1",
        email: "user@test.com",
        dealerName: "Dealer A",
        isPremium: false,
        isEmailVerified: true,
      };
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: profile },
      });
      (extractData as jest.Mock).mockReturnValue(profile);

      const result = await fetchProfile();
      expect(api.get).toHaveBeenCalledWith("/users/profile");
      expect(result).toEqual(profile);
    });

    it("throws when extractData returns null", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: null });
      (extractData as jest.Mock).mockReturnValue(null);

      await expect(fetchProfile()).rejects.toThrow(
        "Gagal mengambil data profil dari server."
      );
    });

    it("throws when extractData returns undefined", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: undefined });
      (extractData as jest.Mock).mockReturnValue(undefined);

      await expect(fetchProfile()).rejects.toThrow(
        "Gagal mengambil data profil dari server."
      );
    });
  });

  // ── updateProfile ──
  describe("updateProfile", () => {
    it("sends PATCH /users/profile with payload", async () => {
      const updated = {
        id: "u1",
        email: "user@test.com",
        dealerName: "New Name",
        isPremium: false,
        isEmailVerified: true,
      };
      (api.patch as jest.Mock).mockResolvedValue({
        data: { data: updated },
      });
      (extractData as jest.Mock).mockReturnValue(updated);

      const result = await updateProfile({ dealerName: "New Name" });
      expect(api.patch).toHaveBeenCalledWith("/users/profile", {
        dealerName: "New Name",
      });
      expect(result.dealerName).toBe("New Name");
    });
  });

  // ── requestPasswordReset ──
  describe("requestPasswordReset", () => {
    it("sends POST /users/request-password-reset with email", async () => {
      (api.post as jest.Mock).mockResolvedValue({});
      await requestPasswordReset("user@test.com");
      expect(api.post).toHaveBeenCalledWith("/users/request-password-reset", {
        email: "user@test.com",
      });
    });
  });

  // ── resetPassword ──
  describe("resetPassword", () => {
    it("sends POST /users/reset-password with email, otp and newPassword", async () => {
      (api.post as jest.Mock).mockResolvedValue({});
      await resetPassword("user@test.com", "123456", "NewP@ss123");
      expect(api.post).toHaveBeenCalledWith("/users/reset-password", {
        email: "user@test.com",
        otp: "123456",
        newPassword: "NewP@ss123",
      });
    });
  });

  // ── verifyEmail ──
  describe("verifyEmail", () => {
    it("sends POST /users/verify-email with email and token", async () => {
      (api.post as jest.Mock).mockResolvedValue({});
      await verifyEmail("user@test.com", "verify-token");
      expect(api.post).toHaveBeenCalledWith("/users/verify-email", {
        email: "user@test.com",
        token: "verify-token",
      });
    });
  });
});
