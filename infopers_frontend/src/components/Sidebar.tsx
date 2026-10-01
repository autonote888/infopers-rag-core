"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Network,
  Award,
  BarChart3,
  CalendarClock,
  UserPlus,
  Building2,
  Briefcase,
  Sparkles,
  GitMerge,
  FileCheck,
  FileText,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Target,
  AlertTriangle,
  Medal,
  UserCheck,
  Lock,
  History,
  LogOut,
  SquarePen,
  PanelLeftClose,
  PanelLeft,
  Search,
  MessageSquare,
  Trash2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  LucideIcon,
  SlidersHorizontal,
  Activity,
} from "lucide-react";
import { UserSession } from "@/lib/api";
import { MenuKey } from "@/types";
import { useOllama } from "@/context/OllamaContext";

interface SidebarProps {
  activeMenu: MenuKey;
  onSelectMenu: (menu: MenuKey) => void;
  user: UserSession | null;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isAiMode?: boolean;
  onEnterWebsite?: () => void;
  onBackToAi?: () => void;
}

interface MenuItem {
  key: MenuKey;
  label: string;
  description?: string;
  icon: LucideIcon;
  badge?: string;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export default function Sidebar({
  activeMenu,
  onSelectMenu,
  user,
  onLogout,
  collapsed = false,
  onToggleCollapse,
  isAiMode = true,
  onEnterWebsite,
  onBackToAi,
}: SidebarProps) {
  const {
    chatSessions,
    currentSessionId,
    createNewChat,
    selectSession,
    deleteSession,
    openSettings,
    selectedModel,
    statusData,
  } = useOllama();

  // Menu Portal Website (Tampilan Elegan & Lebih Besar)
  const sections: MenuSection[] = [
    {
      id: "sec_1",
      title: "MENU PORTAL TERPADU SSDM",
      items: [
        {
          key: "sotk_ssdm",
          label: "SOTK SSDM Polri",
          description: "Struktur Organisasi & Regulasi Dokumen",
          icon: Network,
          badge: "6 Dok",
        },
        {
          key: "statistik_personel",
          label: "Data Personel",
          description: "Database 483.355 Personel & Sebaran",
          icon: BarChart3,
          badge: "483K",
        },
        {
          key: "data_polda",
          label: "Data Polda",
          description: "Daftar 38 Polda & Jumlah Satker Masing-Masing",
          icon: Network,
          badge: "38 Wilayah",
        },
        {
          key: "data_satker",
          label: "Data Satker",
          description: "Daftar 1.502 Satker & Jumlah Personel",
          icon: Building2,
          badge: "1.502 Satker",
        },
        {
          key: "smart_qa_ai",
          label: "Pencarian Cerdas AI",
          description: "Tanya Jawab Personel & Regulasi (Ollama)",
          icon: Sparkles,
          badge: "Ollama AI",
        },
      ],
    },
  ];

  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    if (showHistory) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showHistory]);

  // =========================================================================
  // KONDISI 1: ASISTEN AI (PATEN NARROW STRIP - TIDAK GESER KANAN KIRI)
  // =========================================================================
  if (isAiMode) {
    return (
      <aside className="w-14 bg-[#f9f9f9] dark:bg-[#171717] border-r border-slate-200/80 dark:border-[#262626] flex flex-col items-center py-3.5 justify-between h-screen select-none shrink-0 z-20 relative">
        <div className="flex flex-col items-center gap-2.5">
          {/* 1. LOGO SSDM (Tetap paten, klik untuk refresh / obrolan baru) */}
          <button
            type="button"
            onClick={() => {
              if (onBackToAi) onBackToAi();
              createNewChat();
              setShowHistory(false);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-[#262626] transition-all group flex items-center justify-center mb-1 cursor-pointer"
            title="Asisten Tribrata SSDM Polri - Klik untuk Obrolan Baru"
          >
            <img
              src="/SSDM_Polri.png"
              alt="Logo SSDM Polri"
              className="w-7 h-7 object-contain drop-shadow-2xs group-hover:scale-105 transition-transform"
            />
          </button>

          {/* 2. Tombol Obrolan Baru (SquarePen Outline Bersih) */}
          <button
            type="button"
            onClick={() => {
              if (onBackToAi) onBackToAi();
              createNewChat();
              setShowHistory(false);
            }}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#262626] transition-colors cursor-pointer"
            title="Obrolan Baru (Ctrl+K)"
          >
            <SquarePen size={18} strokeWidth={1.75} />
          </button>

          {/* 3. Tombol Riwayat Chat (MessageSquare - Buka Popover Melayang tanpa geser halaman) */}
          <div className="relative" ref={historyRef}>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showHistory
                  ? "bg-slate-200/80 dark:bg-[#262626] text-blue-600 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#262626]"
              }`}
              title="Riwayat Obrolan"
            >
              <MessageSquare size={18} strokeWidth={1.75} />
            </button>

            {/* Popover Melayang (Floating Modal) - Tidak Menggeser Tata Letak Layar */}
            {showHistory && (
              <div className="fixed left-16 top-16 w-80 max-h-[75vh] bg-white dark:bg-[#1f1f22] border border-slate-200/90 dark:border-[#333338] shadow-2xl rounded-2xl p-3 z-50 flex flex-col animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#2a2a2e]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Riwayat Obrolan AI
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2a2e] text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto space-y-1 flex-1 pr-1">
                  {chatSessions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      Belum ada riwayat obrolan
                    </div>
                  ) : (
                    chatSessions.map((sess) => {
                      const isActive = currentSessionId === sess.id;
                      return (
                        <div
                          key={sess.id}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isActive
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#26262a]"
                          }`}
                          onClick={() => {
                            selectSession(sess.id);
                            setShowHistory(false);
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                            <MessageSquare size={13} className="shrink-0 text-slate-400" />
                            <span className="truncate">{sess.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(sess.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity shrink-0"
                            title="Hapus Obrolan"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profil / Logout di bagian bawah */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-[#262626] transition-colors cursor-pointer"
            title="Keluar"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // KONDISI 2: TAMPILAN SIDEBAR PORTAL WEBSITE SSDM (HITAM PUTIH TANPA IKON)
  // =========================================================================
  return (
    <aside className="w-88 sm:w-96 bg-white dark:bg-neutral-950 border-r border-neutral-300 dark:border-neutral-800 flex flex-col h-screen select-none shrink-0 transition-all z-20">
      {/* Brand Header Portal Website Hitam Putih */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <img
            src="/SSDM_Polri.png"
            alt="Logo SSDM"
            className="w-11 h-11 object-contain shrink-0 grayscale"
          />
          <div className="overflow-hidden">
            <h1 className="font-black text-neutral-950 dark:text-white text-base tracking-wider uppercase leading-tight">
              SSDM POLRI
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold tracking-wide uppercase leading-tight mt-0.5">
              Portal Terpadu Presisi
            </p>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="px-2 py-1 rounded-md text-xs font-bold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Tutup Sidebar"
          >
            Tutup
          </button>
        )}
      </div>

      {/* Tombol Kembali ke Asisten AI (ChatGPT Style) - Hitam Putih Tanpa Ikon */}
      <div className="p-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onBackToAi}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-2xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 cursor-pointer"
        >
          <span>← Kembali ke Asisten Tribrata</span>
          <span className="text-xs font-mono opacity-80 uppercase">Chat</span>
        </button>
      </div>

      {/* Navigasi List Menu Portal Website - Hitam Putih Tanpa Ikon */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
        {sections.map((sec) => (
          <div key={sec.id} className="space-y-2">
            <div className="px-1 text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              {sec.title}
            </div>

            <div className="space-y-2">
              {sec.items.map((item) => {
                const isActive = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectMenu(item.key)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left cursor-pointer border ${
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs"
                        : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div
                        className={`text-sm sm:text-base font-bold truncate leading-tight ${
                          isActive
                            ? "text-white dark:text-neutral-950"
                            : "text-neutral-950 dark:text-white"
                        }`}
                      >
                        {item.label}
                      </div>
                      {item.description && (
                        <div
                          className={`text-xs font-medium truncate leading-tight mt-1 ${
                            isActive
                              ? "text-neutral-300 dark:text-neutral-600"
                              : "text-neutral-500 dark:text-neutral-400"
                          }`}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>

                    {item.badge && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 ml-2 ${
                          isActive
                            ? "bg-white/20 text-white dark:bg-black/15 dark:text-neutral-950"
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Website Mode Hitam Putih */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm">
        <div className="overflow-hidden">
          <span className="font-bold text-neutral-900 dark:text-white truncate block">
            {user?.nama?.split(" ")[0] || "Admin"}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">({user?.pangkat || "Presisi"})</span>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer border border-neutral-300 dark:border-neutral-700"
          title="Keluar"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
