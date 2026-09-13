import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export const WEBP_MIME_TYPE = "image/webp";

export type ImageUploadSource = {
  uri: string;
  fileName?: string | null;
  width?: number;
  height?: number;
};

export type PreparedWebPImage = {
  uri: string;
  fileName: string;
  mimeType: typeof WEBP_MIME_TYPE;
  width: number;
  height: number;
  fileSize: number;
};

type PrepareImageOptions = {
  compress?: number;
  maxWidth?: number;
  fallbackName?: string;
};

function toWebPFileName(fileName: string | null | undefined, fallback: string) {
  const cleanName = fileName?.split(/[?#]/, 1)[0]?.trim();
  const baseName = cleanName
    ? cleanName.replace(/\.[^./\\]+$/, "")
    : fallback;

  return `${baseName || fallback}.webp`;
}

/**
 * Creates a new, compressed WebP file in Expo's cache directory. The source
 * file is left untouched and the returned metadata always describes the file
 * that must be sent to the upload endpoint.
 */
export async function prepareImageForUpload(
  source: ImageUploadSource,
  options: PrepareImageOptions = {},
): Promise<PreparedWebPImage> {
  const {
    compress = 0.8,
    maxWidth = 1600,
    fallbackName = `image-${Date.now()}`,
  } = options;

  if (!source.uri) {
    throw new Error("Foto tidak memiliki lokasi file yang valid.");
  }

  const context = ImageManipulator.manipulate(source.uri);
  if (source.width != null && source.width > maxWidth) {
    context.resize({ width: maxWidth });
  }

  const renderedImage = await context.renderAsync();
  const result = await renderedImage.saveAsync({
    compress,
    format: SaveFormat.WEBP,
  });
  const outputFile = new File(result.uri);

  if (!outputFile.exists || outputFile.size <= 0) {
    throw new Error("Gagal menyiapkan foto WebP untuk diunggah.");
  }

  return {
    uri: result.uri,
    fileName: toWebPFileName(source.fileName, fallbackName),
    mimeType: WEBP_MIME_TYPE,
    width: result.width,
    height: result.height,
    fileSize: outputFile.size,
  };
}
