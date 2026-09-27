"use client";

import React, { useState } from "react";
import {
  Server,
  Cpu,
  HardDrive,
  Database,
  Shield,
  Layers,
  DollarSign,
  FileText,
  CheckCircle2,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

export default function DokumenPerencanaanView() {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "arsitektur" | "vram_ram" | "rab">("ringkasan");

  const vramData = [
    {
      library: "Ollama Runtime (C++ / GGML)",
      kegunaan: "Engine inferensi lokal LLM & multi-tenant queue",
      model: "Llama-3-8B (Q4_K_M)",
      vram: "6.5 GB",
      ram: "8 GB",
      status: "Sangat Ringan (Optimal)",
    },
    {
      library: "Ollama Runtime",
      kegunaan: "Inferensi penalaran tinggi & deep reasoning",
      model: "Qwen-2.5-14B / 32B (Q4)",
      vram: "11 GB - 22 GB",
      ram: "16 GB - 32 GB",
      status: "Siap di Dual A6000",
    },
    {
      library: "PyTorch 2.4+ (CUDA 12.4)",
      kegunaan: "Fine-Tuning LoRA / QLoRA data kedinasan Polri",
      model: "Llama-3-8B (FP16 Base)",
      vram: "18 GB - 24 GB",
      ram: "32 GB",
      status: "Butuh VRAM Dedikasi",
    },
    {
      library: "HuggingFace Transformers",
      kegunaan: "Embedding model (IndoBERT/BGE-M3 RAG)",
      model: "bge-m3 / multilingual-e5",
      vram: "2.5 GB",
      ram: "4 GB",
      status: "Berjalan Paralel",
    },
    {
      library: "LangChain / LangGraph",
      kegunaan: "Orkestrator RAG, query SQL, & agent routing",
      model: "Routing & Memory Chain",
      vram: "0 GB (CPU Bound)",
      ram: "4 GB - 8 GB",
      status: "Konsumsi RAM Sistem",
    },
    {
      library: "ChromaDB / pgvector",
      kegunaan: "Vector storage untuk 50.000+ SOP & Perpol",
      model: "Index HNSW (1024-dim)",
      vram: "0 GB (GPU) / 4 GB (Opsional)",
      ram: "12 GB - 16 GB",
      status: "Database Ram Cache",
    },
  ];

  const rabItems = [
    {
      no: 1,
      kategori: "Server AI & LLM Inference (GPU)",
      item: "2U Enterprise GPU Server, Dual AMD EPYC 9354 (64 Core), 256GB ECC DDR5, Dual NVIDIA RTX A6000 Ada 96GB Total VRAM, 2x 3.84TB NVMe, Dual 10GbE SFP+",
      vol: "1 Unit",
      satuan: "Unit",
      harga: 465000000,
    },
    {
      no: 2,
      kategori: "Database & Backend Application Server",
      item: "1U Enterprise Rack Server, Single AMD EPYC 9254 (24 Core), 128GB ECC DDR5, 4x 1.92TB NVMe PCIe 4.0 RAID-10, Dual 10GbE LAN (PostgreSQL 483K records)",
      vol: "1 Unit",
      satuan: "Unit",
      harga: 148500000,
    },
    {
      no: 3,
      kategori: "Secure Storage & Backup Vault (NAS)",
      item: "Synology Enterprise RackStation 12-Bay, 6x 8TB Enterprise SATA HDD (48TB Gross RAID-6), 2x 1TB NVMe Cache M.2, 10GbE Card (WORM & Snapshot SHA-256)",
      vol: "1 Unit",
      satuan: "Unit",
      harga: 92800000,
    },
    {
      no: 4,
      kategori: "Network & Security Infrastructure",
      item: "Switch 24-Port 10G SFP+ / Multi-Gig Layer 3 Managed Enterprise + Firewall Hardware Appliance On-Premises (NextGen Firewall with IPS/IDS)",
      vol: "1 Paket",
      satuan: "Paket",
      harga: 68300000,
    },
    {
      no: 5,
      kategori: "Power Backup & Enclosure",
      item: "Online Double-Conversion Rackmount UPS 6kVA / 5400W + External Battery Pack (EBM) + Server Rack 42U Heavy Duty lengkap dengan PDU & Cable Management",
      vol: "1 Paket",
      satuan: "Paket",
      harga: 58000000,
    },
    {
      no: 6,
      kategori: "Instalasi, Konfigurasi, & Uji Beban",
      item: "Jasa Deployment Bare-Metal, Clustering, Security Hardening, Fine-Tuning Ollama AI, Optimasi Database PostgreSQL 483K Rows, dan Uji Penetrasi",
      vol: "1 Paket",
      satuan: "Paket",
      harga: 65000000,
    },
  ];

  const totalRAB = rabItems.reduce((acc, item) => acc + item.harga, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Shield size={13} />
              DOKUMEN RESMI PERENCANAAN PENGADAAN TA 2026
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Perencanaan Pengadaan Hardware & Infrastruktur On-Premises
            </h1>
            <p className="text-blue-200/90 text-sm mt-2 max-w-3xl leading-relaxed">
              Infrastruktur Server AI On-Premises SSDM Polri Presisi untuk Mendukung Operasional LLM (Ollama), 
              Database 483.355 Personel (Polri, ASN, PPPK), dan Keamanan Data Mandiri (Air-Gapped).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20"
            >
              <Printer size={15} />
              Cetak / Print
            </button>
            <a
              href="/DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md"
              target="_blank"
              download
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Download size={15} />
              Unduh Naskah Markdown
            </a>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <div className="text-xs text-blue-300">Total Anggaran (RAB)</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{formatRupiah(totalRAB)}</div>
          </div>
          <div>
            <div className="text-xs text-blue-300">GPU VRAM Tersedia</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">96 GB (Dual A6000)</div>
          </div>
          <div>
            <div className="text-xs text-blue-300">Kapasitas RAM Server</div>
            <div className="text-xl font-black text-white mt-0.5">384 GB ECC DDR5</div>
          </div>
          <div>
            <div className="text-xs text-blue-300">Keamanan Data</div>
            <div className="text-xl font-black text-blue-300 mt-0.5">100% On-Premises</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#27272a] gap-2">
        <button
          onClick={() => setActiveTab("ringkasan")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "ringkasan"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText size={15} />
          Ringkasan Eksekutif
        </button>
        <button
          onClick={() => setActiveTab("arsitektur")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "arsitektur"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Server size={15} />
          Spesifikasi 3-Tier Hardware
        </button>
        <button
          onClick={() => setActiveTab("vram_ram")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "vram_ram"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Cpu size={15} />
          Analisis VRAM & RAM per Library
        </button>
        <button
          onClick={() => setActiveTab("rab")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "rab"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <DollarSign size={15} />
          Rencana Anggaran Biaya (RAB)
        </button>
      </div>

      {/* TAB 1: RINGKASAN EKSEKUTIF */}
      {activeTab === "ringkasan" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                Latar Belakang & Urgensi Pengadaan
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Sistem Informasi Personel SSDM Polri mengelola data sensitif dari <strong>483.355 personel</strong> (Polri, ASN, dan PPPK) 
                di seluruh 34 Polda dan Mabes Polri. Integrasi modul AI berbasis LLM (Ollama) memerlukan komputasi tensor tinggi dan latensi rendah 
                tanpa boleh membocorkan data ke cloud publik (prinsip kedaulatan data dan UU PDP).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a]">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">100% On-Premises / Air-Gapped</div>
                  <div className="text-[11px] text-slate-500 mt-1">Seluruh inferensi AI berjalan di dalam datacenter Mabes Polri tanpa koneksi internet luar.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a]">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Kecepatan Inferensi &lt; 800ms</div>
                  <div className="text-[11px] text-slate-500 mt-1">Dual GPU RTX A6000 Ada menghasilkan throughput lebih dari 45 token/detik per user.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a]">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Dukungan Multi-Model LLM</div>
                  <div className="text-[11px] text-slate-500 mt-1">Mampu menjalankan Llama-3-8B, Qwen-2.5-14B/32B, DeepSeek-R1, dan Embedding bge-m3 secara simultan.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a]">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ketahanan Operasional 99.9%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Redundansi daya UPS 6kVA online ganda, RAID-10 NVMe, dan backup WORM NAS 48TB.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Informasi Dokumen
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-[#27272a]">
                  <span className="text-slate-500">Nomor Dokumen</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">DOK-REN/SSDM/2026/09</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-[#27272a]">
                  <span className="text-slate-500">Tahun Anggaran</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">TA 2026</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-[#27272a]">
                  <span className="text-slate-500">Satker Pemohon</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">SSDM POLRI</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-[#27272a]">
                  <span className="text-slate-500">Status Pengusulan</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    SIAP AJUKAN (FINAL)
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Total Usulan RAB</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Rp 897.600.000,-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPESIFIKASI 3-TIER */}
      {activeTab === "arsitektur" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TIER 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-blue-200 dark:border-blue-900/50 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 flex items-center justify-center font-black mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">TIER 1: AI & GPU INFERENCE SERVER</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Dedicated Host untuk Ollama, PyTorch, & RAG Vector Engine</p>
              
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>GPU:</strong> 2x NVIDIA RTX A6000 Ada Generation (Total 96GB GDDR6 ECC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Processor:</strong> Dual AMD EPYC 9354 (64 Core, 128 Thread)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>RAM:</strong> 256GB (8x 32GB) DDR5-4800MHz ECC Registered</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Storage:</strong> 2x 3.84TB NVMe PCIe 4.0 SSD Enterprise RAID-1</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Jaringan:</strong> Dual 10GbE SFP+ Direct Fiber</span>
                </li>
              </ul>
            </div>

            {/* TIER 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-indigo-200 dark:border-indigo-900/50 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center font-black mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">TIER 2: DATABASE & BACKEND SERVER</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Host PostgreSQL 483K Rows & Go Microservices</p>
              
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Processor:</strong> Single AMD EPYC 9254 (24 Core, 48 Thread)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>RAM:</strong> 128GB (4x 32GB) DDR5-4800MHz ECC</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Storage:</strong> 4x 1.92TB NVMe SSD U.2 RAID-10 (High IOPS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Throughput:</strong> 850.000 IOPS Random Read/Write</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Daya:</strong> 2x 800W Titanium Redundant Hot-Swap</span>
                </li>
              </ul>
            </div>

            {/* TIER 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-amber-200 dark:border-amber-900/50 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center font-black mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">TIER 3: STORAGE & AUDIT VAULT (NAS)</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Penyimpanan Riwayat Hidup, SKep, & Audit Trail SHA-256</p>
              
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Unit:</strong> Synology Enterprise RackStation 12-Bay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Kapasitas:</strong> 6x 8TB Enterprise SATA HDD (48TB Gross RAID-6)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Cache:</strong> 2x 1TB NVMe M.2 Read/Write Accelerator</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Integritas:</strong> WORM (Write Once Read Many) + Immutable Snapshot</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Backup Otomatis:</strong> Sinkronisasi per jam dengan stempel waktu</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANALISIS VRAM & RAM PER LIBRARY */}
      {activeTab === "vram_ram" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              Matriks Kebutuhan VRAM & RAM per Library / Model AI
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-semibold">Library / Framework</th>
                    <th className="pb-3 font-semibold">Kegunaan di SSDM Polri</th>
                    <th className="pb-3 font-semibold">Model / Konfigurasi</th>
                    <th className="pb-3 font-semibold">Kebutuhan GPU VRAM</th>
                    <th className="pb-3 font-semibold">Kebutuhan RAM Sistem</th>
                    <th className="pb-3 font-semibold">Status Dukungan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                  {vramData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{row.library}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{row.kegunaan}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272a] font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {row.model}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{row.vram}</td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{row.ram}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                          <CheckCircle2 size={11} />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
              <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Kesimpulan Alokasi GPU VRAM:</strong> Dengan total <strong>96 GB VRAM</strong> (Dual RTX A6000 Ada), 
                sistem dapat menjalankan <strong>Llama-3-8B (6.5 GB)</strong>, <strong>Qwen-2.5-32B (22 GB)</strong>, 
                dan <strong>Embedding bge-m3 (2.5 GB)</strong> secara simultan dengan sisa lebih dari 65 GB VRAM untuk 
                antrean komputasi multi-user hingga 150 request bersamaan tanpa degradasi performa.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RENCANA ANGGARAN BIAYA (RAB) */}
      {activeTab === "rab" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" />
                Rincian Anggaran Biaya (RAB) Pengadaan Hardware TA 2026
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                Total: {formatRupiah(totalRAB)}
              </span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#27272a] text-slate-500 dark:text-slate-400">
                    <th className="pb-3 w-8">No</th>
                    <th className="pb-3">Kategori Komponen</th>
                    <th className="pb-3">Uraian Spesifikasi Teknis</th>
                    <th className="pb-3 text-center">Vol</th>
                    <th className="pb-3 text-right">Harga Satuan (Rp)</th>
                    <th className="pb-3 text-right">Subtotal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                  {rabItems.map((item) => (
                    <tr key={item.no} className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors">
                      <td className="py-3 font-semibold text-slate-400">{item.no}</td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{item.kategori}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 max-w-md">{item.item}</td>
                      <td className="py-3 text-center font-semibold">{item.vol}</td>
                      <td className="py-3 text-right font-mono text-slate-600 dark:text-slate-400">{formatRupiah(item.harga)}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatRupiah(item.harga)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-[#18181b] font-bold text-sm">
                    <td colSpan={5} className="py-4 text-right pr-4 text-slate-900 dark:text-white">
                      TOTAL ESTIMASI ANGGARAN (TERMASUK PPN 11% & GARANSI 3 TAHUN ON-SITE):
                    </td>
                    <td className="py-4 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                      {formatRupiah(totalRAB)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/50">
              <div className="text-xs text-slate-500">
                * Estimasi harga pasar Q3/Q4 2026 bergaransi resmi distributor enterprise Indonesia (3 Tahun 24/7 4-Hour Response SLA).
              </div>
              <div className="flex gap-2">
                <a
                  href="/DOKUMEN_PERENCANAAN_PENGADAAN_HARDWARE_INFOPERS_SSDM_2026.md"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  Buka Dokumen Lengkap
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
