export type MotorCategory = "MATIC" | "CUB" | "SPORT" | "MANUAL";
export type MotorTax = "PAID" | "UNPAID" | "PENDING";
export type MotorStatus = "AVAILABLE" | "BOOKED" | "SOLD" | "ARCHIVED";

export interface MotorImage {
  id?: string;
  storageKey: string;
  url: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface Motor {
  id: string;
  userId?: string;
  frameNumber?: string;
  engineNumber?: string;
  stnkCode?: string;
  brand: string;
  name: string;
  category?: MotorCategory;
  year?: number;
  plateNumber?: string;
  color?: string;
  displacement?: number;
  kilometer?: number;
  tax?: MotorTax;
  buyingPrice: number;
  sellingPrice?: number;
  status?: MotorStatus;
  isIncomplete: boolean;
  createdAt: string;
  updatedAt?: string;
  soldAt?: string | null;
  motorImages?: MotorImage[];
}
