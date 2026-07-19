import { requestPasswordReset } from "@/src/services/userServices";
import { EMAIL_REGEX } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import { ArrowLeft, Bike, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  async function handleSubmit() {
    if (!isEmailValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

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

          <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-2 mb-6"
            >
              <ArrowLeft size={18} color="#475569" />
              <Text className="text-slate-600 font-medium">Kembali</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-slate-900">
              Lupa Password?
            </Text>
            <Text className="text-slate-400 mt-1 mb-8">
              Masukkan email Anda dan kami akan mengirimkan link reset password.
            </Text>

            {/* Success state */}
            {isSuccess ? (
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-5 items-center">
                <Mail size={32} color="#10b981" className="mb-3" />
                <Text className="text-emerald-700 font-bold text-base text-center mb-1">
                  Email Terkirim!
                </Text>
                <Text className="text-emerald-600 text-sm text-center">
                  Cek inbox Anda di{" "}
                  <Text className="font-semibold">{email}</Text> dan ikuti
                  instruksi untuk reset password.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  className="mt-5 w-full bg-emerald-500 p-4 rounded-2xl"
                >
                  <Text className="text-white text-center font-bold">
                    Kembali ke Login
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Error */}
                {error && (
                  <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                    <Text className="text-red-600 text-sm font-medium">
                      {error}
                    </Text>
                  </View>
                )}

                {/* Email input */}
                <View className="mb-8">
                  <Text className="text-slate-700 font-semibold mb-2">
                    Email
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="dealer@email.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError(null);
                      }}
                      className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-900 ${
                        email.length > 0 && !isEmailValid
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <View className="absolute right-4 top-4">
                      <Mail size={20} color="#94a3b8" />
                    </View>
                  </View>
                  {email.length > 0 && !isEmailValid && (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
                      Format email tidak valid
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isEmailValid || isLoading}
                  className={`w-full p-4 rounded-2xl shadow-lg active:opacity-90 ${
                    isEmailValid && !isLoading ? "bg-[#f59e0b]" : "bg-slate-200"
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      className={`text-center font-bold text-lg ${
                        isEmailValid ? "text-white" : "text-slate-400"
                      }`}
                    >
                      Kirim Link Reset
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
