# LAMPIRAN DIAGRAM UML SISTEM INFOPERS & ASISTEN TRIBRATA SSDM POLRI
**Dokumen Teknis Arsitektur Perangkat Lunak, Spesifikasi Hardware, dan Alur Interaksi**  
*Klasifikasi: Terbatas / Kedinasan Internal SSDM POLRI*  
*Tahun Anggaran: 2026*  
*Terakhir Diperbarui: 27 September 2026*

---

## 1. PENDAHULUAN
Dokumen lampiran teknis ini memuat pemodelan arsitektur sistem berbasis **Unified Modeling Language (UML)** untuk **Sistem Informasi Personel (INFOPERS) & Asisten Tribrata (SSDM Artificial Intelligence)**. Pemodelan ini dirancang sesuai standar rekayasa perangkat lunak enterprise dan tata kelola TI Polri Presisi, mencakup integrasi penuh antara:
1. **Frontend Layer:** Next.js 15 (React 19, TypeScript, TailwindCSS, Lucide Icons)
2. **Backend Microservice Layer:** Golang Microservice (Gorilla Mux, JWT Bearer Token, Smart NLP Parser, Connection Pool)
3. **Database Enterprise Layer:** PostgreSQL 15+ (483.355 Records: 465.971 Polri, 15.718 ASN/PNS, 1.666 PPPK)
4. **AI Inference Runtime Layer:** Ollama Local LLM Runtime (Dual NVIDIA RTX A6000 Ada 96GB VRAM, Llama-3-8B, Qwen-2.5-14B)
5. **Infrastruktur Datacenter On-Premises:** 3-Tier Enterprise Server (Server AI, Server Backend & Database, NAS Storage Vault WORM 48TB)

---

## 2. UML DEPLOYMENT DIAGRAM (INFRASTRUKTUR HARDWARE & TOPOLOGI FISIK)

Diagram berikut memodelkan penempatan fisik setiap modul perangkat lunak pada node server datacenter on-premises Mabes Polri serta jalur komunikasi jaringan:

