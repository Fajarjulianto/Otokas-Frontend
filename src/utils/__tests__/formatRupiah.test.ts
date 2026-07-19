import { formatRupiah, formatRupiahInput, parseRupiah } from "../formatRupiah";

// ─────────────────────────────────────────────────────
// formatRupiah — convert number → formatted IDR string
// ─────────────────────────────────────────────────────
describe("formatRupiah", () => {
  it("formats positive integer", () => {
    const result = formatRupiah(14000000);
    expect(result).toContain("Rp");
    expect(result).toContain("14");
  });

  it("formats zero", () => {
    const result = formatRupiah(0);
    expect(result).toContain("0");
  });

  it("formats small number", () => {
    const result = formatRupiah(500);
    expect(result).toContain("500");
  });

  it("formats large number with separators", () => {
    const result = formatRupiah(150000000);
    expect(result).toContain("Rp");
    // Should contain the formatted number (locale-dependent)
    expect(result.replace(/\s/g, "")).toMatch(/150/);
  });

  it("handles negative number", () => {
    const result = formatRupiah(-500000);
    expect(result).toContain("500");
  });

  // CRIT-01 regression: ensure null/undefined don't crash
  it("handles null gracefully", () => {
    expect(formatRupiah(null as unknown as number)).toBe("Rp 0");
  });

  it("handles undefined gracefully", () => {
    expect(formatRupiah(undefined as unknown as number)).toBe("Rp 0");
  });

  it("does not produce fractional digits", () => {
    const result = formatRupiah(14500000);
    expect(result).not.toContain(",00");
    expect(result).not.toMatch(/\.\d{2}$/);
  });
});

// ─────────────────────────────────────────────────────
// formatRupiahInput — format raw user input string
// ─────────────────────────────────────────────────────
describe("formatRupiahInput", () => {
  it("formats clean numeric string", () => {
    expect(formatRupiahInput("14000000")).toBe("14.000.000");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatRupiahInput("Rp 14.000")).toBe("14.000");
  });

  it("returns empty string for empty input", () => {
    expect(formatRupiahInput("")).toBe("");
  });

  it("returns empty string for non-numeric input", () => {
    expect(formatRupiahInput("abc")).toBe("");
  });

  it("handles single digit", () => {
    expect(formatRupiahInput("5")).toBe("5");
  });

  it("handles leading zeros by treating as number", () => {
    // Number("0050") → 50
    expect(formatRupiahInput("0050")).toBe("50");
  });

  it("formats three-digit number without separator", () => {
    expect(formatRupiahInput("500")).toBe("500");
  });

  it("formats four-digit number with separator", () => {
    expect(formatRupiahInput("5000")).toBe("5.000");
  });
});

// ─────────────────────────────────────────────────────
// parseRupiah — reverse formatted string → number
// ─────────────────────────────────────────────────────
describe("parseRupiah", () => {
  it("parses formatted string to number", () => {
    expect(parseRupiah("14.000.000")).toBe(14000000);
  });

  it("returns 0 for empty string", () => {
    expect(parseRupiah("")).toBe(0);
  });

  it("parses string without separators", () => {
    expect(parseRupiah("500")).toBe(500);
  });

  it("roundtrips with formatRupiahInput", () => {
    const formatted = formatRupiahInput("25000000");
    expect(parseRupiah(formatted)).toBe(25000000);
  });

  it("handles null-ish input", () => {
    expect(parseRupiah(null as unknown as string)).toBe(0);
    expect(parseRupiah(undefined as unknown as string)).toBe(0);
  });
});
