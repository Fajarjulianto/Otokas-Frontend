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
import { useAuthContext } from "@/src/context/authContext";
import { useLogin } from "@/src/hooks/useAuth";
import { api } from "@/src/lib/api";
import { saveRefreshToken } from "@/src/lib/secureToken";
import { fetchProfile } from "@/src/services/userServices";
import { EMAIL_REGEX } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isValid = isEmailValid && password.trim() !== "";
  const { signIn } = useAuthContext();

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
            const userProfile = await fetchProfile();
            const authPayload = {
              id: userProfile.id,
              email: userProfile.email,
              dealerName: userProfile.dealerName,
              isPremium: userProfile.isPremium,
              subdomain: userProfile.subdomain,
              fullDomain: userProfile.fullDomain,
              token: accessToken,
            };

            await signIn(authPayload);
            router.replace("/(tabs)");
          } catch {
            Alert.alert("Gagal", "Gagal mengambil data profil dari server.");
          }
        },
      },
    );
  }

  return (
    <AuthScreen>
      <AuthFormHeader
        title="Masuk ke Akun Anda"
        description="Masukkan email dan password untuk melanjutkan"
      />
      <AuthError
        message={
          loginMutation.isError
            ? (loginMutation.error?.message ??
              "Terjadi kesalahan. Silakan coba lagi.")
            : null
        }
      />
      <AuthField
        label="Email"
        placeholder="dealer@email.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (loginMutation.isError) loginMutation.reset();
        }}
        error={
          email.length > 0 && !isEmailValid
            ? "Format email tidak valid"
            : undefined
        }
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loginMutation.isPending}
      />
      <PasswordField
        label="Password"
        placeholder="Masukkan password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (loginMutation.isError) loginMutation.reset();
        }}
        visible={showPassword}
        onToggleVisibility={() => setShowPassword((current) => !current)}
        editable={!loginMutation.isPending}
        containerClassName="mb-2"
      />

            <TouchableOpacity
              className="items-end mb-8"
              onPress={() => router.push("/forgot-password")}
            >
              <Text className="text-amber-600 font-medium">Lupa Password?</Text>
            </TouchableOpacity>

      <AuthSubmitButton
        label="Masuk"
        onPress={handleLogin}
        disabled={!isValid}
        loading={loginMutation.isPending}
      />

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Belum punya akun? </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/register")}
              >
                <Text className="text-blue-900 font-bold">Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
    </AuthScreen>
  );
}
