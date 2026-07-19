import { useAuthContext } from "@/src/context/authContext";
import { useLogin } from "@/src/hooks/useAuth";
import { api } from "@/src/lib/api";
import { saveRefreshToken } from "@/src/lib/secureToken";
import { fetchMe } from "@/src/services/authServices";
import { EMAIL_REGEX } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isValid = isEmailValid && password.trim() !== "";
  const { signIn } = useAuthContext();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

  async function handleLogin() {
    if (!isValid) return;

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: async (data) => {
          try {
            const accessToken = data.access_token;
            if (data.refresh_token) {
              await saveRefreshToken(data.refresh_token);
            }
            api.defaults.headers.common["Authorization"] =
              `Bearer ${accessToken}`;
            const userProfile = await fetchMe();
            const authPayload = {
              id: userProfile.id,
              email: userProfile.email,
              dealerName: userProfile.dealerName,
              fullName: userProfile.fullName,
              isPremium: userProfile.isPremium,
              token: accessToken,
            };

            await signIn(authPayload);
            router.replace("/(tabs)");
          } catch {
            alert("Gagal mengambil data profil dari server.");
          }
        },
      },
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-otokas-primary" edges={["top"]}>
      <View className="absolute top-16 left-0 right-0 items-center justify-center z-0 pointer-events-none">
        <View className="bg-white p-4 rounded-3xl mb-4">
          <Image
            source={require("../../assets/images/splash-icon.png")}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
          {/* <Bike color="white" size={48} strokeWidth={2} /> */}
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
          <View style={{ height: isKeyboardVisible ? 40 : 280 }} />

          <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
            <Text className="text-2xl font-bold text-slate-900">
              Masuk ke Akun Anda
            </Text>
            <Text className="text-slate-400 mt-1 mb-8">
              Masukkan email dan password untuk melanjutkan
            </Text>

            {loginMutation.isError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <Text className="text-red-600 text-sm font-medium">
                  {loginMutation.error?.message ??
                    "Terjadi kesalahan. Silakan coba lagi."}
                </Text>
              </View>
            )}

            <View className="mb-5">
              <Text className="text-slate-700 font-semibold mb-2">Email</Text>
              <TextInput
                placeholder="dealer@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (loginMutation.isError) loginMutation.reset();
                }}
                className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-900 ${
                  email.length > 0 && !isEmailValid
                    ? "border-red-300"
                    : "border-slate-200"
                }`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loginMutation.isPending}
              />
              {email.length > 0 && !isEmailValid && (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">
                  Format email tidak valid
                </Text>
              )}
            </View>

            <View className="mb-2">
              <Text className="text-slate-700 font-semibold mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  placeholder="Masukkan password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (loginMutation.isError) loginMutation.reset();
                  }}
                  secureTextEntry={!showPassword}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  editable={!loginMutation.isPending}
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

            <TouchableOpacity
              className="items-end mb-8"
              onPress={() => router.push("/forgot-password")}
            >
              <Text className="text-amber-600 font-medium">Lupa Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={!isValid || loginMutation.isPending}
              className={`w-full p-4 rounded-2xl shadow-lg active:opacity-90 ${
                isValid && !loginMutation.isPending
                  ? "bg-[#f59e0b]"
                  : "bg-slate-200"
              }`}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-center font-bold text-lg ${
                    isValid ? "text-white" : "text-slate-400"
                  }`}
                >
                  Masuk
                </Text>
              )}
            </TouchableOpacity>

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
