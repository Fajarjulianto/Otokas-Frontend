export function formatRupiah(value: number): string {
  if (value === null || value === undefined) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("IDR", "Rp ");
}

export function formatRupiahInput(raw: string): string {
  const cleaned = raw.replace(/\D/g, "");
  if (!cleaned) return "";
  return Number(cleaned).toLocaleString("id-ID");
}

export function parseRupiah(formatted: string): number {
  if (!formatted) return 0;
  return Number(formatted.replace(/\./g, ""));
}
