"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Server,
  Cpu,
  RefreshCw,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  Sliders,
  FileText,
  AlertCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useOllama, AIMode, AnswerStyle } from "@/context/OllamaContext";

export default function OllamaControlModal() {
  const {
    statusData,
    isLoadingStatus,
    selectedModel,
    selectedMode,
    answerStyle,
    ollamaHost,
    isSettingsOpen,
    closeSettings,
    setSelectedModel,
    setSelectedMode,
    setAnswerStyle,
    setOllamaHost,
    checkStatus,
  } = useOllama();

  const [inputHost, setInputHost] = useState(ollamaHost);
  const [customModel, setCustomModel] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleTestConnection = async () => {
    setTestResult(null);
    setOllamaHost(inputHost);
    const ok = await checkStatus(inputHost);
    if (ok) {
      setTestResult("Berhasil terhubung ke Ollama!");
    } else {
      setTestResult("Gagal terhubung. Pastikan 'ollama serve' aktif.");
    }
    setTimeout(() => setTestResult(null), 3500);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const modelOptions = [
    {
      id: "llama3:8b",
      name: "Meta Llama 3 (8B)",
      desc: "Model Standar Utama SSDM Polri - Cepat, Akurat, dan Stabil",
      tag: "Rekomendasi SSDM",
    },
    {
      id: "qwen2.5:7b",
      name: "Alibaba Qwen 2.5 (7B)",
      desc: "Sangat Unggul dalam Bahasa Indonesia & Analisis Regulasi Kedinasan",
      tag: "Terbaik Bahasa ID",
    },
    {
      id: "mistral:7b",
      name: "Mistral Instruct (7B)",
      desc: "Performa Tinggi, Inferensi Cepat, Hemat Penggunaan RAM/VRAM",
      tag: "Ringan & Cepat",
    },
    {
      id: "deepseek-r1:7b",
      name: "DeepSeek R1 (7B)",
      desc: "Penalaran Rantai Logika Mendalam (Chain-of-Thought) untuk Kebijakan",
      tag: "Penalaran Mendalam",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#27272a] flex items-center justify-between bg-slate-50/50 dark:bg-[#18181b]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Menu Akses &amp; Konfigurasi Ollama AI SSDM
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pusat Kendali Inferensi Kecerdasan Buatan Terdesentralisasi
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272a] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Isi Modal Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Status Koneksi Realtime Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              statusData?.is_available
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  statusData?.is_available ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>
                    Status Mesin AI: {statusData?.is_available ? "Online (Ollama Aktif)" : "Offline (Fallback DB Aktif)"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-white/70 dark:bg-black/40">
                    Port 11434
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {statusData?.is_available
                    ? `Inferensi aktif pada host ${statusData.host}. Siap memproses data 483.355 personel.`
                    : "Layanan Ollama belum aktif. Sistem otomatis menggunakan pencarian cerdas basis data PostgreSQL."}
                </p>
              </div>
            </div>

            <button
              onClick={() => checkStatus()}
              disabled={isLoadingStatus}
              className="p-2 rounded-lg bg-white/80 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 transition-colors shrink-0 font-medium flex items-center gap-1.5 shadow-2xs"
              title="Periksa Ulang Sambungan"
            >
              <RefreshCw size={13} className={isLoadingStatus ? "animate-spin" : ""} />
              <span className="text-[11px]">Tes Ulang</span>
            </button>
          </div>

          {/* Konfigurasi Host / Server Ollama */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Server size={14} className="text-slate-500" />
              <span>Alamat Server Ollama (Host Endpoint)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputHost}
                onChange={(e) => setInputHost(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-50 dark:bg-[#18181b] text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:border-slate-500"
              />
              <button
                onClick={handleTestConnection}
                disabled={isLoadingStatus}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5"
              >
                {isLoadingStatus ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                <span>Simpan &amp; Uji</span>
              </button>
            </div>
            {testResult && (
              <p
                className={`text-[11px] font-medium ${
                  testResult.includes("Berhasil") ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {testResult}
              </p>
            )}
          </div>

          {/* Pilihan Model AI yang Digunakan */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu size={14} className="text-slate-500" />
                <span>Pilihan Model Kecerdasan Buatan (LLM)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Aktif: <strong className="text-slate-900 dark:text-white">{selectedModel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modelOptions.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-[#18181b] shadow-2xs"
                        : "border-slate-200 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#121214]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{m.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200/70 dark:bg-[#27272a] font-semibold text-slate-600 dark:text-slate-300">
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{m.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Input Model Kustom */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Atau ketik model kustom (misal: gemma2:9b, mistral-nemo)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#27272a] bg-slate-50 dark:bg-[#18181b] text-slate-900 dark:text-white text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (customModel.trim()) {
                    setSelectedModel(customModel.trim());
                    setCustomModel("");
                  }
                }}
                disabled={!customModel.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-[#27272a] hover:bg-slate-300 dark:hover:bg-[#38383e] font-semibold text-xs text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
              >
                Terapkan
              </button>
            </div>
          </div>

          {/* Mode Operasi & Format Gaya Jawaban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-[#27272a]">
            {/* Mode Operasi AI */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders size={14} className="text-slate-500" />
                <span>Mode Pemrosesan (Engine Mode)</span>
              </label>
              <div className="space-y-1.5">
                {[
                  { id: "rag_ollama", label: "RAG Presisi Basis Data (483.355 Personel)" },
                  { id: "regulasi_sotk", label: "Analisis Regulasi (Perkap 6/2017 & UU Polri)" },
                  { id: "pure_llm", label: "Penalaran Umum (Generative Bebas)" },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedMode === mode.id
                        ? "border-slate-800 dark:border-slate-300 bg-slate-50 dark:bg-[#18181b]"
                        : "border-slate-200 dark:border-[#27272a] hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="aimode"
                      value={mode.id}
                      checked={selectedMode === mode.id}
                      onChange={() => setSelectedMode(mode.id as AIMode)}
                      className="accent-slate-900 dark:accent-white"
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gaya Format Jawaban */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" />
                <span>Standar Format Jawaban</span>
              </label>
              <div className="space-y-1.5">
                {[
                  { id: "nota_dinas", label: "Format Nota Dinas Resmi SSDM" },
                  { id: "ringkasan", label: "Ringkasan Eksekutif Pimpinan (Poin Cepat)" },
                  { id: "bebas", label: "Format Bebas & Responsif" },
                ].map((style) => (
                  <label
                    key={style.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                      answerStyle === style.id
                        ? "border-slate-800 dark:border-slate-300 bg-slate-50 dark:bg-[#18181b]"
                        : "border-slate-200 dark:border-[#27272a] hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="answerstyle"
                      value={style.id}
                      checked={answerStyle === style.id}
                      onChange={() => setAnswerStyle(style.id as AnswerStyle)}
                      className="accent-slate-900 dark:accent-white"
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{style.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Panduan Perintah Terminal Cepat (Bila belum jalan) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#27272a]">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Terminal size={14} className="text-slate-500" />
              <span>Panduan Aktivasi Ollama di Terminal Windows (PowerShell)</span>
            </label>
            <div className="space-y-1.5 font-mono text-[11px]">
              {[
                { cmd: "ollama serve", desc: "Menjalankan service Ollama di latar belakang (Port 11434)" },
                { cmd: "ollama run llama3:8b", desc: "Menjalankan model Meta Llama 3 8B secara instan" },
                { cmd: "ollama run qwen2.5:7b", desc: "Menjalankan model Qwen 2.5 7B untuk Bahasa Indonesia" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-200 dark:bg-black/60 border border-slate-800"
                >
                  <div className="overflow-hidden">
                    <span className="text-emerald-400 font-bold">$ </span>
                    <span className="text-white font-semibold">{item.cmd}</span>
                    <span className="text-slate-400 text-[10px] ml-2 hidden sm:inline">({item.desc})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCmd(item.cmd)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
                    title="Salin Perintah"
                  >
                    {copiedCmd === item.cmd ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#27272a] bg-slate-50/50 dark:bg-[#18181b]/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Kerahasiaan data terjamin: Inferensi dijalankan 100% lokal tanpa kirim ke cloud pihak ketiga.</span>
          </div>
          <button
            onClick={closeSettings}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
