# DOKUMEN PERENCANAAN TEKNIS PENGADAAN PERANGKAT KERAS (HARDWARE), SPESIFIKASI KOMPUTASI & ESTIMASI ANGGARAN (RAB)
## SISTEM INFORMASI PERSONEL & KECERDASAN BUATAN SSDM POLRI PRESISI 2026

---

### LEMBAR INFORMASI DOKUMEN
* **Nama Sistem** : Sistem Informasi Manajemen Terpadu Personel & AI RAG (INFOPERS SSDM POLRI)
* **Kapasitas Basis Data** : 483.355 Data Induk Personel Polri Aktif (Mabes Polri & 34 Polda Jajaran)
* **Arsitektur Sistem** : Clean Architecture (Golang REST API + PostgreSQL 16 + Next.js 16 + Ollama AI Engine + Audit Trail SHA-256)
* **Tahun Anggaran** : 2026 / 2027
* **Klasifikasi** : Dokumen Teknis Perencanaan & Analisis Kebutuhan Pengadaan (RAB)

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & Tujuan Pengadaan](#1-ringkasan-eksekutif--tujuan-pengadaan)
2. [Matriks Kebutuhan Komputasi Setiap Library & Komponen Sistem](#2-matriks-kebutuhan-komputasi-setiap-library--komponen-sistem)
3. [Analisis Kebutuhan Memori GPU (VRAM) untuk Model AI Ollama](#3-analisis-kebutuhan-memori-gpu-vram-untuk-model-ai-ollama)
4. [Spesifikasi Teknis Hardware Pengadaan (3 Tier Arsitektur)](#4-spesifikasi-teknis-hardware-pengadaan-3-tier-arsitektur)
5. [Daftar Tools & Lisensi Pendukung yang Diperlukan](#5-daftar-tools--lisensi-pendukung-yang-diperlukan)
6. [Rencana Anggaran Biaya (RAB) Prediksi Pengadaan](#6-rencana-anggaran-biaya-rab-prediksi-pengadaan)
7. [Rekomendasi Skalabilitas & Disaster Recovery (DRC)](#7-rekomendasi-skalabilitas--disaster-recovery-drc)

---

## 1. RINGKASAN EKSEKUTIF & TUJUAN PENGADAAN

Pengembangan Sistem INFOPERS SSDM Polri dirancang untuk mengelola **483.355 personel kepolisian** di seluruh Indonesia dengan kecepatan akses sub-detik (< 100 ms) dan kemampuan analisis prediktif berbasis kecerdasan buatan lokal (LLM On-Premise).

### Sasaran Kunci Pengadaan Hardware:
1. **Kedaulatan Data & Keamanan Maksimal (Air-Gapped / On-Premise)**:
   Data personel Polri, riwayat hidup, psikologi senpi, rekam jejak propam, dan kalkulasi tunjangan kinerja **TIDAK BOLEH dikirimkan ke cloud publik pihak ketiga (OpenAI, Google, AWS)**. Seluruh inferensi AI dijalankan 100% lokal pada server ber-GPU internal Mabes Polri.
2. **Kinerja Kueri Database 483.355 Baris**:
   Menghindari kemacetan I/O (*I/O Bottleneck*) saat 34 Polda melakukan sinkronisasi data simultan melalui media penyimpanan *All-Flash NVMe Enterprise*.
3. **Ketersediaan Layanan Tinggi (*High Availability*)**:
   Menjamin *uptime* 99.95% dengan redundansi daya (dual PSU), RAID-10 NVMe, dan cadangan baterai UPS *On-Line Double Conversion*.

---

## 2. MATRIKS KEBUTUHAN KOMPUTASI SETIAP LIBRARY & KOMPONEN SISTEM

Berikut adalah rincian kebutuhan sumber daya komputasi (*System RAM, GPU VRAM, CPU Core, dan Storage*) berdasarkan beban kerja aktual masing-masing pustaka (*library*) dan subsistem:

| No | Subsistem & Komponen | Library / Engine Kunci | Kebutuhan System RAM | Kebutuhan GPU (VRAM) | Kebutuhan CPU | Kebutuhan Storage & I/O | Keterangan Operasional |
|---|---|---|---|---|---|---|---|
| **1** | **Basis Data Relasional & Full-Text Search** | `PostgreSQL 16 Enterprise`, `pgvector`, `libpq` | **32 GB - 64 GB**<br>*(shared_buffers: 16GB, work_mem: 64MB)* | **0 GB** *(CPU-bound)* | **16 - 24 Core**<br>*(High Frequency)* | **1 TB NVMe SSD**<br>IOPS > 400.000 (PCIe Gen4/Gen5) | Menangani 483.355 baris data induk, tabel kompetensi diklat, dan log transaksi mutasi. |
| **2** | **Backend Core & REST API** | `Golang 1.23+`, `gorilla/mux`, `golang-jwt/jwt/v5` | **4 GB - 8 GB** | **0 GB** | **8 - 16 Core** | **100 GB NVMe** | Mengelola 25-50 connection pool database, enkripsi JWT SHA-256, dan perutean API. |
| **3** | **Mesin Kriptografi Audit Trail** | `crypto/sha256`, `Ledger Hash Chain Engine` | **2 GB - 4 GB** | **0 GB** *(Instruksi CPU SHA)* | **4 Core** *(CPU flag: SHA, AES-NI)* | **500 GB NVMe** *(Append-Only WORM)* | Menghitung rantai hash kriptografis untuk integritas log mutasi dan perubahan berkas personel. |
| **4** | **Mesin Kecerdasan Buatan (LLM RAG Engine)** | `Ollama Daemon`, `llama.cpp runtime`, `bge-m3 embeddings` | **32 GB - 64 GB** | **16 GB - 48 GB VRAM** *(Wajib GPU)* | **16 Core** | **500 GB NVMe** *(Read > 6.000 MB/s)* | Memuat model LLM quantized (Llama 3 8B, Qwen 2.5 14B, DeepSeek R1) dan cache konteks. |
| **5** | **Validasi Dokumen OCR & Vision** | `Tesseract OCR v5`, `OpenCV`, `pdfcpu`, `Poppler` | **8 GB - 16 GB** | **4 GB - 8 GB VRAM** *(Opsional Akselerator)* | **8 Core** | **500 GB SSD** | Ekstraksi teks otomatis dari SKCK, Ijazah, KTP, dan Berkas Penilaian Kinerja (SMK). |
| **6** | **Frontend Web Server** | `Node.js 20 LTS`, `Next.js 16 (App Router)`, `Tailwind` | **4 GB - 8 GB** | **0 GB** | **4 - 8 Core** | **50 GB SSD** | Rendering antarmuka pengguna, session caching, dan koneksi HTTP/2. |
| **7** | **In-Memory Caching & Session Store** | `Redis 7.2 Enterprise` | **8 GB - 16 GB** | **0 GB** | **4 Core** | **50 GB SSD** | Menyimpan token otentikasi aktif, kuota rate-limiting, dan hasil kueri statistik sementara. |
| **TOTAL KEBUTUHAN MINIMAL SISTEM** | | | **88 GB - 176 GB RAM** | **20 GB - 56 GB VRAM** | **48 - 64 Core** | **2.65 TB NVMe** | Rekomendasi dibagi ke dalam arsitektur Multi-Server (Tier). |

---

## 3. ANALISIS KEBUTUHAN MEMORI GPU (VRAM) UNTUK MODEL AI OLLAMA

Kebutuhan GPU VRAM bergantung pada ukuran parameter model (*Model Parameter Size*) dan tingkat presisi/kuantisasi (*Quantization Level*):

```
+-----------------------------------------------------------------------------------+
| KEBUTUHAN VRAM = (Jumlah Parameter x Bytes per Weight) + KV-Cache Context Buffer |
+-----------------------------------------------------------------------------------+
```

### Rincian Kebutuhan VRAM Model AI SSDM:

1. **Meta Llama 3 (8B) - Standar Jawaban Cepat & Percakapan Harian**:
   - Format Q4_K_M (Kuantisasi 4-bit standar): **5.5 GB VRAM**
   - Buffer Konteks 8.192 Token (Data Riil Personel RAG): **1.5 GB VRAM**
   - **Total VRAM Dibutuhkan**: $\approx$ **7 GB - 8 GB VRAM**
   - *Rekomendasi Hardware*: Minimal NVIDIA RTX 4070 (12GB) / RTX A4000 (16GB).

2. **Alibaba Qwen 2.5 (14B) - Rekomendasi Terbaik Regulasi & Bahasa Indonesia**:
   - Format Q4_K_M (Kuantisasi 4-bit): **9.8 GB VRAM**
   - Format Q8_0 (Presisi 8-bit tinggi): **16.2 GB VRAM**
   - Buffer Konteks 16.384 Token (Dokumen Perkap Lengkap): **3.5 GB VRAM**
   - **Total VRAM Dibutuhkan**: $\approx$ **14 GB - 20 GB VRAM**
   - *Rekomendasi Hardware*: Minimal NVIDIA RTX 4090 (24GB) / NVIDIA RTX A5000 (24GB).

3. **DeepSeek-R1 (14B) / Llama 3.3 (70B Q4) - Mode Berpikir Mendalam (Deep Reasoning)**:
   - DeepSeek R1 14B Q4 + Reasoning Buffer: **12 GB - 16 GB VRAM**
   - Llama 70B Q4 (Analisis Strategis Skala Mabes): **42 GB - 48 GB VRAM**
   - **Total VRAM Dibutuhkan**: $\approx$ **48 GB - 96 GB VRAM**
   - *Rekomendasi Hardware*: **2x NVIDIA RTX A6000 Ada (2x 48GB = 96GB)** atau **NVIDIA H100 80GB PCIe**.

---

## 4. SPESIFIKASI TEKNIS HARDWARE PENGADAAN (3 TIER ARSITEKTUR)

Untuk menjamin keandalan operasional tingkat Mabes Polri (*Enterprise-Grade*), sistem direkomendasikan dibagi ke dalam 3 unit server fisik:

```mermaid
flowchart LR
    subgraph TIER 1 [TIER 1: AI INFERENCE SERVER]
        AI_SRV[2U GPU Server\n2x NVIDIA RTX A6000 Ada 96GB\n128GB DDR5 ECC / 64 Core]
    end

    subgraph TIER 2 [TIER 2: DATABASE & APP SERVER]
        DB_SRV[2U Database Server\n128GB DDR5 ECC / 32 Core\n4x 3.84TB NVMe U.2 RAID-10]
    end

    subgraph TIER 3 [TIER 3: NETWORK & BACKUP STORAGE]
        NET_SW[Switch 10GbE SFP+ Redundant]
        NAS_BOX[NAS Storage 8-Bay 64TB\nWORM Immutable SHA-256]
        UPS_SYS[Online Double-Conversion UPS 10kVA]
    end

    TIER 2 <--> TIER 1
    TIER 2 <--> TIER 3
```

---

### UNIT 1: SERVER INFERENSI KECERDASAN BUATAN (AI GPU SERVER) - 1 UNIT
*Fungsi: Menjalankan Ollama Daemon, Multi-Model LLM (Llama 3 / Qwen / DeepSeek), Pipa RAG, dan Ekstraksi OCR Dokumen.*

* **Form Factor** : 2U / 4U Rackmount Server (Dell PowerEdge R760xa / HPE ProLiant DL380a Gen11 / Supermicro AS-4125GS)
* **Prosesor (CPU)** : Dual AMD EPYC 9354 (Total 64 Cores, 128 Threads, Base 3.25 GHz, Max 3.8 GHz)
* **Memori RAM** : **128 GB** (4 x 32 GB) DDR5-4800MHz ECC Registered RDIMM
* **Akselerator Grafis (GPU)** : **2x NVIDIA RTX A6000 Ada Generation** (48 GB GDDR6 ECC per kartu, **Total 96 GB VRAM**, 36.352 CUDA Cores, 1.136 Tensor Cores)
* **Media Penyimpanan (Storage)** :
  - **OS & Models** : 2x 1.92 TB NVMe PCIe Gen4 M.2 / U.2 Enterprise SSD (RAID-1 Mirroring)
  - **AI Cache & Scratch** : 1x 3.84 TB NVMe PCIe Gen4 U.2 Enterprise SSD
* **Kartu Jaringan (NIC)** : Dual Port 10GbE SFP+ Base-T + Dual Port 1GbE RJ45
* **Catu Daya (PSU)** : Dual Redundant Titanium Hot-Plug Power Supply 2000W - 2400W (1+1)
* **Manajemen Jarak Jauh** : iDRAC9 Enterprise / iLO 6 Advanced / IPMI 2.0 Dedicated KVM

---

### UNIT 2: SERVER BASIS DATA & APLIKASI UTAMA (DATABASE & CORE APP SERVER) - 1 UNIT
*Fungsi: Menjalankan PostgreSQL 16 Enterprise (483.355 data personel), Backend Go REST API, Engine SHA-256 Hash Chain, dan Next.js.*

* **Form Factor** : 1U / 2U Rackmount Server (Dell PowerEdge R660 / HPE ProLiant DL360 Gen11)
* **Prosesor (CPU)** : 1x AMD EPYC 9254 (24 Cores, 48 Threads, Base 2.9 GHz, Max 4.15 GHz) atau Dual Intel Xeon Gold 5418Y
* **Memori RAM** : **128 GB** (4 x 32 GB) DDR5-4800MHz ECC Registered RDIMM
* **Pengendali RAID** : Hardware RAID Controller 12Gb/s SAS/NVMe dengan 4GB NV-Cache Battery Backed
* **Media Penyimpanan (Storage)** :
  - **Drive Database** : **4x 3.84 TB U.2 NVMe PCIe Gen4 Enterprise SSD (RAID-10)**
    *(Menghasilkan kapasitas efektif 7.68 TB dengan kecepatan baca > 14.000 MB/s dan ketahanan tulis 3 DWPD)*
  - **Drive OS & Log** : 2x 960 GB SATA/NVMe SSD (RAID-1 Mirroring)
* **Kartu Jaringan (NIC)** : Dual Port 10GbE SFP+ + Dual Port 1GbE
* **Catu Daya (PSU)** : Dual Redundant Platinum Hot-Plug Power Supply 800W - 1100W (1+1)
* **Sistem Pendingin** : Multi-Fan Redundant N+1

---

### UNIT 3: PERANGKAT PENYIMPANAN CADANGAN & JARINGAN (BACKUP STORAGE & NETWORK) - 1 PAKET
*Fungsi: Menyimpan arsip berkas personel, backup otomatis PostgreSQL harian, audit trail WORM (Write Once Read Many), dan interkoneksi 10 Gbps.*

* **Penyimpanan Cadangan (NAS)** : **Synology RackStation RS2423RP+ / QNAP Enterprise TS-873AeU-RP (2U 8-Bay)**
  - Harddisk : 8x 8 TB Enterprise SATA 7200 RPM 3.5" (RAID-6, Kapasitas Bersih $\approx$ 48 TB)
  - Fitur Khusus : Immutable Snapshot WORM (File backup `.zip` dan audit ledger tidak dapat dihapus/di-ransomware)
  - Catu Daya : Redundant Power Supply 350W
* **Switch Jaringan** : **1x Cisco CBS350-24XTS / MikroTik CRS328-24S+2Q+RM** (24 Port 10GbE SFP+ Managed Switch)
* **Catu Daya Nirdaya (UPS)** : **APC Smart-UPS On-Line SRT 10kVA / 10000VA (230V)** Rackmount 6U with Network Management Card (Otonomi daya 30-45 menit saat listrik padam)
* **Rak Server** : 1x Closed Rack Server 42U 1000mm lengkap dengan PDU 16 Outlet, Cable Management, dan Fan Tray

---

## 5. DAFTAR TOOLS & LISENSI PENDUKUNG YANG DIPERLUKAN

| No | Kategori | Nama Tool / Software | Jenis Lisensi | Fungsi Operasional |
|---|---|---|---|---|
| **1** | **Sistem Operasi Server** | `Ubuntu Server 24.04 LTS 64-bit` | Open Source (GPL) / Bebas Lisensi Komersial | Fondasi OS server produksi stabil dengan kernel Linux terbaru dan dukungan driver NVIDIA CUDA. |
| **2** | **Mesin AI Lokal** | `Ollama Engine v0.3+` / `vLLM Production Engine` | MIT / Apache 2.0 (Bebas Biaya Lisensi) | Inferensi model AI lokal berkecepatan tinggi tanpa batasan token. |
| **3** | **Model Bobot LLM** | `Meta Llama 3 8B` & `Alibaba Qwen 2.5 14B/32B` | Open Weights / Lisensi Komersial Terbuka | Model bahasa cerdas resmi yang telah diunduh dan disimpan secara permanen di server lokal. |
| **4** | **Engine Database** | `PostgreSQL 16.x` + `pg_stat_statements` | PostgreSQL License (Bebas Lisensi) | RDBMS ACID berkinerja tinggi menangani kueri 483K personel. |
| **5** | **Manajemen Kontainer** | `Docker Community Engine` & `Docker Compose v2` | Apache 2.0 (Bebas Biaya) | Standarisasi deployment modular backend, frontend, dan worker cron. |
| **6** | **Monitoring Server** | `Prometheus` + `Grafana Dashboard` + `Node Exporter` | Open Source | Memantau suhu GPU, kapasitas VRAM, latency database, dan penggunaan RAM 24/7. |
| **7** | **Keamanan Jaringan** | `Fortinet FortiGate 70F` / `pfSense Security Appliance` | Lisensi Perangkat Keras / Subskripsi 1-3 Thn | Firewall inspeksi paket mendalam (DPI) mencegah serangan siber ke sistem SSDM. |

---

## 6. RENCANA ANGGARAN BIAYA (RAB) PREDIKSI PENGADAAN

*Catatan: Harga diestimasi berdasarkan standar harga e-Katalog / Vendor Enterprise resmi Indonesia (HP Enterprise, Dell Technologies, Synology, NVIDIA Authorized Distributor) per Q3/Q4 2026, sudah termasuk PPN 11% dan estimasi instalasi kedinasan.*

### A. Komponen Hardware Server & Komputasi AI
| No | Uraian Barang / Jasa | Vol | Satuan | Harga Satuan (IDR) | Total Harga (IDR) |
|---|---|:---:|:---:|---:|---:|
| 1 | **Server GPU AI Inferensi 2U**<br>Dual AMD EPYC 9354 (64C/128T), 128GB DDR5 ECC, 2x 1.92TB NVMe OS (RAID-1), Dual 2000W Redundant PSU, Railkit & Accessories | 1 | Unit | Rp 165.000.000 | Rp 165.000.000 |
| 2 | **GPU Accelerator NVIDIA RTX A6000 Ada Generation (48 GB GDDR6 ECC)**<br>Original Authorized Distributor Indonesia (Garansi 3 Tahun) | 2 | Unit | Rp 128.000.000 | Rp 256.000.000 |
| 3 | **Server Basis Data & Aplikasi Core 1U/2U**<br>AMD EPYC 9254 (24C/48T), 128GB DDR5 ECC, 4x 3.84TB U.2 Enterprise NVMe SSD (RAID-10), Dual 1100W PSU, Railkit | 1 | Unit | Rp 145.000.000 | Rp 145.000.000 |
| 4 | **Perangkat Penyimpanan Cadangan NAS Enterprise 8-Bay**<br>Synology RackStation RS2423RP+ Dual PSU + RAM Upgrade 16GB ECC | 1 | Unit | Rp 42.000.000 | Rp 42.000.000 |
| 5 | **Harddisk NAS Enterprise 8 TB SATA 3.5" (Seagate IronWolf Pro / WD Gold)**<br>Untuk konfigurasi RAID-6 WORM Backup (8 unit) | 8 | Unit | Rp 4.200.000 | Rp 33.600.000 |
| **SUBTOTAL A (SERVER & STORAGE)** | | | | | **Rp 641.600.000** |

---

### B. Komponen Jaringan, Kelistrikan & Rack Infrastructure
| No | Uraian Barang / Jasa | Vol | Satuan | Harga Satuan (IDR) | Total Harga (IDR) |
|---|---|:---:|:---:|---:|---:|
| 1 | **Switch Core 10GbE SFP+ Managed 24-Port**<br>Cisco Business CBS350-24XTS / MikroTik Cloud Router Switch 10G | 1 | Unit | Rp 28.500.000 | Rp 28.500.000 |
| 2 | **Kabel DAC 10G SFP+ Direct Attach Copper & Transceiver SFP+ LC** | 10 | Pcs | Rp 850.000 | Rp 8.500.000 |
| 3 | **Next-Generation Hardware Firewall Appliance (Fortinet FG-70F / setara)**<br>Include 1-Year Threat Protection & Antivirus Bundle | 1 | Unit | Rp 24.000.000 | Rp 24.000.000 |
| 4 | **UPS On-Line Double Conversion 10 kVA / 10.000 VA (APC / Vertiv Liebert)**<br>Rackmount 6U, SNMP Network Card, Extended Battery Module | 1 | Unit | Rp 68.000.000 | Rp 68.000.000 |
| 5 | **Server Rack 42U Closed Rack (Depth 1000mm / 1100mm)**<br>Include 2x PDU 8-Port Vertical, Roof Fans, Cable Tray, Grounding Kit | 1 | Unit | Rp 18.500.000 | Rp 18.500.000 |
| **SUBTOTAL B (NETWORK, POWER & RACK)** | | | | | **Rp 147.500.000** |

---

### C. Jasa Implementasi, Security Hardening & Pelatihan Kedinasan
| No | Uraian Barang / Jasa | Vol | Satuan | Harga Satuan (IDR) | Total Harga (IDR) |
|---|---|:---:|:---:|---:|---:|
| 1 | **Jasa Instalasi Fisik Rackmount, Cabling Manajemen & Commissioning Data Center** | 1 | Paket | Rp 15.000.000 | Rp 15.000.000 |
| 2 | **Konfigurasi Enterprise PostgreSQL 16 Tuning, Indexing & Partitioning 483K Data** | 1 | Paket | Rp 25.000.000 | Rp 25.000.000 |
| 3 | **Konfigurasi Cluster Ollama Multi-GPU, CUDA Toolkit, & RAG Pipeline Optimization** | 1 | Paket | Rp 30.000.000 | Rp 30.000.000 |
| 4 | **Security Hardening (Audit Trail SHA-256 Validation, OS Bastion, SSL/TLS Setup)** | 1 | Paket | Rp 20.000.000 | Rp 20.000.000 |
| 5 | **Pelatihan Administrator & Transfer Knowledge Tim IT SSDM Polri (3 Hari)** | 1 | Paket | Rp 18.500.000 | Rp 18.500.000 |
| **SUBTOTAL C (JASA & IMPLEMENTASI)** | | | | | **Rp 108.500.000** |

---

### REKAPITULASI TOTAL ESTIMASI ANGGARAN (RAB)

| No | Kategori Alokasi Anggaran | Jumlah Biaya (IDR) | Persentase |
|:---:|---|---:|:---:|
| **A** | Server Komputasi AI & Database High-Performance | Rp 641.600.000 | 71.5% |
| **B** | Jaringan 10GbE, Power Protection UPS & Rack Infrastructure | Rp 147.500.000 | 16.4% |
| **C** | Jasa Implementasi, Security Hardening & Pelatihan Administrator | Rp 108.500.000 | 12.1% |
| **TOTAL KESELURUHAN ESTIMASI ANGGARAN** | | **Rp 897.600.000** | **100.0%** |

*(Terbilang: **Delapan Ratus Sembilan Puluh Tujuh Juta Enam Ratus Ribu Rupiah**)*

---

## 7. REKOMENDASI SKALABILITAS & DISASTER RECOVERY (DRC)

1. **Strategi Pemisahan Beban Komputasi**:
   Dengan memisahkan **Unit 1 (AI Server GPU)** dan **Unit 2 (Database Server)**, beban inferensi kecerdasan buatan yang berat tidak akan memperlambat kueri operasional personel harian (penggajian, absensi, kenaikan pangkat).
2. **Pencadangan Bertingkat (3-2-1 Backup Strategy)**:
   - **Salinan 1 (Lokal)**: Snapshot otomatis PostgreSQL di Server Unit 2 setiap 6 jam.
   - **Salinan 2 (NAS Internal)**: Arsip kompresi `.zip` harian ditransfer via jaringan 10GbE ke NAS Storage Unit 3 berfitur *Immutable WORM*.
   - **Salinan 3 (Offsite DRC)**: Sinkronisasi terenkripsi asinkron berkala ke Data Center Cadangan Polri (DRC Cikeas / Mabes).
3. **Efisiensi Anggaran Jangka Panjang (TCO)**:
   Dengan pengadaan server AI mandiri (*On-Premise*) senilai $\approx$ Rp 897 Juta, institusi Polri terbebas dari biaya langganan bulanan API Cloud (seperti OpenAI ChatGPT Enterprise yang dapat menghabiskan miliaran Rupiah per tahun untuk 483.355 data personel), sekaligus menjamin **100% kerahasiaan data intelijen dan personel Bhayangkara**.

---

*Disiapkan untuk: Biro Pembinaan Karier & Biro Sumber Daya Manusia (SSDM) Kepolisian Negara Republik Indonesia.*  
*Tanggal Dokumen: 27 September 2026.*
