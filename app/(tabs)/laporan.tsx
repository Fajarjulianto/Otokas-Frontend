import {
  useDailySellingReport,
  useWeeklySellingReport,
} from "@/src/hooks/useAnalytics";
import { useDashboardStats, useMotors } from "@/src/hooks/useMotors";
import {
  formatDateParam,
  formatMonthParam,
} from "@/src/services/analyticsServices";
import { DisplayData } from "@/src/types/report";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart2,
  Bike,
  Download,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

function StatCard({
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

function SoldMotorItem({
  name,
  value,
  rank,
  maxValue,
}: {
  name: string;
  value: number;
  rank: number;
  maxValue: number;
}) {
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
          className={`h-1.5 rounded-full ${rank === 1 ? "bg-amber-400" : "bg-otokas-primary"}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

export default function LaporanScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"harian" | "mingguan" | "bulanan">(
    "bulanan",
  );
  const today = new Date();
  const dateParam = formatDateParam(today);
  const monthParam = formatMonthParam(today);

  // 3. Fetching data — hanya fetch tab yang sedang aktif
  const { data: motors, isLoading: motorsLoading } = useMotors();
  const { data: stats, isLoading: statsLoading } =
    useDashboardStats(monthParam);
  const { data: dailyReport, isLoading: dailyLoading } = useDailySellingReport(
    activeTab === "harian" ? dateParam : "",
  );
  const { data: weeklyReport, isLoading: weeklyLoading } =
    useWeeklySellingReport(activeTab === "mingguan" ? dateParam : "");

  const isLoading =
    motorsLoading ||
    statsLoading ||
    (activeTab === "harian" && dailyLoading) ||
    (activeTab === "mingguan" && weeklyLoading);
  const hasNoMotors = !motorsLoading && (motors ?? []).length === 0;

  let currentDisplay: DisplayData = {
    revenue: 0,
    sold: 0,
    margin: 0,
    profit: 0,
    motors: [],
  };

  if (activeTab === "harian") {
    const entries = dailyReport ?? [];
    currentDisplay = {
      revenue: entries.reduce((sum, e) => sum + (e.revenue ?? 0), 0),
      sold: entries.reduce((sum, e) => sum + (e.count ?? 0), 0),
      margin: 0,
      profit: 0,
      motors: entries.flatMap((e) => e.motors ?? []),
    };
  } else if (activeTab === "mingguan") {
    const entries = weeklyReport ?? [];
    currentDisplay = {
      revenue: entries.reduce((sum, e) => sum + (e.revenue ?? 0), 0),
      sold: entries.reduce((sum, e) => sum + (e.count ?? 0), 0),
      margin: 0,
      profit: 0,
      motors: entries.flatMap((e) => e.motors ?? []),
    };
  } else {
    // Bulanan
    currentDisplay = {
      revenue: stats?.currentMonthRevenue ?? 0,
      sold: stats?.sold ?? 0,
      margin: stats?.marginAverage ?? 0,
      profit: stats?.currentMonthProfit ?? 0,
      motors: [],
    };
  }

  const maxValue =
    currentDisplay.motors.length > 0
      ? Math.max(...currentDisplay.motors.map((m) => m.sellingPrice ?? 0))
      : 1;

  function handleDownload() {
    Alert.alert(
      "Laporan Berhasil Diunduh",
      `Laporan Excel periode ${activeTab} ini sudah terunduh.`,
      [{ text: "Oke" }],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* ── HEADER ── */}
      <View className="bg-otokas-primary px-6 pt-4 pb-5 rounded-b-[24px]">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            >
              <ArrowLeft size={24} color="white" strokeWidth={2} />
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
          paddingTop: 10,
          paddingBottom: 100,
        }}
      >
        {/* ── CAPSULE TAB FILTER ── */}
        <View className="bg-slate-100 p-1 rounded-full flex-row items-center mt-2 mb-6">
          {(["harian", "mingguan", "bulanan"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
                className={`flex-1 py-2.5 rounded-full items-center justify-center ${
                  isActive ? "bg-white" : ""
                }`}
                style={
                  isActive
                    ? {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }
                    : {}
                }
              >
                <Text
                  className={`text-sm capitalize ${
                    isActive
                      ? "font-bold text-slate-800"
                      : "font-medium text-slate-500"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text className="text-slate-400 text-sm mt-3">
              Memuat laporan...
            </Text>
          </View>
        ) : hasNoMotors ? (
          /* ── EMPTY STATE ── */
          <View className="items-center justify-center px-4 py-8">
            <View
              className="bg-white rounded-3xl p-10 items-center w-full"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-5">
                <BarChart2 size={40} color="#cbd5e1" strokeWidth={1.5} />
              </View>
              <Text className="text-slate-800 font-bold text-lg text-center">
                Belum Ada Laporan
              </Text>
              <Text className="text-slate-400 text-sm text-center mt-2 leading-5">
                Laporan penjualan akan muncul setelah{"\n"}Anda menambahkan dan
                menjual motor.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/tambah")}
                className="mt-6 bg-amber-400 px-6 py-3 rounded-xl flex-row items-center gap-2"
                style={{
                  shadowColor: "#f59e0b",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Plus size={18} color="white" strokeWidth={2.5} />
                <Text className="text-white font-bold text-base">
                  Tambah Unit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* ── STATS CARDS DINAMIS ── */}
            <View className="flex-row gap-3 mb-3">
              <StatCard
                icon={Wallet}
                iconColor="#10B981"
                title="Total Pendapatan"
                value={formatRupiah(currentDisplay.revenue)}
              />
              <StatCard
                icon={Bike}
                iconColor="#1e3a8a"
                title="Total Terjual"
                value={`${currentDisplay.sold} unit`}
              />
            </View>
            <View className="flex-row gap-3 mb-5">
              <StatCard
                icon={BarChart2}
                iconColor="#f59e0b"
                title="Rata-rata Margin"
                value={`${currentDisplay.margin}%`}
              />
              <StatCard
                icon={Wallet}
                iconColor="#6366f1"
                title="Keuntungan"
                value={formatRupiah(currentDisplay.profit)}
              />
            </View>

            {/* ── DAFTAR MOTOR TERJUAL DINAMIS ── */}
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
                Motor Terjual ({activeTab})
              </Text>
              {currentDisplay.motors.length > 0 ? (
                currentDisplay.motors.map((item, i) => (
                  <SoldMotorItem
                    key={item.id || i}
                    name={`${item.brand} ${item.name}`}
                    value={item.sellingPrice}
                    rank={i + 1}
                    maxValue={maxValue}
                  />
                ))
              ) : (
                <Text className="text-slate-400 text-sm text-center py-4">
                  Belum ada motor terjual pada periode ini.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
