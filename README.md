# Otokas API

## Description

Otokas API is a NestJS backend for motorcycle dealer operations. It handles user authentication, vehicle inventory (motors), analytics reports, Xendit-based subscriptions, dealer landing pages (tenants), and signed download URLs for app distribution. It includes AI-powered STNK (vehicle registration) scanning via Google Gemini with batch image upload through Google Cloud Storage presigned URLs.

## Status

Active Development

## Prerequisites

- **Node.js:** v18.0.0+
- **PostgreSQL** — primary database
- **Redis** — required for BullMQ job queue (email, scanning)
- **External Services:** Google Cloud Storage, Google Gemini API, Xendit, SMTP

## Installation

```bash
npm install
```

Create a `.env` file:

```env
PORT=8080
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/otokas?schema=public"
JWT_ACCESS_SECRET="your_jwt_access_secret"
JWT_REFRESH_SECRET="your_jwt_refresh_secret"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user"
SMTP_PASS="pass"
SMTP_FROM="\"No Reply\" <noreply@example.com>"
XENDIT_SECRET_KEY="your_xendit_secret_key"
XENDIT_CALLBACK_TOKEN="your_xendit_callback_token"
XENDIT_API_BASE_URL="https://api.xendit.co"
SUBSCRIPTION_AMOUNT=200000
SUBSCRIPTION_DURATION_DAYS=30
GOOGLE_CLOUD_PROJECT_ID="your_gcp_project_id"
STNK_GCS_BUCKET_NAME="your_stnk_upload_bucket"
MOTOR_GCS_BUCKET_NAME="your_motor_image_bucket"
GCS_APP_BUCKET_NAME="your_gcs_app_bucket_name"
OTOKAS_APP_FILENAME="Otokas.apk"
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
BASE_DOMAIN="otokas.com"
```

Run migrations:

```bash
npx prisma migrate dev
```

---

## Architecture Overview

| Module            | Responsibility                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Auth**          | Registration, login, token refresh, logout, session management                                                  |
| **Users**         | Profile, password reset (OTP), email verification                                                               |
| **Motors**        | Vehicle inventory CRUD, AI STNK batch scanning via GCS, motor image uploads, odometer & tax status tracking     |
| **Analytics**     | Dashboard stats, daily/weekly selling reports, incoming stock, best-selling                                     |
| **Subscription**  | Xendit checkout integration, webhook handling, subscription status                                              |
| **Tenant**        | Dealer landing page creation, landing config management, branding (premium)                                     |
| **Public Tenant** | Publicly accessible dealer profiles, landing content, paginated motor listings with per-tenant field visibility |
| **Download**      | Signed GCS download URLs for the mobile app APK                                                                 |

---

## Authentication Strategy

- **JWT access tokens** — short-lived, sent as `Authorization: Bearer <access_token>`.
- **Refresh tokens** — long-lived, used to obtain a new access token without re-login.
- `JwtAuthGuard` protects all private endpoints.
- `PremiumGuard` additionally enforces an active PREMIUM subscription on premium-only endpoints.

---

## Conventions

- **Base path:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication header (private endpoints):**
  ```
  Authorization: Bearer <access_token>
  ```
- **Date formats:**
  - `month` → `MM-YYYY` (e.g. `06-2024`)
  - `date` → `D-M-YYYY` or `DD-MM-YYYY` (e.g. `11-6-2024`)
- **Premium endpoints** return `403` if the tenant subscription is not `PREMIUM` / `ACTIVE`.
- **Input validation** uses both NestJS `class-validator` (for pipeline compatibility) and **Zod** schemas (for runtime type narrowing and external data boundaries). Motor creation/update payloads are validated via Zod before reaching the service layer.
- **Error format:**
  ```json
  {
    "statusCode": 400,
    "message": "Validation error message",
    "error": "Bad Request"
  }
  ```

### Public vs Private vs Premium

| Label       | Requirement                                      |
| ----------- | ------------------------------------------------ |
| **Public**  | No authentication needed                         |
| **Private** | Valid JWT `Authorization: Bearer <token>` header |
| **Premium** | Private + active PREMIUM tenant subscription     |

---

## Endpoint Reference

### Auth — `/api/v1/auth`

