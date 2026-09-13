import type { Motor } from "@/src/types/motor";
import type { DisplayData, SoldMotor } from "@/src/types/report";

export type ReportPeriod = "harian" | "mingguan" | "bulanan";

function startOfPeriod(period: ReportPeriod, referenceDate: Date): Date {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  if (period === "mingguan") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
  } else if (period === "bulanan") {
    start.setDate(1);
  }

  return start;
}

function endOfPeriod(period: ReportPeriod, referenceDate: Date): Date {
  const end = new Date(referenceDate);

  if (period === "mingguan") {
    const daysUntilSunday = (7 - end.getDay()) % 7;
    end.setDate(end.getDate() + daysUntilSunday);
  } else if (period === "bulanan") {
    end.setMonth(end.getMonth() + 1, 0);
  }

  end.setHours(23, 59, 59, 999);
  return end;
}

export function getSoldMotorsForPeriod(
  motors: Motor[],
  period: ReportPeriod,
  referenceDate = new Date(),
): Motor[] {
  const start = startOfPeriod(period, referenceDate).getTime();
  const end = endOfPeriod(period, referenceDate).getTime();

  return motors.filter((motor) => {
    if (motor.status !== "SOLD" || !motor.soldAt) return false;

    const soldAt = new Date(motor.soldAt).getTime();
    return !Number.isNaN(soldAt) && soldAt >= start && soldAt <= end;
  });
}

function toSoldMotor(motor: Motor): SoldMotor {
  return {
    id: motor.id,
    brand: motor.brand,
    name: motor.name,
    plateNumber: motor.plateNumber ?? "",
    sellingPrice: motor.sellingPrice ?? 0,
  };
}

export function buildReportStats(motors: Motor[]): DisplayData {
  const revenue = motors.reduce(
    (total, motor) => total + (motor.sellingPrice ?? 0),
    0,
  );
  const profit = motors.reduce(
    (total, motor) =>
      total +
      (motor.sellingPrice == null
        ? 0
        : motor.sellingPrice - motor.buyingPrice),
    0,
  );
  const margins = motors
    .filter((motor) => motor.buyingPrice > 0 && motor.sellingPrice != null)
    .map(
      (motor) =>
        (((motor.sellingPrice ?? 0) - motor.buyingPrice) /
          motor.buyingPrice) *
        100,
    );
  const margin =
    margins.length > 0
      ? Math.round(
          (margins.reduce((total, current) => total + current, 0) /
            margins.length) *
            100,
        ) / 100
      : 0;

  return {
    revenue,
    sold: motors.length,
    margin,
    profit,
    motors: motors.map(toSoldMotor),
  };
}
