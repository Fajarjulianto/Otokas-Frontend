import { MotorPhotoPicker } from "@/src/components/motor/MotorPhotoPicker";
import {
  ScanDataRows,
  type EditableScanField,
} from "@/src/components/scan/ScanDataRows";
import { useInsertMotor, useUploadMotorImages } from "@/src/hooks/useMotors";
import type { OcrResult } from "@/src/types/scan";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import {
  getScanDataWarning,
  hasRequiredScanData,
  toMotorInsertFromScan,
} from "@/src/utils/scanMotor";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, DollarSign, ScanLine } from "lucide-react-native";
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
  currentIndex,
  totalCount,
  onSuccessNext,
}: {
  ocr: OcrResult;
  onBack: () => void;
  currentIndex?: number;
  totalCount?: number;
  onSuccessNext?: () => void;
}) {
  const router = useRouter();
  const insertMotorMutation = useInsertMotor();
  const uploadMotorImagesMutation = useUploadMotorImages();

  const [hargaJual, setHargaJual] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [brand, setBrand] = useState(ocr.brand ?? "");
  const [name, setName] = useState(ocr.name ?? "");
  const [year, setYear] = useState<number | null>(ocr.year ?? null);
  const [color, setColor] = useState(ocr.color ?? "");
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const buying = parseRupiah(hargaBeli);
  const selling = parseRupiah(hargaJual);
  const editableOcr: OcrResult = { ...ocr, brand, name, year, color };
  const hasScanData = hasRequiredScanData(editableOcr);
  const scanWarning = getScanDataWarning(editableOcr);
  const missingFields = {
    brand: !ocr.brand?.trim(),
    name: !ocr.name?.trim(),
    year: !ocr.year,
    color: !ocr.color?.trim(),
  };
  const isSubmitting =
    insertMotorMutation.isPending || uploadMotorImagesMutation.isPending;
  const margin =
    buying > 0 && selling > 0
      ? (((selling - buying) / buying) * 100).toFixed(1)
      : null;
  const profit = buying > 0 && selling > 0 ? selling - buying : null;

  const isValid = hasScanData && buying > 0;

  const handleScanFieldChange = (field: EditableScanField, value: string) => {
    if (field === "brand") setBrand(value);
    if (field === "name") setName(value);
    if (field === "color") setColor(value);
    if (field === "year") {
      const yearValue = value.replace(/\D/g, "").slice(0, 4);
      setYear(yearValue ? Number(yearValue) : null);
    }
  };

  async function handleSimpan() {
    if (!isValid) return;
    const dataMotor = toMotorInsertFromScan(editableOcr, buying, selling);

    try {
      const createdMotor = await insertMotorMutation.mutateAsync(dataMotor);
      let successMessage =
        totalCount && currentIndex && currentIndex < totalCount
          ? `Motor ${currentIndex} dari ${totalCount} berhasil disimpan.`
          : "Motor berhasil disimpan dari scan STNK.";

      if (photos.length > 0) {
        try {
          await uploadMotorImagesMutation.mutateAsync({
            motorId: createdMotor.id,
            files: photos,
          });
          successMessage = "Motor dan foto berhasil disimpan dari scan STNK.";
        } catch (photoError) {
          console.warn(
            "[ScreenConfirmation] Foto motor gagal diupload:",
            photoError,
          );
          successMessage =
            "Motor berhasil disimpan, tetapi upload foto gagal. Foto dapat ditambahkan dari detail motor.";
        }
      }

      Alert.alert("Berhasil", successMessage, [
        {
          text: "OK",
          onPress: () => {
            if (onSuccessNext) {
              onSuccessNext();
            } else {
              onBack();
              router.replace("/(tabs)/stok");
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan motor. Coba lagi.",
      );
    }
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
              Hasil Scan STNK
            </Text>
            <Text className="text-blue-200 text-sm mt-0.5">
              Data STNK otomatis, lengkapi harga motor
            </Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        >
          <View
            className="bg-white rounded-2xl overflow-hidden mb-5"
            style={{ elevation: 2 }}
          >
            <View className="bg-slate-50 px-4 py-4 flex-row items-center gap-3 border-b border-slate-100">
              <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                <ScanLine size={21} color="#1e40af" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-base">
                  {[brand, name].filter(Boolean).join(" ") ||
                    "Data motor belum dikenali"}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Data berikut dibaca otomatis dari STNK
                </Text>
              </View>
            </View>

            <ScanDataRows
              ocr={editableOcr}
              editableFields={missingFields}
              onFieldChange={handleScanFieldChange}
            />
          </View>

          {scanWarning && (
            <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-amber-700 text-sm font-medium">
                {scanWarning}
              </Text>
            </View>
          )}

          <View className="bg-white rounded-2xl p-4 mb-5" style={{ elevation: 1 }}>
            <Text className="text-slate-800 text-base font-bold mb-4">
              Lengkapi Harga
            </Text>
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

            <View className="flex-row items-center gap-2 mt-5 mb-2">
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

            {margin !== null && profit !== null && (
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex-row items-center justify-between mt-4">
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

          <View className="bg-white rounded-2xl p-4 mb-5" style={{ elevation: 1 }}>
            <Text className="text-slate-800 text-base font-bold mb-3">
              Foto Motor
            </Text>
            <MotorPhotoPicker
              photos={photos}
              onChange={setPhotos}
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-slate-100"
          style={{ elevation: 12 }}
        >
          {!isValid && (
            <Text className="text-slate-400 text-sm text-center mb-3">
              {hasScanData
                ? "Harga Beli wajib lebih dari Rp 0"
                : "Data merek dan nama motor belum terbaca"}
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid || isSubmitting}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${isValid && !isSubmitting ? "bg-[#f59e0b]" : "bg-slate-200"}`}
          >
            {isSubmitting ? (
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
