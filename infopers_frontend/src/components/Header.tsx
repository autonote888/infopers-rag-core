"use client";

import React from "react";
import { UserSession } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useOllama } from "@/context/OllamaContext";

interface HeaderProps {
  breadcrumb: string;
  user: UserSession | null;
  onSearchClick?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isAiMode?: boolean;
  onBackToAi?: () => void;
}

export default function Header({
  breadcrumb,
  user,
  onSearchClick,
  sidebarCollapsed = false,
  onToggleSidebar,
  isAiMode = false,
  onBackToAi,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { selectedModel, statusData, openSettings } = useOllama();

  return (
    <header className="h-14 border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors shrink-0 select-none">
      {/* Sisi Kiri: Breadcrumb Hitam Putih */}
      <div className="flex items-center gap-3 overflow-hidden">
        {sidebarCollapsed && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="px-2.5 py-1 rounded-md text-xs font-bold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors border border-neutral-300 dark:border-neutral-700"
            title="Buka Menu SSDM"
          >
            Menu
          </button>
        )}

        <div className="flex items-center gap-2 text-xs overflow-hidden">
          <span className="text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
            SSDM POLRI
          </span>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="text-neutral-950 dark:text-white font-black truncate uppercase">
            {breadcrumb}
          </span>
        </div>
      </div>

      {/* Switcher Pill Capsule: Chat | Portal SSDM (Hitam Putih) */}
      <div className="flex items-center p-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-2xs">
        <button
          type="button"
          onClick={onBackToAi}
          className="px-3 py-1 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Beralih ke Asisten Chat AI"
        >
          Chat
        </button>
        <button
          type="button"
          className="px-3.5 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs"
        >
          Portal SSDM
        </button>
      </div>

      {/* Sisi Kanan: Kontrol Hitam Putih */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Indikator Hijau Titik jika Ollama Aktif (Tanpa Bacaan) */}
        {statusData?.is_available && (
          <span
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse shrink-0 mr-1"
            title="Ollama Aktif"
          />
        )}

        {/* Tombol Akses Ollama */}
        <button
          onClick={openSettings}
          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
          title="Buka Menu Akses Ollama"
        >
          Akses Ollama
        </button>

        {/* Tombol Tema Hitam Putih */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
          title={isDark ? "Beralih ke Mode Cerah" : "Beralih ke Mode Gelap"}
        >
          {isDark ? "Mode Cerah" : "Mode Gelap"}
        </button>

        {/* Profil Singkat */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-300 dark:border-neutral-800">
          <div className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-bold border border-neutral-300 dark:border-neutral-800">
            {user?.nama?.split(" ")[0] || "Admin"}
          </div>
        </div>
      </div>
    </header>
  );
}
