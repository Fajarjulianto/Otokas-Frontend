import { bulkInsertMotors, MotorInsert } from "@/src/services/motorServices";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Receipt,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipe data untuk motor hasil scan
interface ScannedMotor {
  id: string;
  brand: string;
  name: string;
  year: string;
  plateNumber: string;
  buyingPrice: string;
  sellingPrice: string;
  isIncomplete: boolean;
  isExpanded: boolean; // Untuk fitur accordion
}

export default function BatchAddMotorPage() {
  const router = useRouter();

  const initialScannedData: ScannedMotor[] = [
    {
      id: "1",
      brand: "Honda",
      name: "Vario 150",
      year: "2019",
      plateNumber: "B 1234 ABC",
      buyingPrice: "",
      sellingPrice: "",
      isIncomplete: true,
      isExpanded: true,
    },
    {
      id: "2",
      brand: "Yamaha",
      name: "NMAX 155",
      year: "2021",
      plateNumber: "D 5678 DEF",
      buyingPrice: "",
      sellingPrice: "",
      isIncomplete: true,
      isExpanded: false,
    },
    {
      id: "3",
      brand: "Honda",
      name: "Beat CBS",
      year: "2022",
      plateNumber: "F 9012 GHI",
      buyingPrice: "",
      sellingPrice: "",
      isIncomplete: true,
      isExpanded: false,
    },
  ];

  const [motors, setMotors] = useState<ScannedMotor[]>(initialScannedData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    motors.length > 0 &&
    motors.every((m) => parseRupiah(m.buyingPrice) > 0 && m.brand && m.name);

  // Fungsi untuk mengubah data spesifik di dalam array motor
  const handleUpdateMotor = (
    id: string,
    field: keyof ScannedMotor,
    value: any,
  ) => {
    setMotors((prev) =>
      prev.map((motor) =>
        motor.id === id ? { ...motor, [field]: value } : motor,
      ),
    );
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    handleUpdateMotor(
      id,
      "isExpanded",
      !motors.find((m) => m.id === id)?.isExpanded,
    );
  };

  const removeMotor = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMotors((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSimpanSemua = async () => {
    if (!isValid) return;
    setIsSubmitting(true);

    try {
      const payload: MotorInsert[] = motors.map((motor) => ({
        brand: motor.brand,
        name: motor.name.trim(),
        year: Number(motor.year) || undefined,
        plateNumber: motor.plateNumber.trim() || undefined,
        buyingPrice: parseRupiah(motor.buyingPrice),
        sellingPrice: parseRupiah(motor.sellingPrice) || undefined,
        isIncomplete: !motor.brand || !motor.name || parseRupiah(motor.buyingPrice) <= 0,
      }));
      await bulkInsertMotors(payload);

      Alert.alert(
        "Sukses!",
        `${motors.length} Motor berhasil ditambahkan ke etalase Anda.`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)/stok") }],
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── HEADER ── */}
        <View className="bg-otokas-primary px-5 pt-4 pb-6 border-b border-blue-900/50">
          <View className="flex-row items-center gap-4 mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-xl font-black tracking-tight">
                Lengkapi Data
              </Text>
            </View>
          </View>

          {/* Info Banner */}
          <View className="bg-white/10 p-3 rounded-xl flex-row items-center gap-3 border border-white/20">
            <Receipt size={24} color="#60a5fa" />
            <View className="flex-1">
              <Text className="text-blue-50 font-medium text-sm leading-tight">
                Berhasil mendeteksi{" "}
                <Text className="font-bold text-white">
                  {motors.length} STNK
                </Text>
                . Silakan lengkapi harga untuk menyimpannya ke stok Anda.
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {motors.map((motor, index) => (
            <View
              key={motor.id}
              className={`bg-white rounded-2xl mb-4 overflow-hidden border ${parseRupiah(motor.buyingPrice) > 0 ? "border-emerald-200" : "border-slate-200"}`}
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 5,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleExpand(motor.id)}
                className={`p-4 flex-row items-center justify-between ${parseRupiah(motor.buyingPrice) > 0 ? "bg-emerald-50/50" : "bg-white"}`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${parseRupiah(motor.buyingPrice) > 0 ? "bg-emerald-100" : "bg-slate-100"}`}
                  >
                    <Text
                      className={`font-bold ${parseRupiah(motor.buyingPrice) > 0 ? "text-emerald-700" : "text-slate-500"}`}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1 pr-2">
                    <Text
                      className="font-bold text-slate-800 text-base"
                      numberOfLines={1}
                    >
                      {motor.brand} {motor.name}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                      Plat:{" "}
                      <Text className="font-semibold text-slate-700">
                        {motor.plateNumber}
                      </Text>{" "}
                      • {motor.year}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  {parseRupiah(motor.buyingPrice) > 0 && (
                    <CheckCircle2 size={20} color="#10b981" />
                  )}
                  {motor.isExpanded ? (
                    <ChevronUp size={20} color="#94a3b8" />
                  ) : (
                    <ChevronDown size={20} color="#94a3b8" />
                  )}
                </View>
              </TouchableOpacity>

              {motor.isExpanded && (
                <View className="p-4 pt-2 border-t border-slate-100 bg-white">
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider">
                        Harga Beli <Text className="text-red-500">*</Text>
                      </Text>
                      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                        <Text className="text-slate-400 font-semibold mr-1">
                          Rp
                        </Text>
                        <TextInput
                          value={motor.buyingPrice}
                          onChangeText={(t) =>
                            handleUpdateMotor(
                              motor.id,
                              "buyingPrice",
                              formatRupiahInput(t),
                            )
                          }
                          placeholder="0"
                          keyboardType="numeric"
                          className="flex-1 py-2 text-slate-800 font-semibold"
                        />
                      </View>
                    </View>

                    {/* Input Harga Jual */}
                    <View className="flex-1">
                      <Text className="text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider">
                        Harga Jual
                      </Text>
                      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                        <Text className="text-slate-400 font-semibold mr-1">
                          Rp
                        </Text>
                        <TextInput
                          value={motor.sellingPrice}
                          onChangeText={(t) =>
                            handleUpdateMotor(
                              motor.id,
                              "sellingPrice",
                              formatRupiahInput(t),
                            )
                          }
                          placeholder="0"
                          keyboardType="numeric"
                          className="flex-1 py-2 text-slate-800 font-semibold"
                        />
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2 mb-4">
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateMotor(
                          motor.id,
                          "isIncomplete",
                          !motor.isIncomplete,
                        )
                      }
                      className={`px-3 py-2 rounded-xl border ${motor.isIncomplete ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}
                    >
                      <Text
                        className={`text-xs font-bold ${motor.isIncomplete ? "text-amber-700" : "text-emerald-700"}`}
                      >
                        {motor.isIncomplete ? "Belum Lengkap" : "Lengkap"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Tombol Aksi Bawah Card */}
                  <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-dashed border-slate-200">
                    <TouchableOpacity className="flex-row items-center gap-1.5 px-2 py-1">
                      <ImagePlus size={16} color="#64748b" />
                      <Text className="text-slate-500 text-xs font-medium">
                        Tambah Foto (Opsional)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeMotor(motor.id)}
                      className="flex-row items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Trash2 size={14} color="#ef4444" />
                      <Text className="text-red-600 text-xs font-semibold">
                        Hapus
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          {motors.length === 0 && (
            <View className="items-center justify-center py-10">
              <Text className="text-slate-400 font-medium">
                Semua motor telah dihapus dari daftar.
              </Text>
            </View>
          )}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-6 border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
          <View className="flex-row justify-between mb-3 px-1">
            <Text className="text-slate-500 font-medium text-sm">
              Status Kelengkapan:
            </Text>
            <Text className="font-bold text-slate-800">
              {motors.filter((m) => parseRupiah(m.buyingPrice) > 0).length} /{" "}
              {motors.length} Motor Siap
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSimpanSemua}
            disabled={!isValid || isSubmitting || motors.length === 0}
            className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              isValid && !isSubmitting && motors.length > 0
                ? "bg-[#f59e0b]"
                : "bg-slate-200"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`font-bold text-lg ${isValid && motors.length > 0 ? "text-white" : "text-slate-400"}`}
              >
                Simpan {motors.length} Motor ke Stok
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
