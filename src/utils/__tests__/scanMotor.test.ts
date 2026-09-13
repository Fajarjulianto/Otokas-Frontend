import type { OcrResult } from "@/src/types/scan";
import {
  getScanDataWarning,
  hasRequiredScanData,
  normalizeScanResult,
  toMotorInsertFromScan,
} from "../scanMotor";

const scanResult: OcrResult = {
  brand: " Honda ",
  name: " Revo Fit ",
  frameNumber: " MH1HB211XJK123456 ",
  engineNumber: " HB21E1123456 ",
  year: 2021,
  plateNumber: " B 1234 ABC ",
  color: " Hitam ",
  category: "CUB",
  stnkCode: " NC11D1CF ",
  displacement: 110,
  isAmbiguous: false,
  isIncomplete: false,
  remarks: "",
};

describe("scanMotor", () => {
  it("normalizes numeric and boolean strings returned by AI", () => {
    expect(
      normalizeScanResult({
        brand: " HONDA ",
        name: "Supra Fit",
        year: "2007",
        displacement: "100",
        isAmbiguous: "false",
        isIncomplete: "false",
      }),
    ).toEqual(
      expect.objectContaining({
        brand: "HONDA",
        year: 2007,
        displacement: 100,
        isAmbiguous: false,
        isIncomplete: false,
      }),
    );
  });

  it("maps all STNK fields and prices to a motor insert payload", () => {
    expect(toMotorInsertFromScan(scanResult, 12_000_000, 13_500_000)).toEqual({
      brand: "Honda",
      name: "Revo Fit",
      frameNumber: "MH1HB211XJK123456",
      engineNumber: "HB21E1123456",
      year: 2021,
      plateNumber: "B 1234 ABC",
      color: "Hitam",
      stnkCode: "NC11D1CF",
      displacement: 110,
      buyingPrice: 12_000_000,
      sellingPrice: 13_500_000,
      isIncomplete: false,
    });
  });

  it("keeps incomplete AI results marked as incomplete and omits category", () => {
    const ambiguousResult = {
      ...scanResult,
      category: "UNKNOWN",
      isAmbiguous: true,
    };

    expect(toMotorInsertFromScan(ambiguousResult, 10_000_000)).toEqual(
      expect.objectContaining({
        isIncomplete: true,
        buyingPrice: 10_000_000,
      }),
    );
    expect(
      toMotorInsertFromScan({ ...scanResult, category: "CUB" }, 10_000_000),
    ).not.toHaveProperty("category");
  });

  it("detects missing required scan identity", () => {
    const missingName = { ...scanResult, name: "" };

    expect(hasRequiredScanData(missingName)).toBe(false);
    expect(getScanDataWarning(missingName)).toContain("nama motor");
  });
});
