import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import type { DateRange, PickerStep } from "../hooks/useDateRangePicker";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date: Date, start: Date, end: Date) {
  return date > start && date < end;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function formatDateID(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS_ID[
    date.getMonth()
  ].slice(0, 3)} ${date.getFullYear()}`;
}

type DayCellProps = {
  date: Date;
  tempRange: DateRange;
  step: PickerStep;
  onSelect: (date: Date) => void;
};

function DayCell({ date, tempRange, step, onSelect }: DayCellProps) {
  const { startDate, endDate } = tempRange;
  const isStart = isSameDay(date, startDate);
  const isEnd = isSameDay(date, endDate);
  const inRange = isInRange(date, startDate, endDate);
  const isToday = isSameDay(date, new Date());
  const isSelected = isStart || isEnd;
  const bgSelected = isStart ? "bg-otokas-primary" : "bg-amber-400";
  const textSelected = "text-white font-bold";

  return (
    <TouchableOpacity
      onPress={() => onSelect(date)}
      className={`flex-1 items-center justify-center py-1.5 ${
        inRange ? "bg-blue-50" : ""
      } ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`}
      activeOpacity={0.7}
    >
      <View
        className={`w-8 h-8 rounded-full items-center justify-center ${
          isSelected ? bgSelected : ""
        }`}
      >
        <Text
          className={`text-sm ${
            isSelected
              ? textSelected
              : inRange
                ? "text-otokas-primary font-semibold"
                : isToday
                  ? "text-amber-500 font-bold"
                  : "text-slate-700"
          }`}
        >
          {date.getDate()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

type CalendarGridProps = {
  viewDate: Date;
  tempRange: DateRange;
  step: PickerStep;
  onSelect: (date: Date) => void;
};

function CalendarGrid({
  viewDate,
  tempRange,
  step,
  onSelect,
}: CalendarGridProps) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from(
      { length: totalDays },
      (_, i) => new Date(year, month, i + 1),
    ),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View>
      <View className="flex-row mb-1">
        {DAYS.map((d) => (
          <Text
            key={d}
            className="flex-1 text-center text-xs font-semibold text-slate-400 py-1"
          >
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row mb-0.5">
          {week.map((date, di) =>
            date ? (
              <DayCell
                key={di}
                date={date}
                tempRange={tempRange}
                step={step}
                onSelect={onSelect}
              />
            ) : (
              <View key={di} className="flex-1" />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

type DateRangePickerProps = {
  visible: boolean;
  tempRange: DateRange;
  step: PickerStep;
  onSelect: (date: Date) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function DateRangePicker({
  visible,
  tempRange,
  step,
  onSelect,
  onConfirm,
  onClose,
}: DateRangePickerProps) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(tempRange.startDate);
    d.setDate(1);
    return d;
  });

  function navigate(offset: number) {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  }

  const stepLabel =
    step === "start" ? "Pilih tanggal mulai" : "Pilih tanggal akhir";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-white rounded-t-3xl pt-2 pb-8 px-5">
        <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-4" />
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-slate-800 font-bold text-lg">
              Pilih Periode
            </Text>
            <Text className="text-otokas-secondary text-xs font-medium mt-0.5">
              {stepLabel}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <X size={14} color="#64748b" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-3 mb-5 bg-slate-50 p-3 rounded-2xl">
          <View
            className={`flex-1 px-3 py-2 rounded-xl border ${
              step === "start"
                ? "bg-otokas-primary border-otokas-primary"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`text-xs mb-0.5 ${step === "start" ? "text-blue-200" : "text-slate-400"}`}
            >
              Mulai
            </Text>
            <Text
              className={`text-sm font-bold ${
                step === "start" ? "text-white" : "text-slate-700"
              }`}
            >
              {formatDateID(tempRange.startDate)}
            </Text>
          </View>

          <Text className="text-slate-300 font-bold">→</Text>

          <View
            className={`flex-1 px-3 py-2 rounded-xl border ${
              step === "end"
                ? "bg-amber-400 border-amber-400"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`text-xs mb-0.5 ${step === "end" ? "text-amber-100" : "text-slate-400"}`}
            >
              Selesai
            </Text>
            <Text
              className={`text-sm font-bold ${
                step === "end" ? "text-white" : "text-slate-700"
              }`}
            >
              {formatDateID(tempRange.endDate)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <ChevronLeft size={16} color="#1e3a8a" strokeWidth={2.5} />
          </TouchableOpacity>

          <Text className="text-slate-800 font-bold text-base">
            {MONTHS_ID[viewDate.getMonth()]} {viewDate.getFullYear()}
          </Text>

          <TouchableOpacity
            onPress={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <ChevronRight size={16} color="#1e3a8a" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <CalendarGrid
          viewDate={viewDate}
          tempRange={tempRange}
          step={step}
          onSelect={onSelect}
        />

        <TouchableOpacity
          onPress={onConfirm}
          className="mt-5 bg-otokas-primary rounded-2xl py-3.5 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Terapkan</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
