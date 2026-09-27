# DOKUMEN ANALISIS PENENTUAN KAPASITAS KEBUTUHAN SAAT INI
## SISTEM INFORMASI PERSONEL (INFOPERS) & OLLAMA AI SSDM POLRI
**Tanggal Pengukuran:** 27 September 2026  
**Status Evaluasi:** Berdasarkan Pengukuran Riil Sistem Operasi & Database Aktif (483.355 Data Personel)

---

## 1. HASIL PENGUKURAN RIIL DEVICE SAAT INI

Berdasarkan pembacaan langsung dari kernel Windows dan controller hardware (*WMI / CIM / Process WorkingSet*):

| Komponen Hardware / Resource | Kapasitas Terpasang | Kapasitas Terpakai Saat Ini | Kapasitas Bebas (Available) | Persentase Utilisasi | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RAM Fisik Sistem (System RAM)** | **15.71 GB** (~16 GB) | **12.09 GB** | **3.62 GB** | **77.0%** | **Waspada (Tinggi)** |
| **GPU / Video Controller** | **Intel(R) UHD Graphics** | Integrated (Shared) | Dynamic allocation | - | Integrated GPU |
| **VRAM / Dedicated NVRAM GPU** | **1.024 MB (1.0 GB)** | ~512 MB - 1024 MB | 0 MB Dedicated | 100% Shared | **Tidak Memenuhi Syarat Minimal LLM** |
| **NVIDIA Dedicated GPU (NVRAM)** | **Tidak Terdeteksi** | 0 GB NVRAM | 0 GB | - | Diperlukan Dedicated GPU |
| **Core CPU & Threads** | **16 Logical Processors** | Multi-threaded | - | Idle / Responsif | Memadai untuk Web dan Database |

---

## 2. RINCIAN PENGGUNAAN MEMORI (RAM) OLEH STACK PROYEK INFOPERS

Dari total **12.09 GB** RAM yang terpakai di perangkat saat ini, berikut adalah rincian konsumsi memori per modul/proses:

```text
+-----------------------------------------------------------------------------------+
| DISTRIBUSI PENGGUNAAN RAM PERANGKAT SAAT INI (Total 15.71 GB)                     |
+-----------------------------------------------------------------------------------+
| [1] PostgreSQL Service (483.355 data Polri/ASN/PPPK) :   544.9 MB ( 4.5% dari Used)
| [2] Node.js Engine (Next.js Frontend & Tooling)      :   692.7 MB ( 5.7% dari Used)
| [3] Go Microservice Backend (backend.exe)             :    12.2 MB ( 0.1% dari Used)
| [4] Ollama LLM Runtime (Standby / Belum Load Model)   :     0.0 MB ( 0.0% dari Used)
+-----------------------------------------------------------------------------------+
| TOTAL KONSUMSI PROYEK INFOPERS                       :  1.249,8 MB (~1.25 GB)
| SISTEM OPERASI WINDOWS, BROWSER, & TOOLS LAIN         : 10.840,2 MB (~10.84 GB)
| SISA RAM FISIK BEBAS (FREE MEMORY)                    :  3.620,0 MB (~3.62 GB)
+-----------------------------------------------------------------------------------+
```

### Analisis Efisiensi:
1. **Backend Go (`backend.exe`) Sangat Efisien:** Hanya memakan **12.2 MB RAM** untuk melayani REST API kueri cerdas, token JWT, dan routing data.
2. **PostgreSQL Database:** Menghabiskan **544.9 MB RAM** untuk memuat cache index dan melayani tabel utama `data_polri_september_2026` sebesar 483.355 baris data (termasuk 1.666 data PPPK dan 15.718 ASN). Angka ini sangat stabil dan optimal untuk beban single-node.
3. **Frontend Next.js:** Menghabiskan **692.7 MB RAM** pada mode development server (Hot Module Reloading / TypeScript compiler).

---

