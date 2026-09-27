# PANDUAN LENGKAP & ALUR SISTEM INFOPERS SSDM POLRI 2026

Sistem Informasi Manajemen Terpadu **Staf Sumber Daya Manusia Kepolisian Negara Republik Indonesia (SSDM Polri)** berbasis Data Induk 483.355 Personel, Struktur SOTK Resmi (Perkap No. 6 Tahun 2017), Kecerdasan Buatan Lokal (Ollama AI RAG), serta Audit Trail Kriptografis SHA-256.

---

## 🏗️ 1. URUTAN ALUR PEMROGRAMAN & ARSITEKTUR SISTEM

Sistem ini dibangun dengan pendekatan **Clean Modular Architecture** yang memisahkan lapisan basis data, REST API Golang, integrasi AI lokal, dan antarmuka Next.js:

```mermaid
flowchart TD
    subgraph 1. LAPISAN BASIS DATA (PostgreSQL)
        DB1[(data_polri_september_2026\n483.355 Personel)]
        DB2[(dummy_kompetensi_diklat\nSertifikasi & Keahlian)]
        DB3[(dummy_jabatan_fungsional\nJenjang Hak JF & DSPP)]
        DB4[(audit_trail_ledger\nSHA-256 Hash Chain)]
    end

    subgraph 2. REST API BACKEND (Golang)
        API_BOOT[main.go / Port 8080]
        API_POOL[database.go / Conn Pool]
        API_AUTH[middleware/auth.go / JWT SHA-256]
        API_H_AUTH[handlers/auth_handler.go]
        API_H_PERS[handlers/personel_handler.go]
        API_H_DASH[handlers/dashboard_handler.go]
        API_H_AI[handlers/ai_handler.go]
        API_H_REM[handlers/remunerasi_handler.go]
    end

    subgraph 3. MESIN AI LOKAL (Ollama)
        OLLAMA_SRV[Ollama Daemon / Port 11434]
        OLLAMA_MOD[Model: llama3:8b / qwen2.5:7b]
        RAG_PIPELINE[Prompt RAG: Konteks DB + User Prompt]
    end

    subgraph 4. FRONTEND APLIKASI (Next.js 16 + Tailwind)
        FE_ROOT[app/layout.tsx / Font Plus Jakarta Sans]
        FE_CTX[context/ThemeContext.tsx / Dark & Light Mode]
        FE_PAGE[app/page.tsx / Controller 6 Pilar & 20 Modul]
        FE_SIDEBAR[components/Sidebar.tsx / Navigasi Rapi]
        FE_HEADER[components/Header.tsx / Breadcrumbs & Switcher]
        FE_VIEWS[components/views/* / 10 Modul Interaktif]
    end

    DB1 & DB2 & DB3 & DB4 <--> API_POOL
    API_BOOT --> API_POOL --> API_AUTH
    API_AUTH --> API_H_AUTH & API_H_PERS & API_H_DASH & API_H_AI & API_H_REM
    API_H_AI <-->|HTTP POST /api/generate| OLLAMA_SRV --> OLLAMA_MOD
    API_H_AI -.->|Fallback Otomatis saat AI Offline| DB1
    FE_PAGE <-->|JWT Bearer REST API| API_BOOT
```

### Penjelasan Tahapan Alur Pemrograman:
1. **Lapisan Basis Data (`infopers_backend/database`)**:
   - Menghubungkan database PostgreSQL berkapasitas 483.355 data personel aktif Mabes Polri dan 34 Polda Jajaran.
   - Tabel terindeks pada kolom kunci `nip_nrp`, `satker`, `pangkat`, `tgl_lahir`, dan `jabatan_fungsional`.
2. **Lapisan REST API Backend (`infopers_backend`)**:
   - Dibangun dengan Go (Golang) performa tinggi tanpa framework bloated.
   - Menggunakan connection pool (`SetMaxOpenConns: 25`, `SetMaxIdleConns: 10`) untuk menjamin respon query < 30 milidetik.
   - Keamanan diautentikasi dengan token JWT berbasis masa berlaku 24 jam dan salt verifikasi internal.
