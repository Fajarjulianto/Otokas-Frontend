import { motorKeys } from "../useMotors";

describe("motorKeys", () => {
  it("returns correct all key", () => {
    expect(motorKeys.all).toEqual(["motors"]);
  });

  it("returns correct detail key with id", () => {
    expect(motorKeys.detail("m-123")).toEqual(["motors", "detail", "m-123"]);
  });

  it("returns correct stats key with month", () => {
    expect(motorKeys.stats("06-2026")).toEqual(["motors", "stats", "06-2026"]);
  });

  it('returns stats key with "current" when no month', () => {
    expect(motorKeys.stats()).toEqual(["motors", "stats", "current"]);
  });

  it("keys are readonly tuples", () => {
    const all = motorKeys.all;
    expect(Object.isFrozen(all)).toBe(true);
  });
});
