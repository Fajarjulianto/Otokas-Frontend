import { formatRupiah } from "@/src/utils/formatRupiah";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type StatCardProps = {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  iconColor: string;
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
};

export function StatCard({
  icon: Icon,
  iconColor,
  title,
  value,
  trend,
  isPositive = true,
}: StatCardProps) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View className="flex-row items-center gap-2 mb-3">
        <View
          className="w-8 h-8 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </View>
        <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text
        className="text-slate-900 text-xl font-bold mb-2"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {trend && (
        <View
          className={`flex-row items-center gap-1 self-start px-2 py-0.5 rounded-full ${
            isPositive ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={11} color="#10b981" strokeWidth={2.5} />
          ) : (
            <TrendingDown size={11} color="#ef4444" strokeWidth={2.5} />
          )}
          <Text
            className={`text-xs font-bold ${
              isPositive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trend}
          </Text>
        </View>
      )}
    </View>
  );
}

type SoldMotorItemProps = {
  name: string;
  value: number;
  rank: number;
  maxValue: number;
};

export function SoldMotorItem({
  name,
  value,
  rank,
  maxValue,
}: SoldMotorItemProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center gap-2 flex-1">
          <Text className="text-slate-400 text-sm w-4">{rank}</Text>
          <Text
            className="text-slate-800 font-semibold text-base flex-1"
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <Text className="text-slate-900 font-bold text-sm ml-2">
          {formatRupiah(value)}
        </Text>
      </View>
      <View
        className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden ml-6"
        style={{ width: "94%" }}
      >
        <View
          className={`h-1.5 rounded-full ${
            rank === 1 ? "bg-amber-400" : "bg-otokas-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
