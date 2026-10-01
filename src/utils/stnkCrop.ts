export type Rect = { x: number; y: number; width: number; height: number };

/** Map a centered aspect-fill camera preview onto an orientation-corrected photo. */
export function stnkCrop(
  photo: { width: number; height: number },
  preview: Rect,
  frame: Rect,
) {
  if (
    ![
      photo.width,
      photo.height,
      preview.width,
      preview.height,
      frame.width,
      frame.height,
    ].every((n) => Number.isFinite(n) && n > 0)
  ) {
    throw new Error("Frame kamera belum siap. Ambil ulang foto.");
  }
  const x = frame.x - preview.x;
  const y = frame.y - preview.y;
  if (
    x < 0 ||
    y < 0 ||
    x + frame.width > preview.width + 1 ||
    y + frame.height > preview.height + 1
  ) {
    throw new Error("Frame berada di luar kamera. Ambil ulang foto.");
  }
  const scale = Math.max(
    preview.width / photo.width,
    preview.height / photo.height,
  );
  const originX = Math.round(
    (x + (photo.width * scale - preview.width) / 2) / scale,
  );
  const originY = Math.round(
    (y + (photo.height * scale - preview.height) / 2) / scale,
  );
  const width = Math.min(
    Math.round(frame.width / scale),
    photo.width - originX,
  );
  const height = Math.min(
    Math.round(frame.height / scale),
    photo.height - originY,
  );
  if (width < 32 || height < 32)
    throw new Error("Hasil crop terlalu kecil. Ambil ulang foto.");
  return { originX, originY, width, height };
}
