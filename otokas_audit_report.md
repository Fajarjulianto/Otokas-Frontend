# 🔍 Otokas React Native — Full Production Audit Report

**Tanggal Audit:** 23 Juni 2026  
**Auditor:** Senior RN Engineer / Security / QA / Performance Specialist  
**Stack:** Expo SDK 54, React Native 0.81, TypeScript, TanStack Query, NativeWind, Axios  
**Jumlah File Diaudit:** 57 source files

---

# 📋 Executive Summary

Otokas adalah aplikasi SaaS mobile untuk manajemen showroom motor bekas. Secara arsitektur, fondasi sudah **cukup baik** — layering service/hook/screen sudah terpisah, TanStack Query digunakan untuk server state, dan TypeScript strict mode aktif. Namun, ada beberapa **temuan kritis** yang **harus diperbaiki sebelum production release**, terutama terkait keamanan (password disimpan plaintext di AsyncStorage, console.log data sensitif) dan stabilitas (tidak ada Error Boundary, tidak ada crash reporting).

### Skor Keseluruhan

| Aspek | Skor | Grade |
|---|---|---|
| Architecture | **62**/100 | C+ |
| Security | **35**/100 | F |
| Performance | **58**/100 | D+ |
| Maintainability | **65**/100 | C+ |
| Production Readiness | **30**/100 | F |
| **Overall** | **50**/100 | **D** |

> [!CAUTION]
> Aplikasi **BELUM siap production** untuk SaaS skala nasional. Ada 4 temuan Critical dan 8 temuan High yang harus diselesaikan terlebih dahulu.

---

# 🚨 Critical Issues (Harus Diperbaiki Segera)

## CRIT-01: Password Disimpan Plaintext di AsyncStorage
**Risk: CRITICAL | File:** `authContext.tsx:20`, `login.tsx:81`

`AuthUser` type menyertakan field `password: string` dan login page menyimpan password plaintext:
```typescript
// login.tsx:81 — password user disimpan di AsyncStorage!
const authPayload = {
  ...
  password: password,  // ❌ CRITICAL: plaintext password
};
await signIn(authPayload); // disimpan ke AsyncStorage
```

**Dampak:** Siapapun dengan akses fisik ke device atau backup bisa membaca password user.

**Fix:** Hapus `password` dari `AuthUser` type dan jangan pernah simpan password di storage:
```typescript
export type AuthUser = {
  id?: string;
  email: string;
  fullName?: string;
  dealerName?: string;
  isPremium?: boolean;
  token?: string;
  // HAPUS password dari sini
};
```

---

## CRIT-02: Token Disimpan di AsyncStorage (Tidak Terenkripsi)
**Risk: CRITICAL | File:** `api.ts`, `authContext.tsx`

JWT access token disimpan di `AsyncStorage` yang tidak terenkripsi. Pada rooted/jailbroken device, data bisa diakses dengan mudah.

**Fix:** Gunakan `expo-secure-store` untuk menyimpan token:
```typescript
import * as SecureStore from 'expo-secure-store';

async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}
async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}
```

---

## CRIT-03: Console.log Data Sensitif di Production
**Risk: CRITICAL | File:** `motorServices.ts:31-44`, `motorServices.ts:92`

```typescript
// motorServices.ts:31
console.log("INSERT MOTOR PAYLOAD:", JSON.stringify(motor, null, 2));
// motorServices.ts:40
console.log("INSERT MOTOR ERROR STATUS:", error?.response?.status);
console.log("INSERT MOTOR ERROR DATA:", JSON.stringify(error?.response?.data, null, 2));
// motorServices.ts:92
console.log("DASHBOARD STATS RAW:", JSON.stringify(response.data, null, 2));
```

**Dampak:** Data bisnis dan error detail terekspos di log device.

**Fix:** Hapus semua `console.log` dari services, atau gunakan conditional logger:
```typescript
const logger = __DEV__ ? console : { log: () => {}, error: () => {} };
```

---

## CRIT-04: Tidak Ada Error Boundary
**Risk: CRITICAL | File:** `app/_layout.tsx`

