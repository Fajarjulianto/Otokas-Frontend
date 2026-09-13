import { MotorPhotoPicker } from "@/src/components/motor/MotorPhotoPicker";
import {
  ScanDataRows,
  type EditableScanField,
} from "@/src/components/scan/ScanDataRows";
import {
  useBulkInsertMotors,
  useInsertMotor,
  useMotors,
  useUploadMotorImages,
} from "@/src/hooks/useMotors";
import type { MotorInsert } from "@/src/services/motorServices";
import type { Motor } from "@/src/types/motor";
import type { OcrResult } from "@/src/types/scan";
import { formatRupiahInput, parseRupiah } from "@/src/utils/formatRupiah";
import {
  getScanDataWarning,
  hasRequiredScanData,
  normalizeScanResult,
  toMotorInsertFromScan,
} from "@/src/utils/scanMotor";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Receipt,
  ScanLine,
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

interface ScannedMotor extends OcrResult {
  id: string;
  buyingPrice: string;
  sellingPrice: string;
  photos: ImagePicker.ImagePickerAsset[];
  missingFields: {
    brand: boolean;
    name: boolean;
    year: boolean;
    color: boolean;
  };
  isExpanded: boolean;
}

function readScanResults(value?: string | string[]): OcrResult[] {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return [];

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeScanResult)
      .filter((item): item is OcrResult => item !== null);
  } catch {
    return [];
  }
}

function toScannedMotors(results: OcrResult[]): ScannedMotor[] {
  return results.map((result, index) => {
    const brand = result.brand ?? "";
    const name = result.name ?? "";
    const frameNumber = result.frameNumber ?? "";
    const plateNumber = result.plateNumber ?? "";

    return {
      ...result,
      brand,
      name,
      frameNumber,
      engineNumber: result.engineNumber ?? "",
      year: result.year ?? null,
      plateNumber,
      color: result.color ?? "",
      category: result.category ?? "",
      stnkCode: result.stnkCode ?? "",
      displacement: result.displacement ?? null,
      isAmbiguous: result.isAmbiguous ?? false,
      isIncomplete: result.isIncomplete ?? true,
      remarks: result.remarks ?? "",
      id: `${index}-${plateNumber || frameNumber || name || "stnk"}`,
      buyingPrice: "",
      sellingPrice: "",
      photos: [],
      missingFields: {
        brand: !brand.trim(),
        name: !name.trim(),
        year: !result.year,
        color: !result.color?.trim(),
      },
      isExpanded: index === 0,
    };
  });
}

function isMotorReady(motor: ScannedMotor): boolean {
  return parseRupiah(motor.buyingPrice) > 0 && hasRequiredScanData(motor);
}

function getScanWarning(motor: ScannedMotor): string | null {
  if (!hasRequiredScanData(motor)) {
    return "Lengkapi merek dan nama motor yang tidak terbaca sebelum menyimpan.";
  }

  const warning = getScanDataWarning(motor);
  return warning;
}

function normalizeIdentity(value?: string): string {
  return value?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() ?? "";
}

function findIdentityConflict(
  motor: Pick<ScannedMotor, "frameNumber" | "engineNumber" | "plateNumber">,
  candidates: Pick<Motor, "frameNumber" | "engineNumber" | "plateNumber">[],
): string | null {
  const identities = [
    { label: "nomor rangka", value: normalizeIdentity(motor.frameNumber) },
    { label: "nomor mesin", value: normalizeIdentity(motor.engineNumber) },
    { label: "plat nomor", value: normalizeIdentity(motor.plateNumber) },
  ];

  for (const identity of identities) {
    if (!identity.value) continue;

    const hasConflict = candidates.some((candidate) => {
      if (identity.label === "nomor rangka") {
        return normalizeIdentity(candidate.frameNumber) === identity.value;
      }
      if (identity.label === "nomor mesin") {
        return normalizeIdentity(candidate.engineNumber) === identity.value;
      }
      return normalizeIdentity(candidate.plateNumber) === identity.value;
    });

    if (hasConflict) return identity.label;
  }

  return null;
}

