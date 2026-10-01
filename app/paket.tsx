import { FacebookButton } from "@/src/components/facebook/FacebookButton";
import { FACEBOOK_ENABLED } from "@/src/services/facebookServices";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crown,
  Globe,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES = [
  ...(FACEBOOK_ENABLED ? ["Caption otomatis & posting Facebook Page"] : []),
  "Scan STNK otomatis",
  "Upload foto tanpa batas",
  "Laporan laba rugi real-time",
  "Manajemen stok tak terbatas",
  "Website katalog profesional",
  "Dukungan prioritas 24/7",
  "Update fitur seumur hidup",
];

export default function PaketScreen() {
  const router = useRouter();
  const { data: subscription, isLoading } = useSubscriptionStatus();
  const isPremium = subscription?.isPremium ?? false;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom"]}>
      {/* ── HEADER ── */}
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-xl items-center justify-center"
          style={{ elevation: 1 }}
        >
          <ArrowLeft size={20} color="#475569" strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-slate-800 text-lg font-bold">
          Paket Langganan
        </Text>
      </View>

      {/* ── KONTEN UTAMA ── */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#1e3a8a" />
          </View>
        ) : isPremium ? (
          <View>
            {/* ── KARTU LANGGANAN AKTIF ── */}
            <View
              className="bg-white rounded-3xl p-6 border border-emerald-200"
              style={{
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Crown size={20} color="#f59e0b" strokeWidth={2} />
                <Text className="text-otokas-primary font-bold text-sm tracking-widest uppercase">
                  {subscription?.plan ?? "Juragan"} — Aktif
                </Text>
              </View>

              <Text className="text-slate-700 text-base mb-2">
                Langganan Anda aktif
                {subscription?.expiresAt
                  ? ` sampai ${new Date(subscription.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                  : ""}
                .
              </Text>

              <View className="h-px bg-slate-100 mb-5 mt-3" />

              {FEATURES.map((feature, index) => (
                <View key={index} className="flex-row items-center gap-3 mb-3">
                  <View className="w-5 h-5 bg-emerald-50 rounded-full items-center justify-center">
                    <Check size={12} color="#10b981" strokeWidth={3} />
                  </View>
                  <Text className="text-slate-700 text-base flex-1">
                    {feature}
                  </Text>
                </View>
              ))}

              <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-3">
                <Text className="text-emerald-700 text-sm font-semibold text-center">
                  Semua fitur premium aktif
                </Text>
              </View>
            </View>

            <FacebookButton />
            {/* ── TOMBOL MENUJU EDIT WEBSITE (ELEGANT PREMIUM CARD) ── */}
            <View className="mt-6">
              <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider ml-1">
                Akses Eksklusif Anda
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/edit-website")}
                activeOpacity={0.8}
                className="bg-slate-900 rounded-[1.5rem] p-5 flex-row items-center justify-between shadow-xl shadow-slate-900/20"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  {/* Ikon Lingkaran Emas */}
                  <View className="w-12 h-12 bg-amber-500/20 rounded-full items-center justify-center border border-amber-500/30">
                    <Globe color="#f59e0b" size={24} strokeWidth={1.5} />
                  </View>

                  {/* Teks & Subteks */}
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Text className="text-white font-bold text-base tracking-wide">
                        Atur Website Katalog
                      </Text>
                      <Sparkles color="#f59e0b" size={14} />
                    </View>
                    <Text className="text-slate-400 text-[11px] font-medium leading-tight">
                      Sesuaikan tema, foto, & profil etalase online showroom
                      Anda
                    </Text>
                  </View>
                </View>

                {/* Arrow Indikator */}
                <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center">
                  <ChevronRight color="white" size={18} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // ── KARTU UPGRADE (BELUM PREMIUM) ──
          <View
            className="bg-white rounded-3xl p-6 border border-slate-100"
            style={{
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-otokas-primary font-bold text-sm tracking-widest uppercase mb-3">
              Juragan
            </Text>
            <View className="flex-row items-end gap-1 mb-2">
              <Text className="text-slate-900 text-4xl font-bold">
                Rp 200.000
              </Text>
              <Text className="text-slate-400 text-base mb-1">/bulan</Text>
            </View>
            <Text className="text-slate-400 text-sm mb-6">
              Akses penuh semua fitur premium tanpa batasan.
            </Text>

            <View className="h-px bg-slate-100 mb-5" />

            {FEATURES.map((feature, index) => (
              <View key={index} className="flex-row items-center gap-3 mb-3">
                <View className="w-5 h-5 bg-emerald-50 rounded-full items-center justify-center">
                  <Check size={12} color="#10b981" strokeWidth={3} />
                </View>
                <Text className="text-slate-700 text-base flex-1">
                  {feature}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => router.push("/payment/checkout")}
              className="w-full bg-otokas-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-5"
            >
              <Text className="text-white font-bold text-base">
                Langganan Sekarang
              </Text>
              <ChevronRight size={18} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
