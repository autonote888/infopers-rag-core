"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  client_ip: string;
  action: string;
  details: string;
}

interface LogApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogApiModal({ isOpen, onClose }: LogApiModalProps) {
  const [activeTab, setActiveTab] = useState<"logs" | "swagger">("logs");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "ERROR">("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8085/api/system/logs");
      if (res.ok) {
        const data = await res.json();
        if (data && data.data) {
          setLogs(data.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat log sistem:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "SUCCESS" && item.status >= 200 && item.status < 300) ||
      (statusFilter === "ERROR" && item.status >= 400);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              API
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Pusat Sistem: Log Pengiriman Data & Dokumentasi Swagger
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Audit Trail Transaksi Live & Spesifikasi REST API SSDM Polri Presisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher Pills */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/70 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Log Pengiriman Data
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("swagger")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "swagger"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Swagger API Docs
              </button>
            </div>

            {/* Tombol Tutup (✕) */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-sm font-bold ml-1"
              title="Tutup Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: LOG PENGIRIMAN DATA */}
        {activeTab === "logs" && (
          <div className="flex-1 flex flex-col min-h-0 p-5 space-y-4">
            {/* Toolbar Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari endpoint, aksi, atau keterangan..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px]">
                  {(["ALL", "SUCCESS", "ERROR"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        statusFilter === st
                          ? "bg-white dark:bg-zinc-800 font-bold text-blue-600 dark:text-blue-400 shadow-2xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {st === "ALL" ? "Semua" : st === "SUCCESS" ? "200 OK" : "Error"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream
                </span>

                <button
                  type="button"
                  onClick={fetchLogs}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {loading ? "Memuat..." : "Segarkan"}
                </button>
              </div>
            </div>

            {/* Tabel Log Pengiriman Data */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-slate-400 uppercase font-bold sticky top-0 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3.5">Waktu</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3">Endpoint URL</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Aktivitas / Aksi</th>
                    <th className="py-2.5 px-3.5">Keterangan Transaksi</th>
                    <th className="py-2.5 px-3 text-right">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                        Tidak ada catatan log sistem yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isSuccess = log.status >= 200 && log.status < 300;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                log.method === "POST"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : log.method === "PUT"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : log.method === "DELETE"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              }`}
                            >
                              {log.method}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {log.path}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                isSuccess
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {log.status} {isSuccess ? "OK" : "ERR"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 min-w-[260px]">
                            {log.details}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                            {log.duration_ms} ms
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: SWAGGER & DOKUMENTASI API */}
        {activeTab === "swagger" && (
          <div className="flex-1 flex flex-col min-h-0 p-5 space-y-4">
            {/* Banner Akses Swagger Langsung */}
            <div className="px-5 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Swagger UI Server Aktif (Port 8085)
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Endpoint spesifikasi OpenAPI 3.0: <code>http://localhost:8085/api/docs/openapi.json</code>
                </div>
              </div>

              <a
                href="http://localhost:8085/swagger"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <span>Buka Swagger UI di Tab Baru</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>

            {/* Embedded Iframe Swagger UI */}
            <div className="flex-1 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white">
              <iframe
                src="http://localhost:8085/swagger"
                title="Swagger UI Dokumentasi API"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
