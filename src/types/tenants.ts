// Types for the Tenant module (see README §7 & §8).

export type Tenant = {
  id?: string;
  name: string;
  subdomain: string;
  fullDomain: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  templateKey?: string;
  primaryColor?: string | null;
  whatsappNumber?: string | null;
};

export type BusinessHourItem = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

export type MotorDisplayConfig = {
  showPrice: boolean;
  showYear: boolean;
  showStatus: boolean;
  showKilometer: boolean;
  showTax: boolean;
};

export type TenantLocation = {
  city?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type LandingContent = {
  whatsappNumber?: string | null;
  location?: TenantLocation;
  businessHours?: { items: BusinessHourItem[] };
  motorDisplay?: MotorDisplayConfig;
  subdomain?: string;
  templateKey?: string;
};

export type LandingConfigResponse = {
  tenant: Tenant;
  content: LandingContent;
  schemaVersion: string;
};

export type CreateTenantPayload = {
  name: string;
  subdomain: string;
};

export type UpdateLandingConfigPayload = {
  templateKey?: string;
  whatsappNumber?: string | null;
  subdomain?: string;
  location?: TenantLocation;
  motorDisplay?: MotorDisplayConfig;
};

export type UpdateBrandingPayload = {
  primaryColor?: string | null;
};

export type BannerUploadUrlResponse = {
  uploadUrl: string;
  filePath: string;
};

export type ConfirmTenantBannerPayload = {
  storageKey: string;
  url: string;
  width?: number;
  height?: number;
  size?: number;
};

// Public tenant listing types (README §8)
export type PublicMotor = {
  id: string;
  title: string;
  brand: string;
  price: number | null;
  year: number | null;
  status: string | null;
  kilometer: number | null;
  tax: boolean | string | null;
  imageUrl: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  from: number;
  to: number;
};

export type PublicTenantMotorsResponse = {
  tenant: Tenant;
  motors: PublicMotor[];
  pagination: Pagination;
};
