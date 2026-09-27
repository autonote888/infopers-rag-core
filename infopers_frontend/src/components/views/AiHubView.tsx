"use client";

import React, { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: any;
}

export default function AiHubView() {
  const [mode, setMode] = useState<"tanya_personel" | "self_service">("tanya_personel");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Layanan Konsultasi Administrasi SDM Polri. Silakan masukkan kata kunci penelusuran personel berdasarkan nama, keahlian, atau ketentuan dinas seperti sisa cuti, syarat kenaikan pangkat (UKP), dan kenaikan gaji berkala (KGB).",
    },
  ]);

  const handleSend = async (userQuery?: string) => {
    const textToSend = userQuery || query;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    if (!userQuery) setQuery("");
    setLoading(true);

    try {
      const res = await fetchWithAuth("/ai/ask", {
        method: "POST",
        body: JSON.stringify({ query: textToSend, mode }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.jawaban, metadata: json.metadata },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Permintaan data tidak dapat diproses. Silakan ulangi kembali." },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Koneksi ke server terputus. Pastikan layanan backend aktif." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts =
    mode === "tanya_personel"
      ? [
          "Penelusuran personel keahlian Cyber Forensik",
          "Daftar personel dengan sertifikasi Pusdik Reskrim",
          "Personel dengan angka kredit JF tertinggi",
        ]
      : [
          "Ketentuan dan hak sisa cuti tahunan",
          "Persyaratan usulan kenaikan pangkat (UKP)",
          "Tata cara pengurusan kenaikan gaji berkala (KGB)",
        ];

  return (
    <div className="space-y-4 w-full h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Layanan Konsultasi Regulasi &amp; SDM
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Penelusuran ketentuan kedinasan, regulasi tunjangan kinerja, dan pencarian kualifikasi personel.
          </p>
        </div>

        <div className="flex p-1 rounded-lg bg-slate-200/70 dark:bg-[#18181b] border border-slate-300/60 dark:border-[#27272a] text-xs">
          <button
            onClick={() => setMode("tanya_personel")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              mode === "tanya_personel"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Penelusuran Personel
          </button>
          <button
            onClick={() => setMode("self_service")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              mode === "self_service"
                ? "bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Konsultasi Regulasi
          </button>
        </div>
      </div>

      {/* Chat Box */}
      <div className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] flex-1 flex flex-col overflow-hidden shadow-2xs w-full">
        <div className="flex-1 p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 max-w-2xl ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${
                  m.role === "user"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272a]"
                }`}
              >
                {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div
                className={`p-3.5 rounded-xl border ${
                  m.role === "user"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white"
                    : "bg-slate-50 dark:bg-[#18181b] text-slate-800 dark:text-slate-200 border-slate-100 dark:border-[#27272a]"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Bot size={14} className="animate-spin" />
              <span>Memproses pencarian data...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-slate-50 dark:bg-[#18181b] border-t border-slate-200 dark:border-[#27272a] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 flex-shrink-0">Pilihan Penelusuran:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="flex-shrink-0 px-2.5 py-1 rounded bg-white dark:bg-[#121214] hover:bg-slate-100 dark:hover:bg-[#27272a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272a] text-[11px] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#121214] flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik pertanyaan atau kata kunci penelusuran..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <span>Kirim</span>
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
