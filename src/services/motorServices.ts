import { api } from "@/src/lib/api";
import { Motor, MotorImage, MotorStatus } from "../types/motor";
import type { DashboardStats } from "../types/report";
import type { OcrResult } from "../types/scan";

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

function inferFileName(file: LocalMotorImageFile, index: number): string {
  if (file.fileName?.trim()) {
    return file.fileName.trim();
  }

  const uriSegment = file.uri.split("/").pop();
  if (uriSegment) {
    return uriSegment;
  }

  return `motor-image-${Date.now()}-${index}.jpg`;
}

function inferMimeType(file: LocalMotorImageFile): string {
  if (file.mimeType?.trim()) {
    return file.mimeType;
  }

  const fileName = file.fileName?.toLowerCase() ?? file.uri.toLowerCase();
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";

  return "image/jpeg";
}

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
  const fileResponse = await fetch(fileUri);
  if (!fileResponse.ok && fileResponse.ok !== undefined) {
    throw new Error("Gagal membaca file foto dari perangkat.");
  }

  const blob = await fileResponse.blob();
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": mimeType,
    },
  });

  if (!uploadRes.ok) {
    throw new Error("Gagal mengunggah foto ke server penyimpanan.");
  }
}

// ── STNK scan: Step 3 — AI batch scan (README §2) ──
export async function scanWithUploadedPaths(
  files: { filePath: string; mimeType: string }[],
): Promise<OcrResult[]> {
  const response = await api.post("/motors/scan-batch", { files });
  return response.data?.data || response.data;
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

  const preparedFiles = files.map((file, index) => ({
    fileName: inferFileName(file, index),
    mimeType: inferMimeType(file),
  }));

  const uploads = await getMotorImageUploadUrls(motorId, preparedFiles);
  if (
    uploads.length !== files.length ||
    uploads.some((upload) => !upload?.uploadUrl || !upload.filePath)
  ) {
    throw new Error("Server tidak mengembalikan URL upload foto yang lengkap.");
  }

  await Promise.all(
    files.map((file, index) =>
      uploadFileToGCS(
        uploads[index].uploadUrl,
        file.uri,
        preparedFiles[index].mimeType,
      ),
    ),
  );

  const images: MotorImage[] = [
    ...existingImages,
    ...uploads.map((upload, index) => ({
      storageKey: upload.filePath,
      url: toPublicAssetUrl(upload.uploadUrl),
      width: files[index].width,
      height: files[index].height,
      size: files[index].fileSize ?? undefined,
    })),
  ];

  return replaceMotorImages(motorId, images);
}