## 3. ANALISIS KEBUTUHAN VRAM (NVRAM) UNTUK OLLAMA AI

Model LLM (Large Language Model) seperti Llama-3, Qwen-2.5, dan DeepSeek memerlukan alokasi memori khusus untuk memuat **Weight Matrix (Bobot Model)** dan **KV Cache (Konteks Percakapan)**.

### Matriks Kebutuhan VRAM/RAM Model AI:

| Model / Library AI | Format Kuantisasi | Kebutuhan Minimum GPU VRAM | Kebutuhan Jika Dipaksa di CPU RAM | Status di Device Saat Ini (VRAM 1 GB / Sisa RAM 3.6 GB) |
| :--- | :--- | :--- | :--- | :--- |
| **Llama-3-8B-Instruct** | Q4_K_M (4-bit) | **6.5 GB VRAM** | **8.5 GB RAM Bebas** | **Keterbatasan Memori (OOM / Throttling)** |
| **Qwen-2.5-7B** | Q4_K_M (4-bit) | **5.8 GB VRAM** | **7.8 GB RAM Bebas** | **Keterbatasan Memori (OOM)** |
| **DeepSeek-R1-Distill-8B** | Q4_K_M (4-bit) | **6.5 GB VRAM** | **8.5 GB RAM Bebas** | **Keterbatasan Memori (OOM)** |
| **Embedding BGE-M3 (RAG)** | FP16 | **2.5 GB VRAM** | **4.0 GB RAM Bebas** | Kapasitas Terbatas |
| **Llama-3.2-1B / 3B** | Q4_K_M (Ringan) | **2.0 GB - 3.2 GB VRAM** | **3.5 GB RAM Bebas** | **Dapat Dijalankan (CPU Offload)** |

### Mengapa Perangkat Saat Ini Mengalami Kendala untuk LLM 8B Lokal?
1. **Tidak Ada Dedicated GPU (NVRAM):** GPU saat ini adalah *Intel(R) UHD Graphics* dengan VRAM virtual 1.0 GB yang meminjam RAM sistem.
2. **Kapasitas Bebas Hanya 3.62 GB:** Ketika Ollama mencoba memuat model Llama-3-8B (yang membutuhkan 6.5 GB), Windows akan kekurangan memori fisik dan terpaksa melakukan **Paging/Swapping ke Harddisk/SSD**. Akibatnya inferensi menjadi sangat lambat (kurang dari 1 token per detik) atau proses crash (*Killed / Out of Memory*).

---

## 4. MENENTUKAN MATRIKS KAPASITAS KEBUTUHAN SAAT INI

Berdasarkan beban riil dan skenario operasional SSDM Polri, kapasitas kebutuhan dibagi menjadi 3 tingkat:

```text
========================================================================================
TINGKAT 1: KONDISI DEVICE SAAT INI (Laptop Pengembang / Single User)
- RAM Fisik      : 15.71 GB (Terpakai: 12.09 GB | Sisa: 3.62 GB)
- GPU VRAM       : 1.0 GB (Integrated Intel UHD Graphics)
- Kapasitas Beban: Cukup untuk Website + PostgreSQL (483K data), BELUM CUKUP untuk LLM 8B Lokal.
========================================================================================
           ▼ (Kebutuhan Upgrade Minimal Jika Ingin Uji Coba AI di PC Lokal)
========================================================================================
TINGKAT 2: KEBUTUHAN UJI COBA LOKAL / WORKSTATION LAPTOP STAF AI
- RAM Fisik      : Minimal 32 GB atau 64 GB DDR4/DDR5
- GPU Dedicated  : Minimal NVIDIA RTX 4060 / 4070 (8 GB - 12 GB VRAM) atau RTX 3060 12GB
- Kapasitas Beban: Mampu menjalankan Ollama Llama-3-8B secara lokal mandiri (35-45 token/detik).
========================================================================================
           ▼ (Kebutuhan Mutlak untuk Operasional Produksi Mabes & 34 Polda)
========================================================================================
TINGKAT 3: KEBUTUHAN SERVER PRODUKSI ON-PREMISES DATACENTER SSDM POLRI
- RAM Server     : 256 GB ECC Registered DDR5 (Tier 1) + 128 GB ECC DDR5 (Tier 2)
- GPU Dedicated  : DUAL NVIDIA RTX A6000 Ada Generation (Total 96 GB GDDR6 ECC VRAM)
- Storage NVMe   : RAID-10 Enterprise PCIe 4.0 SSD (850.000 IOPS)
- Kapasitas Beban: Melayani 150+ user perwira staf bersamaan, model 8B s.d 70B, dan kueri 483K data < 20ms.
========================================================================================
```

