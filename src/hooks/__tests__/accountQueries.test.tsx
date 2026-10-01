import { act, renderHook } from "@testing-library/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { AccountQueries } from "@/src/components/providers/AccountQueries";
import { useAuthContext } from "@/src/context/authContext";
jest.mock("expo-router", () => ({ usePathname: () => "/stok" }));
jest.mock("@/src/context/authContext", () => ({ useAuthContext: jest.fn() }));
jest.mock("@/src/services/subscriptionServices", () => ({
  fetchSubscriptionStatus: jest
    .fn()
    .mockResolvedValue({ isPremium: false, tier: "FREE", status: "ACTIVE" }),
}));
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
it("replaces and clears all account caches on account switch and logout", async () => {
  const updateUser = jest.fn();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: "one", email: "one@example.com", isPremium: false },
    updateUser,
  } as never);
  const { result, rerender, unmount } = await renderHook(
    () => useQueryClient(),
    { wrapper: AccountQueries },
  );
  const first = result.current;
  await act(async () => {
    first.setQueryData(["motors"], [{ id: "private-one" }]);
  });
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: "two", email: "two@example.com", isPremium: false },
    updateUser,
  } as never);
  await rerender(undefined);
  expect(result.current).not.toBe(first);
  expect(result.current.getQueryData(["motors"])).toBeUndefined();
  expect(first.getQueryData(["motors"])).toBeUndefined();
  const second = result.current;
  jest
    .mocked(useAuthContext)
    .mockReturnValue({ user: null, updateUser } as never);
  await rerender(undefined);
  expect(result.current).not.toBe(second);
  await unmount();
});

it("synchronizes confirmed premium into profile cache and auth state", async () => {
  const updateUser = jest.fn();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: "one", email: "one@example.com", isPremium: false },
    updateUser,
  } as never);
  const { result, unmount } = await renderHook(() => useQueryClient(), {
    wrapper: AccountQueries,
  });
  await act(async () => {
    await result.current.cancelQueries({
      queryKey: ["subscription", "status"],
    });
    result.current.setQueryData(["user", "profile"], {
      id: "one",
      isPremium: false,
    });
    result.current.setQueryData(["subscription", "status"], {
      tier: "PREMIUM",
      status: "ACTIVE",
      isPremium: true,
      subdomain: "fajar-motor",
    });
    await jest.advanceTimersByTimeAsync(1);
  });
  expect(result.current.getQueryData(["user", "profile"])).toMatchObject({
    isPremium: true,
    subdomain: "fajar-motor",
  });
  expect(updateUser).toHaveBeenCalledWith({
    isPremium: true,
    subdomain: "fajar-motor",
  });
  await unmount();
});
