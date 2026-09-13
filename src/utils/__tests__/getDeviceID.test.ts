import { randomUUID } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { getDeviceId } from "../getDeviceID";

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe("getDeviceId", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns a previously saved device ID", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("saved-id");

    await expect(getDeviceId()).resolves.toBe("saved-id");
    expect(randomUUID).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("creates and stores a UUID when no device ID exists", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (randomUUID as jest.Mock).mockReturnValue("generated-id");
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    await expect(getDeviceId()).resolves.toBe("generated-id");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "otokas_device_id",
      "generated-id",
    );
  });

  it("returns a unique fallback UUID when secure storage throws", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (randomUUID as jest.Mock).mockReturnValue("fallback-uuid");
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
      new Error("Simulated failure"),
    );

    await expect(getDeviceId()).resolves.toBe("fallback-uuid");
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
