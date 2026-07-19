# Design System — Referensi Sock.app

> Diekstrak dari screenshot referensi untuk landing page Otokas

---# Design System — Referensi Sock.app

> Diekstrak dari screenshot referensi untuk landing page Otokas

---

## 1. Filosofi Desain

Gaya visual ini menggabungkan **clean typographic layout** dengan **ilustrasi tangan (hand-drawn illustration style)**. Kesan yang dihasilkan: modern tapi bersahabat, serius tapi tidak kaku. Cocok untuk produk yang ingin terasa mudah digunakan oleh kalangan non-teknis (dealer motor, UMKM).

Prinsip utama:

- **Whitespace agresif** — banyak ruang kosong, konten tidak padat
- **Typography sebagai hero** — headline besar, bold, dan langsung ke poin
- **Ilustrasi sebagai pendukung** — bukan foto, melainkan karakter ilustrasi 2D
- **Warna minimal** — dominan hitam/putih, aksen warna terbatas 2–3 warna

---

## 2. Color Palette

### Warna Utama

| Nama      | Hex       | Kegunaan                              |
| --------- | --------- | ------------------------------------- |
| Black     | `#0D0D0D` | Teks utama, headline, icon            |
| White     | `#FFFFFF` | Background utama, teks di CTA gelap   |
| Off-White | `#F5F5F0` | Background section alternatif, footer |

### Warna Aksen (terbatas)

| Nama          | Hex       | Kegunaan                                |
| ------------- | --------- | --------------------------------------- |
| Brand Orange  | `#FF5C00` | Logo, CTA button utama, highlight       |
| Accent Green  | `#C8E6A0` | Background card ilustrasi (earthy tone) |
| Accent Yellow | `#F5D76E` | Background card ilustrasi ke-2          |
| Accent Red    | `#E8503A` | Background card ilustrasi ke-3          |

### Penggunaan Warna

- Background halaman: `#FFFFFF` atau `#F5F5F0`
- Semua teks body dan heading: `#0D0D0D`
- CTA button primer: `#0D0D0D` background, `#FFFFFF` teks
- Logo dan brand highlight: `#FF5C00`
- Card ilustrasi: warna solid earthy (hijau, kuning, merah bata) — tidak ada gradient

---

## 3. Typography

### Font Family

- **Heading**: Serif modern — mirip **Fraunces**, **Playfair Display**, atau **Lora**
  - Karakter: elegant, berat, sedikit italic pada beberapa kata
  - Alternatif Google Fonts: `Fraunces` (paling mirip) atau `Playfair Display`
- **Body & UI**: Sans-serif bersih — mirip **Inter** atau **DM Sans**
  - Karakter: netral, mudah dibaca, weight regular–medium

### Skala Typography

| Level        | Size (desktop) | Weight          | Kegunaan                    |
| ------------ | -------------- | --------------- | --------------------------- |
| Hero H1      | 64–72px        | 800 (ExtraBold) | Headline utama hero section |
| Section H2   | 40–48px        | 700 (Bold)      | Judul tiap section feature  |
| Card H3      | 18–20px        | 700 (Bold)      | Judul card/item             |
| Body Large   | 16–18px        | 400             | Deskripsi di bawah headline |
| Body Regular | 14–16px        | 400             | Teks paragraf, FAQ, caption |
| Label/Nav    | 14px           | 500             | Navigasi, tombol kecil      |

### Aturan Typography

- Hero H1 menggunakan **line-height 1.1** (sangat rapat) untuk kesan bold
- Tidak ada huruf kapital semua (no ALL CAPS) kecuali badge kecil
- Teks body max-width **560px** agar mudah dibaca
- Letter-spacing: normal (0) untuk heading, tidak ada tracking ekstrem

---

## 4. Spacing System

Berbasis kelipatan **8px**:

| Token | Nilai | Kegunaan                      |
| ----- | ----- | ----------------------------- |
| xs    | 4px   | Gap antar elemen sangat kecil |
| sm    | 8px   | Padding dalam badge, gap ikon |
| md    | 16px  | Gap antar elemen dalam card   |
| lg    | 24px  | Padding card, gap antar kolom |
| xl    | 40px  | Margin antar sub-section      |
| 2xl   | 64px  | Padding atas/bawah section    |
| 3xl   | 96px  | Jarak antar section besar     |
| 4xl   | 128px | Hero section padding atas     |

---

## 5. Layout & Grid

