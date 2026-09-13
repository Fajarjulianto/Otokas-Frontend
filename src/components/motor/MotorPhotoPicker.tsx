import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X } from "lucide-react-native";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

type MotorPhotoPickerProps = {
  photos: ImagePicker.ImagePickerAsset[];
  onChange: (photos: ImagePicker.ImagePickerAsset[]) => void;
  disabled?: boolean;
  maxPhotos?: number;
};

export function MotorPhotoPicker({
  photos,
  onChange,
  disabled = false,
  maxPhotos = 5,
}: MotorPhotoPickerProps) {
  const pickPhotos = async () => {
    if (disabled || photos.length >= maxPhotos) return;

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Otokas membutuhkan izin galeri untuk memilih foto motor.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - photos.length,
        // Compression and WebP conversion happen immediately before upload.
        quality: 1,
      });

      if (result.canceled) return;

      const uniquePhotos = result.assets.filter(
        (asset) =>
          !photos.some(
            (photo) =>
              (asset.assetId && photo.assetId === asset.assetId) ||
              photo.uri === asset.uri,
          ),
      );
      onChange([...photos, ...uniquePhotos].slice(0, maxPhotos));
    } catch (error) {
      console.error("[MotorPhotoPicker] Gagal memilih foto:", error);
      Alert.alert("Gagal", "Foto motor tidak dapat dipilih. Coba lagi.");
    }
  };

  return (
    <View>
      {photos.length > 0 && (
        <View className="flex-row flex-wrap gap-3 mb-3">
          {photos.map((photo, index) => (
            <View
              key={`${photo.uri}-${index}`}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
            >
              <Image
                source={{ uri: photo.uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() =>
                  onChange(photos.filter((_, photoIndex) => photoIndex !== index))
                }
                disabled={disabled}
                accessibilityLabel={`Hapus foto motor ${index + 1}`}
                className="absolute top-1 right-1 bg-black/60 w-6 h-6 rounded-full items-center justify-center"
              >
                <X size={14} color="white" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {photos.length < maxPhotos && (
        <TouchableOpacity
          onPress={pickPhotos}
          disabled={disabled}
          className={`flex-row items-center justify-center gap-2 border-2 border-dashed py-4 rounded-2xl ${
            disabled
              ? "bg-slate-100 border-slate-200"
              : "bg-slate-50 border-slate-300"
          }`}
        >
          <ImagePlus size={22} color="#64748b" />
          <Text className="text-slate-600 font-semibold text-sm">
            {photos.length === 0
              ? `Upload Foto Motor (Maks ${maxPhotos})`
              : `Tambah Foto (${photos.length}/${maxPhotos})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
