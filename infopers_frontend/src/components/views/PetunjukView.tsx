"use client";

import React, { useState } from "react";
import {
  PlayCircle,
  Copy,
  Check,
  Archive,
  Database,
  Server,
  Globe,
  CheckCircle2,
} from "lucide-react";

export default function PetunjukView() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: "Pastikan Layanan Database PostgreSQL Aktif",
      icon: Database,
      desc: "Sistem membutuhkan server PostgreSQL aktif dengan 8 tabel basis data presisi yang telah terisi (483.355 baris data).",
      cmd: null,
      info: "Host: localhost:5432 • DB: postgres • User: postgres • Password: admin",
    },
    {
      num: 2,
      title: "Jalankan Server Backend (Golang)",
      icon: Server,
      desc: "Buka terminal baru di direktori infopers_backend, kemudian jalankan executable backend presisi yang melayani REST API dan autentikasi JWT pada port 8080.",
      cmd: 'cd "d:\\1. MASTER\\antigravityIDE\\PROJECT\\programingdatassdm\\infopers_backend"\n.\\backend.exe',
      info: "Backend berjalan di: http://localhost:8080",
    },
    {
      num: 3,
      title: "Jalankan Server Frontend (Next.js)",
      icon: Globe,
      desc: "Buka terminal terpisah di direktori infopers_frontend, kemudian jalankan server pengembangan Next.js pada port 3000.",
      cmd: 'cd "d:\\1. MASTER\\antigravityIDE\\PROJECT\\programingdatassdm\\infopers_frontend"\nnpm run dev',
      info: "Frontend berjalan di: http://localhost:3000",
    },
    {
      num: 4,
      title: "Buka Aplikasi di Browser & Masuk",
      icon: PlayCircle,
      desc: "Akses alamat http://localhost:3000 pada peramban web Anda. Gunakan salah satu akun resmi berikut:",
      cmd: null,
      info: "Superadmin: admin.nasional (Password: Polri2026!) • Personel: 04031518 (Password: Polri2026!)",
    },
    {
      num: 5,
      title: "Membuat Backup Gabungan Otomatis (.ZIP)",
      icon: Archive,
      desc: "Kapan pun Anda selesai membuat perubahan kode, jalankan skrip backup otomatis. Skrip akan mengompresi kode backend dan frontend (tanpa node_modules) ke dalam file .zip berstempel waktu di folder /backups.",
      cmd: 'cd "d:\\1. MASTER\\antigravityIDE\\PROJECT\\programingdatassdm"\n.\\backup.ps1',
      info: "Atau cukup klik 2 kali file backup.bat di Windows Explorer.",
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Petunjuk Operasional &amp; Tahapan Menjalankan Sistem
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Panduan langkah operasional menjalankan layanan basis data PostgreSQL, backend Golang, antarmuka Next.js, serta pencadangan berkas sistem.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4 w-full">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#18181b] text-slate-400 dark:text-slate-500">
                  <Icon size={16} />
                </div>
              </div>

              {s.cmd && (
                <div className="relative group">
                  <pre className="p-3 rounded-lg bg-slate-900 dark:bg-[#18181b] text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-transparent dark:border-[#27272a]">
                    {s.cmd}
                  </pre>
                  <button
                    onClick={() => copyCode(s.cmd!, `cmd_${s.num}`)}
                    className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 dark:bg-[#27272a] hover:bg-slate-700 dark:hover:bg-[#3f3f46] text-slate-300 text-xs transition-colors flex items-center gap-1"
                    title="Salin Perintah"
                  >
                    {copiedId === `cmd_${s.num}` ? (
                      <Check size={12} className="text-white" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span className="text-[10px]">Salin</span>
                  </button>
                </div>
              )}

              <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#18181b] rounded-lg p-2.5 border border-slate-100 dark:border-[#27272a] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-slate-800 dark:text-white flex-shrink-0" />
                <span>{s.info}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
