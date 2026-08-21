import { verifyEmail } from "@/src/services/userServices";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle2, MailWarning, RefreshCcw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email, token } = useLocalSearchParams<{
    email?: string;
    token?: string;
  }>();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Memverifikasi email Anda...");

  useEffect(() => {
    let active = true;
    async function run() {
      if (!email || !token) {
        setState("error");
        setMessage("Link verifikasi tidak lengkap.");
        return;
      }
      try {
        await verifyEmail(String(email), String(token));
        if (!active) return;
        setState("success");
        setMessage("Email berhasil diverifikasi.");
      } catch (err: any) {
        if (!active) return;
        setState("error");
        setMessage(err?.message ?? "Verifikasi gagal.");
      }
    }
    void run();
    return () => {
      active = false;
    };
  }, [email, token]);

  return (
    <SafeAreaView className="flex-1 bg-slate-950 items-center justify-center px-6">
      <View className="w-full max-w-md bg-white rounded-3xl p-6">
        <View className="items-center mb-4">
          {state === "loading" ? (
            <ActivityIndicator size="large" color="#f59e0b" />
          ) : state === "success" ? (
            <CheckCircle2 size={48} color="#10b981" />
          ) : (
            <MailWarning size={48} color="#ef4444" />
          )}
        </View>
        <Text className="text-center text-xl font-bold text-slate-900">
          Verifikasi Email
        </Text>
        <Text className="text-center text-slate-500 mt-2">{message}</Text>
        {state === "success" && (
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            className="mt-6 w-full bg-otokas-primary rounded-2xl py-4"
          >
            <Text className="text-center text-white font-bold">
              Lanjut ke Login
            </Text>
          </TouchableOpacity>
        )}
        {state === "error" && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 w-full bg-slate-100 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <RefreshCcw size={16} color="#334155" />
            <Text className="text-center text-slate-700 font-bold">
              Kembali
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
