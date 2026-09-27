# FRONTEND INFOPERS SSDM POLRI PRESISI 2026

Modul Antarmuka Web Resmi **Staf Sumber Daya Manusia (SSDM) Kepolisian Negara Republik Indonesia** yang dibangun dengan Next.js 16, Tailwind CSS, Font Plus Jakarta Sans, dan dukungan tema ganda (Mode Gelap & Mode Cerah).

---

## 🏛️ Struktur Navigasi (6 Pilar Utama & 20 Submodul)

```text
├── 1. BERANDA & PROFIL KELEMBAGAAN
│   ├── SOTK SSDM Polri (Perkap 6/2017)
│   ├── Program Unggulan SSDM
│   └── Statistik Personel Polri
│
├── 2. PERENCANAAN STRATEGIS & PREDIKSI
│   ├── Prediksi Batas Usia Pensiun (BUP)
│   ├── Prediksi Intake Personel
│   ├── Analisis Formasi & DSPP
│   └── Proyeksi Anggaran & Hak JF
│
├── 3. FITUR AI UNGGULAN SSDM
│   ├── Smart Q&A Assistant (AI Ollama RAG)
│   ├── AI Rekomendasi Mutasi
│   ├── Validasi Dokumen Otomatis (OCR)
│   └── Generator Riwayat Hidup Digital
│
├── 4. PEMBINAAN KARIER (BINKAR)
│   ├── Rekam Jejak & Usulan UKP
│   ├── Talent Pool & Seleksi Dikbang
│   └── Status Verifikasi Administrasi
│
├── 5. PERAWATAN PERSONEL & PSIKOLOGI
│   ├── Uji Psikologi & Izin Senpi
│   ├── Peringatan Dini (MPP & KGB)
│   ├── Tanda Kehormatan / Lencana
│   └── Layanan Mandiri Personel
│
└── 6. INTEGRITAS & TATA KELOLA DATA
    ├── Manajemen Hak Akses (RBAC)
    └── Log Validitas & Audit Trail (SHA-256)
```

---

## 🚀 Lokasi File & Cara Menjalankan Frontend

### 📂 Lokasi Direktori (Penyimpanan File):
File antarmuka frontend ini tersimpan di:
```text
D:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_frontend
```

---

## ⚡ PANDUAN KILAT MENJALANKAN SISTEM SECARA MANDIRI
*(Gunakan panduan ini kapan saja saat token habis / tanpa perlu asisten AI)*

### 🚀 Cara 1: Sekali Klik (Otomatis Jalankan Semua)
Cukup buka folder proyek utama di Windows File Explorer dan **klik 2x (double-click)**:
👉 **`../jalankan_semua.bat`**  
*(Skrip ini otomatis menyalakan Ollama AI, Backend Golang :8080, Frontend Next.js :3000, dan langsung membuka Google Chrome).*

---

### 💻 Cara 2: Script Per Terminal (Buka 3 Jendela PowerShell)

#### Terminal 1 - Mesin AI Lokal (Ollama):
```powershell
ollama run llama3:8b
```
*(Port: `http://localhost:11434`)*

#### Terminal 2 - Backend REST API (Golang):
```powershell
cd "D:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_backend"
.\backend.exe
```
*(Port: `http://localhost:8080`)*

#### Terminal 3 - Frontend Web (Next.js):
```powershell
cd "D:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_frontend"
npm run dev
```
*(Port: `http://localhost:3000`)*

---

### 📝 Detail Perintah Frontend (Jika Dijalankan Manual):

2. **Pastikan Dependensi Terinstal**:
   ```powershell
   npm install
   ```

3. **Jalankan Server Pengembangan (Dev Server)**:
   ```powershell
   npm run dev
   ```

4. **Buka Antarmuka di Peramban (Browser)**:
   Buka Google Chrome / Microsoft Edge di alamat:
   ```text
   http://localhost:3000
   ```

---

### 🤖 Langkah Instalasi & Menjalankan Ollama AI Lokal (Opsional):

Agar fitur **Smart Q&A Assistant (AI)** di frontend dapat melakukan penalaran narasi bahasa alami secara optimal dengan model AI on-premise:

1. **Unduh Ollama Windows**:
   Unduh file instalasi resmi di [https://ollama.com/download/windows](https://ollama.com/download/windows).
2. **Jalankan Installer**:
   Klik dua kali `OllamaSetup.exe` dan selesaikan instalasi hingga ikon Ollama muncul di taskbar.
3. **Download Model AI di PowerShell**:
   Buka jendela PowerShell baru dan jalankan:
   ```powershell
   # Standar INFOPERS (RAM 16GB / GPU):
   ollama run llama3:8b

   # ATAU Opsi Ringan (RAM 8GB - 16GB):
   ollama run llama3.2:3b
   ```
4. **Verifikasi Server AI Aktif**:
   Buka peramban di `http://localhost:11434`. Jika bertuliskan *"Ollama is running"*, modul AI di antarmuka frontend akan otomatis menyala hijau.

---

## 🔐 Kredensial Masuk (Demo)

- **Superadmin Nasional**: `admin.nasional` / `Polri2026!`
- **Personel Mandiri**: `04031518` / `Polri2026!`

Untuk panduan alur pemrograman backend, basis data, dan tata kelola lengkap, silakan merujuk ke file dokumentasi utama di root direktori proyek: [`../README.md`](../README.md).

Rincian spesifikasi teknis hardware, estimasi VRAM/RAM library, dan estimasi anggaran RAB pengadaan server dapat dilihat pada: [`../DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md`](../DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md).

