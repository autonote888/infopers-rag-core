"use client";

import dynamic from "next/dynamic";

const MainApp = dynamic(() => import("@/components/MainApp"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-sans text-sm select-none"
      suppressHydrationWarning
    >
      <div className="flex flex-col items-center gap-3" suppressHydrationWarning>
        <div
          className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-950 dark:border-t-white animate-spin"
          suppressHydrationWarning
        />
        <p
          className="font-bold text-xs tracking-wider uppercase text-neutral-800 dark:text-neutral-200"
          suppressHydrationWarning
        >
          Memuat Sistem SSDM Polri Presisi...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <MainApp />;
}
