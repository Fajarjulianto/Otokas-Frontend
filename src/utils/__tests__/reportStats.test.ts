import type { Motor } from "@/src/types/motor";
import { buildReportStats, getSoldMotorsForPeriod } from "../reportStats";

const referenceDate = new Date(2026, 7, 21, 12);

function motor(overrides: Partial<Motor>): Motor {
  return {
    id: "motor-1",
    brand: "Honda",
    name: "Beat",
    buyingPrice: 10_000_000,
    sellingPrice: 12_000_000,
    status: "SOLD",
    isIncomplete: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("reportStats", () => {
  const motors = [
    motor({ id: "today", soldAt: new Date(2026, 7, 21, 9).toISOString() }),
    motor({ id: "this-week", soldAt: new Date(2026, 7, 17, 9).toISOString() }),
    motor({ id: "this-month", soldAt: new Date(2026, 7, 2, 9).toISOString() }),
    motor({ id: "last-month", soldAt: new Date(2026, 6, 31, 9).toISOString() }),
    motor({ id: "available", status: "AVAILABLE", soldAt: null }),
  ];

  it("includes a sale made today in daily, weekly, and monthly periods", () => {
    expect(
      getSoldMotorsForPeriod(motors, "harian", referenceDate).map(
        (item) => item.id,
      ),
    ).toEqual(["today"]);
    expect(
      getSoldMotorsForPeriod(motors, "mingguan", referenceDate).map(
        (item) => item.id,
      ),
    ).toEqual(["today", "this-week"]);
    expect(
      getSoldMotorsForPeriod(motors, "bulanan", referenceDate).map(
        (item) => item.id,
      ),
    ).toEqual(["today", "this-week", "this-month"]);
  });

  it("calculates revenue, sold units, profit, and average margin", () => {
    const result = buildReportStats([
      motor({ id: "one" }),
      motor({
        id: "two",
        buyingPrice: 20_000_000,
        sellingPrice: 25_000_000,
      }),
    ]);

    expect(result).toMatchObject({
      revenue: 37_000_000,
      sold: 2,
      profit: 7_000_000,
      margin: 22.5,
    });
    expect(result.motors.map((item) => item.id)).toEqual(["one", "two"]);
  });
});
