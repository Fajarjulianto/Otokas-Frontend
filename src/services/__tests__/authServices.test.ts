// ── Mocks ──
import { api, extractData } from "@/src/lib/api";
import { getDeviceId } from "@/src/utils/getDeviceID";
import {
  register,
  login,
  logout,
  refreshToken,
  fetchMe,
} from "../authServices";

jest.mock("@/src/lib/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
  extractData: jest.fn((response) => response.data?.data ?? response.data),
}));

jest.mock("@/src/utils/getDeviceID", () => ({
  getDeviceId: jest.fn().mockResolvedValue("mock-device-id"),
}));

jest.mock("@/src/lib/secureToken", () => ({
  getRefreshToken: jest.fn().mockResolvedValue("stored-refresh"),
}));

describe("authServices", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── register ──
  describe("register", () => {
    it("sends POST to /auth/register with payload", async () => {
      const mockResponse = {
        data: {
          message: "User created",
          user: { id: "u1", email: "test@mail.com", createdAt: "2026-01-01" },
        },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await register({
        email: "test@mail.com",
        password: "Str0ng!",
        dealerName: "Test Dealer",
      });

      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        email: "test@mail.com",
        password: "Str0ng!",
        dealerName: "Test Dealer",
        deviceId: "mock-device-id",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("propagates API errors", async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error("Network error"));
      await expect(
        register({
          email: "a@b.com",
          password: "pass",
          dealerName: "D",
        })
      ).rejects.toThrow("Network error");
    });
  });

  // ── login ──
  describe("login", () => {
    it("sends POST to /auth/login with payload + deviceId", async () => {
      const tokenResponse = {
        data: {
          access_token: "jwt-abc",
          refresh_token: "refresh-xyz",
        },
      };
      (api.post as jest.Mock).mockResolvedValue(tokenResponse);

      const result = await login({
        email: "user@test.com",
        password: "p@ss",
      });

      expect(getDeviceId).toHaveBeenCalled();
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "user@test.com",
        password: "p@ss",
        deviceId: "mock-device-id",
      });
      expect(result.access_token).toBe("jwt-abc");
    });

    it("includes deviceId from getDeviceId", async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { access_token: "t", refresh_token: "r" },
      });

      await login({ email: "a@b.com", password: "x" });

      const [, body] = (api.post as jest.Mock).mock.calls[0];
      expect(body.deviceId).toBe("mock-device-id");
    });
  });

  // ── logout ──
  describe("logout", () => {
    it("sends DELETE to /auth/logout with refresh_token body", async () => {
      (api.delete as jest.Mock).mockResolvedValue({});
      await logout();
      expect(api.delete).toHaveBeenCalledWith("/auth/logout", {
        data: { refresh_token: "stored-refresh" },
      });
    });
  });

  // ── refreshToken ──
  describe("refreshToken", () => {
    it("sends POST to /auth/refresh with refresh_token + deviceId", async () => {
      const mockData = {
        data: { access_token: "new-jwt", refresh_token: "new-refresh" },
      };
      (api.post as jest.Mock).mockResolvedValue(mockData);

      const result = await refreshToken();
      expect(api.post).toHaveBeenCalledWith("/auth/refresh", {
        refresh_token: "stored-refresh",
        deviceId: "mock-device-id",
      });
      expect(result.access_token).toBe("new-jwt");
    });
  });

  // ── fetchMe ──
  describe("fetchMe", () => {
    it("sends GET to /auth/me and extracts user data", async () => {
      const mockResponse = {
        data: {
          data: {
            userId: "u1",
            email: "me@test.com",
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);
      (extractData as jest.Mock).mockReturnValue({
        userId: "u1",
        email: "me@test.com",
      });

      const result = await fetchMe();
      expect(api.get).toHaveBeenCalledWith("/auth/me", {});
      expect(result.id).toBe("u1");
      expect(result.email).toBe("me@test.com");
    });

    it("passes Authorization header when token is provided", async () => {
      const mockResponse = { data: { data: { email: "a@b.com" } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);
      (extractData as jest.Mock).mockReturnValue({ email: "a@b.com" });

      await fetchMe("custom-token");
      expect(api.get).toHaveBeenCalledWith("/auth/me", {
        headers: { Authorization: "Bearer custom-token" },
      });
    });

    it("throws when user data is invalid (no email)", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: {} });
      (extractData as jest.Mock).mockReturnValue({});

      await expect(fetchMe()).rejects.toThrow(
        "Format response auth/me dari server tidak sesuai."
      );
    });

    it("throws when extractData returns null", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: null });
      (extractData as jest.Mock).mockReturnValue(null);

      await expect(fetchMe()).rejects.toThrow(
        "Format response auth/me dari server tidak sesuai."
      );
    });
  });
});
