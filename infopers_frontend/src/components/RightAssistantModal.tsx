"use client";

import React, { useState, useRef, useEffect } from "react";
import { useOllama } from "@/context/OllamaContext";
import { fetchWithAuth } from "@/lib/api";
import { cleanMarkdownText } from "@/components/views/OllamaAiView";

interface RightAssistantModalProps {
  onOpenFullAi?: (initialPrompt?: string) => void;
}

interface CompanionTopic {
  id: string;
  badge: string;
  title: string;
  prompt: string;
}

const COMPANION_TOPICS: CompanionTopic[] = [
  {
    id: "ngobrol",
    badge: "Ngobrol",
    title: "Teman Ngobrol Piket",
    prompt: "Halo! Lagi piket atau dinas nih, ngobrol santai yuk biar nggak ngantuk dan nggak gabut. Apa kabar hari ini?",
  },
  {
    id: "trivia",
    badge: "Trivia",
    title: "Fakta Unik Polri",
    prompt: "Bagi satu fakta unik atau sejarah kepolisian yang menarik dan jarang diketahui orang dong!",
  },
  {
    id: "tebak",
    badge: "Tebakan",
    title: "Tebak Istilah Dinas",
    prompt: "Ayo main tebak-tebakan atau kuis singkat tentang istilah singkatan kedinasan Polri yang seru!",
  },
  {
    id: "semangat",
    badge: "Motivasi",
    title: "Penyemangat Dinas",
    prompt: "Kasih kata motivasi atau quotes penyemangat dinas Tribrata hari ini biar makin berenergi!",
  },
  {
    id: "tips_segar",
    badge: "Tips",
    title: "Tips Anti Jenuh & Bugar",
    prompt: "Kasih tips ringan cara menjaga stamina, peregangan otot, dan agar tetap fokus saat jaga dinas berjam-jam.",
  },
  {
    id: "curhat_karier",
    badge: "Karier",
    title: "Tanya Karier Santai",
    prompt: "Ngobrol santai dong, apa saja tips persiapan bagi personel yang ingin ikut seleksi pengembangan pendidikan atau sekolah dinas Polri?",
  },
];

interface ChatEntry {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function RightAssistantModal({ onOpenFullAi }: RightAssistantModalProps) {
  const { selectedModel, selectedMode, ollamaHost } = useOllama();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ChatEntry[]>([
    {
      id: "welcome_gabut",
      sender: "assistant",
      text: "Halo rekan Presisi! Siap nemenin kamu biar nggak gabut pas lagi dinas atau santai. Mau ngobrol santai, tebak-tebakan, cerita seputar dinas, atau butuh trivia seru? Tulis aja ya, aku siap temenin!",
      timestamp: "Online",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q || isLoading) return;

    const userEntry: ChatEntry = {
      id: "u_" + Date.now(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...history, userEntry];
    setHistory(newHistory);
    setInputVal("");
    setIsLoading(true);

    const companionPrompt =
      "Anda adalah Teman Santai dan Pendamping Akrab Personel SSDM Polri. Tugas Anda menemani personel saat dinas atau waktu luang agar tidak jenuh/gabut. Berbicaralah dengan nada hangat, akrab kedinasan (salam Presisi), ramah, bersahabat, dan menghibur. Anda juga memahami wawasan seputar SSDM Polri. Jawab secara ringkas, luwes, santai, bersahabat, dan tanpa tanda bintang (**).";

    try {
      const res = await fetchWithAuth("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          query: q,
          mode: selectedMode || "rag_ollama",
          model: selectedModel || "ssdm-ai:latest",
          host: ollamaHost || "http://localhost:11434",
          system_prompt: companionPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = cleanMarkdownText(data.jawaban || "Siap, aku di sini nemenin kamu!");
        const botEntry: ChatEntry = {
          id: "a_" + Date.now(),
          sender: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setHistory([...newHistory, botEntry]);
      } else {
        const errEntry: ChatEntry = {
          id: "err_" + Date.now(),
          sender: "assistant",
          text: "Waduh sinyal lagi agak padat nih, santai dulu sejenak ya rekan!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setHistory([...newHistory, errEntry]);
      }
    } catch {
      const netErrEntry: ChatEntry = {
        id: "net_err_" + Date.now(),
        sender: "assistant",
        text: "Koneksi backend lagi istirahat sebentar. Tetap semangat dinasnya ya!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory([...newHistory, netErrEntry]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. TOMBOL MELAYANG 3D PROFESIONAL & HALUS DI KANAN BAWAH */}
      {!isOpen && (
        <aside
          aria-label="Teman Santai SSDM"
          className="fixed right-5 bottom-6 z-40 group cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95"
          onClick={() => setIsOpen(true)}
        >
          {/* Subtle 3D Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-amber-500/20 to-indigo-600/30 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300 opacity-80" />

          {/* 3D Capsule Pill */}
          <div
            className="relative flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white rounded-2xl border border-slate-700/80 shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300"
          >
            {/* 3D Mini Crest Avatar */}
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 via-slate-800 to-blue-950 p-0.5 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <svg
                className="w-4 h-4 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              {/* Blinking Blue Indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_6px_#3b82f6]" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[12px] font-bold text-slate-100 tracking-tight leading-tight">
                Teman Santai
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Nemenin biar gak gabut
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* 2. LAYAR KECIL SEPARUH TINGGI LAYAR SEPERTI HP (KANAN BAWAH) */}
      {isOpen && (
        <aside
          aria-label="Layar Teman Santai SSDM"
          className="fixed bottom-5 right-5 z-50 w-[350px] sm:w-[370px] max-w-[calc(100vw-2rem)] h-[490px] max-h-[56vh] bg-white dark:bg-[#18181b] text-slate-900 dark:text-slate-100 rounded-[28px] border-2 border-slate-200 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden transition-all duration-300 ease-out transform animate-in fade-in zoom-in-95"
        >
          {/* Header HP Phone-Style Mini Notch */}
          <div className="relative px-4 pt-3 pb-2.5 bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800/80 shrink-0">
            {/* Speaker Pill Notch Simulation */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-700/60 rounded-full pointer-events-none" />

            {/* Left: Info */}
            <div className="flex items-center gap-2.5 mt-0.5">
              <div className="relative w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {/* Blinking blue dot */}
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_6px_#3b82f6]" />
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-white leading-tight">
                  Teman Santai SSDM
                </h4>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Nemenin kamu biar nggak gabut
                </p>
              </div>
            </div>

            {/* Actions: Minimize & Fullscreen */}
            <div className="flex items-center gap-1">
              {onOpenFullAi && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullAi();
                  }}
                  title="Buka Layar Penuh"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Topic Chips (Horizontal Scrollable) */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {COMPANION_TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSend(t.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition-all duration-200 active:scale-95 shadow-xs"
              >
                {t.title}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-[12.5px] leading-relaxed">
            {history.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`transition-all ${
                      isAssistant
                        ? "w-full text-slate-800 dark:text-slate-100 py-1 px-0 font-normal leading-relaxed border-none"
                        : "max-w-[85%] bg-blue-600 text-white rounded-2xl px-3.5 py-2 shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Loading Indicator: Cukup Tanda Biru Aja Kedip-Kedip Sesuai Permintaan */}
            {isLoading && (
              <div className="flex items-center gap-1.5 py-1 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Phone Style */}
          <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ketik apa saja, aku temenin..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-xs"
                title="Kirim Pesan"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
}
