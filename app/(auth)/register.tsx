import { useRegister } from "@/src/hooks/useAuth";
import { EMAIL_REGEX } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import { Bike, Check, Eye, EyeOff, Mail, User, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Password strength rules ──
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

  // ── STATE UNTUK DETEKSI KEYBOARD ──
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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

  // ── EFFECT UNTUK ANIMASI KEYBOARD ──
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardShowListener = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });

    return () => {
      keyboardHideListener.remove();
      keyboardShowListener.remove();
    };
  }, []);

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
          console.error("Register Gagal:", error);
        },
      },
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-otokas-primary" edges={["top"]}>
      {/* ── HEADER DI BELAKANG (ABSOLUTE) ── */}
      <View className="absolute top-12 left-0 right-0 items-center justify-center z-0 pointer-events-none">
        <View className="bg-white/10 p-4 rounded-3xl mb-4">
          <Bike color="white" size={48} strokeWidth={2} />
        </View>
        <Text className="text-white text-4xl font-bold tracking-tight">
          OTOKAS
        </Text>
        <Text className="text-blue-200 mt-1">Kelola Motor Bekas Anda</Text>
      </View>

      {/* ── KONTEN DEPAN ── */}
      <KeyboardAvoidingView
        className="flex-1 z-10"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={{ height: isKeyboardVisible ? 40 : 220 }} />

          {/* Form Section */}
          <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
            <Text className="text-2xl font-bold text-slate-900">
              Buat Akun Baru
            </Text>
            <Text className="text-slate-400 mt-1 mb-8">
              Daftar sekarang dan mulai kelola stok motor Anda
            </Text>

            {registerMutation.isError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <Text className="text-red-600 text-sm font-medium">
                  {registerMutation.error?.message ??
                    "Registrasi gagal. Silakan coba lagi."}
                </Text>
              </View>
            )}

            {/* Nama Dealer */}
            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">
                Nama Dealer / Showroom
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Nama showroom Anda"
                  value={dealerName}
                  onChangeText={(text) => {
                    setDealerName(text);
                    if (registerMutation.isError) registerMutation.reset();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  autoCapitalize="words"
                  editable={!registerMutation.isPending}
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
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (registerMutation.isError) registerMutation.reset();
                  }}
                  className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-900 ${
                    email.length > 0 && !isEmailValid
                      ? "border-red-300"
                      : "border-slate-200"
                  }`}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!registerMutation.isPending}
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

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  editable={!registerMutation.isPending}
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

            {/* Password Strength Checker */}
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

            {/* Confirm Password */}
            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">
                Konfirmasi Password
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-900 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-400"
                        : "border-red-300"
                      : "border-slate-200"
                  }`}
                  editable={!registerMutation.isPending}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">
                  Password tidak cocok
                </Text>
              )}
              {passwordsMatch && (
                <Text className="text-emerald-600 text-xs mt-1.5 ml-1 font-medium">
                  ✓ Password cocok
                </Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={!isValid || registerMutation.isPending}
              className={`w-full p-4 rounded-2xl shadow-lg active:opacity-90 ${
                isValid && !registerMutation.isPending
                  ? "bg-[#f59e0b]"
                  : "bg-slate-200"
              }`}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-center font-bold text-lg ${
                    isValid ? "text-white" : "text-slate-400"
                  }`}
                >
                  Daftar Sekarang
                </Text>
              )}
            </TouchableOpacity>

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
