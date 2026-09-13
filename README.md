## OTOKAS

Otokas adalah aplikasi mobile B2B SaaS untuk dealer motor bekas.
Aplikasi ini membantu pemilik showroom mengelola stok unit, memproses data motor, mencatat transaksi, dan memantau performa usaha secara real-time.

## Tech Stack

| Layer          | Teknologi                                    |
| -------------- | -------------------------------------------- |
| Framework      | React Native + Expo SDK 54                   |
| Routing        | Expo Router                                  |
| Styling        | NativeWind v4 + Tailwind CSS                 |
| Language       | TypeScript                                   |
| Data Fetching  | Axios                                        |
| Server State   | TanStack Query v5                            |
| Storage        | AsyncStorage + Expo Secure Store             |
| Native Modules | Expo Camera, Image Picker, Location, WebView |

## Kondisi Produksi Saat Ini

- `ErrorBoundary` sudah aktif di root layout.
- Token autentikasi disimpan di Secure Store, bukan AsyncStorage.
- Build produksi EAS sudah diarahkan ke Android App Bundle (`app-bundle`).
- Permission camera dan media dipakai di layar fitur, tetapi belum ada coordinator startup permission terpusat.
- Permission lokasi sudah dideklarasikan lewat plugin `expo-location` di `app.json`.
- Notifikasi belum diimplementasikan sebagai fitur runtime.

## Struktur Project

```
Otokas-Frontend/
├── app/
│   ├── _layout.tsx               # Root layout: ErrorBoundary + QueryClient + AuthProvider
│   ├── index.tsx                 # Auth redirect entry point
│   ├── edit-profile.tsx
│   ├── edit-website.tsx
│   ├── paket.tsx
│   ├── verify-email.tsx
│   ├── (auth)/                   # Login / register stack
│   ├── (tabs)/                   # Main tab navigator
│   ├── motor/                    # Motor detail & batch add routes
│   ├── payment/                  # Checkout / webview / result
│   └── unit/                     # Scan and edit unit routes
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── motor/
│   │   ├── report/
│   │   ├── scan/
│   │   ├── state/
│   │   ├── ui/
│   │   └── website/
│   ├── context/
│   │   └── authContext.tsx
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── md/
│   ├── design.md
│   └── otokas_audit_report.md
├── app.json
├── eas.json
├── package.json
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── eslint.config.js
├── tsconfig.json
└── global.css
```

## Fitur Utama

- Login, register, forgot password, dan verifikasi email.
- Dashboard ringkas untuk stok dan laporan.
- Tambah unit motor secara manual atau dengan scan STNK/BPKB.
- Upload dan kelola foto motor.
- Halaman detail motor, edit unit, dan alur pembayaran.
- Profil pengguna, edit profil, dan pengaturan website.

## Permission Runtime

Saat ini permission digunakan di fitur berikut:

- **Camera**: `app/unit/scan.tsx`
- **Media library / galeri**: `app/(tabs)/tambah.tsx`, `app/motor/[id].tsx`, `src/components/motor/MotorPhotoPicker.tsx`
- **Location**: sudah disiapkan di konfigurasi Expo, tetapi belum dipakai luas di UI runtime

## Build & Release

- `eas.json` sudah memiliki profile `development`, `preview`, dan `production`.
- Profile `production` memakai Android App Bundle.
- Identitas aplikasi sudah diset di `app.json`:
  - Android package: `com.fajarid.Otokas`
  - iOS bundle identifier: `com.fajarid.Otokas`

## Catatan Release

Sebelum submit ke Play Store, pastikan juga:

1. Privacy policy dan Data Safety sudah lengkap.
2. Screenshot, ikon, dan listing store sudah disiapkan.
3. Signing production EAS sudah tervalidasi.
4. Tidak ada credential atau secret yang masuk ke repo.
5. Alur permission startup sudah ditetapkan bila ingin digunakan saat first launch.

## Environment

Gunakan file `.env` lokal untuk konfigurasi runtime. Jangan commit secret atau token sensitif ke repository.
