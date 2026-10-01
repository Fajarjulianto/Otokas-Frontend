import { act, renderHook } from "@testing-library/react-native";
import { AppState } from "react-native";
import { paymentState, usePaymentPolling } from "../usePaymentPolling";
beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    writable: true,
  });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
it("never grants premium based on redirect success", () => {
  expect(paymentState(false, "success")).toBe("pending");
  expect(paymentState(true, "pending")).toBe("success");
});
it("checks immediately, polls, stops at timeout, and restarts when requested", async () => {
  const refetch = jest.fn().mockResolvedValue({});
  const { result, unmount } = await renderHook(() =>
    usePaymentPolling(false, refetch),
  );
  expect(refetch).toHaveBeenCalledTimes(1);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(2000);
  });
  expect(refetch).toHaveBeenCalledTimes(2);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(90000);
  });
  expect(result.current.timedOut).toBe(true);
  const count = refetch.mock.calls.length;
  await act(async () => result.current.retry());
  expect(refetch).toHaveBeenCalledTimes(count + 1);
  expect(result.current.timedOut).toBe(false);
  await unmount();
});
it("stops once active and does not poll in background", async () => {
  const refetch = jest.fn().mockResolvedValue({});
  const { rerender, unmount } = await renderHook<
    { timedOut: boolean; retry: () => void },
    { premium: boolean }
  >(({ premium }) => usePaymentPolling(premium, refetch), {
    initialProps: { premium: false },
  });
  Object.defineProperty(AppState, "currentState", {
    value: "background",
    writable: true,
  });
  await act(async () => {
    await jest.advanceTimersByTimeAsync(4000);
  });
  expect(refetch).toHaveBeenCalledTimes(1);
  await rerender({ premium: true });
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    writable: true,
  });
  await act(async () => {
    await jest.advanceTimersByTimeAsync(4000);
  });
  expect(refetch).toHaveBeenCalledTimes(1);
  await unmount();
});
