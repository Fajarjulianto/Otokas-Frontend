import { useRouter } from "expo-router";
import { Bike, Eye, EyeOff } from "lucide-react-native";
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

export default function LoginPage() {
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
          <View className="items-center justify-center py-16">
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
              Masuk ke Akun Anda
            </Text>
            <Text className="text-slate-400 mt-1 mb-8">
              Masukkan email dan password untuk melanjutkan
            </Text>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">Email</Text>
              <TextInput
                placeholder="dealer@email.com"
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <Text className="text-slate-700 font-semibold mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Masukkan password"
                  secureTextEntry={!showPassword}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
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

            {/* Lupa Password */}
            <TouchableOpacity className="items-end mb-8">
              <Text className="text-amber-600 font-medium">Lupa Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              className="w-full bg-[#f59e0b] p-4 rounded-2xl shadow-lg active:opacity-90"
            >
              <Text className="text-white text-center font-bold text-lg">
                Masuk
              </Text>
            </TouchableOpacity>

            {/* Register Footer */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Belum punya akun? </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/register")}
              >
                <Text className="text-blue-900 font-bold">Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