export default function BatchAddMotorPage() {
  const router = useRouter();
  const { scanResults } = useLocalSearchParams<{
    scanResults?: string | string[];
  }>();
  const [motors, setMotors] = useState<ScannedMotor[]>(() =>
    toScannedMotors(readScanResults(scanResults)),
  );
  const { data: existingMotors = [] } = useMotors();
  const bulkInsertMutation = useBulkInsertMotors();
  const insertMotorMutation = useInsertMotor();
  const uploadMotorImagesMutation = useUploadMotorImages();
  const isSubmitting =
    bulkInsertMutation.isPending ||
    insertMotorMutation.isPending ||
    uploadMotorImagesMutation.isPending;

  const isValid = motors.length > 0 && motors.every(isMotorReady);

  // Fungsi untuk mengubah data spesifik di dalam array motor
  const handleUpdateMotor = <K extends keyof ScannedMotor>(
    id: string,
    field: K,
    value: ScannedMotor[K],
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

  const handleScanFieldChange = (
    id: string,
    field: EditableScanField,
    value: string,
  ) => {
    if (field === "year") {
      const year = value.replace(/\D/g, "").slice(0, 4);
      handleUpdateMotor(id, "year", year ? Number(year) : null);
      return;
    }

    if (field === "brand") handleUpdateMotor(id, "brand", value);
    if (field === "name") handleUpdateMotor(id, "name", value);
    if (field === "color") handleUpdateMotor(id, "color", value);
  };

  const removeMotor = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMotors((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSimpanSemua = async () => {
    if (!isValid) return;

    for (let index = 0; index < motors.length; index += 1) {
      const motor = motors[index];
      const existingConflict = findIdentityConflict(motor, existingMotors);
      const batchConflict = findIdentityConflict(
        motor,
        motors.slice(0, index),
      );
      const conflict = existingConflict ?? batchConflict;

      if (conflict) {
        Alert.alert(
          "Data Motor Sudah Ada",
          `${motor.brand} ${motor.name}${motor.plateNumber ? ` (${motor.plateNumber})` : ""} memiliki ${conflict} yang sudah terdaftar. Hapus kartu duplikat atau periksa stok Anda.`,
        );
        return;
      }
    }

    const savedMotorKeys = new Set<string>();

    try {
      const motorPayloads = motors.map((motor) => ({
        motor,
        payload: toMotorInsertFromScan(
          motor,
          parseRupiah(motor.buyingPrice),
          parseRupiah(motor.sellingPrice),
        ),
      }));
      const hasPhotos = motors.some((motor) => motor.photos.length > 0);
      let failedPhotoUploads = 0;

      if (!hasPhotos) {
        const payload: MotorInsert[] = motorPayloads.map(
          ({ payload: motorPayload }) => motorPayload,
        );
        await bulkInsertMutation.mutateAsync(payload);
      } else {
        for (const { motor, payload } of motorPayloads) {
          const createdMotor = await insertMotorMutation.mutateAsync(payload);
          savedMotorKeys.add(motor.id);

          if (motor.photos.length > 0) {
            try {
              await uploadMotorImagesMutation.mutateAsync({
                motorId: createdMotor.id,
                files: motor.photos,
              });
            } catch (photoError) {
              failedPhotoUploads += 1;
              console.warn(
                `[BatchAddMotorPage] Foto ${motor.brand} ${motor.name} gagal diupload:`,
                photoError,
              );
            }
          }
        }
      }

      Alert.alert(
        failedPhotoUploads > 0 ? "Motor Berhasil Disimpan" : "Sukses!",
        failedPhotoUploads > 0
          ? `${motors.length} motor tersimpan, tetapi foto pada ${failedPhotoUploads} motor gagal diupload. Foto dapat ditambahkan kembali dari detail motor.`
          : `${motors.length} motor berhasil ditambahkan ke etalase Anda.`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)/stok") }],
      );
    } catch (err) {
      console.warn("[BatchAddMotorPage] Gagal menyimpan motor:", err);

      if (savedMotorKeys.size > 0) {
        setMotors((previousMotors) =>
          previousMotors.filter((motor) => !savedMotorKeys.has(motor.id)),
        );
      }

      Alert.alert(
        savedMotorKeys.size > 0 ? "Sebagian Berhasil" : "Gagal",
        savedMotorKeys.size > 0
          ? `${savedMotorKeys.size} motor sudah tersimpan. Motor yang belum tersimpan tetap berada di daftar.\n\n${err instanceof Error ? err.message : "Terjadi kesalahan pada server."}`
          : err instanceof Error
            ? err.message === "Failed to create motor"
              ? "Server menolak data motor. Pastikan nomor rangka, nomor mesin, atau plat belum pernah tersimpan di stok."
              : err.message
            : "Terjadi kesalahan saat menyimpan data.",
      );
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
                . Lengkapi harga dan data yang belum terbaca.
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
              className={`bg-white rounded-2xl mb-4 overflow-hidden border ${isMotorReady(motor) ? "border-emerald-200" : "border-slate-200"}`}
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
                className={`p-4 flex-row items-center justify-between ${isMotorReady(motor) ? "bg-emerald-50/50" : "bg-white"}`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${isMotorReady(motor) ? "bg-emerald-100" : "bg-slate-100"}`}
                  >
                    <Text
                      className={`font-bold ${isMotorReady(motor) ? "text-emerald-700" : "text-slate-500"}`}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1 pr-2">
                    <Text
                      className="font-bold text-slate-800 text-base"
                      numberOfLines={1}
                    >
                      {[motor.brand, motor.name].filter(Boolean).join(" ") ||
                        "Data motor belum dikenali"}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                      {motor.plateNumber || "Plat tidak terbaca"} •{" "}
                      {motor.year || "Tahun tidak terbaca"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  {isMotorReady(motor) && (
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
                  <Text className="text-slate-500 text-xs font-bold mt-2 mb-2 uppercase tracking-wider">
                    Hasil Scan STNK
                  </Text>
                  <View className="bg-slate-50/60 border border-slate-100 rounded-xl px-3 mb-4">
                    <ScanDataRows
                      ocr={motor}
                      editableFields={motor.missingFields}
                      onFieldChange={(field, value) =>
                        handleScanFieldChange(motor.id, field, value)
                      }
                      compact
                    />
                  </View>

                  {getScanWarning(motor) && (
                    <View className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                      <Text className="text-amber-700 text-xs font-medium">
                        {getScanWarning(motor)}
                      </Text>
                    </View>
                  )}

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

                  <View className="mb-4">
                    <Text className="text-slate-600 text-xs font-bold mb-2 uppercase tracking-wider">
                      Foto Motor
                    </Text>
                    <MotorPhotoPicker
                      photos={motor.photos}
                      onChange={(photos) =>
                        handleUpdateMotor(motor.id, "photos", photos)
                      }
                      disabled={isSubmitting}
                    />
                  </View>

                  <View className="flex-row items-center justify-end mt-2 pt-3 border-t border-dashed border-slate-200">
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
              <View className="w-14 h-14 bg-slate-200 rounded-full items-center justify-center mb-3">
                <ScanLine size={26} color="#64748b" />
              </View>
              <Text className="text-slate-700 font-bold text-base">
                Tidak ada hasil scan
              </Text>
              <Text className="text-slate-400 text-sm text-center mt-1 mb-4">
                Scan beberapa STNK untuk mengisi daftar motor.
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/unit/scan")}
                className="bg-otokas-primary rounded-xl px-4 py-3"
              >
                <Text className="text-white font-bold">Scan STNK</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {motors.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-6 border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
            <View className="flex-row justify-between mb-3 px-1">
              <Text className="text-slate-500 font-medium text-sm">
                Status Kelengkapan:
              </Text>
              <Text className="font-bold text-slate-800">
                {motors.filter(isMotorReady).length} / {motors.length} Motor Siap
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
