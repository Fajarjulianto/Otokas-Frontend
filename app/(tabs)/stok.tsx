import {
  AlertCircle,
  Bike,
  CheckCircle,
  ClipboardList,
  Search,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MotorItem = {
  id: number;
  brand: string;
  name: string;
  year?: number;
  buyingPrice: number;
  sellingPrice?: number;
  isIncomplete: boolean;
};

// ─── Dummy Data Motor
const DUMMY_MOTORS: MotorItem[] = [
  {
    id: 1,
    brand: "Honda",
    name: "Beat Street",
    year: 2022,
    buyingPrice: 12000000,
    sellingPrice: 14500000,
    isIncomplete: false,
  },
  {
    id: 2,
    brand: "Yamaha",
    name: "Mio M3",
    year: 2021,
    buyingPrice: 10500000,
    sellingPrice: undefined,
    isIncomplete: true,
  },
  {
    id: 3,
    brand: "Honda",
    name: "Vario 125",
    year: undefined,
    buyingPrice: 15000000,
    sellingPrice: 17000000,
    isIncomplete: true,
  },
  {
    id: 4,
    brand: "Suzuki",
    name: "Satria F150",
    year: 2020,
    buyingPrice: 16000000,
    sellingPrice: 18500000,
    isIncomplete: false,
  },
];

function formatRupiah(value: number): string {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// ─── Kartu Motor ───
function MotorCard({ item }: { item: MotorItem }) {
  return (
    <View
      className="bg-white rounded-2xl mb-3 overflow-hidden"
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
          item.isIncomplete ? "bg-amber-400" : "bg-otokas-primary"
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
          {item.isIncomplete ? (
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
          <TouchableOpacity className="flex-1 bg-otokas-primary flex-row items-center justify-center gap-2 py-3 rounded-xl">
            <CheckCircle size={16} color="white" strokeWidth={2.5} />
            <Text className="text-white font-semibold text-sm">
              Tandai Terjual
            </Text>
          </TouchableOpacity>

          {item.isIncomplete && (
            <TouchableOpacity
              // onPress={() => router.push(`/unit/${item.id}/edit`)}
              className="flex-row items-center gap-1.5 px-3 py-3 rounded-xl border border-amber-200 bg-amber-50"
            >
              <ClipboardList size={16} color="#d97706" />
              <Text className="text-amber-700 font-semibold text-sm">
                Lengkapi
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main ───
export default function StokPage() {
  const [search, setSearch] = useState("");

  const filtered = DUMMY_MOTORS.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.brand.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      String(m.year).includes(q)
    );
  });

  const totalStok = DUMMY_MOTORS.length;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* HEADER */}
      <View className="bg-otokas-primary px-5 pt-2 pb-6">
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
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MotorCard item={item} />}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Bike size={40} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 text-base mt-3">
              Tidak ada unit ditemukan
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
