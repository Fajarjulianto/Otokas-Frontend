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

export type CheckoutSubscriptionPayload = {
  paymentMethod?: string;
  channelCode?: string;
};

function decorateStatus(
  raw: Partial<SubscriptionStatus> | null | undefined,
): SubscriptionStatus {
  const tier = (raw?.tier ?? "FREE") as SubscriptionTier;
  const status = (raw?.status ?? "INACTIVE") as SubscriptionState;
  const isPremium =
    tier === "PREMIUM" &&
    status === "ACTIVE" &&
    (!raw?.expiresAt || new Date(raw.expiresAt).getTime() > Date.now());
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
export async function checkoutSubscription(
  payload: CheckoutSubscriptionPayload = {},
): Promise<CheckoutResponse> {
  const response = await api.post("/subscription/checkout", payload);
  return extractData<CheckoutResponse>(response);
}

// ── Get Subscription Status
export async function fetchSubscriptionStatus(
  signal?: AbortSignal,
): Promise<SubscriptionStatus> {
  const response = await api.get("/subscription/status", { signal });
  const data = extractData<Partial<SubscriptionStatus>>(response);

  if (!data || Object.keys(data).length === 0) {
    return decorateStatus(null);
  }

  return decorateStatus(data);
}
