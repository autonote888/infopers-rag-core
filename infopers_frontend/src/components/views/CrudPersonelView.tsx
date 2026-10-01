"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import LogApiModal from "@/components/LogApiModal";
import { TopLaserBar, CyberSkeletonTable } from "@/components/CoolTransitionLoader";

interface PersonelItem {
  nip_nrp: string;
  nama: string;
  pangkat: string;
  jenis_personel: string;
  satker: string;
  polda: string;
  tunkin: number;
  jabatan_jf: string;
  sertifikasi?: string;
}

interface CrudPersonelViewProps {
  onSwitchToRag?: () => void;
  onBackToMenu?: () => void;
  onLogout?: () => void;
}

export default function CrudPersonelView({
  onSwitchToRag,
  onBackToMenu,
  onLogout,
}: CrudPersonelViewProps) {
  const { isDark, toggleTheme } = useTheme();
  const [list, setList] = useState<PersonelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jpFilter, setJpFilter] = useState("ALL");
  const [totalCount, setTotalCount] = useState(0);

  // Log & Swagger API Modal
  const [isLogApiOpen, setIsLogApiOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nip_nrp: "",
    nama: "",
    pangkat: "BRIPDA",
    jenis_personel: "POLRI",
    nama_satker: "BARESKRIM POLRI",
    nama_polda: "MABES POLRI",
    kode_satker: "MABES-01",
    nama_jabatan_jf: "Penyidik Kepolisian",
    jenjang_jf: "Pertama",
    kelas_jabatan_jf: 11,
    angka_kredit: 100,
    gapok: 2500000,
    total_tunkin: 2900000,
    total_gaji: 4500000,
    total_penghasilan: 7400000,
    sisa_cuti: 12,
    status_kawin: "TK",
  });

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async (queryStr = search) => {
    setLoading(true);
    try {
      const q = encodeURIComponent(queryStr.trim());
      const res = await fetchWithAuth(`/personel?q=${q}`);
      if (res.ok) {
        const json = await res.json();
        setList(json.data || []);
        setTotalCount(json.data ? json.data.length : 0);
      }
    } catch {
      showToast("error", "Gagal memuat data personel dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      nip_nrp: "",
      nama: "",
      pangkat: "BRIPDA",
      jenis_personel: "POLRI",
      nama_satker: "BARESKRIM POLRI",
      nama_polda: "MABES POLRI",
      kode_satker: "MABES-01",
      nama_jabatan_jf: "Penyidik Fungsional",
      jenjang_jf: "Pertama",
      kelas_jabatan_jf: 10,
      angka_kredit: 100,
      gapok: 2500000,
      total_tunkin: 2900000,
      total_gaji: 4500000,
      total_penghasilan: 7400000,
      sisa_cuti: 12,
      status_kawin: "TK",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal & Pre-fill
  const handleOpenEdit = async (item: PersonelItem) => {
    setIsEditMode(true);
    setFormData({
      nip_nrp: item.nip_nrp,
      nama: item.nama,
      pangkat: item.pangkat,
      jenis_personel: item.jenis_personel || "POLRI",
      nama_satker: item.satker,
      nama_polda: item.polda || "MABES POLRI",
      kode_satker: "MABES-01",
      nama_jabatan_jf: item.jabatan_jf || "Fungsional Kepolisian",
      jenjang_jf: "Muda",
      kelas_jabatan_jf: 11,
      angka_kredit: 150,
      gapok: 3500000,
      total_tunkin: item.tunkin || 3900000,
      total_gaji: 5000000,
      total_penghasilan: 8900000,
      sisa_cuti: 12,
      status_kawin: "Kawin",
    });
    setIsModalOpen(true);

    // Fetch detail from database to get full figures if available
    try {
      const res = await fetchWithAuth(`/personel/${item.nip_nrp}`);
      if (res.ok) {
        const json = await res.json();
        const d = json.data;
        if (d) {
          const u = d.utama || {};
          const jf = d.jabatan_fungsional || {};
          const det = d.detail || {};
          setFormData((prev) => ({
            ...prev,
            nama: u.nama || prev.nama,
            pangkat: u.pangkat || prev.pangkat,
            jenis_personel: u.jenis_personel || prev.jenis_personel,
            nama_satker: u.nama_satker || prev.nama_satker,
            nama_polda: u.nama_polda || prev.nama_polda,
            kode_satker: u.kode_satker || prev.kode_satker,
            gapok: Number(u.gapok) || prev.gapok,
            total_tunkin: Number(u.total_tunkin_yang_diterima) || prev.total_tunkin,
            total_gaji: Number(u.total_gaji_keseluruhan) || prev.total_gaji,
            total_penghasilan: Number(u.jumlah_total_penghasilan) || prev.total_penghasilan,
            nama_jabatan_jf: jf.nama_jabatan_jf || prev.nama_jabatan_jf,
            jenjang_jf: jf.jenjang_jf || prev.jenjang_jf,
            kelas_jabatan_jf: Number(jf.kelas_jabatan_jf) || prev.kelas_jabatan_jf,
            angka_kredit: Number(jf.angka_kredit) || prev.angka_kredit,
            sisa_cuti: Number(det.sisa_cuti) || prev.sisa_cuti,
            status_kawin: det.status_kawin || prev.status_kawin,
          }));
        }
      }
    } catch {
      // fallback to pre-fill
    }
  };

  // Submit Save or Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nip_nrp.trim() || !formData.nama.trim()) {
      showToast("error", "NRP/NIP dan Nama tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        // PUT /api/personel/{nip_nrp}
        const res = await fetchWithAuth(`/personel/${formData.nip_nrp}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        const resJson = await res.json();
        if (res.ok) {
          showToast("success", `Data dan Jabatan ${formData.nama} berhasil diperbarui di database!`);
          setIsModalOpen(false);
          loadData();
        } else {
          showToast("error", resJson.message || "Gagal memperbarui data.");
        }
      } else {
        // POST /api/personel
        const res = await fetchWithAuth(`/personel`, {
          method: "POST",
          body: JSON.stringify(formData),
        });
        const resJson = await res.json();
        if (res.ok) {
          showToast("success", `Personel baru ${formData.nama} (${formData.nip_nrp}) berhasil ditambahkan ke database!`);
          setIsModalOpen(false);
          loadData();
        } else {
          showToast("error", resJson.message || "Gagal menambahkan data.");
        }
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Record
  const handleDelete = async (nip: string, nama: string) => {
    const ok = window.confirm(`Apakah Anda yakin ingin menghapus data personel:\n${nama} (NRP/NIP: ${nip}) dari database?`);
    if (!ok) return;

    try {
      const res = await fetchWithAuth(`/personel/${nip}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("success", `Data personel ${nama} (${nip}) berhasil dihapus.`);
        loadData();
      } else {
        const json = await res.json();
        showToast("error", json.message || "Gagal menghapus data.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat menghapus data.");
    }
  };

  const filteredList = list.filter((item) => {
    if (jpFilter === "ALL") return true;
    return (item.jenis_personel || "POLRI").toUpperCase() === jpFilter;
  });

  return (
    <div className="space-y-6 animate-page-enter">
      <TopLaserBar isVisible={loading || submitting} />
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
            toastMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header Card: RINCIAN DATA PERSONEL */}
      <div className="bg-white dark:bg-[#18181b] px-6 py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/SSDM_Polri.png"
            alt="Logo SSDM"
            className="w-9 h-9 object-contain drop-shadow-xs"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide uppercase">
            RINCIAN DATA PERSONEL
          </h1>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mode Cerah / Gelap */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
            title={isDark ? "Beralih ke Mode Cerah" : "Beralih ke Mode Gelap"}
          >
            {isDark ? "Mode Cerah" : "Mode Gelap"}
          </button>

          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
              title="Kembali ke Pilihan Menu (CRUD / RAG)"
            >
              Pilihan Modul
            </button>
          )}

          {onSwitchToRag && (
            <button
              type="button"
              onClick={onSwitchToRag}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Buka RAG (AI)</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Tambah Personel</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
            >
              Keluar
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari NRP, Nama, Satker, atau Pangkat..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* JP Filter Buttons */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {["ALL", "POLRI", "ASN", "PPPK"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setJpFilter(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                jpFilter === item
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              {item === "ALL" ? "Semua Personel" : item}
            </button>
          ))}
        </div>
      </div>

      {/* Live Data Table */}
      <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Menampilkan hasil terverifikasi ({filteredList.length} dari {totalCount} entri termuat)</span>
          {loading && <span className="text-blue-500 font-semibold animate-pulse">Menghubungkan ke database...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">NRP / NIP</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Pangkat</th>
                <th className="py-3 px-4">Korps</th>
                <th className="py-3 px-4">Satker / Polda</th>
                <th className="py-3 px-4">Jabatan Fungsional</th>
                <th className="py-3 px-4">Tunkin (Rp)</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading && filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <CyberSkeletonTable rows={6} />
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data personel yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => (
                  <tr key={p.nip_nrp} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.nip_nrp}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {p.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {p.pangkat}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          p.jenis_personel === "PPPK"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            : p.jenis_personel === "ASN"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {p.jenis_personel || "POLRI"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{p.satker}</div>
                      <div className="text-[10px] text-slate-400">{p.polda}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.jabatan_jf || "Fungsional Kepolisian"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      Rp {Number(p.tunkin || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Ubah (Update) */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                          title="Ubah Data & Jabatan"
                        >
                          Ubah
                        </button>

                        {/* Tombol Hapus (Delete) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(p.nip_nrp, p.nama)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                          title="Hapus Data Personel"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / UBAH PERSONEL (CRUD LIVE DATABASE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEditMode ? "Ubah Data Personel & Jabatan" : "Tambah Personel Baru (Database PostgreSQL)"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data yang disimpan akan langsung terhubung ke basis data terpusat SSDM Polri.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NRP / NIP */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NRP / NIP *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditMode}
                    value={formData.nip_nrp}
                    onChange={(e) => setFormData({ ...formData, nip_nrp: e.target.value })}
                    placeholder="Contoh: 04031518 atau 19841121..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama lengkap beserta gelar..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Pangkat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pangkat
                  </label>
                  <input
                    type="text"
                    value={formData.pangkat}
                    onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
                    placeholder="KOMBES POL, AKBP, KOMPOL, BRIPKA, dll"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Jenis Personel */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Korps / Jenis Personel
                  </label>
                  <select
                    value={formData.jenis_personel}
                    onChange={(e) => setFormData({ ...formData, jenis_personel: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="POLRI">POLRI (Anggota Kepolisian)</option>
                    <option value="ASN">ASN / PNS Polri</option>
                    <option value="PPPK">PPPK Polri</option>
                  </select>
                </div>

                {/* Satuan Kerja */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Satuan Kerja (Satker)
                  </label>
                  <input
                    type="text"
                    value={formData.nama_satker}
                    onChange={(e) => setFormData({ ...formData, nama_satker: e.target.value })}
                    placeholder="BARESKRIM, SSDM, PUSKEU, POLDA, dll"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Polda Induk */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Polda Induk
                  </label>
                  <input
                    type="text"
                    value={formData.nama_polda}
                    onChange={(e) => setFormData({ ...formData, nama_polda: e.target.value })}
                    placeholder="MABES POLRI, POLDA METRO JAYA, dll"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Bagian Jabatan Fungsional (Sesuai Permintaan User: 'seperti jabatan') */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Data Jabatan & Formasi Fungsional
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Jabatan Fungsional
                    </label>
                    <input
                      type="text"
                      value={formData.nama_jabatan_jf}
                      onChange={(e) => setFormData({ ...formData, nama_jabatan_jf: e.target.value })}
                      placeholder="Penyelidik Siber, Auditor, Pengelola PBJ, dll"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kelas Jabatan (Grade)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={18}
                      value={formData.kelas_jabatan_jf}
                      onChange={(e) => setFormData({ ...formData, kelas_jabatan_jf: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian Keuangan & Kepegawaian */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Remunerasi & Kepegawaian
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gaji Pokok (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.gapok}
                      onChange={(e) => setFormData({ ...formData, gapok: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tunjangan Kinerja (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.total_tunkin}
                      onChange={(e) => setFormData({ ...formData, total_tunkin: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sisa Cuti (Hari)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={formData.sisa_cuti}
                      onChange={(e) => setFormData({ ...formData, sisa_cuti: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Menyimpan ke Database..." : isEditMode ? "Simpan Perubahan (Update)" : "Simpan Personel (Create)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
