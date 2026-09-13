import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  isRequesting: boolean;
  error?: string | null;
  onContinue: () => void;
  onSkip: () => void;
};

export function StartupPermissionScreen({
  isRequesting,
  error,
  onContinue,
  onSkip,
}: Props) {
  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="bg-otokas-primary/10 rounded-3xl p-6 mb-6">
        <Text className="text-2xl font-bold text-slate-900 mb-2">
          Izin akses aplikasi
        </Text>
        <Text className="text-slate-600 leading-6">
          Otokas memerlukan akses kamera dan galeri untuk fitur scan STNK serta
          unggah foto motor.
        </Text>
      </View>

      <View className="gap-3 mb-6">
        <Text className="text-slate-700">• Kamera untuk scan dokumen.</Text>
        <Text className="text-slate-700">
          • Galeri untuk memilih foto motor.
        </Text>
      </View>

      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onContinue}
        disabled={isRequesting}
        className="bg-otokas-primary rounded-2xl py-4 items-center mb-3"
      >
        {isRequesting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold">Lanjutkan</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSkip}
        disabled={isRequesting}
        className="bg-slate-100 rounded-2xl py-4 items-center"
      >
        <Text className="text-slate-700 font-semibold">Lewati dulu</Text>
      </TouchableOpacity>
    </View>
  );
}
