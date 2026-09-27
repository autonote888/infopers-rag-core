"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

interface NodeBoxProps {
  title: string;
  subtitle?: string;
  badge?: string;
  isPimpinan?: boolean;
  isKaro?: boolean;
  isBagian?: boolean;
  isSubbag?: boolean;
  isUrtu?: boolean;
  isUrmin?: boolean;
  className?: string;
  onClick?: () => void;
}

function NodeBox({
  title,
  subtitle,
  badge,
  isPimpinan,
  isKaro,
  isBagian,
  isSubbag,
  isUrtu,
  isUrmin,
  className = "",
  onClick,
}: NodeBoxProps) {
  let baseStyle =
    "p-2.5 rounded-lg border text-center transition-all duration-150 select-none cursor-pointer shadow-2xs ";

  if (isPimpinan) {
    baseStyle +=
      "bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white font-extrabold text-sm tracking-wide ";
  } else if (isKaro) {
    baseStyle +=
      "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-800 dark:border-slate-300 font-extrabold text-xs tracking-wider ";
  } else if (isBagian) {
    baseStyle +=
      "bg-white dark:bg-[#18181b] text-slate-900 dark:text-white border-slate-300 dark:border-[#3f3f46] font-bold text-xs hover:border-slate-800 dark:hover:border-slate-200 ";
  } else if (isUrtu || isUrmin) {
    baseStyle +=
      "bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#3f3f46] text-[10px] font-bold ";
  } else if (isSubbag) {
    baseStyle +=
      "bg-slate-50 dark:bg-[#121214] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#27272a] text-[10px] font-semibold hover:bg-white dark:hover:bg-[#18181b] hover:border-slate-400 dark:hover:border-slate-500 ";
  } else {
    baseStyle +=
      "bg-white dark:bg-[#18181b] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#27272a] text-xs ";
  }

  return (
    <div className={`${baseStyle} ${className}`} onClick={onClick} title={subtitle || title}>
      {badge && (
        <span className="text-[8px] font-mono uppercase tracking-widest block opacity-75 mb-0.5">
          {badge}
        </span>
      )}
      <div className="leading-tight uppercase">{title}</div>
      {subtitle && (
        <div className="text-[9px] font-normal opacity-80 mt-0.5 leading-snug line-clamp-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function SotkView() {
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showOriginalPdf, setShowOriginalPdf] = useState<boolean>(false);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<{
    title: string;
    fullName: string;
    desc: string;
  } | null>(null);

  const sheets = [
    {
      num: 1,
      title: "Lembar 1: SOTK SSDM Gabungan",
      pageRef: "Halaman -225-",
      desc: "Struktur Organisasi Tingkat Mabes (As SDM Kapolri, Bagrenmin, Urkeu, dan 5 Biro)",
    },
    {
      num: 2,
      title: "Lembar 2: RO JIANSTRA",
      pageRef: "Halaman -226-",
      desc: "Biro Pengkajian dan Strategi (Bag Ren, Bag Jiansis, Bag Jakdiklat, Bag Anev)",
    },
    {
      num: 3,
      title: "Lembar 3: RO DALPERS",
      pageRef: "Halaman -227-",
      desc: "Biro Pengendalian Personel (Bag Diapers, Bag Rimdik PNS, Bag Lekdik)",
    },
    {
      num: 4,
      title: "Lembar 4: RO BINKAR",
      pageRef: "Halaman -228-",
      desc: "Biro Pembinaan Karier (Bag Mutjab, Bag Pangkat, Bag Gassus, Bag Infopers, Bag Penkompeten)",
    },
    {
      num: 5,
      title: "Lembar 5: RO WATPERS",
      pageRef: "Halaman -229-",
      desc: "Biro Perawatan Personel (Bag Binreligi, Bag Binjas, Bag Yanhak, Bag Khirdin)",
    },
    {
      num: 6,
      title: "Lembar 6: RO PSI",
      pageRef: "Halaman -230-",
      desc: "Biro Psikologi (Bag Psipol, Bag Psipers, Bag Labpsi)",
    },
  ];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(140, Math.max(80, prev + delta)));
  };

  const showDetail = (title: string, fullName: string, desc: string) => {
    setSelectedNodeInfo({ title, fullName, desc });
  };

  return (
    <div className="space-y-5 w-full pb-10">
      {/* 1. HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-black text-[10px] font-extrabold tracking-wider uppercase">
              PERKAP NO. 6 TAHUN 2017
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              Lampiran Resmi SOTK SSDM Polri
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
            BAGAN STRUKTUR ORGANISASI &amp; TATA KERJA (SOTK) SSDM POLRI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Salinan bagan struktur resmi per-lembar lampiran Peraturan Kapolri dengan desain presisi dan interaktif.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] rounded-lg p-1 text-xs">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-600 dark:text-slate-300"
              title="Perkecil (-10%)"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-600 dark:text-slate-300"
              title="Perbesar (+10%)"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Toggle PDF Asli */}
          <button
            onClick={() => setShowOriginalPdf(!showOriginalPdf)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showOriginalPdf
                ? "bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white"
                : "bg-white dark:bg-[#121214] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#27272a] hover:bg-slate-50 dark:hover:bg-[#18181b]"
            }`}
          >
            <FileText size={13} />
            <span>{showOriginalPdf ? "Tutup PDF Asli" : "Lihat Dokumen PDF"}</span>
          </button>

          {/* Unduh Berkas Asli */}
          <a
            href="/SOTK_SSDM.pdf"
            download="SOTK_SSDM_POLRI_Perkap_6_2017.pdf"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-2xs"
          >
            <Download size={13} />
            <span>Unduh PDF</span>
          </a>
        </div>
      </div>

      {/* 2. TAB PILIHAN LEMBAR SESUAI PDF */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-[#27272a] text-xs">
        {sheets.map((s) => {
          const isActive = activeSheet === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setActiveSheet(s.num)}
              className={`px-3.5 py-2 rounded-t-lg font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
                isActive
                  ? "bg-white dark:bg-[#121214] text-slate-900 dark:text-white border-black dark:border-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent hover:bg-slate-50 dark:hover:bg-[#18181b]"
              }`}
            >
              <span>{s.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#27272a] font-mono text-slate-500 dark:text-slate-400">
                Hal {s.num}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. DOKUMEN PDF ASLI (JIKA DIAKTIFKAN) */}
      {showOriginalPdf && (
        <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200 dark:border-[#27272a] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-[#27272a]">
            <span className="font-bold text-slate-900 dark:text-white">
              Pratinjau Salinan Lembaran Asli (Halaman {activeSheet} dari 6)
            </span>
            <a
              href="/SOTK_SSDM.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:underline"
            >
              <span>Buka di tab baru</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-[#27272a] bg-slate-100 dark:bg-[#18181b]">
            <iframe
              src={`/SOTK_SSDM.pdf#page=${activeSheet}&toolbar=1`}
              title="Pratinjau Lembaran Asli PDF SOTK SSDM"
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* 4. CANVAS BAGAN ARSITEKTUR KOTAK & GARIS PRESISI */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200 dark:border-[#27272a] p-6 shadow-sm overflow-x-auto relative min-h-[640px]">
        {/* Header Lembaran Dokumen */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono pb-4 mb-4 border-b border-slate-100 dark:border-[#27272a]">
          <div className="font-extrabold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
            LAMPIRAN PERATURAN KAPOLRI NOMOR 6 TAHUN 2017 (SOTK MABES POLRI)
          </div>
          <div className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] font-bold text-slate-700 dark:text-slate-300">
            {sheets[activeSheet - 1].pageRef}
          </div>
        </div>

        {/* Content Container with Zoom */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-200 min-w-[980px] flex flex-col items-center"
        >
          {/* ============================================================== */}
          {/* LEMBAR 1: SOTK SSDM POLRI (GABUNGAN TINGKAT MABES)              */}
          {/* ============================================================== */}
          {activeSheet === 1 && (
            <div className="w-full space-y-6">
              {/* Garis Pembatas Dashed Unsur Pimpinan */}
              <div className="relative border-b-2 border-dashed border-slate-300 dark:border-[#3f3f46] pb-8 pt-2">
                <span className="absolute right-0 top-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-[#121214] px-2">
                  UNSUR PIMPINAN
                </span>

                <div className="flex flex-col items-center">
                  <NodeBox
                    title="AS SDM KAPOLRI"
                    subtitle="Asisten Kapolri Bidang Sumber Daya Manusia (Irjen Pol)"
                    isPimpinan
                    className="w-72 py-3"
                    onClick={() =>
                      showDetail(
                        "AS SDM KAPOLRI",
                        "Asisten Kapolri Bidang Sumber Daya Manusia",
                        "Pimpinan unsur pembantu pimpinan pada tingkat Mabes Polri yang berada di bawah dan bertanggung jawab kepada Kapolri dalam pelaksanaan pembinaan manajemen SDM Polri."
                      )
                    }
                  />

                  {/* Garis vertikal ke Bagrenmin & Urkeu */}
                  <div className="w-0.5 h-6 bg-slate-900 dark:bg-white"></div>

                  <div className="w-full max-w-lg flex items-start justify-between relative pt-1">
                    {/* Horizontal connector line */}
                    <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-900 dark:bg-white"></div>

                    {/* Left: URKEU */}
                    <div className="flex flex-col items-center w-36">
                      <div className="w-0.5 h-4 bg-slate-900 dark:bg-white"></div>
                      <NodeBox
                        title="URKEU"
                        subtitle="Urusan Keuangan"
                        isBagian
                        className="w-full"
                        onClick={() =>
                          showDetail("URKEU", "Urusan Keuangan", "Pelayanan administrasi keuangan dan anggaran dinas internal SSDM Polri.")
                        }
                      />
                    </div>

                    {/* Center: Garis Utama Turun ke 5 Biro */}
                    <div className="w-0.5 h-16 bg-slate-900 dark:bg-white"></div>

                    {/* Right: BAGRENMIN + Subbag */}
                    <div className="flex flex-col items-center w-56">
                      <div className="w-0.5 h-4 bg-slate-900 dark:bg-white"></div>
                      <NodeBox
                        title="BAGRENMIN"
                        subtitle="Bagian Perencanaan & Administrasi"
                        isBagian
                        className="w-full"
                        onClick={() =>
                          showDetail("BAGRENMIN", "Bagian Perencanaan dan Administrasi", "Perencanaan program, tata usaha dalam, dan pengelolaan sumber daya internal SSDM Polri.")
                        }
                      />
                      <div className="w-0.5 h-3 bg-slate-400 dark:bg-slate-600"></div>
                      <div className="grid grid-cols-3 gap-1 w-full text-[9px]">
                        <NodeBox
                          title="TAUD"
                          isSubbag
                          onClick={() => showDetail("TAUD", "Tata Usaha Dalam", "Pengelolaan surat menyurat, ketatausahaan, dan kearsipan internal.")}
                        />
                        <NodeBox
                          title="SUBBAG REN"
                          isSubbag
                          onClick={() => showDetail("SUBBAG REN", "Subbagian Perencanaan", "Penyusunan rencana kerja, rencana anggaran, dan laporan akuntabilitas.")}
                        />
                        <NodeBox
                          title="SUBBAG SUMDA"
                          isSubbag
                          onClick={() => showDetail("SUBBAG SUMDA", "Subbagian Sumber Daya", "Pemeliharaan fasilitas, logistik, materiil, dan personel internal SSDM.")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garis Pembatas Dashed Unsur Pembantu Pimpinan */}
              <div className="relative border-b-2 border-dashed border-slate-300 dark:border-[#3f3f46] pb-8 pt-2">
                <span className="absolute right-0 -top-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-[#121214] px-2">
                  UNSUR PEMBANTU PIMPINAN DAN PELAKSANA STAF
                </span>

                {/* Horizontal Bar Connector for 5 Biro */}
                <div className="w-full relative pt-2">
                  <div className="w-full h-0.5 bg-slate-900 dark:bg-white absolute top-2 left-0"></div>

                  <div className="grid grid-cols-5 gap-3 pt-4">
                    {/* BIRO 1: RO JIANSTRA */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-4"></div>
                      <NodeBox
                        title="RO JIANSTRA"
                        subtitle="Biro Pengkajian & Strategi"
                        isKaro
                        className="w-full"
                        onClick={() => setActiveSheet(2)}
                      />
                      <NodeBox title="URTU" isUrtu className="w-20" />
                      <div className="w-full space-y-1.5 pt-1">
                        <NodeBox title="BAG REN" isBagian />
                        <NodeBox title="BAG JIANSIS" isBagian />
                        <NodeBox title="BAG JAKDIKLAT" isBagian />
                        <NodeBox title="BAG ANEV" isBagian />
                      </div>
                    </div>

                    {/* BIRO 2: RO DALPERS */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-4"></div>
                      <NodeBox
                        title="RO DALPERS"
                        subtitle="Biro Pengendalian Personel"
                        isKaro
                        className="w-full"
                        onClick={() => setActiveSheet(3)}
                      />
                      <NodeBox title="URTU" isUrtu className="w-20" />
                      <div className="w-full space-y-1.5 pt-1">
                        <NodeBox title="BAG DIAPERS" isBagian />
                        <NodeBox title="BAG LEKDIK" isBagian />
                        <NodeBox title="BAG RIMDIK PNS" isBagian />
                      </div>
                    </div>

                    {/* BIRO 3: RO BINKAR */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-4"></div>
                      <NodeBox
                        title="RO BINKAR"
                        subtitle="Biro Pembinaan Karier"
                        isKaro
                        className="w-full"
                        onClick={() => setActiveSheet(4)}
                      />
                      <NodeBox title="URTU" isUrtu className="w-20" />
                      <div className="w-full space-y-1.5 pt-1">
                        <NodeBox title="BAG MUTJAB" isBagian />
                        <NodeBox title="BAG GASSUS" isBagian />
                        <NodeBox title="BAG PANGKAT" isBagian />
                        <NodeBox title="BAG INFOPERS" isBagian />
                        <NodeBox title="BAG PENKOMPETEN" isBagian />
                      </div>
                    </div>

                    {/* BIRO 4: RO WATPERS */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-4"></div>
                      <NodeBox
                        title="RO WATPERS"
                        subtitle="Biro Perawatan Personel"
                        isKaro
                        className="w-full"
                        onClick={() => setActiveSheet(5)}
                      />
                      <NodeBox title="URTU" isUrtu className="w-20" />
                      <div className="w-full space-y-1.5 pt-1">
                        <NodeBox title="BAG BINRELIGI" isBagian />
                        <NodeBox title="BAG BINJAS" isBagian />
                        <NodeBox title="BAG YANHAK" isBagian />
                        <NodeBox title="BAG KHIRDIN" isBagian />
                      </div>
                    </div>

                    {/* BIRO 5: RO PSI */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-4"></div>
                      <NodeBox
                        title="RO PSI"
                        subtitle="Biro Psikologi"
                        isKaro
                        className="w-full"
                        onClick={() => setActiveSheet(6)}
                      />
                      <NodeBox title="URTU" isUrtu className="w-20" />
                      <div className="w-full space-y-1.5 pt-1">
                        <NodeBox title="BAG PSIPOL" isBagian />
                        <NodeBox title="BAG PSIPERS" isBagian />
                        <NodeBox title="BAG LABPSI" isBagian />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garis Pembatas Bawah Dashed Unsur Pelaksana Utama */}
              <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                UNSUR PELAKSANA UTAMA
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEMBAR 2: KAROJIANSTRA                                         */}
          {/* ============================================================== */}
          {activeSheet === 2 && (
            <div className="w-full space-y-6 flex flex-col items-center">
              {/* Top: KAROJIANSTRA */}
              <div className="flex flex-col items-center">
                <NodeBox
                  title="KAROJIANSTRA"
                  subtitle="Kepala Biro Pengkajian dan Strategi (Brigjen Pol)"
                  isKaro
                  className="w-64 py-3"
                  onClick={() =>
                    showDetail("KAROJIANSTRA", "Kepala Biro Pengkajian dan Strategi", "Pimpinan pembantu staf penyelenggara perencanaan strategis, pengkajian sistem, kebijakan diklat, dan anev pembinaan SDM.")
                  }
                />
                <div className="w-0.5 h-3 bg-slate-900 dark:bg-white"></div>
                <NodeBox title="URTU" isUrtu className="w-24" />
                <div className="w-0.5 h-6 bg-slate-900 dark:bg-white"></div>
              </div>

              {/* Horizontal Line across 4 Bagian */}
              <div className="w-full relative">
                <div className="w-[84%] h-0.5 bg-slate-900 dark:bg-white mx-auto"></div>

                <div className="grid grid-cols-4 gap-4 pt-3">
                  {/* KOLOM 1: BAG REN */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG REN" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG RENGAR" isSubbag />
                      <NodeBox title="SUBBAG RENPERS" isSubbag />
                      <NodeBox title="SUBBAG RENSTRA" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 2: BAG JIANSIS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG JIANSIS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG SISDALPERS" isSubbag />
                      <NodeBox title="SUBBAG SISBINKAR" isSubbag />
                      <NodeBox title="SUBBAG SISWATPERSPSI" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 3: BAG JAKDIKLAT */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG JAKDIKLAT" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG PRODIKLAT" isSubbag />
                      <NodeBox title="SUBBAG JAKKERMA DIKLAT" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 4: BAG ANEV */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG ANEV" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG ANEV DALPRO" isSubbag />
                      <NodeBox title="SUBBAG ANEV DALPUANPERS" isSubbag />
                      <NodeBox title="SUBBAG ANEV BINKAR" isSubbag />
                      <NodeBox title="SUBBAG ANEV WATPERSPSI" isSubbag />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEMBAR 3: KARODALPERS                                          */}
          {/* ============================================================== */}
          {activeSheet === 3 && (
            <div className="w-full space-y-6 flex flex-col items-center max-w-4xl">
              {/* Top: KARODALPERS */}
              <div className="flex flex-col items-center">
                <NodeBox
                  title="KARODALPERS"
                  subtitle="Kepala Biro Pengendalian Personel (Brigjen Pol)"
                  isKaro
                  className="w-64 py-3"
                  onClick={() =>
                    showDetail("KARODALPERS", "Kepala Biro Pengendalian Personel", "Penyelenggara seleksi penerimaan terpadu, seleksi pendidikan pengembangan, dan pengadaan PNS Polri.")
                  }
                />
                <div className="w-0.5 h-3 bg-slate-900 dark:bg-white"></div>
                <NodeBox title="URTU" isUrtu className="w-24" />
                <div className="w-0.5 h-6 bg-slate-900 dark:bg-white"></div>
              </div>

              {/* Horizontal Line across 3 Bagian */}
              <div className="w-full relative">
                <div className="w-[75%] h-0.5 bg-slate-900 dark:bg-white mx-auto"></div>

                <div className="grid grid-cols-3 gap-6 pt-3">
                  {/* KOLOM 1: BAG DIAPERS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG DIAPERS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG RIM" isSubbag />
                      <NodeBox title="SUBBAG TANDISPEG" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 2: BAG RIMDIK PNS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG RIMDIK PNS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG RIMTAN PNS" isSubbag />
                      <NodeBox title="SUBBAG TANDIKLAT PNS" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 3: BAG LEKDIK */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG LEKDIK" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG LEKDIK BANGUM" isSubbag />
                      <NodeBox title="SUBBAG LEKDIK BANGSPES IPTEK" isSubbag />
                      <NodeBox title="SUBBAG AGOL" isSubbag />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEMBAR 4: KAROBINKAR                                           */}
          {/* ============================================================== */}
          {activeSheet === 4 && (
            <div className="w-full space-y-6 flex flex-col items-center">
              {/* Top: KAROBINKAR */}
              <div className="flex flex-col items-center">
                <NodeBox
                  title="KAROBINKAR"
                  subtitle="Kepala Biro Pembinaan Karier (Brigjen Pol)"
                  isKaro
                  className="w-64 py-3"
                  onClick={() =>
                    showDetail("KAROBINKAR", "Kepala Biro Pembinaan Karier", "Penyelenggara pembinaan karier, mutasi jabatan, usulan kenaikan pangkat, penugasan khusus, informasi personel (SIPP), dan asesmen kompetensi.")
                  }
                />
                <div className="w-0.5 h-3 bg-slate-900 dark:bg-white"></div>
                <NodeBox title="URTU" isUrtu className="w-24" />
                <div className="w-0.5 h-6 bg-slate-900 dark:bg-white"></div>
              </div>

              {/* Horizontal Line across 5 Bagian */}
              <div className="w-full relative">
                <div className="w-[86%] h-0.5 bg-slate-900 dark:bg-white mx-auto"></div>

                <div className="grid grid-cols-5 gap-3 pt-3">
                  {/* KOLOM 1: BAG MUTJAB */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG MUTJAB" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG MUTJAB PAMETI" isSubbag />
                      <NodeBox title="SUBBAG MUTJAB PAMA" isSubbag />
                      <NodeBox title="SUBBAG MUTBATA" isSubbag />
                      <NodeBox title="SUBBAG MUTJAB PNS" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 2: BAG PANGKAT */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG PANGKAT" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG KATPA" isSubbag />
                      <NodeBox title="SUBBAG KATBATA" isSubbag />
                      <NodeBox title="SUBBAG KAT PNS" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 3: BAG GASSUS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG GASSUS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG GASSUSDAGRI" isSubbag />
                      <NodeBox title="SUBBAG GASSUSLUGRI" isSubbag />
                      <NodeBox title="SUBBAG LEKGASSUS" isSubbag />
                      <NodeBox title="SUBBAG DAYAPOLWAN" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 4: BAG INFOPERS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG INFOPERS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG SISINFO" isSubbag />
                      <NodeBox title="SUBBAG LAHTALEK" isSubbag />
                      <NodeBox title="SUBBAG MINDOK" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 5: BAG PENKOMPETEN */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG PENKOMPETEN" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG RENPROG" isSubbag />
                      <NodeBox title="SUBBAG KOMPETEN" isSubbag />
                      <NodeBox title="SUBBAG MONEV" isSubbag />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEMBAR 5: KAROWATPERS                                          */}
          {/* ============================================================== */}
          {activeSheet === 5 && (
            <div className="w-full space-y-6 flex flex-col items-center">
              {/* Top: KAROWATPERS */}
              <div className="flex flex-col items-center">
                <NodeBox
                  title="KAROWATPERS"
                  subtitle="Kepala Biro Perawatan Personel (Brigjen Pol)"
                  isKaro
                  className="w-64 py-3"
                  onClick={() =>
                    showDetail("KAROWATPERS", "Kepala Biro Perawatan Personel", "Penyelenggara pembinaan rohani, jasmani, pemenuhan hak kesejahteraan, perumahan, tanda kehormatan, serta pensiun.")
                  }
                />
                <div className="w-0.5 h-3 bg-slate-900 dark:bg-white"></div>
                <NodeBox title="URTU" isUrtu className="w-24" />
                <div className="w-0.5 h-6 bg-slate-900 dark:bg-white"></div>
              </div>

              {/* Horizontal Line across 4 Bagian */}
              <div className="w-full relative">
                <div className="w-[82%] h-0.5 bg-slate-900 dark:bg-white mx-auto"></div>

                <div className="grid grid-cols-4 gap-4 pt-3">
                  {/* KOLOM 1: BAG BINRELIGI */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG BINRELIGI" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG ROHIS" isSubbag />
                      <NodeBox title="SUBBAG ROHPROKAT" isSubbag />
                      <NodeBox title="SUBBAG ROHHINBUDKIN" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 2: BAG BINJAS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG BINJAS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG LEKTANJAS" isSubbag />
                      <NodeBox title="SUBBAG HARKATAN" isSubbag />
                      <NodeBox title="SUBBAG LADIR" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 3: BAG YANHAK */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG YANHAK" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG JIJALDIK" isSubbag />
                      <NodeBox title="SUBBAG TIHORKAM" isSubbag />
                      <NodeBox title="SUBBAG SOSRUMDIK" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 4: BAG KHIRDIN */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG KHIRDIN" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG SIUNLURJA" isSubbag />
                      <NodeBox title="SUBBAG SIUN PNS" isSubbag />
                      <NodeBox title="SUBBAG HENTIF" isSubbag />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LEMBAR 6: KAROPSI                                              */}
          {/* ============================================================== */}
          {activeSheet === 6 && (
            <div className="w-full space-y-6 flex flex-col items-center max-w-4xl">
              {/* Top: KAROPSI */}
              <div className="flex flex-col items-center">
                <NodeBox
                  title="KAROPSI"
                  subtitle="Kepala Biro Psikologi (Brigjen Pol)"
                  isKaro
                  className="w-64 py-3"
                  onClick={() =>
                    showDetail("KAROPSI", "Kepala Biro Psikologi", "Penyelenggara pemeriksaan psikologi kepolisian, pengujian kelayakan senjata api, profiling criminal, konseling mental, dan laboratorium psikologi.")
                  }
                />
                <div className="w-0.5 h-3 bg-slate-900 dark:bg-white"></div>
                <NodeBox title="URTU" isUrtu className="w-24" />
                <div className="w-0.5 h-6 bg-slate-900 dark:bg-white"></div>
              </div>

              {/* Horizontal Line across 3 Bagian */}
              <div className="w-full relative">
                <div className="w-[75%] h-0.5 bg-slate-900 dark:bg-white mx-auto"></div>

                <div className="grid grid-cols-3 gap-6 pt-3">
                  {/* KOLOM 1: BAG PSIPOL */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG PSIPOL" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG PSIKAM" isSubbag />
                      <NodeBox title="SUBBAG PSIKRIM" isSubbag />
                      <NodeBox title="SUBBAG PSIYANMAS" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 2: BAG PSIPERS */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG PSIPERS" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG LEKPSI" isSubbag />
                      <NodeBox title="SUBBAG KLASPSI" isSubbag />
                      <NodeBox title="SUBBAG JARTALPSI" isSubbag />
                    </div>
                  </div>

                  {/* KOLOM 3: BAG LABPSI */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-0.5 h-3 bg-slate-900 dark:bg-white -mt-3"></div>
                    <NodeBox title="BAG LABPSI" isBagian className="w-full" />
                    <NodeBox title="URMIN" isUrmin className="w-20" />
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-[#27272a]">
                      <NodeBox title="SUBBAG BANGMATTES" isSubbag />
                      <NodeBox title="SUBBAG ARTA" isSubbag />
                      <NodeBox title="SUBBAG LITPSI" isSubbag />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Info Detail Ketika Node Diklik */}
        {selectedNodeInfo && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#27272a]">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272a] text-slate-800 dark:text-slate-200">
                  {selectedNodeInfo.title}
                </span>
                <button
                  onClick={() => setSelectedNodeInfo(null)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold px-1.5 py-0.5 rounded"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedNodeInfo.fullName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedNodeInfo.desc}
              </p>
              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedNodeInfo(null)}
                  className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-2xs hover:bg-slate-800 dark:hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Navigasi Bawah Lembar Sebelumnya / Selanjutnya */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121214] p-3 rounded-xl border border-slate-200 dark:border-[#27272a] shadow-2xs text-xs">
        <button
          onClick={() => setActiveSheet((prev) => Math.max(1, prev - 1))}
          disabled={activeSheet === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#27272a] hover:bg-slate-50 dark:hover:bg-[#18181b] disabled:opacity-40 transition-colors font-semibold"
        >
          <ChevronLeft size={14} />
          <span>Lembar Sebelumnya</span>
        </button>

        <span className="text-slate-500 dark:text-slate-400 font-mono">
          Lembar <strong>{activeSheet}</strong> dari <strong>6</strong> Lampiran Perkap
        </span>

        <button
          onClick={() => setActiveSheet((prev) => Math.min(6, prev + 1))}
          disabled={activeSheet === 6}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#27272a] hover:bg-slate-50 dark:hover:bg-[#18181b] disabled:opacity-40 transition-colors font-semibold"
        >
          <span>Lembar Berikutnya</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
