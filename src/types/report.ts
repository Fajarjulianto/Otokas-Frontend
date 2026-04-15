export type DailyReport = {
  date: string;
  summary: {
    totalMotorsSold: number;
    totalRevenue: number;
    totalMargin: number;
  };
};

export type MonthlyReport = {
  month: string;
  summary: {
    totalMotorsSold: number;
    totalRevenue: number;
    totalMargin: number;
  };
};
