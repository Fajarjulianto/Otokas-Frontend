## OTOKAS

Otokas adalah aplikasi mobile B2B SaaS untuk dealer motor bekas.
Aplikasi ini membantu pemilik showroom mengelola stok unit, memproses data motor, mencatat transaksi, dan memantau performa usaha secara real-time.

## Tech Stack

| Layer          | Teknologi                                    |
| -------------- | -------------------------------------------- |
| Framework      | React Native + Expo SDK 57                   |
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
  - Android package: `com.civika.otokas`
  - iOS bundle identifier: `com.civika.otokas`

### Build Native Secara Lokal

1. Gunakan Node.js 20 atau lebih baru, lalu install dependency dari lockfile:

   ```sh
   npm ci
   ```

2. Periksa konfigurasi dan dependency Expo:

   ```sh
   npx expo-doctor
   npx expo install --check
   ```

3. Siapkan toolchain untuk platform yang akan dibangun:
   - **Android**: Android Studio, Android SDK Platform/Build Tools yang diminta Gradle, Java 17, dan `ANDROID_HOME` yang menunjuk ke direktori SDK. Pastikan `platform-tools` ada di `PATH` agar `adb` dapat ditemukan.
   - **iOS**: macOS, Xcode dengan command line tools aktif, dan CocoaPods (`pod`).

4. Jalankan build debug lokal:

   ```sh
   npm run android
   # atau
   npm run ios
   ```

   Perintah Expo akan membuat folder native `android/` atau `ios/` dari konfigurasi app jika belum ada, lalu menjalankan build. Folder tersebut diabaikan Git karena project memakai Expo Prebuild; jangan menghapus folder native yang sudah disesuaikan secara manual.

Untuk memeriksa bundling JavaScript Android tanpa Android SDK/emulator, jalankan:

```sh
npx expo export --platform android --output-dir /tmp/otokas-android-export
```

Perintah export hanya memastikan bundle JS dan asset berhasil dibuat; ini tidak menghasilkan APK. Build APK/AAB native tetap memerlukan Android SDK.

## Catatan Release

Sebelum submit ke Play Store, pastikan juga:

1. Privacy policy dan Data Safety sudah lengkap.
2. Screenshot, ikon, dan listing store sudah disiapkan.
3. Signing production EAS sudah tervalidasi.
4. Tidak ada credential atau secret yang masuk ke repo.
5. Alur permission startup sudah ditetapkan bila ingin digunakan saat first launch.

## Environment

Gunakan file `.env` lokal untuk konfigurasi runtime. Jangan commit secret atau token sensitif ke repository.
