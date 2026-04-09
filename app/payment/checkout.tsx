import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Dummy Order ───
const DUMMY_ORDER = {
  orderId: "OTOKAS-20260408",
  amount: 200000,
  paket: "Paket Juragan",
  periode: "1 Bulan",
};

// ─── Metode Pembayaran ───
type PaymentMethod = {
  id: string;
  category: string;
  name: string;
  image: ImageSourcePropType;
  desc: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "gopay",
    category: "E-Wallet",
    name: "GoPay",
    image: require("@/assets/images/gopay.png"),
    desc: "Bayar dengan saldo GoPay",
  },
  {
    id: "ovo",
    category: "E-Wallet",
    name: "OVO",
    image: require("@/assets/images/ovo.png"),
    desc: "Bayar dengan saldo OVO",
  },
  {
    id: "dana",
    category: "E-Wallet",
    name: "DANA",
    image: require("@/assets/images/dana.png"),
    desc: "Bayar dengan saldo DANA",
  },
  {
    id: "bca_va",
    category: "Transfer Bank",
    name: "BCA Virtual Account",
    image: require("@/assets/images/bca.png"),
    desc: "Transfer ke nomor VA BCA",
  },
  {
    id: "bni_va",
    category: "Transfer Bank",
    name: "BNI Virtual Account",
    image: require("@/assets/images/bni.png"),
    desc: "Transfer ke nomor VA BNI",
  },
  {
    id: "mandiri_va",
    category: "Transfer Bank",
    name: "Mandiri Virtual Account",
    image: require("@/assets/images/mandiri.png"),
    desc: "Transfer ke nomor VA Mandiri",
  },
  {
    id: "qris",
    category: "QRIS",
    name: "QRIS",
    image: require("@/assets/images/qris.png"),
    desc: "Scan QR dari aplikasi apapun",
  },
];

const CATEGORIES = [...new Set(PAYMENT_METHODS.map((m) => m.category))];

export default function CheckoutScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selected);
  const formattedAmount = `Rp ${DUMMY_ORDER.amount.toLocaleString("id-ID")}`;

  function handleBayar() {
    if (!selected) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      router.replace({
        pathname: "/payment/result",
        params: {
          status: "success",
          orderId: DUMMY_ORDER.orderId,
          amount: String(DUMMY_ORDER.amount),
          paymentType: selectedMethod?.name ?? "Midtrans",
        },
      });
    }, 2000);
  }

  // ── Loading processing ──
  if (isProcessing) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center px-8"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text className="text-slate-800 font-bold text-lg mt-5 text-center">
          Memproses Pembayaran...
        </Text>
        <Text className="text-slate-400 text-sm mt-2 text-center leading-5">
          Harap tunggu, jangan menutup aplikasi
        </Text>
        <View className="flex-row items-center gap-2 mt-5 bg-slate-50 px-4 py-2.5 rounded-xl">
          <Shield size={14} color="#94a3b8" strokeWidth={2} />
          <Text className="text-slate-400 text-xs">
            Transaksi diproses dengan aman
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <View className="bg-otokas-primary px-5 pt-2 pb-8 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="white" strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">
            Konfirmasi Pembayaran
          </Text>
          {/* <Text className="text-blue-200 text-sm">
            {DUMMY_ORDER.paket} — {formattedAmount}/bulan
          </Text> */}
        </View>
        {/* <View className="flex-row items-center gap-1 bg-white/10 px-2.5 py-1 rounded-xl">
          <Lock size={12} color="#93c5fd" strokeWidth={2} />
          <Text className="text-blue-200 text-xs">Aman</Text>
        </View> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 15, paddingBottom: 130 }}
      >
        {/* Ringkasan Order */}
        <View
          className="bg-white rounded-2xl p-4 mb-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Ringkasan Order
          </Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-500 text-sm">Order ID</Text>
            <Text className="text-slate-700 text-sm font-medium">
              {DUMMY_ORDER.orderId}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-500 text-sm">Paket</Text>
            <Text className="text-slate-700 text-sm font-semibold">
              {DUMMY_ORDER.paket}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-500 text-sm">Periode</Text>
            <Text className="text-slate-700 text-sm font-semibold">
              {DUMMY_ORDER.periode}
            </Text>
          </View>
          <View className="h-px bg-slate-100 my-3" />
          <View className="flex-row justify-between items-center">
            <Text className="text-slate-800 font-bold text-base">Total</Text>
            <Text className="text-otokas-primary font-bold text-lg">
              {formattedAmount}
            </Text>
          </View>
        </View>

        {/* Pilih Metode Pembayaran */}
        <Text className="text-slate-800 font-bold text-base mb-3 px-1">
          Pilih Metode Pembayaran
        </Text>

        {CATEGORIES.map((category) => (
          <View key={category} className="mb-4">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2 px-1">
              {category}
            </Text>
            <View
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              {PAYMENT_METHODS.filter((m) => m.category === category).map(
                (method, index, arr) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelected(method.id)}
                    className={`flex-row items-center p-4 ${
                      index < arr.length - 1 ? "border-b border-slate-100" : ""
                    } ${selected === method.id ? "bg-blue-50" : "bg-white"}`}
                  >
                    <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-3">
                      <Image
                        source={method.image}
                        style={{ width: 32, height: 32 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-800 font-semibold text-base">
                        {method.name}
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        {method.desc}
                      </Text>
                    </View>
                    {selected === method.id ? (
                      <CheckCircle size={22} color="#1e3a8a" strokeWidth={2} />
                    ) : (
                      <View className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        ))}

        <View className="flex-row items-center justify-center gap-2 mt-1">
          {/* <Shield size={14} color="#94a3b8" strokeWidth={2} /> */}
          {/* <Text className="text-slate-400 text-xs">
            Transaksi diproses oleh Midtrans Payment Gateway
          </Text> */}
        </View>
      </ScrollView>

      {/* TOMBOL BAYAR sticky */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-12 border-t border-slate-100"
        style={{ elevation: 12 }}
      >
        {!selected && (
          <Text className="text-slate-400 text-sm text-center mb-3">
            Pilih metode pembayaran terlebih dahulu
          </Text>
        )}
        <TouchableOpacity
          onPress={handleBayar}
          disabled={!selected}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
            selected ? "bg-otokas-primary" : "bg-slate-200"
          }`}
        >
          <Text
            className={`font-bold text-base ${selected ? "text-white" : "text-slate-400"}`}
          >
            Bayar Sekarang
          </Text>
          <ChevronRight
            size={18}
            color={selected ? "white" : "#94a3b8"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