| Method   | Path        | Access  | Description                           |
| -------- | ----------- | ------- | ------------------------------------- |
| `POST`   | `/register` | Public  | Register a new dealer account         |
| `POST`   | `/login`    | Public  | Login, receive access + refresh token |
| `POST`   | `/refresh`  | Public  | Refresh access token                  |
| `DELETE` | `/logout`   | Public  | Invalidate a refresh token            |
| `GET`    | `/me`       | Private | Get current user payload from JWT     |

### Users — `/api/v1/users`

| Method  | Path                      | Access  | Description                  |
| ------- | ------------------------- | ------- | ---------------------------- |
| `GET`   | `/profile`                | Private | Get user profile details     |
| `PATCH` | `/profile`                | Private | Update profile (dealer name) |
| `POST`  | `/request-password-reset` | Public  | Send OTP to email            |
| `POST`  | `/reset-password`         | Public  | Reset password with OTP      |
| `POST`  | `/verify-email`           | Public  | Verify email with token      |

### Motors — `/api/v1/motors`

| Method   | Path                      | Access  | Description                                     |
| -------- | ------------------------- | ------- | ----------------------------------------------- |
| `GET`    | `/`                       | Private | List user's motors (optional `?status=` filter) |
| `GET`    | `/:id`                    | Private | Get a single motor by ID                        |
| `POST`   | `/`                       | Private | Create a single motor record                    |
| `POST`   | `/bulk`                   | Premium | Bulk create motors                              |
| `POST`   | `/scan/upload-urls`       | Premium | Get presigned GCS upload URLs for STNK images   |
| `POST`   | `/scan-batch`             | Premium | Scan STNK images via AI                         |
| `POST`   | `/:id/images/upload-urls` | Private | Get presigned GCS upload URLs for motor images  |
| `PATCH`  | `/:id`                    | Private | Update motor fields                             |
| `PATCH`  | `/:id/sold`               | Private | Mark motor as sold                              |
| `PATCH`  | `/:id/images`             | Private | Replace motor images                            |
| `DELETE` | `/:id`                    | Private | Delete a motor                                  |

### Analytics — `/api/v1/dashboard`

| Method | Path                                   | Access  | Description                                     |
| ------ | -------------------------------------- | ------- | ----------------------------------------------- |
| `GET`  | `/stats?month=MM-YYYY`                 | Private | Dashboard summary (stock, sold, profit, margin) |
| `GET`  | `/selling-report/daily?date=D-M-YYYY`  | Private | Daily selling breakdown                         |
| `GET`  | `/selling-report/weekly?date=D-M-YYYY` | Private | Weekly selling breakdown                        |
| `GET`  | `/incoming-stock/report?date=D-M-YYYY` | Private | Incoming stock by date                          |
| `GET`  | `/best-selling?limit=N`                | Private | Top-selling motor models                        |

### Subscription — `/api/v1/subscription`

| Method | Path            | Access                    | Description                            |
| ------ | --------------- | ------------------------- | -------------------------------------- |
| `POST` | `/checkout`     | Private                   | Create Xendit checkout invoice         |
| `POST` | `/notification` | Public (server-to-server) | Xendit payment webhook                 |
| `GET`  | `/status`       | Private                   | Get current subscription tier & status |

### Tenant — `/api/v1/tenants`

| Method  | Path              | Access  | Description                               |
| ------- | ----------------- | ------- | ----------------------------------------- |
| `POST`  | `/`               | Private | Create a new tenant (dealer landing page) |
| `PATCH` | `/landing-config` | Premium | Update landing page content               |
| `PATCH` | `/branding`       | Premium | Update tenant branding (primary color)    |

### Public Tenant — `/api/v1/public/tenants`

| Method | Path                                        | Access | Description                             |
| ------ | ------------------------------------------- | ------ | --------------------------------------- |
| `GET`  | `/:subdomain`                               | Public | Get tenant profile                      |
| `GET`  | `/:subdomain/landing-content`               | Public | Get tenant landing page content         |
| `GET`  | `/:subdomain/motors?page=1&limit=20`        | Public | Get paginated tenant motor listings     |
| `GET`  | `/:subdomain/search?q=beat&page=1&limit=20` | Public | Search tenant motor listings by keyword |

### Download — `/api/v1/download`

| Method | Path    | Access | Description                             |
| ------ | ------- | ------ | --------------------------------------- |
| `GET`  | `/file` | Public | Get signed GCS download URL for app APK |

---

## API Usage Flows

### 1. Auth Flow

#### Register

```
POST /api/v1/auth/register
```

