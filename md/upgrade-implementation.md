# Premium, scan STNK, website, dan Facebook

## Perubahan

- Cache React Query dipisahkan per akun. Langganan diambil ulang saat navigasi dan aplikasi aktif; halaman pembayaran memeriksa langsung, lalu setiap 2 detik sampai 90 detik. Redirect sukses bukan bukti premium aktif.
- Foto STNK dipotong sesuai frame aspect-fill sebelum review dan OCR. Foto motor/galeri tidak diubah. Crop menggunakan orientasi foto yang dinormalisasi Expo; kamera tetap memakai preview FILL tanpa prop `ratio`.
- Subdomain baru memakai nama showroom, suffix angka hanya ketika bentrok. Alamat lama dipertahankan. Form menampilkan alamat tersimpan dan membuka website dari respons backend.
- Caption template hanya memakai data publik. Pengguna memilih Page, meninjau caption, dan menekan Posting. Status pengiriman disimpan terpisah dari data motor.

## Konfigurasi peluncuran

Backend (`Otokas`):

- Jalankan `npm install`, `npx prisma generate`, dan `npx prisma migrate deploy` melalui proses deployment yang biasa. Migrasi `20260928000000_facebook_publication` hanya menambahkan tabel dan relasi; tidak mengubah subdomain lama. Migrasi belum dijalankan terhadap database pengguna.
- `BASE_DOMAIN=otokas.co.id` harus sama dengan website.
- `FACEBOOK_ENABLED=false` secara default; set `true` setelah uji integrasi Meta selesai.
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_GRAPH_VERSION` (versi yang didukung Meta App), `FACEBOOK_CALLBACK_URL=https://api.otokas.co.id/api/v1/integrations/facebook/callback`.
- `FACEBOOK_TOKEN_KEY`: 32 byte acak dalam base64 dari secret manager. Jangan mengubahnya tanpa migrasi token/reconnect semua akun.
- Redis memakai `REDIS_HOST`, `REDIS_PORT`, dan `REDIS_PASSWORD` yang sudah ada.

Website (`template-otokas`):

- Instal dependensi termasuk `sharp`; build Node.js dengan `npm run build`.
- `BASE_DOMAIN=otokas.co.id`; `BANNER_IMAGE_HOSTS=storage.googleapis.com` (tambahkan hanya host penyimpanan tepercaya bila diperlukan).
- Arahkan wildcard DNS `*.otokas.co.id` ke deployment katalog, pasang wildcard TLS, dan pertahankan hostname asli ketika reverse proxy meneruskan request. Domain khusus seperti `api` tetap ke layanan masing-masing.
- URL lama `/<slug>/...` tetap berlaku di domain utama. Pada hostname showroom URL tersebut diarahkan ke URL canonical `/...`.
- Metadata menggunakan banner JPEG 1200×630 di `/api/og/:subdomain?v=<hash>`. URL gambar sumber baru menghasilkan versi baru; jangan menimpa objek banner pada URL yang sama.

Aplikasi:

- `EXPO_PUBLIC_FACEBOOK_ENABLED=true` hanya untuk build yang sudah siap memakai backend Facebook. Default tidak menampilkan tombol dan fitur Facebook.
- OAuth kembali ke `otokas://facebook`; uji memakai development build/production build dengan scheme Otokas, bukan hanya Expo Go.

## Kontrak API baru

Semua endpoint kecuali callback memerlukan bearer token Otokas. Prefix `/api/v1`.

