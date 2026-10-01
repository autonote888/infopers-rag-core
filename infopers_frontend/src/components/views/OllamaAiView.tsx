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
import { TopLaserBar } from "@/components/CoolTransitionLoader";

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
  user?: any;
  initialQuery?: string;
  onResetToNewChat?: () => void;
  onEnterWebsite?: () => void;
  onOpenCrud?: () => void;
  onBackToPortal?: () => void;
  onLogout?: () => void;
}

export default function OllamaAiView({
  user,
  initialQuery = "",
  onResetToNewChat,
  onEnterWebsite,
  onOpenCrud,
  onBackToPortal,
  onLogout,
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
      if (onResetToNewChat) {
        onResetToNewChat();
      }
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

    const qLower = q.toLowerCase().trim();

    // 1. Respon instan untuk kueri identitas personel yang sedang login
    if (qLower === "siapa saya" || qLower === "siapa aku" || qLower === "profil saya" || qLower === "data saya") {
      const uNama = user?.nama || "Super Administrator";
      const uPangkat = user?.pangkat || "Kombes Pol Presisi";
      const uNip = user?.nip_nrp || "admin.nasional";
      const uRole = user?.role_level || "Super Administrator SSDM";

      const replyText = `Berdasarkan sesi autentikasi resmi INFOPERS SSDM Presisi saat ini:\n\nNama: ${uNama}\nPangkat/Golongan: ${uPangkat}\nNRP / NIP: ${uNip}\nHak Akses: ${uRole}\nStatus Akun: Terverifikasi Aktif pada Basis Data Presisi SSDM Polri.\n\nAda analisis data personel, formasi jabatan fungsional, atau regulasi SIPP yang dapat saya bantu carikan?`;

      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        engine: "SSDM Identity Fast Engine",
        modelUsed: selectedModel,
      };
      setMessages([...newMessages, botMsg]);
      setLoading(false);
      return;
    }

    // 2. Respon instan untuk identitas asisten AI
    if (qLower === "siapa kamu" || qLower === "kamu siapa" || qLower === "siapa anda") {
      const replyText = `Saya adalah Asisten Kecerdasan Buatan Resmi Staf Sumber Daya Manusia (SSDM) Polri (ASISTEN TRIBRATA).\n\nSaya bertugas membantu Anda mencari data 483.355 personel Polri, peraturan kepolisian, informasi kenaikan pangkat, formasi jabatan fungsional, dan administrasi kepegawaian secara terintegrasi dan aman.`;

      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        engine: "SSDM Assistant Core System",
        modelUsed: selectedModel,
      };
      setMessages([...newMessages, botMsg]);
      setLoading(false);
      return;
    }

    // 3. Prompt dinas ringkas & efisien agar respons CPU Ollama super cepat (5-8 detik)
    let customPrompt = "Asisten Resmi SSDM Polri. Jawab secara ringkas, padat, resmi, dan akurat tanpa tanda bintang (**).";
    if (deepThinking) {
      customPrompt += " [MODE BERPIKIR MENDALAM AKTIF]: Uraikan pertimbangan regulasi dan rekomendasi kedinasan secara terstruktur.";
    }

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
      <div className="h-full flex flex-col justify-center items-center px-4 select-none transition-colors relative bg-white dark:bg-[#212121] animate-page-enter">
        <TopLaserBar isVisible={loading} />
        {/* Top Header: Pill Menu Modul | Chat RAG | CRUD Personel | Portal SSDM */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center p-1 rounded-full bg-slate-100/90 dark:bg-[#2b2b2e] border border-slate-200/70 dark:border-[#38383c] shadow-2xs">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="px-3 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
                title="Kembali ke Pilihan Menu Utama (CRUD / RAG)"
              >
                Pilihan Modul
              </button>
            )}
            <button
              type="button"
              className="px-4 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white shadow-2xs transition-all"
            >
              RAG / AI
            </button>
            {onOpenCrud && (
              <button
                type="button"
                onClick={onOpenCrud}
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                title="Buka Menu CRUD Personel & Jabatan"
              >
                CRUD Personel
              </button>
            )}
            <button
              type="button"
              onClick={onEnterWebsite}
              className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Buka Website Portal SSDM Polri"
            >
              <span>Portal SSDM</span>
            </button>
          </div>
        </div>

        {/* Indikator Hijau, Mode Cerah/Gelap & Tombol Keluar Kanan Atas */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          {/* Tombol Tema Cerah & Gelap */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-[#38383c] text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-[#2b2b2e] bg-white dark:bg-[#1e1e20] transition-colors cursor-pointer shadow-xs"
            title={isDark ? "Beralih ke Mode Cerah" : "Beralih ke Mode Gelap"}
          >
            {isDark ? "Mode Cerah" : "Mode Gelap"}
          </button>

          {statusData?.is_available && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"
              title="Ollama Aktif"
            />
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-[#38383c] text-slate-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 bg-white dark:bg-[#2b2b2e] transition-colors cursor-pointer"
              title="Keluar dari Sistem (Ganti Akun)"
            >
              Keluar
            </button>
          )}
        </div>

        {/* Konten Tengah: PERSIS CENTER TENGAH ATAS-BAWAH & AGAK BESAR */}
        <div className="w-full max-w-3xl flex flex-col items-center px-4 -mt-6">
          {/* Judul: 'Saya siap kapan pun Anda siap.' (Lebih Besar & Elegan) */}
          <h1 className="text-3xl sm:text-4xl font-medium text-slate-800 dark:text-slate-100 tracking-tight text-center mb-3">
            Saya siap kapan pun Anda siap.
          </h1>

          {/* Status Indikator Koneksi AI */}
          <div className="flex items-center gap-2 mb-7 px-3.5 py-1 rounded-full bg-slate-100/90 dark:bg-[#2b2b2e] border border-slate-200/80 dark:border-[#3a3a3e] shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                statusData?.is_available
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                  : "bg-slate-400"
              }`}
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {statusData?.is_available
                ? `Ollama AI Terhubung (${selectedModel})`
                : "Mode Database Internal (Ollama Offline)"}
            </span>
          </div>

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
    <div className="h-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#212121] animate-page-enter relative">
      <TopLaserBar isVisible={loading} />
      {/* Top Bar Ringkas Sesi Chat Aktif */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-[#2f2f2f] bg-white/80 dark:bg-[#212121]/80 backdrop-blur-xs flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-2">
          {/* Top Pill Switcher: Pilihan Modul | RAG / AI | CRUD Personel | Portal SSDM */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-100/90 dark:bg-[#2b2b2e] border border-slate-200/70 dark:border-[#38383c]">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
                title="Kembali ke Pilihan Menu Utama (CRUD / RAG)"
              >
                Pilihan Modul
              </button>
            )}
            <button
              type="button"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white shadow-2xs"
            >
              RAG / AI
            </button>
            {onOpenCrud && (
              <button
                type="button"
                onClick={onOpenCrud}
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                title="Buka Menu CRUD Personel"
              >
                CRUD Personel
              </button>
            )}
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
          {/* Indikator Status Ollama */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#2b2b2e] border border-slate-200 dark:border-slate-700 mr-1">
            <span
              className={`w-2 h-2 rounded-full ${
                statusData?.is_available
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"
                  : "bg-slate-400"
              }`}
            />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
              {statusData?.is_available ? selectedModel : "Offline (DB Mode)"}
            </span>
          </div>

          {/* Theme Toggle di Top Bar Percakapan */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title={isDark ? "Beralih ke Template Cerah" : "Beralih ke Template Gelap"}
          >
            {isDark ? "Cerah" : "Gelap"}
          </button>

          <button
            type="button"
            onClick={handleExportText}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="Ekspor Seluruh Percakapan ke TXT"
          >
            Ekspor
          </button>
          <button
            type="button"
            onClick={() => createNewChat()}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="Buka Obrolan Baru"
          >
            Obrolan Baru
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Keluar dari Sistem (Ganti Akun)"
            >
              Keluar
            </button>
          )}
        </div>
      </div>

      {/* Area Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`text-base sm:text-[17px] leading-relaxed ${
                  msg.sender === "user"
                    ? "max-w-[85%] sm:max-w-[75%] bg-[#f4f4f4] dark:bg-[#2f2f2f] text-slate-900 dark:text-white rounded-3xl px-5 py-3 font-normal shadow-2xs"
                    : "w-full text-slate-900 dark:text-[#ececec] space-y-3 py-1 px-0 font-normal border-none"
                }`}
              >
                {/* Isi Narasi Bersih Tanpa Asterik/Penanda Aneh & Polosan Tanpa Garis Tepi */}
                <div className="whitespace-pre-line text-base sm:text-[17px] leading-relaxed">
                  {cleanMarkdownText(msg.text)}
                </div>

                {/* Tabel Fakta Basis Data jika tersedia */}
                {msg.records && msg.records.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>Fakta Terverifikasi ({msg.records.length} Entri):</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-neutral-800">
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

                {/* Footer Pesan Assistant (Polosan Bersih) */}
                {msg.sender === "assistant" && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="font-mono text-[10px] text-slate-400">{msg.engine}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? "Disalin" : "Salin"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-center py-3 px-1 animate-page-enter">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin-clockwise" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                </div>
                <div className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
                  <span>Asisten AI sedang menelusuri basis data SSDM</span>
                  <span className="flex gap-0.5">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-150">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </span>
                </div>
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
