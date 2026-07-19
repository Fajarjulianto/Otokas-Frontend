import { useMarkAsSold, useMotorById } from "@/src/hooks/useMotors";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Bike,
  Calendar,
  ClipboardList,
  FileText,
  Hash,
  Palette,
  Pencil,
  Tag,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// ─── Sub-components ─────────
function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <View className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 min-w-[45%]">
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icon size={12} color="#94a3b8" strokeWidth={2} />
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {label}
        </Text>
      </View>
      <Text className="text-slate-800 text-sm font-bold">{value}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueStyle = "",
}: {
  label: string;
  value: string;
  valueStyle?: string;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
      <Text className="text-slate-500 text-sm">{label}</Text>
      <Text
        className={`text-sm font-semibold ${valueStyle || "text-slate-800"}`}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Main ───────────
export default function MotorDetailPage() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: motor, isLoading } = useMotorById(id);
  const markAsSoldMutation = useMarkAsSold();

  const margin =
    motor?.buyingPrice && motor?.sellingPrice && motor.buyingPrice > 0
      ? (
          ((motor.sellingPrice - motor.buyingPrice) / motor.buyingPrice) *
          100
        ).toFixed(1)
      : null;

  const estimasiMargin =
    motor?.buyingPrice && motor?.sellingPrice
      ? motor.sellingPrice - motor.buyingPrice
      : null;

  function handleMarkAsSold() {
    if (!motor) return;
    Alert.alert(
      "Tandai Terjual",
      `Yakin ${motor.brand} ${motor.name} sudah terjual?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Terjual",
          onPress: () => {
            markAsSoldMutation.mutate(motor.id, {
              onSuccess: () => {
                Alert.alert("Berhasil", "Motor berhasil ditandai terjual.", [
                  { text: "OK", onPress: () => router.replace("/(tabs)/stok") },
                ]);
              },
            });
          },
        },
      ],
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  // ── Not found ──
  if (!motor) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center px-8"
        edges={["top"]}
      >
        <Bike size={48} color="#cbd5e1" strokeWidth={1.5} />
        <Text className="text-slate-700 font-bold text-lg mt-4 text-center">
          Motor tidak ditemukan
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 bg-otokas-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const subtitle = [motor.year, motor.plateNumber].filter(Boolean).join(" · ");

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Header */}
      <View className="bg-otokas-primary px-5 pt-2 pb-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="white" strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-xl font-bold" numberOfLines={1}>
            Detail Motor
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* ── HARGA JUAL besar ── */}
        <View
          className="bg-white rounded-2xl px-5 py-5 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-900 text-2xl font-bold" numberOfLines={1}>
            {motor.brand} {motor.name}
          </Text>
          {subtitle ? (
            <Text className="text-slate-400 text-sm mt-0.5">{subtitle}</Text>
          ) : null}
          <Text className="text-otokas-primary text-3xl font-bold mt-3">
            {motor.sellingPrice ? (
              formatRupiah(motor.sellingPrice)
            ) : (
              <Text className="text-slate-300 text-xl font-normal">
                Harga belum diisi
              </Text>
            )}
          </Text>
        </View>

        {/* ── SPESIFIKASI ── */}
        <View
          className="bg-white rounded-2xl px-5 py-4 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-800 font-bold text-base mb-3">
            Spesifikasi
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <SpecItem
              icon={Hash}
              label="Nomor Rangka"
              value={motor.frameNumber}
            />
            <SpecItem
              icon={FileText}
              label="Nomor Mesin"
              value={motor.engineNumber}
            />
            <SpecItem icon={Palette} label="Warna" value={motor.color} />
            <SpecItem
              icon={Calendar}
              label="Kilometer"
              value={
                motor.kilometer != null
                  ? `${motor.kilometer.toLocaleString("id-ID")} km`
                  : undefined
              }
            />
            <SpecItem icon={Tag} label="Plat Nomor" value={motor.plateNumber} />
            <SpecItem
              icon={FileText}
              label="Status Pajak"
              value={motor.tax}
            />
            <SpecItem
              icon={Calendar}
              label="Tahun"
              value={motor.year ? String(motor.year) : undefined}
            />
          </View>
        </View>

        {/* ── INFORMASI HARGA ── */}
        <View
          className="bg-white rounded-2xl px-5 py-4 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-800 font-bold text-base mb-1">
            Informasi Harga
          </Text>
          <InfoRow
            label="Harga Beli"
            value={motor.buyingPrice ? formatRupiah(motor.buyingPrice) : "—"}
          />
          <InfoRow
            label="Harga Jual"
            value={motor.sellingPrice ? formatRupiah(motor.sellingPrice) : "—"}
          />
          <View className="flex-row justify-between items-center pt-3">
            <Text className="text-slate-800 font-bold text-sm">
              Estimasi Margin
            </Text>
            <View className="flex-row items-center gap-2">
              {estimasiMargin !== null && (
                <Text className="text-emerald-600 font-semibold text-sm">
                  {formatRupiah(estimasiMargin)}
                </Text>
              )}
              {margin && (
                <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  <Text className="text-emerald-600 text-xs font-bold">
                    {margin}%
                  </Text>
                </View>
              )}
              {!estimasiMargin && (
                <Text className="text-slate-300 text-sm">—</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── BOTTOM ACTIONS ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 border-t  border-slate-100 flex-row gap-3"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          elevation: 12,
        }}
      >
        {/* Edit */}
        <TouchableOpacity
          onPress={() => router.push(`/unit/${motor.id}/edit`)}
          className="flex-1 flex-row items-center justify-center gap-2 border-2 border-slate-200 py-4 rounded-2xl"
        >
          {motor.isIncomplete ? (
            <>
              <ClipboardList size={18} color="#d97706" strokeWidth={2} />
              <Text className="text-amber-700 font-bold text-base">
                Lengkapi
              </Text>
            </>
          ) : (
            <>
              <Pencil size={18} color="#475569" strokeWidth={2} />
              <Text className="text-slate-700 font-bold text-base">Edit</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Tandai Terjual */}
        <TouchableOpacity
          onPress={handleMarkAsSold}
          disabled={markAsSoldMutation.isPending}
          className="flex-1 flex-row items-center justify-center gap-2 bg-otokas-secondary py-4 rounded-2xl"
        >
          {markAsSoldMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              Tandai Terjual
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
