"use client";

import React, { useState } from "react";
import {
  Award,
  UserPlus,
  Building2,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Target,
  Medal,
  History,
  Search,
  CheckCircle2,
} from "lucide-react";
import { MenuKey } from "@/types";

interface SpecializedModuleViewProps {
  moduleKey: MenuKey;
}

export default function SpecializedModuleView({ moduleKey }: SpecializedModuleViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================================
  // 1. PROGRAM UNGGULAN SSDM POLRI
  // =========================================================================
  if (moduleKey === "program_unggulan") {
    const programs = [
      {
        kode: "UNGGULAN-01",
        judul: "Rekrutmen Proaktif & Prinsip BETAH",
        deskripsi: "Seleksi penerimaan terpadu berbasis CAT digital transparan tanpa perantara bersama pengawas eksternal.",
        status: "Aktif Berjalan",
        satker: "Biro Dalpers",
      },
      {
        kode: "UNGGULAN-02",
        judul: "Manajemen Talenta & Sistem Meritokrasi",
        deskripsi: "Talent pool terpadu perwira dan bintara berprestasi untuk percepatan penugasan dan seleksi pimpinan.",
        status: "Aktif Berjalan",
        satker: "Biro Binkar",
      },
      {
        kode: "UNGGULAN-03",
        judul: "Layanan Psikologi Presisi & Pendampingan",
        deskripsi: "Pemeriksaan psikologi berkala, mapping kesehatan mental, dan standardisasi izin pinjam senpi dinas.",
        status: "Prioritas",
        satker: "Biro Psikologi",
      },
      {
        kode: "UNGGULAN-04",
        judul: "Kesejahteraan & Perumahan Personel",
        deskripsi: "Penyediaan fasilitas perumahan non-dinas bersubsidi dan jaminan perlindungan tugas bagi personel Polri.",
        status: "Aktif Berjalan",
        satker: "Biro Watpers",
      },
      {
        kode: "UNGGULAN-05",
        judul: "Transformasi Digital AI & Kriptografi",
        deskripsi: "Asisten AI lokal terenkripsi untuk analisis data personel dan audit trail anti-tamper berantai hash.",
        status: "Inovasi Baru",
        satker: "Rorenmin SSDM",
      },
      {
        kode: "UNGGULAN-06",
        judul: "Afirmasi Rekrutmen Wilayah 3T",
        deskripsi: "Rekrutmen bakomsus siber/medis dan afirmasi putra-putri daerah pedalaman perbatasan dan pulau terluar.",
        status: "Aktif Berjalan",
        satker: "Biro Dalpers",
      },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Program Unggulan SSDM Polri
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pembaruan tata kelola personel, meritokrasi digital, dan inovasi layanan SDM Presisi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((prog, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-slate-300">
                  {prog.kode}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {prog.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {prog.judul}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {prog.deskripsi}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-[#27272a] text-[11px] text-slate-400">
                Pengampu: <span className="font-semibold text-slate-700 dark:text-slate-300">{prog.satker}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PREDIKSI INTAKE PERSONEL
  // =========================================================================
  if (moduleKey === "prediksi_intake") {
    const intakeRows = [
      { jalur: "Taruna Akpol", kuota2024: 300, kuota2025: 325, kuota2026: 350, tren: "+7.6%", status: "Verifikasi Rikmin" },
      { jalur: "SIPSS (Sumber Sarjana)", kuota2024: 100, kuota2025: 120, kuota2026: 150, tren: "+25.0%", status: "Uji Kompetensi" },
      { jalur: "Bintara Tugas Umum (PTU)", kuota2024: 10500, kuota2025: 11200, kuota2026: 11800, tren: "+5.3%", status: "Formasi Polda" },
      { jalur: "Bakomsus Siber & IT", kuota2024: 400, kuota2025: 600, kuota2026: 850, tren: "+41.6%", status: "Prioritas Mabes" },
      { jalur: "Bakomsus Tenaga Medis", kuota2024: 250, kuota2025: 350, kuota2026: 450, tren: "+28.5%", status: "Pusdokkes" },
      { jalur: "Tamtama Brimob", kuota2024: 1200, kuota2025: 1400, kuota2026: 1500, tren: "+7.1%", status: "Puslat Brimob" },
      { jalur: "Tamtama Polair", kuota2024: 250, kuota2025: 300, kuota2026: 350, tren: "+16.6%", status: "Puslat Polair" },
      { jalur: "PPPK Polri", kuota2024: 850, kuota2025: 1200, kuota2026: 1650, tren: "+37.5%", status: "Verifikasi BKN" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Prediksi Intake Personel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis rekrutmen penerimaan terpadu pengganti pensiun (BUP) 2024 - 2026
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214]">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Target Intake 2026</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">17.100</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214]">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Proyeksi Pensiun Pengganti</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">7.842</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214]">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Kategori Prioritas</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">Bakomsus</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#18181b] text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#27272a]">
                <tr>
                  <th className="py-2.5 px-3.5">Jalur Penerimaan</th>
                  <th className="py-2.5 px-3.5 text-right font-mono">2024</th>
                  <th className="py-2.5 px-3.5 text-right font-mono">2025</th>
                  <th className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">2026</th>
                  <th className="py-2.5 px-3.5 text-center">Tren</th>
                  <th className="py-2.5 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                {intakeRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50">
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200">{row.jalur}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-slate-500">{row.kuota2024.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-slate-500">{row.kuota2025.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right font-bold text-slate-900 dark:text-white">{row.kuota2026.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">{row.tren}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ANALISIS FORMASI & DSPP
  // =========================================================================
  if (moduleKey === "analisis_formasi") {
    const poldaStats = [
      { nama: "Mabes Polri", dspp: 32500, riil: 30620, selisih: -1880, rasio: "94.2%", status: "Ideal" },
      { nama: "Polda Metro Jaya", dspp: 42000, riil: 38450, selisih: -3550, rasio: "91.5%", status: "Kebutuhan Bintara" },
      { nama: "Polda Jawa Barat", dspp: 36500, riil: 31200, selisih: -5300, rasio: "85.4%", status: "Perlu Penguatan" },
      { nama: "Polda Jawa Tengah", dspp: 38000, riil: 34100, selisih: -3900, rasio: "89.7%", status: "Ideal" },
      { nama: "Polda Jawa Timur", dspp: 45000, riil: 41800, selisih: -3200, rasio: "92.8%", status: "Ideal" },
      { nama: "Polda Papua", dspp: 16800, riil: 12400, selisih: -4400, rasio: "73.8%", status: "Prioritas Afirmasi" },
      { nama: "Polda Kaltim (IKN)", dspp: 12000, riil: 8900, selisih: -3100, rasio: "74.1%", status: "Prioritas Strategis" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Analisis Formasi &amp; DSPP vs Riil
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Komparasi Daftar Susunan Personel Polri (DSPP) terhadap kekuatan riil wilayah
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#18181b] text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#27272a]">
                <tr>
                  <th className="py-2.5 px-3.5">Satuan Wilayah</th>
                  <th className="py-2.5 px-3.5 text-right font-mono">DSPP</th>
                  <th className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">Kekuatan Riil</th>
                  <th className="py-2.5 px-3.5 text-right font-mono">Selisih</th>
                  <th className="py-2.5 px-3.5 text-center font-mono">Persentase</th>
                  <th className="py-2.5 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                {poldaStats.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50">
                    <td className="py-2.5 px-3.5 font-bold text-slate-800 dark:text-slate-200">{item.nama}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-slate-500">{item.dspp.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right font-bold text-slate-900 dark:text-white">{item.riil.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-3.5 font-mono text-right text-rose-500">{item.selisih.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-3.5 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">{item.rasio}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-slate-300">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. REKAM JEJAK & USULAN UKP
  // =========================================================================
  if (moduleKey === "rekam_jejak_ukp") {
    const ukpList = [
      { nrp: "78091234", nama: "Budi Santoso, S.I.K.", pangkatLama: "AKBP", pangkatUsulan: "KOMBES POL", satker: "Ditreskrimsus Polda Metro", status: "Memenuhi Syarat" },
      { nrp: "82040567", nama: "Agus Pratama, S.H.", pangkatLama: "KOMPOL", pangkatUsulan: "AKBP", satker: "Bareskrim Polri", status: "Memenuhi Syarat" },
      { nrp: "88061122", nama: "Dian Wahyudi, S.Tr.K.", pangkatLama: "AKP", pangkatUsulan: "KOMPOL", satker: "Korlantas Polri", status: "Sidang Wanjak" },
      { nrp: "92110489", nama: "Rizky Firmansyah, S.H.", pangkatLama: "IPTU", pangkatUsulan: "AKP", satker: "Polda Jabar", status: "Memenuhi Syarat" },
      { nrp: "96080345", nama: "Fajar Nugraha", pangkatLama: "AIPDA", pangkatUsulan: "AIPTU", satker: "Polrestabes Bandung", status: "Memenuhi Syarat" },
      { nrp: "99010214", nama: "Siti Rahmawati", pangkatLama: "BRIPKA", pangkatUsulan: "AIPDA", satker: "Polres Metro Bekasi", status: "Verifikasi Ditpropam" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Rekam Jejak &amp; Usulan UKP
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Usulan Kenaikan Pangkat periode 1 Juli 2026 (Total: 15.340 Usulan)
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#18181b] text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#27272a]">
                <tr>
                  <th className="py-2.5 px-3.5">NRP</th>
                  <th className="py-2.5 px-3.5">Nama Personel</th>
                  <th className="py-2.5 px-3.5">Pangkat Lama</th>
                  <th className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">Pangkat Usulan</th>
                  <th className="py-2.5 px-3.5">Satker</th>
                  <th className="py-2.5 px-3.5">Status Wanjak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                {ukpList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{row.nrp}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{row.nama}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{row.pangkatLama}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{row.pangkatUsulan}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{row.satker}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-slate-200">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. TALENT POOL & DIKBANG
  // =========================================================================
  if (moduleKey === "talent_pool_dikbang") {
    const dikbangList = [
      { jenjang: "Sespimti Dikreg ke-35", kriteria: "Pamen Berpangkat Kombes Pol", kuota: "80 Kursi", status: "Seleksi Pusat" },
      { jenjang: "Sespimmen Dikreg ke-66", kriteria: "Pamen Berpangkat Kompol & AKBP", kuota: "250 Kursi", status: "Uji Psikologi" },
      { jenjang: "Sekolah Inspektur Polisi (SIP) ke-55", kriteria: "Bintara Senior Aipda & Aiptu", kuota: "2.500 Kursi", status: "Sidang Kelulusan" },
      { jenjang: "Dikbangspes Cyber & Digital Forensics", kriteria: "Pama & Bintara Reskrim Siber", kuota: "150 Kursi", status: "Pemberkasan" },
      { jenjang: "Dikbangspes Manajemen Ops Polsek", kriteria: "Pama Calon Kapolsek / Wakapolsek", kuota: "400 Kursi", status: "Penetapan Kuota" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Talent Pool &amp; Seleksi Dikbang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Database kaderisasi pimpinan Polri (Sespimti, Sespimmen, SIP, &amp; Dikbangspes)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dikbangList.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.jenjang}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.kriteria}</p>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">{item.status}</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-slate-300">
                {item.kuota}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. STATUS VERIFIKASI ADMINISTRASI
  // =========================================================================
  if (moduleKey === "status_verifikasi_adm") {
    const syaratList = [
      { instrumen: "SKHP Propam", deskripsi: "Bebas dari catatan pelanggaran kode etik, disiplin, atau tindak pidana aktif.", status: "Wajib Sipropam" },
      { instrumen: "Penilaian SMK Online", deskripsi: "Nilai kinerja semester terakhir minimal kategori BAIK (skor min. 75.00).", status: "Wajib Semester" },
      { instrumen: "Uji Kesjas Berkala", deskripsi: "Hasil kesamaptaan jasmani berkala minimal skor kelayakan 65.00.", status: "Berlaku 6 Bulan" },
      { instrumen: "Rikkes Fisik & Lab", deskripsi: "Status kesehatan Stake 1 / Stake 2 bebas narkoba.", status: "Pusdokkes" },
      { instrumen: "Kepatuhan LHKPN", deskripsi: "Pelaporan harta kekayaan pemangku jabatan struktural dan penyidik.", status: "KPK / Itwasum" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Status Verifikasi Administrasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Standar kelayakan syarat mutasi jabatan dan seleksi pendidikan
          </p>
        </div>

        <div className="space-y-2.5">
          {syaratList.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.instrumen}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.deskripsi}</p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. PSIKOLOGI SENPI
  // =========================================================================
  if (moduleKey === "psikologi_senpi") {
    const senpiRows = [
      { nrp: "84071190", nama: "Kompol Hendra Gunawan", satker: "Bareskrim Polri", skor: 84.5, senpi: "Direkomendasikan (MS)" },
      { nrp: "89020412", nama: "AKP Yudi Prasetyo", satker: "Ditreskrimum Polda Metro", skor: 81.0, senpi: "Direkomendasikan (MS)" },
      { nrp: "93050871", nama: "Iptu Faisal Akbar", satker: "Polres Metro Jaksel", skor: 78.5, senpi: "Direkomendasikan (MS)" },
      { nrp: "95090123", nama: "Aipda Rian Hidayat", satker: "Satreskrim Polrestabes", skor: 61.2, senpi: "Konseling Khusus (TMS)" },
      { nrp: "98030564", nama: "Bripka Doni Siregar", satker: "Ditresnarkoba Sumut", skor: 86.0, senpi: "Direkomendasikan (MS)" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Uji Psikologi &amp; Izin Senpi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring kelayakan psikologis bagi personel pemegang senjata api dinas
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#18181b] text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#27272a]">
                <tr>
                  <th className="py-2.5 px-3.5">NRP</th>
                  <th className="py-2.5 px-3.5">Nama Personel</th>
                  <th className="py-2.5 px-3.5">Satker</th>
                  <th className="py-2.5 px-3.5 text-center font-mono">Skor</th>
                  <th className="py-2.5 px-3.5">Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                {senpiRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{row.nrp}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{row.nama}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{row.satker}</td>
                    <td className="py-2.5 px-3.5 font-mono text-center font-bold">{row.skor}</td>
                    <td className="py-2.5 px-3.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        row.senpi.includes("MS")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}>
                        {row.senpi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. TANDA KEHORMATAN / SATYA LENCANA
  // =========================================================================
  if (moduleKey === "tanda_kehormatan") {
    const lencanaList = [
      { nama: "Bintang Bhayangkara Nararya", masaDinas: "Pati & Pamen Berjasa Besar", kuota: "185 Penerima" },
      { nama: "Satya Lencana Pengabdian 32 Tahun", masaDinas: "32 Tahun Dinas Tanpa Cela", kuota: "2.410 Penerima" },
      { nama: "Satya Lencana Pengabdian 24 Tahun", masaDinas: "24 Tahun Dinas Tanpa Cela", kuota: "6.850 Penerima" },
      { nama: "Satya Lencana Pengabdian 16 Tahun", masaDinas: "16 Tahun Dinas Tanpa Cela", kuota: "11.200 Penerima" },
      { nama: "Satya Lencana Pengabdian 8 Tahun", masaDinas: "8 Tahun Dinas Tanpa Cela", kuota: "18.400 Penerima" },
      { nama: "Satya Lencana Karya Bhakti", masaDinas: "Penugasan Bencana & Kemanusiaan", kuota: "1.250 Penerima" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Tanda Kehormatan &amp; Satya Lencana
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar usulan penganugerahan tanda kehormatan negara
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lencanaList.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.nama}</h3>
              <p className="text-[11px] text-slate-500">{item.masaDinas}</p>
              <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 pt-1">{item.kuota}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9. AUDIT TRAIL
  // =========================================================================
  if (moduleKey === "audit_trail") {
    const logs = [
      { id: "LOG-9921", aksi: "UPDATE_STATUS_MUTASI", target: "Kombes Pol Dr. Iwan Prasetyo", user: "admin.nasional", waktu: "28-09-2026 01:22", hash: "e3b0c44298fc1c14...855" },
      { id: "LOG-9920", aksi: "VERIFIKASI_SK_UKP", target: "AKBP Budi Santoso", user: "binkar.pamen", waktu: "28-09-2026 01:14", hash: "9834876dcfb05cb1...9f0" },
      { id: "LOG-9919", aksi: "UPLOAD_BERKAS_DIKBANG", target: "Kompol Agus Pratama", user: "dalpers.seleksi", waktu: "28-09-2026 00:58", hash: "a591a6d40bf42040...46e" },
      { id: "LOG-9918", aksi: "SINKRONISASI_SIPP_POLDA", target: "Polda Metro (38.450 Rows)", user: "system.sync", waktu: "28-09-2026 00:00", hash: "2cf24dba5fb0a30e...824" },
    ];

    return (
      <div className="space-y-5 w-full pb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Log Validitas Data &amp; Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail berbasis Cryptographic Hash SHA-256 untuk penjaminan integritas data anti-tamper
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#18181b] text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#27272a]">
                <tr>
                  <th className="py-2.5 px-3.5">Log ID</th>
                  <th className="py-2.5 px-3.5">Aktivitas</th>
                  <th className="py-2.5 px-3.5">Objek Target</th>
                  <th className="py-2.5 px-3.5 font-mono">Operator</th>
                  <th className="py-2.5 px-3.5 font-mono">Waktu</th>
                  <th className="py-2.5 px-3.5 font-mono">Hash SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{log.id}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-700 dark:text-slate-300">{log.aksi}</td>
                    <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400">{log.target}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500">{log.user}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500">{log.waktu}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-400">{log.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-center space-y-2">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">Modul SSDM Polri</h2>
      <p className="text-xs text-slate-500">Memuat data modul operasional...</p>
    </div>
  );
}
