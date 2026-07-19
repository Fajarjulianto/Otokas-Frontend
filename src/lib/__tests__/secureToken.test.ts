// ── Mocks ──
import * as SecureStore from "expo-secure-store";
import { saveToken, getToken, deleteToken } from "../secureToken";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe("secureToken", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── saveToken ──
  describe("saveToken", () => {
    it("stores token using SecureStore", async () => {
      await saveToken("my-jwt-token");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "otokas_secure_token",
        "my-jwt-token"
      );
    });

    it("calls setItemAsync exactly once", async () => {
      await saveToken("token-abc");
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    });
  });

  // ── getToken ──
  describe("getToken", () => {
    it("returns token when it exists", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("stored-token");
      const token = await getToken();
      expect(token).toBe("stored-token");
    });

    it("returns null when no token exists", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const token = await getToken();
      expect(token).toBeNull();
    });

    it("reads from the correct key", async () => {
      await getToken();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        "otokas_secure_token"
      );
    });
  });

  // ── deleteToken ──
  describe("deleteToken", () => {
    it("deletes token from SecureStore", async () => {
      await deleteToken();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "otokas_secure_token"
      );
    });

    it("calls deleteItemAsync exactly once", async () => {
      await deleteToken();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });
  });
});