```mermaid
flowchart TD
    %% Node Klien
    subgraph NODE_CLIENT["Simpul Klien: Workstation Mabes & 34 Polda"]
        CLIENT_BROWSER["Web Browser Klien\n(Chrome / Edge / Firefox)\nMode: Website & Asisten AI"]
    end

    %% Node Perimeter Keamanan
    subgraph NODE_PERIMETER["Perimeter Keamanan Jaringan Datacenter Mabes Polri"]
        FW["NextGen Hardware Firewall Appliance\nStateful Inspection & IPS/IDS Anti-DDoS"]
        SW_CORE["Switch Core 24-Port 10G SFP+ Managed L3\nVLAN 10 (Web) | VLAN 20 (DB) | VLAN 30 (AI)"]
    end

    %% Tier 1: Frontend Server
    subgraph TIER_FE["Simpul 1: Server Frontend Web (Node.js Host)"]
        APP_NEXTJS["Next.js 15 Web Application\nReact 19 Server Components\n[Port: 3000 | HTTPS]"]
    end

    %% Tier 2: Backend Application Server
    subgraph TIER_BE["Simpul 2: Server Backend Microservice (AMD EPYC 9254 / 128GB ECC)"]
        APP_GOLANG["Golang Microservice Binary (infopers_server.exe)\nGorilla Mux | JWT Middleware | Smart NLP\n[Port: 8085 / 8080 | HTTP REST]"]
        APP_MONITOR["System Resource Monitor\nWMI / CIM / Process Metrics Collector"]
    end

    %% Tier 3: Database Server Enterprise
    subgraph TIER_DB["Simpul 3: Server Database PostgreSQL (RAID-10 NVMe)"]
        DB_POSTGRES[("PostgreSQL Enterprise 15+\n[Port: 5432 | TCP pgx Pool]\n• public.data_polri_september_2026 (483.355 data)\n  - Polri: 465.971 (96,40%)\n  - ASN: 15.718 (3,25%)\n  - PPPK: 1.666 (0,35%)\n• dummy_user_access & Audit Trail Log")]
    end

    %% Tier 4: Server AI Inference
    subgraph TIER_AI["Simpul 4: Server Akselerator AI (Dual AMD EPYC 9354 / 256GB ECC)"]
        subgraph GPU_ACCEL["Dual GPU NVIDIA RTX A6000 Ada (Total 96 GB GDDR6 ECC VRAM)"]
            AI_OLLAMA["Ollama LLM Inference Engine\nC++ / GGML Tensor Cores\n[Port: 11434]"]
            AI_MODELS["Model Weights VRAM:\n• Llama-3-8B-Instruct (6.5 GB)\n• Qwen-2.5-14B (13.0 GB)\n• BGE-M3 Embeddings (2.5 GB)"]
        end
    end

    %% Tier 5: Backup & Storage Vault
    subgraph TIER_NAS["Simpul 5: Storage & Vault Backup (NAS 12-Bay Hot-Swap)"]
        NAS_VAULT["Synology Enterprise NAS (48TB RAID-6)\nWORM (Write Once Read Many) Immutable Storage\n[Port: 2049 NFS / 445 SMB]"]
    end

    %% Relasi Komunikasi Antar Node
    CLIENT_BROWSER -->|"HTTPS / WSS (Port 443 -> 3000)"| FW
    FW -->|"10GbE Fiber Backbone"| SW_CORE
    SW_CORE -->|"Internal VLAN 10 (Port 3000)"| APP_NEXTJS
    APP_NEXTJS -->|"Internal API REST (Port 8085)"| APP_GOLANG
    APP_GOLANG -->|"TCP pgx Pool (Port 5432)"| DB_POSTGRES
    APP_GOLANG -->|"Internal HTTP JSON (Port 11434)"| AI_OLLAMA
    APP_GOLANG -.->|"Direct Kernel CIM Query"| APP_MONITOR
    AI_OLLAMA -->|"PCIe 4.0 x16 (960 GB/s)"| AI_MODELS
    DB_POSTGRES -->|"Hourly Automated Snapshot"| NAS_VAULT
```

---

## 3. UML COMPONENT DIAGRAM (STRUKTUR MODUL PERANGKAT LUNAK)

Diagram komponen ini menggambarkan dekomposisi modular perangkat lunak INFOPERS, pemisahan tanggung jawab antarmuka, layanan bisnis, dan penyimpanan:

