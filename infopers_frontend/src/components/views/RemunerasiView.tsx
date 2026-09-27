"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function RemunerasiView({ initialTab = "audit_chain" }: { initialTab?: "audit_chain" | "simulasi_budget" | "hak_jf" }) {
  const [activeTab, setActiveTab] = useState<"audit_chain" | "simulasi_budget" | "hak_jf">(initialTab);
  const [chainData, setChainData] = useState<any[]>([]);
  const [simulasiData, setSimulasiData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetchWithAuth("/audit/hash-chain").then((r) => r.json()),
      fetchWithAuth("/remunerasi/simulasi").then((r) => r.json()),
    ]).then(([audit, sim]) => {
      if (audit.data) setChainData(audit.data);
      if (sim.data) setSimulasiData(sim.data);
    });
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Penggajian &amp; Proyeksi Anggaran
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Buku catatan audit perubahan tunjangan kinerja, proyeksi belanja pegawai, dan hak jabatan fungsional.
          </p>
        </div>

        <div className="flex p-1 rounded-lg bg-slate-200/70 dark:bg-[#18181b] border border-slate-300/60 dark:border-[#27272a] text-xs">
          <button
            onClick={() => setActiveTab("audit_chain")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "audit_chain"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Buku Audit Pembayaran
          </button>
          <button
            onClick={() => setActiveTab("simulasi_budget")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "simulasi_budget"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Proyeksi Belanja Pegawai
          </button>
          <button
            onClick={() => setActiveTab("hak_jf")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "hak_jf"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Tunjangan Jabatan Fungsional
          </button>
        </div>
      </div>

      {activeTab === "audit_chain" && (
        <div className="space-y-3 w-full">
          <div className="p-3 bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-lg text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between font-medium">
            <span>Status Audit Sistem: <strong>Seluruh Berita Acara &amp; Riwayat Perubahan Sah Tervalidasi</strong></span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Terdaftar Resmi di Basis Data SSDM</span>
          </div>

          <div className="space-y-2.5 w-full">
            {chainData.map((b, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-4 shadow-2xs text-xs space-y-2 w-full"
              >
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>
                    No. Registrasi Audit #{b.block_id} • NRP Personel: <strong className="text-slate-900 dark:text-white font-bold">{b.nip_nrp}</strong>
                  </span>
                  <span>Waktu Pencatatan: {b.timestamp}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 bg-slate-50 dark:bg-[#18181b] rounded border border-slate-100 dark:border-[#27272a] break-all">
                    <span className="text-slate-400 font-sans block">KODE VALIDASI SEBELUMNYA:</span>
                    {b.previous_block_hash}
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-[#18181b] rounded border border-slate-100 dark:border-[#27272a] break-all">
                    <span className="text-slate-400 font-sans block">KODE VALIDASI TRANSAKSI (SHA-256):</span>
                    <strong className="text-slate-800 dark:text-slate-200">{b.current_block_hash}</strong>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-sans pt-1 border-t border-slate-100 dark:border-[#27272a]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Nominal Semula: Rp {Number(b.nominal_sebelumnya).toLocaleString("id-ID")}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Nominal Baru Disetujui: Rp {Number(b.nominal_baru).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "simulasi_budget" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {simulasiData.map((s, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-4 shadow-2xs space-y-2.5 text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Tahun {s.tahun}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272a] text-slate-600 dark:text-slate-300 font-medium">
                  {s.status}
                </span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between"><span>Gapok:</span> <strong className="text-slate-800 dark:text-slate-200">{s.alokasi_gapok}</strong></div>
                <div className="flex justify-between"><span>Tunkin:</span> <strong className="text-slate-800 dark:text-slate-200">{s.alokasi_tunkin}</strong></div>
                <div className="flex justify-between"><span>Proyeksi Pensiun:</span> <span>{s.proyeksi_bup_pensiun}</span></div>
                <div className="flex justify-between"><span>Proyeksi KGB:</span> <span>{s.proyeksi_kgb}</span></div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-[#27272a]">
                <span className="text-[10px] text-slate-400 block">TOTAL ANGGARAN:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{s.total_anggaran}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "hak_jf" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] overflow-hidden shadow-2xs w-full">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#18181b] uppercase text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#27272a]">
              <tr>
                <th className="p-3.5">Kelas Jabatan</th>
                <th className="p-3.5">Jenjang Fungsional</th>
                <th className="p-3.5">Besaran Tunkin Standar</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
              <tr>
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">Kelas 18</td>
                <td className="p-3.5">Wakapolri / Eselon IA</td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">Rp 34.902.000</td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">Tercantum SK</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">Kelas 14 - 15</td>
                <td className="p-3.5">Fungsional Ahli Utama (Pamen/Pati)</td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">Rp 17.500.000 - Rp 21.000.000</td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">Tercantum SK</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">Kelas 9 - 11</td>
                <td className="p-3.5">Fungsional Ahli Muda (Pama)</td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">Rp 5.183.000 - Rp 8.750.000</td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">Tercantum SK</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">Kelas 7 - 8</td>
                <td className="p-3.5">Fungsional Mahir / Pertama (Bintara)</td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">Rp 3.319.000 - Rp 4.595.000</td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">Tercantum SK</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
