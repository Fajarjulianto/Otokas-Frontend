# Rencana Eksekusi Foto Motor Premium

## Tujuan

Menampilkan foto motor hanya untuk member Premium/Juragan pada dua konteks:

1. Galeri atau foto utama pada halaman detail motor.
2. Thumbnail kecil pada daftar motor di dashboard.

Member Gratis tetap melihat UI saat ini berupa ikon motor/fallback dan tidak menerima tampilan foto premium.

## Temuan Kode Saat Ini

- `app/index.tsx` bukan halaman dashboard; file ini hanya mengarahkan pengguna yang sudah login ke `/(tabs)`. Dashboard yang sebenarnya berada di `app/(tabs)/index.tsx`.
- `app/(tabs)/index.tsx` menampilkan lima motor terbaru melalui `MotorListItem`, tetapi masih memakai ikon `Bike` statis sebagai thumbnail.
- `app/(tabs)/stok.tsx` adalah daftar stok lengkap dan juga belum menampilkan foto. File ini dapat memakai komponen thumbnail yang sama agar tampilan daftar konsisten.
- `app/motor/[id].tsx` adalah halaman detail motor dan belum merender `motor.motorImages`.
- Model data sudah siap: `Motor` memiliki `motorImages?: MotorImage[]`, dan setiap gambar memiliki `url`, `storageKey`, serta metadata ukuran opsional.
- Alur upload foto juga sudah tersedia di `src/services/motorServices.ts` dan sudah dipakai pada `app/(tabs)/tambah.tsx` khusus pengguna premium.
- Status premium tersedia melalui `useSubscriptionStatus()`. Nilai `subscription.isPremium` hanya `true` untuk tier `PREMIUM` dengan status `ACTIVE`.

## Keputusan Implementasi

- Gunakan `useSubscriptionStatus()` sebagai sumber utama hak akses. Ambil status satu kali pada level halaman, lalu teruskan `isPremium` ke komponen item; jangan menjalankan query langganan pada setiap kartu.
- Selama status langganan masih dimuat atau gagal diperoleh, anggap fitur foto terkunci. Ini mencegah foto premium muncul sesaat kepada member Gratis.
- Gunakan foto pertama yang memiliki `url` valid sebagai cover/thumbnail.
- Gunakan komponen `Image` bawaan React Native agar tidak menambah dependency baru.
- Jika gambar kosong, URL tidak valid, atau pemuatan gambar gagal, tampilkan fallback ikon `Bike` tanpa merusak layout.
- Client-side gating mengatur tampilan, tetapi backend tetap harus menjadi sumber otorisasi. Jika foto benar-benar tidak boleh diterima oleh member Gratis, respons API `/motors` dan `/motors/:id` perlu menghilangkan `motorImages` atau menyediakan URL hanya untuk subscription Premium aktif.

## Langkah Eksekusi

### 1. Buat komponen thumbnail yang dapat dipakai ulang

Target baru: `src/components/motor/MotorThumbnail.tsx`

- Terima props minimal `images`, `isPremium`, `size`, dan opsi styling.
- Pilih URL foto pertama yang valid.
- Render foto dengan `resizeMode="cover"` hanya ketika `isPremium === true`.
- Tangani `onError` dengan mengganti gambar menjadi placeholder ikon `Bike`.
- Pertahankan sudut membulat, warna latar, dan ukuran tetap agar kartu tidak bergeser ketika gambar dimuat.

### 2. Tambahkan thumbnail pada dashboard sebenarnya

Target: `app/(tabs)/index.tsx`

- Import `useSubscriptionStatus` dan komponen `MotorThumbnail`.
- Ambil `subscription` di `BerandaPage`, lalu hitung `isPremium` dari `subscription?.isPremium ?? false`.
- Ubah props `MotorListItem` agar menerima `motorImages` dan `isPremium`.
- Ganti blok ikon motor berukuran `w-12 h-12` dengan `MotorThumbnail` berukuran sekitar 48 px.
- Saat memetakan `latestMotors`, teruskan `motor.motorImages` dan `isPremium`.
- Jangan mengubah navigasi kartu ke `/motor/${id}`, informasi harga, badge kelengkapan, atau batas lima motor terbaru.

### 3. Tampilkan foto pada detail motor

Target: `app/motor/[id].tsx`

- Import `useSubscriptionStatus` dan `Image`/komponen pendukung galeri yang diperlukan.
- Ambil status langganan satu kali di `MotorDetailPage`.
- Untuk Premium dengan foto tersedia, tampilkan bagian foto di atas kartu identitas/harga:
  - foto utama rasio konsisten (disarankan 16:9), lebar penuh, dan `resizeMode="cover"`;
  - bila ada lebih dari satu foto, gunakan daftar horizontal yang dapat digeser dan indikator posisi/jumlah foto;
  - setiap item memakai `image.id`, `storageKey`, atau kombinasi URL-index sebagai key stabil.