3. **Pipa RAG AI Lokal (`handlers/ai_handler.go`)**:
   - Menerima pertanyaan bahasa alami dari pengguna.
   - Melakukan temu-kembali data faktual (*Retrieval*) dari basis data PostgreSQL sesuai kata kunci.
   - Mengirimkan data fakta + instruksi ke server Ollama lokal (`http://localhost:11434/api/generate`) untuk disintesis (*Generation*).
   - Dilengkapi *failsafe*: Jika Ollama tidak aktif, backend otomatis mengekstrak data faktual langsung dari SQL tanpa melempar galat.
4. **Lapisan Antarmuka Pengguna (`infopers_frontend`)**:
   - Menggunakan Next.js 16 App Router dengan tipografi standar **Plus Jakarta Sans**.
   - Menyediakan fitur beralih tema **Mode Gelap (Dark Mode)** dan **Mode Cerah (Light Mode)** secara instan.
   - Manajemen rute terstruktur ke dalam **6 Pilar Utama dan 20 Submodul** tanpa teks berlebih yang mengganggu.

---

## 📋 2. TAKSONOMI 6 PILAR & 20 SUBMODUL OPERASIONAL

| No | Pilar Utama | Submodul | Komponen Tampilan |
|---|---|---|---|
| **1** | **BERANDA & PROFIL KELEMBAGAAN** | • SOTK SSDM Polri (Perkap 6/2017)<br>• Program Unggulan SSDM<br>• Statistik Personel Polri | `SotkView.tsx`<br>`SpecializedModuleView.tsx`<br>`DashboardView.tsx` |
| **2** | **PERENCANAAN STRATEGIS & PREDIKSI** | • Prediksi Batas Usia Pensiun (BUP)<br>• Prediksi Intake Personel<br>• Analisis Formasi & DSPP<br>• Proyeksi Anggaran & Hak JF | `RadarSdmView.tsx`<br>`SpecializedModuleView.tsx`<br>`SpecializedModuleView.tsx`<br>`RemunerasiView.tsx` |
| **3** | **FITUR AI UNGGULAN SSDM** | • Smart Q&A Assistant (Ollama AI)<br>• AI Rekomendasi Mutasi<br>• Validasi Dokumen Otomatis<br>• Generator Riwayat Hidup | `OllamaAiView.tsx`<br>`KarierMutasiView.tsx`<br>`PersonelView.tsx (Tab OCR)`<br>`PersonelView.tsx (Tab RH)` |
| **4** | **PEMBINAAN KARIER (BINKAR)** | • Rekam Jejak & Usulan UKP<br>• Talent Pool & Seleksi Dikbang<br>• Status Verifikasi Administrasi | `SpecializedModuleView.tsx`<br>`SpecializedModuleView.tsx`<br>`SpecializedModuleView.tsx` |
| **5** | **PERAWATAN PERSONEL & PSIKOLOGI** | • Uji Psikologi & Izin Senpi<br>• Peringatan Dini (MPP & KGB)<br>• Tanda Kehormatan / Lencana<br>• Layanan Mandiri Personel | `SpecializedModuleView.tsx`<br>`RadarSdmView.tsx`<br>`SpecializedModuleView.tsx`<br>`AiHubView.tsx` |
| **6** | **INTEGRITAS & TATA KELOLA DATA** | • Manajemen Hak Akses (RBAC)<br>• Log Validitas & Audit Trail | `PengaturanView.tsx`<br>`SpecializedModuleView.tsx` |

---

## 🖥️ 3. PANDUAN CARA MENGGUNAKAN SISTEM

### Langkah 1: Masuk ke Sistem (Login Presisi)
1. Buka peramban (browser) di tautan: `http://localhost:3000`.
2. Halaman Login resmi SSDM Polri akan tampil.
3. Gunakan akun demo yang tersedia:
   - **Superadministrator**: Username `admin.nasional`, Password `Polri2026!`
   - **Personel Mandiri**: Username / NRP `04031518`, Password `Polri2026!`
