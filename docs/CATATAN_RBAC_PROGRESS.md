# CATATAN PROGRES: Sistem Peran & Izin Dinamis (RBAC)
> Terakhir diperbarui: 21 Mei 2026

---

## ⚠️ PENTING: auth.py TIDAK DIMODIFIKASI
File `app/auth.py` terenkripsi PyArmor. File ini **TIDAK diubah sama sekali**.
Login tetap menggunakan `Level_User` dari tabel `dbo.users` untuk generate JWT token.
Kolom `Level_User` tetap dipertahankan di database untuk kompatibilitas.

---

## Ringkasan Perubahan yang Sudah Dilakukan

### 1. Database (SQL Server - tct_inventory) ✅ SELESAI
Tabel baru yang sudah dibuat:
- `dbo.roles` — Daftar peran (Role_ID, Role_Name, Description)
- `dbo.permissions` — Daftar izin (Permission_ID, Permission_Code, Permission_Name, Module)
- `dbo.role_permissions` — Pemetaan peran ke izin (Role_ID, Permission_ID)
- Kolom `Role_ID` ditambahkan ke tabel `dbo.users` (FK ke dbo.roles)

Data awal yang sudah dimasukkan:
- Peran: SuperAdmin(1), User(2), Order Viewer(3), SPV Gudang(11), Admin Gudang(12), Operator Gudang(13)
- 9 kode izin: USER_CRUD, ROLE_MANAGE, WH_MASTER_EDIT_FULL, WH_MASTER_EDIT_PARTIAL, WH_DELETE_BON, WH_VIEW_PRICING, PMC_DELETE, PMC_EDIT_RETURNS, IT_MANAGE
- SuperAdmin(1) mendapat SEMUA izin
- SPV Gudang(11) mendapat WH_MASTER_EDIT_FULL, WH_VIEW_PRICING
- Admin Gudang(12) mendapat WH_MASTER_EDIT_PARTIAL
- User yang ada sudah dimigrasikan (Role_ID = Level_User)

### 2. Backend Python ✅ SELESAI
File yang dimodifikasi:
- `app/utils.py` — Ditambahkan fungsi `get_user_permissions(username)` dan dekorator `@check_permission(permission_code)`
- `app/users.py` — Route /users, /register, /edit_user, /delete_user sekarang pakai `@check_permission("USER_CRUD")` (bukan lagi `if level_user == 1`). Ditambahkan route baru `/roles` dan `/permissions`.

File yang TIDAK diubah:
- `app/auth.py` — TIDAK DISENTUH (PyArmor)
- Semua file blueprint lainnya (wh_*, pmc_*, dll) — Belum diubah

### 3. Frontend HTML ✅ SELESAI
File baru yang dibuat:
- `Templates/controlpagehtml/users_roles.html` — Halaman admin CRUD peran & penugasan peran ke user
- `Templates/controlpagehtml/access_permissions.html` — Halaman matriks centang izin per peran

### 4. Sidebar Navigation ❌ BELUM
File yang perlu diupdate:
- `Templates/includes/side_bar.html` — Link "Users Role" dan "Access Permission" masih mengarah ke `#`

---

## Yang BELUM Dikerjakan

### A. Update Sidebar (side_bar.html)
Ubah link placeholder `href="#"` menjadi:
- Users Role → `{{url_for('users_bp.get_roles')}}`
- Access Permission → `{{url_for('users_bp.get_permissions')}}`

### B. Integrasi Frontend JS (Opsional / Tahap 2)
File-file JS berikut masih menggunakan pengecekan `levelUser == '1'` secara hardcoded:
- `wh_masterbarang.js` — Cek level 1/11/12 untuk edit master barang
- `wh_invpemasukanbarang.js` — Cek level 1 untuk tombol deleteBon
- `wh_invpengambilanbarang.js` — Cek level 1 untuk tombol deleteBon
- `pmcform.js` — Cek level 1 untuk edit/delete PMC
- `pmc_mutasibarangkeluar.js` — Cek level 1 atau 2
- `peminjamanbarang.js` — Cek level 1
- `permintaan-it.js` — Cek level 1
- `permintaan-void.js` — Cek level 1
- `formgeneralorder.js` — Cek level 1/3 untuk harga
- `wh_ang.js` — Cek level 1
- `wh_allprbarang.js` — Cek level 1
- `dashboard.js` — Cek level 1

Untuk migrasi JS, perlu:
1. Passing array izin user ke template via hidden JSON element
2. Ganti `if (levelUser == '1')` dengan `if (userPermissions.includes('KODE_IZIN'))`

### C. Passing Permissions ke Semua Halaman (context_processor)
Agar semua halaman bisa mengecek izin di template (Jinja2), perlu tambahkan
Flask context_processor di `run.py` yang auto-inject `user_permissions` ke setiap render.

---

## Cara Melanjutkan Besok

1. Jalankan server dev: `start_dev.bat` atau `python run_dev.py`
2. Login sebagai SuperAdmin (level 1)
3. Buka menu Settings → Users Role dan Access Permission
4. Lanjutkan implementasi sidebar + JS migration jika diperlukan

---

## Audit Level User yang Ditemukan (Referensi)

| Level | Nama | Hak Akses Utama |
|-------|------|-----------------|
| 1 | SuperAdmin | Semua akses penuh |
| 2 | User | Akses dasar, PMC mutasi input |
| 3 | Order Viewer | Lihat harga di General Order |
| 11 | SPV Gudang | Edit full master barang |
| 12 | Admin Gudang | Edit partial master barang (Jenis & Racking saja) |
| 13 | Operator Gudang | Read-only gudang |
