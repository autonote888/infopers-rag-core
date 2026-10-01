"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoginScreen from "@/components/LoginScreen";
import PortalLandingView from "@/components/views/PortalLandingView";
import CrudPersonelView from "@/components/views/CrudPersonelView";
import SotkView from "@/components/views/SotkView";
import OllamaAiView from "@/components/views/OllamaAiView";
import DashboardView from "@/components/views/DashboardView";
import PoldaSatkerView from "@/components/views/PoldaSatkerView";
import OllamaControlModal from "@/components/OllamaControlModal";
import RightAssistantModal from "@/components/RightAssistantModal";
import { ThemeProvider } from "@/context/ThemeContext";
import { OllamaProvider, useOllama } from "@/context/OllamaContext";
import { authStorage, UserSession } from "@/lib/api";
import {
  logoutKeycloakSession,
  checkKeycloakOnline,
  getKeycloakSSOUrl,
  extractKeycloakUserProfile,
  exchangeKeycloakCode,
} from "@/lib/keycloak";
import { MenuKey } from "@/types";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import CoolTransitionLoader, { TopLaserBar } from "@/components/CoolTransitionLoader";

function InnerApp() {
  const { createNewChat } = useOllama();
  const [user, setUser] = useState<UserSession | null>(null);
  // Default tampilan awal setelah login: 2 Pilihan Menu Besar (CRUD & RAG)
  const [activeMenu, setActiveMenu] = useState<MenuKey>("portal_landing");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [isRedirectingToKeycloak, setIsRedirectingToKeycloak] = useState(false);
  const [keycloakOnline, setKeycloakOnline] = useState<boolean | null>(null);

  // Status Transisi Keren Antar-Menu
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionInfo, setTransitionInfo] = useState({
    title: "Memuat Modul...",
    sub: "Sinkronisasi basis data presisi SSDM Polri",
  });

  const navigateToMenu = (target: MenuKey, title?: string, sub?: string) => {
    if (target === activeMenu) return;
    setIsTransitioning(true);
    setTransitionInfo({
      title:
        title ||
        (target === "crud_personel"
          ? "Membuka Modul CRUD Personel..."
          : target === "smart_qa_ai"
          ? "Menghubungkan ke Asisten AI (Ollama)..."
          : target === "portal_landing"
          ? "Kembali ke Menu Utama..."
          : "Memuat Data SOTK & Statistik SSDM..."),
      sub: sub || "Menyiapkan integrasi data presisi terenkripsi",
    });

    setTimeout(() => {
      setActiveMenu(target);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 250);
  };

  useEffect(() => {
    const initAuthFlow = async () => {
      if (typeof window === "undefined") return;

      // 1. Periksa Callback Hash OIDC (#access_token=...&id_token=...)
      if (window.location.hash && window.location.hash.includes("access_token")) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const idToken = hashParams.get("id_token") || undefined;
        if (accessToken) {
          try {
            const u = extractKeycloakUserProfile(accessToken, idToken);
            authStorage.setAuth(accessToken, u);
            sessionStorage.removeItem("infopers_logged_out");
            window.history.replaceState(null, "", window.location.pathname);
            setUser(u);
            setIsReady(true);
            return;
          } catch (e) {
            console.error("Gagal ekstrak token hash:", e);
          }
        }
      }

      // 2. Periksa Callback Query Code OIDC (?code=...)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        try {
          const exchange = await exchangeKeycloakCode(code);
          if (exchange.success && exchange.token && exchange.user) {
            authStorage.setAuth(exchange.token, exchange.user);
            sessionStorage.removeItem("infopers_logged_out");
            window.history.replaceState(null, "", window.location.pathname);
            setUser(exchange.user);
            setIsReady(true);
            return;
          }
        } catch (e) {
          console.error("Gagal tukar authorization code:", e);
        }
      }

      // 3. Periksa Sesi Lokal yang Sudah Ada
      const existing = authStorage.getUser();
      if (existing) {
        setUser(existing);
        sessionStorage.removeItem("infopers_logged_out");
        setIsReady(true);
        return;
      }

      // 4. PENGGUNA BELUM LOGIN -> LANGSUNG ALIKAN KE KEYCLOAK SSO (KECUALI ?mode=local)
      const isLocalMode = urlParams.has("mode");
      if (!isLocalMode) {
        const ssoUrl = getKeycloakSSOUrl();
        if (ssoUrl) {
          setIsRedirectingToKeycloak(true);
          const loginUrl = ssoUrl.includes("prompt=") ? ssoUrl : `${ssoUrl}&prompt=login`;
          window.location.replace(loginUrl);
          return;
        }
      }

      // Hanya untuk mode pengujian lokal (?mode=local)
      setIsReady(true);
    };

    initAuthFlow();

    const handleAuthExpired = () => {
      authStorage.clear();
      setUser(null);
      createNewChat();
      if (typeof window !== "undefined") {
        const ssoUrl = getKeycloakSSOUrl();
        if (ssoUrl) {
          const loginUrl = ssoUrl.includes("prompt=") ? ssoUrl : `${ssoUrl}&prompt=login`;
          window.location.replace(loginUrl);
        }
      }
    };

    window.addEventListener("auth_expired", handleAuthExpired);
    return () => window.removeEventListener("auth_expired", handleAuthExpired);
  }, []);

  const handleLogout = () => {
    setIsRedirectingToKeycloak(true);
    const idToken = user?.id_token;
    authStorage.clear();
    setUser(null);
    setAiInitialQuery("");
    createNewChat();

    // Logout terpusat langsung ke Keycloak SSO
    logoutKeycloakSession(idToken);
  };

  // Saat inisialisasi awal atau sedang dialihkan ke Keycloak SSO: return null agar bebas kedipan
  if (!isReady || isRedirectingToKeycloak) {
    return null;
  }

  // Tampilan jika pengguna belum login:
  if (!user) {
    const isLocalMode = typeof window !== "undefined" && window.location.search.includes("mode=local");
    if (isLocalMode) {
      return (
        <LoginScreen
          onLoginSuccess={(u) => {
            setUser(u);
            setActiveMenu("portal_landing");
            setAiInitialQuery("");
            createNewChat();
          }}
        />
      );
    }

    if (typeof window !== "undefined") {
      const ssoUrl = getKeycloakSSOUrl();
      if (ssoUrl) {
        const loginUrl = ssoUrl.includes("prompt=") ? ssoUrl : `${ssoUrl}&prompt=login`;
        window.location.replace(loginUrl);
      }
    }
    return null;
  }


  // Tampilan Pilihan Menu Utama (CRUD Kiri vs RAG Kanan) setelah login
  if (activeMenu === "portal_landing") {
    return (
      <div className="relative min-h-screen">
        <TopLaserBar isVisible={isTransitioning} />
        {isTransitioning && (
          <CoolTransitionLoader
            message={transitionInfo.title}
            subMessage={transitionInfo.sub}
          />
        )}
        <PortalLandingView
          user={user}
          onSelectCrud={() =>
            navigateToMenu(
              "crud_personel",
              "Membuka Basis Data Personel...",
              "Menyiapkan 483.355 data personel tervalidasi"
            )
          }
          onSelectRag={() =>
            navigateToMenu(
              "smart_qa_ai",
              "Menghubungkan ke Asisten AI...",
              "Mengaktifkan inferensi cerdas dan RAG Tribrata"
            )
          }
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // Tampilan CRUD Personel Langsung (Full-Screen Bersih Tanpa Menu Samping)
  if (activeMenu === "crud_personel") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative">
        <TopLaserBar isVisible={isTransitioning} />
        {isTransitioning && (
          <CoolTransitionLoader
            message={transitionInfo.title}
            subMessage={transitionInfo.sub}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 animate-page-enter">
          <CrudPersonelView
            onSwitchToRag={() =>
              navigateToMenu(
                "smart_qa_ai",
                "Mengalihkan ke Asisten AI...",
                "Kueri cerdas berbasis basis data personel"
              )
            }
            onBackToMenu={() =>
              navigateToMenu(
                "portal_landing",
                "Kembali ke Menu Utama...",
                "Portal terintegrasi SSDM Polri Presisi"
              )
            }
            onLogout={handleLogout}
          />
        </main>
        <OllamaControlModal />
      </div>
    );
  }

  // Breadcrumb mapping untuk tampilan website yang aktif
  const breadcrumbs: Record<MenuKey, string> = {
    portal_landing: "Pilihan Modul",
    crud_personel: "Rincian Data Personel",
    sotk_ssdm: "SOTK SSDM Polri",
    statistik_personel: "Data Personel SSDM Polri",
    data_polda: "Data Polda SSDM Polri",
    data_satker: "Data Satker SSDM Polri",
    smart_qa_ai: "Pencarian Cerdas Personel (Ollama AI)",
  };

  const isAiMode = activeMenu === "smart_qa_ai";

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] text-slate-900 dark:text-[#ececec] overflow-hidden font-sans transition-colors relative" suppressHydrationWarning>
      <TopLaserBar isVisible={isTransitioning} />
      {isTransitioning && (
        <CoolTransitionLoader
          message={transitionInfo.title}
          subMessage={transitionInfo.sub}
        />
      )}

      {/* 1. Sidebar: Mode ChatGPT (Akses Cerdas AI) vs Mode Website (Menu Portal Terpadu) */}
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={(m) => navigateToMenu(m)}
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isAiMode={isAiMode}
        onEnterWebsite={() => navigateToMenu("sotk_ssdm")}
        onBackToAi={() => navigateToMenu("smart_qa_ai")}
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
            onSearchClick={() => navigateToMenu("smart_qa_ai")}
            onSearchSubmit={(q: string) => {
              setAiInitialQuery(q);
              navigateToMenu("smart_qa_ai");
            }}
            onBackToAi={() => navigateToMenu("smart_qa_ai")}
            onBackToLanding={() => navigateToMenu("portal_landing")}
          />
        )}

        {/* View Content Area */}
        {isAiMode ? (
          /* Mode 1: Cover Bersih ChatGPT (Akses Ollama AI) */
          <main className="flex-1 overflow-hidden bg-white dark:bg-[#212121] transition-colors relative animate-page-enter">
            <OllamaAiView
              user={user}
              initialQuery={aiInitialQuery}
              onResetToNewChat={() => setAiInitialQuery("")}
              onEnterWebsite={() => navigateToMenu("sotk_ssdm")}
              onOpenCrud={() => navigateToMenu("crud_personel")}
              onBackToPortal={() => navigateToMenu("portal_landing")}
              onLogout={handleLogout}
            />
          </main>
        ) : (
          /* Mode 2: Tampilan Website Portal SSDM Lengkap */
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-100 dark:bg-neutral-950 transition-colors animate-page-enter">
            {activeMenu === "sotk_ssdm" && <SotkView />}
            {activeMenu === "statistik_personel" && (
              <DashboardView
                onOpenAI={(q?: string) => {
                  if (q) setAiInitialQuery(q);
                  navigateToMenu("smart_qa_ai");
                }}
              />
            )}
            {activeMenu === "data_polda" && <PoldaSatkerView defaultTab="polda" />}
            {activeMenu === "data_satker" && <PoldaSatkerView defaultTab="satker" />}
          </main>
        )}
      </div>

      {/* Modal Pengaturan & Menu Akses Ollama */}
      <OllamaControlModal />

      {/* Asisten AI Sebelah Kanan (3D & Profesional dengan Topik SSDM Polri) */}
      <RightAssistantModal
        onOpenFullAi={(q?: string) => {
          if (q) setAiInitialQuery(q);
          setActiveMenu("smart_qa_ai");
        }}
      />
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
