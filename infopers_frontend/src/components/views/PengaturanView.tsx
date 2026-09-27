"use client";

import React from "react";
import { Shield, Key, Lock, Server } from "lucide-react";

export default function PengaturanView() {
  const roles = [
    {
      role: "Administrator Utama (Mabes Polri)",
      badge: "SUPERADMIN",
      desc: "Kewenangan penuh tingkat nasional, manajemen kebijakan, dan pemantauan sistem pusat SSDM Polri.",
      users: 1,
    },
    {
      role: "Administrator Wilayah (Polda)",
      badge: "ADMIN_POLDA",
      desc: "Kewenangan tingkat kepolisian daerah untuk rekapitulasi data satker dan verifikasi usulan daerah.",
      users: 1,
    },
    {
      role: "Operator Satuan Kerja (Satker / Renmin)",
      badge: "ADMIN_SATKER",
      desc: "Pengelolaan berkas dan administrasi personel di lingkungan satker atau subbagian perencanaan dan administrasi.",
      users: 1,
    },
    {
      role: "Personel Aktif (Akses Mandiri)",
      badge: "USER_MANDIRI",
      desc: "Akses mandiri bagi seluruh anggota Polri dan PNS Polri untuk memantau cuti, DRH, dan rincian tunjangan kinerja.",
      users: 483352,
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Pengaturan Hak Akses Pengguna
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tingkat perizinan pengguna dan parameter keamanan sistem informasi personel SSDM Polri.
        </p>
      </div>

      {/* Grid Peran Pengguna */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {roles.map((r, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-4 shadow-2xs space-y-2 text-xs"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-[11px]">
                {r.role}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                {r.users.toLocaleString("id-ID")} Akun
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Status Keamanan & Proteksi Sistem */}
      <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-5 shadow-2xs space-y-3 w-full">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Status Parameter Keamanan &amp; Integritas Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-[#18181b] rounded-lg border border-slate-100 dark:border-[#27272a] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Modul Proteksi Data:
            </span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              KMS Mabes Polri (Aktif)
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#18181b] rounded-lg border border-slate-100 dark:border-[#27272a] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Standar Enkripsi NIK:
            </span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              AES-256 GCM (Standar Nasional)
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#18181b] rounded-lg border border-slate-100 dark:border-[#27272a] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Sesi Otentikasi:
            </span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              Token Resmi Terproteksi (24 Jam)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
