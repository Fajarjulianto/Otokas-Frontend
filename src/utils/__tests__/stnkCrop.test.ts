import { stnkCrop } from "../stnkCrop";
describe("STNK preview crop", () => {
  it("maps the center of a portrait aspect-fill preview", () => {
    expect(
      stnkCrop(
        { width: 3000, height: 4000 },
        { x: 0, y: 0, width: 300, height: 600 },
        { x: 30, y: 180, width: 240, height: 150 },
      ),
    ).toEqual({ originX: 700, originY: 1200, width: 1600, height: 1000 });
  });
  it("accounts for safe-area offsets and landscape photos", () => {
    expect(
      stnkCrop(
        { width: 4000, height: 3000 },
        { x: 10, y: 40, width: 800, height: 400 },
        { x: 90, y: 120, width: 640, height: 240 },
      ),
    ).toEqual({ originX: 400, originY: 900, width: 3200, height: 1200 });
  });
  it("rejects invalid or out-of-bounds frames instead of uploading an uncropped photo", () => {
    expect(() =>
      stnkCrop(
        { width: 3000, height: 4000 },
        { x: 0, y: 0, width: 0, height: 600 },
        { x: 0, y: 0, width: 10, height: 10 },
      ),
    ).toThrow();
    expect(() =>
      stnkCrop(
        { width: 3000, height: 4000 },
        { x: 0, y: 0, width: 300, height: 600 },
        { x: -20, y: 0, width: 240, height: 150 },
      ),
    ).toThrow();
  });
});
