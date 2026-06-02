# Lawsy Project Plan & Analysis

Analisis halaman dan rencana kerja untuk mengaktifkan fitur-fitur interaktif (Upload, Edit, Draft, dll.) di aplikasi Lawsy.

## 1. Analisis Halaman Saat Ini

Berdasarkan struktur folder `resources/views/admin`, berikut adalah halaman yang ada dan statusnya:

### Folder `admin/`
- **landingpageadmin.blade.php**: Halaman depan admin (Sudah rapi, visual premium).
- **dashboardadmin.blade.php**: Dashboard utama (Visual bagus, data masih statis).
- **createaccount.blade.php**: Halaman pendaftaran akun baru.
- **SignInadmin.blade.php**: Halaman login.
- **lawyersverification.blade.php**: Halaman verifikasi pengacara.
- **reportlawyer.blade.php**: Halaman laporan pengacara.

### Folder `admin/documents/`
- **upload.blade.php**: Halaman untuk mengunggah artikel hukum (Form sudah ada tapi belum berfungsi).
- **index.blade.php**: Halaman list artikel (Data masih statis).
- **drafts.blade.php**: Halaman list draft (Data masih statis).

### Folder `admin/analytics/`
- **index.blade.php**: Halaman analitik dengan grafik (Visual bagus, data statis).

---

## 2. Rencana Kerja (Plan) Mengaktifkan Fitur

Untuk membuat semua detail kecil menjadi aktif, berikut adalah langkah-langkah yang diusulkan:

### A. Fitur Dokumen & Artikel (`documents/`)
1. **Halaman Upload (`upload.blade.php`)**:
   - Hubungkan form input (Judul, Kategori, Ringkasan, dll.) ke Backend.
   - Buat fungsi **Save Draft** dan **Publish** di Controller.
   - Aktifkan fitur upload gambar untuk "Featured Image" menggunakan input file asli yang disembunyikan.
   - Integrasikan library Rich Text Editor (seperti Quill.js atau CKEditor) pada bagian teks area agar Toolbar (B, I, U, dll.) bisa digunakan.
2. **Halaman Index & Drafts**:
   - Ambil data artikel dan draft dari Database untuk ditampilkan secara dinamis.
   - Tambahkan tombol **Edit** dan **Delete** yang berfungsi.

### B. Fitur Analitik (`analytics/`)
- Gunakan JavaScript (misalnya Chart.js) untuk membuat grafik menjadi dinamis.
- Buat API dummy atau hubungkan ke database untuk menarik data statistik bulanan agar grafik bergerak.

### C. Fitur Verifikasi & Laporan
- Aktifkan tombol "Approve", "Reject", dan "Delete" menggunakan AJAX agar halaman tidak perlu reload saat aksi dilakukan.

---

## 3. Langkah Teknis Implementasi (Step-by-Step)

### Step 1: Database & Model (Backend Dasar)
- Buat Migration untuk tabel `articles` (id, title, content, summary, category, status [draft/published], image_path, author_id).
- Buat Model `Article.php`.

### Step 2: Controller & Routing
- Buat `ArticleController` untuk menangani Create, Read, Update, Delete (CRUD).
- Definisikan Route di `routes/web.php` untuk mengarahkan form ke Controller.

### Step 3: Frontend Binding (Menghubungkan View)
- Ubah tag `<button>` di `upload.blade.php` menjadi bagian dari `<form>` dengan `method="POST"`.
- Tambahkan CSRF token `@csrf` di setiap form.

---

## 4. Informasi Database

Proyek ini menggunakan dua jenis database untuk mendukung arsitektur mikroservis:

### A. SQLite (Laravel Framework)
Digunakan oleh Laravel untuk manajemen sesi, autentikasi dasar, dan fungsionalitas aplikasi web utama.
- **Path**: `database/database.sqlite`
- **Tujuan**: Backend Laravel.

### B. PostgreSQL (Go Backend)
Digunakan oleh Go backend (microservice) untuk data inti seperti Kasus, Pengacara, Dokumen, dan User.
- **Nama Database**: `lawsy`
- **User**: `postgres`
- **Host**: `127.0.0.1`
- **Port**: `5432`

---

## 5. Perintah Melihat Database

Berikut adalah perintah untuk mengakses dan melihat isi database melalui terminal:

### Melihat SQLite (Laravel)
Pastikan Anda memiliki `sqlite3` terinstal di sistem Anda.
```bash
# Masuk ke CLI SQLite
sqlite3 database/database.sqlite

# Perintah umum di dalam sqlite3:
# .tables               - Melihat daftar tabel
# .schema <nama_tabel>  - Melihat skema tabel
# SELECT * FROM users;  - Melihat data user
# .quit                 - Keluar
```

### Melihat PostgreSQL (Go Backend)
Pastikan PostgreSQL sedang berjalan.
```bash
# Masuk ke CLI PostgreSQL
psql -U postgres -d lawsy

# Perintah umum di dalam psql:
# \dt                   - Melihat daftar tabel
# \d <nama_tabel>       - Melihat detail tabel
# SELECT * FROM cases;  - Melihat data kasus
# \q                    - Keluar
```

---

## Kesimpulan & Persetujuan
Rencana ini akan mengubah tampilan statis yang sudah bagus menjadi aplikasi yang benar-benar berfungsi. 
**Apakah Anda setuju dengan rencana ini?** Jika setuju, saya akan mulai dari **Step 1** (Database & Model).