```mermaid
flowchart TD
    subgraph COMP_FE["Komponen Frontend (Next.js 15 SPA)"]
        FE_APP["MainApp & Navigation Controller"]
        FE_SIDEBAR["Sidebar Navigation (Dual Mode: AI vs Website)"]
        FE_AI_VIEW["AsistenTribrataView (Chat LLM, Audio, Deep Thinking)"]
        FE_DATA_VIEW["DashboardView / Data Personel (Hero KPI 483K)"]
        FE_DOC_VIEW["DokumenPerencanaanView (RAB & Arsitektur)"]
        FE_MEM_VIEW["RecordMemoryView (Monitor RAM/NVRAM Real-time)"]
        FE_API_CLIENT["lib/api.ts (fetchWithAuth & Bearer Token Interceptor)"]
    end

    subgraph COMP_BE["Komponen Backend (Golang Microservices)"]
        BE_ROUTER["HTTP Router (Gorilla Mux)"]
        BE_AUTH_MD["JWTMiddleware & RBAC Authorizer"]
        BE_AUTH_H["AuthHandler (Login, Hash SHA-256, Session)"]
        BE_DASH_H["DashboardHandler (GetStats: Agregasi Cepat 483K Data)"]
        BE_AI_H["AIHandler (Ask: RAG Orchestrator & Ollama Proxy)"]
        BE_NLP["Smart NLP Parser (parseSmartPersonnelQuery)"]
        BE_SYS_H["SystemHandler (WMI RAM, GPU VRAM & Process Table)"]
        BE_REMUN_H["RemunerasiHandler (Tukin & Hak JF Simulation)"]
    end

    subgraph COMP_DB["Komponen Database (PostgreSQL 15)"]
        DB_TABLE_PERS[("Tabel: public.data_polri_september_2026\n483.355 Records\nIndices: idx_nip, idx_nama, idx_satker, idx_jenis")]
        DB_TABLE_USERS[("Tabel: dummy_user_access\nUser Credentials & Hash")]
        DB_TABLE_AUDIT[("Tabel: audit_trail_log\nSHA-256 Chain Access Logs")]
    end

    subgraph COMP_AI["Komponen AI (Ollama Local Inference)"]
        AI_SERVER["Ollama Server (Port 11434)"]
        AI_ROUTER["Model Selector & Queue Scheduler"]
        AI_LLM_LLAMA["Llama-3-8B Instance (Q4_K_M)"]
        AI_LLM_QWEN["Qwen-2.5-14B Instance (Deep Reasoning)"]
    end

    %% Relasi Antar Komponen
    FE_APP --> FE_SIDEBAR
    FE_APP --> FE_AI_VIEW
    FE_APP --> FE_DATA_VIEW
    FE_APP --> FE_DOC_VIEW
    FE_APP --> FE_MEM_VIEW
    FE_AI_VIEW --> FE_API_CLIENT
    FE_DATA_VIEW --> FE_API_CLIENT
    FE_MEM_VIEW --> FE_API_CLIENT

    FE_API_CLIENT -->|"HTTP REST JSON"| BE_ROUTER
    BE_ROUTER --> BE_AUTH_MD
    BE_AUTH_MD --> BE_AUTH_H
    BE_AUTH_MD --> BE_DASH_H
    BE_AUTH_MD --> BE_AI_H
    BE_AUTH_MD --> BE_SYS_H
    BE_AUTH_MD --> BE_REMUN_H

    BE_AI_H --> BE_NLP
    BE_AI_H -->|"SQL Prepared Statement"| DB_TABLE_PERS
    BE_AI_H -->|"RAG Augmented Prompt"| AI_SERVER
    BE_DASH_H -->|"Aggregate Query: COUNT(*) FILTER"| DB_TABLE_PERS
    BE_AUTH_H --> DB_TABLE_USERS

    AI_SERVER --> AI_ROUTER
    AI_ROUTER --> AI_LLM_LLAMA
    AI_ROUTER --> AI_LLM_QWEN
```

---

## 4. UML SEQUENCE DIAGRAM (ALUR INTERAKSI PROSES END-TO-END)

### Skenario 1: Kueri Cerdas Asisten Tribrata ("Siapa nama PPPK di Satker Puskeu Polri?")
Diagram ini memodelkan interaksi antara **Asisten Tribrata**, **Go NLP Smart Parser**, **PostgreSQL 483K Data**, dan **Ollama Local LLM**:

