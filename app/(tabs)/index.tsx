import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  BarChart2,
  Bike,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Dummy Data ───
const SHOWROOM_NAME = "Jaya Motor";
const STATS = {
  totalMotor: 24,
  totalTerjual: 8,
  keuntungan: 32500000,
  rataMargin: 12.4,
};

// ─── Kartu Putih ───
type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatCard({ icon, label, value }: StatCardProps) {
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
        <Text className="text-slate-900 text-s flex-1 pr-2" numberOfLines={1}>
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
}

// ─── Kartu Accent Biru ───
function AccentCard({ icon, label, value }: StatCardProps) {
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
}

// ─── Main ───
export default function BerandaPage() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── HEADER ── */}
        <View className="bg-otokas-primary px-6 pt-5 pb-16 rounded-b-xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-blue-200 text-xl">Selamat datang</Text>
              <Text className="text-white text-4xl font-bold mt-0.5">
                {SHOWROOM_NAME}
              </Text>
            </View>
          </View>
        </View>

        {/* ── KARTU STATISTIK ── */}
        <View className="px-5 -mt-10 gap-3">
          <View className="flex-row gap-3">
            <StatCard
              icon={<Bike size={16} color="#f59e0b" strokeWidth={2} />}
              label="Total Stok"
              value={`${STATS.totalMotor} unit`}
            />
            <StatCard
              icon={<ShoppingBag size={16} color="#f59e0b" strokeWidth={2} />}
              label="Terjual Bulan Ini"
              value={`${STATS.totalTerjual} unit`}
            />
          </View>

          <View className="flex-row gap-3">
            <AccentCard
              icon={<Wallet size={16} color="white" strokeWidth={2} />}
              label="Keuntungan Bulan Ini"
              value={formatRupiah(STATS.keuntungan)}
            />
            <AccentCard
              icon={<BarChart2 size={16} color="white" strokeWidth={2} />}
              label="Rata-rata Margin"
              value={`${STATS.rataMargin}%`}
            />
          </View>
        </View>

        {/* ── List Motor ── */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-800 font-bold text-base">
              Daftar Motor
            </Text>
            <TouchableOpacity>
              <Text className="text-amber-500 text-sm font-medium">
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="bg-white rounded-2xl p-8 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <TrendingUp size={32} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 text-md mt-3 text-center">
              Belum ada transaksi bulan ini.{"\n"}Mulai input unit motor Anda.
            </Text>
            <TouchableOpacity
              className="mt-4 bg-amber-400 px-5 py-2.5 rounded-xl"
              onPress={() => router.replace("/(tabs)/tambah")}
            >
              <Text className="text-white font-semibold text-l">
                + Tambah Unit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
