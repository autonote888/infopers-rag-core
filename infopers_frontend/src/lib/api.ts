import { UserSession } from "@/types";

const API_BASE = typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8085/api";

export type { UserSession };

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("infopers_token");
  },
  getUser: (): UserSession | null => {
    if (typeof window === "undefined") return null;
    const data = sessionStorage.getItem("infopers_user");
    return data ? JSON.parse(data) : null;
  },
  setAuth: (token: string, user: UserSession) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("infopers_token", token);
    sessionStorage.setItem("infopers_user", JSON.stringify(user));
  },
  clear: () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("infopers_token");
    sessionStorage.removeItem("infopers_user");
    try {
      localStorage.removeItem("infopers_token");
      localStorage.removeItem("infopers_user");
    } catch {}
  },
};

// Bersihkan legacy localStorage otomatis agar Login Screen langsung tampil
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("infopers_token");
    localStorage.removeItem("infopers_user");
  } catch {}
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Untuk endpoint AI, arahkan langsung ke backend port 8085 agar tidak terpotong timeout proxy 30 detik Next.js
  const primaryUrl = endpoint.startsWith("/ai/")
    ? `http://127.0.0.1:8085/api${endpoint}`
    : `${API_BASE}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(primaryUrl, {
      ...options,
      headers,
    });
    if (!response.ok && primaryUrl.startsWith("/api")) {
      response = await fetch(`http://127.0.0.1:8085/api${endpoint}`, {
        ...options,
        headers,
      });
    }
  } catch {
    response = await fetch(`http://127.0.0.1:8085/api${endpoint}`, {
      ...options,
      headers,
    });
  }

  if (response.status === 401) {
    authStorage.clear();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.dispatchEvent(new Event("auth_expired"));
    }
  }

  return response;
}
