"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "@/lib/api";

export interface PoldaItem {
  polda: string;
  jumlah_satker: number;
  total_personel: number;
  jumlah_polri: number;
  jumlah_pns: number;
  jumlah_pppk: number;
}

export interface SatkerItem {
  polda: string;
  satker: string;
  total_personel: number;
  jumlah_polri: number;
  jumlah_pns: number;
  jumlah_pppk: number;
}

interface PoldaSatkerViewProps {
  defaultTab?: "polda" | "satker";
}

// 38 Data Polda Terurut Secara Abjad (A - Z) dari Basis Data PostgreSQL pgAdmin
const INITIAL_POLDA_LIST: PoldaItem[] = [
  { polda: "BIDKEU I MABES POLRI", jumlah_satker: 25, total_personel: 11611, jumlah_polri: 9535, jumlah_pns: 1993, jumlah_pppk: 83 },
  { polda: "BIDKEU II MABES POLRI", jumlah_satker: 44, total_personel: 24875, jumlah_polri: 23559, jumlah_pns: 1219, jumlah_pppk: 97 },
  { polda: "POLDA ACEH", jumlah_satker: 48, total_personel: 16050, jumlah_polri: 15788, jumlah_pns: 248, jumlah_pppk: 14 },
  { polda: "POLDA BALI", jumlah_satker: 37, total_personel: 11690, jumlah_polri: 11209, jumlah_pns: 424, jumlah_pppk: 57 },
  { polda: "POLDA BANGKA BELITUNG", jumlah_satker: 32, total_personel: 6154, jumlah_polri: 5974, jumlah_pns: 154, jumlah_pppk: 26 },
  { polda: "POLDA BANTEN", jumlah_satker: 31, total_personel: 8222, jumlah_polri: 8016, jumlah_pns: 181, jumlah_pppk: 25 },
  { polda: "POLDA BENGKULU", jumlah_satker: 35, total_personel: 7117, jumlah_polri: 6899, jumlah_pns: 207, jumlah_pppk: 11 },
  { polda: "POLDA DAERAH ISTIMEWA YOGYAKARTA", jumlah_satker: 30, total_personel: 10835, jumlah_polri: 10338, jumlah_pns: 488, jumlah_pppk: 9 },
  { polda: "POLDA GORONTALO", jumlah_satker: 31, total_personel: 5328, jumlah_polri: 5188, jumlah_pns: 109, jumlah_pppk: 31 },
  { polda: "POLDA JAMBI", jumlah_satker: 35, total_personel: 8869, jumlah_polri: 8462, jumlah_pns: 360, jumlah_pppk: 47 },
  { polda: "POLDA JAWA BARAT", jumlah_satker: 53, total_personel: 30534, jumlah_polri: 29447, jumlah_pns: 987, jumlah_pppk: 100 },
  { polda: "POLDA JAWA TENGAH", jumlah_satker: 63, total_personel: 35004, jumlah_polri: 33722, jumlah_pns: 1193, jumlah_pppk: 89 },
  { polda: "POLDA JAWA TIMUR", jumlah_satker: 73, total_personel: 40355, jumlah_polri: 38046, jumlah_pns: 2093, jumlah_pppk: 216 },
  { polda: "POLDA KALIMANTAN BARAT", jumlah_satker: 41, total_personel: 11563, jumlah_polri: 11251, jumlah_pns: 298, jumlah_pppk: 14 },
  { polda: "POLDA KALIMANTAN SELATAN", jumlah_satker: 39, total_personel: 10096, jumlah_polri: 9737, jumlah_pns: 319, jumlah_pppk: 40 },
  { polda: "POLDA KALIMANTAN TENGAH", jumlah_satker: 39, total_personel: 8832, jumlah_polri: 8604, jumlah_pns: 213, jumlah_pppk: 15 },
  { polda: "POLDA KALIMANTAN TIMUR", jumlah_satker: 35, total_personel: 10737, jumlah_polri: 10533, jumlah_pns: 195, jumlah_pppk: 9 },
  { polda: "POLDA KALIMANTAN UTARA", jumlah_satker: 30, total_personel: 4578, jumlah_polri: 4497, jumlah_pns: 79, jumlah_pppk: 2 },
  { polda: "POLDA KEPULAUAN RIAU", jumlah_satker: 32, total_personel: 6435, jumlah_polri: 6226, jumlah_pns: 168, jumlah_pppk: 41 },
  { polda: "POLDA LAMPUNG", jumlah_satker: 40, total_personel: 12253, jumlah_polri: 11719, jumlah_pns: 475, jumlah_pppk: 59 },
  { polda: "POLDA MALUKU", jumlah_satker: 35, total_personel: 8565, jumlah_polri: 8382, jumlah_pns: 141, jumlah_pppk: 42 },
  { polda: "POLDA MALUKU UTARA", jumlah_satker: 35, total_personel: 7215, jumlah_polri: 7120, jumlah_pns: 95, jumlah_pppk: 0 },
  { polda: "POLDA METRO JAYA", jumlah_satker: 39, total_personel: 29064, jumlah_polri: 28418, jumlah_pns: 589, jumlah_pppk: 57 },
  { polda: "POLDA NUSA TENGGARA BARAT", jumlah_satker: 36, total_personel: 10437, jumlah_polri: 10054, jumlah_pns: 294, jumlah_pppk: 89 },
  { polda: "POLDA NUSA TENGGARA TIMUR", jumlah_satker: 47, total_personel: 11580, jumlah_polri: 11355, jumlah_pns: 218, jumlah_pppk: 7 },
  { polda: "POLDA PAPUA", jumlah_satker: 48, total_personel: 12780, jumlah_polri: 12624, jumlah_pns: 152, jumlah_pppk: 4 },
  { polda: "POLDA PAPUA BARAT", jumlah_satker: 32, total_personel: 5740, jumlah_polri: 5720, jumlah_pns: 20, jumlah_pppk: 0 },
  { polda: "POLDA PAPUA BARAT DAYA", jumlah_satker: 25, total_personel: 3507, jumlah_polri: 3506, jumlah_pns: 1, jumlah_pppk: 0 },
  { polda: "POLDA PAPUA TENGAH", jumlah_satker: 26, total_personel: 3896, jumlah_polri: 3891, jumlah_pns: 5, jumlah_pppk: 0 },
  { polda: "POLDA RIAU", jumlah_satker: 38, total_personel: 11383, jumlah_polri: 10986, jumlah_pns: 304, jumlah_pppk: 93 },
  { polda: "POLDA SULAWESI BARAT", jumlah_satker: 31, total_personel: 4712, jumlah_polri: 4678, jumlah_pns: 32, jumlah_pppk: 2 },
  { polda: "POLDA SULAWESI SELATAN", jumlah_satker: 52, total_personel: 19027, jumlah_polri: 18509, jumlah_pns: 449, jumlah_pppk: 69 },
  { polda: "POLDA SULAWESI TENGAH", jumlah_satker: 38, total_personel: 9390, jumlah_polri: 9208, jumlah_pns: 155, jumlah_pppk: 27 },
  { polda: "POLDA SULAWESI TENGGARA", jumlah_satker: 39, total_personel: 8722, jumlah_polri: 8488, jumlah_pns: 210, jumlah_pppk: 24 },
  { polda: "POLDA SULAWESI UTARA", jumlah_satker: 42, total_personel: 9161, jumlah_polri: 8943, jumlah_pns: 194, jumlah_pppk: 24 },
  { polda: "POLDA SUMATERA BARAT", jumlah_satker: 44, total_personel: 11368, jumlah_polri: 11045, jumlah_pns: 298, jumlah_pppk: 25 },
  { polda: "POLDA SUMATERA SELATAN", jumlah_satker: 44, total_personel: 15708, jumlah_polri: 15196, jumlah_pns: 439, jumlah_pppk: 73 },
  { polda: "POLDA SUMATERA UTARA", jumlah_satker: 58, total_personel: 19962, jumlah_polri: 19098, jumlah_pns: 719, jumlah_pppk: 145 },
];

