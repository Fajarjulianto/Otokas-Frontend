import type { AxiosResponse } from "axios";

import { extractData } from "../api";

// ── Mock secureToken before importing api ──
jest.mock("@/src/lib/secureToken", () => ({
  getToken: jest.fn().mockResolvedValue(null),
  saveToken: jest.fn().mockResolvedValue(undefined),
  deleteToken: jest.fn().mockResolvedValue(undefined),
}));

describe("extractData", () => {
  it("extracts nested data (response.data.data pattern)", () => {
    const response = {
      data: {
        data: { id: "1", name: "Vario 150" },
        message: "Success",
      },
    } as AxiosResponse;

    const result = extractData<{ id: string; name: string }>(response);
    expect(result).toEqual({ id: "1", name: "Vario 150" });
  });

  it("extracts flat data when nested data is absent", () => {
    const response = {
      data: { id: "2", name: "Beat" },
    } as AxiosResponse;

    const result = extractData<{ id: string; name: string }>(response);
    expect(result).toEqual({ id: "2", name: "Beat" });
  });

  it("returns null when data is null", () => {
    const response = { data: null } as AxiosResponse;
    const result = extractData(response);
    expect(result).toBeNull();
  });

  it("returns undefined when data is undefined", () => {
    const response = { data: undefined } as AxiosResponse;
    const result = extractData(response);
    expect(result).toBeUndefined();
  });

  it("extracts array data", () => {
    const response = {
      data: {
        data: [
          { id: "1", name: "Vario" },
          { id: "2", name: "Beat" },
        ],
      },
    } as AxiosResponse;

    const result = extractData<{ id: string; name: string }[]>(response);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Vario");
  });

  it("prefers data.data over data when both exist", () => {
    const response = {
      data: {
        data: { source: "nested" },
        source: "flat",
      },
    } as AxiosResponse;

    const result = extractData<{ source: string }>(response);
    expect(result.source).toBe("nested");
  });
});
