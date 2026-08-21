import type { MotorImage } from "@/src/types/motor";
import { Bike } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";

type MotorThumbnailProps = {
  images?: MotorImage[];
  isPremium: boolean;
  size?: number;
  containerClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

function isValidUrl(url?: string | null) {
  if (!url?.trim()) return false;

  const normalized = url.trim().toLowerCase();
  return (
    normalized.startsWith("http://") || normalized.startsWith("https://")
  );
}

export function MotorThumbnail({
  images,
  isPremium,
  size = 48,
  containerClassName = "rounded-xl",
  imageClassName,
  fallbackClassName,
  containerStyle,
}: MotorThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  const imageUrl = useMemo(() => {
    if (!isPremium) return null;

    return images?.find((image) => isValidUrl(image.url))?.url.trim() ?? null;
  }, [images, isPremium]);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const showImage = Boolean(isPremium && imageUrl && !hasError);
  const iconSize = Math.max(Math.round(size * 0.5), 16);

  return (
    <View
      className={`items-center justify-center bg-slate-100 overflow-hidden ${containerClassName}`}
      style={[
        {
          width: size,
          height: size,
        },
        containerStyle,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl ?? "" }}
          resizeMode="cover"
          onError={() => setHasError(true)}
          className={`w-full h-full ${imageClassName ?? ""}`}
        />
      ) : (
        <View
          className={`w-full h-full items-center justify-center bg-slate-100 ${fallbackClassName ?? ""}`}
        >
          <Bike size={iconSize} color="#94a3b8" strokeWidth={1.5} />
        </View>
      )}
    </View>
  );
}
