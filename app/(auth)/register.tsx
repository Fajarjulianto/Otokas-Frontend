import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  PasswordField,
} from "@/src/components/auth/AuthForm";
import {
  AuthFormHeader,
  AuthScreen,
} from "@/src/components/auth/AuthScreen";
import { useRegister } from "@/src/hooks/useAuth";
import { ApiError } from "@/src/lib/api";
import { EMAIL_REGEX } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import { Check, Mail, User, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PASSWORD_RULES = [
  { label: "Minimal 8 karakter", test: (p: string) => p.length >= 8 },
  { label: "Huruf besar (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Huruf kecil (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Angka (0-9)", test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [dealerName, setDealerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useRegister();
  const passedRules = PASSWORD_RULES.filter((r) => r.test(password));
  const allRulesPassed = passedRules.length === PASSWORD_RULES.length;
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const isValid =
    dealerName.trim() !== "" &&
    isEmailValid &&
    allRulesPassed &&
    passwordsMatch;

  async function handleRegister() {
    if (!isValid) return;
    registerMutation.mutate(
      {
        email: email.trim(),
        password,
        dealerName: dealerName.trim(),
      },
      {
        onSuccess: () => {
          alert(
            "Akun berhasil dibuat! Silakan masuk dengan email dan password Anda.",
          );
          router.replace("/(auth)/login");
        },
        onError: (error) => {
          console.error(
            "Register Gagal:",
            error instanceof ApiError
              ? {
                  message: error.message,
                  status: error.status,
                  details: error.details,
                }
              : error,
          );
        },
      },
    );
  }

  return (
    <AuthScreen contentOffset={220} headerTop={48}>
      <AuthFormHeader
        title="Buat Akun Baru"
        description="Daftar sekarang dan mulai kelola stok motor Anda"
      />
      <AuthError
        message={
          registerMutation.isError
            ? (registerMutation.error?.message ??
              "Registrasi gagal. Silakan coba lagi.")
            : null
        }
      />
      <AuthField
        label="Nama Dealer / Showroom"
        placeholder="Nama showroom Anda"
        placeholderTextColor="#000000"
        value={dealerName}
        onChangeText={(text) => {
          setDealerName(text);
          if (registerMutation.isError) registerMutation.reset();
        }}
        autoCapitalize="words"
        editable={!registerMutation.isPending}
        trailing={<User size={20} color="#94a3b8" />}
      />
      <AuthField
        label="Email"
        placeholder="dealer@email.com"
        placeholderTextColor="#000000"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (registerMutation.isError) registerMutation.reset();
        }}
        error={
          email.length > 0 && !isEmailValid
            ? "Format email tidak valid"
            : undefined
        }
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!registerMutation.isPending}
        trailing={<Mail size={20} color="#94a3b8" />}
      />
      <PasswordField
        label="Password"
        placeholder="Minimal 8 karakter"
        placeholderTextColor="#000000"
        value={password}
        onChangeText={setPassword}
        visible={showPassword}
        onToggleVisibility={() => setShowPassword((current) => !current)}
        editable={!registerMutation.isPending}
      />

      {password.length > 0 && (
        <View className="mb-5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Text className="text-slate-600 text-xs font-semibold mb-2">
                  Kekuatan Password
                </Text>
                <View className="flex-row gap-1.5 mb-3">
                  {PASSWORD_RULES.map((_, i) => (
                    <View
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        i < passedRules.length
                          ? passedRules.length <= 1
                            ? "bg-red-400"
                            : passedRules.length <= 2
                              ? "bg-amber-400"
                              : passedRules.length <= 3
                                ? "bg-blue-400"
                                : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </View>
                {PASSWORD_RULES.map((rule, i) => {
                  const passed = rule.test(password);
                  return (
                    <View key={i} className="flex-row items-center gap-2 mb-1">
                      {passed ? (
                        <Check size={14} color="#10b981" strokeWidth={3} />
                      ) : (
                        <X size={14} color="#cbd5e1" strokeWidth={2.5} />
                      )}
                      <Text
                        className={`text-xs ${
                          passed
                            ? "text-emerald-600 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
        </View>
      )}

      <PasswordField
        label="Konfirmasi Password"
        placeholder="Ulangi password"
        placeholderTextColor="#000000"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        visible={showConfirmPassword}
        onToggleVisibility={() =>
          setShowConfirmPassword((current) => !current)
        }
        error={
          confirmPassword.length > 0 && !passwordsMatch
            ? "Password tidak cocok"
            : undefined
        }
        success={passwordsMatch ? "✓ Password cocok" : undefined}
        editable={!registerMutation.isPending}
      />

      <AuthSubmitButton
        label="Daftar Sekarang"
        onPress={handleRegister}
        disabled={!isValid}
        loading={registerMutation.isPending}
      />

            <Text className="text-slate-400 text-xs text-center mt-4 px-4">
              Dengan mendaftar, Anda menyetujui{" "}
              <Text
                className="text-amber-600 font-medium"
                onPress={() =>
                  Linking.openURL("https://otokas.id/syarat-ketentuan")
                }
              >
                Syarat & Ketentuan
              </Text>{" "}
              serta{" "}
              <Text
                className="text-amber-600 font-medium"
                onPress={() =>
                  Linking.openURL("https://otokas.id/kebijakan-privasi")
                }
              >
                Kebijakan Privasi
              </Text>
              Otokas.
            </Text>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-blue-900 font-bold">Masuk</Text>
              </TouchableOpacity>
            </View>
    </AuthScreen>
  );
}
