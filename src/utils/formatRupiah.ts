export function formatRupiah(value: number): string {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatRupiahInput(raw: string): string {
  const cleaned = raw.replace(/\D/g, "");
  if (!cleaned) return "";
  return Number(cleaned).toLocaleString("id-ID");
}

export function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}
