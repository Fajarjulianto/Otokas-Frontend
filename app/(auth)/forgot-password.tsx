import {
  AuthError,
  AuthField,
  AuthSubmitButton,
} from "@/src/components/auth/AuthForm";
import { requestPasswordReset, resetPassword } from "@/src/services/userServices";
import { EMAIL_REGEX, isStrongPassword } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import { ArrowLeft, Bike, ShieldCheck } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPasswordValid = useMemo(
    () => isStrongPassword(newPassword),
    [newPassword],
  );
  const canReset =
    otp.trim().length >= 4 &&
    isPasswordValid &&
    confirmPassword === newPassword &&
    !isLoading;

  async function handleRequestOtp() {
    if (!isEmailValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setStep("reset");
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!canReset) return;
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccess(true);
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
            <TouchableOpacity
              onPress={() =>
                step === "reset" && !success ? setStep("request") : router.back()
              }
              className="flex-row items-center gap-2 mb-6"
            >
              <ArrowLeft size={18} color="#475569" />
              <Text className="text-slate-600 font-medium">Kembali</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-slate-900">
              {success ? "Password Berhasil Diubah" : "Lupa Password?"}
            </Text>
            <Text className="text-slate-400 mt-1 mb-8">
              {success
                ? "Silakan login kembali menggunakan password baru Anda."
                : step === "request"
                  ? "Masukkan email Anda untuk menerima OTP reset password."
                  : "Masukkan OTP, password baru, dan konfirmasi password Anda."}
            </Text>

            {success ? (
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-5 items-center">
                <ShieldCheck size={32} color="#10b981" className="mb-3" />
                <Text className="text-emerald-700 font-bold text-base text-center mb-1">
                  Reset Berhasil
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
                <AuthError message={error} />

                {step === "request" ? (
                  <>
                    <AuthField
                      label="Email"
                      placeholder="dealer@email.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError(null);
                      }}
                      error={
                        email.length > 0 && !isEmailValid
                          ? "Format email tidak valid"
                          : undefined
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      containerClassName="mb-8"
                    />
                    <AuthSubmitButton
                      label="Kirim OTP"
                      onPress={handleRequestOtp}
                      disabled={!isEmailValid}
                      loading={isLoading}
                    />
                  </>
                ) : (
                  <>
                    <AuthField
                      label="OTP"
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Masukkan OTP"
                      keyboardType="number-pad"
                      editable={!isLoading}
                    />
                    <AuthField
                      label="Password Baru"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Password baru"
                      secureTextEntry
                      editable={!isLoading}
                      error={
                        newPassword.length > 0 && !isPasswordValid
                          ? "Minimal 8 karakter, ada huruf besar dan angka"
                          : undefined
                      }
                    />
                    <AuthField
                      label="Konfirmasi Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Ulangi password baru"
                      secureTextEntry
                      editable={!isLoading}
                      error={
                        confirmPassword.length > 0 &&
                        confirmPassword !== newPassword
                          ? "Password tidak sama"
                          : undefined
                      }
                      containerClassName="mb-8"
                    />
                    <AuthSubmitButton
                      label="Reset Password"
                      onPress={handleResetPassword}
                      disabled={!canReset}
                      loading={isLoading}
                    />
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
