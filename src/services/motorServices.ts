import { api } from "@/src/lib/api";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { Motor, MotorImage, MotorStatus } from "../types/motor";
import type { DashboardStats } from "../types/report";
import type { OcrResult } from "../types/scan";
import {
  prepareImageForUpload,
  type PreparedWebPImage,
} from "../utils/imageUpload";
import { normalizeScanResult } from "../utils/scanMotor";

// Payload accepted by POST /motors and POST /motors/bulk (README §2 & §3).
export type MotorInsert = {
  brand: string;
  name: string;
  buyingPrice: number;
  isIncomplete: boolean;
  frameNumber?: string;
  engineNumber?: string;
  stnkCode?: string;
  category?: Motor["category"];
  year?: number;
  plateNumber?: string;
  color?: string;
  displacement?: number;
  kilometer?: number;
  tax?: Motor["tax"];
  sellingPrice?: number;
};

// ── Fetch semua motor (README: optional ?status= filter) ──
export async function fetchMotors(status?: MotorStatus): Promise<Motor[]> {
  const response = await api.get("/motors", {
    params: status ? { status } : undefined,
  });
  return response.data?.data || [];
}

// ── Fetch satu motor by ID ──
export async function fetchMotorById(motorId: string): Promise<Motor> {
  const response = await api.get(`/motors/${motorId}`);
  return response.data?.data;
}

// ── Tambah motor baru ──
export async function insertMotor(motor: MotorInsert): Promise<Motor> {
  const response = await api.post("/motors", motor);
  return response.data?.data;
}

// ── Bulk tambah motor (Premium) ──
export async function bulkInsertMotors(
  motors: MotorInsert[],
): Promise<{ message: string; count: number }> {
  const response = await api.post("/motors/bulk", { motors });
  return response.data?.data ?? response.data;
}

// ── Update data motor ──
export async function updateMotor(
  motorId: string,
  updates: Partial<MotorInsert>,
): Promise<Motor> {
  const response = await api.patch(`/motors/${motorId}`, updates);
  return response.data?.data;
}

// ── Tandai motor terjual ──
export async function markAsSold(motorId: string): Promise<void> {
  await api.patch(`/motors/${motorId}/sold`);
}

// ── Hapus motor ──
export async function deleteMotor(motorId: string): Promise<void> {
  await api.delete(`/motors/${motorId}`);
}

// ── Statistik dashboard (README §5) ──
export async function fetchDashboardStats(
  month?: string,
): Promise<DashboardStats> {
  const response = await api.get("/dashboard/stats", {
    params: month ? { month } : undefined,
  });

  return response.data?.data;
}

export type UploadUrlResponse = {
  uploadUrl: string;
  filePath: string;
  mimeType?: string;
};

export type LocalMotorImageFile = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
  fileSize?: number | null;
};

function toPublicAssetUrl(uploadUrl: string): string {
  try {
    const parsedUrl = new URL(uploadUrl);
    parsedUrl.search = "";
    parsedUrl.hash = "";
    return parsedUrl.toString();
  } catch {
    return uploadUrl.split("?")[0];
  }
}

// ── STNK scan:
export async function getUploadUrls(
  files: { fileName: string; mimeType: string }[],
): Promise<UploadUrlResponse[]> {
  const response = await api.post("/motors/scan/upload-urls", { files });

  return response.data?.data?.uploads || response.data?.uploads || [];
}

// ── STNK scan: Step 2
export async function uploadFileToGCS(
  uploadUrl: string,
  fileUri: string,
  mimeType: string = "image/jpeg",
): Promise<void> {
  const file = new File(fileUri);
  if (!file.exists || file.size <= 0) {
    throw new Error("Gagal membaca file foto dari perangkat.");
  }

  let uploadRes: Response;
  try {
    uploadRes = await expoFetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": mimeType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/resolve host|no address|dns|network request failed/i.test(message)) {
      throw new Error(
        "Tidak dapat terhubung ke Google Storage. Periksa koneksi internet, Private DNS, atau VPN perangkat.",
      );
    }

    throw error;
  }

  if (!uploadRes.ok) {
    throw new Error("Gagal mengunggah foto ke server penyimpanan.");
  }
}

// ── STNK scan: Step 3 — AI batch scan (README §2) ──
export async function scanWithUploadedPaths(
  files: { filePath: string; mimeType: string }[],
): Promise<OcrResult[]> {
  // OCR/AI can take considerably longer than regular CRUD requests. Keep the
  // global API timeout short, but allow this endpoint enough time to finish.
  const response = await api.post(
    "/motors/scan-batch",
    { files },
    { timeout: 120_000 },
  );
  const responseData: unknown = response.data?.data ?? response.data;
  const rawResults = Array.isArray(responseData) ? responseData : [responseData];

  return rawResults
    .map(normalizeScanResult)
    .filter((result): result is OcrResult => result !== null);
}

// ── Motor images: get presigned upload URLs (README §3) ──
export async function getMotorImageUploadUrls(
  motorId: string,
  files: { fileName: string; mimeType: string }[],
): Promise<UploadUrlResponse[]> {
  const response = await api.post(`/motors/${motorId}/images/upload-urls`, {
    files,
  });
  return response.data?.data?.uploads || response.data?.uploads || [];
}

// ── Motor images:
export async function replaceMotorImages(
  motorId: string,
  images: MotorImage[],
): Promise<Motor> {
  const payload = images.map(({ storageKey, url, width, height, size }) => ({
    storageKey,
    url,
    ...(width != null && { width }),
    ...(height != null && { height }),
    ...(size != null && { size }),
  }));
  const response = await api.patch(`/motors/${motorId}/images`, {
    images: payload,
  });
  return response.data?.data;
}

export async function uploadMotorImages(
  motorId: string,
  files: LocalMotorImageFile[],
  existingImages: MotorImage[] = [],
): Promise<Motor> {
  if (files.length === 0) {
    return fetchMotorById(motorId);
  }

  const preparedFiles: PreparedWebPImage[] = [];
  for (let index = 0; index < files.length; index += 1) {
    preparedFiles.push(
      await prepareImageForUpload(files[index], {
        compress: 0.8,
        maxWidth: 1600,
        fallbackName: `motor-image-${Date.now()}-${index}`,
      }),
    );
  }

  const uploads = await getMotorImageUploadUrls(
    motorId,
    preparedFiles.map(({ fileName, mimeType }) => ({ fileName, mimeType })),
  );
  if (
    uploads.length !== files.length ||
    uploads.some((upload) => !upload?.uploadUrl || !upload.filePath)
  ) {
    throw new Error("Server tidak mengembalikan URL upload foto yang lengkap.");
  }

  await Promise.all(
    preparedFiles.map((file, index) =>
      uploadFileToGCS(
        uploads[index].uploadUrl,
        file.uri,
        file.mimeType,
      ),
    ),
  );

  const images: MotorImage[] = [
    ...existingImages,
    ...uploads.map((upload, index) => ({
      storageKey: upload.filePath,
      url: toPublicAssetUrl(upload.uploadUrl),
      width: preparedFiles[index].width,
      height: preparedFiles[index].height,
      size: preparedFiles[index].fileSize,
    })),
  ];

  return replaceMotorImages(motorId, images);
}
