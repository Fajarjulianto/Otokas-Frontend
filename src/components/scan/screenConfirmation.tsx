import { useInsertMotor } from "@/src/hooks/useMotors";
import type { Motor } from "@/src/types/motor";
import { OcrResult } from "@/src/types/scan";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CarFront,
  CheckCircle,
  DollarSign,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenConfirmation({
  ocr,
  onBack,
}: {
  ocr: OcrResult;
  onBack: () => void;
}) {
  const router = useRouter();
  const insertMotorMutation = useInsertMotor();

  const [namaPopuler, setNamaPopuler] = useState(ocr.name ?? "");
  const [hargaJual, setHargaJual] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [platEdit, setPlatEdit] = useState(ocr.plateNumber ?? "");
  const [tahunEdit, setTahunEdit] = useState(
    ocr.year ? String(ocr.year) : "",
  );

  const buying = parseRupiah(hargaBeli);
  const selling = parseRupiah(hargaJual);
  const margin =
    buying > 0 && selling > 0
      ? (((selling - buying) / buying) * 100).toFixed(1)
      : null;
  const profit = buying > 0 && selling > 0 ? selling - buying : null;

  const isValid = namaPopuler.trim() !== "" && hargaBeli !== "";

  function handleSimpan() {
    if (!isValid) return;
    const dataMotor = {
      brand: ocr.brand,
      name: namaPopuler,
      year: Number(tahunEdit) || undefined,
      buyingPrice: buying,
      sellingPrice: selling || undefined,
      plateNumber: platEdit || undefined,
      frameNumber: ocr.frameNumber || undefined,
      engineNumber: ocr.engineNumber || undefined,
      color: ocr.color || undefined,
      stnkCode: ocr.stnkCode || undefined,
      category: (ocr.category as Motor["category"]) || undefined,
      displacement: ocr.displacement || undefined,
      isIncomplete: false,
    };
    insertMotorMutation.mutate(dataMotor, {
      onSuccess: () => {
        Alert.alert("Berhasil", "Motor berhasil disimpan dari scan STNK.", [
          {
            text: "OK",
            onPress: () => {
              onBack();
              router.replace("/(tabs)/stok");
            },
          },
        ]);
      },
      onError: (error) => {
        Alert.alert(
          "Gagal",
          error.message || "Gagal menyimpan motor. Coba lagi.",
        );
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-otokas-primary px-5 pt-2 pb-5 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">
              Konfirmasi Data
            </Text>
            <Text className="text-blue-200 text-sm mt-0.5">
              Periksa hasil scan, lalu lengkapi
            </Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        >
          <View
            className="bg-white rounded-2xl p-4 mb-5"
            style={{ elevation: 2 }}
          >
            <Text className="text-slate-500 text-sm font-semibold mb-3">
              Data dari STNK
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: "Merek", value: ocr.brand },
                { label: "Kode Tipe", value: ocr.stnkCode },
                { label: "Warna", value: ocr.color },
                { label: "Rangka", value: ocr.frameNumber },
                { label: "Mesin", value: ocr.engineNumber },
              ]
                .filter((d) => d.value)
                .map((d) => (
                  <View
                    key={d.label}
                    className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl"
                  >
                    <Text className="text-slate-400 text-xs">{d.label}</Text>
                    <Text className="text-slate-700 text-sm font-semibold">
                      {d.value}
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-slate-700 font-semibold text-base mb-2">
                Plat Nomor
              </Text>
              <TextInput
                value={platEdit}
                onChangeText={(t) => setPlatEdit(t.toUpperCase())}
                autoCapitalize="characters"
                placeholder="BE 1234 AB"
                className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-700 font-semibold text-base mb-2">
                Tahun
              </Text>
              <TextInput
                value={tahunEdit}
                onChangeText={(t) =>
                  setTahunEdit(t.replace(/\D/g, "").slice(0, 4))
                }
                keyboardType="numeric"
                maxLength={4}
                placeholder="2021"
                className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <CarFront size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Nama Motor <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <TextInput
              value={namaPopuler}
              onChangeText={setNamaPopuler}
              placeholder={`Contoh: Beat FI, Mio M3`}
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
            />
          </View>

          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
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
                value={hargaBeli}
                onChangeText={(t) => setHargaBeli(formatRupiahInput(t))}
                keyboardType="numeric"
                placeholder="0"
                className="bg-white border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          <View className="mb-2">
            <View className="flex-row items-center gap-2 mb-2">
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
                value={hargaJual}
                onChangeText={(t) => setHargaJual(formatRupiahInput(t))}
                keyboardType="numeric"
                placeholder="0"
                className="bg-white border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

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

        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-slate-100"
          style={{ elevation: 12 }}
        >
          {!isValid && (
            <Text className="text-slate-400 text-sm text-center mb-3">
              Wajib diisi: Nama Motor dan Harga Beli
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid || insertMotorMutation.isPending}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${isValid && !insertMotorMutation.isPending ? "bg-[#f59e0b]" : "bg-slate-200"}`}
          >
            {insertMotorMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CheckCircle
                  size={22}
                  color={isValid ? "white" : "#94a3b8"}
                  strokeWidth={2}
                />
                <Text
                  className={`text-center font-bold text-lg ${isValid ? "text-white" : "text-slate-400"}`}
                >
                  Simpan Motor
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
