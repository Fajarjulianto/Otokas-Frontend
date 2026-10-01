# Kebijakan Privasi OTOKAS

**OTOKAS - Manajemen Motor Bekas**  
**Dikelola oleh Civika Digital Technology**  
**Tanggal berlaku: 13 September 2026**  
**URL publikasi yang dituju:** https://otokas.co.id/privacy-policy

> **STATUS DRAF — JANGAN DIPUBLIKASIKAN SEBELUM BAGIAN BERTANDA `[WAJIB DIISI]` DAN `[WAJIB DIKONFIRMASI]` DISELESAIKAN.** Repository frontend tidak memuat kontak privasi, praktik retensi backend, lokasi hosting, flow penghapusan akun, atau seluruh subprocessor. Menghapus peringatan ini tanpa menyelesaikan item tersebut akan membuat kebijakan tidak sesuai implementasi.

## 1. Tentang OTOKAS

OTOKAS adalah layanan perangkat lunak untuk membantu dealer motor bekas di Indonesia mengelola akun dealer, inventaris kendaraan, pemindaian STNK, foto kendaraan, harga beli dan jual, status penjualan, laporan usaha, katalog web dealer, serta status langganan.

Kebijakan Privasi ini menjelaskan bagaimana Civika Digital Technology (“kami”) memproses informasi ketika pengguna memakai aplikasi OTOKAS dan fitur terkaitnya.

**Identitas/alamat badan usaha atau penanggung jawab:** `[WAJIB DIISI]`  
**Email privasi:** `[WAJIB DIISI]`  
**Nomor/kanal dukungan:** `[WAJIB DIISI]`

## 2. Informasi yang Kami Kumpulkan

Bergantung pada fitur yang digunakan, OTOKAS memproses:

- data akun: ID akun, alamat email, password yang dikirim untuk autentikasi, token sesi, OTP atau token verifikasi saat pengguna memakai flow terkait, dan ID perangkat acak yang dibuat oleh aplikasi;
- data dealer: nama dealer/showroom, nomor telepon atau WhatsApp, alamat, subdomain/domain, serta status akun;
- data lokasi dealer yang dimasukkan manual: kota, alamat, dan bila pengguna memilih untuk mengisinya, koordinat latitude dan longitude;
- data kendaraan: merek, model/nama, kategori, tahun, plat nomor, nomor rangka, nomor mesin, kode STNK, warna, kapasitas mesin, kilometer, status pajak, status stok, status kelengkapan, dan tanggal terkait inventaris/penjualan;
- data dokumen dan foto: foto STNK, foto motor, banner katalog, serta metadata file seperti nama file, MIME type, storage key, URL, ukuran, dan dimensi;
- data transaksi usaha: harga beli, harga jual, status dan tanggal penjualan, pendapatan, profit, margin, laporan stok masuk, dan ringkasan motor terlaris;
- data langganan/pembayaran: paket, tier, status, masa berlaku, pilihan metode/channel, invoice ID, external/order ID, invoice URL, nominal, dan status pembayaran; dan
- preferensi lokal aplikasi, seperti penanda bahwa layar permintaan izin telah diselesaikan.

Aplikasi yang diaudit tidak memiliki implementasi untuk mengumpulkan daftar kontak, SMS, riwayat panggilan, audio, lokasi GPS perangkat, advertising ID, data kesehatan, data karyawan, data pelanggan/pembeli, atau biaya perbaikan/operasional. Aplikasi juga tidak memuat SDK analytics, iklan, push notification, atau crash reporting.

Server tujuan secara teknis dapat melihat informasi jaringan seperti alamat IP dan user-agent. Apakah informasi tersebut dicatat, untuk tujuan apa, dan berapa lama disimpan oleh backend OTOKAS harus dijelaskan di sini setelah konfigurasi produksi diaudit: **`[WAJIB DIKONFIRMASI]`**.

## 3. Cara Kami Mengumpulkan Informasi

Kami memperoleh informasi:

- langsung dari pengguna melalui form akun, profil dealer, inventaris, harga, dan pengaturan katalog;
- dari kamera ketika pengguna memilih fitur scan STNK;
- dari galeri ketika pengguna memilih foto motor atau banner;
- dari proses OCR/AI atas foto STNK yang pengguna kirim;
- dari tindakan pengguna di aplikasi, seperti menandai motor sebagai terjual atau memulai langganan; dan
- dari layanan pembayaran mengenai invoice dan status langganan.

Kamera dan galeri bersifat opsional untuk penggunaan aplikasi secara umum, tetapi diperlukan untuk fitur scan atau upload foto yang dipilih pengguna.

## 4. Tujuan Penggunaan Informasi

Kami memproses informasi untuk:

- membuat, memverifikasi, mengamankan, dan mengelola akun serta sesi pengguna;
- menyediakan fungsi inventaris, scan STNK, pengelolaan foto, transaksi, laporan, katalog, dan langganan;
- menghitung dan menampilkan harga, pendapatan, profit, serta margin;
- membuat dan memperbarui katalog publik sesuai pengaturan dealer;
- memproses pembayaran dan memperbarui status langganan;
- merespons permintaan reset password atau verifikasi email;
- menjaga operasi dan keamanan layanan serta menangani kesalahan; dan
- memenuhi kewajiban hukum yang berlaku apabila relevan.

Dasar pemrosesan yang benar untuk tiap tujuan—misalnya pelaksanaan perjanjian, persetujuan, kewajiban hukum, atau kepentingan sah—harus diselaraskan dengan proses bisnis dan hasil legal review: **`[WAJIB DIKONFIRMASI]`**.

## 5. Data Akun dan Dealer

Email, password, nama dealer, dan generated device ID digunakan dalam proses registrasi/login. Nomor telepon/WhatsApp dan alamat bersifat opsional. Password tidak disimpan oleh kode frontend; password dikirim ke API OTOKAS untuk autentikasi. Cara backend melakukan hashing, penyimpanan, dan retensi credential harus diverifikasi: **`[WAJIB DIKONFIRMASI]`**.

Access token dan refresh token disimpan pada secure storage perangkat. Ringkasan profil tanpa token disimpan pada local app storage untuk mempertahankan sesi dan menampilkan profil. Data lokal dapat bertahan sampai pengguna logout, menghapus data aplikasi, atau menghapus aplikasi, dengan perilaku backup bergantung pada konfigurasi perangkat dan aplikasi.

## 6. Data Kendaraan dan STNK

Pengguna dapat memasukkan data kendaraan secara manual atau memakai scan STNK. Untuk scan, aplikasi mengambil foto STNK, membuat versi WebP, mengunggahnya ke penyimpanan cloud, dan meminta backend menjalankan OCR/AI. Hasil yang ditangani frontend meliputi merek/model, tahun, plat nomor, nomor rangka, nomor mesin, kode STNK, warna, kategori, dan kapasitas mesin.

Foto STNK dapat memuat informasi lain yang terlihat pada dokumen, termasuk data pemilik kendaraan yang bukan pengguna OTOKAS. Pengguna dealer bertanggung jawab memastikan bahwa mereka berwenang memasukkan dan memproses dokumen atau data pihak lain melalui OTOKAS serta memberikan pemberitahuan yang diperlukan kepada pemilik data.

Nama vendor OCR/AI, lokasi pemrosesan, aksesnya terhadap file, periode retensi, dan apakah data digunakan untuk pelatihan model belum terlihat dalam repository frontend: **`[WAJIB DIKONFIRMASI DAN DIUNGKAPKAN]`**.

## 7. Foto dan Dokumen

Pengguna dapat mengunggah foto motor dan banner katalog dari galeri. Sebelum upload, aplikasi dapat mengubah ukuran, mengompresi, dan mengonversi foto menjadi WebP pada cache perangkat. File kemudian diunggah ke Google Cloud Storage menggunakan presigned URL dan metadata file dikirim ke API OTOKAS.

