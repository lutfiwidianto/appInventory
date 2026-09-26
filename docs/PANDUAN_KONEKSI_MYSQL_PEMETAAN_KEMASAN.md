# PANDUAN PENGATURAN KONEKSI MYSQL (REMOTE ACCESS)
**Halaman**: `/pmcpemetaankemasan` (Departemen PMC - Pemetaan Kemasan FG)  
**Target PC MySQL**: `192.17.17.49`  
**Server Aplikasi**: `192.17.17.201`  
**Database**: `smartone_tungcia`  
**User / Password**: `root` / `lutfigaul`  

---

## 📋 Ringkasan Masalah
Aplikasi inventory di server `192.17.17.201` membutuhkan data dari database MySQL `inventory_tungcia` di PC Anda (`192.17.17.49`). Saat ini koneksi gagal (*timed out / Error 2003*) karena Windows Firewall atau konfigurasi default MySQL masih membatasi akses hanya untuk `localhost (127.0.0.1)`.

Ikuti **3 langkah mudah** di bawah ini pada PC Anda (`192.17.17.49`):

---

## 🚀 LANGKAH 1: Buka Port 3306 di Windows Firewall

Agar server aplikasi diizinkan menghubungi MySQL di PC Anda, buka port `3306` (TCP).

### Cara Cepat (Rekomendasi - Lewat PowerShell):
1. Di PC `192.17.17.49`, buka **PowerShell** dengan cara klik kanan menu Start lalu pilih **"Windows PowerShell (Admin)"** atau **"Terminal (Admin)"**.
2. Salin dan tempel perintah berikut, lalu tekan **Enter**:
   ```powershell
   New-NetFirewallRule -DisplayName "MySQL Remote Port 3306" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Allow
   ```
3. Jika muncul keterangan `OK / True`, port firewall sudah berhasil dibuka.

---

## ⚙️ LANGKAH 2: Atur `bind-address` MySQL agar Menerima Akses Jaringan

Secara default, MySQL sering kali hanya merespons koneksi lokal (`127.0.0.1`). Kita perlu mengubahnya agar bisa diakses oleh IP server.

1. Buka file konfigurasi **`my.ini`** (atau `my.cnf`):
   - **Jika memakai XAMPP**: Buka XAMPP Control Panel > baris MySQL klik **Config** > pilih **`my.ini`** (lokasi biasanya di `C:\xampp\mysql\bin\my.ini`).
   - **Jika memakai Laragon**: Klik kanan ikon Laragon > **MySQL** > **`my.ini`**.
   - **Jika memakai MySQL Server Standalone**: Biasanya ada di `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`.

2. Cari baris `bind-address` menggunakan `Ctrl + F`:
   ```ini
   bind-address = 127.0.0.1
   ```
3. Ubah baris tersebut menjadi `0.0.0.0` (artinya mendengarkan dari semua IP) atau beri tanda pagar (`#`) di depannya untuk menonaktifkan pembatasan:
   ```ini
   # Ganti menjadi:
   bind-address = 0.0.0.0

   # ATAU beri tanda pagar:
   # bind-address = 127.0.0.1
   ```
4. Simpan file (`Ctrl + S`).

---

## 🔑 LANGKAH 3: Berikan Izin Akses Remote pada User MySQL

User `root` default biasanya hanya memiliki hak akses dari `localhost`. Kita perlu mengizinkan `root` dapat diakses dari jaringan.

### Opsi A: Melalui phpMyAdmin (Mudah - Tampilan Web)
1. Buka browser di PC Anda, akses `http://localhost/phpmyadmin`.
2. Klik tab **"User accounts"** (Akun Pengguna).
3. Cari user `root` dengan Host name `localhost` atau klik **"Edit privileges"** (Ubah hak akses).
4. Masuk ke tab **"Login information"**, ubah **Host** dari `localhost` menjadi **Any host (`%`)**.
5. Masukkan password: `lutfigaul` (sesuai konfigurasi sistem).
6. Centang **Grant all privileges** dan klik **Go / Kirim**.

---

### Opsi B: Melalui SQL Query (phpMyAdmin / DBeaver / Navicat / Command Line)
Buka menu **SQL** di phpMyAdmin / database client Anda, lalu jalankan query berikut:

#### Jika menggunakan MariaDB / MySQL 5.7:
```sql
GRANT ALL PRIVILEGES ON smartone_tungcia.* TO 'root'@'%' IDENTIFIED BY 'lutfigaul';
GRANT ALL PRIVILEGES ON smartone_tungcia.* TO 'root'@'192.17.17.201' IDENTIFIED BY 'lutfigaul';
FLUSH PRIVILEGES;
```

#### Jika menggunakan MySQL 8.0+:
```sql
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'lutfigaul';
ALTER USER 'root'@'%' IDENTIFIED BY 'lutfigaul';
GRANT ALL PRIVILEGES ON smartone_tungcia.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

---

## 🔄 LANGKAH 4: Restart Service MySQL

Setelah file `my.ini` dan hak akses diubah, **Restart** service MySQL:
- **XAMPP / Laragon**: Klik tombol **Stop** pada MySQL, tunggu 3 detik, lalu klik **Start**.
- **Windows Services**: Buka `services.msc` > cari **MySQL** atau **MariaDB** > klik kanan lalu pilih **Restart**.

---

## ✅ LANGKAH 5: Verifikasi & Cek Hasil

Setelah melakukan langkah di atas:
1. Buka kembali halaman **`/pmcpemetaankemasan`** di browser (`http://192.17.17.201/pmcpemetaankemasan`).
2. Refresh halaman (`Ctrl + F5`).
3. Alert Ajax error akan hilang, dropdown **Pilih Bahan Kemasan** akan terisi data master kemasan, dan tabel **Rekapitulasi Pemetaan** akan menampilkan data produksi secara otomatis.
