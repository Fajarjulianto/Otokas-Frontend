import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { api } from "../api";
import { notifySessionExpired } from "../authSession";

jest.mock("axios", () => {
  const fetch = globalThis.fetch;
  // These tests use an in-memory adapter, not Expo's fetch streams.
  Object.defineProperty(globalThis, "fetch", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  const actual = jest.requireActual(
    "../../../node_modules/axios/dist/node/axios.cjs",
  );
  globalThis.fetch = fetch;
  return actual;
});
let mockToken: string | null = "old";
let mockRefresh: string | null = "refresh";
jest.mock("../secureToken", () => ({
  getToken: jest.fn(async () => mockToken),
  getRefreshToken: jest.fn(async () => mockRefresh),
  saveToken: jest.fn(async (value) => {
    mockToken = value;
  }),
  saveRefreshToken: jest.fn(async (value) => {
    mockRefresh = value;
  }),
  deleteToken: jest.fn(async () => {
    mockToken = null;
  }),
  deleteRefreshToken: jest.fn(async () => {
    mockRefresh = null;
  }),
}));
jest.mock("../authSession", () => ({ notifySessionExpired: jest.fn() }));
jest.mock("@/src/utils/getDeviceID", () => ({
  getDeviceId: jest.fn(async () => "device"),
}));

const response = (
  config: InternalAxiosRequestConfig,
  data = {},
  status = 200,
) => ({ config, data, status, statusText: "", headers: {} });
const unauthorized = (config: InternalAxiosRequestConfig) =>
  new AxiosError(
    "Unauthorized",
    "ERR_BAD_REQUEST",
    config,
    {},
    response(config, { message: "Unauthorized" }, 401),
  );

beforeEach(() => {
  mockToken = "old";
  mockRefresh = "refresh";
  jest.clearAllMocks();
  api.defaults.headers.common.Authorization = "Bearer stale-default";
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it("always replaces an outdated Axios default with the stored token", async () => {
  mockToken = "current";
  api.defaults.adapter = async (config) => {
    expect(config.headers.Authorization).toBe("Bearer current");
    return response(config);
  };
  await api.get("/users/profile");
});

it("refreshes concurrent unauthorized requests once and uses the new token on future calls", async () => {
  let refreshCount = 0;
  api.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh") {
      refreshCount++;
      expect(config.headers.Authorization).toBeUndefined();
      await new Promise((resolve) => setTimeout(resolve, 5));
      return response(config, { data: { access_token: "new" } });
    }
    if (config.headers.Authorization !== "Bearer new")
      throw unauthorized(config);
    return response(config, { dealerName: "Fajar Motor" });
  };
  await Promise.all([api.get("/users/profile"), api.get("/users/profile")]);
  await api.get("/users/profile");
  expect(refreshCount).toBe(1);
  expect(mockToken).toBe("new");
});

it("keeps credentials when refresh fails due to a network error", async () => {
  api.defaults.adapter = async (config) => {
    if (config.url === "/auth/refresh")
      throw new AxiosError("Network Error", "ERR_NETWORK", config);
    throw unauthorized(config);
  };
  await expect(api.get("/users/profile")).rejects.toThrow(
    "Tidak dapat terhubung",
  );
  expect(mockToken).toBe("old");
  expect(mockRefresh).toBe("refresh");
  expect(notifySessionExpired).not.toHaveBeenCalled();
});

it("clears invalid credentials and notifies the auth context", async () => {
  api.defaults.adapter = async (config) => {
    throw unauthorized(config);
  };
  await expect(api.get("/users/profile")).rejects.toThrow(
    "Sesi login berakhir",
  );
  expect(mockToken).toBeNull();
  expect(mockRefresh).toBeNull();
  expect(notifySessionExpired).toHaveBeenCalledTimes(1);
});

it("does not attach credentials to password reset", async () => {
  api.defaults.adapter = async (config) => {
    expect(config.headers.Authorization).toBeUndefined();
    return response(config);
  };
  await api.post("/users/request-password-reset", {
    email: "test@example.com",
  });
});

it("uses the explicit login token without renewing the previous session", async () => {
  api.defaults.adapter = async (config) => {
    expect(config.headers.Authorization).toBe("Bearer login-token");
    throw unauthorized(config);
  };
  await expect(
    api.get("/users/profile", {
      authTokenOverride: "login-token",
      skipAuthRefresh: true,
    }),
  ).rejects.toThrow("Unauthorized");
  expect(mockToken).toBe("old");
  expect(notifySessionExpired).not.toHaveBeenCalled();
});
