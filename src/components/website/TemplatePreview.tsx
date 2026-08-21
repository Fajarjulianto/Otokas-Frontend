import {
  Camera,
  ChevronDown,
  Gauge,
  MapPin,
  Search,
} from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

type CatalogTemplatePreviewProps = {
  address?: string;
  badgeText: string;
  color: string;
  heroImage: string | null;
  subtitle: string;
  title: string;
  compact?: boolean;
};

const PREVIEW_MOTORS = [
  {
    year: "2015",
    plate: "B 1876 ER",
    name: "Kawasaki Ninja RR",
    price: "Rp 16.000.000",
  },
  {
    year: "2023",
    plate: "B 3621 OP",
    name: "Honda CBR 250 RR",
    price: "Rp 22.000.000",
  },
  {
    year: "2024",
    plate: "B 7845 RT",
    name: "Vespa Matic",
    price: "Rp 40.000.000",
  },
];

function MotorImagePlaceholder({ heroImage }: { heroImage: string | null }) {
  if (heroImage) {
    return (
      <Image
        source={{ uri: heroImage }}
        resizeMode="cover"
        className="w-full h-full"
      />
    );
  }

  return (
    <View className="w-full h-full bg-slate-700 items-center justify-center">
      <Camera size={14} color="#cbd5e1" />
    </View>
  );
}

