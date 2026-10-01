import { api } from "@/src/lib/api";
import type {
  BestSellingEntry,
  IncomingStockEntry,
  SellingReportEntry,
} from "../types/report";

export function formatDateParam(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}
export function formatMonthParam(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}-${date.getFullYear()}`;
}

// ── Daily Selling Report
export async function fetchDailySellingReport(
  date: string,
): Promise<SellingReportEntry[]> {
  const { data } = await api.get<{ data: SellingReportEntry[] }>(
    "/dashboard/selling-report/daily",
    { params: { date } },
  );
  return data.data ?? [];
}

// ── Weekly Selling Report
export async function fetchWeeklySellingReport(
  date: string,
): Promise<SellingReportEntry[]> {
  const { data } = await api.get<{ data: SellingReportEntry[] }>(
    "/dashboard/selling-report/weekly",
    { params: { date } },
  );
  return data.data ?? [];
}

// ── Incoming Stock Report
export async function fetchIncomingStockReport(
  date: string,
): Promise<IncomingStockEntry[]> {
  const { data } = await api.get<{ data: IncomingStockEntry[] }>(
    "/dashboard/incoming-stock/report",
    { params: { date } },
  );
  return data.data ?? [];
}

// ── Best-selling motors
export async function fetchBestSelling(limit = 5): Promise<BestSellingEntry[]> {
  const { data } = await api.get<{ data: BestSellingEntry[] }>(
    "/dashboard/best-selling",
    { params: { limit } },
  );
  return data.data ?? [];
}