Creates a user, auto-provisions a default FREE tenant, membership, and subscription.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "dealerName": "John Motor",
  "deviceId": "ios-iphone14pro-abc123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "8f31b9d3-1300-4c11-89cb-b31e40dd5f3a",
    "email": "user@example.com",
    "createdAt": "2026-05-23T11:27:18.102Z"
  }
}
```

#### Login

```
POST /api/v1/auth/login
```

Sets refresh token as an httpOnly cookie and returns access token in body.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "deviceId": "ios-iphone14pro-abc123"
}
```

**Response (200):**

```json
{
  "access_token": "<jwt_access_token>"
}
```

#### Get Current User

```
GET /api/v1/auth/me
```

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**

```json
{
  "userId": "8f31b9d3-1300-4c11-89cb-b31e40dd5f3a",
  "email": "user@example.com"
}
```

#### Refresh Token

```
POST /api/v1/auth/refresh
```

**Request Body:**

```json
{
  "refresh_token": "<jwt_refresh_token>",
  "deviceId": "ios-iphone14pro-abc123"
}
```

**Response (200):**

```json
{
  "access_token": "<new_jwt_access_token>"
}
```

#### Logout

```
DELETE /api/v1/auth/logout
```

Invalidates the given refresh token.

**Request Body:**

```json
{
  "refresh_token": "<jwt_refresh_token>"
}
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 2. AI Scanner Flow (Upload → Scan → Bulk Create)

This flow extracts vehicle data from STNK (registration) photos using AI.

#### Step 1 — Request presigned upload URLs

```
POST /api/v1/motors/scan/upload-urls
Private + Premium
```

**Request Body:**

```json
{
  "files": [
    { "fileName": "stnk-revo.jpg", "mimeType": "image/jpeg" },
    { "fileName": "stnk-beat.jpg", "mimeType": "image/jpeg" }
  ]
}
```

**Response (201):**

```json
{
  "uploads": [
    {
      "uploadUrl": "https://storage.googleapis.com/bucket/stnk-uploads/...?X-Goog-Signature=...",
      "filePath": "stnk-uploads/1710000000-stnk-revo.jpg",
      "mimeType": "image/jpeg"
    },
    {
      "uploadUrl": "https://storage.googleapis.com/bucket/stnk-uploads/...?X-Goog-Signature=...",
      "filePath": "stnk-uploads/1710000001-stnk-beat.jpg",
      "mimeType": "image/jpeg"
    }
  ]
}
```

Max 10 files per request.

#### Step 2 — Upload files directly to GCS

For each file, PUT the binary content to the `uploadUrl`:

```bash
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@./stnk-revo.jpg"
```

If upload succeeds, proceed with the `filePath` from step 1.

#### Step 3 — Trigger AI scan

```
POST /api/v1/motors/scan-batch
Private + Premium
```

**Request Body:**

```json
{
  "files": [
    {
      "filePath": "stnk-uploads/1710000000-stnk-revo.jpg",
      "mimeType": "image/jpeg"
    },
    {
      "filePath": "stnk-uploads/1710000001-stnk-beat.jpg",
      "mimeType": "image/jpeg"
    }
  ]
}
```

Max 10 files per batch.

**Response (201) — array, no wrapper:**

```json
[
  {
    "brand": "Honda",
    "name": "Revo Fit",
    "frameNumber": "MH1HB211XJK123456",
    "engineNumber": "HB21E1123456",
    "year": 2021,
    "plateNumber": "B 1234 ABC",
    "color": "Hitam",
    "category": "CUB",
    "stnkCode": "NC11D1CF",
    "displacement": 110,
    "isAmbiguous": false,
    "isIncomplete": false,
    "remarks": ""
  },
  {
    "brand": "Yamaha",
    "name": "",
    "frameNumber": "MH3SE8810LK000111",
    "engineNumber": "E3R5E001111",
    "year": 2020,
    "plateNumber": "B 9999 XYZ",
    "color": "Biru",
    "category": "MATIC",
    "stnkCode": "UNKNOWN",
    "displacement": 125,
    "isAmbiguous": true,
    "isIncomplete": true,
    "remarks": "Motor code not found in database. Please verify and input manually."
  }
]
```

- `isIncomplete=true` means the image was blurry or data unreadable — frontend should show an editable form.
- `isAmbiguous=true` means the STNK code couldn't be reliably matched to a known model.

#### Step 4 — Bulk create motors from scan results

```
POST /api/v1/motors/bulk
Private + Premium
```

Map each scan result to a motor object, fill in `buyingPrice` (and optional `sellingPrice`).

**Request Body:**

```json
{
  "motors": [
    {
      "brand": "Honda",
      "name": "Revo Fit",
      "frameNumber": "MH1HB211XJK123456",
      "engineNumber": "HB21E1123456",
      "stnkCode": "NC11D1CF",
      "category": "CUB",
      "year": 2021,
      "plateNumber": "B 1234 ABC",
      "color": "Hitam",
      "displacement": 110,
      "buyingPrice": 12000000,
      "sellingPrice": 13500000,
      "isIncomplete": false
    }
  ]
}
```

**Response (201):**

```json
{
  "message": "Motors successfully imported",
  "count": 1
}
```

#### Step 5 — Manual fallback for incomplete scans

For rows where `isIncomplete=true`, the frontend can show an editable form and submit to:

```
POST /api/v1/motors
Private
```

(See Motor CRUD below for request format.)

---

### 3. Motor CRUD Flow

#### List motors

```
GET /api/v1/motors?status=AVAILABLE
Private
```

Query params:

- `status` (optional) — `AVAILABLE`, `BOOKED`, `SOLD`, or `ARCHIVED`.

**Response (200):**

```json
{
  "data": [
    {
      "id": "1f987066-1594-4d03-8ebc-4b967eb3f2ac",
      "frameNumber": "MH1HB211XJK123456",
      "engineNumber": "HB21E1123456",
      "stnkCode": "NC11D1CF",
      "brand": "Honda",
      "name": "Revo Fit",
      "category": "CUB",
      "year": 2021,
      "plateNumber": "B 1234 ABC",
      "color": "Hitam",
      "displacement": 110,
      "kilometer": 24500,
      "tax": "PAID",
      "buyingPrice": 12000000,
      "sellingPrice": 13500000,
      "status": "AVAILABLE",
      "isIncomplete": false,
      "createdAt": "2026-05-23T11:58:10.392Z",
      "updatedAt": "2026-05-23T11:58:10.392Z",
      "soldAt": null,
      "motorImages": [
        {
          "id": "image-uuid",
          "storageKey": "motor-images/user-uuid/motor-uuid/1710000000-beat.jpg",
          "url": "https://storage.googleapis.com/bucket/motor-images/...jpg",
          "width": 1200,
          "height": 800,
          "size": 248123
        }
      ]
    }
  ]
}
```

#### Create a single motor

```
POST /api/v1/motors
Private
```

**Request Body:**

| Field          | Type    | Required | Description                             |
| -------------- | ------- | -------- | --------------------------------------- |
| `brand`        | string  | Yes      | Motor brand (e.g. "Honda")              |
| `name`         | string  | Yes      | Model name (e.g. "Beat FI")             |
| `buyingPrice`  | number  | Yes      | Buying price in IDR                     |
| `frameNumber`  | string  | No       | Frame / VIN number                      |
| `engineNumber` | string  | No       | Engine number                           |
| `stnkCode`     | string  | No       | STNK type code                          |
| `category`     | enum    | No       | `MATIC`, `CUB`, `SPORT`, `MANUAL`       |
| `year`         | integer | No       | Manufacture year (≥1900)                |
| `plateNumber`  | string  | No       | License plate                           |
| `color`        | string  | No       | Vehicle color                           |
| `displacement` | integer | No       | Engine CC                               |
| `kilometer`    | integer | No       | Odometer reading (km, ≥0)               |
| `tax`          | enum    | No       | Tax status: `PAID`, `UNPAID`, `PENDING` |
| `sellingPrice` | number  | No       | Selling price in IDR                    |
| `isIncomplete` | boolean | Yes      | `true` if data is incomplete            |

**Request Body Example:**

```json
{
  "brand": "Honda",
  "name": "Beat FI",
  "frameNumber": "MH3JFZ115PK000001",
  "engineNumber": "JFZ1E-1000001",
  "stnkCode": "NC11D1CF",
  "category": "MATIC",
  "year": 2021,
  "plateNumber": "B 1234 ABC",
  "color": "Merah",
  "displacement": 125,
  "kilometer": 15000,
  "tax": "PAID",
  "buyingPrice": 12000000,
  "sellingPrice": 14500000,
  "isIncomplete": false
}
```

**Response (201):**

```json
{
  "data": {
    "id": "a60e6f9d-29f8-4f2f-9aa2-6d29541adf36",
    "frameNumber": "MH3JFZ115PK000001",
    "engineNumber": "JFZ1E-1000001",
    "stnkCode": "NC11D1CF",
    "brand": "Honda",
    "name": "Beat FI",
    "category": "MATIC",
    "year": 2021,
    "plateNumber": "B 1234 ABC",
    "color": "Merah",
    "displacement": 125,
    "kilometer": 15000,
    "tax": "PAID",
    "buyingPrice": 12000000,
    "sellingPrice": 14500000,
    "status": "AVAILABLE",
    "isIncomplete": false,
    "createdAt": "2026-05-23T12:01:18.102Z",
    "updatedAt": "2026-05-23T12:01:18.102Z",
    "soldAt": null,
    "motorImages": []
  }
}
```

#### Update motor

```
PATCH /api/v1/motors/:id
Private
```

All fields optional.

**Request Body Example:**

```json
{
  "sellingPrice": 15000000,
  "color": "Hitam"
}
```

**Response (200):** Same shape as create response (`{ "data": { ...motor } }`).

#### Mark motor as sold

```
PATCH /api/v1/motors/:id/sold
Private
```

No request body required. Sets `status` to `SOLD` and populates `soldAt`.

**Response (200):** Same shape as create response, with `"status": "SOLD"` and `"soldAt": "2026-05-23T14:00:00.000Z"`.

#### Upload motor images — Step 1: get upload URLs

```
POST /api/v1/motors/:id/images/upload-urls
Private
```

**Request Body:**

```json
{
  "files": [{ "fileName": "motor-depan.jpg", "mimeType": "image/jpeg" }]
}
```

Max 10 files.

**Response (201):**

```json
{
  "uploads": [
    {
      "uploadUrl": "https://storage.googleapis.com/...?X-Goog-Signature=...",
      "filePath": "motor-images/user-uuid/motor-uuid/1710000000-motor-depan.jpg",
      "mimeType": "image/jpeg"
    }
  ]
}
```

After generating URLs, the backend immediately persists the `storageKey` to `motorImages`. Upload the file directly to GCS using `uploadUrl`, then use the URL from GCS's public bucket.

#### Upload motor images — Step 2: replace images

```
PATCH /api/v1/motors/:id/images
Private
```

Replaces the entire image list for a motor.

**Request Body:**

```json
{
  "images": [
    {
      "storageKey": "motor-images/user-uuid/motor-uuid/1710000000-motor-depan.jpg",
      "url": "https://storage.googleapis.com/bucket/motor-images/...jpg",
      "width": 1200,
      "height": 800,
      "size": 248123
    }
  ]
}
```

Max 20 images. `width`, `height`, `size` are optional.

**Response (200):** Same shape as create response with updated `motorImages[]`.

#### Delete motor

```
DELETE /api/v1/motors/:id
Private
```

**Response (200):**

```json
{
  "message": "Motor berhasil dihapus"
}
```

---

### 4. User Profile & Recovery Flow

#### Get profile

```
GET /api/v1/users/profile
Private
```

**Response (200):**

```json
{
  "id": "8f31b9d3-1300-4c11-89cb-b31e40dd5f3a",
  "dealerName": "John Motor",
  "email": "user@example.com",
  "deviceId": "ios-iphone14pro-abc123",
  "isVerified": false,
  "createdAt": "2026-05-23T11:27:18.102Z",
  "updatedAt": "2026-05-23T11:27:18.102Z"
}
```

#### Update profile

```
PATCH /api/v1/users/profile
Private
```

**Request Body:**

```json
{
  "dealerName": "Super Motors Updated"
}
```

**Response (200):** Updated user object (same shape as get profile).

#### Request password reset OTP

```
POST /api/v1/users/request-password-reset
Public
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (201):**

