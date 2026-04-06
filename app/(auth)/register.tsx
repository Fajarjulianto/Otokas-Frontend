import { useRouter } from "expo-router";
import { Bike, Eye, EyeOff, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-otokas-primary" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center justify-center py-10">
            <View className="bg-white/10 p-4 rounded-3xl mb-4">
              <Bike color="white" size={48} strokeWidth={2} />
            </View>
            <Text className="text-white text-4xl font-bold tracking-tight">
              OTOKAS
            </Text>
            <Text className="text-blue-200 mt-1">Kelola Motor Bekas Anda</Text>
          </View>

          {/* Form Section */}
          <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
            <Text className="text-2xl font-bold text-slate-900">
              Buat Akun Baru
            </Text>
            <Text className="text-slate-400 mt-1 mb-8">
              Daftar sekarang dan mulai kelola stok motor Anda
            </Text>

            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">
                Nama Lengkap
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Nama pemilik showroom"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  autoCapitalize="words"
                />
                <View className="absolute right-4 top-4">
                  <User size={20} color="#94a3b8" />
                </View>
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">Email</Text>
              <View className="relative">
                <TextInput
                  placeholder="dealer@email.com"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChange={() => {}}
                />
                <View className="absolute right-4 top-4">
                  <Mail size={20} color="#94a3b8" />
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Minimal 8 karakter"
                  secureTextEntry={!showPassword}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  onChange={() => {}}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              className="w-full bg-[#f59e0b] p-4 rounded-2xl shadow-lg active:opacity-90"
            >
              <Text className="text-white text-center font-bold text-lg">
                Daftar Sekarang
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-slate-400 text-xs text-center mt-4 px-4">
              Dengan mendaftar, Anda menyetujui{" "}
              <Text className="text-amber-600 font-medium">
                Syarat & Ketentuan
              </Text>{" "}
              serta{" "}
              <Text className="text-amber-600 font-medium">
                Kebijakan Privasi
              </Text>
              {""}
              Otokas.
            </Text>

            {/* Login Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-blue-900 font-bold">Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