4. Klik tombol **"Masuk ke Sistem"**.

---

### Langkah 2: Menggunakan Pilar 1 (Beranda & Profil Kelembagaan)
- **Melihat Bagan SOTK SSDM Polri**:
  1. Klik menu **"SOTK SSDM Polri"** di sidebar paling atas.
  2. Pilih lembar bagan (Tersedia 6 Dokumen Lembar sesuai Perkap No. 6 Tahun 2017: Pimpinan, Biro Binkar, Biro Dalpers, Biro Watpers, Biro Psikologi, dan Rorenmin).
  3. Gunakan kontrol zoom `+` / `-` atau geser kanvas untuk meneliti struktur kotak jabatan.
  4. Klik salah satu kotak jabatan untuk melihat rincian tugas dan fungsi eselon.
- **Melihat Program Unggulan**:
  1. Klik menu **"Program Unggulan SSDM"**.
  2. Tampil 6 kartu inisiatif prioritas (Rekrutmen BETAH, Meritokrasi Karier, Psikologi Presisi, Perumahan Anggota, Transformasi AI, Afirmasi 3T).
- **Melihat Statistik Personel (Dashboard)**:
  1. Klik menu **"Statistik Personel Polri"**.
  2. Pantau kartu metrik: Kekuatan Riil (442.180 Polri & 41.175 PNS), Sebaran Golongan Pangkat (Pati, Pamen, Pama, Bintara, Tamtama), dan Pemenuhan DSPP Nasional.

---

### Langkah 3: Menggunakan Pilar 2 (Perencanaan Strategis & Prediksi)
- **Prediksi Batas Usia Pensiun (BUP)**:
  1. Klik menu **"Prediksi Batas Usia Pensiun"**.
  2. Sistem otomatis mengkalkulasi tanggal lahir personel dan menampilkan daftar personel yang memasuki masa pensiun per tahun (2026 - 2030).
- **Prediksi Intake Personel**:
  1. Klik menu **"Prediksi Intake Personel"**.
  2. Pantau tren kuota penerimaan Akpol, SIPSS, Bintara PTU, Bakomsus Siber/Medis, dan Tamtama untuk mengisi kekosongan pensiun.
- **Analisis Formasi & DSPP**:
  1. Klik menu **"Analisis Formasi & DSPP"**.
  2. Analisis gap pemenuhan personel di Mabes vs 34 Polda Jajaran.
- **Proyeksi Anggaran & Hak JF**:
  1. Klik menu **"Proyeksi Anggaran & Hak JF"**.
  2. Lakukan simulasi penataan jenjang Jabatan Fungsional (Pertama, Muda, Madya, Utama).

---

### Langkah 4: Menggunakan Pilar 3 (Fitur AI Unggulan SSDM)
- **Smart Q&A Assistant (Ollama AI)**:
  1. Klik menu **"Smart Q&A Assistant (AI)"**.
  2. Pastikan indikator status server Ollama terlihat (aktif/database internal).
  3. Ketik pertanyaan apa saja, misalnya:
     - *"Berapa jumlah personel Pamen di Polda Metro Jaya?"*
     - *"Cari personel ahli siber berpangkat Kompol"*
     - *"Bagaimana proyeksi pensiun Pati tahun 2026?"*
  4. Atau klik tombol rekomendasi pertanyaan cepat di bagian atas.
  5. Tekan tombol kirim dan dapatkan narasi analisis cerdas beserta tabel verifikasi fakta basis data.
- **AI Rekomendasi Mutasi**:
  1. Klik menu **"AI Rekomendasi Mutasi"**.
  2. Pilih formasi jabatan target yang kosong (contoh: Kasat Reskrim).
  3. Klik tombol **"Analisis Kesesuaian AI"** untuk mendapatkan ranking kandidat berdasarkan prinsip *The Right Man on the Right Place*.
- **Validasi Dokumen Otomatis (OCR)**:
  1. Klik menu **"Validasi Dokumen Otomatis"**.
  2. Unggah berkas keputusan SK atau sertifikat diklat.
  3. Sistem memindai dan mengekstrak nomor SK, TMT, dan nama personel secara instan.