| Metode | Endpoint | Data/perilaku |
| --- | --- | --- |
| GET | `/integrations/facebook/status` | enabled, connected, pageId, pageName, needsReconnect; tanpa token Facebook |
| POST | `/integrations/facebook/oauth` | URL login; state sekali pakai berlaku 10 menit |
| GET | `/integrations/facebook/callback` | konsumsi state, tukar code di backend, redirect ke aplikasi |
| GET | `/integrations/facebook/pages` | daftar `{id, name}` yang dapat dipakai memposting |
| POST | `/integrations/facebook/page` | `{pageId}`; verifikasi ulang akses melalui Meta |
| DELETE | `/integrations/facebook` | hapus token lokal, batalkan draft/antrean, invalidasi OAuth yang belum selesai |
| POST | `/motors/:id/facebook-post/draft` | id, caption, link, imageUrl, pageId, pageName, status |
| POST | `/motors/:id/facebook-post` | `{publicationId, caption}`; antrekan sekali per motor/Page |
| GET | `/motors/:id/facebook-post` | status, errorCode, facebookPostId; null bila belum dibuat |

Status: DRAFT, QUEUED, PUBLISHING, PUBLISHED, FAILED, UNKNOWN. UNKNOWN tidak boleh dikirim ulang otomatis. Worker memeriksa feed Page untuk rekonsiliasi; jika tidak ada kecocokan tunggal yang bisa dibuktikan, status tetap UNKNOWN. UI meminta pengguna memeriksa Page. Versi ini tidak menyediakan repost untuk publikasi yang telah berhasil; posting baru ke Page yang berbeda memiliki catatan terpisah.

Database berfungsi sebagai outbox; maintenance BullMQ mengantrekan ulang QUEUED yang tertinggal. Claim atomik mencegah dua worker mengirim publikasi yang sama. Pergantian Page, disconnect, premium kedaluwarsa, dan motor bukan AVAILABLE diperiksa sebelum pengiriman.

## Validasi sebelum mengaktifkan Facebook

- Daftarkan callback pada Meta App, verifikasi kebutuhan izin `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, akses lanjutan/App Review, kebijakan privasi dan penghapusan data sesuai persyaratan Meta yang berlaku. Dokumentasi resmi Meta mengembalikan HTTP 429 pada sesi ini; persyaratan produksi belum dapat diverifikasi.
- Uji login dibatalkan, akun tanpa Page, pemilihan Page, pencabutan token, disconnect, dan expiry premium pada Page uji.
- Periksa HTML Open Graph dan gambar publik menggunakan Sharing Debugger. Preview Facebook dipengaruhi cache/platform; metadata tidak menjamin setiap permukaan Facebook menampilkan kartu yang identik.
- Uji crop pada HP Android dan iOS: teks di tepi frame, portrait/landscape, resize/orientasi, izin kamera ditolak, serta rapid capture. Perbandingan preview versus file upload harus dilakukan pada perangkat fisik.
- Uji pembayaran sungguhan/sandbox Xendit untuk membedakan latensi webhook dari latensi refresh aplikasi.

Pantau antrean QUEUED tertahan, UNKNOWN, error RECONNECT, durasi aktivasi setelah webhook, dan kegagalan endpoint gambar. Untuk menghentikan fitur, matikan flag backend dan flag build aplikasi; jangan menghapus catatan publikasi karena diperlukan untuk mencegah duplikasi.

## Hasil pemeriksaan implementasi

- Aplikasi: TypeScript dan lint pada kode yang diubah lulus; 17 tes relevan lulus (polling, cache akun, sinkronisasi premium, layanan subscription, crop).
- Bundle Android berhasil diekspor dengan fitur Facebook nonaktif dan aktif. Ini pemeriksaan bundling, bukan pengujian pada perangkat.
- Backend: build produksi lulus; 159 tes subscription/tenant/auth/Facebook lulus, kemudian 10 tes Facebook lulus setelah penambahan pengecekan status per ID publikasi.
- Website: build Next.js dan TypeScript lulus; seluruh 23 tes lulus, termasuk JPEG 1200×630, fallback, pembatasan host gambar, dan rewrite hostname.
- Pemeriksaan TypeScript backend yang mencakup seluruh test lama masih melaporkan masalah tipe pada fixture test premium guard/download/subscription yang sudah ada; build source produksi tidak memiliki error.
- Migrasi database, konfigurasi DNS/TLS, Meta App Review, posting langsung, dan pengujian kamera fisik belum dijalankan.