```mermaid
sequenceDiagram
    autonumber
    actor Staf as Perwira / Staf SSDM
    participant UI as Asisten Tribrata (Next.js)
    participant Auth as JWT Middleware (Go)
    participant AIH as AIHandler (Go Backend)
    participant NLP as Smart NLP Parser (Go)
    participant DB as PostgreSQL Database (Port 5432)
    participant Ollama as Ollama Engine (Dual RTX A6000)

    Staf->>UI: Ketik: "siapa nama pppk di puskeu polri" & Kirim
    UI->>Auth: POST /api/ai/ask { query, model: "llama3:8b", deep_thinking: true } (Bearer Token)
    Auth->>Auth: Verifikasi Keabsahan JWT Token
    Auth->>AIH: Teruskan Request ke AIHandler.Ask()
    
    AIH->>NLP: parseSmartPersonnelQuery(prompt)
    Note over NLP: Ekstraksi Entitas Cerdas:<br/>- Status: 'PPPK'<br/>- Satker: '%puskeu%'<br/>- Mode: Direct Person Search
    NLP-->>AIH: Structured Search Filter Params

    AIH->>DB: Eksekusi SQL CTE Terindeks:<br/>SELECT nip_nrp, nama, pangkat, nama_satker, jenis_personel<br/>FROM public.data_polri_september_2026<br/>WHERE jenis_personel = 'PPPK' AND nama_satker ILIKE '%puskeu%'
    DB-->>AIH: Hasil: 1 Record (RISNA SEPTIANA, S.E. | NIP: 198409182024212008)

    alt Data Personel Terverifikasi di Basis Data
        AIH->>AIH: Bentuk RAG Grounding Context Kedinasan:<br/>[FAKTA DATASET RESMI SSDM: RISNA SEPTIANA, S.E. - PENATA MUDA PPPK PUSKEU]
        AIH->>Ollama: POST /api/generate { model: "llama3:8b", prompt: Grounding Context + Query }
        Note over Ollama: Tensor Cores GPU RTX A6000<br/>Kecepatan Inferensi: >45 tok/s<br/>Konsumsi VRAM: 6.5 GB
        Ollama-->>AIH: Respons Teks Terstruktur, Sopan & Lugas Tanpa Simbol Aneh
    else Data Tidak Ditemukan / Pertanyaan Bersifat Konseptual
        AIH->>Ollama: Generate Jawaban Konseptual Berdasarkan Pengetahuan SOP Polri
        Ollama-->>AIH: Respons AI
    end

    AIH-->>UI: Response JSON { answer, facts: [...], processing_time: "135ms" }
    UI-->>Staf: Render Jawaban Resmi + Informasi Personel Presisi
```

---

### Skenario 2: Sinkronisasi & Agregasi Real-Time Menu "Data Personel"
Diagram ini memodelkan kueri langsung dari antarmuka eksekutif **Data Personel** ke PostgreSQL untuk menyajikan total, Polri, PNS, dan PPPK:

```mermaid
sequenceDiagram
    autonumber
    actor Pimpinan as Pimpinan / Staf SSDM
    participant UI as Data Personel View (Next.js)
    participant Auth as JWT Middleware (Go)
    participant DashH as DashboardHandler (Go Backend)
    participant DB as PostgreSQL Database (Port 5432)

    Pimpinan->>UI: Klik Menu "Data Personel" (Sidebar Pilar 1)
    UI->>Auth: GET /api/dashboard/stats (Bearer Token)
    Auth->>Auth: Validasi Sesi Pengguna
    Auth->>DashH: Teruskan ke DashboardHandler.GetStats()
    
    Note over DashH: Catat Waktu Awal (t0 = time.Now())
    DashH->>DB: Eksekusi 1 Kueri Agregasi Cepat:<br/>SELECT COUNT(*),<br/>COUNT(*) FILTER (WHERE jenis_personel IN ('ASN','PNS')),<br/>COUNT(*) FILTER (WHERE jenis_personel = 'PPPK')<br/>FROM public.data_polri_september_2026;
    
    Note over DB: Eksekusi Engine PostgreSQL 15<br/>Pindai 483.355 Records Terindeks<br/>Durasi: < 120 ms
    DB-->>DashH: Return Total: 483.355 | ASN: 15.718 | PPPK: 1.666
    
    DashH->>DashH: Kalkulasi Kuantitatif:<br/>• Total Polri = 483.355 - 15.718 - 1.666 = 465.971<br/>• Persentase: Polri 96,40% | PNS 3,25% | PPPK 0,35%<br/>• Hitung query_time_ms
    
    DashH-->>UI: Return JSON { total_personel: 483355, total_polri: 465971, total_pns: 15718, total_pppk: 1666, query_time_ms: 118 }
    UI-->>Pimpinan: Tampilkan 4 Kartu KPI Mewah + Bilah Proporsi Multi-Segmen
```

---

