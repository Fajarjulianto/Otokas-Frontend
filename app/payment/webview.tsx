import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ExternalLink } from "lucide-react-native";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

type PaymentWebViewParams = {
  invoiceUrl?: string;
  orderId?: string;
  amount?: string;
  paymentType?: string;
};

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<PaymentWebViewParams>();

  const invoiceUrl = useMemo(() => {
    return typeof params.invoiceUrl === "string" ? params.invoiceUrl : "";
  }, [params.invoiceUrl]);

  const orderId = typeof params.orderId === "string" ? params.orderId : "-";
  const amount = typeof params.amount === "string" ? params.amount : "-";
  const paymentType =
    typeof params.paymentType === "string" ? params.paymentType : "-";

  const formattedAmount =
    amount !== "-" ? `Rp ${Number(amount).toLocaleString("id-ID")}` : "-";

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom"]}>
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/payment/result",
              params: {
                status: "pending",
                orderId,
                amount,
                paymentType,
              },
            })
          }
          className="w-10 h-10 bg-slate-100 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="#475569" strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-slate-800 text-lg font-bold">
            Pembayaran Xendit
          </Text>
          <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
            {paymentType} · {formattedAmount}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/payment/result",
              params: {
                status: "pending",
                orderId,
                amount,
                paymentType,
              },
            })
          }
          className="w-10 h-10 bg-slate-100 rounded-xl items-center justify-center"
        >
          <ExternalLink size={18} color="#475569" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View className="bg-amber-50 border-b border-amber-100 px-5 py-3">
        <Text className="text-amber-700 text-xs leading-5">
          Selesaikan pembayaran di halaman Xendit ini. Setelah selesai, tutup
          layar ini untuk melihat status terbaru.
        </Text>
      </View>

      {invoiceUrl ? (
        <WebView
          source={{ uri: invoiceUrl }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          onError={() =>
            router.replace({
              pathname: "/payment/result",
              params: {
                status: "failed",
                orderId,
                amount,
                paymentType,
              },
            })
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-700 font-semibold text-base text-center">
            URL pembayaran tidak tersedia.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-otokas-primary px-5 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Kembali</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
