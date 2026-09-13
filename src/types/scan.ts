import type { MotorCategory } from "./motor";

// Matches the response of POST /api/v1/motors/scan-batch (English keys).
export type OcrResult = {
  brand: string;
  name: string;
  frameNumber: string;
  engineNumber: string;
  year: number | null;
  plateNumber: string;
  color: string;
  category: MotorCategory | string;
  stnkCode: string;
  displacement: number | null;
  isAmbiguous: boolean;
  isIncomplete: boolean;
  remarks: string;
};

export type PhotoItem = {
  uri: string;
  width?: number;
  height?: number;
};
