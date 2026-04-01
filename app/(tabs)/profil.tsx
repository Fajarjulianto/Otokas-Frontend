import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";

const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between p-4 border-b border-gray-100 bg-white"
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4 border border-gray-100">
        <Feather name={icon} size={20} color="#4B5563" />
      </View>
      <View>
        <Text className="text-gray-800 font-bold text-base">{title}</Text>
        <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
      </View>
    </View>
    <Feather name="chevron-right" size={20} color="#9CA3AF" />
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
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-[#1E3A8A] pt-14 pb-12 px-6 rounded-b-[32px] shadow-lg relative z-10">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Profil</Text>
        </View>

        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-16 h-16 bg-[#F59E0B] rounded-full items-center justify-center border-2 border-white">
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
                👑 Paket Juragan
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 -mt-6 relative z-0"
        showsVerticalScrollIndicator={false}
      >
        {/* KARTU KONTAK INFO */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 mt-10">
          <View className="flex-row items-center mb-3">
            <Feather name="phone" size={16} color="#6B7280" className="mr-3" />
            <Text className="text-gray-600 ml-3">+62 812-3456-7890</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Feather name="mail" size={16} color="#6B7280" className="mr-3" />
            <Text className="text-gray-600 ml-3">budi@jayamotor.com</Text>
          </View>
          <View className="flex-row items-center">
            <Feather
              name="map-pin"
              size={16}
              color="#6B7280"
              className="mr-3"
            />
            <Text className="text-gray-600 ml-3 text-sm">
              Jl. Raya Lintas Timur, Unit 2, Tulang Bawang
            </Text>
          </View>
        </View>

        {/* LIST MENU SETTING */}
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <MenuItem
            icon="user"
            title="Edit Profil"
            subtitle="Ubah nama dan info kontak"
            onPress={() => handleFeatureNotReady("Edit Profil")}
          />
          <MenuItem
            icon="home"
            title="Data Showroom"
            subtitle="Ubah nama dan alamat showroom"
            onPress={() => handleFeatureNotReady("Data Showroom")}
          />
          <MenuItem
            icon="lock"
            title="Keamanan"
            subtitle="Ubah password akun"
            onPress={() => handleFeatureNotReady("Ubah Password")}
          />
        </View>

        {/* TOMBOL LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 border border-red-100 flex-row justify-center items-center py-4 rounded-2xl mb-10"
        >
          <Feather name="log-out" size={20} color="#DC2626" />
          <Text className="text-red-600 font-bold ml-2 text-base">
            Keluar dari Akun
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