- Bila Premium tidak mempunyai foto atau gambar gagal dimuat, tampilkan placeholder yang tetap proporsional.
- Untuk member Gratis, jangan render galeri foto. Pertahankan susunan detail yang sekarang; opsional tampilkan kartu kecil “Foto motor tersedia di Paket Juragan” yang menuju `/paket` apabila upsell memang diinginkan produk.
- Foto tidak boleh menghalangi state loading, state motor tidak ditemukan, tombol kembali, edit, atau tandai terjual.

### 4. Samakan daftar stok yang disebutkan dalam permintaan

Target: `app/(tabs)/stok.tsx`

- Ambil status premium pada `StokPage`, bukan di setiap `MotorCard`.
- Teruskan `motorImages`/`isPremium` ke kartu atau langsung teruskan objek `item` ke `MotorThumbnail`.
- Letakkan thumbnail kecil di sisi kiri informasi merek dan tahun, dengan fallback ikon yang sama.
- Pastikan badge status, harga, tombol tandai terjual, edit, dan hapus tetap memiliki ruang sentuh dan tidak berubah perilakunya.
- Jika cakupan produk hanya menghendaki thumbnail pada dashboard ringkas, langkah ini dapat dibatasi pada penggunaan komponen/fallback yang sama tanpa mengubah kartu stok. Namun karena `stok.tsx` disebut eksplisit, implementasi yang direkomendasikan adalah menampilkan thumbnail di kedua daftar.

### 5. Pastikan cache foto selalu mutakhir

Target pemeriksaan: `src/hooks/useMotors.ts` dan pemanggil upload foto.

- Setelah upload/replace foto berhasil, invalidasi `motorKeys.all` dan `motorKeys.detail(motorId)` agar dashboard, stok, dan detail langsung memakai data terbaru.
- Jika upload tetap dipanggil langsung dari service seperti saat ini, tambahkan invalidasi di alur sukses halaman tambah/edit atau bungkus proses upload dalam mutation hook khusus.
- Hindari menambahkan query baru per kartu; data thumbnail harus berasal dari respons `useMotors()` yang sudah ada.

### 6. Verifikasi kontrak API dan akses Premium

- Pastikan `GET /motors` mengembalikan minimal foto cover pada `motorImages` agar dashboard/stok tidak perlu memanggil detail untuk setiap motor.
- Pastikan `GET /motors/:id` mengembalikan seluruh urutan `motorImages` untuk galeri detail.
- Konfirmasi apakah endpoint foto hanya boleh digunakan Premium. Dokumentasi saat ini menandai endpoint gambar sebagai `Private`, sedangkan UI upload sudah menguncinya sebagai Premium; backend dan frontend perlu memakai aturan yang sama.
- Pastikan URL gambar dapat diakses aplikasi. Bila bucket tidak publik, API harus mengembalikan signed read URL yang masih berlaku, bukan hanya `storageKey`.

## Skenario Pengujian

### Member Premium

- Motor dengan satu foto menampilkan foto tersebut di detail dan sebagai thumbnail.
- Motor dengan beberapa foto dapat digeser di detail; thumbnail memakai foto pertama.
- Motor tanpa foto menampilkan placeholder.
- URL foto rusak menampilkan placeholder dan tidak menyebabkan crash.
- Setelah menambahkan/mengganti foto, dashboard, stok, dan detail memperbarui gambar tanpa perlu login ulang.

### Member Gratis atau Subscription Tidak Aktif

- Dashboard dan stok selalu menampilkan ikon fallback, walaupun respons motor mengandung `motorImages`.
- Detail tidak menampilkan galeri foto premium.
- Tidak terjadi flash foto ketika status subscription masih loading.
- Navigasi dan seluruh aksi motor tetap berfungsi seperti sebelumnya.

### Regresi UI dan Performa

- Judul panjang, harga kosong, tahun/plat kosong, status `SOLD`, dan data belum lengkap tetap tersusun rapi.
- `FlatList` stok tetap lancar dan tidak membuat request gambar untuk item yang jauh di luar viewport lebih awal dari perilaku native.
- Jalankan lint dan test project, lalu uji manual pada Android/iOS untuk rasio gambar, loading lambat, serta koneksi offline.

## Kriteria Selesai

- Foto detail dan thumbnail hanya terlihat ketika subscription Premium berstatus aktif.
- Dashboard aktual (`app/(tabs)/index.tsx`) menampilkan thumbnail foto pertama tanpa query tambahan per motor.
- Halaman stok memakai perilaku thumbnail/fallback yang konsisten sesuai cakupan yang disepakati.
- Semua kondisi kosong dan error memiliki fallback yang jelas.
- Cache data motor diperbarui setelah perubahan foto.
- Tidak ada perubahan perilaku pada autentikasi di `app/index.tsx`, karena file tersebut hanya bertugas melakukan redirect.
