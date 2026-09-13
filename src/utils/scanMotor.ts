import type { MotorInsert } from "@/src/services/motorServices";
import type { OcrResult } from "@/src/types/scan";

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const parsedValue =
    typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : null;
}

function toBooleanValue(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return fallback;
}

export function normalizeScanResult(value: unknown): OcrResult | null {
  if (typeof value !== "object" || value === null) return null;

  const result = value as Record<string, unknown>;
  return {
    brand: toStringValue(result.brand),
    name: toStringValue(result.name),
    frameNumber: toStringValue(result.frameNumber),
    engineNumber: toStringValue(result.engineNumber),
    year: toNullableInteger(result.year),
    plateNumber: toStringValue(result.plateNumber),
    color: toStringValue(result.color),
    category: toStringValue(result.category),
    stnkCode: toStringValue(result.stnkCode),
    displacement: toNullableInteger(result.displacement),
    isAmbiguous: toBooleanValue(result.isAmbiguous, false),
    isIncomplete: toBooleanValue(result.isIncomplete, true),
    remarks: toStringValue(result.remarks),
  };
}

export function hasRequiredScanData(ocr: OcrResult): boolean {
  return Boolean(ocr.brand?.trim() && ocr.name?.trim());
}

export function getScanDataWarning(ocr: OcrResult): string | null {
  if (!hasRequiredScanData(ocr)) {
    return "Merek atau nama motor tidak terbaca. Lengkapi data tersebut sebelum menyimpan.";
  }

  if (ocr.remarks?.trim()) return ocr.remarks.trim();
  if (ocr.isAmbiguous || ocr.isIncomplete) {
    return "Sebagian data STNK kurang jelas. Periksa kembali sebelum menyimpan.";
  }

  return null;
}

export function toMotorInsertFromScan(
  ocr: OcrResult,
  buyingPrice: number,
  sellingPrice?: number,
): MotorInsert {
  const normalizedOcr = normalizeScanResult(ocr) ?? ocr;
  const brand = normalizedOcr.brand?.trim() ?? "";
  const name = normalizedOcr.name?.trim() ?? "";

  return {
    brand,
    name,
    buyingPrice,
    isIncomplete:
      Boolean(normalizedOcr.isIncomplete) ||
      Boolean(normalizedOcr.isAmbiguous) ||
      !brand ||
      !name,
    ...(normalizedOcr.frameNumber?.trim() && {
      frameNumber: normalizedOcr.frameNumber.trim(),
    }),
    ...(normalizedOcr.engineNumber?.trim() && {
      engineNumber: normalizedOcr.engineNumber.trim(),
    }),
    ...(normalizedOcr.stnkCode?.trim() && {
      stnkCode: normalizedOcr.stnkCode.trim(),
    }),
    ...(normalizedOcr.year &&
      normalizedOcr.year >= 1900 && { year: normalizedOcr.year }),
    ...(normalizedOcr.plateNumber?.trim() && {
      plateNumber: normalizedOcr.plateNumber.trim(),
    }),
    ...(normalizedOcr.color?.trim() && {
      color: normalizedOcr.color.trim(),
    }),
    ...(normalizedOcr.displacement &&
      normalizedOcr.displacement > 0 && {
        displacement: normalizedOcr.displacement,
      }),
    ...(sellingPrice && sellingPrice > 0 && {
      sellingPrice,
    }),
  };
}
