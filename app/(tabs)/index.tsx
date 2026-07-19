import { useDashboardStats, useMotors } from "@/src/hooks/useMotors";
import { useProfile } from "@/src/hooks/useUser";
import { formatMonthParam } from "@/src/services/analyticsServices";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  BarChart2,
  Bike,
  ChevronRight,
  Plus,
  ShoppingBag,
  Wallet,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Kartu Putih ───
type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const StatCard = React.memo(function StatCard({ icon, label, value }: StatCardProps) {
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

// ─── Kartu Accent Biru ───
const AccentCard = React.memo(function AccentCard({ icon, label, value }: StatCardProps) {
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

// ─── Motor List Item ───
const MotorListItem = React.memo(function MotorListItem({
  id,
  brand,
  name,
  year,
  plateNumber,
  sellingPrice,
  isIncomplete,
}: {
  id: string;
  brand: string;
  name: string;
  year?: number;
  plateNumber?: string;
  sellingPrice: number;
  isIncomplete: boolean;
}) {
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
      {/* Icon motor */}
      <View className="w-12 h-12 bg-slate-100 rounded-xl items-center justify-center">
        <Bike size={24} color="#94a3b8" strokeWidth={1.5} />
      </View>

      {/* Info */}
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

      {/* Badge + Chevron */}
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

// ─── Main ───
export default function BerandaPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const currentMonthParam = formatMonthParam(new Date());
  const { data: stats, isLoading: statsLoading } =
    useDashboardStats(currentMonthParam);
  const { data: motors, isLoading: motorsLoading } = useMotors();

  const motorList = motors ?? [];
  const latestMotors = motorList.slice(0, 5);
  const hasNoMotors = !motorsLoading && motorList.length === 0;

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
                {profile?.dealerName || "Showroom"}
              </Text>
            </View>
          </View>
        </View>

        {hasNoMotors ? (
          /* ── EMPTY STATE: Belum ada motor sama sekali ── */
          <View className="px-5 -mt-10">
            <View
              className="bg-white rounded-3xl p-8 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-5">
                <Bike size={40} color="#cbd5e1" strokeWidth={1.5} />
              </View>
              <Text className="text-slate-800 font-bold text-lg text-center">
                Selamat Datang di Otokas!
              </Text>
              <Text className="text-slate-400 text-sm text-center mt-2 leading-5">
                Showroom Anda masih kosong.{"\n"}Tambahkan unit motor pertama
                untuk mulai{"\n"}mengelola stok dan penjualan.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/tambah")}
                className="mt-6 bg-amber-400 px-6 py-3.5 rounded-xl flex-row items-center gap-2"
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
                  Tambah Unit Pertama
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* ── KARTU STATISTIK ── */}
            <View className="px-5 -mt-10 gap-3">
              {statsLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="small" color="#1e3a8a" />
                </View>
              ) : (
                <>
                  <View className="flex-row gap-3">
                    <StatCard
                      icon={<Bike size={16} color="#f59e0b" strokeWidth={2} />}
                      label="Total Stok"
                      value={`${motorList.length} unit`}
                    />
                    <StatCard
                      icon={
                        <ShoppingBag
                          size={16}
                          color="#f59e0b"
                          strokeWidth={2}
                        />
                      }
                      label="Terjual Bulan Ini"
                      value={`${stats?.sold ?? 0} unit`}
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <AccentCard
                      icon={<Wallet size={16} color="white" strokeWidth={2} />}
                      label="Keuntungan Bulan Ini"
                      value={formatRupiah(stats?.currentMonthProfit ?? 0)}
                    />
                    <AccentCard
                      icon={
                        <BarChart2 size={16} color="white" strokeWidth={2} />
                      }
                      label="Rata-rata Margin"
                      value={`${stats?.marginAverage ?? 0}%`}
                    />
                  </View>
                </>
              )}
            </View>

            {/* ── List Motor ── */}
            <View className="px-5 mt-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-slate-800 font-bold text-base">
                  Daftar Motor
                </Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/stok")}>
                  <Text className="text-amber-500 text-sm font-medium">
                    Lihat Semua
                  </Text>
                </TouchableOpacity>
              </View>

              {motorsLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="small" color="#1e3a8a" />
                </View>
              ) : (
                latestMotors.map((motor) => (
                  <MotorListItem
                    key={motor.id}
                    id={motor.id}
                    brand={motor.brand}
                    name={motor.name}
                    year={motor.year}
                    plateNumber={motor.plateNumber}
                    sellingPrice={motor.sellingPrice ?? 0}
                    isIncomplete={motor.isIncomplete}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
