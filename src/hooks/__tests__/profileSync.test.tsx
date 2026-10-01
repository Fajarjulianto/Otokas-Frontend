import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProfile, useUpdateProfile, userKeys } from "../useUser";
import { useAuthContext } from "@/src/context/authContext";
import { fetchProfile, updateProfile } from "@/src/services/userServices";

jest.mock("@/src/context/authContext", () => ({ useAuthContext: jest.fn() }));
jest.mock("@/src/services/userServices", () => ({
  fetchProfile: jest.fn(),
  updateProfile: jest.fn(),
}));
const profile = {
  id: "user",
  email: "test@example.com",
  dealerName: "Fajar Motor",
  address: "Jl. Lama",
  phoneNumber: "081234567890",
};
const updateUser = jest.fn();
let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: 0 },
    },
  });
  jest
    .mocked(useAuthContext)
    .mockReturnValue({
      user: { id: "user", email: profile.email },
      updateUser,
    } as never);
});
afterEach(() => client.clear());
it("loads the registered showroom name into the profile and auth state", async () => {
  jest.mocked(fetchProfile).mockResolvedValue(profile);
  const { result, unmount } = await renderHook(() => useProfile(), { wrapper });
  await waitFor(() =>
    expect(result.current.data?.dealerName).toBe("Fajar Motor"),
  );
  expect(updateUser).toHaveBeenCalledWith(
    expect.objectContaining({ dealerName: "Fajar Motor", address: "Jl. Lama" }),
  );
  await unmount();
});
it("updates cached dashboard data and clears removed fields after saving", async () => {
  client.setQueryData(userKeys.profile, profile);
  jest
    .mocked(updateProfile)
    .mockResolvedValue({
      ...profile,
      dealerName: "Motor Baru",
      phoneNumber: null,
      address: null,
    });
  const { result, unmount } = await renderHook(() => useUpdateProfile(), {
    wrapper,
  });
  await act(async () => {
    await result.current.mutateAsync({
      dealerName: "Motor Baru",
      phoneNumber: null,
      address: null,
    });
  });
  expect(client.getQueryData(userKeys.profile)).toMatchObject({
    dealerName: "Motor Baru",
    phoneNumber: null,
    address: null,
  });
  expect(updateUser).toHaveBeenCalledWith({
    dealerName: "Motor Baru",
    phoneNumber: "",
    address: "",
  });
  await unmount();
});
