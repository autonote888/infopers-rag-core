@echo off
title PELUNCUR SISTEM INFOPERS SSDM POLRI 2026
color 0B

echo ======================================================================
echo          SISTEM INFORMASI MANAJEMEN PERSONEL (INFOPERS)
echo                 SSDM KEPOLISIAN NEGARA REPUBLIK INDONESIA
echo ======================================================================
echo.

:: [AUTO BACKUP] Membuat backup otomatis data PostgreSQL lengkap & source code (.zip) sebelum sistem dijalankan
echo [PENCADANGAN OTOMATIS] Menjalankan backup menyeluruh (Data PostgreSQL + Keycloak + Kode)...
call powershell -ExecutionPolicy Bypass -File "%~dp0backup.ps1" -Keterangan "auto_backup_sebelum_run"
echo.

:: 0. Membersihkan port 3000 dan 8085 dari proses sebelumnya agar tidak bentrok
echo [1/5] Membebaskan alokasi port sistem (3000 dan 8085)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,8085 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: 1. Periksa dan Jalankan Keycloak IAM (Jika Docker Desktop Aktif)
echo.
echo [2/5] Memeriksa Layanan Keycloak Identity dan Access Management (Port 8080)...
docker info >nul 2>&1
if %errorlevel% equ 0 goto :START_KEYCLOAK
echo [INFO] Docker Desktop tidak aktif atau belum terinstal.
echo        Sistem berjalan mandiri menggunakan Autentikasi Internal Database port 8085.
goto :CHECK_OLLAMA

:START_KEYCLOAK
echo [OK] Docker Desktop aktif. Menyalakan container Keycloak IAM SSDM Polri...
cd /d "%~dp0keycloak_setup"
docker compose up -d
cd /d "%~dp0"
echo [OK] Keycloak SSO aktif di http://localhost:8080

:CHECK_OLLAMA

:: 2. Verifikasi dan Pendaftaran Model Ollama SSDM AI
echo.
echo [3/5] Memeriksa ketersediaan Model AI (Ollama)...
ollama list | findstr /i "ssdm-ai" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model ssdm-ai belum terdaftar. Menyiapkan registrasi lokal...
    if exist "%~dp0ai\Modelfile" (
        cd /d "%~dp0ai"
        ollama create ssdm-ai -f Modelfile
        cd /d "%~dp0"
    ) else (
        echo [PERINGATAN] File konfigurasi model tidak ditemukan di folder ai.
    )
) else (
    echo [OK] Model ssdm-ai terverifikasi siap digunakan.
)

:: 3. Jalankan Ollama SSDM AI
echo.
echo [3/5] Mengaktifkan Mesin AI Lokal (Ollama ssdm-ai)...
start "INFOPERS - SSDM AI (Ollama)" cmd /k "title SSDM AI (Ollama) && cd /d "%~dp0ai" && echo [SSDM AI AKTIF] Menjalankan model ssdm-ai... && ollama run ssdm-ai"

ping 127.0.0.1 -n 4 >nul

:: 4. Jalankan Server Backend Golang
echo.
echo [4/5] Menjalankan Server Backend (Golang :8085)...
start "INFOPERS - Backend REST API" cmd /k "title Backend Golang && cd /d "%~dp0infopers_backend" && .\infopers_server.exe"

ping 127.0.0.1 -n 3 >nul

:: 5. Jalankan Frontend Next.js
echo.
echo [5/5] Menjalankan Server Antarmuka Frontend (Next.js :3000)...
start "INFOPERS - Frontend Next.js" cmd /k "title Frontend Next.js && cd /d "%~dp0infopers_frontend" && npm run dev"

ping 127.0.0.1 -n 6 >nul

echo.
echo ======================================================================
echo SEMUA LAYANAN TELAH BERHASIL DIJALANKAN DALAM SATU KLIK!
echo - Web Portal   : http://localhost:3000
echo - Backend API  : http://localhost:8085
echo - IAM Keycloak : http://localhost:8080 (Jika Docker aktif)
echo - AI Engine    : Ollama (ssdm-ai) :11434
echo.
echo Akun Demo Pengujian:
echo - Superadmin : admin.nasional / Polri2026!
echo - Mandiri    : 04031518       / Polri2026!
echo ======================================================================
start http://localhost:3000
pause
