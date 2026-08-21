import { formatRupiahInput } from "@/src/utils/formatRupiah";
import React from "react";
import {
  Modal,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

export const MOTOR_BRANDS = [
  "Honda",
  "Yamaha",
  "Suzuki",
  "Kawasaki",
  "TVS",
  "Lainnya",
];

type MotorFieldProps = TextInputProps & {
  label: string;
};

export function MotorField({ label, ...inputProps }: MotorFieldProps) {
  return (
    <View className="flex-1">
      <Text className="text-slate-700 font-semibold text-sm mb-2">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        {...inputProps}
        className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base bg-white"
      />
    </View>
  );
}

type MotorPrimaryFieldsProps = {
  brand: string;
  name: string;
  year: string;
  plateNumber: string;
  buyingPrice: string;
  sellingPrice: string;
  disabled?: boolean;
  onOpenBrandPicker: () => void;
  onNameChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onPlateNumberChange: (value: string) => void;
  onBuyingPriceChange: (value: string) => void;
  onSellingPriceChange: (value: string) => void;
  compactPricePlaceholder?: boolean;
};

export function MotorPrimaryFields({
  brand,
  name,
  year,
  plateNumber,
  buyingPrice,
  sellingPrice,
  disabled = false,
  onOpenBrandPicker,
  onNameChange,
  onYearChange,
  onPlateNumberChange,
  onBuyingPriceChange,
  onSellingPriceChange,
  compactPricePlaceholder = false,
}: MotorPrimaryFieldsProps) {
  return (
    <>
      <View>
        <Text className="text-slate-700 font-semibold text-sm mb-2">
          Merek
        </Text>
        <TouchableOpacity
          onPress={onOpenBrandPicker}
          disabled={disabled}
          className="border border-slate-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between bg-white"
        >
          <Text
            className={
              brand ? "text-slate-900 text-base" : "text-slate-400 text-base"
            }
          >
            {brand || "Pilih merek"}
          </Text>
          <Text className="text-slate-400 text-base">⌄</Text>
        </TouchableOpacity>
      </View>

      <MotorField
        label="Model / Tipe"
        placeholder="Contoh: Vario 125 CBS"
        value={name}
        onChangeText={onNameChange}
        autoCapitalize="words"
        editable={!disabled}
      />

      <View className="flex-row gap-4">
        <MotorField
          label="Tahun"
          placeholder="2023"
          value={year}
          onChangeText={(value) =>
            onYearChange(value.replace(/\D/g, "").slice(0, 4))
          }
          keyboardType="numeric"
          maxLength={4}
          editable={!disabled}
        />
        <MotorField
          label="Plat Nomor"
          placeholder="B 1234 ABC"
          value={plateNumber}
          onChangeText={(value) => onPlateNumberChange(value.toUpperCase())}
          autoCapitalize="characters"
          editable={!disabled}
        />
      </View>

      <View className="flex-row gap-4">
        <MotorField
          label="Harga Beli (Rp)"
          placeholder={compactPricePlaceholder ? "14000000" : "14.000.000"}
          value={buyingPrice}
          onChangeText={(value) =>
            onBuyingPriceChange(formatRupiahInput(value))
          }
          keyboardType="numeric"
          editable={!disabled}
        />
        <MotorField
          label="Harga Jual (Rp)"
          placeholder={compactPricePlaceholder ? "16500000" : "16.500.000"}
          value={sellingPrice}
          onChangeText={(value) =>
            onSellingPriceChange(formatRupiahInput(value))
          }
          keyboardType="numeric"
          editable={!disabled}
        />
      </View>
    </>
  );
}

type MotorBrandPickerProps = {
  visible: boolean;
  value: string;
  onChange: (brand: string) => void;
  onClose: () => void;
};

export function MotorBrandPicker({
  visible,
  value,
  onChange,
  onClose,
}: MotorBrandPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40"
        activeOpacity={1}
        onPress={onClose}
      />
      <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
        <Text className="text-slate-900 font-bold text-lg mb-4">
          Pilih Merek
        </Text>
        {MOTOR_BRANDS.map((brand) => (
          <TouchableOpacity
            key={brand}
            onPress={() => {
              onChange(brand);
              onClose();
            }}
            className="py-4 border-b border-slate-100 flex-row items-center justify-between"
          >
            <Text
              className={`text-base ${
                value === brand
                  ? "text-otokas-primary font-semibold"
                  : "text-slate-700"
              }`}
            >
              {brand}
            </Text>
            {value === brand && (
              <Text className="text-otokas-primary font-bold">✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}
