// import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  // Modal,
  // Image,
} from "react-native";
import { router, Stack } from "expo-router";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

const handleFeatureNotReady = (featureName: string) => {
  Alert.alert(
    "Fitur Segera Hadir",
    `Fitur ${featureName} akan aktif setelah masa trial selesai.`,
  );
};

const summaryStats = [
  {
    iconName: "dollar-sign",
    iconColor: "#10B981",
    title: "Total Pendapatan",
    value: "Rp 1.42M",
    trend: "+14.5%",
    isTrendPositive: true,
  },
  {
    iconName: "motorcycle",
    iconColor: "#6B7280",
    title: "Total Terjual",
    value: "95 unit",
    trend: "+8 unit",
    isTrendPositive: true,
  },
  {
    iconName: "bar-chart-2",
    iconColor: "#6B7280",
    title: "Rata-rata Margin",
    value: "15.2%",
    trend: "-0.8%",
    isTrendPositive: false,
  },
  {
    iconName: "money-bill-wave",
    iconColor: "#6B7280",
    title: "Harga Rata-rata",
    value: "Rp 18.9jt",
    trend: "+Rp 1.2jt",
    isTrendPositive: true,
  },
];

const bestSellerMotors = [
  { name: "Honda Vario 125", units: 14, progressPercentage: 100 },
  { name: "Yamaha NMAX 155", units: 11, progressPercentage: 78.5 },
  { name: "Honda Beat", units: 10, progressPercentage: 71.4 },
  { name: "Honda PCX 160", units: 8, progressPercentage: 57.1 },
  { name: "Kawasaki Ninja 250", units: 6, progressPercentage: 42.8 },
];

const revenueData = [
  { month: "Sep", value: 180, percentage: 56 },
  { month: "Okt", value: 220, percentage: 68 },
  { month: "Nov", value: 200, percentage: 62 },
  { month: "Des", value: 320, percentage: 100 },
  { month: "Jan", value: 240, percentage: 75 },
  { month: "Feb", value: 280, percentage: 87 },
];

// 1. Kartu Statistik Ringkasan (Grid 2x2)
const StatCard = ({ item }: { item: (typeof summaryStats)[0] }) => {
  const Icon = item.iconName === "motorcycle" ? FontAwesome5 : Feather;

  return (
    <View className="flex-1 bg-white rounded-xl p-4 m-2 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <Icon name={item.iconName} size={16} color={item.iconColor} />
        <Text className="text-gray-400 text-xs ml-2 font-medium">
          {item.title}
        </Text>
      </View>
      <Text className="text-gray-800 text-2xl font-extrabold mb-1.5">
        {item.value}
      </Text>
      <View
        className={`flex-row items-center px-2 py-0.5 rounded-full ${item.isTrendPositive ? "bg-emerald-50" : "bg-red-50"}`}
      >
        <Feather
          name={item.isTrendPositive ? "trending-up" : "trending-down"}
          size={12}
          color={item.isTrendPositive ? "#10B981" : "#EF4444"}
        />
        <Text
          className={`text-xs ml-1 font-bold ${item.isTrendPositive ? "text-emerald-600" : "text-red-600"}`}
        >
          {item.trend}
        </Text>
      </View>
    </View>
  );
};

// 2. Item Motor Terlaris
const MotorItem = ({ item }: { item: (typeof bestSellerMotors)[0] }) => (
  <View className="mb-4">
    <View className="flex-row justify-between items-center mb-1.5">
      <Text className="text-gray-700 font-bold text-base">{item.name}</Text>
      <Text className="text-gray-900 font-extrabold text-base">
        {item.units} unit
      </Text>
    </View>
    <View className="h-2 w-full bg-gray-100 rounded-full relative overflow-hidden">
      <View
        style={{ width: `${item.progressPercentage}%` }}
        className="h-2 bg-otokas-secondary rounded-full"
      />
    </View>
  </View>
);

// --- 📱 HALAMAN UTAMA (Laporan) ---
export default function ReportsScreen() {
  // const [modalVisible, setModalVisible] = useState(false);

  const handleDownloadExcel = () => {
    Alert.alert(
      "Berhasil!",
      "Laporan Excel untuk periode 01 Sep 2024 - 28 Feb 2025 sudah terkirim ke WhatsApp Bos.",
      [{ text: "Mantap!" }],
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="bg-otokas-primary pt-10 pb-5 px-6 rounded-b-[32px] shadow-lg relative z-10 mb-10">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Laporan</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 -mt-6 relative z-0"
        showsVerticalScrollIndicator={false}
      >
        {/* KARTU FILTER TANGGAL */}
        <View className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => handleFeatureNotReady("Ubah Tanggal")}
            className="flex-row flex-1 items-center bg-otokas-secondary px-3 py-2 rounded-lg"
          >
            <Feather name="calendar" size={16} color="white" />
            <Text className="text-white font-bold ml-2 text-sm">
              01 Sep 2024
            </Text>
          </TouchableOpacity>
          <Text className="text-gray-300 mx-3">—</Text>
          <TouchableOpacity
            onPress={() => handleFeatureNotReady("Ubah Tanggal")}
            className="flex-row flex-1 items-center border border-gray-100 px-3 py-2 rounded-lg bg-gray-50"
          >
            <Feather name="calendar" size={16} color="#6B7280" />
            <Text className="text-gray-600 font-medium ml-2 text-sm">
              28 Feb 2025
            </Text>
          </TouchableOpacity>
        </View>

        {/* TOMBOL UNDUH EXCEL */}
        <TouchableOpacity
          onPress={handleDownloadExcel}
          className="bg-otokas-primary flex-row justify-center items-center py-4 rounded-xl mb-6 shadow-sm active:bg-blue-900"
        >
          <Feather name="download" size={18} color="white" />
          <Text className="text-white font-bold ml-2.5 text-lg">
            Unduh Laporan Excel
          </Text>
        </TouchableOpacity>

        {/* GRID STATISTIK RINGKASAN */}
        <View className="flex-row flex-wrap -m-2 mb-6">
          {summaryStats.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </View>

        {/* GRAFIK PENDAPATAN 6 BULAN (Secara Manual) */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <Text className="text-gray-800 font-bold text-lg mb-6">
            Pendapatan 6 Bulan Terakhir (juta Rp)
          </Text>
          <View className="flex-row h-52 relative border-b border-gray-100 pb-2">
            {/* Sumbu Y Label (Manual) */}
            <View className="absolute left-0 bottom-10 h-44 justify-between items-end pr-2">
              <Text className="text-xs text-gray-400 font-medium">320</Text>
              <Text className="text-xs text-gray-400 font-medium">240</Text>
              <Text className="text-xs text-gray-400 font-medium">160</Text>
              <Text className="text-xs text-gray-400 font-medium">80</Text>
              <Text className="text-xs text-gray-400 font-medium">0</Text>
            </View>

            {/* Batang Grafik (Flex-row) */}
            <View className="flex-1 flex-row justify-around items-end pl-8">
              {revenueData.map((data, index) => (
                <View key={index} className="items-center w-8">
                  <View
                    style={{ height: `${data.percentage}%` }}
                    className="w-8 bg-otokas-primary rounded-t-lg"
                  />
                  <Text className="text-xs text-gray-500 font-medium mt-3">
                    {data.month}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* DAFTAR MOTOR TERLARIS */}
        <View className="bg-white rounded-2xl p-5 mb-10 shadow-sm border border-gray-100">
          <Text className="text-gray-800 font-bold text-lg mb-5">
            Motor Terlaris
          </Text>
          {bestSellerMotors.map((item, index) => (
            <MotorItem key={index} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
