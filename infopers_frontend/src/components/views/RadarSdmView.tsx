"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, FileCheck, RefreshCw } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export default function RadarSdmView() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data?.radar_peringatan_dini || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pemantauan Pensiun &amp; Kenaikan Gaji Berkala (KGB)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pemantauan berkala batas usia pensiun (Masa Persiapan Pensiun), kenaikan pangkat, dan pembaruan sertifikasi kedinasan.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#27272a] bg-white dark:bg-[#121214] hover:bg-slate-50 dark:hover:bg-[#18181b] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Muat Ulang</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {alerts.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#27272a] p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                {item.kategori}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {item.jumlah?.toLocaleString("id-ID")} Personel
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.deskripsi}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-[#27272a] flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <FileCheck size={13} className="text-slate-700 dark:text-slate-300" />
              <span>Tindak Lanjut: {item.tindakan}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
