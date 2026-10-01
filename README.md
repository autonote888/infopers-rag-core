# PANDUAN LENGKAP & ALUR SISTEM INFOPERS SSDM POLRI 2026

Sistem Informasi Manajemen Terpadu **Staf Sumber Daya Manusia Kepolisian Negara Republik Indonesia (SSDM Polri)** berbasis Data Induk 483.355 Personel, Struktur SOTK Resmi (Perkap No. 6 Tahun 2017), Kecerdasan Buatan Lokal On-Premise (Ollama AI RAG), Layanan Autentikasi Tunggal Terpusat (Keycloak 26 IAM Standalone SSO), serta Pencadangan Otomatis Data & Kode Sumber.

---

## DAFTAR ISI SISTEM INFOPERS
* **[1. Urutan Alur Pemrograman & Arsitektur Sistem](#1-urutan-alur-pemrograman--arsitektur-sistem)**
* **[2. Modul Utama Sistem Operasional Infopers](#2-modul-utama-sistem-operasional-infopers)**
* **[3. Panduan Cara Menggunakan Sistem (Alur Pengguna & Login SSO)](#3-panduan-cara-menggunakan-sistem)**
* **[4. Panduan Teknis Menjalankan Sistem (1-Klik & Manual)](#4-panduan-teknis-menjalankan-sistem)**
* **[5. Prosedur Pencadangan Menyeluruh (Full Database Dump & Source Code Backup)](#5-prosedur-pencadangan-menyeluruh-full-database-dump--source-code-backup)**
* **[6. Dokumen Perencanaan Pengadaan Hardware & Estimasi Anggaran (RAB)](#6-dokumen-perencanaan-pengadaan-hardware--estimasi-anggaran-rab)**
* **[7. Tata Kelola Keamanan Repositori & Konfigurasi .gitignore](#7-tata-kelola-keamanan-repositori--konfigurasi-gitignore)**
* **[8. Spesifikasi REST API, Dual-Auth, CRUD, & Swagger UI](#8-spesifikasi-rest-api-dual-auth-crud--swagger-ui)**
* **[9. Implementasi Produksi Enterprise: Keycloak Standalone IAM & SSO Terpadu](#9-implementasi-produksi-enterprise-keycloak-standalone-iam--sso-terpadu)**

---

## 1. URUTAN ALUR PEMROGRAMAN & ARSITEKTUR SISTEM

Sistem INFOPERS dibangun dengan arsitektur **Enterprise Decoupled Clean Architecture** yang memisahkan lapisan otentikasi identitas (IAM Keycloak), basis data relasional berkecepatan tinggi (PostgreSQL 18), REST API Backend (Golang), mesin inferensi AI lokal (Ollama), dan antarmuka interaktif responsif (Next.js 16):

```mermaid
flowchart TD
    subgraph 1. LAPISAN IDENTITY & ACCESS MANAGEMENT (Keycloak IAM)
        KC_SRV[Keycloak Standalone Server\nPort 8080 / Container Docker]
        KC_DB[(PostgreSQL 16 Khusus IAM\nPort 5432 Internal / Container)]
        KC_REALM[Realm: ssdm-polri\nClient: infopers-frontend]
        KC_KEYS[JWKS Public Keys RS256\nEndpoint: /protocol/openid-connect/certs]
    end

    subgraph 2. LAPISAN BASIS DATA OPERASIONAL (PostgreSQL 18 Local)
        DB1[(data_polri_september_2026\n483.355 Baris Personel)]
        DB2[(dummy_kompetensi_diklat\nSertifikasi & Riwayat)]
        DB3[(dummy_jabatan_fungsional\nJenjang Hak JF & DSPP)]
        DB4[(audit_trail_ledger\nSHA-256 Hash Chain)]
    end

    subgraph 3. REST API BACKEND (Golang Port 8085)
        API_BOOT[main.go / Port 8085]
        API_POOL[database.go / Conn Pool & GIN Trigram]
        API_AUTH[middleware/auth.go / Dual-Auth Engine\nValidasi RS256 JWKS Keycloak & HS256 Fallback]
        API_H_AUTH[handlers/auth_handler.go]
        API_H_PERS[handlers/personel_handler.go]
        API_H_DASH[handlers/dashboard_handler.go]
        API_H_AI[handlers/ai_handler.go / NLP Entity & Intent Parser]
        API_H_REM[handlers/remunerasi_handler.go]
    end

    subgraph 4. MESIN AI LOKAL ON-PREMISE (Ollama Port 11434)
        OLLAMA_SRV[Ollama Daemon / Port 11434]
        OLLAMA_MOD[Model: ssdm-ai / llama3:8b]
        RAG_PIPELINE[RAG Pipeline: Fakta Database 483K + Prompt Pengguna]
    end

    subgraph 5. FRONTEND APLIKASI (Next.js 16 + Tailwind CSS)
        FE_APP[src/components/MainApp.tsx / Controller Utama]
        FE_KC[src/lib/keycloak.ts / OIDC Redirect & SLO Guard]
        FE_VIEWS[src/components/views/* / Modul AI, SOTK, Personel, Polda, Satker]
    end

    KC_SRV <--> KC_DB
    KC_SRV --- KC_REALM
    KC_REALM --- KC_KEYS

    FE_APP <-->|1. OIDC SSO Redirect & Token Exchange| KC_SRV
    FE_APP <-->|2. JWT Bearer REST API Request| API_BOOT
    API_BOOT --> API_POOL --> DB1 & DB2 & DB3 & DB4
    API_BOOT --> API_AUTH
    API_AUTH -.->|3. In-Memory JWKS Key Cache| KC_KEYS
    API_AUTH --> API_H_PERS & API_H_DASH & API_H_AI & API_H_REM
    API_H_AI <-->|4. Fast Entity Search / GIN Index| DB1
    API_H_AI <-->|5. Grounded RAG Prompt| OLLAMA_SRV --> OLLAMA_MOD
```

### Alur Kerja Mesin AI & Sinkronisasi Data Real-Time:

```
[Pengguna Bertanya: Contoh "cari personel atas nama andre"]
       │
       ▼
[Backend Golang: NLP Entity & Intent Parser (ai_handler.go)]
(Mendeteksi pola frasa: "atas nama", "bernama", "namanya", NRP, satker, pangkat)
       │
       ▼
[PostgreSQL 18 Core Engine (483.355 Data Personel)]
(Eksekusi indeks GIN Trigram 'nama ILIKE %andre%' dalam 0.01 - 0.05 detik)
       │
       ▼
[Data Fakta Riil Diambil (1.751 Record Ditemukan, 10 Teratas Disajikan)]
(Nama Lengkap, NRP, Pangkat, Satker, Jabatan, Sisa Cuti, Tunkin, Diklat)
       │
       ▼
[Grounding ke Mesin Ollama (ssdm-ai)]
(Fakta database dijadikan acuan kebenaran tunggal / Anti-Halusinasi)
       │
       ▼
[Jawaban Terstruktur & Resmi Disajikan ke Layar Pengguna]
```

#### Keunggulan Mesin AI INFOPERS:
1. **Pencarian Nama Fleksibel & Cerdas**: Pengguna dapat mengetik secara santai (*"cari personel atas nama andre"*, *"siapa personel bernama rudi di polda metro"*, *"personel polri pangkat kombes"*). Stop-words disaring otomatis dan nama target langsung diekstrak.
2. **Anti-Halusinasi (Single Source of Truth)**: AI tidak mengarang data personel. Jika nama tidak ada di basis data 483.355 personel, AI menyatakan data tidak ditemukan.
3. **Respon Sub-Detik (< 50 ms)**: Pengambilan fakta data personel dari PostgreSQL selesai dalam waktu sekejap berkat indeks GIN Trigram.
4. **Fallback Otomatis**: Jika service Ollama sedang tidak aktif, sistem backend tetap menyajikan data personel secara akurat langsung dari basis data tanpa error.

---

## 2. MODUL UTAMA SISTEM OPERASIONAL INFOPERS

Sistem antarmuka difokuskan pada modul-modul operasional yang terhubung langsung ke basis data riil:

| No | Modul Operasional | Deskripsi Fungsi | Komponen Tampilan |
|---|---|---|---|
| **1** | **Portal Pilihan Modul (Landing Page)** | Gerbang navigasi utama pasca-login dengan 2 kartu interaktif (CRUD Personel vs RAG AI), integrasi *Top Laser Bar*, dan transisi hologram. | `PortalLandingView.tsx` |
| **2** | **CRUD Personel Presisi (483K Data)** | Modul manajemen penuh data kepegawaian 483.355 personel riil (Tambah, Ubah, Hapus, Detail Gaji/Tunkin/JF), filter korps (POLRI/ASN/PPPK), dan *Cyber Shimmer Skeleton Loader*. | `CrudPersonelView.tsx` |
| **3** | **Pencarian Cerdas Personel (Ollama AI / RAG)** | Layar antarmuka percakapan interaktif ala ChatGPT untuk tanya jawab cerdas berbasis *Live SQL Query* ke database PostgreSQL 483K dan penalaran model `ssdm-ai`. | `OllamaAiView.tsx` |
| **4** | **SOTK SSDM Polri** | Struktur Organisasi & Tata Kerja Kelembagaan resmi sesuai Perkap No. 6 Tahun 2017 (6 dokumen lembar eselon terpadu interaktif dengan zoom & pan). | `SotkView.tsx` |
| **5** | **Data Personel SSDM Polri (Dashboard)** | Rekapitulasi statistik nasional 483.355 personel (Anggota Polri 96,4%, ASN/PNS 3,25%, PPPK 0,35%) dengan tabel pencarian instan, filter pangkat, dan visualisasi data. | `DashboardView.tsx` |
| **6** | **Data Polda SSDM Polri** | Direktori sebaran 38 Kepolisian Daerah (Polda) seluruh Indonesia beserta jumlah satker dan kekuatan personel. | `PoldaSatkerView.tsx` |
| **7** | **Data Satker SSDM Polri** | Direktori 1.502 Satuan Kerja di tingkat Mabes Polri dan Polda jajaran. | `PoldaSatkerView.tsx` |

---

## 3. PANDUAN LENGKAP CARA MENGGUNAKAN SISTEM

### Langkah 1: Masuk ke Sistem (Login Keycloak SSO Terpadu)

Sistem INFOPERS menggunakan **Keycloak Single Sign-On (SSO)** murni berstandar industri (*Default Theme `keycloak.v2`*) dengan proteksi Kriptografi Asimetris OIDC RS256:

1. **Buka Peramban (Browser)**:
   Akses alamat: `http://localhost:3000`.
2. **Pengalihan Otomatis ke Keycloak SSO**:
   Jika belum memiliki sesi aktif, sistem langsung mengarahkan Anda ke formulir login resmi Keycloak SSDM Polri di:
   `http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/auth...`
3. **Akun Pengujian Lokal (Development / Testing Environment)**:
   Gunakan akun demo yang telah terdaftar di Keycloak:
   * **Superadministrator Nasional**:
     - **Username**: `admin.nasional`
     - **Password**: `Polri2026!`
     - **Hak Akses**: `SUPERADMIN` (Akses penuh ke seluruh modul, data nasional 483K, CRUD personel, dan audit log).
   * **Personel Mandiri**:
     - **Username / NRP**: `04031518`
     - **Password**: `Polri2026!`
     - **Hak Akses**: `PERSONEL` (Akses portal, asisten AI Tribrata, profil kedinasan, dan data mandiri).
   
   > [!NOTE]
   > Akun dan kata sandi di atas merupakan kredensial pengujian lokal (*development/staging*). Pada implementasi server produksi kedinasan Mabes Polri, kata sandi wajib diperbarui secara berkala melalui Keycloak Admin Console.

4. **Verifikasi Kriptografi Asimetris (RS256 JWT Token)**:
   Setelah berhasil login, Keycloak menandatangani token OIDC menggunakan *Private Key* RSA. Backend Golang memverifikasi keaslian tanda tangan digital token tersebut secara langsung via Keycloak JWKS Public Key (`http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/certs`). Hal ini menjamin token **tidak dapat dipalsukan atau dimodifikasi oleh pihak luar**.
5. **Tampilan Default Mode Gelap (Dark Mode)**:
   Setelah otentikasi berhasil, antarmuka web secara otomatis mengaktifkan **Mode Gelap (*Dark Mode*)** yang elegan, presisi, dan nyaman di mata untuk operasional jangka panjang.
6. **Keluar Sistem Instan (Single Logout / SLO)**:
   Klik tombol merah **"Keluar"** di pojok kanan atas. Sistem langsung memusnahkan sesi lokal dan mengakhiri sesi SSO di server Keycloak secara tuntas, lalu langsung mengembalikan Anda ke layar login Keycloak murni tanpa jeda notifikasi perantara.
7. **Mode Darurat / Login Cadangan Lokal (Emergency Fallback)**:
   Jika layanan Docker Keycloak sewaktu-waktu belum diaktifkan, Anda dapat langsung mengakses `http://localhost:3000/?mode=local` untuk masuk via basis data lokal internal (Superadmin: `admin.nasional` / `Polri2026!`).

---

### Langkah 2: Cara Menambah & Mengelola Pengguna di Keycloak Admin Console

Untuk menambahkan personel, staf, atau operator baru ke dalam sistem autentikasi Keycloak:

1. Buka konsol administrasi Keycloak: **`http://localhost:8080/admin`**
2. Masuk menggunakan akun Master Administrator:
   - **Username**: `admin`
   - **Password**: `Polri2026!`
3. Di pojok kiri atas, pastikan Realm yang aktif adalah **`ssdm-polri`** (bukan `master`).
4. Klik menu **Users** di bilah navigasi kiri, lalu klik tombol **Add user**.
5. Isi formulir data personel:
   - **Username**: Masukkan NRP atau NIP personel (contoh: `04031519` atau `budi.santoso`).
   - **Email**: Opsional (contoh: `budi.santoso@ssdm.polri.go.id`).
   - **First Name**: Nama depan (contoh: `Budi`).
   - **Last Name**: Nama belakang & gelar (contoh: `Santoso, S.I.K.`).
   - Ubah toggle **Email verified** menjadi **ON**.
   - Klik **Create**.
6. **Atur Kata Sandi Pengguna**:
   - Buka tab **Credentials** di bagian atas detail pengguna.
   - Klik tombol **Set password**.
   - Masukkan kata sandi yang diinginkan.
   - Pastikan toggle **Temporary** diatur ke **OFF** (agar pengguna tidak dipaksa mengganti sandi saat login awal).
   - Klik **Save** lalu konfirmasi **Save password**.
7. **Berikan Hak Akses Kedinasan (Role Mapping)**:
   - Buka tab **Role mapping**, lalu klik **Assign role**.
   - Pilih peran sesuai wewenang personel:
     * **`SUPERADMIN`**: Pejabat pengelola atau staf administrator SSDM Mabes Polri.
     * **`ADMIN_POLDA`**: Administrator Ro SDM tingkat Polda jajaran.
     * **`ADMIN_POLRES`**: Operator Bag SDM tingkat Polres jajaran.
     * **`PERSONEL`**: Anggota Polri atau ASN/PPPK untuk akses mandiri.
   - Klik **Assign**.
8. Pengguna baru langsung aktif secara instan dan dapat langsung login di `http://localhost:3000` tanpa perlu memulai ulang server!

---

### Langkah 3: Navigasi Portal Modul & Animasi Transisi Keren

Setelah login berhasil, sistem menyajikan layar beranda dengan 2 pilihan modul utama dalam format kartu interaktif:
* **Kartu CRUD (Kiri)**: Akses langsung ke modul manajemen data personel terintegrasi.
* **Kartu RAG (Kanan)**: Akses langsung ke asisten kecerdasan buatan terpadu (Ollama AI).

#### Fitur Animasi & Transisi Futuristik:
1. **Top Cyber Laser Bar**: Sinar laser gradasi neon (*Cyan & Electric Blue*) di bagian paling atas layar yang bergerak cepat saat terjadi pergantian modul, pencarian data, atau pemrosesan AI.
2. **Holographic Dual-Ring Loader**: Saat berpindah antar-modul utama, tampil transisi hologram dua cincin berputar (biru presisi & emas Tribrata) dengan lambang 3D SSDM Polri mengapung disertai gelombang radar (*radar pulse wave*).
3. **Smooth Page Transition (`animate-page-enter`)**: Efek perpindahan halaman ultra-halus berbasis *blur-fade & micro-scale* (`cubic-bezier(0.16, 1, 0.3, 1)`).
4. **Cyber Shimmer Skeleton Loader**: Saat menyaring atau mencari data pada tabel CRUD, sistem menampilkan baris-baris *skeleton table* bercahaya dinamis (*shimmer highlight*) menggantikan pemuatan biasa.
5. **Neural Reasoning Indicator**: Saat asisten AI sedang menelusuri data 483.355 personel, tampil lencana komputasi neural dengan *ring spinner* dan titik pemindaian real-time.

---

### Langkah 4: Menggunakan Modul CRUD Personel Presisi

1. Klik tombol **"CRUD"** pada beranda modul atau klik menu **"CRUD Personel"** pada pill navigasi atas.
2. **Pencarian Instan**: Ketik nama, NRP/NIP, pangkat, atau satuan kerja pada kolom pencarian (hasil langsung tersaring secara *real-time*).
3. **Filter Korps**: Pilih tombol filter **Semua**, **POLRI**, **ASN**, atau **PPPK** untuk memilah komposisi personel.
4. **Tambah Personel Baru**: Klik tombol biru **"Tambah Personel"** untuk membuka modal formulir penambahan data dengan validasi otomatis.
5. **Ubah Data & Detail**: Klik tombol aksi pada baris personel untuk melihat biodata lengkap, rekam jejak pangkat, jabatan fungsional, dan rincian tunjangan kinerja (tunkin).
6. **Hapus Data**: Hapus data yang tidak valid dengan konfirmasi keamanan.
7. **Pilihan Modul / RAG**: Klik tombol **"Pilihan Modul"** untuk kembali ke beranda atau **"Buka RAG (AI)"** untuk beralih ke asisten pintar.

---

### Langkah 5: Menggunakan Pencarian Cerdas Personel (Ollama AI / RAG)

1. Klik tombol **"RAG"** pada beranda modul.
2. Antarmuka bergaya ChatGPT minimalis akan menyambut Anda dengan status lencana hijau **"Ollama AI Terhubung (ssdm-ai:latest)"**.
3. Ajukan pertanyaan dalam bahasa sehari-hari:
   - *"Cari personel atas nama andre"*
   - *"Berapa jumlah personel di Polda Jatim?"*
   - *"Berapa personel polri, pns, dan pppk di Puskeu?"*
   - *"Cari personel pangkat AKP di Bareskrim"*
   - *"Bagaimana syarat Masa Persiapan Pensiun (MPP) anggota Polri?"*
4. **Prinsip RAG Real-Time**: AI tidak berhalusinasi karena seluruh angka statistik dan fakta personel ditarik langsung secara *live SQL query* dari tabel PostgreSQL `public.data_polri_september_2026`.
5. Klik tombol **"Ekspor"** untuk mengunduh seluruh transkrip percakapan ke dalam berkas teks (.txt), atau **"Obrolan Baru"** untuk memulai sesi kueri segar.

---

### Langkah 6: Menggunakan Modul SOTK, Data Polda, dan Data Satker

1. Klik tombol **"Portal SSDM"** di header atas untuk masuk ke mode website komprehensif dengan bilah sisi (Sidebar).
2. **SOTK SSDM Polri**: Pelajari 6 lembar bagan organisasi eselon resmi (As SDM, Biro Binkar, Dalpers, Watpers, Psikologi, dan Rorenmin) dengan fitur zoom & pan kanvas.
3. **Data Personel (Dashboard)**: Analisis grafik rekapitulasi nasional 483.355 personel (POLRI 96,40%, ASN/PNS 3,25%, PPPK 0,35%).
4. **Data Polda**: Direktori sebaran kekuatan personel di 38 Kepolisian Daerah seluruh Indonesia.
5. **Data Satker**: Direktori lengkap 1.502 Satuan Kerja operasional di tingkat Mabes dan Polda jajaran.

---

### Mengubah Tema Tampilan (Mode Gelap / Mode Cerah)

- Klik tombol toggle **"Cerah"** / **"Gelap"** di pojok kanan atas setiap halaman.
- Sistem secara instan menyesuaikan seluruh palet warna dengan rasio kontras tinggi yang presisi.

---

## 4. PANDUAN TEKNIS MENJALANKAN SISTEM

### METODE 1: Cara Cepat 1-Klik (`jalankan_semua.bat`)

Telah disediakan skrip otomatis satu klik yang menangani seluruh alur kerja sistem dari awal hingga siap digunakan:

* **Cukup klik ganda (double-click) file:**  
  **`jalankan_semua.bat`** (atau jalankan `.\jalankan_semua.ps1` via PowerShell).

#### Urutan Kerja Otomatis yang Dilakukan Skrip:
1. **Pencadangan Otomatis Penuh (`backup.ps1`)**:
   Mencadangkan basis data PostgreSQL 483.355 baris (compressed `.dump` & schema SQL), modul konfigurasi Keycloak IAM, source code Golang, Next.js, dan AI ke folder `backups/`.
2. **Pembersihan Port**:
   Membebaskan alokasi port 3000 dan 8085 dari sisa proses sebelumnya agar tidak terjadi konflik (*port in use*).
3. **Aktivasi Keycloak IAM SSO (Port 8080)**:
   Mendeteksi keberadaan Docker Desktop dan menyalakan kontainer `keycloak-ssdm-iam` serta `keycloak-db-ssdm`.
4. **Inisialisasi Model AI (Port 11434)**:
   Memverifikasi model `ssdm-ai` di Ollama, meregistrasikannya dari `ai/Modelfile` jika belum ada, dan menjalankannya di jendela terminal terpisah.
5. **Aktivasi Backend REST API Golang (Port 8085)**:
   Menjalankan biner performa tinggi `infopers_server.exe` yang langsung terhubung ke basis data PostgreSQL dan melayani Dual-Auth RS256/HS256.
6. **Aktivasi Frontend Next.js (Port 3000)**:
   Menjalankan antarmuka web Next.js dan membuka peramban Google Chrome / Microsoft Edge secara otomatis ke `http://localhost:3000`.

---

### METODE 2: Menjalankan Secara Manual (Per Terminal)

Jika Anda ingin menjalankan atau men-debug setiap komponen secara terpisah di terminal PowerShell masing-masing:

#### Terminal 1: Layanan Keycloak IAM SSO (Docker)
```powershell
cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\keycloak_setup"
docker compose up -d
```
> Layanan SSO aktif di: `http://localhost:8080`.  
> Admin Console: `http://localhost:8080/admin` (Akun: `admin` / `Polri2026!`).

#### Terminal 2: Mesin AI Lokal (Ollama)
```powershell
ollama run ssdm-ai
# Atau jika menggunakan model standar Ollama:
ollama run llama3:8b
```
> Layanan AI aktif di: `http://localhost:11434` (Status: `Ollama is running`).

#### Terminal 3: Backend REST API Golang
```powershell
cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_backend"
.\infopers_server.exe
# Atau kompilasi & jalankan langsung dari source code:
go run main.go
```
> Backend aktif di: `http://localhost:8085`.

#### Terminal 4: Frontend Web Antarmuka (Next.js 16)
```powershell
cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_frontend"
npm run dev
```
> Web antarmuka aktif di: `http://localhost:3000`.

---

## 5. PROSEDUR PENCADANGAN MENYELURUH (FULL DATABASE DUMP & SOURCE CODE BACKUP)

Sistem telah dilengkapi modul pencadangan mandiri komprehensif (`backup.ps1` dan `backup.bat`) yang menjamin keselamatan seluruh aset digital sistem (data PostgreSQL lengkap, konfigurasi IAM Keycloak, source code, dan dokumentasi).

### A. Cakupan Berkas yang Dicadangkan:
1. **Full Database Dump PostgreSQL 18**:
   - Menjalankan `pg_dump.exe` dengan format biner terkompresi `-F c` (`infopers_database_full.dump`).
   - Ukuran data 483.355 personel dan audit trail (~2.6 GB uncompressed) berhasil dikompresi menjadi **~169 MB**.
   - Menyimpan berkas skema struktur tabel DDL SQL (`infopers_database_schema.sql`).
2. **Modul IAM Keycloak**:
   - Seluruh folder `keycloak_setup/` termasuk berkas konfigurasi realm `realm-ssdm-polri.json` dan `docker-compose.yml`.
3. **Backend REST API Golang**:
   - Seluruh source code Go, konfigurasi handler, middleware, dan biner `infopers_server.exe`.
4. **Frontend Next.js**:
   - Seluruh komponen UI, view, context, dan aset publik (tanpa folder sampah `node_modules` atau cache `.next`).
5. **Model AI & Konfigurasi**:
   - File konfigurasi model `ai/Modelfile` dan prompt engineering SSDM.
6. **Dokumen Perencanaan & Logo**:
   - Berkas RAB pengadaan hardware, panduan sistem, skrip peluncur batch, dan aset logo resmi Polri.

### B. Cara Menjalankan Pencadangan:
- **Otomatis**: Berjalan otomatis setiap kali `jalankan_semua.bat` dijalankan.
- **Manual (1-Klik)**: Klik ganda file shortcut **`backup.bat`**.
- **Via PowerShell dengan Label Kustom**:
  ```powershell
  .\backup.ps1 -Keterangan "backup_sebelum_pembaruan_modul"
  ```
- **Hasil Arsip**: Tersimpan di folder `backups/`, contoh:  
  `backups/backup_infopers_2026-10-01_19-35-12_auto_backup_sebelum_run.zip` (Ukuran total ~182 MB).

### C. Prosedur Pemulihan Basis Data (Restore Database):
Jika sewaktu-waktu basis data perlu dipulihkan di komputer baru atau server lain:
1. Ekstrak file zip backup, ambil file `database_backup/infopers_database_full.dump`.
2. Buat database kosong di PostgreSQL:
   ```sql
   CREATE DATABASE postgres;
   ```
3. Jalankan perintah `pg_restore`:
   ```powershell
   pg_restore -U postgres -h localhost -p 5432 -d postgres -c -v "infopers_database_full.dump"
   ```
4. Seluruh 483.355 baris data personel beserta indeks dan relasinya akan pulih secara utuh dalam hitungan detik.

---

## 6. DOKUMEN PERENCANAAN PENGADAAN HARDWARE & ESTIMASI ANGGARAN (RAB)

Telah disusun dokumen analisis komputasi enterprise, spesifikasi teknis hardware, kebutuhan VRAM/RAM per library, serta Rencana Anggaran Biaya (RAB) pengadaan server AI on-premise Mabes Polri:
* **File Dokumen Lengkap**: [`DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md`](file:///d:/1.%20MASTER/antigravityIDE/PROJECT/programingdatassdm/DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md)
* **Kebutuhan VRAM Model AI**: 16 GB - 48 GB (Llama 3 8B, Qwen 2.5 14B, DeepSeek R1).
* **Kebutuhan RAM Basis Data**: 32 GB - 64 GB ECC (483.355 data personel).
* **Total Estimasi Anggaran Pengadaan (RAB)**: **Rp 897.600.000,-** (Server GPU Dual RTX A6000 Ada 96GB + Server Database NVMe RAID-10 + NAS Backup 48TB + Switch 10G & UPS 10kVA).

---

## 7. TATA KELOLA KEAMANAN REPOSITORI & KONFIGURASI .GITIGNORE

Repositori ini telah dikonfigurasi dengan standar keamanan repositori tingkat enterprise. Seluruh kredensial sensitif, berkas snapshot berukuran besar, binary kompilasi, dan dependensi lingkungan diisolasi menggunakan `.gitignore` berlapis (Root `.gitignore`, `infopers_backend/.gitignore`, dan `infopers_frontend/.gitignore`).

### A. Kebijakan Isolasi Berkas:
1. **Keamanan Kredensial & Lingkungan**:
   - Seluruh berkas `.env`, `.env.local`, `.env.*.local` diblokir dari commit git untuk mencegah kebocoran password database PostgreSQL maupun kunci rahasia JWT.
   - Template konfigurasi disediakan di `infopers_backend/.env.example`.
   - Akun yang tertera pada panduan dan skrip peluncur (`admin.nasional` / `Polri2026!`) adalah **Akun Demo / Mock Lokal**, bukan kredensial server produksi kedinasan.
2. **Isolasi Dependensi & Artefak Kompilasi**:
   - Direktori `node_modules/` dan build Next.js (`.next/`, `out/`) diabaikan agar ukuran repositori git tetap ringan dan bersih.
3. **Perlindungan Berkas Backup & Database**:
   - Direktori `backups/` dan seluruh berkas arsip `*.zip` diabaikan sehingga snapshot cadangan tidak membebani remote git.
   - Berkas dump basis data mentah (`*.dump`, `*.sql.gz`) dikecualikan untuk kepatuhan perlindungan data pribadi personel.

---

## 8. SPESIFIKASI REST API, DUAL-AUTH, CRUD, & SWAGGER UI

Sistem INFOPERS mengadopsi standar **RESTful API v1** dengan format JSON, autentikasi ganda (Dual-Auth), dan dokumentasi antarmuka Swagger UI interaktif.

### A. Arsitektur Dual-Authentication Backend Golang (`middleware/auth.go`):
Backend Golang dilengkapi validator pintar yang secara otomatis mengenali dua jenis token tanpa konfigurasi rumit:
1. **Token Keycloak OIDC (Algoritma RS256 - Asimetrik)**:
   - Header token diperiksa: jika `alg == "RS256"`, token divalidasi menggunakan Public Key Keycloak yang di-cache di memori internal Golang dari endpoint JWKS `/protocol/openid-connect/certs`.
   - Nama pengguna diekstrak dari klaim `preferred_username` dan peran diekstrak dari `realm_access.roles`.
2. **Token Internal JWT Fallback (Algoritma HS256 - Simetrik)**:
   - Jika `alg == "HS256"`, token divalidasi menggunakan `JWT_SECRET` internal backend. Memastikan sistem tetap berjalan lancar saat mode darurat lokal aktif.

### B. Tabel Endpoint REST API Utama:

| Metode | Endpoint Path | Autentikasi | Fungsi & Deskripsi |
|---|---|---|---|
| `POST` | `/api/login` | Publik | Otentikasi fallback lokal, menghasilkan token JWT Bearer 24 jam |
| `GET` | `/api/auth/me` | JWT / Keycloak | Memverifikasi sesi aktif dan mengembalikan data identitas pengguna |
| `GET` | `/api/personel` | JWT / Keycloak | Mengambil daftar personel dengan parameter pencarian `?q=` dan filter `?polda=` |
| `POST` | `/api/personel` | Keycloak / Superadmin | Menambahkan data personel baru langsung ke database (Create) |
| `GET` | `/api/personel/{nip_nrp}` | JWT / Keycloak | Mengambil detail lengkap personel, jabatan fungsional, dan riwayat dinas |
| `PUT` | `/api/personel/{nip_nrp}` | Keycloak / Superadmin | Memperbarui biodata, pangkat, gaji, tunjangan, dan jabatan (Update) |
| `DELETE` | `/api/personel/{nip_nrp}` | Keycloak / Superadmin | Menghapus data personel dari database secara permanen (Delete) |
| `GET` | `/api/dashboard/stats` | JWT / Keycloak | Rekapitulasi agregasi statistik nasional (Polri, ASN, PPPK, Tunkin) |
| `GET` | `/api/polda/summary` | Publik / Keycloak | Rekapitulasi jumlah personel dan satker per Polda di 38 provinsi |
| `GET` | `/api/polda/satker` | Publik / Keycloak | Daftar Satuan Kerja berdasarkan Polda terpilih |
| `POST` | `/api/ai/ask` | Publik / Keycloak | Kueri cerdas berbasis RAG ke Model Ollama (`ssdm-ai`) dengan fast entity parsing |
| `GET` | `/api/ai/ollama-status` | Publik | Memeriksa ketersediaan mesin inferensi Ollama di port 11434 |
| `GET` | `/api/system/device-resources` | JWT / Keycloak | Telemetri kapasitas memori RAM, VRAM GPU, dan penyimpanan fisik |
| `GET` | `/api/system/logs` | Publik | Riwayat log transaksi HTTP, durasi latensi, aksi, dan IP klien |
| `GET` | `/api/docs/openapi.json` | Publik | Berkas spesifikasi teknis OpenAPI 3.0.3 standar |
| `GET` | `/swagger` | Publik | Antarmuka interaktif **Swagger UI** untuk pengujian API via peramban |

### C. Akses Dokumentasi Swagger & API Inspector:
1. **Swagger UI Interaktif**: Akses `http://localhost:8085/swagger` pada peramban untuk melihat skema data dan menguji request API secara langsung.
2. **Spesifikasi OpenAPI 3.0**: Akses `http://localhost:8085/api/docs/openapi.json`.
3. **Live API Inspector Modal**: Di antarmuka web, klik tombol **"Log & API Inspector"** untuk memantau waktu respons, status response, dan muatan data secara langsung (*real-time*).

---

## 9. IMPLEMENTASI PRODUKSI ENTERPRISE: KEYCLOAK STANDALONE IAM & SSO TERPADU

Integrasi Keycloak pada sistem INFOPERS berstatus **Telah Terintegrasi Penuh (Production-Ready)** dengan arsitektur terpisah (*Decoupled Microservice*).

### A. Rincian Konfigurasi Arsitektur Keycloak:
- **Versi Keycloak**: Keycloak Quarkus 26.1.3 (Image: `quay.io/keycloak/keycloak:26.1.3`).
- **Port Layanan**: `http://localhost:8080` (Akses SSO & Admin Console).
- **Basis Data Khusus IAM**: PostgreSQL 16 Alpine terisolasi dalam kontainer `keycloak-db-ssdm` pada jaringan internal `ssdm-iam-network`.
- **Nama Realm**: `ssdm-polri` (Tersimpan di `keycloak_setup/realm-ssdm-polri.json`).
- **Nama Client**: `infopers-frontend` (Tipe OIDC OpenID Connect).
- **Alur Login yang Didukung**:
  * Standard Authorization Code Flow
  * Direct Access Grants (Resource Owner Password Credentials)
  * Implicit Flow
- **Valid Redirect URIs**: `http://localhost:3000/*`
- **Web Origins**: `*`
- **Tingkat Akses (Realm Roles)**:
  1. `SUPERADMIN`: Administrator tingkat Mabes / pengelola penuh data nasional.
  2. `PERSONEL`: Anggota Polri dan ASN dengan hak akses profil mandiri.

### B. Endpoint Resmi OIDC Keycloak SSDM Polri:
| Layanan OIDC | Endpoint Path |
|---|---|
| OpenID Configuration | `http://localhost:8080/realms/ssdm-polri/.well-known/openid-configuration` |
| Halaman Otorisasi Login | `http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/auth` |
| Penukaran Token (Token Exchange) | `http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/token` |
| Sertifikat Kunci Publik (JWKS) | `http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/certs` |
| Sesi Logout Terpusat (SLO) | `http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/logout` |

### C. Keuntungan Model IAM Terpisah bagi Korps Bhayangkara:
1. **Single Source of Identity**: Seluruh aplikasi kedinasan Polri (SIPP, E-Mental, E-Rohani, Infopers) di masa depan cukup menginduk ke satu server Keycloak SSO ini tanpa perlu menduplikasi basis data pengguna.
2. **Kepatuhan Privasi & Regulasi**: Bebas dari ketergantungan email komersial luar negeri; kredensial disimpan aman secara on-premise di server kepolisian.
3. **Audit Keamanan Terpusat**: Upaya percobaan brute-force, riwayat login, dan pencabutan hak akses (*revocation*) dapat dikendalikan dalam satu klik dari Keycloak Admin Console.

---

*Hak Cipta © 2026 Staf Sumber Daya Manusia Kepolisian Negara Republik Indonesia (SSDM Polri). Seluruh hak cipta dilindungi undang-undang.*
