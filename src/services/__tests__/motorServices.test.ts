// ── Mocks ──
import { api } from "@/src/lib/api";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { prepareImageForUpload } from "@/src/utils/imageUpload";
import {
  fetchMotors,
  fetchMotorById,
  insertMotor,
  bulkInsertMotors,
  updateMotor,
  markAsSold,
  deleteMotor,
  fetchDashboardStats,
  getMotorImageUploadUrls,
  getUploadUrls,
  uploadFileToGCS,
  uploadMotorImages,
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

jest.mock("expo-file-system", () => ({
  File: jest.fn(),
}));

jest.mock("expo/fetch", () => ({
  fetch: jest.fn(),
}));

jest.mock("@/src/utils/imageUpload", () => ({
  prepareImageForUpload: jest.fn(
    async (
      file: {
        uri: string;
        fileName?: string | null;
        width?: number;
        height?: number;
        fileSize?: number | null;
      },
      index: number,
    ) => ({
      uri: file.uri.replace(/\.[^./]+$/, ".webp"),
      fileName: (file.fileName ?? `motor-image-${index}.jpg`).replace(
        /\.[^./]+$/,
        ".webp",
      ),
      mimeType: "image/webp",
      width: file.width ?? 1600,
      height: file.height ?? 900,
      fileSize: file.fileSize ?? 1000,
    }),
  ),
}));

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

  describe("getMotorImageUploadUrls", () => {
    it("sends POST /motors/:id/images/upload-urls and extracts uploads", async () => {
      const uploads = [
        {
          uploadUrl:
            "https://storage.googleapis.com/bucket/motor-images/front.jpg?sig=123",
          filePath: "motor-images/front.jpg",
        },
      ];
      (api.post as jest.Mock).mockResolvedValue({
        data: { uploads },
      });

      const files = [{ fileName: "front.jpg", mimeType: "image/jpeg" }];
      const result = await getMotorImageUploadUrls("motor-1", files);

      expect(api.post).toHaveBeenCalledWith(
        "/motors/motor-1/images/upload-urls",
        { files },
      );
      expect(result).toEqual(uploads);
    });
  });

  // ── uploadFileToGCS ──
  describe("uploadFileToGCS", () => {
    it("uploads the local file as binary content with PUT", async () => {
      const localFile = {
        exists: true,
        size: 10,
      };
      (File as unknown as jest.Mock).mockImplementationOnce(() => localFile);
      (expoFetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await uploadFileToGCS(
        "https://storage.example.com/upload",
        "file:///photo.jpg",
        "image/jpeg",
      );

      expect(File).toHaveBeenCalledWith("file:///photo.jpg");
      expect(expoFetch).toHaveBeenCalledWith(
        "https://storage.example.com/upload",
        {
          method: "PUT",
          body: localFile,
          headers: { "Content-Type": "image/jpeg" },
        },
      );
    });

    it("throws when GCS upload fails", async () => {
      (File as unknown as jest.Mock).mockImplementationOnce(() => ({
        exists: true,
        size: 10,
      }));
      (expoFetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(
        uploadFileToGCS("https://gcs.example.com", "file:///x.jpg"),
      ).rejects.toThrow("Gagal mengunggah foto ke server penyimpanan.");
    });

    it("returns a clear message when the device cannot resolve GCS", async () => {
      (File as unknown as jest.Mock).mockImplementationOnce(() => ({
        exists: true,
        size: 10,
      }));
      (expoFetch as jest.Mock).mockRejectedValueOnce(
        new Error('Unable to resolve host "storage.googleapis.com"'),
      );

      await expect(
        uploadFileToGCS("https://gcs.example.com", "file:///x.jpg"),
      ).rejects.toThrow("Tidak dapat terhubung ke Google Storage");
    });

    it("throws when the local file cannot be read", async () => {
      (File as unknown as jest.Mock).mockImplementationOnce(() => ({
        exists: false,
        size: 0,
      }));

      await expect(
        uploadFileToGCS("https://gcs.example.com", "file:///missing.jpg"),
      ).rejects.toThrow("Gagal membaca file foto dari perangkat.");
    });
  });

  describe("uploadMotorImages", () => {
    it("uploads local files and replaces motor images with public URLs", async () => {
      (File as unknown as jest.Mock).mockImplementationOnce(() => ({
        exists: true,
        size: 12345,
      }));
      (expoFetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      (api.post as jest.Mock).mockResolvedValue({
        data: {
          uploads: [
            {
              uploadUrl:
                "https://storage.googleapis.com/public-bucket/motor-images/front.webp?X-Goog-Signature=abc",
              filePath: "motor-images/front.webp",
            },
          ],
        },
      });
      (api.patch as jest.Mock).mockResolvedValue({
        data: {
          data: {
            id: "motor-1",
            motorImages: [
              {
                storageKey: "motor-images/front.webp",
                url: "https://storage.googleapis.com/public-bucket/motor-images/front.webp",
              },
            ],
          },
        },
      });

      const result = await uploadMotorImages("motor-1", [
        {
          uri: "file:///front.jpg",
          fileName: "front.jpg",
          mimeType: "image/jpeg",
          width: 1200,
          height: 800,
          fileSize: 12345,
        },
      ]);

      expect(prepareImageForUpload).toHaveBeenCalledWith(
        expect.objectContaining({ uri: "file:///front.jpg" }),
        expect.objectContaining({ compress: 0.8, maxWidth: 1600 }),
      );
      expect(api.post).toHaveBeenCalledWith(
        "/motors/motor-1/images/upload-urls",
        {
          files: [{ fileName: "front.webp", mimeType: "image/webp" }],
        },
      );
      expect(File).toHaveBeenCalledWith("file:///front.webp");
      expect(expoFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { "Content-Type": "image/webp" },
        }),
      );
      expect(api.patch).toHaveBeenCalledWith("/motors/motor-1/images", {
        images: [
          {
            storageKey: "motor-images/front.webp",
            url: "https://storage.googleapis.com/public-bucket/motor-images/front.webp",
            width: 1200,
            height: 800,
            size: 12345,
          },
        ],
      });
      expect(result.id).toBe("motor-1");
    });
  });

  // ── scanWithUploadedPaths ──
  describe("scanWithUploadedPaths", () => {
    it("sends POST /motors/scan-batch with file paths", async () => {
      const ocrResults = [
        {
          brand: "Honda",
          name: "Beat",
          plateNumber: "BE 1234",
          year: "2021",
          displacement: "110",
        },
      ];
      (api.post as jest.Mock).mockResolvedValue({
        data: { data: ocrResults },
      });

      const files = [{ filePath: "path/1.jpg", mimeType: "image/jpeg" }];
      const result = await scanWithUploadedPaths(files);
      expect(api.post).toHaveBeenCalledWith(
        "/motors/scan-batch",
        { files },
        { timeout: 120_000 },
      );
      expect(result).toEqual([
        expect.objectContaining({
          brand: "Honda",
          name: "Beat",
          plateNumber: "BE 1234",
          year: 2021,
          displacement: 110,
        }),
      ]);
    });
  });
});