### Container

- Max width: **1120px**
- Padding horizontal: **24px** (mobile), **48px** (tablet), **80px** (desktop)
- Centered di viewport

### Grid System

- Desktop: **12 kolom**, gap **24px**
- Feature alternating section: **2 kolom (50/50)** — teks kiri, mockup kanan (atau sebaliknya bergantian)
- Card grid (trust section): **3 kolom** equal width
- FAQ: **1 kolom**, max-width **720px**, centered

### Breakpoints

| Nama    | Lebar      |
| ------- | ---------- |
| Mobile  | < 640px    |
| Tablet  | 640–1024px |
| Desktop | > 1024px   |

---

## 6. Komponen UI

### Navbar

- Background: **putih** dengan sedikit border-bottom tipis `1px solid #E5E5E5`
- Logo di kiri: wordmark + ikon brand berwarna
- Nav links di tengah: teks hitam, weight 500, tanpa underline
- CTA button di kanan: pill/rounded penuh, background hitam, teks putih
- Sticky di atas saat scroll
- Tinggi navbar: **60–64px**

### Button

**Primary (Download/CTA utama):**

```
background: #0D0D0D
color: #FFFFFF
border-radius: 9999px (pill)
padding: 12px 24px
font-size: 14px
font-weight: 600
```

**Secondary (Learn more):**

```
background: transparent
color: #0D0D0D
border: none
font-size: 14px
font-weight: 500
text-decoration: underline (subtle)
```

**App Store / Google Play Badge:**

- Gunakan badge resmi Apple dan Google
- Background hitam, border-radius: 10px
- Ditampilkan side by side dengan gap 12px

### Card Fitur (Trust Section)

```
background: [warna solid earthy]  — hijau / kuning / merah bata
border-radius: 20px
padding: 32px
aspect-ratio: sekitar 1:1.1
overflow: hidden
```

- Berisi ilustrasi karakter di tengah/atas
- Teks judul dan deskripsi di bawah ilustrasi
- Tidak ada shadow, tidak ada border

### FAQ Accordion

```
border-top: 1px solid #E5E5E5
padding: 20px 0
```

- Icon `+` di kanan yang berubah menjadi `−` saat expanded
- Tidak ada background, tidak ada card
- Animasi expand smooth (300ms ease)

### Section Mockup (Alternating Feature)

- Mockup smartphone dalam frame iPhone outline (bukan foto, tapi ilustrasi/wireframe style)
- Ditampilkan miring sedikit atau flat
- Karakter ilustrasi kecil di sekitar mockup sebagai dekorasi
- Mockup tidak punya shadow besar — tipis atau tidak ada shadow

---

## 7. Ilustrasi & Aset Visual

### Gaya Ilustrasi

- **Hand-drawn / cartoon style** — bukan foto, bukan ikon flat biasa
- Karakter berbentuk blob/organik dengan ekspresi sederhana
- Outline hitam tebal (**stroke 2–3px**)
- Fill warna solid tanpa gradient
- Proporsi karakter sedikit chibi/lucu

### Mockup Aplikasi

- Frame iPhone outline style — bukan foto device asli
- Layar aplikasi di dalam frame menampilkan screenshot UI nyata
- Ditampilkan dalam kelompok 2–3 device sekaligus di hero
- Rotasi sedikit (-5° hingga +5°) untuk variasi

### Dekorasi

- Koin/lingkaran berputar di sekitar mockup (untuk konteks finansial)
- Semua dekorasi menggunakan warna brand, tidak random
- Posisi dekorasi: scattered organik, bukan simetris

---

## 8. Struktur Halaman (Page Sections)

Urutan section dari atas ke bawah:

```
1. NAVBAR
   - Logo | Nav Links | CTA Download

2. HERO SECTION
   - Headline besar (2–3 baris)
   - Subheadline (1–2 kalimat)
   - App Store + Google Play button
   - Mockup 3 device dengan ilustrasi dekorasi

3. FEATURE ALTERNATING (3 blok, kiri-kanan bergantian)
   Blok A: Teks kiri + Mockup kanan
   Blok B: Mockup kiri + Teks kanan
   Blok C: Teks kiri + Mockup kanan

4. TRUST / BENEFIT SECTION
   - Headline section centered
   - 3 card berwarna dengan ilustrasi karakter

5. FAQ SECTION
   - Headline centered
   - 7–8 pertanyaan dalam accordion

6. SOCIAL PROOF / INVESTOR
   - Logo-logo investor/partner dalam satu baris
   - Background off-white

7. FINAL CTA SECTION
   - Headline singkat
   - App Store + Google Play button
   - Background off-white atau warna brand

8. FOOTER
   - Link sosial media
   - Link legal (Privacy, Terms)
   - Copyright
   - Background off-white / abu sangat terang
```

