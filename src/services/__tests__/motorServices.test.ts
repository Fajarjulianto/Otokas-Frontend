// ── Mocks ──
import { api } from "@/src/lib/api";
import {
  fetchMotors,
  fetchMotorById,
  insertMotor,
  bulkInsertMotors,
  updateMotor,
  markAsSold,
  deleteMotor,
  fetchDashboardStats,
  getUploadUrls,
  uploadFileToGCS,
  scanWithUploadedPaths,
} from "../motorServices";

jest.mock("@/src/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock global fetch for uploadFileToGCS
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("motorServices", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── fetchMotors ──
  describe("fetchMotors", () => {
    it("sends GET /motors without status filter by default", async () => {
      const motors = [
        { id: "1", brand: "Honda", name: "Vario" },
        { id: "2", brand: "Yamaha", name: "NMAX" },
      ];
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: motors },
      });

      const result = await fetchMotors();
      expect(api.get).toHaveBeenCalledWith("/motors", {
        params: undefined,
      });
      expect(result).toEqual(motors);
    });

    it("sends GET /motors with status filter when provided", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
      await fetchMotors("SOLD");
      expect(api.get).toHaveBeenCalledWith("/motors", {
        params: { status: "SOLD" },
      });
    });

    it("returns empty array when data is null", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: null } });
      const result = await fetchMotors();
      expect(result).toEqual([]);
    });

    it("returns empty array when response.data is null", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: null });
      const result = await fetchMotors();
      expect(result).toEqual([]);
    });
  });

  // ── fetchMotorById ──
  describe("fetchMotorById", () => {
    it("sends GET /motors/:id", async () => {
      const motor = { id: "m1", brand: "Honda", name: "Beat" };
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: motor },
      });

      const result = await fetchMotorById("m1");
      expect(api.get).toHaveBeenCalledWith("/motors/m1");
      expect(result).toEqual(motor);
    });
  });

  // ── insertMotor ──
  describe("insertMotor", () => {
    it("sends POST /motors with motor payload", async () => {
      const newMotor = {
        brand: "Honda",
        name: "Vario 150",
        year: 2024,
        buyingPrice: 15000000,
        isIncomplete: false,
      };
      const created = { id: "new-1", ...newMotor, isSold: false };
      (api.post as jest.Mock).mockResolvedValue({
        data: { data: created },
      });

      const result = await insertMotor(newMotor);
      expect(api.post).toHaveBeenCalledWith("/motors", newMotor);
      expect(result.id).toBe("new-1");
    });
  });

  // ── bulkInsertMotors ──
  describe("bulkInsertMotors", () => {
    it("sends POST /motors/bulk with array", async () => {
      const motors = [
        { brand: "Honda", name: "Beat", buyingPrice: 12000000, isIncomplete: false },
        { brand: "Yamaha", name: "Mio", buyingPrice: 10000000, isIncomplete: false },
      ];
      (api.post as jest.Mock).mockResolvedValue({
        data: { data: { message: "Motors successfully imported", count: 2 } },
      });

      const result = await bulkInsertMotors(motors);
      expect(api.post).toHaveBeenCalledWith("/motors/bulk", { motors });
      expect(result.count).toBe(2);
    });
  });

  // ── updateMotor ──
  describe("updateMotor", () => {
    it("sends PATCH /motors/:id with updates", async () => {
      const updated = { id: "m1", brand: "Honda", name: "Vario 160" };
      (api.patch as jest.Mock).mockResolvedValue({
        data: { data: updated },
      });

      const result = await updateMotor("m1", { name: "Vario 160" });
      expect(api.patch).toHaveBeenCalledWith("/motors/m1", {
        name: "Vario 160",
      });
      expect(result.name).toBe("Vario 160");
    });
  });

  // ── markAsSold ──
  describe("markAsSold", () => {
    it("sends PATCH /motors/:id/sold", async () => {
      (api.patch as jest.Mock).mockResolvedValue({});
      await markAsSold("m1");
      expect(api.patch).toHaveBeenCalledWith("/motors/m1/sold");
    });
  });

  // ── deleteMotor ──
  describe("deleteMotor", () => {
    it("sends DELETE /motors/:id", async () => {
      (api.delete as jest.Mock).mockResolvedValue({});
      await deleteMotor("m1");
      expect(api.delete).toHaveBeenCalledWith("/motors/m1");
    });
  });

  // ── fetchDashboardStats ──
  describe("fetchDashboardStats", () => {
    it("sends GET /dashboard/stats without month", async () => {
      const stats = {
        stock: 10,
        sold: 5,
        currentMonthProfit: 32500000,
        currentMonthRevenue: 50000000,
        marginAverage: 12.4,
      };
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: stats },
      });

      const result = await fetchDashboardStats();
      expect(api.get).toHaveBeenCalledWith("/dashboard/stats", {
        params: undefined,
      });
      expect(result.stock).toBe(10);
    });

    it("sends GET /dashboard/stats with month param", async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: { stock: 3 } },
      });

      await fetchDashboardStats("06-2026");
      expect(api.get).toHaveBeenCalledWith("/dashboard/stats", {
        params: { month: "06-2026" },
      });
    });
  });

  // ── getUploadUrls ──
  describe("getUploadUrls", () => {
    it("sends POST /motors/scan/upload-urls and extracts uploads", async () => {
      const uploads = [
        { uploadUrl: "https://storage.example.com/1", filePath: "path/1.jpg" },
      ];
      (api.post as jest.Mock).mockResolvedValue({
        data: { data: { uploads } },
      });

      const files = [{ fileName: "photo.jpg", mimeType: "image/jpeg" }];
      const result = await getUploadUrls(files);
      expect(api.post).toHaveBeenCalledWith("/motors/scan/upload-urls", {
        files,
      });
      expect(result).toEqual(uploads);
    });

    it("falls back to response.data.uploads when nested is absent", async () => {
      const uploads = [
        { uploadUrl: "https://storage.example.com/2", filePath: "path/2.jpg" },
      ];
      (api.post as jest.Mock).mockResolvedValue({
        data: { uploads },
      });

      const result = await getUploadUrls([
        { fileName: "x.jpg", mimeType: "image/jpeg" },
      ]);
      expect(result).toEqual(uploads);
    });
  });

  // ── uploadFileToGCS ──
  describe("uploadFileToGCS", () => {
    it("fetches the file and PUTs blob to upload URL", async () => {
      const blob = new Blob(["image-data"]);
      mockFetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(blob) }) // fetch fileUri
        .mockResolvedValueOnce({ ok: true }); // PUT to GCS

      await uploadFileToGCS(
        "https://storage.example.com/upload",
        "file:///photo.jpg",
        "image/jpeg"
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, "file:///photo.jpg");
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://storage.example.com/upload",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
        })
      );
    });

    it("throws when GCS upload fails", async () => {
      const blob = new Blob(["data"]);
      mockFetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(blob) })
        .mockResolvedValueOnce({ ok: false });

      await expect(
        uploadFileToGCS("https://gcs.example.com", "file:///x.jpg")
      ).rejects.toThrow("Gagal mengunggah foto ke server penyimpanan.");
    });
  });

  // ── scanWithUploadedPaths ──
  describe("scanWithUploadedPaths", () => {
    it("sends POST /motors/scan-batch with file paths", async () => {
      const ocrResults = [{ nomor_polisi: "BE 1234" }];
      (api.post as jest.Mock).mockResolvedValue({
        data: { data: ocrResults },
      });

      const files = [{ filePath: "path/1.jpg", mimeType: "image/jpeg" }];
      const result = await scanWithUploadedPaths(files);
      expect(api.post).toHaveBeenCalledWith("/motors/scan-batch", { files });
      expect(result).toEqual(ocrResults);
    });
  });
});
