# Perbaikan profil dan sesi

Gejala: nama dashboard menjadi “Showroom”, form profil kosong, dan simpan menghasilkan Unauthorized.

Penyebab yang ditemukan dalam kode:
- Header default Axios menyimpan access token saat login. Refresh memperbarui SecureStore tetapi header lama tetap digunakan pada request berikutnya.
- Kegagalan refresh akibat jaringan ikut menghapus kredensial tanpa menghapus sesi AuthContext.
- DTO backend tidak menerima alamat; endpoint ganti password dari aplikasi belum tersedia.

Perubahan:
- Request privat mengambil token SecureStore terbaru, refresh bersamaan digabung, kegagalan jaringan mempertahankan sesi, dan refresh yang ditolak mengakhiri sesi aplikasi.
- Nama dashboard memakai dealerName profil/registrasi. Kesalahan memuat profil ditampilkan dengan tombol coba lagi.
- Simpan profil menyinkronkan cache dan AuthContext. Input yang sedang diedit dipertahankan. Telepon/alamat dapat dikosongkan.
- Backend memperbarui User.dealerName dan Tenant.name dalam transaksi; alamat menggunakan Tenant.landingConfig.location.address. Alamat lama/subdomain tetap dipertahankan bila tidak diedit. Nomor telepon profil tetap terpisah dari konfigurasi WhatsApp website.
- POST /api/v1/users/change-password membutuhkan JWT, currentPassword, dan newPassword; memverifikasi password lama, menyimpan hash, menghapus refresh token dan OTP, lalu aplikasi meminta login kembali. Access token lain yang sudah diterbitkan tetap berlaku sampai masa berlakunya habis.
- Email tidak diedit melalui halaman profil ini.

Pemeriksaan API publik 1 Oktober 2026: https://api.otokas.co.id/api/docs-json dapat diakses, tetapi belum mendokumentasikan endpoint change-password dan alamat profil. Backend harus dideploy bersama pembaruan frontend agar alamat/password bekerja. Tidak ada perubahan akun atau password di produksi selama pemeriksaan.

Validasi: pengujian adapter Axios (token lama, refresh bersamaan, jaringan gagal, refresh ditolak, reset publik, token login), layanan profil, cache akun, sinkronisasi profil, service/controller backend, transaksi profil/password dan DTO. TypeScript frontend, build backend, dan lint sumber yang berubah dijalankan. Pengujian pada HP dan akun produksi masih diperlukan setelah deployment.
