import { useState } from "react";

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type PickerStep = "start" | "end" | null;

export function useDateRangePicker(initial: DateRange) {
  const [range, setRange] = useState<DateRange>(initial);
  const [tempRange, setTempRange] = useState<DateRange>(initial);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<PickerStep>("start");

  function open(startFrom: PickerStep = "start") {
    setTempRange(range);
    setStep(startFrom);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setStep("start");
  }

  function confirm() {
    setRange(tempRange);
    close();
  }

  function selectDate(date: Date) {
    if (step === "start") {
      setTempRange((prev) => ({
        startDate: date,
        endDate: date > prev.endDate ? date : prev.endDate,
      }));
      setStep("end");
    } else {
      setTempRange((prev) => ({
        startDate: date < prev.startDate ? date : prev.startDate,
        endDate: date < prev.startDate ? prev.startDate : date,
      }));
      setStep("start");
    }
  }

  function navigateMonth(offset: number, viewDate: Date): Date {
    const d = new Date(viewDate);
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    return d;
  }

  return {
    range,
    tempRange,
    isOpen,
    step,
    open,
    close,
    confirm,
    selectDate,
    navigateMonth,
  };
}