### Skenario 3: Pemantauan Hardware & Record Memory Device
Diagram interaksi saat staf memantau pemakaian RAM dan NVRAM secara *real-time*:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Staf Administrator TI
    participant UI as Record Memory View (Next.js)
    participant SysH as SystemHandler (Go Backend)
    participant OS as Kernel Windows (WMI / CIM / Process Table)

    Admin->>UI: Buka Menu "Record Memory & NVRAM Device"
    UI->>SysH: GET /api/system/device-resources (Bearer Token)
    SysH->>OS: Query Win32_OperatingSystem (TotalRAM, FreeRAM, UsedRAM)
    SysH->>OS: Query Win32_VideoController (GPU Name, VRAM MB, Dedicated Status)
    SysH->>OS: Query Get-Process (Postgres, Node, Backend, Ollama WorkingSet MB)
    OS-->>SysH: Return Metrik Kapasitas Hardware
    SysH->>SysH: Kalkulasi Persentase Beban & Rekomendasi Kapasitas LLM
    SysH-->>UI: Return JSON { ram: { total, used, free }, gpu: { name, vram }, processes: [...] }
    UI-->>Admin: Visualisasi RAM Bar, Status VRAM, & Evaluasi Kapasitas
    
    opt Admin Merekam Snapshot Memory
        Admin->>UI: Klik "Rekam Snapshot Memory Sekarang" + Catatan
        UI->>UI: Simpan Snapshot ke Local Storage & Riwayat Audit
        UI-->>Admin: Notifikasi Snapshot Berhasil Tersimpan
    end
```

---

## 5. UML ACTIVITY DIAGRAM (ALUR LOGIKA PEMROSESAN PERTANYAAN AI)

```mermaid
flowchart TD
    Start([User Mengajukan Pertanyaan di Asisten Tribrata]) --> InputCheck{Input Kosong?}
    InputCheck -- Ya --> ErrorPrompt[Tampilkan Peringatan Input]
    InputCheck -- Tidak --> SendAPI[Kirim POST /api/ai/ask dengan JWT]
    
    SendAPI --> TokenValid{Token Valid?}
    TokenValid -- Tidak --> RedirectLogin[Redirect ke Halaman Login]
    TokenValid -- Ya --> NLPParse[Ekstraksi Entitas & Filter SQL Cerdas]
    
    NLPParse --> HasEntity{Ada Entitas Spesifik?<br/>Nama / NRP / NIP / Satker / Golongan / PPPK}
    
    HasEntity -- Ya --> RunDB[Jalankan Kueri SQL CTE ke PostgreSQL 483K Data]
    RunDB --> DBFound{Hasil Data > 0?}
    
    DBFound -- Ya --> BuildRAG[Susun Fakta Kedinasan & Masukkan ke System Prompt]
    DBFound -- Tidak --> BuildFallback[Gunakan Basis Pengetahuan Dokumen & SOP Polri]
    
    HasEntity -- Tidak --> BuildFallback
    
    BuildRAG --> CheckOllama{Ollama Host Aktif?<br/>Port 11434}
    BuildFallback --> CheckOllama
    
    CheckOllama -- Ya --> GPUInference[Inferensi Cepat di GPU Dual RTX A6000 Ada<br/>Throughput >45 tok/s]
    CheckOllama -- Tidak --> RuleFallback[Fallback ke Respon Aturan Internal Go Backend]
    
    GPUInference --> CleanFormatter[Format Respons: Hapus Karakter Aneh / Markdown Kotor]
    RuleFallback --> CleanFormatter
    
    CleanFormatter --> Finish([Tampilkan Hasil Presisi & Rapi di Layar Asisten Tribrata])
