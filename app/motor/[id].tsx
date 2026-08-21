import {
  MotorInfoRow,
  MotorPhotoSlide,
  MotorSpecItem,
} from "@/src/components/motor/MotorDetailParts";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import {
  useMarkAsSold,
  useMotorById,
  useReplaceMotorImages,
  useUploadMotorImages,
} from "@/src/hooks/useMotors";
import type { MotorImage } from "@/src/types/motor";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { isValidHttpUrl } from "@/src/utils/validation";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Bike,
  Calendar,
  ClipboardList,
  FileText,
  Hash,
  ImagePlus,
  Palette,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const MAX_MOTOR_IMAGES = 5;

export default function MotorDetailPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: motor, isLoading } = useMotorById(id);
  const { data: subscription } = useSubscriptionStatus();
  const markAsSoldMutation = useMarkAsSold();
  const uploadMotorImagesMutation = useUploadMotorImages();
  const replaceMotorImagesMutation = useReplaceMotorImages();
  const isPremium = subscription?.isPremium ?? false;
  const motorImages = motor?.motorImages ?? [];
  const validMotorImages = motorImages.filter((image) =>
    isValidHttpUrl(image.url),
  );
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const galleryWidth = Math.max(width - 56, 240);
  const galleryHeight = Math.round((galleryWidth * 9) / 16);
  const subtitle = [motor?.year, motor?.plateNumber].filter(Boolean).join(" · ");
  const showGallery = isPremium && validMotorImages.length > 0;
  const isPhotoMutationPending =
    uploadMotorImagesMutation.isPending || replaceMotorImagesMutation.isPending;

  React.useEffect(() => {
    if (currentPhotoIndex >= validMotorImages.length) {
      setCurrentPhotoIndex(0);
    }
  }, [currentPhotoIndex, validMotorImages.length]);

  const margin =
    motor?.buyingPrice && motor?.sellingPrice && motor.buyingPrice > 0
      ? (
          ((motor.sellingPrice - motor.buyingPrice) / motor.buyingPrice) *
          100
        ).toFixed(1)
      : null;

  const estimasiMargin =
    motor?.buyingPrice && motor?.sellingPrice
      ? motor.sellingPrice - motor.buyingPrice
      : null;

  function handleMarkAsSold() {
    if (!motor) return;
    Alert.alert(
      "Tandai Terjual",
      `Yakin ${motor.brand} ${motor.name} sudah terjual?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Terjual",
          onPress: () => {
            markAsSoldMutation.mutate(motor.id, {
              onSuccess: () => {
                Alert.alert("Berhasil", "Motor berhasil ditandai terjual.", [
                  { text: "OK", onPress: () => router.replace("/(tabs)/stok") },
                ]);
              },
            });
          },
        },
      ],
    );
  }

  async function handlePickPhotos(imageToReplace?: MotorImage) {
    if (!motor || !isPremium || isPhotoMutationPending) return;

    const availableSlots = MAX_MOTOR_IMAGES - motorImages.length;
    if (!imageToReplace && availableSlots <= 0) {
      Alert.alert(
        "Batas Foto Tercapai",
        `Maksimal ${MAX_MOTOR_IMAGES} foto motor dapat disimpan.`,
      );
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Maaf, kami butuh izin akses galeri untuk mengelola foto motor.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: !imageToReplace,
        selectionLimit: imageToReplace ? 1 : availableSlots,
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) return;

      const files = imageToReplace
        ? result.assets.slice(0, 1)
        : result.assets.slice(0, availableSlots);
      const imagesToKeep = imageToReplace
        ? motorImages.filter((image) => image !== imageToReplace)
        : motorImages;

      const updatedMotor = await uploadMotorImagesMutation.mutateAsync({
        motorId: motor.id,
        files,
        existingImages: imagesToKeep,
      });

      if (imageToReplace) {
        const updatedImageCount =
          updatedMotor.motorImages?.filter((image) =>
            isValidHttpUrl(image.url),
          )
            .length ?? 1;
        setCurrentPhotoIndex(Math.max(updatedImageCount - 1, 0));
      }

      Alert.alert(
        "Berhasil",
        imageToReplace
          ? "Foto motor berhasil diperbarui."
          : "Foto motor berhasil ditambahkan.",
      );
    } catch (error) {
      console.error("Manage motor images failed:", error);
      Alert.alert(
        "Gagal",
        error instanceof Error
          ? error.message
          : "Foto motor gagal diperbarui. Coba lagi.",
      );
    }
  }

  function handleDeletePhoto(imageToDelete: MotorImage) {
    if (!motor || isPhotoMutationPending) return;

    Alert.alert(
      "Hapus Foto",
      "Foto ini akan dihapus dari motor. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            replaceMotorImagesMutation.mutate(
              {
                motorId: motor.id,
                images: motorImages.filter((image) => image !== imageToDelete),
              },
              {
                onSuccess: () => {
                  setCurrentPhotoIndex(0);
                  Alert.alert("Berhasil", "Foto motor berhasil dihapus.");
                },
                onError: (error) => {
                  Alert.alert(
                    "Gagal",
                    error instanceof Error
                      ? error.message
                      : "Foto motor gagal dihapus. Coba lagi.",
                  );
                },
              },
            );
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  if (!motor) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center px-8"
        edges={["top"]}
      >
        <Bike size={48} color="#cbd5e1" strokeWidth={1.5} />
        <Text className="text-slate-700 font-bold text-lg mt-4 text-center">
          Motor tidak ditemukan
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 bg-otokas-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <View className="bg-otokas-primary px-5 pt-2 pb-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="white" strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-xl font-bold" numberOfLines={1}>
            Detail Motor
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {showGallery ? (
          <View
            className="bg-white rounded-2xl p-3 mb-4"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={galleryWidth}
              snapToAlignment="start"
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / galleryWidth,
                );
                setCurrentPhotoIndex(nextIndex);
              }}
            >
              {validMotorImages.map((image, index) => (
                <View
                  key={image.id ?? `${image.storageKey}-${index}`}
                  style={{ width: galleryWidth }}
                >
                  <View
                    className="relative overflow-hidden rounded-2xl bg-slate-100"
                    style={{ height: galleryHeight }}
                  >
                    <MotorPhotoSlide uri={image.url} />
                    <View className="absolute top-3 right-3 flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handlePickPhotos(image)}
                        disabled={isPhotoMutationPending}
                        accessibilityLabel="Edit foto motor"
                        className="w-10 h-10 rounded-xl bg-black/55 items-center justify-center"
                      >
                        <Pencil size={17} color="white" strokeWidth={2.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePhoto(image)}
                        disabled={isPhotoMutationPending}
                        accessibilityLabel="Hapus foto motor"
                        className="w-10 h-10 rounded-xl bg-red-600/85 items-center justify-center"
                      >
                        <Trash2 size={17} color="white" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {validMotorImages.length > 1 ? (
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-slate-500 text-xs font-medium">
                  Foto {currentPhotoIndex + 1} dari {validMotorImages.length}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  {validMotorImages.map((_, index) => (
                    <View
                      key={`indicator-${index}`}
                      className={`h-1.5 rounded-full ${
                        index === currentPhotoIndex
                          ? "w-5 bg-otokas-primary"
                          : "w-1.5 bg-slate-300"
                      }`}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {motorImages.length < MAX_MOTOR_IMAGES ? (
              <TouchableOpacity
                onPress={() => handlePickPhotos()}
                disabled={isPhotoMutationPending}
                className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3"
              >
                {isPhotoMutationPending ? (
                  <ActivityIndicator size="small" color="#1e3a8a" />
                ) : (
                  <ImagePlus size={18} color="#475569" />
                )}
                <Text className="text-slate-600 text-sm font-semibold">
                  Tambah Foto ({motorImages.length}/{MAX_MOTOR_IMAGES})
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : isPremium ? (
          <View
            className="bg-white rounded-2xl p-3 mb-4"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <TouchableOpacity
              onPress={() => handlePickPhotos()}
              disabled={isPhotoMutationPending}
              activeOpacity={0.8}
              className="overflow-hidden rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 items-center justify-center"
              style={{ height: galleryHeight }}
            >
              {isPhotoMutationPending ? (
                <ActivityIndicator size="large" color="#1e3a8a" />
              ) : (
                <ImagePlus size={46} color="#64748b" strokeWidth={1.6} />
              )}
              <Text className="text-slate-600 text-base font-semibold mt-3">
                Upload maksimal 5 foto
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                Ketuk untuk memilih foto motor
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          className="bg-white rounded-2xl px-5 py-5 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-900 text-2xl font-bold" numberOfLines={1}>
            {motor.brand} {motor.name}
          </Text>
          {subtitle ? (
            <Text className="text-slate-400 text-sm mt-0.5">{subtitle}</Text>
          ) : null}
          <Text className="text-otokas-primary text-3xl font-bold mt-3">
            {motor.sellingPrice ? (
              formatRupiah(motor.sellingPrice)
            ) : (
              <Text className="text-slate-300 text-xl font-normal">
                Harga belum diisi
              </Text>
            )}
          </Text>
        </View>

        <View
          className="bg-white rounded-2xl px-5 py-4 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-800 font-bold text-base mb-3">
            Spesifikasi
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <MotorSpecItem
              icon={Hash}
              label="Nomor Rangka"
              value={motor.frameNumber}
            />
            <MotorSpecItem
              icon={FileText}
              label="Nomor Mesin"
              value={motor.engineNumber}
            />
            <MotorSpecItem icon={Palette} label="Warna" value={motor.color} />
            <MotorSpecItem
              icon={Calendar}
              label="Kilometer"
              value={
                motor.kilometer != null
                  ? `${motor.kilometer.toLocaleString("id-ID")} km`
                  : undefined
              }
            />
            <MotorSpecItem
              icon={Tag}
              label="Plat Nomor"
              value={motor.plateNumber}
            />
            <MotorSpecItem
              icon={FileText}
              label="Status Pajak"
              value={motor.tax}
            />
            <MotorSpecItem
              icon={Calendar}
              label="Tahun"
              value={motor.year ? String(motor.year) : undefined}
            />
          </View>
        </View>

        <View
          className="bg-white rounded-2xl px-5 py-4 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-800 font-bold text-base mb-1">
            Informasi Harga
          </Text>
          <MotorInfoRow
            label="Harga Beli"
            value={motor.buyingPrice ? formatRupiah(motor.buyingPrice) : "—"}
          />
          <MotorInfoRow
            label="Harga Jual"
            value={motor.sellingPrice ? formatRupiah(motor.sellingPrice) : "—"}
          />
          <View className="flex-row justify-between items-center pt-3">
            <Text className="text-slate-800 font-bold text-sm">
              Estimasi Margin
            </Text>
            <View className="flex-row items-center gap-2">
              {estimasiMargin !== null && (
                <Text className="text-emerald-600 font-semibold text-sm">
                  {formatRupiah(estimasiMargin)}
                </Text>
              )}
              {margin && (
                <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  <Text className="text-emerald-600 text-xs font-bold">
                    {margin}%
                  </Text>
                </View>
              )}
              {!estimasiMargin && (
                <Text className="text-slate-300 text-sm">—</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 border-t  border-slate-100 flex-row gap-3"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          elevation: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push(`/unit/${motor.id}/edit`)}
          className="flex-1 flex-row items-center justify-center gap-2 border-2 border-slate-200 py-4 rounded-2xl"
        >
          {motor.isIncomplete ? (
            <>
              <ClipboardList size={18} color="#d97706" strokeWidth={2} />
              <Text className="text-amber-700 font-bold text-base">
                Lengkapi
              </Text>
            </>
          ) : (
            <>
              <Pencil size={18} color="#475569" strokeWidth={2} />
              <Text className="text-slate-700 font-bold text-base">Edit</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMarkAsSold}
          disabled={markAsSoldMutation.isPending}
          className="flex-1 flex-row items-center justify-center gap-2 bg-otokas-secondary py-4 rounded-2xl"
        >
          {markAsSoldMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              Tandai Terjual
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
