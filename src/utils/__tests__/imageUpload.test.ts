import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { prepareImageForUpload } from "../imageUpload";

jest.mock("expo-file-system", () => ({
  File: jest.fn(),
}));

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { WEBP: "webp" },
}));

describe("prepareImageForUpload", () => {
  const resize = jest.fn();
  const saveAsync = jest.fn();
  const renderAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    saveAsync.mockResolvedValue({
      uri: "file:///cache/photo.webp",
      width: 1600,
      height: 1067,
    });
    renderAsync.mockResolvedValue({ saveAsync });
    (ImageManipulator.manipulate as jest.Mock).mockReturnValue({
      resize,
      renderAsync,
    });
    (File as unknown as jest.Mock).mockImplementation(() => ({
      exists: true,
      size: 456_789,
    }));
  });

  it("resizes and encodes an uploaded image as compressed WebP", async () => {
    const result = await prepareImageForUpload(
      {
        uri: "file:///camera/photo.HEIC",
        fileName: "photo.HEIC",
        width: 4032,
        height: 3024,
      },
      { compress: 0.8, maxWidth: 1600 },
    );

    expect(ImageManipulator.manipulate).toHaveBeenCalledWith(
      "file:///camera/photo.HEIC",
    );
    expect(resize).toHaveBeenCalledWith({ width: 1600 });
    expect(saveAsync).toHaveBeenCalledWith({
      compress: 0.8,
      format: SaveFormat.WEBP,
    });
    expect(result).toEqual({
      uri: "file:///cache/photo.webp",
      fileName: "photo.webp",
      mimeType: "image/webp",
      width: 1600,
      height: 1067,
      fileSize: 456_789,
    });
  });

  it("keeps smaller dimensions while still encoding WebP", async () => {
    await prepareImageForUpload({
      uri: "file:///camera/small.jpg",
      fileName: "small.jpg",
      width: 1200,
      height: 800,
    });

    expect(resize).not.toHaveBeenCalled();
    expect(saveAsync).toHaveBeenCalledWith({
      compress: 0.8,
      format: SaveFormat.WEBP,
    });
  });

  it("rejects an empty conversion result", async () => {
    (File as unknown as jest.Mock).mockImplementation(() => ({
      exists: false,
      size: 0,
    }));

    await expect(
      prepareImageForUpload({ uri: "file:///camera/photo.jpg" }),
    ).rejects.toThrow("Gagal menyiapkan foto WebP");
  });
});