```json
{
  "message": "OTP has been sent to your email."
}
```

#### Reset password with OTP

```
POST /api/v1/users/reset-password
Public
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newP@ssw0rd123"
}
```

**Response (201):**

```json
{
  "message": "Password has been successfully reset."
}
```

#### Verify email

```
POST /api/v1/users/verify-email
Public
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "token": "a1b2c3d4..."
}
```

**Response (200):**

```json
{
  "message": "Email has been successfully verified."
}
```

---

### 5. Analytics Flow

All endpoints require authentication.

#### Dashboard summary

```
GET /api/v1/dashboard/stats?month=06-2024
Private
```

**Response (200):**

```json
{
  "data": {
    "stock": 24,
    "sold": 8,
    "currentMonthProfit": 32500000,
    "currentMonthRevenue": 50000000,
    "marginAverage": 12.4
  }
}
```

#### Daily selling report

```
GET /api/v1/dashboard/selling-report/daily?date=11-6-2024
Private
```

**Response (200):**

```json
{
  "data": [
    {
      "date": "2024-06-11",
      "count": 1,
      "revenue": 14500000,
      "motors": [
        {
          "id": "motor-uuid",
          "name": "Beat FI",
          "brand": "Honda",
          "plateNumber": "B 1234 ABC",
          "sellingPrice": 14500000
        }
      ]
    }
  ]
}
```