---

## 9. Animasi & Interaksi

- **Hover button**: slight scale `transform: scale(1.02)`, transisi 150ms
- **FAQ expand**: height animasi smooth 300ms ease-in-out
- **Scroll reveal**: fade-up ringan pada section saat masuk viewport (opsional)
- **Navbar**: tidak ada animasi khusus, cukup sticky
- **Tidak ada** parallax berat, tidak ada animasi loading kompleks
- Keseluruhan terasa **fast dan ringan**

---

## 10. Tone & Copywriting Style

- **Headline**: langsung ke benefit, bukan fitur. Contoh: "Kelola stok motor, tanpa ribet." bukan "Aplikasi manajemen inventori motor"
- **Subheadline**: 1–2 kalimat, menjelaskan siapa target user dan apa yang bisa dilakukan
- **CTA**: action verb yang jelas — "Download Sekarang", "Coba Gratis"
- **Nada**: kasual tapi profesional, seperti ngobrol dengan teman yang paham bisnis
- **Hindari**: jargon teknis, kalimat panjang, bullet list yang terlalu banyak di hero

---

## 11. Adaptasi untuk Otokas

Karena Otokas adalah aplikasi untuk **dealer motor bekas** (bukan fintech), adaptasi yang perlu dilakukan:

| Elemen Sock        | Adaptasi Otokas                                       |
| ------------------ | ----------------------------------------------------- |
| Warna aksen koin   | Ganti dengan warna motor/otomotif (biru tua, amber)   |
| Ilustrasi koin     | Ilustrasi motor, STNK, nota jual beli                 |
| "Download the app" | Sama — tetap pakai App Store + Play Store             |
| Investor section   | Ganti dengan "Dipercaya X+ dealer" / testimonial      |
| Fitur earn/invest  | Ganti dengan fitur Tambah Stok, Scan STNK, Laporan    |
| Warna brand orange | Sesuaikan dengan warna brand Otokas (amber `#F59E0B`) |

## 1. Filosofi Desain

Gaya visual ini menggabungkan **clean typographic layout** dengan **ilustrasi tangan (hand-drawn illustration style)**. Kesan yang dihasilkan: modern tapi bersahabat, serius tapi tidak kaku. Cocok untuk produk yang ingin terasa mudah digunakan oleh kalangan non-teknis (dealer motor, UMKM).

Prinsip utama:

- **Whitespace agresif** — banyak ruang kosong, konten tidak padat
- **Typography sebagai hero** — headline besar, bold, dan langsung ke poin
- **Ilustrasi sebagai pendukung** — bukan foto, melainkan karakter ilustrasi 2D
- **Warna minimal** — dominan hitam/putih, aksen warna terbatas 2–3 warna

---

## 2. Color Palette

### Warna Utama

| Nama      | Hex       | Kegunaan                              |
| --------- | --------- | ------------------------------------- |
| Black     | `#0D0D0D` | Teks utama, headline, icon            |
| White     | `#FFFFFF` | Background utama, teks di CTA gelap   |
| Off-White | `#F5F5F0` | Background section alternatif, footer |

### Warna Aksen (terbatas)

| Nama          | Hex       | Kegunaan                                |
| ------------- | --------- | --------------------------------------- |
| Brand Orange  | `#FF5C00` | Logo, CTA button utama, highlight       |
| Accent Green  | `#C8E6A0` | Background card ilustrasi (earthy tone) |
| Accent Yellow | `#F5D76E` | Background card ilustrasi ke-2          |
| Accent Red    | `#E8503A` | Background card ilustrasi ke-3          |

### Penggunaan Warna

- Background halaman: `#FFFFFF` atau `#F5F5F0`
- Semua teks body dan heading: `#0D0D0D`
- CTA button primer: `#0D0D0D` background, `#FFFFFF` teks
- Logo dan brand highlight: `#FF5C00`
- Card ilustrasi: warna solid earthy (hijau, kuning, merah bata) — tidak ada gradient

---

## 3. Typography

### Font Family

