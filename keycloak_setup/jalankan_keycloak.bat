@echo off
title PELUNCUR KEYCLOAK IDENTITY ACCESS MANAGEMENT - SSDM POLRI
color 0E

echo ======================================================================
echo     KEYCLOAK IDENTITY ACCESS MANAGEMENT (SSO ENTERPRISE POLRI)
echo                 SSDM KEPOLISIAN NEGARA REPUBLIK INDONESIA
echo ======================================================================
echo.

:: 1. Periksa ketersediaan Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker belum terinstal atau perintah 'docker' belum masuk ke PATH!
    echo Silakan instal Docker Desktop terlebih dahulu untuk menjalankan Keycloak.
    echo.
    pause
    exit /b
)

:: 2. Periksa apakah Docker Daemon sedang aktif
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] Docker Desktop belum dinyalakan!
    echo Silakan jalankan Docker Desktop terlebih dahulu, lalu buka kembali skrip ini.
    echo.
    pause
    exit /b
)

echo [1/3] Menyiapkan kontainer Keycloak dan Database PostgreSQL khusus IAM...
cd /d "%~dp0"
docker compose up -d

echo.
echo [2/3] Menunggu inisialisasi server Keycloak (~15-30 detik)...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] Membuka Keycloak Admin Console...
echo - URL Admin Console : http://localhost:8080/admin
echo - Realm SSDM Polri  : ssdm-polri
echo - Admin Username    : admin
echo - Admin Password    : Polri2026!
echo.
echo Akun Demo Personel yang Siap Pakai:
echo - Superadmin : admin.nasional / Polri2026! (Role: SUPERADMIN)
echo - Personel   : 04031518       / Polri2026! (Role: PERSONEL)
echo ======================================================================
start http://localhost:8080/admin
pause
