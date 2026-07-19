import { subscriptionKeys } from "../useSubscription";
import { userKeys } from "../useUser";
import { analyticsKeys } from "../useAnalytics";

describe("Query Key Factories", () => {
  describe("subscriptionKeys", () => {
    it("returns correct status key", () => {
      expect(subscriptionKeys.status).toEqual(["subscription", "status"]);
    });
  });

  describe("userKeys", () => {
    it("returns correct profile key", () => {
      expect(userKeys.profile).toEqual(["user", "profile"]);
    });
  });

  describe("analyticsKeys", () => {
    it("returns correct dailySelling key with date", () => {
      expect(analyticsKeys.dailySelling("23-06-2026")).toEqual([
        "analytics", "selling", "daily", "23-06-2026",
      ]);
    });

    it("returns correct weeklySelling key with date", () => {
      expect(analyticsKeys.weeklySelling("23-06-2026")).toEqual([
        "analytics", "selling", "weekly", "23-06-2026",
      ]);
    });

    it("returns correct incomingStock key with date", () => {
      expect(analyticsKeys.incomingStock("23-06-2026")).toEqual([
        "analytics", "incoming-stock", "23-06-2026",
      ]);
    });
  });
});
