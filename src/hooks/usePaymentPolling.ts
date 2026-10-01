import { useEffect, useState } from "react";
import { AppState } from "react-native";
export function paymentState(
  premium: boolean,
  redirectStatus: string,
): "success" | "pending" | "failed" {
  return premium
    ? "success"
    : redirectStatus === "failed"
      ? "failed"
      : "pending";
}
export function usePaymentPolling(
  premium: boolean,
  refetch: () => Promise<unknown>,
) {
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (premium) {
      setTimedOut(false);
      return;
    }
    let stopped = false;
    let running = false;
    const deadline = Date.now() + 90000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      if (stopped || running) return;
      if (Date.now() >= deadline) {
        setTimedOut(true);
        return;
      }
      if (AppState.currentState !== "active") return;
      running = true;
      try {
        await refetch();
      } catch {
        /* The query reports network errors; keep checking until the deadline. */
      } finally {
        running = false;
      }
      if (!stopped) timer = setTimeout(() => void poll(), 2000);
    };
    void poll();
    const listener = AppState.addEventListener("change", (state) => {
      if (timer) clearTimeout(timer);
      if (state === "active") void poll();
    });
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      listener.remove();
    };
  }, [premium, refetch, attempt]);
  return {
    timedOut,
    retry: () => {
      setTimedOut(false);
      setAttempt((value) => value + 1);
    },
  };
}