#### Weekly selling report

```
GET /api/v1/dashboard/selling-report/weekly?date=11-6-2024
Private
```

**Response (200):**

```json
{
  "data": [
    {
      "date": "2024-06-11",
      "count": 5,
      "revenue": 70000000,
      "motors": [
        {
          "id": "motor-uuid",
          "name": "NMAX",
          "brand": "Yamaha",
          "plateNumber": "B 9999 XYZ",
          "sellingPrice": 14500000
        }
      ]
    }
  ]
}
```

#### Incoming stock report

```
GET /api/v1/dashboard/incoming-stock/report?date=11-6-2024
Private
```

**Response (200):**

```json
{
  "data": [
    {
      "date": "2024-06-11",
      "count": 2,
      "totalBuyingPrice": 24000000
    }
  ]
}
```

#### Best-selling motors

```
GET /api/v1/dashboard/best-selling?limit=5
Private
```

Query params:

- `limit` (optional, default `5`, min `1`, max `20`)

**Response (200):**

```json
{
  "data": [
    {
      "brand": "Honda",
      "name": "Beat FI",
      "totalSold": 12,
      "totalRevenue": 180000000
    }
  ]
}
```

---

### 6. Subscription Flow

Premium access is controlled via Xendit subscription with webhook-driven activation. The frontend never decides whether a payment succeeded — the backend is the single source of truth.

