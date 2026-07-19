import {
  AlertCircle,
  Bike,
  FileText,
  Inbox,
  SearchX,
  ShoppingBag,
  WifiOff,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const VARIANTS = {
  motor: {
    Icon: Bike,
    title: "Belum ada motor",
    description: "Motor yang Anda tambahkan akan muncul di sini.",
  },
  laporan: {
    Icon: FileText,
    title: "Belum ada laporan",
    description: "Data laporan akan tersedia setelah ada transaksi.",
  },
  transaksi: {
    Icon: ShoppingBag,
    title: "Belum ada transaksi",
    description: "Transaksi yang tercatat akan muncul di sini.",
  },
  pencarian: {
    Icon: SearchX,
    title: "Hasil tidak ditemukan",
    description: "Coba kata kunci lain atau periksa ejaan Anda.",
  },
  offline: {
    Icon: WifiOff,
    title: "Tidak ada koneksi",
    description: "Periksa koneksi internet Anda lalu coba lagi.",
  },
  error: {
    Icon: AlertCircle,
    title: "Terjadi kesalahan",
    description: "Gagal memuat data. Silakan coba beberapa saat lagi.",
  },
  default: {
    Icon: Inbox,
    title: "Belum ada data",
    description: "Data yang ditambahkan akan muncul di sini.",
  },
} as const;

export type EmptyStateVariant = keyof typeof VARIANTS;

type EmptyStateProps = {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: "sm" | "md" | "lg";
};

const SIZE_CONFIG = {
  sm: {
    wrapper: "py-6",
    iconBox: "w-12 h-12 rounded-2xl mb-3",
    iconSize: 20,
    title: "text-sm font-bold text-slate-700 mb-1",
    desc: "text-xs text-slate-400 text-center leading-4 px-4",
    btn: "mt-4 px-4 py-2 rounded-xl",
    btnText: "text-xs font-bold",
  },
  md: {
    wrapper: "py-10",
    iconBox: "w-16 h-16 rounded-3xl mb-4",
    iconSize: 26,
    title: "text-base font-bold text-slate-700 mb-2",
    desc: "text-sm text-slate-400 text-center leading-5 px-6",
    btn: "mt-5 px-6 py-3 rounded-2xl",
    btnText: "text-sm font-bold",
  },
  lg: {
    wrapper: "py-16",
    iconBox: "w-20 h-20 rounded-3xl mb-5",
    iconSize: 32,
    title: "text-lg font-bold text-slate-700 mb-2",
    desc: "text-sm text-slate-400 text-center leading-6 px-8",
    btn: "mt-6 px-8 py-3.5 rounded-2xl",
    btnText: "text-base font-bold",
  },
} as const;

// ─── Warna icon per variant ────────
const ICON_COLOR: Record<EmptyStateVariant, { bg: string; color: string }> = {
  motor: { bg: "#1e3a8a12", color: "#1e3a8a" },
  laporan: { bg: "#f59e0b12", color: "#f59e0b" },
  transaksi: { bg: "#10b98112", color: "#10b981" },
  pencarian: { bg: "#6366f112", color: "#6366f1" },
  offline: { bg: "#94a3b812", color: "#94a3b8" },
  error: { bg: "#ef444412", color: "#ef4444" },
  default: { bg: "#1e3a8a12", color: "#1e3a8a" },
};

// ─── KOMPONEN ───────────
export function EmptyState({
  variant = "default",
  title,
  description,
  actionLabel,
  onAction,
  size = "md",
}: EmptyStateProps) {
  const preset = VARIANTS[variant];
  const s = SIZE_CONFIG[size];
  const { bg, color } = ICON_COLOR[variant];
  const { Icon } = preset;

  const isError = variant === "error" || variant === "offline";

  return (
    <View className={`items-center justify-center w-full ${s.wrapper}`}>
      <View
        className={`items-center justify-center ${s.iconBox}`}
        style={{ backgroundColor: bg }}
      >
        <Icon size={s.iconSize} color={color} strokeWidth={1.8} />
      </View>
      <Text className={s.title}>{title ?? preset.title}</Text>
      <Text className={s.desc}>{description ?? preset.description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          className={s.btn}
          style={{
            backgroundColor: isError ? "#ef4444" : "#1e3a8a",
          }}
        >
          <Text className={`text-white ${s.btnText}`}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
