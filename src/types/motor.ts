export interface Motor {
  id: string;
  brand: string;
  name: string;
  year: number;
  buyingPrice: number;
  sellingPrice: number;
  images?: string[];
  licensePlate?: string;
  purchaseAt?: number;
  roadTaxStatus?: "active" | "expired";
  roadTaxDueDate?: string;
  isSold: boolean;
  isIncomplete: boolean;
  soldAt?: string;
  createdAt: string;
}

export interface MotorQuickAdd {
  brand: string;
  name: string;
  year?: number;
  buyingPrice: number;
  sellingPrice?: number;
}
