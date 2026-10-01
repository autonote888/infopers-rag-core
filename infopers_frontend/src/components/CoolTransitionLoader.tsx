"use client";

import React from "react";
import Image from "next/image";

interface CoolTransitionLoaderProps {
  message?: string;
  subMessage?: string;
  isFullScreen?: boolean;
}

export function TopLaserBar({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-9999 h-[3px] bg-slate-900/40 backdrop-blur-xs overflow-hidden pointer-events-none">
      <div className="w-full h-full laser-bar shadow-[0_0_12px_#38bdf8]" />
    </div>
  );
}

export default function CoolTransitionLoader({
  message = "Memproses Permintaan...",
  subMessage = "Sinkronisasi data presisi SSDM Polri terenkripsi",
  isFullScreen = true,
}: CoolTransitionLoaderProps) {
  const content = (
    <div className="relative flex flex-col items-center justify-center p-8 select-none">
      {/* 1. Radar Pulse Glow Effect di Belakang Logo */}
      <div className="absolute w-36 h-36 rounded-full bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 animate-radar-wave pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/10 animate-radar-wave pointer-events-none delay-700" />

      {/* 2. Dual Concentric Holographic Spinning Rings */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Ring Luar: Conic Gradient Biru Presisi */}
        <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-sky-400 to-transparent animate-spin-clockwise shadow-lg shadow-blue-500/20">
          <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md" />
        </div>

        {/* Ring Dalam: Conic Gradient Emas Tribrata */}
        <div className="absolute inset-2.5 rounded-full p-[2px] bg-gradient-to-bl from-amber-500 via-yellow-400 to-transparent animate-spin-counter shadow-md shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-slate-950/60" />
        </div>

        {/* Logo Lambang SSDM Polri di Tengah */}
        <div className="relative z-10 w-12 h-12 flex items-center justify-center animate-float-3d">
          <Image
            src="/logo-ssdm.png"
            alt="SSDM POLRI"
            width={44}
            height={44}
            className="object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            priority
          />
        </div>
      </div>

      {/* 3. Teks Informasi & Status Cyber */}
      <div className="mt-6 text-center space-y-1.5 z-10 max-w-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <span>SISTEM PRESISI AKTIF</span>
        </div>
        <h3 className="text-base font-bold text-white tracking-wide">
          {message}
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          {subMessage}
        </p>
      </div>

      {/* 4. Mini Scanning Dots Bar */}
      <div className="mt-4 flex items-center gap-1.5">
        <span className="w-2 h-1 rounded-full bg-blue-500 animate-pulse" />
        <span className="w-3 h-1 rounded-full bg-sky-400 animate-pulse delay-150" />
        <span className="w-5 h-1 rounded-full bg-amber-400 animate-pulse delay-300" />
        <span className="w-3 h-1 rounded-full bg-sky-400 animate-pulse delay-150" />
        <span className="w-2 h-1 rounded-full bg-blue-500 animate-pulse" />
      </div>
    </div>
  );

  if (!isFullScreen) {
    return (
      <div className="w-full py-16 flex items-center justify-center animate-page-enter">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-9998 bg-slate-950/85 backdrop-blur-md flex items-center justify-center animate-page-enter">
      {content}
    </div>
  );
}

// 5. Komponen Cyber Skeleton Loader untuk Tabel & Kartu
export function CyberSkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4 animate-page-enter">
      {/* Header bar skeleton */}
      <div className="h-10 w-full rounded-xl cyber-shimmer bg-slate-800/50 border border-slate-700/40" />

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 w-full rounded-xl cyber-shimmer bg-slate-900/60 border border-slate-800/60 flex items-center px-4 gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-800/60 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-slate-800/80" />
            <div className="h-2.5 w-1/2 rounded bg-slate-800/50" />
          </div>
          <div className="h-7 w-24 rounded-lg bg-slate-800/60 shrink-0" />
        </div>
      ))}
    </div>
  );
}
