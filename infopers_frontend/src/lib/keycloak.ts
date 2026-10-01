import { UserSession } from "@/types";
import { authStorage } from "@/lib/api";

export const KEYCLOAK_CONFIG = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "ssdm-polri",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "infopers-frontend",
};

// Dekoder token JWT standar tanpa library eksternal
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Cek apakah server Keycloak sedang aktif & merespon
export async function checkKeycloakOnline(): Promise<boolean> {
  try {
    const res = await fetch(
      `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/.well-known/openid-configuration`,
      { method: "GET", mode: "cors", cache: "no-store" }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// Ekstrak profil pengguna dari klaim JWT Keycloak
export function extractKeycloakUserProfile(token: string, idToken?: string): UserSession {
  const claims = parseJwt(token) || {};
  const idClaims = idToken ? parseJwt(idToken) || {} : {};

  const roles: string[] = claims.realm_access?.roles || [];
  let roleLevel = "PERSONEL";
  if (roles.includes("SUPERADMIN")) {
    roleLevel = "SUPERADMIN";
  } else if (roles.includes("ADMIN_POLDA")) {
    roleLevel = "ADMIN_POLDA";
  } else if (roles.includes("ADMIN_POLRES")) {
    roleLevel = "ADMIN_POLRES";
  }

  const username = claims.preferred_username || idClaims.preferred_username || "user.polri";
  const nama =
    claims.name ||
    idClaims.name ||
    (claims.given_name ? `${claims.given_name} ${claims.family_name || ""}`.trim() : username);

  let pangkat = "ANGGOTA POLRI";
  if (roleLevel === "SUPERADMIN") {
    pangkat = "KOMBES POL";
  } else if (roleLevel === "ADMIN_POLDA") {
    pangkat = "AKBP";
  }

  return {
    nip_nrp: username,
    username: username,
    nama: nama,
    pangkat: pangkat,
    role_level: roleLevel,
    is_keycloak: true,
    id_token: idToken,
  };
}

// 1. Direct Access Grants Login (In-App Form ke Keycloak)
export async function loginKeycloakDirect(username: string, password: string): Promise<{
  success: boolean;
  token?: string;
  user?: UserSession;
  message?: string;
}> {
  try {
    const tokenEndpoint = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append("client_id", KEYCLOAK_CONFIG.clientId);
    params.append("grant_type", "password");
    params.append("username", username.trim());
    params.append("password", password);
    params.append("scope", "openid profile email");

    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.error_description || "Kredensial Keycloak tidak cocok atau akun dinonaktifkan.",
      };
    }

    const user = extractKeycloakUserProfile(data.access_token, data.id_token);
    return {
      success: true,
      token: data.access_token,
      user: user,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server Keycloak di port 8080.",
    };
  }
}

// 2. URL SSO Redirect (OIDC Standard Authorization Flow)
export function getKeycloakSSOUrl(): string {
  if (typeof window === "undefined") return "";
  const redirectUri = encodeURIComponent(window.location.origin + "/");
  // Mendukung standard token & id_token redirect
  return `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CONFIG.clientId}&response_type=token%20id_token&scope=openid%20profile%20email&redirect_uri=${redirectUri}&nonce=${Date.now()}`;
}

// 3. Tukar Authorization Code dengan Token (Standard Flow Code Exchange)
export async function exchangeKeycloakCode(code: string): Promise<{
  success: boolean;
  token?: string;
  user?: UserSession;
  message?: string;
}> {
  try {
    const tokenEndpoint = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append("client_id", KEYCLOAK_CONFIG.clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", window.location.origin + "/");

    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.error_description || "Gagal menukar kode otorisasi Keycloak.",
      };
    }

    const user = extractKeycloakUserProfile(data.access_token, data.id_token);
    return {
      success: true,
      token: data.access_token,
      user: user,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Gagal terhubung ke endpoint token Keycloak.",
    };
  }
}

// 4. Single Logout (SLO) Keycloak
export function logoutKeycloakSession(idToken?: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("infopers_logged_out");
    authStorage.clear();

    const postLogoutUri = encodeURIComponent(window.location.origin + "/");
    let logoutUrl = "";
    if (idToken) {
      logoutUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout?id_token_hint=${encodeURIComponent(
        idToken
      )}&post_logout_redirect_uri=${postLogoutUri}`;
    } else {
      logoutUrl = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout?client_id=${
        KEYCLOAK_CONFIG.clientId
      }&post_logout_redirect_uri=${postLogoutUri}`;
    }

    window.location.href = logoutUrl;
  } catch (e) {
    const ssoUrl = getKeycloakSSOUrl();
    window.location.href = ssoUrl ? `${ssoUrl}&prompt=login` : "/";
  }
}
