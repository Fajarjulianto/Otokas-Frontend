import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Home,
  RefreshCw,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentStatus = "success" | "pending" | "failed";

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle,
    iconColor: "#10b981",
    iconBg: "#d1fae5",
    title: "Pembayaran Berhasil!",
    subtitle: "Langganan Otokas Anda telah aktif. Selamat mengelola showroom!",
    badgeText: "Settlement",
    badgeColor: "#10b981",
    badgeBg: "#d1fae5",
  },
  pending: {
    icon: Clock,
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
    title: "Menunggu Pembayaran",
    subtitle:
      "Pembayaran Anda sedang diproses. Selesaikan pembayaran sebelum waktu habis.",
    badgeText: "Pending",
    badgeColor: "#d97706",
    badgeBg: "#fef3c7",
  },
  failed: {
    icon: AlertCircle,
    iconColor: "#ef4444",
    iconBg: "#fee2e2",
    title: "Pembayaran Gagal",
    subtitle:
      "Transaksi tidak dapat diproses. Silakan coba lagi atau hubungi tim kami.",
    badgeText: "Failed",
    badgeColor: "#ef4444",
    badgeBg: "#fee2e2",
  },
};

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-slate-100">
      <Text className="text-slate-500 text-sm">{label}</Text>
      <Text
        className="text-sm font-semibold"
        style={{ color: valueColor ?? "#1e293b" }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function PaymentResultScreen() {
  const router = useRouter();
  const { data: subscription, isLoading, refetch } = useSubscriptionStatus();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Expo Router: /payment/result?status=success&orderId=ORD-xxx&amount=200000
  const {
    status = "pending",
    orderId = "-",
    amount = "-",
    paymentType = "-",
  } = useLocalSearchParams<{
    status: PaymentStatus;
    orderId: string;
    amount: string;
    paymentType: string;
  }>();

  useEffect(() => {
    if (subscription?.isPremium) {
      setTimedOut(false);
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    pollRef.current = setInterval(() => {
      void refetch();
    }, 4000);
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      if (pollRef.current) clearInterval(pollRef.current);
    }, 90000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refetch, subscription?.isPremium]);

  const backendStatus: PaymentStatus =
    subscription?.isPremium ? "success" : "pending";
  const effectiveStatus =
    backendStatus === "success" ? "success" : (status as PaymentStatus);
  const config =
    STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  const formattedAmount =
    amount !== "-" ? `Rp ${Number(amount).toLocaleString("id-ID")}` : "-";
  const showProcessing =
    isLoading || (!subscription?.isPremium && effectiveStatus === "pending");

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {showProcessing && (
          <View className="flex-row items-center justify-center gap-3 mb-4 bg-white rounded-2xl px-4 py-3 border border-slate-100">
            <ActivityIndicator size="small" color="#1e3a8a" />
            <Text className="text-slate-600 text-sm font-medium">
              Menunggu konfirmasi pembayaran dari backend...
            </Text>
          </View>
        )}

        <View
          className="bg-white rounded-3xl p-6 mt-8"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {/* Icon status */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: config.iconBg }}
            >
              <Icon size={40} color={config.iconColor} strokeWidth={2} />
            </View>
            <Text className="text-slate-900 text-2xl font-bold text-center">
              {config.title}
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-2 leading-5 px-4">
              {config.subtitle}
            </Text>
          </View>

          {/* Detail transaksi */}
          <View
            className="bg-slate-50 rounded-2xl px-4 mb-6"
            style={{ borderWidth: 1, borderColor: "#f1f5f9" }}
          >
            <DetailRow label="Order ID" value={orderId} />
            <DetailRow label="Nominal" value={formattedAmount} />
            <DetailRow label="Metode" value={paymentType} />
            <DetailRow
              label="Status"
              value={config.badgeText}
              valueColor={config.badgeColor}
            />
          </View>

          <View className="flex-row items-center justify-center gap-2 mb-6">
            <CreditCard size={14} color="#94a3b8" strokeWidth={2} />
            <Text className="text-slate-400 text-xs">
              Diproses oleh Xendit Payment Gateway
            </Text>
          </View>

          {effectiveStatus === "success" && (
            <>
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                className="w-full bg-otokas-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-3"
              >
                {/* <Home size={18} color="white" strokeWidth={2.5} /> */}
                <Text className="text-white font-bold text-base">
                  Kembali ke Beranda
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)/profil")}
                className="w-full bg-slate-100 py-4 rounded-2xl flex-row items-center justify-center gap-2"
              >
                {/* <Hash size={18} color="#475569" strokeWidth={2} /> */}
                <Text className="text-slate-600 font-semibold text-base">
                  Lihat Riwayat Langganan
                </Text>
              </TouchableOpacity>
            </>
          )}

          {effectiveStatus === "pending" && (
            <>
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                className="w-full bg-amber-400 py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-3"
              >
                <Home size={18} color="white" strokeWidth={2.5} />
                <Text className="text-white font-bold text-base">
                  Kembali ke Beranda
                </Text>
              </TouchableOpacity>
              <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Text className="text-amber-700 text-sm text-center leading-5">
                  ⏳ Kami akan mengaktifkan langganan Anda otomatis setelah
                  pembayaran dikonfirmasi.
                </Text>
              </View>
              {timedOut && (
                <TouchableOpacity
                  onPress={() => {
                    setTimedOut(false);
                    void refetch();
                  }}
                  className="mt-3 w-full bg-white border border-slate-200 py-4 rounded-2xl flex-row items-center justify-center gap-2"
                >
                  <RefreshCw size={18} color="#334155" strokeWidth={2.5} />
                  <Text className="text-slate-700 font-bold text-base">
                    Muat Ulang Status
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {effectiveStatus === "failed" && (
            <>
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-full bg-otokas-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-3"
              >
                <RefreshCw size={18} color="white" strokeWidth={2.5} />
                <Text className="text-white font-bold text-base">
                  Coba Lagi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                className="w-full bg-slate-100 py-4 rounded-2xl flex-row items-center justify-center gap-2"
              >
                <ArrowLeft size={18} color="#475569" strokeWidth={2} />
                <Text className="text-slate-600 font-semibold text-base">
                  Kembali ke Beranda
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info bantuan */}
        {effectiveStatus === "failed" && (
          <Text className="text-slate-400 text-xs text-center mt-5 px-4 leading-5">
            Butuh bantuan? Hubungi kami di{" "}
            <Text className="text-otokas-primary font-semibold">
              support@otokas.id
            </Text>
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
