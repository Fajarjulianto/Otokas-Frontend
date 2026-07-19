import {
  useDeleteMotor,
  useMarkAsSold,
  useMotors,
} from "@/src/hooks/useMotors";
import type { Motor } from "@/src/types/motor";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Bike,
  CheckCircle,
  Edit3,
  Plus,
  Search,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Kartu Motor ───
const MotorCard = React.memo(function MotorCard({
  item,
  onMarkSold,
  onDelete,
  isSelling,
  isDeleting,
}: {
  item: Motor;
  onMarkSold: (id: string) => void;
  onDelete: (id: string) => void;
  isSelling: boolean;
  isDeleting: boolean;
}) {
  const router = useRouter();
  const isSold = item.status === "SOLD";

  function handleMarkSold() {
    Alert.alert(
      "Tandai Terjual",
      `Yakin ${item.brand} ${item.name} sudah terjual?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Terjual",
          onPress: () => onMarkSold(item.id),
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      "Hapus Motor",
      `Yakin ingin menghapus ${item.brand} ${item.name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => onDelete(item.id),
        },
      ],
    );
  }

  return (
    <View
      className={`bg-white rounded-2xl mb-3 overflow-hidden ${
        isSold ? "opacity-60" : ""
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        className={`h-1 w-full ${
          isSold
            ? "bg-slate-300"
            : item.isIncomplete
              ? "bg-amber-400"
              : "bg-otokas-primary"
        }`}
      />

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-1">
          <View className="flex-1 pr-2">
            <Text className="text-slate-900 text-base font-bold">
              {item.brand} {item.name}
            </Text>
            <Text className="text-slate-400 text-sm mt-0.5">
              {item.year ? `Tahun ${item.year}` : "Tahun belum diisi"}
            </Text>
          </View>

          {/* Badge status */}
          {isSold ? (
            <View className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
              <Text className="text-slate-500 text-xs font-semibold">
                Sudah Terjual
              </Text>
            </View>
          ) : item.isIncomplete ? (
            <View className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex-row items-center gap-1">
              <AlertCircle size={12} color="#d97706" />
              <Text className="text-amber-700 text-xs font-semibold">
                Belum Lengkap
              </Text>
            </View>
          ) : (
            <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <Text className="text-emerald-700 text-xs font-semibold">
                Lengkap ✓
              </Text>
            </View>
          )}
        </View>

        {/* Harga Jual */}
        <View className="mt-3">
          <Text className="text-slate-400 text-xs">Harga Jual</Text>
          <Text className="text-slate-900 text-xl font-bold mt-0.5">
            {item.sellingPrice ? (
              formatRupiah(item.sellingPrice)
            ) : (
              <Text className="text-slate-300 text-base font-normal">
                Belum diisi
              </Text>
            )}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <TouchableOpacity
            onPress={handleMarkSold}
            disabled={isSelling || isDeleting || isSold}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
              isSold ? "bg-slate-200" : "bg-otokas-primary"
            }`}
          >
            {isSelling ? (
              <ActivityIndicator
                size="small"
                color={isSold ? "#64748b" : "white"}
              />
            ) : (
              <>
                <CheckCircle
                  size={16}
                  color={isSold ? "#64748b" : "white"}
                  strokeWidth={2.5}
                />
                <Text
                  className={`font-semibold text-sm ${
                    isSold ? "text-slate-500" : "text-white"
                  }`}
                >
                  {isSold ? "Sudah Terjual" : "Tandai Terjual"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Tombol Edit */}
          <TouchableOpacity
            onPress={() => router.push(`/unit/${item.id}/edit`)}
            disabled={isSold}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white items-center justify-center"
          >
            <Edit3 size={16} color="#475569" />
          </TouchableOpacity>

          {/* Tombol Hapus */}
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isDeleting || isSelling}
            className="w-11 h-11 rounded-xl border border-red-200 bg-red-50 items-center justify-center"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Trash2 size={16} color="#DC2626" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// ─── Main ───
export default function StokPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: motors, isLoading, isError, refetch } = useMotors();
  const markAsSoldMutation = useMarkAsSold();
  const deleteMotorMutation = useDeleteMotor();

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
      {/* HEADER */}
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

      {/* SEARCH */}
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

      {/* LIST */}
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
        /* ── EMPTY STATE: Belum ada motor sama sekali ── */
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
            <MotorCard
              item={item}
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