- **Generator Riwayat Hidup (RH) Digital**:
  1. Klik menu **"Generator Riwayat Hidup"**.
  2. Cari personel berdasarkan NRP/Nama.
  3. Klik **"Cetak RH Resmi"** untuk menghasilkan format baku Daftar Riwayat Hidup Polri.

---

### Langkah 5: Menggunakan Pilar 4 (Pembinaan Karier)
- **Rekam Jejak & Usulan UKP**:
  1. Klik menu **"Rekam Jejak & Usulan UKP"**.
  2. Pantau 15.340 berkas usulan kenaikan pangkat periode 1 Juli 2026, Masa Dinas Perwira (MDP), dan status sidang Wanjak.
- **Talent Pool & Seleksi Dikbang**:
  1. Klik menu **"Talent Pool & Seleksi Dikbang"**.
  2. Pantau kuota dan jadwal pendaftaran Sespimti, Sespimmen, dan SIP.
- **Status Verifikasi Administrasi**:
  1. Klik menu **"Status Verifikasi Administrasi"**.
  2. Periksa standar syarat mutasi: SKHP Propam, Penilaian SMK Online, Kesjas, dan LHKPN.

---

### Langkah 6: Menggunakan Pilar 5 (Perawatan Personel & Psikologi)
- **Uji Psikologi & Izin Senpi**:
  1. Klik menu **"Uji Psikologi & Izin Senpi"**.
  2. Pantau persentase kelayakan Memenuhi Syarat (MS 92.4%) dan personel yang memerlukan konseling khusus (TMS 7.6%).
- **Peringatan Dini (MPP & KGB)**:
  1. Klik menu **"Peringatan Dini (MPP & KGB)"**.
  2. Tinjau radar notifikasi personel yang memasuki Masa Persiapan Pensiun (H-12 bulan) dan Kenaikan Gaji Berkala (KGB).
- **Tanda Kehormatan & Satya Lencana**:
  1. Klik menu **"Tanda Kehormatan / Lencana"**.
  2. Lihat daftar alokasi penganugerahan Satya Lencana Pengabdian 8, 16, 24, 32 Tahun dan Bintang Bhayangkara Nararya.
- **Layanan Mandiri Personel**:
  1. Klik menu **"Layanan Mandiri Personel"**.
  2. Digunakan oleh anggota untuk mengecek sisa hak cuti tahunan, usulan perawatan, dan konsultasi regulasi.

---

### Langkah 7: Menggunakan Pilar 6 (Integritas & Tata Kelola Data)
- **Manajemen Hak Akses (RBAC)**:
  1. Klik menu **"Manajemen Hak Akses (RBAC)"**.
  2. Kelola pembagian peran: Superadmin Nasional, Operator Biro, Verifikator Polda, dan Akun Mandiri.
- **Log Validitas Data & Audit Trail**:
  1. Klik menu **"Log Validitas & Audit Trail"**.
  2. Pantau log riwayat mutasi dan perubahan berkas yang disegel dengan rantai **Cryptographic Hash SHA-256** untuk menjamin data tidak dapat dimanipulasi secara ilegal.

---

### Mengubah Tampilan (Mode Gelap / Mode Cerah)
- Di bagian pojok kanan atas layar (Header), klik tombol **"Cerah"** atau **"Gelap"**.
- Tampilan akan langsung berganti tema dengan kontras tajam dan proporsional.

---

## 🚀 4. PANDUAN TEKNIS MENJALANKAN SISTEM (RINGKAS & DETAIL)

> 💡 **TIPS KETIKA TOKEN AI HABIS / TANPA BERGANTUNG PADA ASISTEN**:
> Simpan atau gunakan panduan ringkas ini kapan saja untuk menjalankan seluruh modul sistem INFOPERS secara mandiri.

---

### ⚡ METODE 1: Cara Tercepat (1-Klik Jalankan Seluruh Sistem)

