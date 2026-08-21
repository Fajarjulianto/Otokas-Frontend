import { SectionCard } from "@/src/components/ui/SectionCard";
import { useChangePassword, useProfile, useUpdateProfile } from "@/src/hooks/useUser";
import { isStrongPassword } from "@/src/utils/validation";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Lock, MapPin, Phone, Store } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [dealerName, setDealerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setDealerName(profile?.dealerName ?? "");
    setPhoneNumber(profile?.phoneNumber ?? "");
    setAddress(profile?.address ?? "");
  }, [profile?.address, profile?.dealerName, profile?.phoneNumber]);

  const isPasswordValid = useMemo(
    () => isStrongPassword(newPassword),
    [newPassword],
  );
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === newPassword;
  const canSaveProfile = dealerName.trim().length > 0 && !updateProfileMutation.isPending;
  const canSavePassword =
    isPasswordValid &&
    passwordsMatch &&
    !changePasswordMutation.isPending;

  const handleSaveProfile = async () => {
    if (!canSaveProfile) return;

    try {
      await updateProfileMutation.mutateAsync({
        dealerName: dealerName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
      });
      Alert.alert("Berhasil", "Data showroom berhasil diperbarui.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error ? error.message : "Gagal memperbarui profil.",
      );
    }
  };

  const handleSavePassword = async () => {
    if (!canSavePassword) return;

    try {
      await changePasswordMutation.mutateAsync({
        newPassword: newPassword.trim(),
      });
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Berhasil", "Password akun berhasil diperbarui.");
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error ? error.message : "Gagal memperbarui password.",
      );
    }
  };

  if (isLoading) {
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
              Ubah nama, alamat showroom, dan password akun
            </Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          <SectionCard
            title="Data Showroom"
            subtitle="Perbarui identitas showroom yang tampil di aplikasi."
          >
            <View className="mb-4">
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
                editable={!updateProfileMutation.isPending}
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 text-base"
              />
            </View>

            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Phone size={16} color="#475569" />
                <Text className="text-slate-700 font-semibold text-base">
                  Nomor WhatsApp
                </Text>
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^\d+]/g, ""))}
                placeholder="Contoh: 081234567890"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                editable={!updateProfileMutation.isPending}
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 text-base"
              />
            </View>

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
                placeholder="Contoh: Jl. Raya No. 123"
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                editable={!updateProfileMutation.isPending}
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 text-base min-h-[110px]"
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={!canSaveProfile}
              className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
                canSaveProfile ? "bg-[#f59e0b]" : "bg-slate-200"
              }`}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-center font-bold text-base ${
                    canSaveProfile ? "text-white" : "text-slate-400"
                  }`}
                >
                  Simpan Perubahan
                </Text>
              )}
            </TouchableOpacity>
          </SectionCard>

          <SectionCard
            title="Keamanan Akun"
            subtitle="Ganti password untuk menjaga akun tetap aman."
          >
            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Lock size={16} color="#475569" />
                <Text className="text-slate-700 font-semibold text-base">
                  Ubah Password
                </Text>
              </View>
              <TextInput
                value={newPassword}
                onChangeText={(text) => setNewPassword(text)}
                placeholder="Masukkan password baru"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                editable={!changePasswordMutation.isPending}
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 text-base"
              />
              {newPassword.length > 0 && !isPasswordValid ? (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">
                  Minimal 8 karakter, ada huruf besar dan angka
                </Text>
              ) : (
                <Text className="text-slate-400 text-xs mt-1.5 ml-1">
                  Minimal 8 karakter, satu huruf besar, dan satu angka.
                </Text>
              )}
            </View>

            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2">
                <Lock size={16} color="#475569" />
                <Text className="text-slate-700 font-semibold text-base">
                  Konfirmasi Password
                </Text>
              </View>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text)}
                placeholder="Ulangi password baru"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                editable={!changePasswordMutation.isPending}
                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 text-base"
              />
              {confirmPassword.length > 0 && !passwordsMatch ? (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">
                  Password tidak sama
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleSavePassword}
              disabled={!canSavePassword}
              className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
                canSavePassword ? "bg-otokas-primary" : "bg-slate-200"
              }`}
            >
              {changePasswordMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-center font-bold text-base ${
                    canSavePassword ? "text-white" : "text-slate-400"
                  }`}
                >
                  Simpan Password
                </Text>
              )}
            </TouchableOpacity>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
