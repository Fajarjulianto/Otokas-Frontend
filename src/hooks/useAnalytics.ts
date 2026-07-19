import {
  fetchBestSelling,
  fetchDailySellingReport,
  fetchIncomingStockReport,
  fetchWeeklySellingReport,
} from "@/src/services/analyticsServices";
import { useQuery } from "@tanstack/react-query";

export const analyticsKeys = {
  dailySelling: (date: string) =>
    ["analytics", "selling", "daily", date] as const,
  weeklySelling: (date: string) =>
    ["analytics", "selling", "weekly", date] as const,
  incomingStock: (date: string) =>
    ["analytics", "incoming-stock", date] as const,
  bestSelling: (limit: number) =>
    ["analytics", "best-selling", limit] as const,
};

export function useDailySellingReport(date: string) {
  return useQuery({
    queryKey: analyticsKeys.dailySelling(date),
    queryFn: () => fetchDailySellingReport(date),
    enabled: !!date,
  });
}

export function useWeeklySellingReport(date: string) {
  return useQuery({
    queryKey: analyticsKeys.weeklySelling(date),
    queryFn: () => fetchWeeklySellingReport(date),
    enabled: !!date,
  });
}

export function useIncomingStockReport(date: string) {
  return useQuery({
    queryKey: analyticsKeys.incomingStock(date),
    queryFn: () => fetchIncomingStockReport(date),
    enabled: !!date,
  });
}

export function useBestSelling(limit = 5) {
  return useQuery({
    queryKey: analyticsKeys.bestSelling(limit),
    queryFn: () => fetchBestSelling(limit),
  });
}