#### Get subscription status

```
GET /api/v1/subscription/status
Private
```

Use on app start to determine tier and lock/unlock features.

**Response (200):**

```json
{
  "tier": "FREE",
  "status": "ACTIVE",
  "expiresAt": null,
  "tenantId": "tenant-uuid",
  "subdomain": "rullymotor"
}
```

| State              | Meaning                             |
| ------------------ | ----------------------------------- |
| `FREE + ACTIVE`    | Free plan, upgrade available        |
| `PREMIUM + ACTIVE` | Premium active, unlock all features |
| `PENDING`          | Checkout in progress                |
| `INACTIVE`         | No active subscription              |

#### Start checkout

```
POST /api/v1/subscription/checkout
Private
```

**Response (201):**

```json
{
  "invoice_id": "67f71aa8d730d8497a8f8a12",
  "invoice_url": "https://checkout.xendit.co/web/67f71aa8d730d8497a8f8a12",
  "external_id": "TENANT_SUB_tenant-uuid_1716451234567",
  "status": "PENDING"
}
```

Frontend should open `invoice_url` in browser/webview. Do not call any activate endpoint afterward.

#### Xendit webhook (server-to-server)

```
POST /api/v1/subscription/notification
Public (secured by callback token)
```

Xendit calls this endpoint after payment. The backend:

1. Validates the `x-callback-token` header against `XENDIT_CALLBACK_TOKEN`.
2. Verifies invoice status server-to-server against Xendit's API.
3. Only if verified `PAID`: activates tenant subscription to `PREMIUM ACTIVE`.

**Request Body (from Xendit):**

```json
{
  "id": "67f71aa8d730d8497a8f8a12",
  "external_id": "TENANT_SUB_tenant-uuid_1716451234567",
  "status": "PAID",
  "paid_at": "2025-06-10T10:00:00Z"
}
```

**Response (200):**

```json
{
  "status": "ok"
}
```

#### Frontend polling strategy

After user returns from the payment page:

1. Show "Processing payment..." UI.
2. Poll `GET /api/v1/subscription/status` every 3–5 seconds.
3. Stop on `tier=PREMIUM + status=ACTIVE` or timeout (~60–120 seconds).
4. If timeout: show "Payment is still being processed. Please refresh in a moment."

**Do:**

- Treat `GET /subscription/status` as the single source of truth.
- Treat payment completion as asynchronous.

**Don't:**