---

## 5. REKOMENDASI TINDAKAN & LANGKAH PENYESUAIAN

### A. Untuk Device Lokal Saat Ini (Jangka Pendek):
1. **Gunakan Mode Remote Ollama Host:**
   * Alih-alih menjalankan Ollama di laptop ini, sambungkan laptop ini ke host server/workstation yang memiliki GPU NVIDIA melalui menu **Pengaturan Ollama Host** (`http://ip-server-gpu:11434`).
2. **Gunakan Model Sub-4B untuk Pengujian CPU Saja:**
   * Jika wajib dijalankan di laptop ini tanpa GPU, gunakan model kecil seperti `qwen2.5:1.5b` atau `llama3.2:1b` yang hanya memerlukan 1.5 GB - 2.5 GB RAM.
3. **Tutup Aplikasi Berat yang Tidak Digunakan:**
   * Mengurangi konsumsi memori browser atau aplikasi latar belakang dapat membebaskan tambahan 2 - 3 GB RAM.

### B. Untuk Pengadaan Resmi SSDM Polri (Sesuai RAB TA 2026):
1. Mengajukan paket pengadaan server hardware on-premises sesuai dokumen:  
   [`DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md`](./DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md)  
   dengan total anggaran **Rp 897.600.000,-** yang telah mencakup **Dual GPU NVIDIA RTX A6000 Ada 96GB VRAM**, **Server Database 128GB RAM NVMe RAID-10**, dan **NAS Backup WORM 48TB**.

---

## 6. PENJELASAN ISTILAH UKURAN MODEL (2B - 70B) & METRIK KECEPATAN DI AI

### A. APA ARTI ANGKA "B" PADA MODEL AI (2B, 7B, 8B, 14B, 32B, 70B)?
Huruf **"B"** adalah singkatan dari **Billion Parameters (Miliar Parameter)**.  
*Parameter* adalah bobot matematis (*sinapsis digital*) di dalam jaringan saraf tiruan LLM yang menyimpan pengetahuan, pemahaman tata bahasa, pola logika, dan aturan kedinasan hasil pelatihan data.

