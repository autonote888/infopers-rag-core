"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  User,
  ArrowUp,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Database,
  ShieldCheck,
  Settings2,
  Trash2,
  FileDown,
  ChevronDown,
  Brain,
  Mic,
  AudioWaveform,
  Sliders,
  Share2,
  Sun,
  Moon,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useOllama } from "@/context/OllamaContext";
import { useTheme } from "@/context/ThemeContext";

interface DatabaseRecord {
  nip_nrp: string;
  nama: string;
  pangkat: string;
  satker: string;
  keahlian: string;
  sertifikasi: string;
  jabatan_jf: string;
  jenis_personel?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  engine?: string;
  records?: DatabaseRecord[];
  modelUsed?: string;
}

// Fungsi pembersih format markdown agar teks kedinasan resmi tidak memuat tanda bintang (**), pagar (###), atau penanda aneh
export function cleanMarkdownText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\*\*(.*?)\*\*/g, "$1") // Hapus tanda asterik ganda (**teks**)
    .replace(/\*(.*?)\*/g, "$1")     // Hapus tanda asterik tunggal (*teks*)
    .replace(/^#{1,6}\s+/gm, "")     // Hapus penanda heading markdown
    .replace(/`{1,3}/g, "")         // Hapus tanda backtick
    .trim();
}

interface OllamaAiViewProps {
  initialQuery?: string;
  onResetToNewChat?: () => void;
  onEnterWebsite?: () => void;
}

export default function OllamaAiView({
  initialQuery = "",
  onResetToNewChat,
  onEnterWebsite,
}: OllamaAiViewProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const {
    selectedModel,
    selectedMode,
    answerStyle,
    ollamaHost,
    statusData,
    openSettings,
    deepThinking,
    toggleDeepThinking,
    chatSessions,
    currentSessionId,
    saveCurrentSession,
    createNewChat,
  } = useOllama();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi dengan sesi obrolan yang dipilih di sidebar
  useEffect(() => {
    if (currentSessionId) {
      const active = chatSessions.find((s) => s.id === currentSessionId);
      if (active && active.messages && active.messages.length > 0) {
        setMessages(active.messages);
        return;
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Handle click outside plus menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuery("");
    setShowPlusMenu(false);
    setLoading(true);

    // Prompt dinas SSDM disesuaikan dengan status deepThinking
    let customPrompt = "Anda adalah Asisten Kecerdasan Buatan Resmi Staf Sumber Daya Manusia (SSDM) Polri (ASISTEN TRIBRATA).";
    if (deepThinking) {
      customPrompt += " [MODE BERPIKIR MENDALAM AKTIF]: Analisis masalah dari sudut pandang regulasi kepolisian, data riil personel SIPP, dan berikan pertimbangan strategis bertingkat.";
    }
    if (answerStyle === "nota_dinas") {
      customPrompt += " Jawablah dengan format NOTA DINAS RESMI KEPOLISIAN yang memuat: 1. Dasar Rujukan, 2. Fakta Personel Terverifikasi, 3. Rekomendasi Biro.";
    } else if (answerStyle === "ringkasan") {
      customPrompt += " Jawablah dengan format RINGKASAN EKSEKUTIF PIMPINAN padat bernomor.";
    }
    customPrompt += " Dilarang keras menggunakan tanda format asterik ganda (**), tanda pagar (###), atau format markdown aneh lainnya. Gunakan susunan kalimat bahasa Indonesia resmi kedinasan Polri yang rapi, tertib, dan bersih.";

    try {
      const res = await fetchWithAuth("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          query: q,
          mode: selectedMode,
          model: selectedModel,
          host: ollamaHost,
          system_prompt: customPrompt,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const aiMsg: ChatMessage = {
          id: "a_" + Date.now(),
          sender: "assistant",
          text: cleanMarkdownText(json.jawaban || "Tidak ada respon dari server."),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          engine: json.metadata?.engine || (statusData?.is_available ? `Ollama (${selectedModel})` : "PostgreSQL RAG"),
          records: json.metadata?.database_records || [],
          modelUsed: json.metadata?.model || selectedModel,
        };
        const finalMessages = [...newMessages, aiMsg];
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);
      } else {
        const errMsg: ChatMessage = {
          id: "err_" + Date.now(),
          sender: "assistant",
          text: "Maaf, terjadi kendala saat memproses kueri ke server SSDM. Silakan coba kembali.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages([...newMessages, errMsg]);
      }
    } catch {
      const netErrMsg: ChatMessage = {
        id: "net_err_" + Date.now(),
        sender: "assistant",
        text: "Gagal terhubung ke layanan backend SSDM. Pastikan backend aktif di port 8080.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...newMessages, netErrMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportText = () => {
    if (messages.length === 0) return;
    const content = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === "user" ? "PENGGUNA" : "ASISTEN AI SSDM (" + (m.modelUsed || selectedModel) + ")"}:\n${m.text}\n`
      )
      .join("\n----------------------------------------\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Transkrip_AI_SSDM_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // TAMPILAN 1: COVER BERSIH ALA CHATGPT (PERSIS SEPERTI GAMBAR USER)
  // =========================================================================
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center px-4 select-none transition-colors relative bg-white dark:bg-[#212121]">
        {/* Top Header: Hanya Pill Chat | Portal SSDM Mengambang Rapi di Atas */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center p-1 rounded-full bg-slate-100/90 dark:bg-[#2b2b2e] border border-slate-200/70 dark:border-[#38383c] shadow-2xs">
            <button
              type="button"
              className="px-4 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white shadow-2xs transition-all"
            >
              Chat
            </button>
            <button
              type="button"
              onClick={onEnterWebsite}
              className="px-3.5 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Buka Website Portal SSDM Polri"
            >
              <span>Portal SSDM</span>
            </button>
          </div>
        </div>

        {/* Indikator Hijau Titik Kanan Atas jika Ollama Aktif (Tanpa Bacaan) */}
        {statusData?.is_available && (
          <div className="absolute top-6 right-6 z-20 flex items-center">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"
              title="Ollama Aktif"
            />
          </div>
        )}

        {/* Konten Tengah: PERSIS CENTER TENGAH ATAS-BAWAH & AGAK BESAR */}
        <div className="w-full max-w-3xl flex flex-col items-center px-4 -mt-6">
          {/* Judul: 'Saya siap kapan pun Anda siap.' (Lebih Besar & Elegan) */}
          <h1 className="text-3xl sm:text-4xl font-medium text-slate-800 dark:text-slate-100 tracking-tight text-center mb-8">
            Saya siap kapan pun Anda siap.
          </h1>

          {/* Kotak Input Pill: AGAK BESAR & MEWAH */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="w-full relative shadow-xs"
          >
            <div className="flex items-center w-full px-5 py-3.5 rounded-full border border-slate-200/90 dark:border-[#3a3a3e] bg-white dark:bg-[#2b2b2e] hover:border-slate-300 dark:hover:border-slate-500 focus-within:border-slate-400 dark:focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
              {/* Tombol Plus (+) */}
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPlusMenu((prev) => !prev)}
                  className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors shrink-0 mr-2 cursor-pointer"
                  title="Opsi Tambahan"
                >
                  <Plus size={20} strokeWidth={2} />
                </button>

                {showPlusMenu && (
                  <div className="absolute bottom-full mb-3 left-0 w-64 bg-white dark:bg-[#1a1a1c] border border-slate-200 dark:border-[#333] rounded-2xl shadow-xl p-2.5 z-30 text-left text-xs space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        openSettings();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#262629] text-slate-700 dark:text-slate-200 font-medium transition-colors"
                    >
                      <Settings2 size={15} />
                      <span>Pengaturan Model & Akses AI</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-[#262629] my-1" />
                    <div className="px-2.5 py-1 text-[11px] text-slate-400 font-mono">
                      Model: {selectedModel}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Teks Lebih Besar */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tanyakan apa saja"
                className="flex-1 bg-transparent text-base sm:text-lg font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden px-2"
                autoFocus
              />

              {/* Sisi Kanan: Berpikir, Mic, Tombol Audio Biru */}
              <div className="flex items-center gap-2.5 shrink-0 ml-1">
                {/* Berpikir */}
                <button
                  type="button"
                  onClick={toggleDeepThinking}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm transition-colors cursor-pointer ${
                    deepThinking
                      ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="Aktifkan Mode Penalaran Berpikir"
                >
                  <Brain size={17} strokeWidth={1.5} />
                  <span className="font-normal text-xs sm:text-sm hidden sm:inline">Berpikir</span>
                </button>

                {/* Mic */}
                <button
                  type="button"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Input Suara"
                >
                  <Mic size={19} strokeWidth={1.75} />
                </button>

                {/* Tombol Audio / Kirim Bulat Biru */}
                <button
                  type="submit"
                  disabled={!query.trim() && loading}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    query.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-[#2563eb] text-white hover:bg-blue-700 shadow-xs"
                  }`}
                  title={query.trim() ? "Kirim Pesan" : "Mode Suara"}
                >
                  {query.trim() ? (
                    <ArrowUp size={18} strokeWidth={2.5} />
                  ) : (
                    <AudioWaveform size={17} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN 2: STREAM PERCAKAPAN AKTIF ALA CHATGPT
  // =========================================================================
  return (
    <div className="h-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#212121]">
      {/* Top Bar Ringkas Sesi Chat Aktif */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-[#2f2f2f] bg-white/80 dark:bg-[#212121]/80 backdrop-blur-xs flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-2">
          {/* Top Pill Switcher: Chat | Portal SSDM */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-100/90 dark:bg-[#2b2b2e] border border-slate-200/70 dark:border-[#38383c]">
            <button
              type="button"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white shadow-2xs"
            >
              Chat
            </button>
            <button
              type="button"
              onClick={onEnterWebsite}
              className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Buka Website Portal SSDM Polri"
            >
              Portal SSDM
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indikator Hijau Titik jika Ollama Aktif (Tanpa Bacaan) */}
          {statusData?.is_available && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse mr-1"
              title="Ollama Aktif"
            />
          )}

          {/* Theme Toggle di Top Bar Percakapan */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title={isDark ? "Beralih ke Template Cerah" : "Beralih ke Template Gelap"}
          >
            {isDark ? <Sun size={17} className="text-amber-400 fill-amber-400" /> : <Moon size={17} className="text-indigo-600 fill-indigo-600" />}
          </button>

          <button
            type="button"
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="Ekspor Seluruh Percakapan ke TXT"
          >
            <FileDown size={15} />
            <span className="hidden sm:inline">Ekspor</span>
          </button>
          <button
            type="button"
            onClick={() => createNewChat()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="Buka Obrolan Baru"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Obrolan Baru</span>
          </button>
        </div>
      </div>

      {/* Area Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 text-sm font-bold shadow-md">
                  <Bot size={20} />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-3xl p-5 text-base sm:text-[17px] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#f0f2f5] dark:bg-[#2b2b2b] text-slate-900 dark:text-white font-medium shadow-xs"
                    : "bg-white dark:bg-[#18181b] border-2 border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-white shadow-sm space-y-3.5"
                }`}
              >
                {/* Isi Narasi Bersih Tanpa Asterik/Penanda Aneh */}
                <div className="whitespace-pre-line text-base sm:text-[17px] leading-relaxed font-normal">
                  {cleanMarkdownText(msg.text)}
                </div>

                {/* Tabel Fakta Basis Data jika tersedia */}
                {msg.records && msg.records.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-[#27272a] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Database size={13} />
                      <span>Fakta Terverifikasi dari Basis Data Personel ({msg.records.length} Entri):</span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#27272a]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-[#18181b] text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-[#27272a]">
                          <tr>
                            <th className="py-2 px-3">NRP/NIP</th>
                            <th className="py-2 px-3">Nama</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Pangkat/Gol</th>
                            <th className="py-2 px-3">Satker</th>
                            <th className="py-2 px-3">Keahlian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                          {msg.records.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#18181b]/50">
                              <td className="py-2 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{r.nip_nrp}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.nama}</td>
                              <td className="py-2 px-3">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                  r.jenis_personel === "PPPK"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                    : r.jenis_personel === "ASN"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                    : "bg-slate-100 dark:bg-[#27272a] text-slate-700 dark:text-slate-300"
                                }`}>
                                  {r.jenis_personel || "POLRI"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{r.pangkat}</td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{r.satker}</td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{r.keahlian || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Pesan Assistant */}
                {msg.sender === "assistant" && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-[#27272a]">
                    <span>{msg.engine}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedId === msg.id ? "Disalin" : "Salin"}</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#333] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 text-xs font-bold">
                <Bot size={16} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shadow-2xs">
                <RefreshCw size={14} className="animate-spin text-slate-700 dark:text-slate-300" />
                <span>Menganalisis kueri melalui mesin AI ({selectedModel})...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar Melayang Bawah Ala ChatGPT (Ukuran Diperbesar & Lebih Nyaman) */}
      <div className="p-4 border-t border-slate-100 dark:border-[#2f2f2f] bg-white dark:bg-[#212121] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center px-5 py-3.5 rounded-3xl border-2 border-slate-300 dark:border-[#383838] bg-[#f8f9fa] dark:bg-[#2a2a2a] focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all relative shadow-md"
        >
          {/* Tombol Plus (+) */}
          <div className="relative" ref={plusMenuRef}>
            <button
              type="button"
              onClick={() => setShowPlusMenu((prev) => !prev)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#3d3d3d] transition-colors mr-2 shrink-0"
              title="Menu Akses Ollama"
            >
              <Plus size={20} />
            </button>

            {showPlusMenu && (
              <div className="absolute bottom-full mb-3 left-0 w-72 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-2xl shadow-2xl p-3 z-30 text-left text-sm space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Menu Akses Ollama
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    openSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
                >
                  <Settings2 size={16} className="text-amber-500" />
                  <span>Konfigurasi Server &amp; Model</span>
                </button>
                <button
                  type="button"
                  onClick={() => createNewChat()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Mulai Obrolan Baru</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Tanyakan apa saja ke AI (${selectedModel})...`}
            className="flex-1 bg-transparent text-base sm:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden px-2"
          />

          <button
            type="submit"
            disabled={!query.trim() || loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ml-2 ${
              query.trim() && !loading
                ? "bg-[#2970ff] text-white shadow-md hover:opacity-90"
                : "bg-slate-300 dark:bg-[#3d3d3d] text-slate-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