```

---

## 6. SPESIFIKASI PORT & PROTOKOL KOMUNIKASI RESMI

| Port | Protokol | Sumber (*Source*) | Tujuan (*Destination*) | Fungsi & Keterangan Kedinasan |
| :---: | :---: | :---: | :---: | :--- |
| **3000** | TCP / HTTPS | Browser Klien (Mabes/Polda) | Next.js Web Server | Akses antarmuka Web INFOPERS, Data Personel, & Asisten Tribrata |
| **8080** | TCP / REST API | Next.js Server | Go Microservice (`backend.exe`) | Layanan API data personel, agregasi kuantitatif, login JWT, dan proxy AI |
| **5432** | TCP / PostgreSQL | Go Microservice | PostgreSQL Engine | Kueri data 483.355 personel (Polri 465K, ASN 15.7K, PPPK 1.6K) |
| **11434** | TCP / HTTP REST | Go Microservice | Ollama AI Engine | Inferensi lokal model LLM (Llama3-8B / Qwen2.5) pada GPU RTX A6000 |
| **2049 / 445** | NFS / SMB | Server Database | NAS Storage Vault | Backup otomatis snapshot berkas basis data & dokumen berkala |

---

## 7. MATRIKS ALOKASI MEMORI & HARDWARE PADA ARSITEKTUR PRODUKSI

```text
+---------------------------------------------------------------------------------------------------------+
| SERVER HARDWARE DATACENTER PRODUKSI SSDM POLRI (TOTAL ANGGARAN: Rp 897.600.000,-)                       |
+---------------------------------------------------------------------------------------------------------+
| SIMPUL 1: AI INFERENCE SERVER (2U RACK)                                                                 |
| - Processor  : Dual AMD EPYC 9354 (64 Cores / 128 Threads, 256MB L3 Cache)                              |
| - Memori     : 256 GB ECC Registered DDR5-4800 MHz                                                      |
| - Akselerator: DUAL NVIDIA RTX A6000 Ada Generation (Total 96 GB GDDR6 ECC VRAM | 960 GB/s Bandwidth)   |
| - Peran      : Host Utama Ollama AI Engine, Menampung Model 8B s.d 70B & Multi-User 150+ Concurrency    |
+---------------------------------------------------------------------------------------------------------+
| SIMPUL 2: DATABASE & BACKEND SERVER (1U RACK)                                                           |
| - Processor  : Single AMD EPYC 9254 (24 Cores / 48 Threads, 128MB L3 Cache)                             |
| - Memori     : 128 GB ECC Registered DDR5-4800 MHz                                                      |
| - Storage    : 4x 1.92 TB NVMe PCIe 4.0 SSD Enterprise RAID-10 (850.000 IOPS Read/Write)                |
| - Peran      : Host PostgreSQL (483.355 records) & Go Microservices (Latency Kueri < 20 ms)             |
+---------------------------------------------------------------------------------------------------------+
| SIMPUL 3: BACKUP & AUDIT VAULT (NAS 12-BAY)                                                            |
| - Unit       : Synology Enterprise RackStation 12-Bay Hot-Swap                                          |
| - Kapasitas  : 6x 8 TB Enterprise SATA HDD (48 TB Gross RAID-6) + 2x 1 TB NVMe Cache M.2                |
| - Keamanan   : WORM (Write Once Read Many) + Immutable Snapshot SHA-256 Anti-Tamper                     |
+---------------------------------------------------------------------------------------------------------+
```

---

## 8. STATISTIK BASIS DATA TERPUSAT POSTGRESQL (SEPTEMBER 2026)

Tabel berikut menjadi acuan kebenaran data (*single source of truth*) yang diintegrasikan ke dalam antarmuka INFOPERS:

| Kategori Kepegawaian | Jumlah Riil (Data Terpusat) | Persentase Rasio | Kualifikasi & Jenjang Resmi |
| :--- | :---: | :---: | :--- |
| **Anggota POLRI** | **465.971** | **96,40%** | Perwira Tinggi (Pati), Pamen, Pama, Bintara, Tamtama |
| **PNS / ASN POLRI** | **15.718** | **3,25%** | PNS Golongan I s/d IV & Jabatan Fungsional Keahlian |
| **PPPK POLRI** | **1.666** | **0,35%** | Pegawai Perjanjian Kerja (Tenaga Kesehatan & Teknis) |
| **TOTAL PERSONEL** | **483.355** | **100,00%** | **Seluruh Personel Aktif Terdata di Basis Data Terpusat** |

---
*Dokumen Lampiran UML Arsitektur ini disahkan sebagai standar teknis integrasi sistem INFOPERS dan Asisten Tribrata SSDM Polri.*
