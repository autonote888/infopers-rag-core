"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export interface OllamaStatusData {
  status: "online" | "offline";
  host: string;
  is_available: boolean;
  message: string;
  models: string[];
}

export type AIMode = "rag_ollama" | "regulasi_sotk" | "pure_llm";
export type AnswerStyle = "nota_dinas" | "ringkasan" | "bebas";

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: any[];
}

interface OllamaContextType {
  statusData: OllamaStatusData | null;
  isLoadingStatus: boolean;
  selectedModel: string;
  selectedMode: AIMode;
  answerStyle: AnswerStyle;
  ollamaHost: string;
  isSettingsOpen: boolean;
  deepThinking: boolean;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  toggleDeepThinking: () => void;
  setSelectedModel: (model: string) => void;
  setSelectedMode: (mode: AIMode) => void;
  setAnswerStyle: (style: AnswerStyle) => void;
  setOllamaHost: (host: string) => void;
  checkStatus: (customHost?: string) => Promise<boolean>;
  createNewChat: () => void;
  selectSession: (id: string) => void;
  saveCurrentSession: (messages: any[]) => void;
  deleteSession: (id: string) => void;
}

const OllamaContext = createContext<OllamaContextType | undefined>(undefined);

export function OllamaProvider({ children }: { children: React.ReactNode }) {
  const [statusData, setStatusData] = useState<OllamaStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ssdm-ai:latest");
  const [selectedMode, setSelectedMode] = useState<AIMode>("rag_ollama");
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>("nota_dinas");
  const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Muat preferensi dan riwayat chat dari localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHost = localStorage.getItem("ssdm_ollama_host");
      if (savedHost) setOllamaHost(savedHost);

      const savedModel = localStorage.getItem("ssdm_ollama_model");
      if (savedModel) setSelectedModel(savedModel);

      const savedMode = localStorage.getItem("ssdm_ollama_mode") as AIMode;
      if (savedMode) setSelectedMode(savedMode);

      const savedStyle = localStorage.getItem("ssdm_ollama_style") as AnswerStyle;
      if (savedStyle) setAnswerStyle(savedStyle);

      const savedSessions = localStorage.getItem("ssdm_chat_sessions_v3");
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatSessions(parsed);
          }
        } catch {}
      }
      // Pastikan setiap baru membuka link web, default selalu Chat Baru (tampilan bersih)
      setCurrentSessionId(null);
    }
  }, []);

  const checkStatus = async (targetHost?: string): Promise<boolean> => {
    const hostToCheck = targetHost || ollamaHost;
    setIsLoadingStatus(true);
    try {
      const endpoint = `/ai/ollama-status?host=${encodeURIComponent(hostToCheck)}`;
      const res = await fetchWithAuth(endpoint);
      if (res.ok) {
        const json = await res.json();
        setStatusData(json);
        if (json.models && json.models.length > 0) {
          const ssdmModel = json.models.find((m: string) => m.toLowerCase().includes("ssdm-ai"));
          if (ssdmModel) {
            setSelectedModel(ssdmModel);
          } else if (!json.models.includes(selectedModel)) {
            setSelectedModel(json.models[0]);
          }
        }
        return json.is_available === true;
      }
    } catch {
      setStatusData({
        status: "offline",
        host: hostToCheck,
        is_available: false,
        message: "Layanan offline. Sistem beralih ke database PostgreSQL internal.",
        models: ["llama3:8b", "qwen2.5:7b", "mistral:7b", "deepseek-r1:7b"],
      });
      return false;
    } finally {
      setIsLoadingStatus(false);
    }
    return false;
  };

  useEffect(() => {
    checkStatus(ollamaHost);
    // Polling setiap 3 detik agar langsung mendeteksi saat AI dibuka atau ditutup
    const timer = setInterval(() => {
      checkStatus(ollamaHost);
    }, 3000);

    // Langsung cek ulang saat pengguna kembali ke jendela browser
    const handleFocus = () => {
      checkStatus(ollamaHost);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, [ollamaHost]);

  const handleSetHost = (host: string) => {
    setOllamaHost(host);
    if (typeof window !== "undefined") {
      localStorage.setItem("ssdm_ollama_host", host);
    }
  };

  const handleSetModel = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("ssdm_ollama_model", model);
    }
  };

  const handleSetMode = (mode: AIMode) => {
    setSelectedMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("ssdm_ollama_mode", mode);
    }
  };

  const handleSetAnswerStyle = (style: AnswerStyle) => {
    setAnswerStyle(style);
    if (typeof window !== "undefined") {
      localStorage.setItem("ssdm_ollama_style", style);
    }
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const saveCurrentSession = (messages: any[]) => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find((m) => m.sender === "user")?.text || "Obrolan Baru";
    const shortTitle = firstUserMsg.length > 32 ? firstUserMsg.slice(0, 32) + "..." : firstUserMsg;

    setChatSessions((prev) => {
      let updated: ChatSession[];
      if (currentSessionId && prev.some((s) => s.id === currentSessionId)) {
        updated = prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages, timestamp: "Baru saja" } : s
        );
      } else {
        const newId = "sess_" + Date.now();
        setCurrentSessionId(newId);
        updated = [
          {
            id: newId,
            title: shortTitle,
            timestamp: "Baru saja",
            messages,
          },
          ...prev,
        ];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("ssdm_chat_sessions_v3", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteSession = (id: string) => {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("ssdm_chat_sessions_v3", JSON.stringify(filtered));
      }
      return filtered;
    });
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  return (
    <OllamaContext.Provider
      value={{
        statusData,
        isLoadingStatus,
        selectedModel,
        selectedMode,
        answerStyle,
        ollamaHost,
        isSettingsOpen,
        deepThinking,
        chatSessions,
        currentSessionId,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        toggleSettings: () => setIsSettingsOpen((prev) => !prev),
        toggleDeepThinking: () => setDeepThinking((prev) => !prev),
        setSelectedModel: handleSetModel,
        setSelectedMode: handleSetMode,
        setAnswerStyle: handleSetAnswerStyle,
        setOllamaHost: handleSetHost,
        checkStatus,
        createNewChat,
        selectSession,
        saveCurrentSession,
        deleteSession,
      }}
    >
      {children}
    </OllamaContext.Provider>
  );
}

export function useOllama() {
  const context = useContext(OllamaContext);
  if (!context) {
    throw new Error("useOllama must be used within an OllamaProvider");
  }
  return context;
}
