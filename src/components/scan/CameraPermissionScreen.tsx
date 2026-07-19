import { Stack } from "expo-router";
import { ScanLine } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CameraPermissionScreen({
  onRequestPermission,
}: {
  onRequestPermission: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
      <Stack.Screen options={{ headerShown: false }} />
      <ScanLine size={48} color="#1e3a8a" strokeWidth={1.5} />
      <Text className="text-xl font-bold text-slate-800 mt-4 text-center">
        Butuh Akses Kamera
      </Text>
      <Text className="text-slate-400 text-base text-center mt-2 mb-6">
        Otokas perlu kamera untuk scan STNK dan BPKB Anda
      </Text>
      <TouchableOpacity
        onPress={onRequestPermission}
        className="bg-otokas-primary px-8 py-4 rounded-2xl"
      >
        <Text className="text-white font-bold text-lg">Izinkan Kamera</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
