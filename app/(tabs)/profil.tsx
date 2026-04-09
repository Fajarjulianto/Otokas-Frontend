import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Crown,
  Home,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuItem = ({
  icon: Icon,
  iconColor = "#4B5563",
  iconBg = "#F9FAFB",
  title,
  subtitle,
  onPress,
  isHighlight = false,
}: {
  icon: any;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isHighlight?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between p-4 border-b border-gray-100 bg-white"
  >
    <View className="flex-row items-center flex-1">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          className={`font-bold text-base ${isHighlight ? "text-amber-500" : "text-gray-800"}`}
        >
          {title}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
      </View>
    </View>
    <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const handleFeatureNotReady = (featureName: string) => {
    Alert.alert(
      "Fitur Segera Hadir",
      `Fitur ${featureName} akan aktif setelah masa trial selesai.`,
    );
  };

  const handleLogout = () => {
    Alert.alert("Keluar Akun", "Apakah Bos yakin ingin keluar dari Otokas?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* HEADER */}
      <View className="bg-otokas-primary pt-4 pb-12 px-6 rounded-b-[32px] shadow-lg">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Profil</Text>
        </View>

        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-16 h-16 bg-amber-400 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-white text-2xl font-bold">AB</Text>
          </View>

          {/* Info User */}
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Alex Bizher</Text>
            <Text className="text-blue-200 text-sm mt-0.5">
              Showroom Jaya Motor
            </Text>
            <View className="bg-orange-500/30 px-3 py-1 rounded-full mt-2 self-start border border-orange-400/50">
              <Text className="text-orange-300 text-xs font-bold">
                Paket Juragan
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* KARTU KONTAK INFO */}
        <View
          className="bg-white rounded-2xl p-5 mb-5 mt-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View className="flex-row items-center mb-3">
            <Phone size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-gray-600 ml-3 text-sm">
              +62 812-3456-7890
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Mail size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-gray-600 ml-3 text-sm">
              budi@jayamotor.com
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-gray-600 ml-3 text-sm flex-1">
              Jl. Raya Lintas Timur, Unit 2, Tulang Bawang
            </Text>
          </View>
        </View>

        {/* LIST MENU SETTING */}
        <View
          className="bg-white rounded-2xl overflow-hidden mb-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {/* ── MENU LANGGANAN ── */}
          <MenuItem
            icon={Crown}
            iconColor="#f59e0b"
            iconBg="#fef3c7"
            title="Langganan"
            subtitle="Kelola paket & riwayat pembayaran"
            onPress={() => router.push("/paket")}
            isHighlight
          />
          <MenuItem
            icon={User}
            title="Edit Profil"
            subtitle="Ubah nama dan info kontak"
            onPress={() => handleFeatureNotReady("Edit Profil")}
          />
          <MenuItem
            icon={Home}
            title="Data Showroom"
            subtitle="Ubah nama dan alamat showroom"
            onPress={() => handleFeatureNotReady("Data Showroom")}
          />
          <MenuItem
            icon={Lock}
            title="Keamanan"
            subtitle="Ubah password akun"
            onPress={() => handleFeatureNotReady("Ubah Password")}
          />
        </View>

        {/* TOMBOL LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 border border-red-100 flex-row justify-center items-center py-4 rounded-2xl"
        >
          <LogOut size={20} color="#DC2626" strokeWidth={2} />
          <Text className="text-red-600 font-bold ml-2 text-base">
            Keluar dari Akun
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