export function CatalogTemplatePreview({
  address,
  badgeText,
  color,
  compact = false,
  heroImage,
  subtitle,
  title,
}: CatalogTemplatePreviewProps) {
  return (
    <View className="bg-slate-50 overflow-hidden">
      <View
        className={`bg-white border-b border-slate-100 ${compact ? "px-3 py-2" : "px-4 py-3"}`}
      >
        <Text
          className={`font-black text-slate-900 ${compact ? "text-[8px]" : "text-sm"}`}
        >
          Otokas
        </Text>
      </View>

      <View className={compact ? "p-2" : "p-3"}>
        <View
          style={{ backgroundColor: color }}
          className={`overflow-hidden relative ${compact ? "rounded-xl p-3 min-h-[106px]" : "rounded-2xl p-5 min-h-[190px]"}`}
        >
          <View className="z-10 w-[58%]">
            <View className="self-start rounded-full bg-white/25 px-2 py-1 mb-2">
              <Text
                className={`font-bold text-white tracking-wider ${compact ? "text-[5px]" : "text-[8px]"}`}
              >
                {badgeText || "PROMO SPESIAL"}
              </Text>
            </View>
            <Text
              numberOfLines={compact ? 3 : 4}
              className={`font-black text-white ${compact ? "text-[11px] leading-[13px]" : "text-xl leading-6"}`}
            >
              {title || "Motor Bekas Berkualitas Mulai dari Rp1Jt-an"}
            </Text>
            <Text
              numberOfLines={2}
              className={`font-medium text-white/90 ${compact ? "text-[5px] leading-[7px] mt-1" : "text-[9px] leading-3 mt-2"}`}
            >
              {subtitle || "Penawaran terbatas dari dealer terpercaya."}
            </Text>
            <View
              className={`self-start flex-row items-center bg-black/10 ${compact ? "rounded px-1.5 py-1 mt-2" : "rounded-lg px-2.5 py-2 mt-3"}`}
            >
              <MapPin size={compact ? 6 : 10} color="white" />
              <Text
                numberOfLines={1}
                className={`font-semibold text-white ml-1 ${compact ? "text-[5px] max-w-[100px]" : "text-[8px] max-w-[190px]"}`}
              >
                {address || "Jl. Contoh Alamat No. 123, Kota"}
              </Text>
            </View>
          </View>

          <View
            className={`absolute overflow-hidden bg-slate-700 border border-white/20 ${compact ? "right-3 top-7 w-[38%] h-[65px] rounded-md rotate-[-5deg]" : "right-5 top-10 w-[38%] h-[116px] rounded-lg rotate-[-5deg]"}`}
          >
            <MotorImagePlaceholder heroImage={heroImage} />
          </View>
        </View>

        <View className={`flex-row ${compact ? "gap-1.5 mt-2" : "gap-2 mt-3"}`}>
          <View
            className={`bg-white border border-slate-200 flex-row items-center justify-between ${compact ? "w-[30%] rounded-md px-2 py-1.5" : "w-[28%] rounded-lg px-3 py-2.5"}`}
          >
            <Text
              className={`font-bold text-slate-700 ${compact ? "text-[6px]" : "text-[9px]"}`}
            >
              Kategori
            </Text>
            <ChevronDown size={compact ? 7 : 11} color="#94a3b8" />
          </View>
          <View
            className={`flex-1 bg-white border border-slate-200 flex-row items-center ${compact ? "rounded-md px-2 py-1.5" : "rounded-lg px-3 py-2.5"}`}
          >
            <Search size={compact ? 7 : 12} color="#94a3b8" />
            <Text
              className={`text-slate-400 ml-2 ${compact ? "text-[6px]" : "text-[9px]"}`}
            >
              Cari motor idamanmu...
            </Text>
          </View>
        </View>

        <View className={`flex-row ${compact ? "gap-1.5 mt-2" : "gap-2 mt-3"}`}>
          {PREVIEW_MOTORS.map((motor) => (
            <View
              key={motor.plate}
              className={`flex-1 bg-white border border-slate-100 overflow-hidden ${compact ? "rounded-md" : "rounded-xl"}`}
            >
              <View className={`relative ${compact ? "h-9" : "h-[70px]"}`}>
                <MotorImagePlaceholder heroImage={heroImage} />
                <View className="absolute left-1.5 bottom-1 bg-black/70 rounded-full px-1.5 py-0.5 flex-row items-center">
                  <Gauge size={compact ? 5 : 8} color="white" />
                  <Text
                    className={`text-white ml-1 ${compact ? "text-[4px]" : "text-[6px]"}`}
                  >
                    1100km
                  </Text>
                </View>
              </View>
              <View className={compact ? "p-1.5" : "p-2.5"}>
                <Text
                  numberOfLines={1}
                  className={`font-bold text-slate-400 ${compact ? "text-[4px]" : "text-[7px]"}`}
                >
                  {motor.year} | {motor.plate}
                </Text>
                <Text
                  numberOfLines={1}
                  className={`font-bold text-slate-800 ${compact ? "text-[5px] mt-0.5" : "text-[9px] mt-1"}`}
                >
                  {motor.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className={`font-black text-slate-950 ${compact ? "text-[6px] mt-1" : "text-[10px] mt-1.5"}`}
                >
                  {motor.price}
                </Text>
                {!compact && (
                  <View className="flex-row gap-1.5 mt-2 pt-2 border-t border-slate-100">
                    <View className="flex-1 items-center rounded-md bg-slate-100 py-1">
                      <Text className="text-[6px] font-bold text-slate-400">
                        Detail
                      </Text>
                    </View>
                    <View
                      style={{ backgroundColor: color }}
                      className="flex-1 items-center rounded-md py-1"
                    >
                      <Text className="text-[6px] font-bold text-white">
                        Beli
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function DummyTemplatePreview({ compact = false }: { compact?: boolean }) {
  return (
    <View
      className={`bg-slate-100 border border-dashed border-slate-300 items-center justify-center ${compact ? "min-h-[230px]" : "min-h-[370px]"}`}
    >
      <View
        className={`bg-white items-center justify-center rounded-full ${compact ? "w-12 h-12" : "w-16 h-16"}`}
      >
        <Camera size={compact ? 20 : 26} color="#94a3b8" />
      </View>
      <Text
        className={`font-bold text-slate-700 ${compact ? "text-xs mt-3" : "text-base mt-4"}`}
      >
        Preview Template 2
      </Text>
      <Text
        className={`text-slate-400 text-center ${compact ? "text-[9px] mt-1 px-8" : "text-xs mt-2 px-12"}`}
      >
        Dummy sementara — menunggu referensi desain berikutnya.
      </Text>
    </View>
  );
}
