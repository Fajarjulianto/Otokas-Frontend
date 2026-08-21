import { api, extractData } from "@/src/lib/api";
import type {
  BannerUploadUrlResponse,
  ConfirmTenantBannerPayload,
  CreateTenantPayload,
  LandingConfigResponse,
  PublicTenantMotorsResponse,
  Tenant,
  UpdateBrandingPayload,
  UpdateLandingConfigPayload,
} from "@/src/types/tenants";

// ── Create tenant
export async function createTenant(
  payload: CreateTenantPayload,
): Promise<Tenant> {
  const response = await api.post("/tenants", payload);
  return extractData<Tenant>(response);
}

// ── Update landing config
export async function updateLandingConfig(
  payload: UpdateLandingConfigPayload,
): Promise<LandingConfigResponse> {
  const response = await api.patch("/tenants/landing-config", payload);
  return extractData<LandingConfigResponse>(response);
}

// ── Update branding
export async function updateBranding(
  payload: UpdateBrandingPayload,
): Promise<Tenant> {
  const response = await api.patch("/tenants/branding", payload);
  return extractData<Tenant>(response);
}

export async function getTenantBannerUploadUrl(payload: {
  fileName: string;
  mimeType: string;
}): Promise<BannerUploadUrlResponse> {
  const response = await api.post("/tenants/banner/upload-url", payload);
  return extractData<BannerUploadUrlResponse>(response);
}

export async function confirmTenantBanner(
  payload: ConfirmTenantBannerPayload,
): Promise<Tenant> {
  const response = await api.post("/tenants/banner/confirm", payload);
  return extractData<Tenant>(response);
}

// ── Public: tenant profile
export async function fetchPublicTenant(subdomain: string): Promise<Tenant> {
  const response = await api.get(`/public/tenants/${subdomain}`);
  return extractData<Tenant>(response);
}

// ── Public: landing content
export async function fetchPublicLandingContent(
  subdomain: string,
): Promise<LandingConfigResponse> {
  const response = await api.get(
    `/public/tenants/${subdomain}/landing-content`,
  );
  return extractData<LandingConfigResponse>(response);
}

export async function fetchPublicTenantMotors(
  subdomain: string,
  page = 1,
  limit = 20,
): Promise<PublicTenantMotorsResponse> {
  const response = await api.get(`/public/tenants/${subdomain}/motors`, {
    params: { page, limit },
  });
  return extractData<PublicTenantMotorsResponse>(response);
}

export async function searchPublicTenantMotors(
  subdomain: string,
  q: string,
  page = 1,
  limit = 20,
): Promise<PublicTenantMotorsResponse> {
  const response = await api.get(`/public/tenants/${subdomain}/search`, {
    params: { q, page, limit },
  });
  return extractData<PublicTenantMotorsResponse>(response);
}
