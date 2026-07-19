import { api } from "@/src/lib/api";
import {
  formatDateParam,
  formatMonthParam,
  fetchDailySellingReport,
  fetchWeeklySellingReport,
  fetchIncomingStockReport,
  fetchBestSelling,
} from "../analyticsServices";

jest.mock("@/src/lib/api", () => ({
  api: { get: jest.fn() },
}));

describe("analyticsServices", () => {
  afterEach(() => jest.clearAllMocks());

  describe("formatDateParam", () => {
    it("formats date as DD-MM-YYYY", () => {
      const d = new Date(2026, 5, 23); // June 23
      expect(formatDateParam(d)).toBe("23-06-2026");
    });
    it("pads single-digit day and month", () => {
      const d = new Date(2026, 0, 5); // Jan 5
      expect(formatDateParam(d)).toBe("05-01-2026");
    });
  });

  describe("formatMonthParam", () => {
    it("formats date as MM-YYYY", () => {
      const d = new Date(2026, 11, 1); // December
      expect(formatMonthParam(d)).toBe("12-2026");
    });
    it("pads single-digit month", () => {
      const d = new Date(2026, 0, 1); // January
      expect(formatMonthParam(d)).toBe("01-2026");
    });
  });

  describe("fetchDailySellingReport", () => {
    it("sends GET with date param and returns entries array", async () => {
      const report = [
        { date: "2026-06-23", count: 2, revenue: 30000000, motors: [] },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: report } });
      const r = await fetchDailySellingReport("23-06-2026");
      expect(api.get).toHaveBeenCalledWith("/dashboard/selling-report/daily", { params: { date: "23-06-2026" } });
      expect(r[0].count).toBe(2);
    });
  });

  describe("fetchWeeklySellingReport", () => {
    it("sends GET with date param and returns entries array", async () => {
      const report = [
        { date: "2026-06-23", count: 5, revenue: 75000000, motors: [] },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: report } });
      const r = await fetchWeeklySellingReport("23-06-2026");
      expect(api.get).toHaveBeenCalledWith("/dashboard/selling-report/weekly", { params: { date: "23-06-2026" } });
      expect(r[0].count).toBe(5);
    });
  });

  describe("fetchIncomingStockReport", () => {
    it("sends GET with date param and returns entries array", async () => {
      const report = [{ date: "2026-06-23", count: 3, totalBuyingPrice: 45000000 }];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: report } });
      const r = await fetchIncomingStockReport("23-06-2026");
      expect(api.get).toHaveBeenCalledWith("/dashboard/incoming-stock/report", { params: { date: "23-06-2026" } });
      expect(r[0].count).toBe(3);
    });
  });

  describe("fetchBestSelling", () => {
    it("sends GET /dashboard/best-selling with limit param", async () => {
      const report = [
        { brand: "Honda", name: "Beat FI", totalSold: 12, totalRevenue: 180000000 },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: report } });
      const r = await fetchBestSelling(5);
      expect(api.get).toHaveBeenCalledWith("/dashboard/best-selling", { params: { limit: 5 } });
      expect(r[0].totalSold).toBe(12);
    });
  });
});