```text
+---------------------------------------------------------------------------------------------------------+
| SPEKTRUM UKURAN MODEL AI (LLM) & KEBUTUHAN RESOURCE VRAM                                                |
+---------------------------------------------------------------------------------------------------------+
| Ukuran Model  | Kebutuhan VRAM (Q4) | Karakteristik Kemampuan & Penggunaan di SSDM Polri                 |
+---------------+---------------------+-------------------------------------------------------------------+
| 1B - 3B       | 1.5 GB - 3.0 GB     | ULTRA RINGAN: Bisa jalan di CPU/Laptop biasa. Cocok untuk format   |
| (Contoh:      |                     | JSON sederhana & ekstraksi kata kunci. Lemah dalam logika rumit.  |
| Llama-3.2-3B) |                     |                                                                   |
+---------------+---------------------+-------------------------------------------------------------------+
| 7B - 8B       | 6.0 GB - 8.0 GB     | SWEET SPOT (STANDAR INDUSTRI): Keseimbangan terbaik antara        |
| (Contoh:      |                     | kecerdasan tinggi, kecepatan cepat (>40 tok/s), & hemat hardware. |
| Llama-3-8B /  |                     | Mampu membedah kueri SQL personel, rekomendasi mutasi, & syarat   |
| Qwen-2.5-7B)  |                     | kenaikan pangkat dengan sangat presisi.                            |
+---------------+---------------------+-------------------------------------------------------------------+
| 14B           | 11.0 GB - 14.0 GB   | PENALARAN MENENGAH ATAS: Logika lebih mendalam dari 8B.           |
| (Contoh:      |                     | Membutuhkan GPU minimal 16 GB - 24 GB VRAM (RTX 4090 / A5000).    |
| Qwen-2.5-14B) |                     |                                                                   |
+---------------+---------------------+-------------------------------------------------------------------+
| 32B           | 20.0 GB - 24.0 GB   | PENALARAN TINGGI: Sangat cerdas dalam menyusun dokumen hukum,     |
| (Contoh:      |                     | analisis perpol, dan kueri multidimensi. Pas di 1x GPU 24GB/48GB. |
| Qwen-2.5-32B) |                     |                                                                   |
+---------------+---------------------+-------------------------------------------------------------------+
| 70B           | 42.0 GB - 48.0 GB   | KELAS ENTERPRISE / HEAVYWEIGHT: Kecerdasan setara GPT-4.          |
| (Contoh:      |                     | Mampu melakukan penalaran strategis Mabes Polri secara utuh.      |
| Llama-3-70B)  |                     | WAJIB dijalankan di Dual GPU Server (Dual RTX A6000 96GB VRAM).   |
+---------------------------------------------------------------------------------------------------------+
```

---

### B. DAFTAR ISTILAH TERKAIT KECEPATAN & PERFORMA DI AI

Berikut adalah metrik dan istilah baku industri untuk mengukur kecepatan, daya tanggap, dan efisiensi sistem AI:

#### 1. **TPS (Tokens Per Second) — Kecepatan Generasi Teks**
* **Definisi:** Jumlah *token* (kurang lebih 1 token = 0,75 kata atau 4 karakter) yang dapat dihasilkan oleh model AI per detiknya saat mengetik jawaban.
* **Tolak Ukur Praktis:**
  * **< 5 tok/s (Lambat / Tersendat):** Terjadi jika model dipaksa berjalan di CPU tanpa GPU. Terasa lambat dibaca.
  * **15 - 25 tok/s (Normal):** Setara kecepatan membaca manusia normal. Cukup nyaman.
  * **35 - 55+ tok/s (Sangat Cepat):** Standar GPU dedicated (RTX A6000). Jawaban langsung mengalir lancar seketika.

#### 2. **TTFT (Time To First Token) — Waktu Respons Awal (Latency Awal)**
* **Definisi:** Durasi waktu (dalam milidetik atau detik) yang dibutuhkan dari saat pengguna menekan tombol **"Kirim / Tanya"** sampai huruf/kata **pertama** muncul di layar.
* **Target Presisi SSDM:** **< 500 ms (setengah detik)** pada server GPU enterprise, sehingga terasa instan tanpa jeda tunggu.

#### 3. **Prompt Evaluation Speed (Prefill Speed) — Kecepatan Membaca Konteks**
* **Definisi:** Kecepatan GPU mencerna dan memahami dokumen atau pertanyaan input yang panjang sebelum mulai memikirkan jawaban.
* **Pentingnya di SSDM:** Ketika staf mengunggah draft Perkap setebal 20 halaman ke AI, GPU berkecepatan tinggi dapat membaca seluruh 20 halaman tersebut hanya dalam 1-2 detik (1.000+ token/detik pada tahap *prefill*).

