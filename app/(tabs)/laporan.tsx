import {
  SoldMotorItem,
  StatCard,
} from "@/src/components/report/ReportCards";
import {
  useBestSelling,
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
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart2,
  Bike,
  Download,
  Plus,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LaporanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"harian" | "mingguan" | "bulanan">(
    "bulanan",
  );
  const [bestLimit, setBestLimit] = useState("5");
  const today = new Date();
  const dateParam = formatDateParam(today);
  const monthParam = formatMonthParam(today);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    }, [queryClient]),
  );

  const { data: motors, isLoading: motorsLoading } = useMotors();
  const { data: stats, isLoading: statsLoading } =
    useDashboardStats(monthParam);
  const { data: dailyReport, isLoading: dailyLoading } = useDailySellingReport(
    activeTab === "harian" ? dateParam : "",
  );
  const { data: weeklyReport, isLoading: weeklyLoading } =
    useWeeklySellingReport(activeTab === "mingguan" ? dateParam : "");
  const { data: bestSelling, isLoading: bestSellingLoading } = useBestSelling(
    Number(bestLimit) || 5,
  );

  const isLoading =
    motorsLoading ||
    statsLoading ||
    (activeTab === "harian" && dailyLoading) ||
    (activeTab === "mingguan" && weeklyLoading) ||
    bestSellingLoading;
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
              <Text className="text-slate-800 font-bold text-base mb-3">
                Best Selling
              </Text>
              <TextInput
                value={bestLimit}
                onChangeText={setBestLimit}
                keyboardType="numeric"
                placeholder="Limit"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
              />
              {(bestSelling ?? []).length > 0 ? (
                (bestSelling ?? []).map((entry, idx) => (
                  <View
                    key={`${entry.brand}-${entry.name}-${idx}`}
                    className="py-3 border-b border-slate-100"
                  >
                    <Text className="font-semibold text-slate-800">
                      {entry.brand} {entry.name}
                    </Text>
                    <Text className="text-slate-500 text-sm">
                      {entry.totalSold} terjual
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-slate-400 text-sm text-center py-4">
                  Belum ada data best selling.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