- Trust query params or redirect URL alone as success proof.
- Set local premium flags without backend confirmation.

---

### 7. Tenant Flow

Dealers get a public landing page at `{subdomain}.otokas.com`.

#### Create tenant

```
POST /api/v1/tenants
Private
```

Each user can own only one tenant (including the auto-provisioned one at registration). Returns `409` if a tenant already exists.

**Request Body:**

```json
{
  "name": "Rully Motor",
  "subdomain": "rullymotor"
}
```

Subdomain rules: lowercase, alphanumeric, dashes allowed (not leading/trailing/consecutive), 3–63 chars.

**Response (201):**

```json
{
  "id": "tenant-uuid",
  "name": "Rully Motor",
  "subdomain": "rullymotor",
  "fullDomain": "rullymotor.otokas.com"
}
```

#### Update landing config

```
PATCH /api/v1/tenants/landing-config
Private + Premium
```

Partial update: sections not provided are left unchanged. Object fields are merged; array fields (e.g. `businessHours.items`) are fully replaced when provided. Includes `motorDisplay` for controlling which motor fields appear on the public landing page (see section 8).

**Request Body:**

```json
{
  "location": {
    "city": "Bandar Lampung",
    "address": "Jl. Raden Intan No. 123",
    "mapsUrl": "https://maps.google.com/..."
  },
  "businessHours": {
    "items": [
      { "day": "Senin", "open": "08:30", "close": "17:00", "closed": false },
      { "day": "Minggu", "open": "00:00", "close": "00:00", "closed": true }
    ]
  },
  "motorDisplay": {
    "showPrice": true,
    "showYear": true,
    "showStatus": true,
    "showKilometer": true,
    "showTax": true
  }
}
```

**Response (200):**

```json
{
  "tenant": {
    "name": "Rully Motor",
    "subdomain": "rullymotor",
    "fullDomain": "rullymotor.otokas.com",
    "logoUrl": null,
    "templateKey": "t-003",
    "primaryColor": null,
    "whatsappNumber": "6281234567890"
  },
  "content": {
    "whatsappNumber": "6281234567890",
    "location": {
      "city": "Bandar Lampung",
      "address": "Jl. Raden Intan No. 123",
      "mapsUrl": "https://maps.google.com/..."
    },
    "businessHours": {
      "items": [
        { "day": "Senin", "open": "08:30", "close": "17:00", "closed": false },
        { "day": "Minggu", "open": "00:00", "close": "00:00", "closed": true }
      ]
    },
    "motorDisplay": {
      "showPrice": true,
      "showYear": true,
      "showStatus": true,
      "showKilometer": true,
      "showTax": true
    }
  },
  "schemaVersion": "v1"
}
```

#### Update branding (premium)

```
PATCH /api/v1/tenants/branding
Private + Premium
```

Updates visual branding fields such as the primary color selected via a frontend color picker. The `primaryColor` field accepts a hex color string (e.g. `#ff8c00`) or `null` to reset.

**Request Body:**

```json
{
  "primaryColor": "#ff8c00"
}
```

