import { useRouter } from "expo-router";
import { ArrowLeft, Check, ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES = [
  "Scan STNK & foto motor otomatis",
  "Laporan laba rugi real-time",
  "Manajemen stok tak terbatas",
  "Dashboard komisi sales",
  "Dukungan prioritas 24/7",
  "Update fitur seumur hidup",
];

export default function PaketScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom"]}>
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-xl items-center justify-center"
          style={{ elevation: 1 }}
        >
          <ArrowLeft size={20} color="#475569" strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-slate-800 text-lg font-bold">
          Paket Langganan
        </Text>
      </View>

      <View className="flex-1 justify-center px-5">
        <View
          className="bg-white rounded-3xl p-6 border border-slate-100"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text className="text-otokas-primary font-bold text-sm tracking-widest uppercase mb-3">
            Juragan
          </Text>
          <View className="flex-row items-end gap-1 mb-2">
            <Text className="text-slate-900 text-4xl font-bold">
              Rp 200.000
            </Text>
            <Text className="text-slate-400 text-base mb-1">/bulan</Text>
          </View>
          <Text className="text-slate-400 text-sm mb-6">
            Akses penuh semua fitur premium tanpa batasan.
          </Text>

          <View className="h-px bg-slate-100 mb-5" />

          {FEATURES.map((feature, index) => (
            <View key={index} className="flex-row items-center gap-3 mb-3">
              <View className="w-5 h-5 bg-emerald-50 rounded-full items-center justify-center">
                <Check size={12} color="#10b981" strokeWidth={3} />
              </View>
              <Text className="text-slate-700 text-base flex-1">{feature}</Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => router.push("/payment/checkout")}
            className="w-full bg-otokas-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-5"
          >
            <Text className="text-white font-bold text-base">
              Langganan Sekarang
            </Text>
            <ChevronRight size={18} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
