import {
  useDeleteMotor,
  useMotorById,
  useUpdateMotor,
} from "@/src/hooks/useMotors";
import type { Motor } from "@/src/types/motor";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
// import { useLocalSearchParams, useRouter } from "expo-router";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "TVS", "Lainnya"];

export default function EditMotorPage() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  console.log("=== DEBUG EDIT MOTOR ===");
  console.log("1. ID yang ditangkap:", id);
  console.log("2. Tipe data ID:", typeof id);

  const { data: motor, isLoading: motorsLoading, error } = useMotorById(id);
  console.log("3. Error dari Backend:", error?.message || "Tidak ada error");
  console.log(
    "4. Data Motor yang didapat:",
    motor ? "Berhasil didapat" : "KOSONG",
  );
  console.log("========================");
  const updateMotorMutation = useUpdateMotor();
  const deleteMotorMutation = useDeleteMotor();
  const insets = useSafeAreaInsets();
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [frameNumber, setFrameNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [color, setColor] = useState("");
  const [kilometer, setKilometer] = useState("");
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (motor && !loaded) {
      setBrand(motor.brand ?? "");
      setName(motor.name ?? "");
      setYear(motor.year ? String(motor.year) : "");
      setBuyingPrice(
        motor.buyingPrice ? formatRupiahInput(String(motor.buyingPrice)) : "",
      );
      setSellingPrice(
        motor.sellingPrice ? formatRupiahInput(String(motor.sellingPrice)) : "",
      );
      setFrameNumber(motor.frameNumber ?? "");
      setEngineNumber(motor.engineNumber ?? "");
      setPlateNumber(motor.plateNumber ?? ""); // switching to type plateNumber
      setColor(motor.color ?? "");
      setKilometer(motor.kilometer != null ? String(motor.kilometer) : "");
      setLoaded(true);
    }
  }, [motor, loaded]);

  const buying = parseRupiah(buyingPrice);
  const selling = parseRupiah(sellingPrice);
  const profit = buying > 0 && selling > 0 ? selling - buying : null;
  const margin =
    buying > 0 && selling > 0
      ? (((selling - buying) / buying) * 100).toFixed(1)
      : null;

  const isValid = brand !== "" && name.trim() !== "" && buyingPrice !== "";

  function handleSimpan() {
    if (!isValid || !id) return;

    const hasAllRequired =
      frameNumber.trim() !== "" && engineNumber.trim() !== "";

    updateMotorMutation.mutate(
      {
        id,
        updates: {
          brand,
          name: name.trim(),
          year: Number(year) || undefined,
          buyingPrice: buying,
          sellingPrice: selling || undefined,
          frameNumber: frameNumber.trim() || undefined,
          engineNumber: engineNumber.trim() || undefined,
          plateNumber: plateNumber.trim() || undefined,
          color: color.trim() || undefined,
          kilometer: kilometer.trim() ? Number(kilometer) : undefined,
          isIncomplete: !hasAllRequired,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Berhasil", "Data motor berhasil diperbarui.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            "Gagal",
            error.message || "Gagal memperbarui motor. Coba lagi.",
          );
        },
      },
    );
  }

  function handleDelete() {
    if (!id) return;
    Alert.alert(
      "Hapus Motor",
      `Yakin ingin menghapus ${brand} ${name}? Data yang dihapus tidak bisa dikembalikan.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteMotorMutation.mutate(id, {
              onSuccess: () => {
                Alert.alert("Berhasil", "Motor berhasil dihapus.", [
                  { text: "OK", onPress: () => router.replace("/(tabs)/stok") },
                ]);
              },
              onError: (error) => {
                Alert.alert("Gagal", error.message || "Gagal menghapus motor.");
              },
            });
          },
        },
      ],
    );
  }

  // ── Loading / Not Found state ──
  if (motorsLoading || (!motor && !motorsLoading)) {
    return (
      <SafeAreaView
        className="flex-1 bg-slate-100 items-center justify-center"
        edges={["top"]}
      >
        {motorsLoading ? (
          <>
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text className="text-slate-400 text-sm mt-3">
              Memuat data motor...
            </Text>
          </>
        ) : (
          <>
            <Text className="text-slate-800 font-bold text-lg">
              Motor Tidak Ditemukan
            </Text>
            <Text className="text-slate-400 text-sm mt-2">
              Unit ini mungkin sudah dihapus atau tidak tersedia.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 bg-otokas-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Kembali</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }

  const currentMotor = motor as Motor;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View className="bg-otokas-primary px-5 pt-5 pb-5 flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Edit Motor</Text>
            <Text className="text-blue-200 text-sm">
              {currentMotor.brand} {currentMotor.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleteMotorMutation.isPending}
            className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center"
          >
            {deleteMotorMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Trash2 size={18} color="#fca5a5" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        >
          {/* Error */}
          {updateMotorMutation.isError && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-red-600 text-sm font-medium">
                {updateMotorMutation.error?.message ||
                  "Gagal memperbarui motor."}
              </Text>
            </View>
          )}

          {/* ── SECTION: Data Utama ── */}
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Data Utama
          </Text>
          <View
            className="bg-white rounded-2xl px-5 py-6 gap-5 mb-5"
            style={{
              elevation: 1,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            {/* Merek — Dropdown */}
            <View>
              <Text className="text-slate-700 font-semibold text-sm mb-2">
                Merek
              </Text>
              <TouchableOpacity
                onPress={() => setShowBrandPicker(true)}
                disabled={updateMotorMutation.isPending}
                className="border border-slate-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between bg-white"
              >
                <Text
                  className={
                    brand
                      ? "text-slate-900 text-base"
                      : "text-slate-400 text-base"
                  }
                >
                  {brand || "Pilih merek"}
                </Text>
                <Text className="text-slate-400 text-base">⌄</Text>
              </TouchableOpacity>
            </View>

            {/* Model / Tipe */}
            <View>
              <Text className="text-slate-700 font-semibold text-sm mb-2">
                Model / Tipe
              </Text>
              <TextInput
                placeholder="Contoh: Vario 125 CBS"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#94a3b8"
                editable={!updateMotorMutation.isPending}
                className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
              />
            </View>

            {/* Tahun + Plat Nomor */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Tahun
                </Text>
                <TextInput
                  placeholder="2023"
                  value={year}
                  onChangeText={(t) =>
                    setYear(t.replace(/\D/g, "").slice(0, 4))
                  }
                  keyboardType="numeric"
                  maxLength={4}
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Plat Nomor
                </Text>
                <TextInput
                  placeholder="B 1234 ABC"
                  value={plateNumber}
                  onChangeText={(t) => setPlateNumber(t.toUpperCase())}
                  autoCapitalize="characters"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
            </View>

            {/* Harga Beli + Harga Jual */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Harga Beli (Rp)
                </Text>
                <TextInput
                  placeholder="14000000"
                  value={buyingPrice}
                  onChangeText={(t) => setBuyingPrice(formatRupiahInput(t))}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Harga Jual (Rp)
                </Text>
                <TextInput
                  placeholder="16500000"
                  value={sellingPrice}
                  onChangeText={(t) => setSellingPrice(formatRupiahInput(t))}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
            </View>

            {/* Estimasi Margin */}
            {margin !== null && profit !== null && (
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <Text className="text-emerald-700 font-semibold text-sm">
                  Estimasi Untung
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-700 text-sm font-medium">
                    Rp {profit.toLocaleString("id-ID")}
                  </Text>
                  <View className="bg-emerald-500 px-2.5 py-1 rounded-lg">
                    <Text className="text-white text-xs font-bold">
                      {margin}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── SECTION: Data Dokumen ── */}
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Data Dokumen
          </Text>
          <View
            className="bg-white rounded-2xl px-5 py-6 gap-5"
            style={{
              elevation: 1,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            {/* Nomor Rangka + Nomor Mesin */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Nomor Rangka
                </Text>
                <TextInput
                  placeholder="MH1JFM118GK12"
                  value={frameNumber}
                  onChangeText={(t) => setFrameNumber(t.toUpperCase())}
                  autoCapitalize="characters"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Nomor Mesin
                </Text>
                <TextInput
                  placeholder="JFM1E1123456"
                  value={engineNumber}
                  onChangeText={(t) => setEngineNumber(t.toUpperCase())}
                  autoCapitalize="characters"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
            </View>

            {/* Warna + STNK s/d */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Warna
                </Text>
                <TextInput
                  placeholder="Hitam"
                  value={color}
                  onChangeText={setColor}
                  autoCapitalize="words"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Kilometer
                </Text>
                <TextInput
                  placeholder="24500"
                  value={kilometer}
                  onChangeText={(t) => setKilometer(t.replace(/\D/g, ""))}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  editable={!updateMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
            </View>

            {/* Info kelengkapan data */}
            {(frameNumber.trim() === "" || engineNumber.trim() === "") && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Text className="text-amber-700 text-xs leading-5">
                  Lengkapi Data Dokumen Motor diatas
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Brand Picker Modal */}
        <Modal
          visible={showBrandPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBrandPicker(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/40"
            activeOpacity={1}
            onPress={() => setShowBrandPicker(false)}
          />
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
            <Text className="text-slate-900 font-bold text-lg mb-4">
              Pilih Merek
            </Text>
            {BRANDS.map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => {
                  setBrand(b);
                  setShowBrandPicker(false);
                }}
                className="py-4 border-b border-slate-100 flex-row items-center justify-between"
              >
                <Text
                  className={`text-base ${brand === b ? "text-otokas-primary font-semibold" : "text-slate-700"}`}
                >
                  {b}
                </Text>
                {brand === b && (
                  <Text className="text-otokas-primary font-bold">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>

        {/* TOMBOL SIMPAN sticky */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-5 border-t border-slate-100"
          style={{ elevation: 12, paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {!isValid && (
            <Text className="text-slate-400 text-sm text-center mb-3">
              Wajib diisi: Merek, Model/Tipe, dan Harga Beli
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid || updateMotorMutation.isPending}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center mb-7 ${
              isValid && !updateMotorMutation.isPending
                ? "bg-[#f59e0b]"
                : "bg-slate-200"
            }`}
          >
            {updateMotorMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text
                  className={`text-center font-bold text-lg ${isValid ? "text-white" : "text-slate-400"}`}
                >
                  Simpan Perubahan
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
