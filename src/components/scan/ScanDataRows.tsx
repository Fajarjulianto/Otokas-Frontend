import type { OcrResult } from "@/src/types/scan";
import React from "react";
import { Text, TextInput, View } from "react-native";

export type EditableScanField = "brand" | "name" | "year" | "color";

type ScanDataRowsProps = {
  ocr: OcrResult;
  editableFields?: Partial<Record<EditableScanField, boolean>>;
  onFieldChange?: (field: EditableScanField, value: string) => void;
  compact?: boolean;
};

export function ScanDataRows({
  ocr,
  editableFields = {},
  onFieldChange,
  compact = false,
}: ScanDataRowsProps) {
  const details: {
    label: string;
    value: string;
    field?: EditableScanField;
    placeholder?: string;
  }[] = [
    {
      label: "Merek",
      value: ocr.brand ?? "",
      field: "brand",
      placeholder: "Isi merek",
    },
    {
      label: "Nama Motor",
      value: ocr.name ?? "",
      field: "name",
      placeholder: "Isi nama motor",
    },
    { label: "Plat Nomor", value: ocr.plateNumber ?? "" },
    {
      label: "Tahun",
      value: ocr.year ? String(ocr.year) : "",
      field: "year",
      placeholder: "Isi tahun",
    },
    { label: "No. Rangka", value: ocr.frameNumber ?? "" },
    { label: "No. Mesin", value: ocr.engineNumber ?? "" },
    { label: "Kode STNK", value: ocr.stnkCode ?? "" },
    {
      label: "Warna",
      value: ocr.color ?? "",
      field: "color",
      placeholder: "Isi warna",
    },
    {
      label: "Kapasitas Mesin",
      value: ocr.displacement ? `${ocr.displacement} cc` : "",
    },
  ];

  return (
    <View className={compact ? "px-1" : "px-4"}>
      {details.map((detail, index) => {
        const editableField = detail.field;
        const isEditable = editableField && editableFields[editableField];

        return (
          <View
            key={detail.label}
            className={`flex-row items-center gap-3 ${compact ? "py-2.5" : "py-3"} ${
              index < details.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <Text
              className={`${compact ? "w-24 text-xs" : "w-32 text-sm"} text-slate-500`}
            >
              {detail.label}
            </Text>

            {isEditable && editableField ? (
              <TextInput
                value={detail.value}
                onChangeText={(value) => onFieldChange?.(editableField, value)}
                placeholder={detail.placeholder}
                placeholderTextColor="#94a3b8"
                keyboardType={editableField === "year" ? "numeric" : "default"}
                maxLength={editableField === "year" ? 4 : undefined}
                autoCapitalize={editableField === "year" ? "none" : "words"}
                className={`flex-1 bg-blue-50 border border-blue-200 rounded-lg px-3 text-right text-slate-800 font-semibold ${
                  compact ? "py-2 text-xs" : "py-2.5 text-sm"
                }`}
              />
            ) : (
              <Text
                className={`flex-1 text-right text-slate-800 font-semibold ${compact ? "text-xs" : "text-sm"}`}
              >
                {detail.value || "-"}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