Foto motor dan banner dapat ditampilkan secara publik pada katalog dealer. Pengguna sebaiknya tidak mengunggah foto yang tidak diperlukan, tidak terkait kegiatan dealer, atau memuat data pribadi pihak lain tanpa dasar yang sesuai.

Kode frontend tidak menghapus seluruh file cache secara eksplisit setelah upload; file cache dapat dibersihkan oleh sistem operasi. Lifecycle file pada perangkat, Google Cloud Storage, backup, dan saat penghapusan motor/akun harus dikonfirmasi: **`[WAJIB DIKONFIRMASI]`**.

## 8. Data Transaksi dan Keuangan

OTOKAS memproses harga beli, harga jual, status/tanggal penjualan, pendapatan, profit, margin, dan data laporan dealer untuk menyediakan fungsi pengelolaan usaha. Data ini merupakan data bisnis sensitif dan tidak boleh ditampilkan kepada publik kecuali field yang memang dipilih untuk katalog, seperti harga jual.

Untuk langganan OTOKAS, aplikasi membuat checkout melalui backend dan membuka halaman Xendit. Source frontend tidak membaca nomor rekening, nomor kartu, PIN, password e-wallet, atau credential pembayaran lain yang pengguna masukkan langsung pada halaman Xendit. OTOKAS memproses metadata invoice dan status langganan yang diterima dari flow pembayaran.

## 9. Penggunaan Kamera dan Galeri

Izin kamera digunakan untuk mengambil foto STNK bagi fitur scan. Izin galeri digunakan untuk memilih foto motor atau banner. Pengguna dapat melewati prompt izin awal dan menolak izin melalui pengaturan perangkat, tetapi fitur yang memerlukan kamera atau galeri tidak akan bekerja tanpa akses tersebut.

OTOKAS tidak menggunakan kamera atau galeri untuk iklan atau analytics. Berdasarkan source yang diaudit, aplikasi tidak merekam audio atau video dan tidak memakai lokasi GPS. Build production harus menghapus izin mikrofon dan lokasi yang saat ini ikut dideklarasikan oleh dependency meskipun tidak digunakan.

## 10. Layanan Pihak Ketiga

### Google Cloud Storage

Foto STNK, foto motor, dan banner diunggah ke Google Cloud Storage untuk penyimpanan file. Informasi tentang privasi Google Cloud tersedia di https://cloud.google.com/privacy.

Region bucket, retensi, lifecycle, backup, kontrol akses, dan terms/DPA akun Google Cloud OTOKAS: **`[WAJIB DIKONFIRMASI]`**.

### Xendit

Xendit digunakan untuk membuat dan menampilkan checkout langganan serta mengirim status pembayaran kepada backend. Ketika pengguna berada pada halaman Xendit, pemrosesan oleh Xendit juga tunduk pada Kebijakan Privasi Xendit: https://www.xendit.co/id/privacy-policy/.

Payload persis yang backend OTOKAS kirim ke Xendit dan data webhook yang disimpan OTOKAS: **`[WAJIB DIKONFIRMASI]`**.

### Provider OCR/AI dan email

Frontend menunjukkan adanya proses OCR/AI dan email/OTP, tetapi tidak mengidentifikasi provider. Jika backend memakai penyedia eksternal, masukkan nama, data yang diterima, tujuan, lokasi, retensi, dan tautan privasinya di bagian ini: **`[WAJIB DIISI]`**.

Tidak ditemukan Firebase, Supabase, Google Analytics, Sentry, Crashlytics, SDK iklan, atau push notification provider pada implementasi yang diaudit.

## 11. Penyimpanan dan Keamanan Data

Traffic production yang terlihat pada frontend menggunakan HTTPS untuk API OTOKAS, Google Cloud Storage, dan contoh URL checkout Xendit. Token autentikasi disimpan melalui secure storage perangkat. Kami menerapkan langkah-langkah keamanan yang wajar dan sesuai risiko untuk melindungi data; namun, tidak ada metode transmisi atau penyimpanan yang dapat dijamin aman sepenuhnya.

