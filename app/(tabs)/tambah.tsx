import { FACEBOOK_ENABLED } from "@/src/services/facebookServices";
import { ScreenHeader } from "@/src/components/layout/ScreenHeader";
import {
  MotorBrandPicker,
  MotorPrimaryFields,
} from "@/src/components/motor/MotorForm";
import { useInsertMotor, useUploadMotorImages } from "@/src/hooks/useMotors";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { MotorInsert } from "@/src/services/motorServices";
import { parseRupiah } from "@/src/utils/formatRupiah";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
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
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuickAddMotorPage() {
  const router = useRouter();
  const insertMotorMutation = useInsertMotor();
  const uploadMotorImagesMutation = useUploadMotorImages();
  const { data: subscription } = useSubscriptionStatus();
  const isPremium = subscription?.isPremium ?? false;

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const isValid = brand !== "" && name.trim() !== "" && buyingPrice !== "";
  const buying = parseRupiah(buyingPrice);
  const selling = parseRupiah(sellingPrice);
  const isSubmitting =
    insertMotorMutation.isPending || uploadMotorImagesMutation.isPending;

  function resetForm() {
    setBrand("");
    setName("");
    setYear("");
    setPlateNumber("");
    setBuyingPrice("");
    setSellingPrice("");
    setPhotos([]);
  }

  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Maaf, kami butuh izin akses galeri untuk mengunggah foto!",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - photos.length,
      });

      if (!result.canceled) {
        setPhotos((previousPhotos) => {
          const selectedPhotos = result.assets.filter(
            (asset) =>
              !previousPhotos.some(
                (photo) =>
                  (asset.assetId && photo.assetId === asset.assetId) ||
                  photo.uri === asset.uri,
              ),
          );
          return [...previousPhotos, ...selectedPhotos].slice(0, 5);
        });
      }
    } catch (error) {
      console.error("Pick motor images failed:", error);
      Alert.alert("Gagal", "Foto tidak dapat dipilih. Coba lagi.");
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  async function handleSimpan() {
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
    };

    try {
      const createdMotor = await insertMotorMutation.mutateAsync(motorData);

      let successMessage = "Motor sudah ditambahkan.";
      if (isPremium && photos.length > 0) {
        try {
          await uploadMotorImagesMutation.mutateAsync({
            motorId: createdMotor.id,
            files: photos,
          });
          successMessage = "Motor dan foto berhasil ditambahkan.";
        } catch (error) {
          successMessage =
            "Motor berhasil ditambahkan, tetapi upload foto gagal. Anda bisa mencoba lagi dari halaman detail motor.";
          console.error("Upload motor images failed:", error);
        }
      }

      Alert.alert("Berhasil", successMessage, [
        ...(FACEBOOK_ENABLED && isPremium
          ? [
              {
                text: "Siapkan Posting Facebook",
                onPress: () => {
                  resetForm();
                  router.push({
                    pathname: "/facebook-post" as const,
                    params: { id: createdMotor.id },
                  });
                },
              },
            ]
          : []),
        {
          text: "OK",
          onPress: () => {
            resetForm();
            router.replace("/(tabs)/stok");
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error
          ? error.message
          : "Gagal menambahkan motor. Coba lagi.",
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenHeader
          title="Tambah Unit Motor"
          subtitle="Isi data unit baru"
          onBack={() => router.replace("/(tabs)")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        >
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

          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="text-slate-400 text-sm font-medium">
              atau isi manual
            </Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          {insertMotorMutation.isError && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-red-600 text-sm font-medium">
                {insertMotorMutation.error?.message ||
                  "Gagal menambahkan motor."}
              </Text>
            </View>
          )}

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
            <MotorPrimaryFields
              brand={brand}
              name={name}
              year={year}
              plateNumber={plateNumber}
              buyingPrice={buyingPrice}
              sellingPrice={sellingPrice}
              disabled={isSubmitting}
              onOpenBrandPicker={() => setShowBrandPicker(true)}
              onNameChange={setName}
              onYearChange={setYear}
              onPlateNumberChange={setPlateNumber}
              onBuyingPriceChange={setBuyingPrice}
              onSellingPriceChange={setSellingPrice}
            />

            <View className="mt-2 border-t border-slate-100 pt-5">
              <Text className="text-slate-700 font-semibold mb-3">
                Foto Motor
              </Text>

              {isPremium ? (
                <View>
                  {photos.length > 0 && (
                    <View className="flex-row flex-wrap gap-3 mb-3">
                      {photos.map((photo, index) => (
                        <View
                          key={index}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
                        >
                          <Image
                            source={{ uri: photo.uri }}
                            className="w-full h-full object-cover"
                            resizeMode="cover"
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

        <MotorBrandPicker
          visible={showBrandPicker}
          value={brand}
          onChange={setBrand}
          onClose={() => setShowBrandPicker(false)}
        />

        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-5 border-t border-slate-100"
          style={{ elevation: 12 }}
        >
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid || isSubmitting}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              isValid && !isSubmitting ? "bg-[#f59e0b]" : "bg-slate-200"
            }`}
          >
            {isSubmitting ? (
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
