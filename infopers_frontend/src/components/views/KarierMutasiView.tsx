"use client";

import React, { useState } from "react";

export default function KarierMutasiView() {
  const [selectedPosition, setSelectedPosition] = useState<number>(0);

  const formasi = [
    {
      id: 0,
      posisi: "Kepala Unit (Kanit) Tindak Pidana Siber",
      satker: "Ditreskrimsus Polda Metro Jaya",
      golongan: "Pama / AKP - Kompol",
      syarat: "Digital Forensik, Investigasi Siber, Sertifikasi Pusdik",
      kandidat: [
        {
          nama: "ROSVIAN SETIADI",
          nrp: "04031518",
          pangkat: "BRIPDA (Prospek Perwira)",
          match: "96.4%",
          alasan: "Memiliki sertifikasi cyber forensics & angka kredit JF tinggi.",
        },
        {
          nama: "FAHREZA",
          nrp: "96120311",
          pangkat: "BRIGADIR",
          match: "91.2%",
          alasan: "Pengalaman penugasan 4 tahun di bidang intelijen & TI.",
        },
      ],
    },
    {
      id: 1,
      posisi: "Auditor SDM & Keuangan Ahli Muda",
      satker: "Itwasum Mabes Polri",
      golongan: "Pamen / AKBP",
      syarat: "Audit Kinerja, Akuntan Forensik, Tata Kelola Anggaran",
      kandidat: [
        {
          nama: "YAYAN JUNIYANTO",
          nrp: "87060679",
          pangkat: "AIPDA",
          match: "89.8%",
          alasan: "Kualifikasi tata kelola anggaran dan rekam jejak integritas baik.",
        },
      ],
    },
  ];

  const curr = formasi[selectedPosition];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Pertimbangan Mutasi &amp; Formasi Jabatan
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Penelaahan kesesuaian kualifikasi dan rekam jejak personel sebagai bahan pertimbangan sidang Dewan Pertimbangan Karier (DPK).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-4 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            Pilih Formasi Jabatan:
          </span>
          {formasi.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedPosition(f.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedPosition === f.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-2xs font-semibold"
                  : "bg-slate-50 dark:bg-[#18181b] border-slate-100 dark:border-[#27272a] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#27272a]"
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  selectedPosition === f.id
                    ? "bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-900"
                    : "bg-slate-200 dark:bg-[#27272a] text-slate-700 dark:text-slate-300"
                }`}
              >
                {f.golongan}
              </span>
              <div className="text-xs font-bold mt-1.5">{f.posisi}</div>
              <div className="text-[10px] text-slate-400">{f.satker}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-[#27272a] flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Target Posisi:</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{curr.posisi}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{curr.satker}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Syarat:</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{curr.syarat}</p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Daftar Personel Memenuhi Syarat Kualifikasi:
            </span>
            {curr.kandidat.map((k, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-100 dark:border-[#27272a] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-white">{k.nama}</strong>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                      {k.pangkat}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">NRP: {k.nrp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{k.alasan}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Skor Kesesuaian</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">
                    {k.match}
                  </span>
                  <button className="mt-1 px-3 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium hover:bg-slate-800 dark:hover:bg-slate-200 shadow-2xs">
                    Pilih Rekomendasi DPK
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
