import { UserSession } from "@/types";

const API_BASE = typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8085/api";

export type { UserSession };

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("infopers_token");
  },
  getUser: (): UserSession | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("infopers_user");
    return data ? JSON.parse(data) : null;
  },
  setAuth: (token: string, user: UserSession) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("infopers_token", token);
    localStorage.setItem("infopers_user", JSON.stringify(user));
  },
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("infopers_token");
    localStorage.removeItem("infopers_user");
  },
};

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok && response.status === 404 && API_BASE === "/api") {
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
