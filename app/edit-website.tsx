import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ArrowLeft, Camera, Check, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME_COLORS = [
  "#f59e0b", // Amber/Orange (Default)
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Emerald/Green
  "#1e293b", // Dark Slate
];

export default function EditWebsiteScreen() {
  const [bgColor, setBgColor] = useState(THEME_COLORS[0]);
  const [badgeText, setBadgeText] = useState("PROMO SPESIAL");
  const [title, setTitle] = useState(
    "Motor Bekas Berkualitas Mulai dari Rp1Jt-an",
  );
  const [subtitle, setSubtitle] = useState(
    "Penawaran terbatas untuk pembeli pertama dari dealer terpercaya.",
  );
  const [showAddress, setShowAddress] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const showroomAddress = "Jl. Sudirman No. 45, Jakarta";

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setHeroImage(result.assets[0].uri);
    }
  };

  // ── FUNGSI SIMPAN ──
  const handleSave = async () => {
    Alert.alert(
      "Berhasil",
      "Tampilan website katalog Anda berhasil diperbarui!",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Edit Website</Text>
        <TouchableOpacity
          onPress={handleSave}
          className="bg-otokas-primary px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Simpan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── LIVE PREVIEW BANNER ── */}
        <View className="p-5">
          <Text className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
            Live Preview (Pratinjau)
          </Text>

          <View
            style={{ backgroundColor: bgColor }}
            className="rounded-3xl p-5 overflow-hidden shadow-lg relative min-h-[220px]"
          >
            {/* Teks Konten */}
            <View className="z-10 w-2/3">
              <View className="bg-white/20 self-start px-2 py-1 rounded-full mb-3">
                <Text className="text-white text-[9px] font-bold uppercase">
                  {badgeText || "BADGE"}
                </Text>
              </View>
              <Text className="text-white font-black text-xl leading-tight">
                {title || "Judul Banner Kosong"}
              </Text>
              <Text className="text-white/90 text-[10px] mt-2 font-medium leading-relaxed">
                {subtitle || "Subjudul kosong."}
              </Text>

              {showAddress && (
                <View className="mt-4 flex-row items-center gap-1 bg-black/15 self-start px-2 py-1.5 rounded-lg">
                  <MapPin size={10} color="white" />
                  <Text className="text-white text-[9px] font-semibold">
                    {showroomAddress}
                  </Text>
                </View>
              )}
            </View>

            {/* Gambar Motor Preview */}
            <View className="absolute -right-6 bottom-4 w-36 h-28 transform -rotate-6">
              {heroImage ? (
                <Image
                  source={{ uri: heroImage }}
                  className="w-full h-full object-cover rounded-xl border-2 border-white/20"
                />
              ) : (
                <View className="w-full h-full bg-black/20 rounded-xl items-center justify-center border-2 border-white/20 border-dashed">
                  <Camera size={20} color="white" opacity={0.5} />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── FORM KUSTOMISASI ── */}
        <View className="bg-white px-5 py-6 border-t border-slate-100 mt-2">
          {/* Pilihan Warna */}
          <Text className="font-bold text-slate-800 mb-3">Warna Tema</Text>
          <View className="flex-row gap-3 mb-6">
            {THEME_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setBgColor(color)}
                style={{ backgroundColor: color }}
                className="w-12 h-12 rounded-full items-center justify-center border-2 border-slate-100"
              >
                {bgColor === color && <Check size={20} color="white" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Ganti Foto Motor */}
          <Text className="font-bold text-slate-800 mb-3">
            Foto Motor Andalan
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="flex-row items-center justify-center gap-2 bg-slate-50 border-2 border-slate-200 border-dashed py-4 rounded-2xl mb-6"
          >
            <Camera size={20} color="#64748b" />
            <Text className="text-slate-600 font-semibold">
              {heroImage ? "Ganti Foto Utama" : "Unggah Foto Motor"}
            </Text>
          </TouchableOpacity>

          {/* Input Teks */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5">
                Teks Badge (Label)
              </Text>
              <TextInput
                value={badgeText}
                onChangeText={setBadgeText}
                placeholder="Misal: PROMO SPESIAL"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium"
              />
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5 mt-4">
                Judul Banner
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                multiline
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium"
              />
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5 mt-4">
                Deskripsi / Subjudul
              </Text>
              <TextInput
                value={subtitle}
                onChangeText={setSubtitle}
                multiline
                numberOfLines={3}
                style={{ textAlignVertical: "top" }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium h-24"
              />
            </View>

            {/* Toggle Alamat */}
            <View className="flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
              <View>
                <Text className="font-bold text-slate-800">
                  Tampilkan Alamat
                </Text>
                <Text
                  className="text-xs text-slate-500 mt-0.5 max-w-[200px]"
                  numberOfLines={1}
                >
                  {showroomAddress}
                </Text>
              </View>
              <Switch
                value={showAddress}
                onValueChange={setShowAddress}
                trackColor={{ false: "#cbd5e1", true: "#f59e0b" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