| Field          | Type           | Required | Description                                                      |
| -------------- | -------------- | -------- | ---------------------------------------------------------------- |
| `primaryColor` | string \| null | No       | Hex color code (#RGB, #RRGGBB, #RRGGBBAA). Pass `null` to clear. |

**Response (200):**

```json
{
  "name": "Rully Motor",
  "subdomain": "rullymotor",
  "fullDomain": "rullymotor.otokas.com",
  "logoUrl": "https://cdn.example.com/logo.png",
  "templateKey": "t-003",
  "primaryColor": "#ff8c00",
  "whatsappNumber": "6281234567890"
}
```

---

### 8. Public Tenant Flow (no auth required)

These are the endpoints consumed by the public dealer landing page.

#### Tenant profile

```
GET /api/v1/public/tenants/:subdomain
Public
```

**Response (200):**

```json
{
  "name": "Rully Motor",
  "subdomain": "rullymotor",
  "fullDomain": "rullymotor.otokas.com",
  "logoUrl": "https://cdn.example.com/logo.png",
  "templateKey": "t-003",
  "whatsappNumber": "6281234567890"
}
```

#### Landing content

```
GET /api/v1/public/tenants/:subdomain/landing-content
Public
```

**Response (200):**

```json
{
  "tenant": {
    "name": "Rully Motor",
    "subdomain": "rullymotor",
    "fullDomain": "rullymotor.otokas.com",
    "logoUrl": "https://cdn.example.com/logo.png",
    "templateKey": "t-003",
    "primaryColor": "#ff8c00",
    "whatsappNumber": "6281234567890"
  },
  "content": {
    "whatsappNumber": "6281234567890",
    "location": {
      "city": "Bandar Lampung",
      "address": "Jl. Raden Intan No. 123",
      "mapsUrl": "https://maps.google.com/..."
    },
    "businessHours": {
      "items": [
        { "day": "Senin", "open": "08:30", "close": "17:00", "closed": false }
      ]
    },
    "motorDisplay": {
      "showPrice": true,
      "showYear": true,
      "showStatus": true,
      "showKilometer": false,
      "showTax": false
    }
  },
  "schemaVersion": "v1"
}
```

#### Paginated motor listings

```
GET /api/v1/public/tenants/:subdomain/motors?page=1&limit=20
Public
```

Query params:

- `page` (default `1`, min `1`)
- `limit` (default `20`, min `1`, max `50`)

Motor fields are dynamically adjusted per tenant based on the `motorDisplay` landing config. Fields hidden by config return `null`:

| Display Flag    | Field       | When hidden | When visible                                 |
| --------------- | ----------- | ----------- | -------------------------------------------- |
| `showPrice`     | `price`     | `null`      | selling price in IDR (or `null` if not set)  |
| `showYear`      | `year`      | `null`      | manufacture year                             |
| `showStatus`    | `status`    | `null`      | `AVAILABLE` / `BOOKED` / `SOLD` / `ARCHIVED` |
| `showKilometer` | `kilometer` | `null`      | odometer reading (km)                        |
| `showTax`       | `tax`       | `null`      | `PAID` / `UNPAID` / `PENDING`                |

Defaults: `showPrice: true`, `showYear: true`, `showStatus: true`, `showKilometer: false`, `showTax: false`.

**Response (200):**

```json
{
  "tenant": {
    "name": "Rully Motor",
    "subdomain": "rullymotor",
    "templateKey": "t-003",
    "fullDomain": "rullymotor.otokas.com",
    "whatsappNumber": "6281234567890"
  },
  "motors": [
    {
      "id": "motor-uuid",
      "title": "Honda Beat 2022",
      "brand": "Honda",
      "price": 14500000,
      "year": 2022,
      "status": "AVAILABLE",
      "kilometer": 12500,
      "tax": true,
      "imageUrl": "https://cdn.otokas.com/image.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 126,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "from": 1,
    "to": 20
  }
}
```

#### Search motor listings

```
GET /api/v1/public/tenants/:subdomain/search?q=beat&page=1&limit=20
Public
```

Query params:

- `q` (optional) — search keyword for case-insensitive partial match against motor brand and name
- `page` (default `1`, min `1`)
- `limit` (default `20`, min `1`, max `50`)

Motor fields follow the same `motorDisplay` rules as the paginated listing endpoint. The response format is identical to the paginated motor listings response.

When `q` is omitted, the endpoint returns all motors (same behavior as the motors listing endpoint).

**Response (200):**

```json
{
  "tenant": {
    "name": "Rully Motor",
    "subdomain": "rullymotor",
    "templateKey": "t-003",
    "fullDomain": "rullymotor.otokas.com",
    "whatsappNumber": "6281234567890"
  },
  "motors": [
    {
      "id": "motor-uuid",
      "title": "Honda Beat 2022",
      "brand": "Honda",
      "price": 14500000,
      "year": 2022,
      "status": "AVAILABLE",
      "kilometer": 12500,
      "tax": true,
      "imageUrl": "https://cdn.otokas.com/image.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false,
    "from": 1,
    "to": 5
  }
}
```

---

### 9. Download Flow

#### Get signed APK download URL

```
GET /api/v1/download/file
Public
```

**Response (200):**

```json
{
  "signedUrl": "https://storage.googleapis.com/bucket/Otokas.apk?X-Goog-Signature=..."
}
```

Signed URL expires in 24 hours.

---

## Docker

```bash
docker build -t otokas-api .
docker run -p 8080:8080 --env-file .env otokas-api
```

Multi-stage build (node:22-alpine), builder → production for minimal image size.

## Swagger / OpenAPI

```
http://localhost:8080/api/docs
```

## Development

```bash
npm run start:dev   # Start with watch mode
npm run lint        # Run linter
npm run test        # Run Jest tests
```
