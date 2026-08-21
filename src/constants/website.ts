import type { MotorDisplayConfig } from "@/src/types/tenants";

export const WEBSITE_THEME_COLORS = [
  "#ff9800",
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#1e293b",
];

export const WEBSITE_TEMPLATES = [
  {
    key: "orange-catalog",
    name: "Template 1",
    description:
      "Katalog dengan hero promo, pencarian, filter kategori, dan kartu unit.",
    primaryColor: "#ff9800",
    secondaryColor: "#ffb74d",
    badgeText: "PROMO SPESIAL",
    title: "Motor Bekas Berkualitas Mulai dari Rp1Jt-an",
    subtitle:
      "Penawaran terbatas untuk pembeli pertama dari dealer terpercaya.",
    showAddress: true,
    isDummy: false,
  },
  {
    key: "template-two",
    name: "Template 2",
    description: "Slot sementara untuk desain template kedua.",
    primaryColor: "#0f172a",
    secondaryColor: "#cbd5e1",
    badgeText: "SEGERA HADIR",
    title: "Template Kedua",
    subtitle: "Desain akan disesuaikan setelah referensi berikutnya tersedia.",
    showAddress: false,
    isDummy: true,
  },
] as const;

export type WebsiteTemplate = (typeof WEBSITE_TEMPLATES)[number];

export const DEFAULT_WEBSITE_TEMPLATE = WEBSITE_TEMPLATES[0];

export const DEFAULT_MOTOR_DISPLAY: MotorDisplayConfig = {
  showPrice: true,
  showYear: true,
  showStatus: true,
  showKilometer: false,
  showTax: false,
};
