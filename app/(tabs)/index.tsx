import {
  DashboardAccentCard,
  DashboardMotorItem,
  DashboardStatCard,
} from "@/src/components/dashboard/DashboardCards";
import { useDashboardStats, useMotors } from "@/src/hooks/useMotors";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { useProfile } from "@/src/hooks/useUser";
import { formatMonthParam } from "@/src/services/analyticsServices";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  BarChart2,
  Bike,
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

export default function BerandaPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: subscription } = useSubscriptionStatus();
  const currentMonthParam = formatMonthParam(new Date());
  const { data: stats, isLoading: statsLoading } =
    useDashboardStats(currentMonthParam);
  const { data: motors, isLoading: motorsLoading } = useMotors();
  const isPremium = subscription?.isPremium ?? false;

  const motorList = motors ?? [];
  const latestMotors = motorList.slice(0, 5);
  const hasNoMotors = !motorsLoading && motorList.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
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
            <View className="px-5 -mt-10 gap-3">
              {statsLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="small" color="#1e3a8a" />
                </View>
              ) : (
                <>
                  <View className="flex-row gap-3">
              <DashboardStatCard
                      icon={<Bike size={16} color="#f59e0b" strokeWidth={2} />}
                      label="Total Stok"
                      value={`${motorList.length} unit`}
                    />
              <DashboardStatCard
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
              <DashboardAccentCard
                      icon={<Wallet size={16} color="white" strokeWidth={2} />}
                      label="Keuntungan Bulan Ini"
                      value={formatRupiah(stats?.currentMonthProfit ?? 0)}
                    />
              <DashboardAccentCard
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
                <DashboardMotorItem
                    key={motor.id}
                    id={motor.id}
                    brand={motor.brand}
                    name={motor.name}
                    year={motor.year}
                    plateNumber={motor.plateNumber}
                    sellingPrice={motor.sellingPrice ?? 0}
                    isIncomplete={motor.isIncomplete}
                    motorImages={motor.motorImages}
                    isPremium={isPremium}
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
