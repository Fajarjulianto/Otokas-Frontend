import { api, extractData } from "@/src/lib/api";
import {
  checkoutSubscription,
  fetchSubscriptionStatus,
} from "../subscriptionServices";

jest.mock("@/src/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
  extractData: jest.fn((r) => r.data?.data ?? r.data),
}));

describe("subscriptionServices", () => {
  afterEach(() => jest.clearAllMocks());

  describe("checkoutSubscription", () => {
    it("sends POST /subscription/checkout and returns a Xendit invoice", async () => {
      const co = {
        invoice_id: "inv1",
        invoice_url: "https://checkout.xendit.co/web/inv1",
        external_id: "TENANT_SUB_x",
        status: "PENDING",
      };
      (api.post as jest.Mock).mockResolvedValue({ data: { data: co } });
      (extractData as jest.Mock).mockReturnValue(co);
      const r = await checkoutSubscription({
        paymentMethod: "qris",
        channelCode: "qris",
      });
      expect(api.post).toHaveBeenCalledWith("/subscription/checkout", {
        paymentMethod: "qris",
        channelCode: "qris",
      });
      expect(r.invoice_url).toBe("https://checkout.xendit.co/web/inv1");
      expect(r.external_id).toBe("TENANT_SUB_x");
    });
  });

  describe("fetchSubscriptionStatus", () => {
    it("maps PREMIUM/ACTIVE to isPremium=true", async () => {
      const s = { tier: "PREMIUM", status: "ACTIVE", expiresAt: null };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: s } });
      (extractData as jest.Mock).mockReturnValue(s);
      const r = await fetchSubscriptionStatus();
      expect(r.isPremium).toBe(true);
      expect(r.plan).toBe("Juragan");
    });

    it("returns default free when null", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: null });
      (extractData as jest.Mock).mockReturnValue(null);
      const r = await fetchSubscriptionStatus();
      expect(r).toEqual({
        tier: "FREE",
        status: "INACTIVE",
        expiresAt: null,
        tenantId: undefined,
        subdomain: undefined,
        isPremium: false,
        plan: "Gratis",
      });
    });

    it("returns default free when empty object", async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: {} });
      (extractData as jest.Mock).mockReturnValue({});
      const r = await fetchSubscriptionStatus();
      expect(r.isPremium).toBe(false);
    });
  });
});
