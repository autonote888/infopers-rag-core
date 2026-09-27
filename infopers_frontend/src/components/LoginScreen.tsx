"use client";

import React, { useState } from "react";
import { Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { authStorage, UserSession } from "@/lib/api";

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("admin.nasional");
  const [password, setPassword] = useState("Polri2026!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Mohon masukkan username dan kata sandi");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      let res: Response;
      try {
        res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok && res.status === 404) {
          res = await fetch("http://127.0.0.1:8085/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
        }
      } catch {
        res = await fetch("http://127.0.0.1:8085/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
      }

      const data = await res.json();

      if (res.ok && data.status === "success") {
        authStorage.setAuth(data.token, data.user);
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || "Gagal masuk. Cek kredensial Anda.");
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server Go backend di port 8085.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <img
              src="/SSDM_Polri.png"
              alt="Logo SSDM Polri"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
            STAF SUMBER DAYA MANUSIA
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">
            KEPOLISIAN NEGARA REPUBLIK INDONESIA
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Username / NRP
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin.nasional atau NRP"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-black hover:bg-slate-800 text-white font-semibold text-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-1 shadow-2xs"
          >
            {loading ? "Memverifikasi..." : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
            Pilihan Akses Pengguna:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin.nasional", "Polri2026!")}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-900">ADMINISTRATOR</div>
              <div className="text-[10px] text-slate-500 font-mono">admin.nasional</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("04031518", "Polri2026!")}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-900">PERSONEL (MANDIRI)</div>
              <div className="text-[10px] text-slate-500 font-mono">04031518</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
