export type DailyReport = {
  date: string;
  summary: {
    totalMotorsSold: number;
    totalRevenue: number;
    totalMargin: number;
  };
};
