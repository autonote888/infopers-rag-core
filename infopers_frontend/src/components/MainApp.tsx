"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoginScreen from "@/components/LoginScreen";
import SotkView from "@/components/views/SotkView";
import OllamaAiView from "@/components/views/OllamaAiView";
import DashboardView from "@/components/views/DashboardView";
import PersonelView from "@/components/views/PersonelView";
import RadarSdmView from "@/components/views/RadarSdmView";
import AiHubView from "@/components/views/AiHubView";
import KarierMutasiView from "@/components/views/KarierMutasiView";
import RemunerasiView from "@/components/views/RemunerasiView";
import PengaturanView from "@/components/views/PengaturanView";
import SpecializedModuleView from "@/components/views/SpecializedModuleView";
import DokumenPerencanaanView from "@/components/views/DokumenPerencanaanView";
import RecordMemoryView from "@/components/views/RecordMemoryView";
import PoldaSatkerView from "@/components/views/PoldaSatkerView";
import OllamaControlModal from "@/components/OllamaControlModal";
import { ThemeProvider } from "@/context/ThemeContext";
import { OllamaProvider } from "@/context/OllamaContext";
import { authStorage, UserSession } from "@/lib/api";
import { MenuKey } from "@/types";

function InnerApp() {
  const [user, setUser] = useState<UserSession | null>(null);
  // Default tampilan awal: Cover Bersih Fokus Akses Ollama (Ala ChatGPT)
  const [activeMenu, setActiveMenu] = useState<MenuKey>("smart_qa_ai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const existing = authStorage.getUser();
    if (existing) {
      setUser(existing);
    }

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener("auth_expired", handleAuthExpired);
    setIsReady(true);
    return () => window.removeEventListener("auth_expired", handleAuthExpired);
  }, []);

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center text-slate-500 font-sans text-sm" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-3" suppressHydrationWarning>
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-amber-500 animate-spin" suppressHydrationWarning />
          <p className="font-semibold text-xs tracking-wide uppercase text-slate-600 dark:text-slate-400" suppressHydrationWarning>
            Memuat Sistem SSDM Polri Presisi...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={(u) => setUser(u)} />;
  }

  // Breadcrumb mapping untuk tampilan website
  const breadcrumbs: Record<MenuKey, string> = {
    sotk_ssdm: "SOTK SSDM Polri",
    program_unggulan: "Program Unggulan SSDM",
    statistik_personel: "Data Personel SSDM Polri",
    data_polda: "Data Polda SSDM Polri",
    data_satker: "Data Satker SSDM Polri",
    data_polda_satker: "Data Polda & Satker SSDM Polri",
    prediksi_bup: "Prediksi Batas Usia Pensiun",
    prediksi_intake: "Prediksi Intake Personel",
    analisis_formasi: "Analisis Formasi & DSPP",
    proyeksi_belanja_jf: "Proyeksi Anggaran & Hak JF",
    dokumen_perencanaan: "Dokumen Perencanaan Pengadaan Hardware",
    record_memory: "Record Memory & NVRAM Device",
    smart_qa_ai: "Pencarian Cerdas Personel (Ollama AI)",
    ai_rekomendasi_mutasi: "AI Rekomendasi Mutasi",
    validasi_ocr: "Validasi Dokumen Otomatis",
    generator_rh: "Generator Riwayat Hidup",
    rekam_jejak_ukp: "Rekam Jejak & Usulan UKP",
    talent_pool_dikbang: "Talent Pool & Seleksi Dikbang",
    status_verifikasi_adm: "Status Verifikasi Administrasi",
    psikologi_senpi: "Uji Psikologi & Izin Senpi",
    peringatan_mpp_kgb: "Peringatan Dini (MPP & KGB)",
    tanda_kehormatan: "Tanda Kehormatan & Satya Lencana",
    layanan_mandiri: "Layanan Mandiri Personel",
    pengaturan_rbac: "Manajemen Hak Akses (RBAC)",
    audit_trail: "Log Validitas Data & Audit Trail",
  };

  const isAiMode = activeMenu === "smart_qa_ai";

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] text-slate-900 dark:text-[#ececec] overflow-hidden font-sans transition-colors" suppressHydrationWarning>
      {/* 1. Sidebar: Mode ChatGPT (1 Menu SDM) vs Mode Website (6 Pilar & 20 Modul) */}
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={(m) => setActiveMenu(m)}
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isAiMode={isAiMode}
        onEnterWebsite={() => setActiveMenu("sotk_ssdm")}
        onBackToAi={() => setActiveMenu("smart_qa_ai")}
      />

      {/* 2. Konten Utama Proposional Full-Screen */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header hanya muncul saat di mode Website agar tampilan ChatGPT 100% bersih seperti screenshot */}
        {!isAiMode && (
          <Header
            breadcrumb={breadcrumbs[activeMenu] || "SSDM POLRI"}
            user={user}
            isAiMode={isAiMode}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onSearchClick={() => setActiveMenu("smart_qa_ai")}
            onBackToAi={() => setActiveMenu("smart_qa_ai")}
          />
        )}

        {/* View Content Area */}
        {isAiMode ? (
          /* Mode 1: Cover Bersih ChatGPT (Akses Ollama AI) */
          <main className="flex-1 overflow-hidden bg-white dark:bg-[#212121] transition-colors relative">
            <OllamaAiView
              initialQuery={aiInitialQuery}
              onResetToNewChat={() => setAiInitialQuery("")}
              onEnterWebsite={() => setActiveMenu("sotk_ssdm")}
            />
          </main>
        ) : (
          /* Mode 2: Tampilan Website Portal SSDM Lengkap */
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-100 dark:bg-neutral-950 transition-colors">
            {/* 1. BERANDA & PROFIL KELEMBAGAAN */}
            {activeMenu === "sotk_ssdm" && <SotkView />}
            {activeMenu === "program_unggulan" && <SpecializedModuleView moduleKey="program_unggulan" />}
            {activeMenu === "statistik_personel" && (
              <DashboardView
                onOpenAI={(q?: string) => {
                  if (q) setAiInitialQuery(q);
                  setActiveMenu("smart_qa_ai");
                }}
              />
            )}
            {activeMenu === "data_polda" && <PoldaSatkerView defaultTab="polda" />}
            {activeMenu === "data_satker" && <PoldaSatkerView defaultTab="satker" />}
            {activeMenu === "data_polda_satker" && <PoldaSatkerView defaultTab="polda" />}

            {/* 2. PERENCANAAN STRATEGIS & PREDIKSI (DALPERS & RENMIN) */}
            {activeMenu === "prediksi_bup" && <RadarSdmView />}
            {activeMenu === "prediksi_intake" && <SpecializedModuleView moduleKey="prediksi_intake" />}
            {activeMenu === "analisis_formasi" && <SpecializedModuleView moduleKey="analisis_formasi" />}
            {activeMenu === "proyeksi_belanja_jf" && <RemunerasiView initialTab="hak_jf" />}
            {activeMenu === "dokumen_perencanaan" && <DokumenPerencanaanView />}
            {activeMenu === "record_memory" && <RecordMemoryView />}

            {/* 3. FITUR AI UNGGULAN SSDM */}
            {activeMenu === "ai_rekomendasi_mutasi" && <KarierMutasiView />}
            {activeMenu === "validasi_ocr" && <PersonelView initialTab="validasi_ocr" />}
            {activeMenu === "generator_rh" && <PersonelView initialTab="cetak_rh" />}

            {/* 4. PEMBINAAN KARIER (BIRO BINKAR) */}
            {activeMenu === "rekam_jejak_ukp" && <SpecializedModuleView moduleKey="rekam_jejak_ukp" />}
            {activeMenu === "talent_pool_dikbang" && <SpecializedModuleView moduleKey="talent_pool_dikbang" />}
            {activeMenu === "status_verifikasi_adm" && <SpecializedModuleView moduleKey="status_verifikasi_adm" />}

            {/* 5. PERAWATAN PERSONEL & PSIKOLOGI (BIRO WATPERS & RO PSIKOLOGI) */}
            {activeMenu === "psikologi_senpi" && <SpecializedModuleView moduleKey="psikologi_senpi" />}
            {activeMenu === "peringatan_mpp_kgb" && <RadarSdmView />}
            {activeMenu === "tanda_kehormatan" && <SpecializedModuleView moduleKey="tanda_kehormatan" />}
            {activeMenu === "layanan_mandiri" && <AiHubView />}

            {/* 6. INTEGRITAS & TATA KELOLA DATA (INTERNAL IT SSDM) */}
            {activeMenu === "pengaturan_rbac" && <PengaturanView />}
            {activeMenu === "audit_trail" && <SpecializedModuleView moduleKey="audit_trail" />}
          </main>
        )}
      </div>

      {/* Modal Pengaturan & Menu Akses Ollama */}
      <OllamaControlModal />
    </div>
  );
}

export default function MainApp() {
  return (
    <ThemeProvider>
      <OllamaProvider>
        <InnerApp />
      </OllamaProvider>
    </ThemeProvider>
  );
}
