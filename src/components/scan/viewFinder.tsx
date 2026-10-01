import { PhotoItem } from "@/src/types/scan";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Viewfinder({
  photos,
  onReview,
  onFrame,
}: {
  photos: PhotoItem[];
  onReview: () => void;
  onFrame: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}) {
  const frameRef = useRef<View>(null);
  return (
    <View className="flex-1 items-center justify-center">
      <View
        ref={frameRef}
        collapsable={false}
        onLayout={() =>
          requestAnimationFrame(() =>
            frameRef.current?.measureInWindow((x, y, width, height) =>
              onFrame({ x, y, width, height }),
            ),
          )
        }
        className="relative rounded-2xl"
        style={{ width: "85%", maxWidth: 500, aspectRatio: 1.585 }}
      >
        {/* Outline penuh mengikuti bentuk kartu STNK */}
        <View className="absolute inset-0 rounded-2xl border-2 border-amber-400/40" />

        {/* Bingkai Sudut */}
        {[
          "absolute -top-1 -left-1 border-t-4 border-l-4 rounded-tl-xl",
          "absolute -top-1 -right-1 border-t-4 border-r-4 rounded-tr-xl",
          "absolute -bottom-1 -left-1 border-b-4 border-l-4 rounded-bl-xl",
          "absolute -bottom-1 -right-1 border-b-4 border-r-4 rounded-br-xl",
        ].map((cls, i) => (
          <View key={i} className={`${cls} w-8 h-8 border-amber-400`} />
        ))}

        {photos.length > 0 && (
          <TouchableOpacity
            onPress={onReview}
            className="absolute -bottom-3 -right-3"
          >
            <View className="relative">
              <Image
                source={{ uri: photos[photos.length - 1].uri }}
                className="w-14 h-14 rounded-lg border-2 border-white"
                resizeMode="cover"
              />
              <View className="absolute -top-2 -right-2 bg-red-500 min-w-[20px] h-5 rounded-full items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">
                  {photos.length}
                </Text>
              </View>
            </View>
            <Text className="text-amber-300 text-xs font-medium text-center mt-1">
              Lihat ›
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-white text-sm mt-5 font-medium opacity-80">
        Scan
      </Text>
      <Text className="text-amber-300 text-xs mt-1 opacity-70">
        Ketuk untuk foto, ambil sebanyak yang dibutuhkan
      </Text>
    </View>
  );
}
