import { MotorThumbnail } from "@/src/components/motor/MotorThumbnail";
import type { MotorImage } from "@/src/types/motor";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type DashboardStatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export const DashboardStatCard = React.memo(function DashboardStatCard({
  icon,
  label,
  value,
}: DashboardStatCardProps) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-slate-900 text-xs flex-1 pr-2" numberOfLines={1}>
          {label}
        </Text>
        <View className="w-8 h-8 bg-amber-50 rounded-xl items-center justify-center">
          {icon}
        </View>
      </View>
      <Text
        className="text-3xl font-bold text-slate-900"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
});

export const DashboardAccentCard = React.memo(function DashboardAccentCard({
  icon,
  label,
  value,
}: DashboardStatCardProps) {
  return (
    <View
      className="flex-1 bg-otokas-primary rounded-2xl p-4"
      style={{
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-xs flex-1 pr-2" numberOfLines={1}>
          {label}
        </Text>
        <View className="w-8 h-8 bg-white/20 rounded-xl items-center justify-center">
          {icon}
        </View>
      </View>
      <Text
        className="text-3xl font-bold text-white"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
});

type DashboardMotorItemProps = {
  id: string;
  brand: string;
  name: string;
  year?: number;
  plateNumber?: string;
  sellingPrice: number;
  isIncomplete: boolean;
  motorImages?: MotorImage[];
  isPremium: boolean;
};

export const DashboardMotorItem = React.memo(function DashboardMotorItem({
  id,
  brand,
  name,
  year,
  plateNumber,
  sellingPrice,
  isIncomplete,
  motorImages,
  isPremium,
}: DashboardMotorItemProps) {
  const router = useRouter();
  const subtitle = [year, plateNumber].filter(Boolean).join(" · ");

  return (
    <TouchableOpacity
      onPress={() => router.push(`/motor/${id}`)}
      activeOpacity={0.75}
      className="bg-white rounded-2xl px-4 py-3.5 mb-2.5 flex-row items-center gap-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <MotorThumbnail images={motorImages} isPremium={isPremium} size={48} />
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>
          {brand} {name}
        </Text>
        {subtitle ? (
          <Text className="text-slate-400 text-sm mt-0.5">{subtitle}</Text>
        ) : null}
        <Text className="text-slate-900 font-semibold text-sm mt-1">
          {sellingPrice > 0 ? (
            formatRupiah(sellingPrice)
          ) : (
            <Text className="text-slate-300 font-normal">
              Harga belum diisi
            </Text>
          )}
        </Text>
      </View>
      <View className="items-end gap-1.5">
        <View
          className={`px-2.5 py-1 rounded-full ${
            isIncomplete
              ? "bg-amber-50 border border-amber-200"
              : "bg-emerald-50 border border-emerald-200"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              isIncomplete ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {isIncomplete ? "Belum Lengkap" : "Tersedia"}
          </Text>
        </View>
        <ChevronRight size={16} color="#cbd5e1" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
});
