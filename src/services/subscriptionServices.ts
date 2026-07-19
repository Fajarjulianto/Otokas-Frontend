import { api, extractData } from "@/src/lib/api";

export type SubscriptionTier = "FREE" | "PREMIUM";
export type SubscriptionState = "ACTIVE" | "PENDING" | "INACTIVE";

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  status: SubscriptionState;
  expiresAt: string | null;
  tenantId?: string;
  subdomain?: string;
  isPremium: boolean;
  plan: string;
};

export type CheckoutResponse = {
  invoice_id: string;
  invoice_url: string;
  external_id: string;
  status: string;
};

function decorateStatus(
  raw: Partial<SubscriptionStatus> | null | undefined,
): SubscriptionStatus {
  const tier = (raw?.tier ?? "FREE") as SubscriptionTier;
  const status = (raw?.status ?? "INACTIVE") as SubscriptionState;
  const isPremium = tier === "PREMIUM" && status === "ACTIVE";
  return {
    tier,
    status,
    expiresAt: raw?.expiresAt ?? null,
    tenantId: raw?.tenantId,
    subdomain: raw?.subdomain,
    isPremium,
    plan: isPremium ? "Juragan" : "Gratis",
  };
}

// ── Start checkout
export async function checkoutSubscription(): Promise<CheckoutResponse> {
  const response = await api.post("/subscription/checkout");
  return extractData<CheckoutResponse>(response);
}

// ── Get Subscription Status
export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await api.get("/subscription/status");
  const data = extractData<Partial<SubscriptionStatus>>(response);

  if (!data || Object.keys(data).length === 0) {
    return decorateStatus(null);
  }

  return decorateStatus(data);
}

export async function checkoutNotificationSubscription(): Promise<CheckoutResponse> {
  const response = await api.post("/subscription/notification");
  return extractData<CheckoutResponse>(response);
}