Tidak ada React Error Boundary di seluruh app. Unhandled error di component tree akan crash seluruh aplikasi tanpa recovery.

**Fix:** Tambahkan Error Boundary wrapper:
```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Terjadi Kesalahan</Text>
          <Text style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
            Aplikasi mengalami masalah. Silakan restart.
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{ marginTop: 16, backgroundColor: '#1e3a8a', padding: 12, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
```

---

# 🔒 Security Findings

| ID | Temuan | Risk | File |
|---|---|---|---|
| SEC-01 | Password plaintext di storage | Critical | `authContext.tsx`, `login.tsx` |
| SEC-02 | Token di AsyncStorage (unencrypted) | Critical | `api.ts`, `authContext.tsx` |
| SEC-03 | Console.log data sensitif | Critical | `motorServices.ts` |
| SEC-04 | Tidak ada root/jailbreak detection | High | — |
| SEC-05 | Tidak ada certificate pinning | High | `api.ts` |
| SEC-06 | Silent catch di interceptor (swallowed errors) | Medium | `api.ts:23,58` |
| SEC-07 | EAS Project ID exposed di `app.json` | Low | `app.json:53` |
| SEC-08 | `extractData` menggunakan `any` type | Medium | `subscriptionServices.ts:17`, `userServices.ts:4` |
| SEC-09 | Tidak ada rate limiting di client | Medium | `api.ts` |
| SEC-10 | `withCredentials: true` tanpa CSRF protection | Medium | `api.ts:11` |
| SEC-11 | `.env` tidak ada di `.gitignore` (hanya `.env*.local`) | High | `.gitignore` |

### SEC-11 Detail: `.env` Bisa Ter-commit
`.gitignore` hanya mengabaikan `.env*.local`, sementara file `.env` utama yang berisi API URL **tidak diabaikan**. Meskipun saat ini hanya berisi public URL, kebiasaan ini berbahaya jika nantinya ditambahkan secret keys.

**Fix:** Tambahkan `.env` ke `.gitignore`:
```diff
# local env files
+.env
 .env*.local
```

---

# ⚡ Performance Findings

## PERF-01: Unnecessary Re-renders pada Dashboard (High)
**File:** `app/(tabs)/index.tsx`

`MotorListItem` component menggunakan `useRouter()` di dalam setiap item, dan tidak di-memoize. Setiap re-render parent akan re-render semua list items.

**Fix:**
```typescript
const MotorListItem = React.memo(function MotorListItem({...}: Props) {
  // ... component code
});
```

## PERF-02: FlatList Tanpa Optimasi (High)
**File:** `app/(tabs)/stok.tsx`

`FlatList` untuk motor list tidak memiliki:
- `getItemLayout` — menyebabkan scroll performance issues
- `initialNumToRender` — render semua item sekaligus
- `maxToRenderPerBatch`
- `windowSize`

**Fix:**
```tsx
<FlatList
  data={filtered}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
  renderItem={({ item }) => <MotorCard item={item} ... />}
/>
```

## PERF-03: Motor List di Dashboard Menggunakan ScrollView Bukan FlatList (Medium)
**File:** `app/(tabs)/index.tsx:309`

```typescript
latestMotors.map((motor) => (
  <MotorListItem key={motor.id} ... />
))
```
Untuk 5 items ini masih acceptable, tapi jika bertambah akan jadi masalah.

## PERF-04: Motor Detail Mengambil Semua Motors (High)
**File:** `app/motor/[id].tsx:83`

```typescript
const { data: motors, isLoading } = useMotors(); // Fetch ALL motors
const motor = motors?.find((m) => m.id === id);   // Find single one
```

Seharusnya ada endpoint `/motors/:id` yang fetch single motor. Ini memaksa download seluruh list hanya untuk melihat 1 detail.

**Fix:** Buat `useMotorById(id)` hook yang memiliki dedicated query:
```typescript
export function useMotorById(id: string) {
  return useQuery({
    queryKey: ['motors', id],
    queryFn: () => fetchMotorById(id),
    enabled: !!id,
  });
}
```

