import { useInsertMotor } from "@/src/hooks/useMotors";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { MotorInsert } from "@/src/services/motorServices";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  ImagePlus,
  Lock,
  ScanLine,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
  const insertMotorMutation = useInsertMotor();

  // ── CEK STATUS PREMIUM ──
  const { data: subscription } = useSubscriptionStatus();
  const isPremium = subscription?.isPremium ?? false;

  // ── STATE FORM ──
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  // ── STATE FOTO ──
  const [photos, setPhotos] = useState<string[]>([]);
  const isValid = brand !== "" && name.trim() !== "" && buyingPrice !== "";
  const buying = parseRupiah(buyingPrice);
  const selling = parseRupiah(sellingPrice);

  function resetForm() {
    setBrand("");
    setName("");
    setYear("");
    setPlateNumber("");
    setBuyingPrice("");
    setSellingPrice("");
    setPhotos([]); // Reset foto juga
  }

  // ── FUNGSI PILIH FOTO ──
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Ditolak",
        "Maaf, kami butuh izin akses galeri untuk mengunggah foto!",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...selectedUris].slice(0, 5));
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  function handleSimpan() {
    if (!isValid) return;

    const yearNum = Number(year);

    const motorData: MotorInsert = {
      brand,
      name: name.trim(),
      buyingPrice: buying,
      isIncomplete: true,
      ...(yearNum > 0 && { year: yearNum }),
      ...(selling > 0 && { sellingPrice: selling }),
      ...(plateNumber.trim() && { plateNumber: plateNumber.trim() }),
      ///VARIABEL PHOTOS
    };

    insertMotorMutation.mutate(motorData, {
      onSuccess: () => {
        Alert.alert("Berhasil", "Motor sudah ditambahkan.", [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              router.replace("/(tabs)/stok");
            },
          },
        ]);
      },
      onError: (error) => {
        Alert.alert(
          "Gagal",
          error.message || "Gagal menambahkan motor. Coba lagi.",
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

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="text-slate-400 text-sm font-medium">
              atau isi manual
            </Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          {/* Error Message */}
          {insertMotorMutation.isError && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-red-600 text-sm font-medium">
                {insertMotorMutation.error?.message ||
                  "Gagal menambahkan motor."}
              </Text>
            </View>
          )}

          {/* Form Card */}
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
            <View>
              <Text className="text-slate-700 font-semibold text-sm mb-2">
                Merek
              </Text>
              <TouchableOpacity
                onPress={() => setShowBrandPicker(true)}
                disabled={insertMotorMutation.isPending}
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
                editable={!insertMotorMutation.isPending}
                className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
              />
            </View>

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
                  editable={!insertMotorMutation.isPending}
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
                  editable={!insertMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Harga Beli (Rp)
                </Text>
                <TextInput
                  placeholder="14.000.000"
                  value={buyingPrice}
                  onChangeText={(t) => setBuyingPrice(formatRupiahInput(t))}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  editable={!insertMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 font-semibold text-sm mb-2">
                  Harga Jual (Rp)
                </Text>
                <TextInput
                  placeholder="16.500.000"
                  value={sellingPrice}
                  onChangeText={(t) => setSellingPrice(formatRupiahInput(t))}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  editable={!insertMotorMutation.isPending}
                  className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
                />
              </View>
            </View>

            {/* ── BAGIAN UPLOAD FOTO (PREMIUM ONLY) ── */}
            <View className="mt-2 border-t border-slate-100 pt-5">
              <Text className="text-slate-700 font-semibold mb-3">
                Foto Motor
              </Text>

              {isPremium ? (
                <View>
                  {photos.length > 0 && (
                    <View className="flex-row flex-wrap gap-3 mb-3">
                      {photos.map((uri, index) => (
                        <View
                          key={index}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
                        >
                          <Image
                            source={{ uri }}
                            className="w-full h-full object-cover"
                          />
                          <TouchableOpacity
                            onPress={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center backdrop-blur-md"
                          >
                            <X size={14} color="white" strokeWidth={3} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {photos.length < 5 && (
                    <TouchableOpacity
                      onPress={pickImages}
                      className="flex-row items-center justify-center gap-2 bg-slate-50 border-2 border-slate-200 border-dashed py-4 rounded-2xl"
                    >
                      <ImagePlus size={24} color="#64748b" />
                      <Text className="text-slate-600 font-semibold">
                        {photos.length === 0
                          ? "Unggah Foto Motor (Maks 5)"
                          : "Tambah Foto Lagi"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 items-center text-center">
                  <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center mb-3">
                    <Lock size={20} color="#64748b" />
                  </View>
                  <Text className="text-slate-800 font-bold text-base mb-1">
                    Fitur Foto Terkunci
                  </Text>
                  <Text className="text-slate-500 text-xs text-center mb-4 px-4 leading-relaxed">
                    Tampilkan motor Anda dengan foto tanpa batas agar lebih
                    cepat laku. Khusus untuk Paket Juragan.
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/paket")}
                    className="bg-amber-500 px-6 py-3 rounded-xl flex-row items-center gap-2 shadow-md shadow-amber-500/20"
                  >
                    <Text className="text-white font-bold text-sm">
                      Upgrade Juragan
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
                className={`py-4 border-b border-slate-100 flex-row items-center justify-between ${
                  brand === b ? "opacity-100" : "opacity-100"
                }`}
              >
                <Text
                  className={`text-base ${
                    brand === b
                      ? "text-otokas-primary font-semibold"
                      : "text-slate-700"
                  }`}
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
          style={{ elevation: 12 }}
        >
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid || insertMotorMutation.isPending}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              isValid && !insertMotorMutation.isPending
                ? "bg-[#f59e0b]"
                : "bg-slate-200"
            }`}
          >
            {insertMotorMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-center font-bold text-lg ${
                  isValid ? "text-white" : "text-slate-400"
                }`}
              >
                Simpan Motor
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