- **Heading**: Serif modern — mirip **Fraunces**, **Playfair Display**, atau **Lora**
  - Karakter: elegant, berat, sedikit italic pada beberapa kata
  - Alternatif Google Fonts: `Fraunces` (paling mirip) atau `Playfair Display`
- **Body & UI**: Sans-serif bersih — mirip **Inter** atau **DM Sans**
  - Karakter: netral, mudah dibaca, weight regular–medium

### Skala Typography

| Level        | Size (desktop) | Weight          | Kegunaan                    |
| ------------ | -------------- | --------------- | --------------------------- |
| Hero H1      | 64–72px        | 800 (ExtraBold) | Headline utama hero section |
| Section H2   | 40–48px        | 700 (Bold)      | Judul tiap section feature  |
| Card H3      | 18–20px        | 700 (Bold)      | Judul card/item             |
| Body Large   | 16–18px        | 400             | Deskripsi di bawah headline |
| Body Regular | 14–16px        | 400             | Teks paragraf, FAQ, caption |
| Label/Nav    | 14px           | 500             | Navigasi, tombol kecil      |

### Aturan Typography

- Hero H1 menggunakan **line-height 1.1** (sangat rapat) untuk kesan bold
- Tidak ada huruf kapital semua (no ALL CAPS) kecuali badge kecil
- Teks body max-width **560px** agar mudah dibaca
- Letter-spacing: normal (0) untuk heading, tidak ada tracking ekstrem

---

## 4. Spacing System

Berbasis kelipatan **8px**:

| Token | Nilai | Kegunaan                      |
| ----- | ----- | ----------------------------- |
| xs    | 4px   | Gap antar elemen sangat kecil |
| sm    | 8px   | Padding dalam badge, gap ikon |
| md    | 16px  | Gap antar elemen dalam card   |
| lg    | 24px  | Padding card, gap antar kolom |
| xl    | 40px  | Margin antar sub-section      |
| 2xl   | 64px  | Padding atas/bawah section    |
| 3xl   | 96px  | Jarak antar section besar     |
| 4xl   | 128px | Hero section padding atas     |

---

## 5. Layout & Grid

### Container

- Max width: **1120px**
- Padding horizontal: **24px** (mobile), **48px** (tablet), **80px** (desktop)
- Centered di viewport

### Grid System

- Desktop: **12 kolom**, gap **24px**
- Feature alternating section: **2 kolom (50/50)** — teks kiri, mockup kanan (atau sebaliknya bergantian)
- Card grid (trust section): **3 kolom** equal width
- FAQ: **1 kolom**, max-width **720px**, centered

### Breakpoints

| Nama    | Lebar      |
| ------- | ---------- |
| Mobile  | < 640px    |
| Tablet  | 640–1024px |
| Desktop | > 1024px   |

---

## 6. Komponen UI

### Navbar

- Background: **putih** dengan sedikit border-bottom tipis `1px solid #E5E5E5`
- Logo di kiri: wordmark + ikon brand berwarna
- Nav links di tengah: teks hitam, weight 500, tanpa underline
- CTA button di kanan: pill/rounded penuh, background hitam, teks putih
- Sticky di atas saat scroll
- Tinggi navbar: **60–64px**

### Button

**Primary (Download/CTA utama):**

```
background: #0D0D0D
color: #FFFFFF
border-radius: 9999px (pill)
padding: 12px 24px
font-size: 14px
font-weight: 600
```

**Secondary (Learn more):**

```
background: transparent
color: #0D0D0D
border: none
font-size: 14px
font-weight: 500
text-decoration: underline (subtle)
```

**App Store / Google Play Badge:**

- Gunakan badge resmi Apple dan Google
- Background hitam, border-radius: 10px
- Ditampilkan side by side dengan gap 12px

### Card Fitur (Trust Section)

```
background: [warna solid earthy]  — hijau / kuning / merah bata
border-radius: 20px
padding: 32px
aspect-ratio: sekitar 1:1.1
overflow: hidden
```

- Berisi ilustrasi karakter di tengah/atas
- Teks judul dan deskripsi di bawah ilustrasi
- Tidak ada shadow, tidak ada border

### FAQ Accordion

```
border-top: 1px solid #E5E5E5
padding: 20px 0
```

- Icon `+` di kanan yang berubah menjadi `−` saat expanded
- Tidak ada background, tidak ada card
- Animasi expand smooth (300ms ease)

### Section Mockup (Alternating Feature)

