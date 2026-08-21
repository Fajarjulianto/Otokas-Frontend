import { MotorThumbnail } from "@/src/components/motor/MotorThumbnail";
import type { Motor } from "@/src/types/motor";
import { formatRupiah } from "@/src/utils/formatRupiah";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MotorStockCardProps = {
  item: Motor;
  isPremium: boolean;
  onMarkSold: (id: string) => void;
  onDelete: (id: string) => void;
  isSelling: boolean;
  isDeleting: boolean;
};

export const MotorStockCard = React.memo(function MotorStockCard({
  item,
  isPremium,
  onMarkSold,
  onDelete,
  isSelling,
  isDeleting,
}: MotorStockCardProps) {
  const router = useRouter();
  const isSold = item.status === "SOLD";

  function handleMarkSold() {
    Alert.alert(
      "Tandai Terjual",
      `Yakin ${item.brand} ${item.name} sudah terjual?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Terjual", onPress: () => onMarkSold(item.id) },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      "Hapus Motor",
      `Yakin ingin menghapus ${item.brand} ${item.name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => onDelete(item.id),
        },
      ],
    );
  }

  return (
    <View
      className={`bg-white rounded-2xl mb-3 overflow-hidden ${
        isSold ? "opacity-60" : ""
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        className={`h-1 w-full ${
          isSold
            ? "bg-slate-300"
            : item.isIncomplete
              ? "bg-amber-400"
              : "bg-otokas-primary"
        }`}
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-1 gap-3">
          <View className="flex-1 flex-row items-start gap-3">
            <MotorThumbnail
              images={item.motorImages}
              isPremium={isPremium}
              size={56}
            />
            <View className="flex-1 pr-1">
              <Text className="text-slate-900 text-base font-bold">
                {item.brand} {item.name}
              </Text>
              <Text className="text-slate-400 text-sm mt-0.5">
                {item.year ? `Tahun ${item.year}` : "Tahun belum diisi"}
              </Text>
            </View>
          </View>
          {isSold ? (
            <View className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
              <Text className="text-slate-500 text-xs font-semibold">
                Sudah Terjual
              </Text>
            </View>
          ) : item.isIncomplete ? (
            <View className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex-row items-center gap-1">
              <AlertCircle size={12} color="#d97706" />
              <Text className="text-amber-700 text-xs font-semibold">
                Belum Lengkap
              </Text>
            </View>
          ) : (
            <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <Text className="text-emerald-700 text-xs font-semibold">
                Lengkap ✓
              </Text>
            </View>
          )}
        </View>
        <View className="mt-3">
          <Text className="text-slate-400 text-xs">Harga Jual</Text>
          <Text className="text-slate-900 text-xl font-bold mt-0.5">
            {item.sellingPrice ? (
              formatRupiah(item.sellingPrice)
            ) : (
              <Text className="text-slate-300 text-base font-normal">
                Belum diisi
              </Text>
            )}
          </Text>
        </View>
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <TouchableOpacity
            onPress={handleMarkSold}
            disabled={isSelling || isDeleting || isSold}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
              isSold ? "bg-slate-200" : "bg-otokas-primary"
            }`}
          >
            {isSelling ? (
              <ActivityIndicator
                size="small"
                color={isSold ? "#64748b" : "white"}
              />
            ) : (
              <>
                <CheckCircle
                  size={16}
                  color={isSold ? "#64748b" : "white"}
                  strokeWidth={2.5}
                />
                <Text
                  className={`font-semibold text-sm ${
                    isSold ? "text-slate-500" : "text-white"
                  }`}
                >
                  {isSold ? "Sudah Terjual" : "Tandai Terjual"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/unit/${item.id}/edit`)}
            disabled={isSold}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white items-center justify-center"
          >
            <Edit3 size={16} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isDeleting || isSelling}
            className="w-11 h-11 rounded-xl border border-red-200 bg-red-50 items-center justify-center"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Trash2 size={16} color="#DC2626" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