#### 4. **Total Latency (End-to-End Latency) — Waktu Penyelesaian Penuh**
* **Definisi:** Waktu total dari pengiriman pertanyaan hingga kalimat penutup jawaban selesai digenerate secara lengkap.
* **Rumus:** `Total Latency = TTFT + (Jumlah Token Jawaban / TPS)`.

#### 5. **Memory Bandwidth (GB/s) — Penentu Utama Kecepatan Inferensi**
* **Definisi:** Kecepatan transfer data antara chip memori VRAM dengan inti tensor GPU.
* **Fakta Kritis AI:** Model LLM adalah aplikasi yang bersifat **Memory-Bound** (dibatasi oleh kecepatan memori, bukan oleh kecepatan prosesor murni).
  * RAM Komputer Biasa (DDR4): hanya **~30 GB/s** (Menjadi penyebab utama inferensi CPU lambat).
  * RAM Server (DDR5 ECC): **~80 GB/s**.
  * GPU NVIDIA RTX A6000 Ada: **960 GB/s** (**32 KALI LEBIH CEPAT** dari RAM komputer biasa). Inilah alasan mutlak mengapa server GPU wajib diadakan.

#### 6. **Quantization (Kuantisasi: FP16, Q8, Q5, Q4_K_M, INT4)**
* **Definisi:** Teknik kompresi matematis yang memperkecil ukuran bobot model AI dari presisi 16-bit (*Floating Point*) menjadi 4-bit (*Integer*).
* **Manfaat:**
  * Memperkecil kebutuhan VRAM hingga **70%** (Model 8B yang aslinya butuh 16 GB VRAM turun menjadi hanya 6.5 GB VRAM).
  * Melipatgandakan kecepatan transfer data di memori sehingga inferensi menjadi **2 hingga 3 kali lebih cepat**, dengan penurunan akurasi kurang dari 1%.

#### 7. **KV Cache (Key-Value Cache)**
* **Definisi:** Alokasi memori khusus di dalam GPU VRAM yang menyimpan hasil kalkulasi kata-kata sebelumnya dalam percakapan.
* **Manfaat:** AI tidak perlu membaca ulang seluruh riwayat obrolan dari awal setiap kali membalas, sehingga respons percakapan multi-turn (tanya jawab berkelanjutan) tetap cepat.

#### 8. **Throughput & Concurrency (Kapasitas Multi-User)**
* **Definisi:** Banyaknya pertanyaan atau permintaan dari banyak staf/perwira secara bersamaan yang dapat diproses oleh server dalam satu detik (diukur dalam *Requests Per Second / RPS*).
* **Target SSDM:** Server Dual RTX A6000 mampu melayani hingga **150 permintaan bersamaan** dari 34 Polda tanpa antrean sistem *hang*.

#### 9. **Context Window (Panjang Daya Ingat Dokumen)**
* **Definisi:** Jumlah token maksimal yang dapat diingat atau dibaca oleh model AI dalam satu sesi (misalnya 8.192 token, 32.768 token, atau 128.000 token).
* **Analogi:** Jika diibaratkan manusia, *context window* adalah lebar meja kerja; semakin lebar meja kerja, semakin banyak berkas riwayat personel yang bisa dibuka sekaligus di hadapan AI.

#### 10. **GPU Offloading (Pemisahan Lapisan GPU vs CPU)**
* **Definisi:** Keadaan ketika model AI yang terlalu besar dibagi dua: sebagian dijalankan di GPU VRAM dan sebagian sisanya dialihkan (*offload*) ke RAM CPU.
* **Dampak:** Terjadi perlambatan ekstrem (*bottleneck*) karena transfer data harus bolak-balik melalui jalur PCIe. Oleh sebab itu, kapasitas VRAM kartu grafis harus selalu lebih besar dari ukuran model yang dijalankan.

---
*Dokumen ini disusun sebagai lampiran teknis resmi evaluasi resource device lokal, glosarium kecepatan AI, dan kelayakan infrastruktur server AI SSDM Polri.*

