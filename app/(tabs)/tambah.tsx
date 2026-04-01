import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bike,
  Calendar,
  CheckCircle,
  ChevronRight,
  DollarSign,
  ScanLine,
  Tag,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "TVS", "Lainnya"];

export default function QuickAddMotorPage() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const isValid = brand !== "" && name.trim() !== "" && buyingPrice !== "";

  const buying = parseRupiah(buyingPrice);
  const selling = parseRupiah(sellingPrice);
  const profit = buying > 0 && selling > 0 ? selling - buying : null;
  const margin =
    buying > 0 && selling > 0
      ? (((selling - buying) / buying) * 100).toFixed(1)
      : null;

  function handleSimpan() {
    if (!isValid) return;
    router.replace("/(tabs)/stok");
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View className="bg-otokas-primary px-5 pt-5 pb-5 flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">
              Tambah Unit Motor
            </Text>
            <Text className="text-blue-200 text-sm">Isi data unit baru</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        >
          {/* ── TOMBOL SCAN STNK/BPKB ── */}
          <TouchableOpacity
            onPress={() => router.push("/unit/scan")}
            className="bg-otokas-primary rounded-2xl px-5 py-4 mb-5 flex-row items-center gap-4"
            style={{
              elevation: 3,
              shadowColor: "#1e3a8a",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <ScanLine size={26} color="white" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Scan STNK / BPKB
              </Text>
              <Text className="text-blue-200 text-sm mt-0.5">
                Isi data otomatis pakai foto dokumen
              </Text>
            </View>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>

          {/* Divider OR */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="text-slate-400 text-sm font-medium">
              atau isi manual
            </Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          {/* Info banner manual */}
          <View className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 flex-row items-start gap-3">
            <Text className="text-xl">⚡</Text>
            <View className="flex-1">
              <Text className="text-amber-800 font-bold text-base">
                Mode Input Cepat
              </Text>
              <Text className="text-amber-700 text-sm mt-0.5 leading-5">
                Cukup isi 5 data utama. Data lain seperti plat nomor dan pajak
                bisa dilengkapi kapan saja dari halaman Stok.
              </Text>
            </View>
          </View>

          {/* FIELD 1 — Brand */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Tag size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Merek <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 pr-4">
                {BRANDS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBrand(b)}
                    className={`px-5 py-3 rounded-xl border ${
                      brand === b
                        ? "bg-otokas-primary border-otokas-primary"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Text
                      className={`text-base font-medium ${
                        brand === b ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* FIELD 2 — Nama/Tipe */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Bike size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Tipe Motor <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <TextInput
              placeholder="Contoh: Beat Street, Mio M3, Vario 125"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#94a3b8"
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
            />
          </View>

          {/* FIELD 3 — Tahun */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Calendar size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Tahun
              </Text>
            </View>
            <TextInput
              placeholder="Contoh: 2021"
              value={year}
              onChangeText={(t) => setYear(t.replace(/\D/g, "").slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              placeholderTextColor="#94a3b8"
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
            />
          </View>

          {/* FIELD 4 — Harga Beli */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <DollarSign size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Harga Beli <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <View className="relative">
              <Text className="absolute left-4 top-4 text-slate-500 text-base z-10 font-medium">
                Rp
              </Text>
              <TextInput
                placeholder="0"
                value={buyingPrice}
                onChangeText={(t) => setBuyingPrice(formatRupiahInput(t))}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          {/* FIELD 5 — Harga Jual */}
          <View className="mb-2">
            <View className="flex-row items-center gap-2 mb-3">
              <DollarSign size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Target Harga Jual
              </Text>
            </View>
            <View className="relative">
              <Text className="absolute left-4 top-4 text-slate-500 text-base z-10 font-medium">
                Rp
              </Text>
              <TextInput
                placeholder="0"
                value={sellingPrice}
                onChangeText={(t) => setSellingPrice(formatRupiahInput(t))}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          {/* Estimasi Margin */}
          {margin !== null && profit !== null && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex-row items-center justify-between mt-4">
              <Text className="text-emerald-700 font-semibold text-base">
                Estimasi Untung
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-emerald-700 text-base font-medium">
                  Rp {profit.toLocaleString("id-ID")}
                </Text>
                <View className="bg-emerald-500 px-2.5 py-1 rounded-lg">
                  <Text className="text-white text-sm font-bold">
                    {margin}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* TOMBOL SIMPAN sticky */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-5 border-t border-slate-100"
          style={{ elevation: 12 }}
        >
          {!isValid && (
            <Text className="text-slate-400 text-sm text-center mb-3">
              Wajib diisi: Merek, Tipe Motor, dan Harga Beli
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              isValid ? "bg-[#f59e0b]" : "bg-slate-200"
            }`}
          >
            <CheckCircle
              size={22}
              color={isValid ? "white" : "#94a3b8"}
              strokeWidth={2}
            />
            <Text
              className={`text-center font-bold text-lg ${
                isValid ? "text-white" : "text-slate-400"
              }`}
            >
              Simpan Unit
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
