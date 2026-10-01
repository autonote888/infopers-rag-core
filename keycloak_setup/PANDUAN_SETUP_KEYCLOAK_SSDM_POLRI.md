# PANDUAN INTEGRASI KEYCLOAK STANDALONE SSO - SSDM POLRI 2026

Panduan ini mendokumentasikan implementasi arsitektur **Identity and Access Management (IAM)** berbasis **Keycloak** yang berjalan secara mandiri (*standalone*) untuk sistem INFOPERS SSDM Polri Presisi.

---

## 1. MENGAPA MENGGUNAKAN KEYCLOAK TERPISAH (*DECOUPLED*)?

1. **Pemisahan Beban (*Zero Performance Impact*)**: 
   - Server Keycloak mengurus autentikasi, brute-force protection, password hash, dan session token.
   - Server Backend Golang dan Frontend Next.js tidak terbebani logika akun dan hanya fokus pada data 483K personel dan kueri AI.
2. **Tanpa Perlu Email Pribadi (100% Offline & On-Premise)**:
   - Keycloak tidak memerlukan email saat pendaftaran awal.
   - Personel kepolisian cukup login menggunakan **NRP / NIP** dan kata sandi kedinasan.
3. **Mendukung SSO Multi-Aplikasi Mabes Polri**:
   - Jika ada aplikasi baru (SIPP, E-Rohani, E-Mental, SIPK, Catpers), aplikasi tersebut cukup didaftarkan sebagai Client di Keycloak tanpa membuat sistem login baru.

---

## 2. STRUKTUR BERKAS SETUP KEYCLOAK

Semua berkas konfigurasi Keycloak terisolasi rapi di dalam direktori `keycloak_setup/`:

```text
keycloak_setup/
├── docker-compose.yml              # Konfigurasi container Keycloak & DB PostgreSQL khusus IAM
├── realm-ssdm-polri.json           # Template konfigurasi Realm, Client, Role, dan User siap pakai
├── middleware_keycloak_example.go  # Contoh kode middleware Go untuk validasi token RS256 via JWKS
├── jalankan_keycloak.bat           # Skrip peluncur 1-klik Keycloak via Docker
├── hentikan_keycloak.bat           # Skrip untuk mematikan container Keycloak
├── themes/                         # Folder untuk menaruh Custom Theme login berdesain Presisi
└── PANDUAN_SETUP_KEYCLOAK_SSDM_POLRI.md # Dokumen panduan ini
```

---

## 3. CARA MENJALANKAN KEYCLOAK

### Langkah 1: Pastikan Docker Desktop Aktif
Pastikan Docker Desktop di komputer Anda sudah dalam kondisi berjalan (*Running*).

### Langkah 2: Jalankan Skrip 1-Klik
Cukup klik ganda berkas shortcut:
```cmd
jalankan_keycloak.bat
```
Atau jalankan di terminal:
```bash
cd keycloak_setup
docker compose up -d
```

### Langkah 3: Akses Admin Console
Buka peramban di:
```text
http://localhost:8080/admin
```
* **Username**: `admin`
* **Password**: `Polri2026!`

---

## 4. KONFIGURASI REALM SSDM POLRI YANG SUDAH TERSEDIA

Berkas `realm-ssdm-polri.json` akan otomatis diimpor saat Keycloak pertama kali menyala:

* **Nama Realm**: `ssdm-polri`
* **Client Terdaftar**:
  1. `infopers-frontend`: Client publik untuk web Next.js (Mendukung alur OIDC Authorization Code Flow dengan proteksi PKCE S256).
  2. `infopers-backend`: Resource Server untuk REST API Golang (Bearer-only validation).
* **Peran (*Roles*) yang Disediakan**:
  - `SUPERADMIN` : Hak akses tertinggi Mabes Polri.
  - `ADMIN_POLDA`: Pengelola personel di tingkat Polda jajaran.
  - `ADMIN_POLRES`: Pengelola personel di tingkat Polres.
  - `PERSONEL`   : Hak akses mandiri bagi anggota Polri & ASN.
* **Akun Pengujian Bawaan**:
  - `admin.nasional` / `Polri2026!` (Role: `SUPERADMIN`)
  - `04031518` / `Polri2026!` (Role: `PERSONEL`)

---

## 5. CARA MENGUBAH TAMPILAN LOGIN MENJADI KEREN (CUSTOM THEME)

Tampilan login Keycloak dapat diubah total menjadi antarmuka elegan khas SSDM Polri Presisi (*glassmorphism*, dark blue background, logo resmi Polri beranimasi):

### Metode A: Menggunakan "Keycloakify" (React + Tailwind CSS)
1. Buat tema menggunakan framework Keycloakify:
   ```bash
   npx -y keycloakify@latest
   ```
2. Anda bisa langsung menyalin komponen desain dari [`infopers_frontend/src/components/LoginScreen.tsx`](../infopers_frontend/src/components/LoginScreen.tsx).
3. Build tema, lalu masukkan file hasil build ke folder `keycloak_setup/themes/ssdm-polri/`.

### Metode B: Mengaktifkan Tema di Keycloak Admin
1. Buka Keycloak Admin Console: `http://localhost:8080/admin`.
2. Masuk ke **Realm Settings** -> Tab **Themes**.
3. Pada pilihan **Login Theme**, pilih nama tema Anda: `ssdm-polri`.
4. Klik **Save**. Halaman login seketika berubah mengikuti desain baru.

---

## 6. CARA MENGHUBUNGKAN APLIKASI INFOPERS KE KEYCLOAK

### A. Pada Frontend Next.js:
Pasang library resmi OpenID Connect:
```bash
npm install keycloak-js
```
Inisialisasi klien di `src/lib/keycloak.ts`:
```typescript
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "ssdm-polri",
  clientId: "infopers-frontend",
});

export default keycloak;
```

### B. Pada Backend Golang:
Gunakan middleware verifikasi asimetrik yang telah disediakan di:
[`keycloak_setup/middleware_keycloak_example.go`](./middleware_keycloak_example.go)

Middleware ini:
1. Membaca public key resmi dari Keycloak JWKS (`http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/certs`).
2. Meng-cache kunci di memori internal Golang.
3. Memvalidasi token masuk dalam waktu **< 1 milidetik** tanpa membebani server Keycloak.
4. Mengekstrak peran pengguna dari `claims.RealmAccess.Roles`.

---

## 7. CARA MENGHENTIKAN LAYANAN KEYCLOAK
Jika sudah selesai melakukan pengujian:
Cukup klik ganda berkas:
```cmd
hentikan_keycloak.bat
```
Seluruh container Keycloak dan database IAM akan dinonaktifkan dengan aman tanpa menghapus data yang telah tersimpan.
