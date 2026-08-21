import { MotorStockCard } from "@/src/components/motor/MotorStockCard";
import {
  useDeleteMotor,
  useMarkAsSold,
  useMotors,
} from "@/src/hooks/useMotors";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { useRouter } from "expo-router";
import { Bike, Plus, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StokPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: motors, isLoading, isError, refetch } = useMotors();
  const { data: subscription } = useSubscriptionStatus();
  const markAsSoldMutation = useMarkAsSold();
  const deleteMotorMutation = useDeleteMotor();
  const isPremium = subscription?.isPremium ?? false;

  const motorList = motors ?? [];

  const filtered = motorList.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.brand.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      String(m.year ?? "").includes(q)
    );
  });

  const totalStok = motorList.length;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <View className="bg-otokas-primary px-5 pt-2 pb-6 rounded-b-xl">
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-blue-200 text-sm">Inventaris</Text>
            <Text className="text-white text-2xl font-bold mt-0.5">
              Stok Motor
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-2xl font-bold">{totalStok}</Text>
            <Text className="text-blue-200 text-xs">Total Unit</Text>
          </View>
        </View>
      </View>

      <View className="px-5 -mt-4 mb-2">
        <View
          className="bg-white rounded-2xl flex-row items-center px-4 gap-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Cari merek, tipe, atau tahun..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
            className="flex-1 py-4 text-slate-900 text-base"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text className="text-slate-400 text-sm mt-3">Memuat stok...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-400 text-base text-center mb-4">
            Gagal memuat data stok. Coba lagi.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-otokas-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      ) : totalStok === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
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
              <Bike size={40} color="#cbd5e1" strokeWidth={1.5} />
            </View>
            <Text className="text-slate-800 font-bold text-lg text-center">
              Belum Ada Motor
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-2 leading-5">
              Stok motor Anda masih kosong.{"\n"}Mulai tambahkan unit motor
              pertama Anda.
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
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MotorStockCard
              item={item}
              isPremium={isPremium}
              onMarkSold={(id) => markAsSoldMutation.mutate(id)}
              onDelete={(id) => deleteMotorMutation.mutate(id)}
              isSelling={
                markAsSoldMutation.isPending &&
                markAsSoldMutation.variables === item.id
              }
              isDeleting={
                deleteMotorMutation.isPending &&
                deleteMotorMutation.variables === item.id
              }
            />
          )}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 12,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Search size={40} color="#cbd5e1" strokeWidth={1.5} />
              <Text className="text-slate-400 text-base mt-3 text-center">
                Tidak ada unit ditemukan{"\n"}untuk pencarian &quot;{search}
                &quot;
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