Kontrol backend yang benar—enkripsi at rest, IAM, logging, monitoring, backup, incident response, vulnerability management, dan akses staf—harus diisi hanya setelah diverifikasi: **`[WAJIB DIKONFIRMASI]`**.

## 12. Retensi Data

> **Belum dapat dipublikasikan:** repository frontend tidak menetapkan periode retensi server.

Sebelum publikasi, Civika Digital Technology harus mengisi tabel berikut dengan praktik produksi yang benar:

| Kategori | Periode aktif | Setelah akun dihapus | Backup/log | Dasar pengecualian |
|---|---|---|---|---|
| Akun dan profil | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` |
| Credential/session | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` | Keamanan/fraud bila benar |
| Kendaraan, STNK, dan foto | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` |
| Transaksi/laporan usaha | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` | Pajak/sengketa bila benar |
| Invoice/langganan | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` | Kewajiban pembayaran/pajak bila benar |
| Server logs | `[WAJIB DIISI]` | `[WAJIB DIISI]` | `[WAJIB DIISI]` | Keamanan bila benar |

Data hanya boleh disimpan selama diperlukan untuk tujuan yang telah dijelaskan atau selama diwajibkan hukum. Pernyataan ini harus didukung oleh lifecycle dan SOP yang benar-benar diterapkan.

## 13. Pembagian Data

Kami tidak boleh menyatakan bahwa data “tidak pernah dibagikan” karena implementasi mengirim file ke Google Cloud Storage dan melibatkan Xendit dalam pembayaran. Data juga dapat diproses oleh provider OCR/AI dan email bila backend menggunakannya.

Data dapat ditampilkan pada katalog publik hanya sesuai fitur katalog, seperti nama dealer, kontak, alamat/lokasi, banner, dan field kendaraan yang dipilih. Harga beli, profit, dan margin tidak ditujukan untuk katalog publik berdasarkan schema yang diaudit.

Daftar final penerima data, perannya sebagai processor/controller, dan kondisi pengungkapan kepada aparat/otoritas harus disesuaikan dengan kontrak dan praktik nyata: **`[WAJIB DIKONFIRMASI]`**.

Kami tidak menemukan implementasi penjualan data pribadi atau penggunaan data untuk iklan bertarget pada source aplikasi yang diaudit.

## 14. Hak Pengguna

Sesuai hukum yang berlaku, pengguna dapat memiliki hak untuk meminta akses, koreksi, pembaruan, penghapusan, penarikan persetujuan, pembatasan/keberatan atas pemrosesan, dan informasi mengenai pemrosesan data. Ruang lingkup hak dapat bergantung pada dasar pemrosesan dan pengecualian hukum.

Pengguna dapat memperbarui nama dealer, nomor WhatsApp/telepon, alamat, password, dan sebagian konfigurasi katalog melalui aplikasi. Untuk hak yang belum tersedia secara self-service, hubungi **`[EMAIL PRIVASI — WAJIB DIISI]`**.

Prosedur verifikasi identitas dan SLA respons atas permintaan hak: **`[WAJIB DIKONFIRMASI]`**.

## 15. Penghapusan Akun dan Data

> **CRITICAL GOOGLE PLAY REQUIREMENT — NOT IMPLEMENTED.** Pada versi source yang diaudit, tidak ada tombol in-app, endpoint, atau halaman web untuk meminta penghapusan akun. Bagian ini tidak boleh diubah seolah-olah fitur telah tersedia sebelum implementasi diuji end-to-end.

Sebelum rilis Google Play, OTOKAS harus menyediakan:

- jalur yang mudah ditemukan di aplikasi, misalnya **Profil → Keamanan & Privasi → Hapus Akun**;
- halaman web aktif, direkomendasikan **https://otokas.co.id/delete-account**, untuk pengguna yang tidak lagi memiliki aplikasi; dan
- proses backend untuk menghapus akun beserta data terkait dari sistem aktif dan meminta penghapusan pada processor, kecuali data tertentu yang benar-benar harus disimpan untuk keamanan, pencegahan fraud, sengketa, pajak, pembayaran, atau kewajiban hukum.

Setelah tersedia, ganti blok ini dengan instruksi nyata yang telah diuji, daftar data yang dihapus, daftar/masa retensi pengecualian, cara pembatalan langganan bila relevan, serta estimasi pemrosesan **`[WAJIB DIISI BERDASARKAN SLA OPERASIONAL; JANGAN MENGARANG ANGKA]`**.

Penghapusan akun harus bersifat permanen, bukan sekadar menonaktifkan atau membekukan akun.

## 16. Perubahan Data Pengguna

Pengguna dapat mengubah profil dan konfigurasi tertentu melalui aplikasi. Data kendaraan dapat diperbarui atau dihapus per unit. Foto motor dapat ditambah, diganti, atau dihapus dari relasi motor. Apakah tindakan ini juga menghapus object GCS secara permanen dan salinannya pada backup harus dikonfirmasi: **`[WAJIB DIKONFIRMASI]`**.

Perubahan tertentu mungkin tidak langsung menghapus salinan pada backup atau catatan yang wajib disimpan. Bila hal ini benar dalam produksi, periode dan pembatasannya harus dijelaskan pada bagian Retensi.

## 17. Transfer Data

Data dikirim ke API OTOKAS, Google Cloud Storage, dan Xendit. Region server, region bucket, lokasi provider OCR/email, serta apakah terjadi transfer data ke luar Indonesia belum dapat ditentukan dari source frontend: **`[WAJIB DIKONFIRMASI]`**.

Jika terjadi transfer lintas negara, mekanisme dan perlindungan yang benar-benar digunakan harus dijelaskan sesuai hukum yang berlaku dan perjanjian dengan provider.

## 18. Privasi Anak

OTOKAS ditujukan untuk kegiatan bisnis dealer motor bekas dan bukan dirancang sebagai layanan anak. Source yang diaudit tidak memiliki age gate atau mekanisme verifikasi umur. Kebijakan umur minimum akun dan prosedur bila data anak ditemukan harus ditetapkan dan diimplementasikan: **`[WAJIB DIKONFIRMASI]`**.

Permintaan terkait data anak dapat disampaikan ke **`[EMAIL PRIVASI — WAJIB DIISI]`**.

## 19. Perubahan Kebijakan Privasi

Kami dapat memperbarui Kebijakan Privasi ini untuk mencerminkan perubahan fitur, praktik pemrosesan, layanan pihak ketiga, atau hukum. Versi terbaru akan menampilkan tanggal berlaku. Untuk perubahan material, metode pemberitahuan kepada pengguna—misalnya pemberitahuan dalam aplikasi atau email—harus mengikuti proses yang benar-benar diterapkan.

## 20. Kontak

Pertanyaan, keluhan, atau permintaan terkait data pribadi dapat ditujukan kepada:

**Civika Digital Technology**  
Alamat: **`[WAJIB DIISI]`**  
Email privasi: **`[WAJIB DIISI]`**  
Email dukungan: **`[WAJIB DIISI]`**  
Nomor kontak: **`[WAJIB DIISI]`**

---

## Catatan penerbitan internal — hapus setelah seluruh item selesai

- Perbaiki link pada halaman registrasi dari domain/path saat ini ke `https://otokas.co.id/privacy-policy`.
- Jangan mempublikasikan dokumen ini dengan placeholder atau label “Needs confirmation”.
- Pastikan policy yang dipublikasikan dapat dibuka tanpa login, tampil pada URL yang stabil, dan identik dengan jawaban Data Safety.
- Implementasikan dan publikasikan resource penghapusan akun sebelum submit Play Console.
- Mintakan review legal Indonesia setelah fakta backend, vendor, retensi, dan identitas badan usaha lengkap.

