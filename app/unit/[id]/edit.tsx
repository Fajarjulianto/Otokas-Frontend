import { ScreenHeader } from "@/src/components/layout/ScreenHeader";
import {
  MotorBrandPicker,
  MotorField,
  MotorPrimaryFields,
} from "@/src/components/motor/MotorForm";
import {
  useDeleteMotor,
  useMotorById,
  useUpdateMotor,
} from "@/src/hooks/useMotors";
import type { Motor } from "@/src/types/motor";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function EditMotorPage() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: motor, isLoading: motorsLoading } = useMotorById(id);
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
      setPlateNumber(motor.plateNumber ?? "");
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
        <ScreenHeader
          title="Edit Motor"
          subtitle={`${currentMotor.brand} ${currentMotor.name}`}
          onBack={() => router.back()}
          rightAction={
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
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        >
          {updateMotorMutation.isError && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-red-600 text-sm font-medium">
                {updateMotorMutation.error?.message ||
                  "Gagal memperbarui motor."}
              </Text>
            </View>
          )}

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
            <MotorPrimaryFields
              brand={brand}
              name={name}
              year={year}
              plateNumber={plateNumber}
              buyingPrice={buyingPrice}
              sellingPrice={sellingPrice}
              disabled={updateMotorMutation.isPending}
              onOpenBrandPicker={() => setShowBrandPicker(true)}
              onNameChange={setName}
              onYearChange={setYear}
              onPlateNumberChange={setPlateNumber}
              onBuyingPriceChange={setBuyingPrice}
              onSellingPriceChange={setSellingPrice}
              compactPricePlaceholder
            />

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
            <View className="flex-row gap-4">
              <MotorField
                label="Nomor Rangka"
                placeholder="MH1JFM118GK12"
                value={frameNumber}
                onChangeText={(value) =>
                  setFrameNumber(value.toUpperCase())
                }
                autoCapitalize="characters"
                editable={!updateMotorMutation.isPending}
              />
              <MotorField
                label="Nomor Mesin"
                placeholder="JFM1E1123456"
                value={engineNumber}
                onChangeText={(value) =>
                  setEngineNumber(value.toUpperCase())
                }
                autoCapitalize="characters"
                editable={!updateMotorMutation.isPending}
              />
            </View>

            <View className="flex-row gap-4">
              <MotorField
                label="Warna"
                placeholder="Hitam"
                value={color}
                onChangeText={setColor}
                autoCapitalize="words"
                editable={!updateMotorMutation.isPending}
              />
              <MotorField
                label="Kilometer"
                placeholder="24500"
                value={kilometer}
                onChangeText={(value) =>
                  setKilometer(value.replace(/\D/g, ""))
                }
                keyboardType="numeric"
                editable={!updateMotorMutation.isPending}
              />
            </View>

            {(frameNumber.trim() === "" || engineNumber.trim() === "") && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Text className="text-amber-700 text-xs leading-5">
                  Lengkapi Data Dokumen Motor diatas
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <MotorBrandPicker
          visible={showBrandPicker}
          value={brand}
          onChange={setBrand}
          onClose={() => setShowBrandPicker(false)}
        />

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
