import { useProfile, useUpdateProfile } from "@/src/hooks/useUser";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Phone, Store } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const [dealerName, setDealerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  // Isi form otomatis dengan data profil saat ini
  useEffect(() => {
    if (profile) {
      setDealerName(profile.dealerName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const isValid = dealerName.trim() !== "";

  const handleSave = () => {
    if (!isValid) return;

    updateMutation.mutate(
      {
        dealerName: dealerName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert("Berhasil", "Profil showroom Anda berhasil diperbarui.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert("Gagal", error.message || "Gagal memperbarui profil.");
        },
      },
    );
  };

  if (profileLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View className="bg-otokas-primary px-5 pt-2 pb-5 flex-row items-center gap-3 shadow-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Edit Profil</Text>
            <Text className="text-blue-200 text-sm mt-0.5">
              Sesuaikan data showroom Anda
            </Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          {/* NAMA SHOWROOM */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Store size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Nama Showroom <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <TextInput
              value={dealerName}
              onChangeText={setDealerName}
              placeholder="Contoh: Maju Motor"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              editable={!updateMutation.isPending}
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
            />
          </View>

          {/* NOMOR TELEPON */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Phone size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Nomor Telepon (WhatsApp)
              </Text>
            </View>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Contoh: 081234567890"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              editable={!updateMutation.isPending}
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
            />
          </View>

          {/* ALAMAT */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <MapPin size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Alamat Showroom
              </Text>
            </View>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Tulis alamat lengkap..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!updateMutation.isPending}
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base min-h-[100px]"
            />
          </View>
        </ScrollView>

        {/* BOTTOM BUTTON */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-slate-100"
          style={{ elevation: 12 }}
        >
          {!isValid && (
            <Text className="text-slate-400 text-sm text-center mb-3">
              Nama Showroom wajib diisi
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid || updateMutation.isPending}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              isValid && !updateMutation.isPending
                ? "bg-[#f59e0b]"
                : "bg-slate-200"
            }`}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-center font-bold text-lg ${
                  isValid ? "text-white" : "text-slate-400"
                }`}
              >
                Simpan Perubahan
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
