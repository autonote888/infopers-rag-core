"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  HardDrive,
  Activity,
  Layers,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Server,
  Zap,
  Info,
  Gauge,
  HelpCircle,
  TrendingUp,
  Database,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface MemorySnapshot {
  id: string;
  timestamp: string;
  totalRamGB: number;
  usedRamGB: number;
  freeRamGB: number;
  percentUsed: number;
  gpuName: string;
  vramMB: number;
  postgresMB: number;
  frontendMB: number;
  backendMB: number;
  note: string;
}

export default function RecordMemoryView() {
  const [activeTab, setActiveTab] = useState<"monitor" | "istilah">("monitor");
  const [loading, setLoading] = useState(false);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<MemorySnapshot[]>([]);
  const [customNote, setCustomNote] = useState("");

  // Ambil data live hardware dari backend
  const loadDeviceResources = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/system/device-resources");
      if (res.ok) {
        const json = await res.json();
        setDeviceData(json.data);
      }
    } catch (e) {
      console.error("Gagal mengambil data resource device:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeviceResources();
    try {
      const saved = localStorage.getItem("infopers_memory_snapshots");
      if (saved) {
        setSnapshots(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Simpan record snapshot memory
  const handleRecordSnapshot = () => {
    if (!deviceData) return;

    const pgProc = deviceData.processes?.find((p: any) => p.name === "postgres")?.ram_mb || 0;
    const nodeProc = deviceData.processes?.find((p: any) => p.name === "node")?.ram_mb || 0;
    const bkProc = deviceData.processes?.find((p: any) => p.name === "backend")?.ram_mb || 0;

    const newSnapshot: MemorySnapshot = {
      id: "snap_" + Date.now(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      totalRamGB: deviceData.ram?.total_gb || 15.71,
      usedRamGB: deviceData.ram?.used_gb || 0,
      freeRamGB: deviceData.ram?.free_gb || 0,
      percentUsed: deviceData.ram?.percent_used || 0,
      gpuName: deviceData.gpu?.name || "Integrated GPU",
      vramMB: deviceData.gpu?.vram_mb || 1024,
      postgresMB: pgProc,
      frontendMB: nodeProc,
      backendMB: bkProc,
      note: customNote.trim() || `Pengukuran #${snapshots.length + 1}`,
    };

    const updated = [newSnapshot, ...snapshots];
    setSnapshots(updated);
    setCustomNote("");
    try {
      localStorage.setItem("infopers_memory_snapshots", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearSnapshots = () => {
    if (confirm("Hapus seluruh catatan riwayat record memory?")) {
      setSnapshots([]);
      localStorage.removeItem("infopers_memory_snapshots");
    }
  };

  const handleExportSnapshots = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshots, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `record_memory_device_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Activity size={13} className="text-emerald-400 animate-pulse" />
              PEMANTAUAN REAL-TIME DEVICE LAPTOP / WORKSTATION
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Record Memory &amp; Kapasitas RAM / NVRAM Device
            </h1>
            <p className="text-blue-200/90 text-sm mt-2 max-w-3xl leading-relaxed">
              Catat penggunaan memori riil saat ini (PostgreSQL 483K records, Backend Go, Frontend Next.js, dan GPU VRAM) 
              serta pelajari glosarium ukuran model (2B-70B) dan metrik kecepatan inferensi AI.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadDeviceResources}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Segarkan Data
            </button>
            <a
              href="/MENENTUKAN_KAPASITAS_KEBUTUHAN_SAAT_INI.md"
              target="_blank"
              download
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Download size={15} />
              Unduh Naskah (.md)
            </a>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <div className="text-xs text-slate-400">Total RAM Fisik</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {deviceData?.ram?.total_gb || "15.71"} GB
            </div>
            <div className="text-[11px] text-slate-400">Kapasitas Motherboard</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">RAM Terpakai Saat Ini</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {deviceData?.ram?.used_gb || "12.09"} GB
            </div>
            <div className="text-[11px] text-amber-300">
              {deviceData?.ram?.percent_used || "77.0"}% Terpakai
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">RAM Bebas (Available)</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {deviceData?.ram?.free_gb || "3.62"} GB
            </div>
            <div className="text-[11px] text-emerald-300">Sisa Memori Bebas</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">GPU VRAM / NVRAM</div>
            <div className="text-2xl font-black text-blue-300 mt-0.5">
              {deviceData?.gpu?.vram_gb || "1.0"} GB
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {deviceData?.gpu?.name || "Intel(R) UHD Graphics"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab */}
      <div className="flex border-b border-slate-200 dark:border-[#27272a] gap-2">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "monitor"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Activity size={15} />
          Pemantauan &amp; Record Memory
        </button>
        <button
          onClick={() => setActiveTab("istilah")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "istilah"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen size={15} />
          Penjelasan Istilah Ukuran (2B-70B) &amp; Kecepatan AI
        </button>
      </div>

      {/* TAB 1: PEMANTAUAN & RECORD MEMORY */}
      {activeTab === "monitor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom 1 & 2: Rincian Penggunaan Memori Stack Proyek */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  Rincian Memori per Modul / Komponen Proyek
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Total Proyek: {deviceData?.project_total_ram_mb || "1.249,8"} MB (~1.25 GB)
                </span>
              </h2>

              {/* Visual RAM Usage Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Distribusi RAM Fisik (15.71 GB)</span>
                  <span>{deviceData?.ram?.percent_used || 77}% Digunakan</span>
                </div>
                <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-[#262626] overflow-hidden flex shadow-inner">
                  <div style={{ width: "4.5%" }} className="bg-indigo-600 h-full transition-all" title="PostgreSQL: 544 MB (4.5%)" />
                  <div style={{ width: "5.5%" }} className="bg-emerald-500 h-full transition-all" title="Next.js: 692 MB (5.5%)" />
                  <div style={{ width: "0.2%" }} className="bg-blue-400 h-full transition-all" title="Backend Go: 12.2 MB (0.1%)" />
                  <div style={{ width: "66.8%" }} className="bg-amber-400 h-full transition-all" title="OS & Lainnya: 10.84 GB (66.8%)" />
                  <div style={{ width: "23.0%" }} className="bg-emerald-200 dark:bg-emerald-950/60 h-full transition-all" title="RAM Bebas: 3.62 GB (23.0%)" />
                </div>

                {/* Legend Bar */}
                <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> PostgreSQL (544 MB)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Next.js Frontend (692 MB)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Backend Go (12 MB)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> OS &amp; Software Lain (10.8 GB)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-300" /> RAM Bebas (3.6 GB)</span>
                </div>
              </div>

              {/* Tabel List Proses */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#27272a] text-slate-500">
                      <th className="pb-2.5">Nama Layanan</th>
                      <th className="pb-2.5">Kategori</th>
                      <th className="pb-2.5 text-right">Konsumsi RAM (MB)</th>
                      <th className="pb-2.5 text-right">% dari Total RAM</th>
                      <th className="pb-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                    {deviceData?.processes?.map((proc: any, i: number) => {
                      const pct = ((proc.ram_mb / ((deviceData?.ram?.total_gb || 15.71) * 1024)) * 100).toFixed(1);
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors">
                          <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{proc.display_name}</td>
                          <td className="py-2.5 text-slate-500">{proc.category}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            {proc.ram_mb.toLocaleString("id-ID")} MB
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-500">{pct}%</td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              Aktif &amp; Normal
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50/50 dark:bg-[#18181b]/50 font-bold">
                      <td className="py-3 text-slate-700 dark:text-slate-300">Sistem Operasi Windows &amp; Aplikasi Lain</td>
                      <td className="py-3 text-slate-500">System &amp; Apps</td>
                      <td className="py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                        {deviceData?.system_other_ram_mb?.toLocaleString("id-ID") || "10.840"} MB
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">66.8%</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 text-[10px]">
                          OS &amp; IDE
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluasi Kapasitas Device Saat Ini */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle size={18} />
                HASIL EVALUASI KAPASITAS DEVICE SAAT INI UNTUK AI (LLM)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {deviceData?.assessment?.summary ||
                  "RAM fisik bebas saat ini (3.62 GB) dan GPU Intel UHD Graphics (1024 MB VRAM) tidak mencukupi untuk menjalankan model LLM 8B lokal secara optimal."}
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-amber-200 dark:border-amber-950/60 text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Rekomendasi Kapasitas:</strong>{" "}
                {deviceData?.assessment?.recommendation ||
                  "Untuk inferensi Llama-3-8B lokal mandiri diperlukan minimal 8 GB RAM bebas atau dedicated GPU NVIDIA min. 8GB-12GB VRAM. Untuk operasional produksi, gunakan Server On-Premises Dual RTX A6000 96GB VRAM sesuai dokumen RAB."}
              </div>
            </div>
          </div>

          {/* Kolom 3: Fitur RECORD MEMORY SNAPSHOT */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Record Memory Snapshot
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                  {snapshots.length} Record
                </span>
              </h2>

              <p className="text-xs text-slate-500">
                Catat kondisi memori riil saat ini ke dalam riwayat log untuk menganalisis beban sebelum dan sesudah kueri berat.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Catatan (misal: Sebelum kueri 483K / Setelah buka Ollama)..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-50 dark:bg-[#18181b] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <button
                  onClick={handleRecordSnapshot}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Zap size={14} />
                  Rekam Snapshot Memory Sekarang
                </button>
              </div>

              {/* List Riwayat Snapshot */}
              <div className="space-y-2 max-h-72 overflow-y-auto pt-2 divide-y divide-slate-100 dark:divide-[#27272a]">
                {snapshots.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Belum ada snapshot yang direkam. Klik tombol di atas untuk merekam memori pertama Anda.
                  </div>
                ) : (
                  snapshots.map((s) => (
                    <div key={s.id} className="pt-2 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{s.note}</span>
                        <span className="text-[10px] font-mono text-slate-400">{s.timestamp}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Terpakai: {s.usedRamGB} GB ({s.percentUsed}%)</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Bebas: {s.freeRamGB} GB</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        PG: {s.postgresMB}MB | Node: {s.frontendMB}MB | Go: {s.backendMB}MB
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Tombol Aksi Riwayat */}
              {snapshots.length > 0 && (
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-[#27272a]">
                  <button
                    onClick={handleExportSnapshots}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-[#27272a] bg-slate-50 dark:bg-[#18181b] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    Ekspor Log (.json)
                  </button>
                  <button
                    onClick={handleClearSnapshots}
                    className="p-2 rounded-lg border border-red-200 dark:border-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Hapus Seluruh Riwayat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENJELASAN ISTILAH UKURAN (2B-70B) & KECEPATAN AI */}
      {activeTab === "istilah" && (
        <div className="space-y-6">
          {/* Bagian A: Arti Angka B pada Model AI */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                1. Arti Angka &quot;B&quot; pada Model AI (2B, 7B, 8B, 14B, 32B, 70B)
              </h2>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                B = Billion (Miliar) Parameter
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Huruf <strong>&quot;B&quot;</strong> singkatan dari <strong>Billion Parameters</strong> (Miliar Parameter).  
              Parameter adalah bobot matematis (<em>sinapsis digital</em>) di dalam jaringan syaraf tiruan AI yang menyimpan memori tata bahasa, 
              pengetahuan umum, dan aturan kedinasan. <strong>Semakin besar angka B</strong>, semakin tinggi kecerdasan nalar dan kemampuannya memecahkan kueri kompleks, 
              namun menuntut <strong>kapasitas VRAM GPU yang semakin besar</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* 1B - 3B */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">1B — 3B Parameter</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#27272a] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    VRAM: 1.5 - 3 GB
                  </span>
                </div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">Contoh: Llama-3.2-3B, Qwen-2.5-1.5B</div>
                <p className="text-xs text-slate-500">
                  <strong>Karakteristik:</strong> Ultra ringan, bisa jalan di CPU laptop biasa. Cocok untuk ekstraksi JSON dan rangkuman pendek. 
                  Kurang mampu melakukan penalaran multi-kondisi.
                </p>
              </div>

              {/* 7B - 8B */}
              <div className="p-4 rounded-xl border border-blue-300 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-[9px] font-black text-white uppercase rounded-bl-lg">
                  Sweet Spot SSDM
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-blue-950 dark:text-blue-200">7B — 8B Parameter</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-900/60 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    VRAM: 6 - 8 GB
                  </span>
                </div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">Contoh: Llama-3-8B, Qwen-2.5-7B</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Karakteristik:</strong> Standar industri terbaik! Keseimbangan sempurna antara kecepatan tinggi (&gt;45 tok/s), 
                  akurasi kueri database 483K personel, dan hemat daya.
                </p>
              </div>

              {/* 14B */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">14B Parameter</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#27272a] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    VRAM: 11 - 14 GB
                  </span>
                </div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">Contoh: Qwen-2.5-14B</div>
                <p className="text-xs text-slate-500">
                  <strong>Karakteristik:</strong> Penalaran menengah ke atas. Logika kueri bersarang (*nested query*) dan pencocokan syarat mutasi lebih tajam daripada 8B. Butuh GPU 16GB+.
                </p>
              </div>

              {/* 32B */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">32B Parameter</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#27272a] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    VRAM: 20 - 24 GB
                  </span>
                </div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">Contoh: Qwen-2.5-32B</div>
                <p className="text-xs text-slate-500">
                  <strong>Karakteristik:</strong> Penalaran tinggi. Sangat cakap merumuskan draft Perkap/Perpol baru, menganalisis dokumen puluhan halaman, dan sintesis data strategis.
                </p>
              </div>

              {/* 70B */}
              <div className="p-4 rounded-xl border border-purple-300 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-purple-950 dark:text-purple-200">70B Parameter</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-900/60 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    VRAM: 42 - 48 GB
                  </span>
                </div>
                <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400">Contoh: Llama-3-70B, Qwen-2.5-72B</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Karakteristik:</strong> Kelas Heavyweight Enterprise (setara GPT-4). Mampu menyelesaikan perumusan kebijakan nasional Mabes Polri. Wajib dijalankan di Dual RTX A6000 (96GB VRAM).
                </p>
              </div>
            </div>
          </div>

          {/* Bagian B: Istilah Kecepatan & Performa AI */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Gauge size={16} className="text-emerald-600" />
              2. Glosarium Metrik Kecepatan &amp; Performa Inferensi AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* TPS */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  TPS (Tokens Per Second)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Kecepatan model AI mengetik kata jawaban per detiknya (1 token ~0,75 kata).  
                  Di CPU laptop: &lt;5 tok/s (terasa lambat). Di GPU RTX A6000: <strong>&gt;45 tok/s</strong> (sangat instan).
                </p>
              </div>

              {/* TTFT */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  TTFT (Time To First Token)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Waktu tunggu dari tombol &quot;Kirim&quot; diklik sampai huruf/kata pertama muncul di layar. Standar responsivitas Presisi adalah <strong>&lt; 500 ms (setengah detik)</strong>.
                </p>
              </div>

              {/* Prefill Speed */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Prompt Prefill Speed (Membaca Dokumen)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Kecepatan GPU mencerna dokumen input panjang (misal draf SKep 20 halaman) sebelum mulai menjawab. GPU A6000 mampu membaca <strong>1.200+ token per detik</strong>.
                </p>
              </div>

              {/* Memory Bandwidth */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Memory Bandwidth (GB/s) — Kunci Kecepatan LLM
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Lebar pita transfer memori GPU. LLM dibatasi oleh kecepatan memori, bukan clock prosesor!  
                  RAM Laptop: ~30 GB/s. GPU RTX A6000 Ada: <strong>960 GB/s (32x lebih cepat)</strong>.
                </p>
              </div>

              {/* Kuantisasi */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Kuantisasi (Q4_K_M, INT4, FP16)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Teknik kompresi bobot model dari 16-bit menjadi 4-bit. Menghemat VRAM hingga <strong>70%</strong> dan menaikkan kecepatan inferensi hingga <strong>3x lipat</strong> dengan degradasi akurasi &lt;1%.
                </p>
              </div>

              {/* KV Cache */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  KV Cache (Key-Value Cache)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Penyimpanan konteks kalimat percakapan sebelumnya di dalam VRAM GPU agar model tidak perlu menghitung ulang riwayat obrolan dari awal di setiap pertanyaan baru.
                </p>
              </div>

              {/* Throughput */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Throughput &amp; Concurrency (Multi-User)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Kemampuan melayani banyak permintaan staf/perwira secara bersamaan tanpa degradasi waktu tunggu (target server: 150 request simultan).
                </p>
              </div>

              {/* GPU Offloading */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#18181b]/70 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  GPU Offloading (Pemisahan Lapisan GPU vs CPU)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Jika VRAM tidak cukup, sebagian lapisan dialihkan (*offload*) ke RAM CPU. Hal ini menyebabkan kemacetan transfer PCIe dan membuat inferensi melambat drastis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
