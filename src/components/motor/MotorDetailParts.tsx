import { Bike } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

type SpecItemProps = {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  label: string;
  value?: string;
};

export function MotorSpecItem({ icon: Icon, label, value }: SpecItemProps) {
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

type InfoRowProps = {
  label: string;
  value: string;
  valueStyle?: string;
};

export function MotorInfoRow({
  label,
  value,
  valueStyle = "",
}: InfoRowProps) {
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

export function MotorPhotoSlide({ uri }: { uri: string }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [uri]);

  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-6">
        <Bike size={44} color="#cbd5e1" strokeWidth={1.5} />
        <Text className="text-slate-400 text-sm mt-3 text-center">
          Foto tidak dapat dimuat
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      className="w-full h-full"
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
}
