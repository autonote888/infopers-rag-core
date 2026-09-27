"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

interface DashboardViewProps {
  onOpenAI?: (q?: string) => void;
}

export default function DashboardView({ onOpenAI }: DashboardViewProps = {}) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setStats(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Angka Resmi Basis Data Personel SSDM Polri
  const totalPersonel = stats?.total_personel || 483355;
  const totalPolri = stats?.total_polri || 465971;
  const totalPNS = stats?.total_pns || 15718;
  const totalPPPK = stats?.total_pppk || 1666;

  // Persentase Masing-Masing Kategori (Presisi 2 Desimal)
  const pctPolri = ((totalPolri / totalPersonel) * 100).toFixed(2);
  const pctPNS = ((totalPNS / totalPersonel) * 100).toFixed(2);
  const pctPPPK = ((totalPPPK / totalPersonel) * 100).toFixed(2);

  // Data Kategori Monokrom (Hitam Putih Abu-abu)
  const dataKategori = [
    {
      id: "POLRI",
      nama: "Anggota POLRI",
      jumlah: totalPolri,
      persen: pctPolri,
      warnaBar: "bg-neutral-900 dark:bg-white",
      warnaDot: "bg-neutral-900 dark:bg-white",
      stroke: "#18181b", // Solid black / dark in light mode
      strokeDark: "#ffffff",
      badge: "Mayoritas",
    },
    {
      id: "PNS",
      nama: "PNS Polri",
      jumlah: totalPNS,
      persen: pctPNS,
      warnaBar: "bg-neutral-600 dark:bg-neutral-400",
      warnaDot: "bg-neutral-600 dark:bg-neutral-400",
      stroke: "#52525b", // Medium gray
      strokeDark: "#a1a1aa",
      badge: "ASN Tetap",
    },
    {
      id: "PPPK",
      nama: "PPPK Polri",
      jumlah: totalPPPK,
      persen: pctPPPK,
      warnaBar: "bg-neutral-400 dark:bg-neutral-600",
      warnaDot: "bg-neutral-400 dark:bg-neutral-600",
      stroke: "#a1a1aa", // Light gray
      strokeDark: "#71717a",
      badge: "ASN Kontrak",
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12 select-none animate-in fade-in duration-150">
      {/* 1. Header Tampilan Data Personel Hitam Putih Tanpa Ikon */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-neutral-300 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">
            Data Personel
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Analisis persentase jumlah total personel, anggota Polri, PNS, dan PPPK.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Segarkan Data"
        >
          {loading ? "Memuat..." : "Segarkan"}
        </button>
      </div>

      {/* 2. Empat Kartu KPI Hitam Putih (Tanpa Ikon) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KARTU 1: TOTAL PERSONEL */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
            Total Personel
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {totalPersonel.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Proporsi</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">100.00%</span>
          </div>
        </div>

        {/* KARTU 2: POLRI */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
            Anggota POLRI
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {totalPolri.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Persentase</span>
            <span className="font-mono font-bold text-neutral-950 dark:text-white">{pctPolri}%</span>
          </div>
        </div>

        {/* KARTU 3: PNS */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
            PNS Polri
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {totalPNS.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Persentase</span>
            <span className="font-mono font-bold text-neutral-950 dark:text-white">{pctPNS}%</span>
          </div>
        </div>

        {/* KARTU 4: PPPK */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
            PPPK Polri
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {totalPPPK.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Persentase</span>
            <span className="font-mono font-bold text-neutral-950 dark:text-white">{pctPPPK}%</span>
          </div>
        </div>
      </div>

      {/* 3. Analisa Grafik Persentase Monokrom (Hitam Putih, Tanpa Ikon) */}
      <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-300 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white uppercase tracking-tight">
              Analisa Grafik Persentase Personel
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Grafik perbandingan persentase anggota Polri, PNS, dan PPPK
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            Total 483.355 Personel
          </span>
        </div>

        {/* Grid Donut dan Rincian Persentase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart Hitam Putih (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring Monokrom */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="13"
                  className="text-neutral-200 dark:text-neutral-800"
                />
                {/* Polri Segment: 96.40% -> 242.27 */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="13"
                  strokeDasharray="242.27 251.32"
                  strokeDashoffset="0"
                  className="text-neutral-950 dark:text-white transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory("POLRI")}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
                {/* PNS Segment: 3.25% -> 8.16 */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="13"
                  strokeDasharray="8.16 251.32"
                  strokeDashoffset="-242.27"
                  className="text-neutral-500 dark:text-neutral-400 transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory("PNS")}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
                {/* PPPK Segment: 0.35% -> 1.2 */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="13"
                  strokeDasharray="1.2 251.32"
                  strokeDashoffset="-250.43"
                  className="text-neutral-400 dark:text-neutral-600 transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory("PPPK")}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              </svg>

              {/* Teks di Tengah Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {hoveredCategory || "TOTAL"}
                </span>
                <span className="text-xl font-black font-mono text-neutral-950 dark:text-white leading-tight mt-0.5">
                  {hoveredCategory === "POLRI"
                    ? `${pctPolri}%`
                    : hoveredCategory === "PNS"
                    ? `${pctPNS}%`
                    : hoveredCategory === "PPPK"
                    ? `${pctPPPK}%`
                    : "100.00%"}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                  {hoveredCategory === "POLRI"
                    ? `${totalPolri.toLocaleString("id-ID")} org`
                    : hoveredCategory === "PNS"
                    ? `${totalPNS.toLocaleString("id-ID")} org`
                    : hoveredCategory === "PPPK"
                    ? `${totalPPPK.toLocaleString("id-ID")} org`
                    : "483.355 Personel"}
                </span>
              </div>
            </div>
          </div>

          {/* List Rincian Hitam Putih (Tanpa Ikon) (7 Kolom) */}
          <div className="lg:col-span-7 space-y-3.5">
            {dataKategori.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  hoveredCategory === item.id
                    ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40"
                }`}
                onMouseEnter={() => setHoveredCategory(item.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${item.warnaDot}`} />
                    <div>
                      <div className="text-sm font-bold text-neutral-950 dark:text-white">
                        {item.nama}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        {item.jumlah.toLocaleString("id-ID")} orang
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black font-mono text-neutral-950 dark:text-white">
                      {item.persen}%
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Horizontal Bar Persentase Monokrom */}
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.warnaBar}`}
                    style={{ width: `${item.persen}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bilah Proporsi Keseluruhan Monokrom */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-bold uppercase tracking-wider">
              Bilah Proporsi Keseluruhan Personel
            </span>
            <span className="font-mono">Polri {pctPolri}% | PNS {pctPNS}% | PPPK {pctPPPK}%</span>
          </div>

          <div className="w-full h-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${pctPolri}%` }}
              className="bg-neutral-950 dark:bg-white transition-all h-full"
              title={`Polri: ${pctPolri}%`}
            />
            <div
              style={{ width: `${pctPNS}%` }}
              className="bg-neutral-500 dark:bg-neutral-400 transition-all h-full"
              title={`PNS: ${pctPNS}%`}
            />
            <div
              style={{ width: `${pctPPPK}%` }}
              className="bg-neutral-400 dark:bg-neutral-600 transition-all h-full"
              title={`PPPK: ${pctPPPK}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
