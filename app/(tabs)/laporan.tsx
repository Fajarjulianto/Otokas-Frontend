import {
  DateRangePicker,
  formatDateID,
} from "@/src/components/DateRangePicker";
import { useDateRangePicker } from "@/src/hooks/useDateRangePicker";
import { router } from "expo-router";
import {
  ArrowLeft,
  BarChart2,
  Bike,
  Download,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const summaryStats = [
  {
    icon: Wallet,
    iconColor: "#10B981",
    title: "Total Pendapatan",
    value: "Rp 1.42M",
    trend: "+14.5%",
    isPositive: true,
  },
  {
    icon: Bike,
    iconColor: "#1e3a8a",
    title: "Total Terjual",
    value: "95 unit",
    trend: "+8 unit",
    isPositive: true,
  },
  {
    icon: BarChart2,
    iconColor: "#f59e0b",
    title: "Rata-rata Margin",
    value: "15.2%",
    trend: "-0.8%",
    isPositive: false,
  },
  {
    icon: Wallet,
    iconColor: "#6366f1",
    title: "Harga Rata-rata",
    value: "Rp 18.9jt",
    trend: "+Rp 1.2jt",
    isPositive: true,
  },
];

const bestSellers = [
  { name: "Honda Vario 125", units: 14 },
  { name: "Yamaha NMAX 155", units: 11 },
  { name: "Honda Beat", units: 10 },
  { name: "Honda PCX 160", units: 8 },
  { name: "Kawasaki Ninja 250", units: 6 },
];

const revenueData = [
  { month: "Sep", value: 180 },
  { month: "Okt", value: 220 },
  { month: "Nov", value: 200 },
  { month: "Des", value: 320 },
  { month: "Jan", value: 240 },
  { month: "Feb", value: 280 },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.value));
const maxUnits = bestSellers[0]?.units ?? 1;

// ─────────────────────────────────────────
// Komponen: Kartu Statistik
// ─────────────────────────────────────────
type StatCardProps = {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  iconColor: string;
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
};

function StatCard({
  icon: Icon,
  iconColor,
  title,
  value,
  trend,
  isPositive,
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
    </View>
  );
}

// ─────────────────────────────────────────
// Komponen: Item Motor Terlaris
// ─────────────────────────────────────────
function MotorItem({
  item,
  rank,
}: {
  item: (typeof bestSellers)[0];
  rank: number;
}) {
  const percentage = (item.units / maxUnits) * 100;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center gap-2 flex-1">
          <Text className="text-slate-400 text-sm w-4">{rank}</Text>
          <Text
            className="text-slate-800 font-semibold text-base flex-1"
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <Text className="text-slate-900 font-bold text-sm ml-2">
          {item.units} unit
        </Text>
      </View>
      <View
        className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden ml-6"
        style={{ width: "94%" }}
      >
        <View
          className={`h-1.5 rounded-full ${rank === 1 ? "bg-amber-400" : "bg-otokas-primary"}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

export default function LaporanScreen() {
  const picker = useDateRangePicker({
    startDate: new Date(2026, 4, 1),
    endDate: new Date(2026, 5, 20),
  });

  function handleDownload() {
    Alert.alert(
      "Laporan Berhasil Diunduh",
      `Laporan Excel periode ${formatDateID(picker.range.startDate)} – ${formatDateID(picker.range.endDate)} sudah terunduh.`,
      [{ text: "Oke" }],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <View className="bg-otokas-primary px-6 pt-4 pb-5 rounded-b-xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            >
              <ArrowLeft className="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold ml-3">Laporan</Text>
          </View>

          <TouchableOpacity
            onPress={handleDownload}
            className="flex-row items-center gap-2 bg-amber-400 px-4 py-2.5 rounded-xl"
          >
            <Download size={16} color="white" strokeWidth={2.5} />
            <Text className="text-white font-bold text-sm">Unduh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 0,
          paddingBottom: 100,
        }}
      >
        {/* ── DATE RANGE SELECTOR ── */}
        <View
          className="bg-white rounded-2xl p-4 mt-6 mb-5 flex-row items-center gap-3"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <TouchableOpacity
            onPress={() => picker.open("start")}
            className="flex-1 flex-row items-center gap-2 bg-otokas-primary px-3 py-2.5 rounded-xl"
          >
            <Text className="text-white text-sm font-semibold">
              {formatDateID(picker.range.startDate)}
            </Text>
          </TouchableOpacity>

          <Text className="text-slate-300 font-medium">—</Text>

          <TouchableOpacity
            onPress={() => picker.open("end")}
            className="flex-1 flex-row items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl"
          >
            <Text className="text-slate-600 text-sm font-medium">
              {formatDateID(picker.range.endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-3">
          <StatCard {...summaryStats[0]} />
          <StatCard {...summaryStats[1]} />
        </View>
        <View className="flex-row gap-3 mb-5">
          <StatCard {...summaryStats[2]} />
          <StatCard {...summaryStats[3]} />
        </View>

        <View
          className="bg-white rounded-2xl p-5 mb-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-800 font-bold text-base mb-1">
            Pendapatan 6 Bulan Terakhir
          </Text>
          <Text className="text-slate-400 text-xs mb-5">dalam juta Rupiah</Text>

          <View className="flex-row items-end justify-between h-40 gap-2">
            {revenueData.map((d, i) => {
              const heightPct = (d.value / maxRevenue) * 100;
              const isHighest = d.value === maxRevenue;
              return (
                <View key={i} className="flex-1 items-center gap-2">
                  <Text className="text-slate-400 text-xs">{d.value}</Text>
                  <View
                    className="w-full bg-slate-100 rounded-t-xl overflow-hidden"
                    style={{ height: 100 }}
                  >
                    <View
                      className={`w-full rounded-t-xl absolute bottom-0 ${
                        isHighest ? "bg-amber-400" : "bg-otokas-primary"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </View>
                  <Text className="text-slate-500 text-xs font-medium">
                    {d.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View
          className="bg-white rounded-2xl p-5 mb-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-800 font-bold text-base mb-5">
            Motor Terlaris
          </Text>
          {bestSellers.map((item, i) => (
            <MotorItem key={i} item={item} rank={i + 1} />
          ))}
        </View>
      </ScrollView>

      <DateRangePicker
        visible={picker.isOpen}
        tempRange={picker.tempRange}
        step={picker.step}
        onSelect={picker.selectDate}
        onConfirm={picker.confirm}
        onClose={picker.close}
      />
    </SafeAreaView>
  );
}
