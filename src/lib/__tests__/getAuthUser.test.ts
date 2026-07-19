// ── Mocks ──
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "@/src/lib/secureToken";
import { getAuthUser } from "../getAuthUser";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock("@/src/lib/secureToken", () => ({
  getToken: jest.fn(),
  saveToken: jest.fn().mockResolvedValue(undefined),
  deleteToken: jest.fn().mockResolvedValue(undefined),
}));

describe("getAuthUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns user with token when both exist", async () => {
    const storedUser = {
      id: "user-1",
      email: "test@example.com",
      dealerName: "Dealer ABC",
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(storedUser)
    );
    (getToken as jest.Mock).mockResolvedValue("jwt-token-123");

    const user = await getAuthUser();
    expect(user).toEqual({
      ...storedUser,
      token: "jwt-token-123",
    });
  });

  it("returns user without token when token is null", async () => {
    const storedUser = {
      id: "user-2",
      email: "user2@test.com",
      dealerName: "Dealer XYZ",
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(storedUser)
    );
    (getToken as jest.Mock).mockResolvedValue(null);

    const user = await getAuthUser();
    expect(user).toEqual(storedUser);
    expect(user.token).toBeUndefined();
  });

  it("throws error when no user is stored", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await expect(getAuthUser()).rejects.toThrow(
      "User tidak ditemukan. Silakan login ulang."
    );
  });

  it("reads from the correct AsyncStorage key", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ email: "a@b.com" })
    );
    (getToken as jest.Mock).mockResolvedValue(null);

    await getAuthUser();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("otokas_auth_user");
  });
});
