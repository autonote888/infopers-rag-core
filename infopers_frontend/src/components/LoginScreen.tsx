"use client";

import React, { useState, useEffect } from "react";
import { authStorage, UserSession } from "@/lib/api";
import {
  checkKeycloakOnline,
  getKeycloakSSOUrl,
  extractKeycloakUserProfile,
} from "@/lib/keycloak";
import { ShieldCheck, ExternalLink, RefreshCw, AlertTriangle, KeyRound } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [keycloakOnline, setKeycloakOnline] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showLocalEmergency, setShowLocalEmergency] = useState(false);

  // State untuk form darurat lokal (hanya jika Keycloak offline atau dibuka via ?mode=local)
  const [localUsername, setLocalUsername] = useState("admin.nasional");
  const [localPassword, setLocalPassword] = useState("Polri2026!");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    // 1. Cek parameter URL
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("mode") === "local") {
        setShowLocalEmergency(true);
      }
    }

    // 2. Periksa status server Keycloak
    checkKeycloakOnline().then((online) => {
      setKeycloakOnline(online);
    });

    // 3. Tangani callback hash OIDC (#access_token=...) jika ada
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const idToken = hashParams.get("id_token") || undefined;

      if (accessToken) {
        try {
          const user = extractKeycloakUserProfile(accessToken, idToken);
          authStorage.setAuth(accessToken, user);
          window.history.replaceState(null, "", window.location.pathname);
          sessionStorage.removeItem("infopers_logged_out");
          onLoginSuccess(user);
        } catch (e) {
          console.error("Gagal parse token OIDC:", e);
        }
      }
    }
  }, [onLoginSuccess]);

  const handleKeycloakLogin = () => {
    sessionStorage.removeItem("infopers_logged_out");
    const ssoUrl = getKeycloakSSOUrl();
    if (ssoUrl) {
      setIsRedirecting(true);
      window.location.href = ssoUrl;
    }
  };

  const handleLocalEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localUsername.trim() || !localPassword.trim()) {
      setLocalError("Mohon masukkan username dan password.");
      return;
    }

    setLocalLoading(true);
    setLocalError("");

    try {
      let res: Response;
      try {
        res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: localUsername, password: localPassword }),
        });
        if (!res.ok && res.status === 404) {
          res = await fetch("http://127.0.0.1:8085/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: localUsername, password: localPassword }),
          });
        }
      } catch {
        res = await fetch("http://127.0.0.1:8085/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: localUsername, password: localPassword }),
        });
      }

      const data = await res.json();
      if (res.ok && data.status === "success") {
        sessionStorage.removeItem("infopers_logged_out");
        authStorage.setAuth(data.token, data.user);
        onLoginSuccess(data.user);
      } else {
        setLocalError(data.message || "Gagal masuk. Periksa kredensial darurat.");
      }
    } catch {
      setLocalError("Gagal menghubungi server database internal port 8085.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-8 shadow-2xl text-center">
        {/* Logo & Header Presisi */}
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 drop-shadow-lg">
          <img
            src="/SSDM_Polri.png"
            alt="Logo SSDM Polri"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h1 className="text-base font-extrabold text-white tracking-wider uppercase">
          STAF SUMBER DAYA MANUSIA
        </h1>
        <p className="text-xs text-amber-400 font-bold mt-1 uppercase tracking-widest">
          KEPOLISIAN NEGARA REPUBLIK INDONESIA
        </p>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">
          Sistem Informasi Manajemen Personel (INFOPERS) 2026
        </p>

        {/* Status Indikator Keycloak */}
        <div className="my-6 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                keycloakOnline === true
                  ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"
                  : keycloakOnline === false
                  ? "bg-amber-400"
                  : "bg-slate-500"
              }`}
            />
            <span className="font-semibold text-slate-300">
              {keycloakOnline === true
                ? "Keycloak IAM SSO Aktif (Port 8080)"
                : keycloakOnline === false
                ? "Keycloak Offline (Mode Standalone)"
                : "Menghubungkan ke Server IAM..."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setKeycloakOnline(null);
              checkKeycloakOnline().then(setKeycloakOnline);
            }}
            title="Periksa Ulang Server Keycloak"
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tombol Login SSO Utama Keycloak */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleKeycloakLogin}
            disabled={isRedirecting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-900/30 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <span>{isRedirecting ? "Mengalihkan ke Keycloak SSO..." : "Masuk dengan Keycloak SSO"}</span>
            <ExternalLink className="w-4 h-4 opacity-80 ml-auto" />
          </button>

          <p className="text-[11px] text-slate-400">
            Login terpusat terpadu menggunakan akun dinas resmi Polri (NRP / NIP)
          </p>
        </div>

        {/* Opsi Login Darurat Internal (Hanya Tampil Jika Keycloak Offline atau Diklik Pengguna) */}
        {(!keycloakOnline || showLocalEmergency) && (
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-left">
            {!showLocalEmergency ? (
              <button
                type="button"
                onClick={() => setShowLocalEmergency(true)}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Buka Opsi Login Darurat (Database Internal)</span>
              </button>
            ) : (
              <form onSubmit={handleLocalEmergencySubmit} className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Mode Darurat (Database Internal)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLocalEmergency(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Tutup
                  </button>
                </div>

                {localError && (
                  <div className="p-2 rounded bg-red-900/40 border border-red-700 text-red-200 text-[11px]">
                    {localError}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Username / NRP
                  </label>
                  <input
                    type="text"
                    value={localUsername}
                    onChange={(e) => setLocalUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={localPassword}
                    onChange={(e) => setLocalPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={localLoading}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {localLoading ? "Memverifikasi..." : "Masuk Darurat"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