Telah disediakan skrip otomatis yang langsung menyalakan Ollama AI, Backend Golang, dan Frontend Next.js di terminal terpisah sekaligus membuka browser:
* **Cukup klik ganda (double-click) file:**  
  👉 **`jalankan_semua.bat`** (atau jalankan `.\jalankan_semua.ps1` di PowerShell).
* Semua server akan menyala otomatis dan browser akan membuka `http://localhost:3000`.

---

### 💻 METODE 2: Menjalankan Secara Manual (Script Per Terminal)

Jika Anda ingin menjalankan setiap layanan satu per satu di jendela Terminal/PowerShell terpisah:

#### 1️⃣ Terminal 1: Menjalankan Mesin AI (Ollama Llama-3)
Buka PowerShell baru dan jalankan:
```powershell
ollama run llama3:8b
```
*(Atau opsi hemat RAM: `ollama run llama3.2:3b`)*  
> Port aktif: `http://localhost:11434` (Status: `Ollama is running`).

#### 2️⃣ Terminal 2: Menjalankan Backend REST API (Golang)
Buka PowerShell baru dan jalankan baris perintah berikut:
```powershell
cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_backend"
.\backend.exe
```
> Server Golang aktif pada: `http://localhost:8080`.  
> *(Catatan: Bila ingin menjalankan langsung dari source code, gunakan: `go run main.go`).*

#### 3️⃣ Terminal 3: Menjalankan Frontend Web Antarmuka (Next.js 16)
Buka PowerShell baru dan jalankan:
```powershell
cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_frontend"
npm run dev
```
> Aplikasi web aktif pada: `http://localhost:3000`.

#### 4️⃣ Akses Sistem di Browser:
1. Buka Google Chrome atau Microsoft Edge ke alamat: **`http://localhost:3000`**
2. Gunakan kredensial login:
   - **Superadmin Nasional**: `admin.nasional` / Password: `Polri2026!`
   - **Personel Mandiri**: `04031518` / Password: `Polri2026!`
3. Masuk ke menu **"Smart Q&A Assistant (AI)"** pada Pilar 3. Indikator akan langsung menyala **`🟢 Ollama Online (llama3:8b)`**.

---

### 🛠️ Detail Konfigurasi & Troubleshooting Mandiri:


### 3. Panduan Lengkap Instalasi & Menjalankan Ollama AI Lokal (Windows)

Fitur **Smart Q&A Assistant** dan **AI Rekomendasi** di INFOPERS SSDM Polri dirancang untuk memanfaatkan model AI lokal (On-Premise) melalui **Ollama** demi keamanan data rahasia personel Polri tanpa mengirim data ke internet publik.

> ℹ️ **Catatan Status Saat Ini**:
> Jika Ollama belum diinstal atau belum dijalankan, backend INFOPERS otomatis mengaktifkan mode *Failsafe Database Internal* (`PostgreSQL Smart Query Engine`), sehingga aplikasi tetap dapat menjawab data personel secara akurat. Namun, untuk mendapatkan analisis narasi kecerdasan buatan generatif secara optimal, ikuti tahapan instalasi berikut:

