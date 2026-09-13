import { PhotoItem } from "@/src/types/scan";
import {
  ArrowLeft,
  CheckCircle,
  ScanLine,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";


export default function ReviewScreen({
  photos,
  onBack,
  onRemove,
  onClearAll,
  onSelectAndProcess,
  isProcessing,
  processingLabel,
  errorMsg,
  maxPhotos = 10,
}: {
  photos: PhotoItem[];
  onBack: () => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onSelectAndProcess: (indices: number[]) => void;
  isProcessing: boolean;
  processingLabel: string;
  errorMsg: string | null;
  maxPhotos?: number;
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const THUMB_SIZE = (screenWidth - 40 - 6 * 2) / 3;
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIndices.size === photos.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(photos.map((_, i) => i)));
    }
  };

  const removePhoto = (index: number) => {
    setSelectedIndices((previousIndices) => {
      const shiftedIndices = Array.from(previousIndices)
        .filter((selectedIndex) => selectedIndex !== index)
        .map((selectedIndex) =>
          selectedIndex > index ? selectedIndex - 1 : selectedIndex,
        );

      return new Set(shiftedIndices);
    });
    onRemove(index);
  };

  const isAllSelected =
    selectedIndices.size === photos.length && photos.length > 0;
  const hasSelection = selectedIndices.size > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Header */}
      <View className="bg-otokas-primary px-5 pt-2 pb-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-xl font-bold">
            {photos.length} Foto Diambil
          </Text>
          <Text className="text-blue-200 text-sm mt-0.5">
            {hasSelection
              ? `${selectedIndices.size} foto dipilih`
              : `Pilih foto untuk diproses (maks ${maxPhotos})`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClearAll}
          className="bg-white/10 px-3 py-2 rounded-xl flex-row items-center gap-1.5"
        >
          <Trash2 size={14} color="white" />
          <Text className="text-white text-sm font-medium">Hapus Semua</Text>
        </TouchableOpacity>
      </View>

      {/* Select All */}
      <TouchableOpacity
        onPress={selectAll}
        className="flex-row items-center gap-2 px-5 py-3 bg-white border-b border-slate-100"
      >
        <View
          className={`w-5 h-5 rounded border-2 items-center justify-center ${isAllSelected ? "bg-amber-400 border-amber-400" : "border-slate-300"}`}
        >
          {isAllSelected && <CheckCircle size={14} color="white" />}
        </View>
        <Text className="text-slate-700 font-semibold text-sm">
          Pilih Semua
        </Text>
      </TouchableOpacity>

      {/* Grid */}
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        columnWrapperStyle={{ gap: 6 }}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        renderItem={({ item, index }) => {
          const isSelected = selectedIndices.has(index);
          return (
            <TouchableOpacity
              onPress={() => toggleSelect(index)}
              style={{ width: THUMB_SIZE, height: THUMB_SIZE * 1.3 }}
              className={`rounded-xl overflow-hidden border-2 ${isSelected ? "border-amber-400" : "border-transparent"}`}
            >
              <Image
                source={{ uri: item.uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removePhoto(index)}
                className="absolute top-1.5 right-1.5 bg-black/60 rounded-full w-6 h-6 items-center justify-center"
              >
                <X size={14} color="white" />
              </TouchableOpacity>
              {isSelected && (
                <View className="absolute bottom-1.5 right-1.5 bg-amber-400 rounded-full w-6 h-6 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {Array.from(selectedIndices)
                      .sort((a, b) => a - b)
                      .indexOf(index) + 1}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Overlays */}
      {isProcessing && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-white text-base font-semibold mt-4">
            {processingLabel}
          </Text>
        </View>
      )}
      {errorMsg && (
        <View className="absolute top-28 left-5 right-5 bg-red-500 rounded-2xl px-4 py-3 z-40">
          <Text className="text-white text-sm font-medium">{errorMsg}</Text>
        </View>
      )}

      {/* Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-slate-100"
        style={{
          elevation: 12,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        {!hasSelection && (
          <Text className="text-slate-400 text-sm text-center mb-3">
            Ketuk foto untuk memilih
          </Text>
        )}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onBack}
            className="flex-1 border-2 border-slate-200 py-4 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Text className="text-slate-700 font-bold text-base">
              Ambil Lagi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (hasSelection)
                onSelectAndProcess(
                  Array.from(selectedIndices).sort((a, b) => a - b),
                );
            }}
            disabled={!hasSelection}
            className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${hasSelection ? "bg-otokas-primary" : "bg-slate-200"}`}
          >
            <ScanLine size={18} color={hasSelection ? "white" : "#94a3b8"} />
            <Text
              className={`font-bold text-base ${hasSelection ? "text-white" : "text-slate-400"}`}
            >
              Proses{hasSelection ? ` (${selectedIndices.size})` : " STNK"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