## PERF-05: Edit Motor Page Juga Fetch Semua Motors (High)
**File:** `app/unit/[id]/edit.tsx:33` — sama seperti PERF-04.

## PERF-06: Laporan Page Fetch Semua Data Sekaligus (Medium)
**File:** `app/(tabs)/laporan.tsx:161-167`

Semua report (daily, weekly, monthly) di-fetch bersamaan meski hanya 1 tab aktif. Gunakan `enabled` flag berdasarkan `activeTab`:
```typescript
const { data: dailyReport } = useDailySellingReport(dateParam, {
  enabled: activeTab === 'harian',
});
```

## PERF-07: `SCREEN_WIDTH` Computed Once (Low)
**File:** `ReviewScreen.tsx:24`

`Dimensions.get("window").width` tidak responsive terhadap orientation change. Gunakan `useWindowDimensions()` hook.

## PERF-08: Duplicated `extractData` Helper (Low)
**File:** `authServices.ts:73`, `subscriptionServices.ts:17`, `userServices.ts:4`

Fungsi `extractData` diduplikasi 3 kali. Harus di-centralize.

---

# 🧪 Testing Coverage Plan

## Status Saat Ini
- **Test files:** 0
- **Test framework:** Tidak terinstal
- **Coverage:** 0%

## Setup Yang Diperlukan

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native \
  jest-expo @types/jest ts-jest react-test-renderer
```

## Daftar Test Files Yang Harus Dibuat

### Utility Functions (Target: 100% coverage)

| File Test | Source | Priority |
|---|---|---|
| `src/utils/__tests__/formatRupiah.test.ts` | `formatRupiah.ts` | P0 |
| `src/utils/__tests__/validation.test.ts` | `validation.ts` | P0 |
| `src/utils/__tests__/getDeviceID.test.ts` | `getDeviceID.ts` | P1 |

#### Contoh: `formatRupiah.test.ts`
```typescript
import { formatRupiah, formatRupiahInput, parseRupiah } from '../formatRupiah';

describe('formatRupiah', () => {
  it('formats positive number', () => {
    expect(formatRupiah(14000000)).toContain('14.000.000');
  });
  it('formats zero', () => {
    expect(formatRupiah(0)).toContain('0');
  });
  it('handles null/undefined gracefully', () => {
    expect(formatRupiah(null as any)).toBe('Rp 0');
    expect(formatRupiah(undefined as any)).toBe('Rp 0');
  });
  it('formats negative number', () => {
    const result = formatRupiah(-500000);
    expect(result).toContain('500.000');
  });
});

describe('formatRupiahInput', () => {
  it('formats numeric string with separators', () => {
    expect(formatRupiahInput('14000000')).toBe('14.000.000');
  });
  it('strips non-digit characters', () => {
    expect(formatRupiahInput('Rp 14.000')).toBe('14.000');
  });
  it('returns empty for empty string', () => {
    expect(formatRupiahInput('')).toBe('');
  });
});