export default function PoldaSatkerView({ defaultTab = "polda" }: PoldaSatkerViewProps) {
  // Tab: "polda" (Data Polda) atau "satker" (Data Satker)
  const [activeTab, setActiveTab] = useState<"polda" | "satker">(defaultTab);

  // State Polda
  const [listPolda, setListPolda] = useState<PoldaItem[]>(INITIAL_POLDA_LIST);
  const [loadingPolda, setLoadingPolda] = useState(false);
  const [searchPolda, setSearchPolda] = useState("");

  // State Satker
  const [listSatker, setListSatker] = useState<SatkerItem[]>([]);
  const [loadingSatker, setLoadingSatker] = useState(false);
  const [selectedPoldaFilter, setSelectedPoldaFilter] = useState<string>("ALL");
  const [searchSatker, setSearchSatker] = useState("");
  const [satkerPage, setSatkerPage] = useState(1);
  const itemsPerPage = 50;

  // Sinkronisasi defaultTab bila berganti menu
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Ambil Ringkasan Polda dari PostgreSQL (pgAdmin)
  const loadPoldaSummary = async () => {
    setLoadingPolda(true);
    try {
      const res = await fetchWithAuth("/polda/summary");
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.list_polda && json.data.list_polda.length > 0) {
          const validPolda = json.data.list_polda.filter(
            (p: PoldaItem) => p.polda !== "MABES POLRI"
          );
          setListPolda(validPolda);
        }
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data polda dari PostgreSQL:", e);
    } finally {
      setLoadingPolda(false);
    }
  };

  // Ambil Data Satker dari PostgreSQL (pgAdmin)
  const loadSatkerList = async (poldaTarget: string = "ALL") => {
    setLoadingSatker(true);
    setSatkerPage(1);
    try {
      const url =
        poldaTarget === "ALL"
          ? "/polda/satker?polda=ALL"
          : `/polda/satker?polda=${encodeURIComponent(poldaTarget)}`;
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.list_satker) {
          setListSatker(json.data.list_satker);
        }
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data satker dari PostgreSQL:", e);
    } finally {
      setLoadingSatker(false);
    }
  };

  // Muat data awal
  useEffect(() => {
    loadPoldaSummary();
    loadSatkerList(selectedPoldaFilter);
  }, []);

  // Filter & Urut Abjad (A - Z) untuk Data Polda
  const filteredPolda = useMemo(() => {
    return listPolda
      .filter((p) =>
        p.polda.toLowerCase().includes(searchPolda.toLowerCase().trim())
      )
      .sort((a, b) => a.polda.localeCompare(b.polda, "id"));
  }, [listPolda, searchPolda]);

  // Total Jumlah Keseluruhan untuk Data Polda
  const poldaTotals = useMemo(() => {
    return filteredPolda.reduce(
      (acc, curr) => ({
        satker: acc.satker + curr.jumlah_satker,
        polri: acc.polri + curr.jumlah_polri,
        pns: acc.pns + curr.jumlah_pns,
        pppk: acc.pppk + curr.jumlah_pppk,
        total: acc.total + curr.total_personel,
      }),
      { satker: 0, polri: 0, pns: 0, pppk: 0, total: 0 }
    );
  }, [filteredPolda]);

  // Filter & Urut Abjad (A - Z) untuk Data Satker
  const filteredSatker = useMemo(() => {
    return listSatker
      .filter((s) => {
        const matchPolda =
          selectedPoldaFilter === "ALL" ||
          s.polda.toLowerCase() === selectedPoldaFilter.toLowerCase();
        const matchSearch =
          searchSatker.trim() === "" ||
          s.satker.toLowerCase().includes(searchSatker.toLowerCase().trim()) ||
          s.polda.toLowerCase().includes(searchSatker.toLowerCase().trim());
        return matchPolda && matchSearch;
      })
      .sort((a, b) => {
        const cmpPolda = a.polda.localeCompare(b.polda, "id");
        if (cmpPolda !== 0 && selectedPoldaFilter === "ALL") return cmpPolda;
        return a.satker.localeCompare(b.satker, "id");
      });
  }, [listSatker, selectedPoldaFilter, searchSatker]);

  // Total Jumlah Keseluruhan untuk Data Satker
  const satkerTotals = useMemo(() => {
    return filteredSatker.reduce(
      (acc, curr) => ({
        polri: acc.polri + curr.jumlah_polri,
        pns: acc.pns + curr.jumlah_pns,
        pppk: acc.pppk + curr.jumlah_pppk,
        total: acc.total + curr.total_personel,
      }),
      { polri: 0, pns: 0, pppk: 0, total: 0 }
    );
  }, [filteredSatker]);

  // Pagination Satker
  const totalSatkerPages = Math.max(1, Math.ceil(filteredSatker.length / itemsPerPage));
  const paginatedSatker = useMemo(() => {
    const start = (satkerPage - 1) * itemsPerPage;
    return filteredSatker.slice(start, start + itemsPerPage);
  }, [filteredSatker, satkerPage, itemsPerPage]);

  // Total Agregat Nasional
  const totalSatkerNasional = useMemo(
    () => listPolda.reduce((acc, curr) => acc + curr.jumlah_satker, 0),
    [listPolda]
  );
  const totalPersonelNasional = useMemo(
    () => listPolda.reduce((acc, curr) => acc + curr.total_personel, 0),
    [listPolda]
  );

  // Fungsi navigasi langsung ke satker tertentu
  const handlePilihPoldaUntukSatker = (namaPolda: string) => {
    setSelectedPoldaFilter(namaPolda);
    setActiveTab("satker");
    loadSatkerList(namaPolda);
  };

  return (
    <div className="w-full space-y-6 pb-16 select-none animate-in fade-in duration-150">
      {/* 1. Header Hitam Putih Tanpa Ikon */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">
              {activeTab === "polda" ? "Data Polda" : "Data Satker"}
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              Urut Abjad (A - Z)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {activeTab === "polda"
              ? "Daftar 38 Polda & Mabes terurut abjad dengan jumlah satuan kerja dan baris total di bagian bawah tabel."
              : "Daftar 1.502 Satuan Kerja terurut abjad per Polda dengan rincian personel dan baris total di bagian bawah tabel."}
          </p>
        </div>

        <button
          onClick={() => {
            loadPoldaSummary();
            loadSatkerList(selectedPoldaFilter);
          }}
          disabled={loadingPolda || loadingSatker}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          title="Segarkan Data dari PostgreSQL"
        >
          {loadingPolda || loadingSatker ? "Menyinkronkan..." : "Segarkan Data"}
        </button>
      </div>

      {/* 2. Tombol Navigasi Sub-Tab Hitam Putih */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("polda")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            activeTab === "polda"
              ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          DATA POLDA ({listPolda.length} Wilayah)
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("satker");
            if (listSatker.length === 0) loadSatkerList(selectedPoldaFilter);
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            activeTab === "satker"
              ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          DATA SATKER ({totalSatkerNasional.toLocaleString("id-ID")} Satker)
        </button>
      </div>

      {/* 3. Kartu Ringkasan Statistik Monokrom */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
            Total Kesatuan / Polda
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {listPolda.length} <span className="text-sm font-sans font-bold text-neutral-500">Polda & Mabes</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            34 Polda Wilayah + Mabes Polri (Abjad A - Z)
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
            Total Satuan Kerja (Satker)
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {totalSatkerNasional.toLocaleString("id-ID")}{" "}
            <span className="text-sm font-sans font-bold text-neutral-500">Satker</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            Satker Mabes, Polda, Polres, dan Polresta
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
            Total Personel Terdata
          </span>
          <div className="text-3xl font-black text-neutral-950 dark:text-white font-mono tracking-tight">
            {totalPersonelNasional.toLocaleString("id-ID")}{" "}
            <span className="text-sm font-sans font-bold text-neutral-500">Orang</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            PostgreSQL: public.data_polri_september_2026
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. KONTEN TAB 1: DATA POLDA (URUT ABJAD + JUMLAH TOTAL DI BAWAH) */}
      {/* ==================================================================== */}
      {activeTab === "polda" && (
        <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-300 dark:border-neutral-800 p-6 shadow-xs space-y-4 animate-in fade-in duration-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-neutral-950 dark:text-white uppercase tracking-tight">
                  Tabel Polda & Jumlah Satker Masing-Masing
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  A - Z
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Daftar terurut secara abjad dari A sampai Z. Baris jumlah total keseluruhan tertera di bagian paling bawah tabel.
              </p>
            </div>

            {/* Kotak Pencarian Polda */}
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchPolda}
                onChange={(e) => setSearchPolda(e.target.value)}
                placeholder="Cari nama Polda..."
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tabel Polda */}
          {filteredPolda.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Tidak ada Polda yang cocok dengan pencarian "{searchPolda}".
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-300 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black uppercase tracking-wider border-b border-neutral-300 dark:border-neutral-700">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Nama Kesatuan / Polda (Abjad A-Z)</th>
                    <th className="py-3.5 px-4 text-center">Jumlah Satker</th>
                    <th className="py-3.5 px-4 text-right">Polri</th>
                    <th className="py-3.5 px-4 text-right">PNS</th>
                    <th className="py-3.5 px-4 text-right">PPPK</th>
                    <th className="py-3.5 px-4 text-right font-black">Total Personel</th>
                    <th className="py-3.5 px-4 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredPolda.map((item, idx) => (
                    <tr
                      key={item.polda}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 transition-colors font-medium"
                    >
                      <td className="py-3 px-4 text-center font-mono text-neutral-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-neutral-950 dark:text-white uppercase">
                        {item.polda}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold px-2.5 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs">
                          {item.jumlah_satker} Satker
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300">
                        {item.jumlah_polri.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300">
                        {item.jumlah_pns.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300">
                        {item.jumlah_pppk.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-neutral-950 dark:text-white">
                        {item.total_personel.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handlePilihPoldaUntukSatker(item.polda)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-85 transition-opacity cursor-pointer shadow-2xs"
                        >
                          Lihat Satker →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* BARIS JUMLAH TOTAL DI BAWAH TABEL POLDA */}
                <tfoot className="bg-neutral-200 dark:bg-neutral-800/90 text-neutral-950 dark:text-white font-black border-t-2 border-neutral-950 dark:border-white">
                  <tr>
                    <td colSpan={2} className="py-4 px-4 uppercase tracking-wider text-xs font-black">
                      JUMLAH TOTAL KESELURUHAN ({filteredPolda.length} POLDA)
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-xs font-black">
                      <span className="px-3 py-1 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-black">
                        {poldaTotals.satker.toLocaleString("id-ID")} Satker
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs font-black">
                      {poldaTotals.polri.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs font-black">
                      {poldaTotals.pns.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs font-black">
                      {poldaTotals.pppk.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-sm font-black text-neutral-950 dark:text-white underline decoration-2">
                      {poldaTotals.total.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-neutral-500 font-bold">
                      -
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. KONTEN TAB 2: DATA SATKER (URUT ABJAD + JUMLAH TOTAL DI BAWAH) */}
      {/* ==================================================================== */}
      {activeTab === "satker" && (
        <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-300 dark:border-neutral-800 p-6 shadow-xs space-y-4 animate-in fade-in duration-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-neutral-950 dark:text-white uppercase tracking-tight">
                  Tabel Rincian Data Satuan Kerja (Satker)
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  Abjad A - Z
                </span>
                {selectedPoldaFilter !== "ALL" && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                    {selectedPoldaFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Menampilkan {filteredSatker.length.toLocaleString("id-ID")} satuan kerja terurut abjad beserta baris jumlah total di bagian bawah tabel.
              </p>
            </div>

            {/* Filter & Kotak Pencarian Satker */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Dropdown Filter Polda */}
              <select
                value={selectedPoldaFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPoldaFilter(val);
                  loadSatkerList(val);
                }}
                className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">SEMUA POLDA ({totalSatkerNasional} Satker)</option>
                {listPolda.map((p) => (
                  <option key={p.polda} value={p.polda}>
                    {p.polda} ({p.jumlah_satker} Satker)
                  </option>
                ))}
              </select>

              {/* Input Pencarian Satker */}
              <input
                type="text"
                value={searchSatker}
                onChange={(e) => {
                  setSearchSatker(e.target.value);
                  setSatkerPage(1);
                }}
                placeholder="Cari nama satker / polres..."
                className="w-full sm:w-64 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
              />

              {selectedPoldaFilter !== "ALL" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPoldaFilter("ALL");
                    loadSatkerList("ALL");
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 transition-colors cursor-pointer shrink-0"
                  title="Tampilkan Semua Polda"
                >
                  Semua Polda ✕
                </button>
              )}
            </div>
          </div>

          {/* Tabel Satker */}
          {loadingSatker ? (
            <div className="py-12 text-center text-xs font-bold text-neutral-500">
              Mengambil data satuan kerja dari PostgreSQL...
            </div>
          ) : paginatedSatker.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Tidak ada satuan kerja yang sesuai filter.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-neutral-300 dark:border-neutral-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-black uppercase tracking-wider border-b border-neutral-300 dark:border-neutral-700">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">No</th>
                      <th className="py-3.5 px-4">Asal Kesatuan / Polda</th>
                      <th className="py-3.5 px-4">Nama Satuan Kerja (Satker - Abjad A-Z)</th>
                      <th className="py-3.5 px-4 text-right">Polri</th>
                      <th className="py-3.5 px-4 text-right">PNS</th>
                      <th className="py-3.5 px-4 text-right">PPPK</th>
                      <th className="py-3.5 px-4 text-right font-black">Total Personel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {paginatedSatker.map((s, idx) => {
                      const absoluteIndex = (satkerPage - 1) * itemsPerPage + idx + 1;
                      return (
                        <tr
                          key={`${s.polda}-${s.satker}-${idx}`}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 font-medium transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-mono text-neutral-400">
                            {absoluteIndex}
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                            {s.polda}
                          </td>
                          <td className="py-3 px-4 font-black text-neutral-950 dark:text-white uppercase">
                            {s.satker}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300">
                            {s.jumlah_polri.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300">
                            {s.jumlah_pns.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300">
                            {s.jumlah_pppk.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-neutral-950 dark:text-white">
                            {s.total_personel.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* BARIS JUMLAH TOTAL DI BAWAH TABEL SATKER */}
                  <tfoot className="bg-neutral-200 dark:bg-neutral-800/90 text-neutral-950 dark:text-white font-black border-t-2 border-neutral-950 dark:border-white">
                    <tr>
                      <td colSpan={3} className="py-4 px-4 uppercase tracking-wider text-xs font-black">
                        JUMLAH TOTAL KESELURUHAN ({filteredSatker.length.toLocaleString("id-ID")} SATKER)
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-black">
                        {satkerTotals.polri.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-black">
                        {satkerTotals.pns.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-black">
                        {satkerTotals.pppk.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-sm font-black text-neutral-950 dark:text-white underline decoration-2">
                        {satkerTotals.total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Baris Navigasi Halaman Satker */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-neutral-500 font-medium">
                  Menampilkan{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {(satkerPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {Math.min(satkerPage * itemsPerPage, filteredSatker.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {filteredSatker.length.toLocaleString("id-ID")}
                  </span>{" "}
                  Satker
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={satkerPage <= 1}
                    onClick={() => setSatkerPage((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    ← Sebelumnya
                  </button>

                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                    Halaman {satkerPage} / {totalSatkerPages}
                  </span>

                  <button
                    type="button"
                    disabled={satkerPage >= totalSatkerPages}
                    onClick={() => setSatkerPage((prev) => Math.min(totalSatkerPages, prev + 1))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
