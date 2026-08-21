import { ArrowLeft } from "lucide-react-native";
import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  return (
    <View className="bg-otokas-primary px-5 pt-5 pb-5 flex-row items-center gap-5">
      <TouchableOpacity
        onPress={onBack}
        className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center"
      >
        <ArrowLeft size={20} color="white" />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-white text-lg font-bold">{title}</Text>
        {subtitle && <Text className="text-blue-200 text-sm">{subtitle}</Text>}
      </View>
      {rightAction}
    </View>
  );
}