describe('parseRupiah', () => {
  it('parses formatted string to number', () => {
    expect(parseRupiah('14.000.000')).toBe(14000000);
  });
  it('returns 0 for empty string', () => {
    expect(parseRupiah('')).toBe(0);
  });
});
```

### Custom Hooks (Target: 90% coverage)

| File Test | Source | Priority |
|---|---|---|
| `src/hooks/__tests__/useAuth.test.ts` | `useAuth.ts` | P0 |
| `src/hooks/__tests__/useMotors.test.ts` | `useMotors.ts` | P0 |
| `src/hooks/__tests__/useSubscription.test.ts` | `useSubscription.ts` | P1 |
| `src/hooks/__tests__/useUser.test.ts` | `useUser.ts` | P1 |
| `src/hooks/__tests__/useAnalytics.test.ts` | `useAnalytics.ts` | P2 |
| `src/hooks/__tests__/useDateRangePicker.test.ts` | `useDateRangePicker.ts` | P2 |

### API Services (Target: 90% coverage)

| File Test | Source | Priority |
|---|---|---|
| `src/services/__tests__/authServices.test.ts` | `authServices.ts` | P0 |
| `src/services/__tests__/motorServices.test.ts` | `motorServices.ts` | P0 |
| `src/services/__tests__/userServices.test.ts` | `userServices.ts` | P1 |
| `src/services/__tests__/subscriptionServices.test.ts` | `subscriptionServices.ts` | P1 |
| `src/services/__tests__/analyticsServices.test.ts` | `analyticsServices.ts` | P2 |
| `src/lib/__tests__/api.test.ts` | `api.ts` | P0 |

### UI Components (Target: 80% coverage)

| File Test | Source | Priority |
|---|---|---|
| `src/components/__tests__/EmptyState.test.tsx` | `state/empty.tsx` | P1 |
| `src/components/__tests__/DateRangePicker.test.tsx` | `DateRangePicker.tsx` | P2 |

### Estimasi Coverage

Dengan semua test di atas: **~85% coverage** pada logic layer, **~70% overall** (UI screens sulit 100%).

---

# 🏗️ Code Quality Review

## Architecture Issues

### ARCH-01: Duplicated Form Logic (DRY Violation) — High
`tambah.tsx` dan `edit.tsx` memiliki form yang hampir identik (~70% overlap):
- Brand picker modal (duplikat persis)
- BRANDS constant (duplikat)
- Price input with formatRupiahInput (duplikat)
- Form validation logic (duplikat)

**Fix:** Ekstrak `MotorForm` component dan `useMotorForm` hook.

### ARCH-02: Duplicated `formatRupiahInput`/`parseRupiah` — Medium
**File:** `screenConfirmation.tsx:25-33`

Helper ini sudah ada di `src/utils/formatRupiah.ts` tapi diduplikasi di component scan:
```typescript
// screenConfirmation.tsx — DUPLIKAT!
function formatRupiahInput(raw: string): string { ... }
function parseRupiah(formatted: string): number { ... }
```

### ARCH-03: Inconsistent Naming Convention — Medium

| Issue | File |
|---|---|
| `cameraPermissionScreeen.tsx` (typo: 3 e's) | scan/ |
| `screenConfirmation.tsx` (bukan PascalCase) | scan/ |
| `viewFinder.tsx` (bukan PascalCase) | scan/ |
| `getDeviceID.ts` (inconsistent casing) | utils/ |
| Mix `licensePlate` vs `plateNumber` | motor type vs services |

### ARCH-04: `batch-tambah.tsx` Menggunakan Mock Data — High
**File:** `app/motor/batch-tambah.tsx:42-75`

```typescript
//TES MOCK DATA SEMENTARA
//AKAN DIGANTI DENGAN ZUSTAND
const initialScannedData: ScannedMotor[] = [
  { id: "1", brand: "Honda", name: "Vario 150", ... },
```

Page ini belum terintegrasi dengan backend dan menggunakan hardcoded data + `setTimeout` untuk simulasi.

### ARCH-05: Missing QueryClient Configuration — Medium
**File:** `app/_layout.tsx:6`

```typescript
const queryClient = new QueryClient(); // No default options!
```

Seharusnya:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 menit
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### ARCH-06: `isPremium` Default `true` — High
**File:** `tambah.tsx:39`, `paket.tsx:34`

```typescript
const isPremium = subscription?.isPremium ?? true; // Default TRUE!
```

Ini berarti jika fetch gagal, semua fitur premium dianggap aktif. Harus default `false`:
```typescript
const isPremium = subscription?.isPremium ?? false;
```

### ARCH-07: Type `any` Usage — Medium

| Location | Issue |
|---|---|
| `scanSTNK` return `Promise<any>` | `motorServices.ts:58` |
| `scanWithUploadedPaths` return `Promise<any[]>` | `motorServices.ts:132` |
| `checkoutSubscription(payload?: any)` | `subscriptionServices.ts:21` |
| `extractData(res: any)` | 3 files |
| `MenuItem` icon prop `icon: any` | `profil.tsx:38` |

---

# ✅ Production Readiness Checklist

| Item | Status | Notes |
|---|---|---|
| Error Boundary | ❌ | Tidak ada |
| Crash Reporting (Sentry/Bugsnag) | ❌ | Tidak ada |
| Analytics (Mixpanel/Amplitude) | ❌ | Tidak ada |
| App Monitoring (performance) | ❌ | Tidak ada |
| Offline Mode | ❌ | Tidak ada, akan crash tanpa internet |
| Retry Mechanism | ⚠️ | Hanya di axios interceptor (401 retry) |
| API Timeout | ✅ | 15s default, 30s untuk scan |
| Logging Strategy | ❌ | Hanya console.log (bahkan log data sensitif) |
| Environment Config | ⚠️ | Hanya 1 env var, tidak ada staging/prod separation |
| Deep Linking | ⚠️ | Scheme `otokas` ada tapi belum dimanfaatkan |
| App Update (OTA) | ❌ | Tidak ada EAS Update setup |
| Splash Screen | ✅ | Configured |
| Typed Routes | ✅ | Enabled |
| Secure Storage | ❌ | Menggunakan AsyncStorage untuk token |
| Unit Tests | ❌ | 0 test files |
| CI/CD Pipeline | ❌ | Tidak ada |
| Accessibility | ❌ | Tidak ada `accessibilityLabel` di seluruh app |
| i18n Ready | ❌ | Semua string hardcoded bahasa Indonesia |

---

# 🔧 Refactoring Recommendations

## REF-01: Ekstrak MotorForm Component

**Masalah:** `tambah.tsx` (465 baris) dan `edit.tsx` (535 baris) memiliki form identik.

**Kode Baru:**
```typescript
// src/components/MotorForm.tsx
type MotorFormProps = {
  initialValues?: Partial<MotorFormValues>;
  onSubmit: (values: MotorFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
};

export function MotorForm({ initialValues, onSubmit, isSubmitting, submitLabel }: MotorFormProps) {
  // Consolidated form logic here
}
```

**Alasan:** DRY principle, single source of truth untuk validasi.

## REF-02: Centralize `extractData`

**Masalah:** Duplikasi di 3 file service.

**Fix:** Pindahkan ke `src/lib/api.ts`:
```typescript
export function extractData<T>(response: AxiosResponse): T {
  return response.data?.data ?? response.data;
}
```

## REF-03: Buat API Response Types yang Konsisten

**Masalah:** Response parsing inconsistent (`response.data?.data || []` vs `data.data`).

**Fix:**
```typescript
type ApiResponse<T> = {
  data: T;
  message?: string;
};
```

## REF-04: Rename Files ke Konsisten PascalCase

```
cameraPermissionScreeen.tsx → CameraPermissionScreen.tsx
screenConfirmation.tsx → ScreenConfirmation.tsx  
viewFinder.tsx → ViewFinder.tsx
```

## REF-05: Pisahkan Sub-Components dari Screen Files

`index.tsx` (dashboard) mendefinisikan `StatCard`, `AccentCard`, `MotorListItem` inline. `stok.tsx` mendefinisikan `MotorCard` inline. Pindahkan ke `src/components/`.

---

# 📊 Production Readiness Score (Detail)

### Architecture Score: 62/100
- ✅ Layered architecture (services → hooks → screens)
- ✅ TanStack Query for server state
- ✅ TypeScript strict mode
- ❌ DRY violations (forms, extractData)
- ❌ Missing dedicated API for single resources
- ❌ No state management for complex flows (batch-tambah)
- ❌ Inconsistent naming

### Security Score: 35/100
- ❌ Password stored plaintext (Critical)
- ❌ Token in AsyncStorage (Critical)
- ❌ Console.log sensitive data (Critical)
- ❌ No root/jailbreak detection
- ❌ No certificate pinning
- ✅ HTTPS endpoint
- ✅ Token refresh mechanism
- ⚠️ `.env` not in `.gitignore`

### Performance Score: 58/100
- ❌ No component memoization
- ❌ FlatList not optimized
- ❌ Fetch all motors for single detail
- ❌ All reports fetched simultaneously
- ✅ API timeout configured
- ✅ Image quality reduced (0.8)
- ✅ TanStack Query caching

### Maintainability Score: 65/100
- ✅ Clear folder structure
- ✅ Typed props on most components
- ❌ 0% test coverage
- ❌ Duplicated code
- ❌ Mixed naming conventions
- ❌ Inline sub-components in screens
- ✅ Consistent UI patterns

### Production Readiness Score: 30/100
- ❌ No Error Boundary
- ❌ No crash reporting
- ❌ No analytics
- ❌ No offline mode
- ❌ No CI/CD
- ❌ No tests
- ❌ No accessibility
- ❌ Mock data in production code

---

# 📅 Action Plan Prioritas 30 Hari

## Minggu 1: Security Critical Fixes (Hari 1-7)

| # | Task | ROI | Risk Mitigated |
|---|---|---|---|
| 1 | Hapus `password` dari AuthUser type & storage | Sangat Tinggi | CRIT-01 |
| 2 | Migrasi token ke `expo-secure-store` | Sangat Tinggi | CRIT-02 |
| 3 | Hapus semua `console.log` dari services | Tinggi | CRIT-03 |
| 4 | Tambahkan `.env` ke `.gitignore` | Tinggi | SEC-11 |
| 5 | Implement Error Boundary | Sangat Tinggi | CRIT-04 |
| 6 | Fix `isPremium` default ke `false` | Tinggi | ARCH-06 |

## Minggu 2: Stability & Testing Setup (Hari 8-14)

| # | Task | ROI | Risk Mitigated |
|---|---|---|---|
| 7 | Setup Jest + React Native Testing Library | Tinggi | — |
| 8 | Tulis unit tests untuk utility functions | Tinggi | Bug prevention |
| 9 | Tulis unit tests untuk API services | Tinggi | Regression |
| 10 | Setup crash reporting (Sentry/Bugsnag) | Sangat Tinggi | Invisible crashes |
| 11 | Configure QueryClient defaults (staleTime, retry) | Medium | ARCH-05 |
| 12 | Fix type `any` usages di services | Medium | ARCH-07 |

## Minggu 3: Performance & DRY Refactor (Hari 15-21)

| # | Task | ROI | Risk Mitigated |
|---|---|---|---|
| 13 | Memoize list item components (`React.memo`) | Tinggi | PERF-01 |
| 14 | Optimize FlatList (getItemLayout, windowSize) | Tinggi | PERF-02 |
| 15 | Buat `useMotorById` hook | Tinggi | PERF-04, PERF-05 |
| 16 | Ekstrak `MotorForm` shared component | Medium | ARCH-01, REF-01 |
| 17 | Centralize `extractData` helper | Low | REF-02 |
| 18 | Conditional fetch pada laporan tab | Medium | PERF-06 |

## Minggu 4: Production Polish (Hari 22-30)

| # | Task | ROI | Risk Mitigated |
|---|---|---|---|
| 19 | Integrate batch-tambah dengan backend | Tinggi | ARCH-04 |
| 20 | Rename files ke consistent PascalCase | Low | ARCH-03 |
| 21 | Add accessibility labels | Medium | Compliance |
| 22 | Setup EAS Update (OTA updates) | Tinggi | Hotfix capability |
| 23 | Add basic offline indicator | Medium | UX |
| 24 | Configure staging vs production env | Medium | Deployment safety |
| 25 | Final integration test run | Tinggi | — |

---

> [!IMPORTANT]
> **Prioritas tertinggi** adalah Minggu 1 (Security fixes). Tanpa menyelesaikan item CRIT-01 sampai CRIT-04, aplikasi **tidak boleh di-release** ke production karena menyimpan password user secara plaintext dan tidak ada error recovery.

> [!TIP]
> Setelah Minggu 2, aplikasi sudah bisa masuk **soft launch / beta** dengan catatan fitur batch-tambah di-hide dulu (masih mock). Full production launch bisa dilakukan setelah semua 4 minggu selesai.
