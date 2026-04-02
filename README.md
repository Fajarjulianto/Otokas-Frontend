## OTOKAS

Asisten Pribadi Juragan Mokas
Aplikasi mobile B2B SaaS untuk membantu pemilik showroom motor bekas mengelola stok, mencatat transaksi, dan memantau keuntungan secara real-time.

## Tech Stack

| Layer          | Teknologi                    |
| -------------- | ---------------------------- |
| Framework      | React Native + Expo SDK 52   |
| Routing        | Expo Router (file-based)     |
| Styling        | NativeWind v4 (Tailwind CSS) |
| Language       | TypeScript                   |
| Auth & User DB | Supabase Auth                |
| Backend API    | Custom REST API              |
| HTTP Client    | Axios                        |
| Server State   | TanStack Query v5            |

## Struktur Project

```
otokas/
├── app/                          # Expo Router — file = route
│   ├── _layout.tsx               # Root layout (QueryClient + AuthProvider)
│   ├── index.tsx                 # Entry point & redirect logic
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx             # Halaman login
│   │   └── register.tsx          # Halaman register
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Beranda / Dashboard
│   │   ├── stok.tsx              # Daftar stok motor
│   │   ├── tambah.tsx            # Quick add motor
│   │   ├── laporan.tsx           # Laporan harian & bulanan
│   │   └── profil.tsx            # Profil & pengaturan
│   └── unit/
│       ├── scan.tsx              # Kamera + OCR STNK/BPKB
│       └── [id]/
│           └── edit.tsx          # Lengkapi data motor
│
├── src/
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client (auth only)
│   │   └── api.ts                # Axios instance + interceptor
│   ├── context/
│   │   └── authContext.tsx       # AuthContext (user session global)
│   ├── hooks/
│   │   ├── useAuth.ts            # Hook cek session
│   │   └── useMotors.ts          # TanStack Query hooks (CRUD motor)
│   ├── services/
│   │   └── motorService.ts       # Fungsi fetch ke REST API
│   ├── types/
│   │   ├── motor.ts              # Type Motor, MotorInsert, MotorUpdate
│   │   ├── transaction.ts        # Type Transaction
│   │   ├── report.ts             # Type DailyReport, MonthlyReport
│   │   └── api.ts                # Type ApiResponse, ApiError
│   └── utils/
│       └── formatRupiah.ts       # Helper format & parse Rupiah
│
├── global.css                    # NativeWind base styles
├── tailwind.config.js            # Konfigurasi Tailwind + tema Otokas
├── babel.config.js
├── metro.config.js
├── app.json
└── .env                          # Environment variables (jangan di-commit)
```

---
