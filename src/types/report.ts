// Analytics types (see README §5).

export type SoldMotor = {
  id: string;
  name: string;
  brand: string;
  plateNumber: string;
  sellingPrice: number;
};

// Daily / weekly selling report entries: { date, count, revenue, motors[] }
export type SellingReportEntry = {
  date: string;
  count: number;
  revenue: number;
  motors: SoldMotor[];
};

// Incoming stock report entries: { date, count, totalBuyingPrice }
export type IncomingStockEntry = {
  date: string;
  count: number;
  totalBuyingPrice: number;
};

// Best-selling entries: { brand, name, totalSold, totalRevenue }
export type BestSellingEntry = {
  brand: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
};

// Dashboard stats (README §5 dashboard summary)
export type DashboardStats = {
  stock: number;
  sold: number;
  currentMonthProfit: number;
  currentMonthRevenue: number;
  marginAverage: number;
};

// UI-facing aggregate used by the Laporan screen.
export type DisplayData = {
  revenue: number;
  sold: number;
  margin: number;
  profit: number;
  motors: SoldMotor[];
};