- Mockup smartphone dalam frame iPhone outline (bukan foto, tapi ilustrasi/wireframe style)
- Ditampilkan miring sedikit atau flat
- Karakter ilustrasi kecil di sekitar mockup sebagai dekorasi
- Mockup tidak punya shadow besar — tipis atau tidak ada shadow

---

## 7. Ilustrasi & Aset Visual

### Gaya Ilustrasi

- **Hand-drawn / cartoon style** — bukan foto, bukan ikon flat biasa
- Karakter berbentuk blob/organik dengan ekspresi sederhana
- Outline hitam tebal (**stroke 2–3px**)
- Fill warna solid tanpa gradient
- Proporsi karakter sedikit chibi/lucu

### Mockup Aplikasi

- Frame iPhone outline style — bukan foto device asli
- Layar aplikasi di dalam frame menampilkan screenshot UI nyata
- Ditampilkan dalam kelompok 2–3 device sekaligus di hero
- Rotasi sedikit (-5° hingga +5°) untuk variasi

### Dekorasi

- Koin/lingkaran berputar di sekitar mockup (untuk konteks finansial)
- Semua dekorasi menggunakan warna brand, tidak random
- Posisi dekorasi: scattered organik, bukan simetris

---

## 8. Struktur Halaman (Page Sections)

Urutan section dari atas ke bawah:

```
1. NAVBAR
   - Logo | Nav Links | CTA Download

2. HERO SECTION
   - Headline besar (2–3 baris)
   - Subheadline (1–2 kalimat)
   - App Store + Google Play button
   - Mockup 3 device dengan ilustrasi dekorasi

3. FEATURE ALTERNATING (3 blok, kiri-kanan bergantian)
   Blok A: Teks kiri + Mockup kanan
   Blok B: Mockup kiri + Teks kanan
   Blok C: Teks kiri + Mockup kanan

4. TRUST / BENEFIT SECTION
   - Headline section centered
   - 3 card berwarna dengan ilustrasi karakter

5. FAQ SECTION
   - Headline centered
   - 7–8 pertanyaan dalam accordion

6. SOCIAL PROOF / INVESTOR
   - Logo-logo investor/partner dalam satu baris
   - Background off-white

7. FINAL CTA SECTION
   - Headline singkat
   - App Store + Google Play button
   - Background off-white atau warna brand

8. FOOTER
   - Link sosial media
   - Link legal (Privacy, Terms)
   - Copyright
   - Background off-white / abu sangat terang
```

---

## 9. Animasi & Interaksi

- **Hover button**: slight scale `transform: scale(1.02)`, transisi 150ms
- **FAQ expand**: height animasi smooth 300ms ease-in-out
- **Scroll reveal**: fade-up ringan pada section saat masuk viewport (opsional)
- **Navbar**: tidak ada animasi khusus, cukup sticky
- **Tidak ada** parallax berat, tidak ada animasi loading kompleks
- Keseluruhan terasa **fast dan ringan**

---

## 10. Tone & Copywriting Style

- **Headline**: langsung ke benefit, bukan fitur. Contoh: "Kelola stok motor, tanpa ribet." bukan "Aplikasi manajemen inventori motor"
- **Subheadline**: 1–2 kalimat, menjelaskan siapa target user dan apa yang bisa dilakukan
- **CTA**: action verb yang jelas — "Download Sekarang", "Coba Gratis"
- **Nada**: kasual tapi profesional, seperti ngobrol dengan teman yang paham bisnis
- **Hindari**: jargon teknis, kalimat panjang, bullet list yang terlalu banyak di hero

---

## 11. Adaptasi untuk Otokas

Karena Otokas adalah aplikasi untuk **dealer motor bekas** (bukan fintech), adaptasi yang perlu dilakukan:

| Elemen Sock        | Adaptasi Otokas                                       |
| ------------------ | ----------------------------------------------------- |
| Warna aksen koin   | Ganti dengan warna motor/otomotif (biru tua, amber)   |
| Ilustrasi koin     | Ilustrasi motor, STNK, nota jual beli                 |
| "Download the app" | Sama — tetap pakai App Store + Play Store             |
| Investor section   | Ganti dengan "Dipercaya X+ dealer" / testimonial      |
| Fitur earn/invest  | Ganti dengan fitur Tambah Stok, Scan STNK, Laporan    |
| Warna brand orange | Sesuaikan dengan warna brand Otokas (amber `#F59E0B`) |
