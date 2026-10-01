import {
  AuthError,
  AuthField,
  AuthSubmitButton,
  PasswordField,
} from "@/src/components/auth/AuthForm";
import { AuthFormHeader, AuthScreen } from "@/src/components/auth/AuthScreen";
import { useAuthContext } from "@/src/context/authContext";
import { useLogin } from "@/src/hooks/useAuth";
import { logLoginStage } from "@/src/lib/networkDiagnostics";
import { saveRefreshToken } from "@/src/lib/secureToken";
import { fetchProfile } from "@/src/services/userServices";
import { EMAIL_REGEX } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

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
          let stage = "refresh-token:save";
          try {
            logLoginStage(stage);
            const accessToken = data.access_token;
            if (data.refresh_token) {
              await saveRefreshToken(data.refresh_token);
            }
            stage = "profile:fetch";
            logLoginStage(stage);
            const userProfile = await fetchProfile({ accessToken });
            const authPayload = {
              id: userProfile.id,
              email: userProfile.email,
              dealerName: userProfile.dealerName,
              phoneNumber: userProfile.phoneNumber ?? "",
              address: userProfile.address ?? "",
              isPremium: userProfile.isPremium,
              subdomain: userProfile.subdomain,
              fullDomain: userProfile.fullDomain,
              token: accessToken,
            };

            stage = "sign-in:save-session";
            logLoginStage(stage);
            await signIn(authPayload);
            stage = "navigation:replace";
            logLoginStage(stage);
            router.replace("/(tabs)");
            logLoginStage("complete");
          } catch {
            logLoginStage(`${stage}:failed-after-login-success`);
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
        placeholderTextColor="#000000"
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
        placeholderTextColor="#000000"
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
        <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
          <Text className="text-blue-900 font-bold">Daftar Sekarang</Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}
