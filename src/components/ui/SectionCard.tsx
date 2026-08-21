import React, { ReactNode } from "react";
import { Text, View } from "react-native";

type SectionCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View
      className="bg-white rounded-3xl p-5 mb-4"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text className="text-slate-900 text-lg font-bold">{title}</Text>
      <Text className="text-slate-400 text-sm mt-1 mb-5">{subtitle}</Text>
      {children}
    </View>
  );
}
