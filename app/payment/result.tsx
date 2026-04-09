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
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  // Expo Router: /payment/result?status=success&orderId=ORD-xxx&amount=200000
  const {
    status = "success",
    orderId = "-",
    amount = "-",
    paymentType = "-",
  } = useLocalSearchParams<{
    status: PaymentStatus;
    orderId: string;
    amount: string;
    paymentType: string;
  }>();

  const config = STATUS_CONFIG[status as PaymentStatus] ?? STATUS_CONFIG.failed;
  const Icon = config.icon;
  const formattedAmount =
    amount !== "-" ? `Rp ${Number(amount).toLocaleString("id-ID")}` : "-";

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
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
              Diproses oleh Midtrans Payment Gateway
            </Text>
          </View>

          {status === "success" && (
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

          {status === "pending" && (
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
            </>
          )}

          {status === "failed" && (
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
        {status === "failed" && (
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