#### A. Unduh & Instal Ollama di Windows
1. Kunjungi situs resmi Ollama: **[https://ollama.com/download/windows](https://ollama.com/download/windows)**
2. Klik tombol **Download for Windows** untuk mengunduh berkas installer `OllamaSetup.exe`.
3. Buka dan jalankan berkas `OllamaSetup.exe` hasil unduhan, lalu klik **Install**.
4. Setelah instalasi selesai, Ollama akan otomatis berjalan di latar belakang (ikon Ollama berupa llama putih akan muncul di area system tray pojok kanan bawah taskbar Windows).

#### B. Verifikasi Instalasi di Terminal PowerShell
Buka jendela PowerShell baru dan ketik:
```powershell
ollama --version
```
*Jika muncul versi Ollama (contoh: `ollama version is 0.5.x` atau lebih baru), maka instalasi telah berhasil.*

#### C. Unduh & Jalankan Model AI (Pilih Sesuai Spesifikasi Komputer)
Jalankan salah satu model AI berikut di PowerShell (proses download model hanya berjalan sekali di awal):

* **Rekomendasi Standar INFOPERS (RAM 16 GB atau GPU 8 GB+)**:
  ```powershell
  ollama run llama3:8b
  ```
* **Opsi Ringan & Cepat (Laptop RAM 8 GB - 16 GB, respons sangat cepat)**:
  ```powershell
  ollama run llama3.2:3b
  ```
* **Opsi Alternatif Analisis Tajam (Bahasa & Logika Presisi)**:
  ```powershell
  ollama run qwen2.5:7b
  ```

> Saat perintah dijalankan pertama kali, Ollama akan mengunduh model. Setelah selesai, akan muncul prompt interaktif `>>> Send a message`. Anda dapat keluar dari prompt interaktif dengan mengetik `/bye`. Service Ollama tetap aktif melayani API di latar belakang.

#### D. Uji Kesiapan Server Ollama
Buka browser dan akses alamat:
```text
http://localhost:11434
```
Jika tampil tulisan **"Ollama is running"**, artinya mesin AI sudah aktif dan siap melayani permintaan sistem INFOPERS.

#### E. Sambungkan ke Sistem INFOPERS SSDM Polri
1. Pastikan Backend Golang berjalan (`.\backend.exe`). Backend akan otomatis mendeteksi ketersediaan port `11434`.
2. Buka Frontend di browser: `http://localhost:3000`.
3. Masuk ke menu **"Smart Q&A Assistant (AI)"** pada Pilar 3.
4. Perhatikan badge status di antarmuka chat: status akan otomatis berubah menjadi **"Ollama Online (llama3:8b)"** dengan lampu indikator hijau aktif.
5. Anda kini dapat mengajukan pertanyaan analisis bahasa alami mengenai sebaran personel, formasi mutasi, dan proyeksi SDM Polri.

#### F. Perintah Berguna Ollama Sehari-hari:
| Perintah | Fungsi |
|---|---|
| `ollama list` | Melihat daftar model AI yang sudah terinstal di komputer |
| `ollama ps` | Melihat model AI yang sedang aktif di memori RAM/GPU |
| `ollama run <nama_model>` | Menjalankan dan mengunduh model AI |
| `ollama rm <nama_model>` | Menghapus model AI dari penyimpanan disk |
| `ollama stop <nama_model>` | Menghentikan model yang sedang aktif di memori |


---

## 💾 5. PROSEDUR PENCADANGAN KODE (BACKUP OTOMATIS)

Tersedia skrip otomatis untuk membuat arsip kompresi `.zip` berstempel waktu yang bersih tanpa menyertakan `node_modules` atau file cache:
1. Cukup klik ganda file shortcut: `backup.bat`
2. Atau jalankan di terminal:
   ```powershell
   .\backup.ps1
   ```
Arsip akan dibuat di dalam folder `backups/`, contoh: `backups/backup_infopers_2026-09-27_01-53-51.zip`.

---

## 🖥️ 6. DOKUMEN PERENCANAAN PENGADAAN HARDWARE & ESTIMASI ANGGARAN (RAB)

Telah disusun dokumen analisis komputasi enterprise, spesifikasi teknis hardware, kebutuhan VRAM/RAM per library, serta Rencana Anggaran Biaya (RAB) pengadaan server AI on-premise Mabes Polri:
* 📄 **File Dokumen Lengkap**: [`DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md`](./DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md)
* **Kebutuhan VRAM Model AI**: 16 GB - 48 GB (Llama 3 8B, Qwen 2.5 14B, DeepSeek R1)
* **Kebutuhan RAM Basis Data**: 32 GB - 64 GB ECC (483.355 data personel)
* **Total Estimasi Anggaran Pengadaan (RAB)**: **Rp 897.600.000,-** (Server GPU Dual RTX A6000 Ada 96GB + Server Database NVMe RAID-10 + NAS Backup 48TB + Switch 10G & UPS 10kVA).

