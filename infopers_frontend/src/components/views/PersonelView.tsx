"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  FileText,
  Printer,
  UploadCloud,
  Eye,
  X,
  FileCheck,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export default function PersonelView({ initialTab = "daftar" }: { initialTab?: "daftar" | "cetak_rh" | "validasi_ocr" }) {
  const [activeTab, setActiveTab] = useState<"daftar" | "cetak_rh" | "validasi_ocr">(initialTab);
  const [personelList, setPersonelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedNip, setSelectedNip] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  // OCR Demo State
  const [ocrFile, setOcrFile] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const fetchPersonel = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/personel?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setPersonelList(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (nip: string) => {
    setSelectedNip(nip);
    try {
      const res = await fetchWithAuth(`/personel/${nip}`);
      if (res.ok) {
        const json = await res.json();
        setDetailData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPersonel();
  }, []);

  const handleSimulateOCR = () => {
    setOcrProcessing(true);
    setOcrResult(null);
    setTimeout(() => {
      setOcrProcessing(false);
      setOcrResult({
        nama_dokumen: "SK_JABATAN_FUNGSIONAL_2026.pdf",
        jenis: "SURAT KEPUTUSAN KAPOLRI (KEP/JF)",
        nomor_sk: "KEP/921/VIII/KEP./2026",
        nip_terdeteksi: selectedNip || "04031518",
        status_ocr: "SUKSES (Tingkat Akurasi 99.4%)",
        sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status_db: "TERVERIFIKASI & TERSINKRONISASI DI BASIS DATA",
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Data Induk Personel &amp; Administrasi Berkas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengelolaan 483.355 data personel, penerbitan format resmi Daftar Riwayat Hidup (DRH), dan verifikasi berkas dinas.
          </p>
        </div>

        <div className="flex p-1 rounded-lg bg-slate-200/70 dark:bg-[#18181b] border border-slate-300/60 dark:border-[#27272a] text-xs">
          <button
            onClick={() => setActiveTab("daftar")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "daftar"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Daftar Personel
          </button>
          <button
            onClick={() => {
              setActiveTab("cetak_rh");
              if (!selectedNip && personelList.length > 0) openDetail(personelList[0].nip_nrp);
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "cetak_rh"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Daftar Riwayat Hidup (DRH)
          </button>
          <button
            onClick={() => setActiveTab("validasi_ocr")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === "validasi_ocr"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Verifikasi Berkas Digital
          </button>
        </div>
      </div>

      {/* TAB 1: DAFTAR PERSONEL */}
      {activeTab === "daftar" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] overflow-hidden shadow-2xs w-full">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-200 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b] flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPersonel(search)}
                placeholder="Cari Nama Personel atau NIP/NRP..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-[#27272a] bg-white dark:bg-[#121214] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-800 dark:focus:border-white"
              />
            </div>
            <button
              onClick={() => fetchPersonel(search)}
              className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-2xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Cari Data
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#18181b] uppercase text-[10px] tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#27272a]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">NRP / NIP</th>
                  <th className="py-3.5 px-4 font-semibold">Nama Lengkap</th>
                  <th className="py-3.5 px-4 font-semibold">Pangkat</th>
                  <th className="py-3.5 px-4 font-semibold">Satuan Kerja &amp; Polda</th>
                  <th className="py-3.5 px-4 font-semibold">Jabatan Fungsional</th>
                  <th className="py-3.5 px-4 font-semibold">Tunkin Bln Ini</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Memuat data personel dari database...
                    </td>
                  </tr>
                ) : personelList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada personel ditemukan.
                    </td>
                  </tr>
                ) : (
                  personelList.map((p, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors cursor-pointer"
                      onClick={() => openDetail(p.nip_nrp)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.nip_nrp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.nama}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-[#3f3f46]">
                            {p.pangkat}
                          </span>
                          {p.jenis_personel === "PPPK" && (
                            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              PPPK
                            </span>
                          )}
                          {p.jenis_personel === "ASN" && (
                            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              PNS/ASN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{p.satker}</div>
                        <div className="text-[10px] text-slate-400">{p.polda}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{p.jabatan_jf}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        Rp {Number(p.tunkin || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(p.nip_nrp);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#27272a] hover:bg-slate-200 dark:hover:bg-[#3f3f46] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-[#3f3f46] inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CETAK RIWAYAT HIDUP */}
      {activeTab === "cetak_rh" && (
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] shadow-2xs">
            <div className="flex items-center gap-3">
              <FileText className="text-slate-700 dark:text-slate-300" size={18} />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Pratinjau Daftar Riwayat Hidup (RH Resmi Format Polri)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Personel: <strong>{detailData?.utama?.nama || "Pilih Personel"}</strong> (NRP: {detailData?.utama?.nip_nrp || "-"})
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 shadow-2xs"
            >
              <Printer size={13} />
              Cetak / PDF
            </button>
          </div>

          <div className="bg-white text-slate-900 p-8 rounded-xl shadow-sm max-w-4xl mx-auto font-serif text-xs border border-slate-200">
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest">
                KEPOLISIAN NEGARA REPUBLIK INDONESIA
              </h3>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                STAF SUMBER DAYA MANUSIA
              </h4>
              <div className="w-16 h-0.5 bg-black mx-auto my-1"></div>
              <h2 className="font-bold text-sm uppercase mt-2 underline">
                DAFTAR RIWAYAT HIDUP
              </h2>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="font-bold uppercase text-[11px] border-b pb-0.5">I. BIODATA</h4>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="col-span-2 font-bold">{detailData?.utama?.nama || "ROSVIAN SETIADI"}</span>
                <span className="text-slate-500">Pangkat / NRP:</span>
                <span className="col-span-2">{detailData?.utama?.pangkat || "BRIPDA"} / {detailData?.utama?.nip_nrp || "04031518"}</span>
                <span className="text-slate-500">Kesatuan:</span>
                <span className="col-span-2">{detailData?.utama?.nama_satker || "POLDA METRO JAYA"}</span>
                <span className="text-slate-500">Jabatan JF:</span>
                <span className="col-span-2">{detailData?.jabatan_fungsional?.nama_jabatan_jf || "Fungsional Kepolisian"}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="font-bold uppercase text-[11px] border-b pb-0.5">II. KOMPETENSI &amp; DIKLAT</h4>
              <p>Sertifikasi: <strong>{detailData?.diklat_kompetensi?.nama_sertifikasi || "Sertifikasi Pusdik Reskrim"}</strong></p>
              <p className="text-slate-600 italic">{detailData?.diklat_kompetensi?.ringkasan_keahlian_rag || "Keahlian operasional dinas kepolisian."}</p>
            </div>

            <div className="flex justify-between items-end pt-6 text-[11px]">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">KEPALA BIRO SDM</p>
                <div className="h-12"></div>
                <p className="font-bold underline">KOMBES POL. DRS. SURYANTO, M.Si.</p>
              </div>
              <div className="text-right">
                <p>Jakarta, September 2026</p>
                <p className="font-bold">Personel Ybs,</p>
                <div className="h-12"></div>
                <p className="font-bold underline">{detailData?.utama?.nama || "ROSVIAN SETIADI"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIKASI BERKAS DIGITAL */}
      {activeTab === "validasi_ocr" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verifikasi Salinan Dokumen Keputusan (SK)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unggah berkas salinan SK untuk pemeriksaan nomor registrasi keputusan dan validasi data secara otomatis.
            </p>

            <div
              onClick={() => setOcrFile("SK_JABATAN_FUNGSIONAL_2026.pdf")}
              className="border-2 border-dashed border-slate-200 dark:border-[#27272a] hover:border-slate-400 dark:hover:border-slate-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-[#18181b] transition-colors"
            >
              <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Dokumen Salinan SK (PDF / Gambar)</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Format didukung: PDF, PNG, JPG</p>
              {ocrFile && (
                <div className="mt-3 inline-block px-2.5 py-1 rounded bg-slate-200 dark:bg-[#27272a] text-slate-800 dark:text-slate-200 text-[10px] font-mono">
                  {ocrFile}
                </div>
              )}
            </div>

            <button
              onClick={handleSimulateOCR}
              disabled={ocrProcessing}
              className="w-full py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              {ocrProcessing ? "Sedang Memeriksa Dokumen..." : "Periksa Validitas Berkas"}
            </button>
          </div>

          <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hasil Penelusuran Dokumen di Basis Data</h3>
            {ocrResult ? (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#27272a] font-medium">
                  {ocrResult.status_db}
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] font-mono text-[11px]">
                  <span className="text-slate-400 block text-[9px] font-sans">NOMOR KEPUTUSAN TERDETEKSI:</span>
                  <strong className="text-slate-900 dark:text-white">{ocrResult.nomor_sk}</strong>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-[#27272a] font-mono text-[11px] break-all">
                  <span className="text-slate-400 block text-[9px] font-sans">KODE INTEGRITAS BERKAS:</span>
                  <span className="text-slate-700 dark:text-slate-300">{ocrResult.sha256_hash}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada dokumen yang diperiksa.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNip && detailData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedNip(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18181b]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#27272a]">
              <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-base">
                {detailData.utama?.nama?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{detailData.utama?.nama}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {detailData.utama?.pangkat} • NRP: {detailData.utama?.nip_nrp} • {detailData.utama?.nama_satker}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 dark:bg-[#18181b] p-3 rounded-lg border border-slate-100 dark:border-[#27272a] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Kepegawaian</span>
                <p>TMT Dinas: <strong>{detailData.detail?.tmt_dinas || "-"}</strong></p>
                <p>Sisa Cuti: <strong>{detailData.detail?.sisa_cuti ?? 12} Hari</strong></p>
              </div>
              <div className="bg-slate-50 dark:bg-[#18181b] p-3 rounded-lg border border-slate-100 dark:border-[#27272a] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jabatan Fungsional</span>
                <p>{detailData.jabatan_fungsional?.nama_jabatan_jf || "Fungsional"}</p>
                <p className="font-mono text-slate-600 dark:text-slate-400">Angka Kredit: {detailData.jabatan_fungsional?.angka_kredit || "125"} AK</p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg flex justify-between items-center text-xs">
              <span>Realisasi Tunkin Bulan Ini:</span>
              <span className="font-mono font-bold">
                Rp {Number(detailData.utama?.total_tunkin_yang_diterima || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
