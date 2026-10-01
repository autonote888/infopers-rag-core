"use client";

import React from "react";
import { UserSession } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

interface PortalLandingViewProps {
  user: UserSession;
  onSelectCrud: () => void;
  onSelectRag: () => void;
  onLogout: () => void;
}

export default function PortalLandingView({
  user,
  onSelectCrud,
  onSelectRag,
  onLogout,
}: PortalLandingViewProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#18181b] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors select-none font-sans animate-page-enter">
      {/* Top Navbar Minimalis */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img
            src="/SSDM_Polri.png"
            alt="Logo SSDM"
            className="w-9 h-9 object-contain drop-shadow-xs"
          />
          <div>
            <h2 className="text-sm font-black tracking-wider uppercase leading-tight">
              SSDM POLRI
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Sistem Informasi Personel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mode Cerah / Gelap */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-xs"
            title={isDark ? "Beralih ke Mode Cerah" : "Beralih ke Mode Gelap"}
          >
            {isDark ? "Mode Cerah" : "Mode Gelap"}
          </button>

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user.nama?.split(" ")[0] || user.username}
            </span>
          </div>

          {/* Tombol Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Choice: HANYA 2 PILIHAN BESAR KIRI KANAN: CRUD ATAU RAG */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* PILIHAN 1 (KIRI): CRUD */}
          <button
            type="button"
            onClick={onSelectCrud}
            className="group relative h-72 sm:h-80 bg-white dark:bg-[#121214] rounded-3xl border-2 border-slate-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-500 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer transform hover:-translate-y-2 focus:outline-hidden"
          >
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              CRUD
            </div>
          </button>

          {/* PILIHAN 2 (KANAN): RAG */}
          <button
            type="button"
            onClick={onSelectRag}
            className="group relative h-72 sm:h-80 bg-white dark:bg-[#121214] rounded-3xl border-2 border-slate-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-500 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer transform hover:-translate-y-2 focus:outline-hidden"
          >
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              RAG
            </div>
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        SSDM POLRI 2026
      </footer>
    </div>
  );
}
