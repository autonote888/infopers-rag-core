@echo off
title PELUNCUR SISTEM INFOPERS SSDM POLRI 2026
color 0B

echo ======================================================================
echo          SISTEM INFORMASI MANAJEMEN PERSONEL (INFOPERS)
echo                 SSDM KEPOLISIAN NEGARA REPUBLIK INDONESIA
echo ======================================================================
echo.
echo [1/3] Menjalankan Server AI Lokal (Ollama)...
start "INFOPERS - Ollama AI Daemon" cmd /k "title Ollama AI && echo Menjalankan Ollama Llama-3... && ollama run llama3:8b"

timeout /t 3 /nobreak >nul

echo [2/3] Menjalankan Server Backend (Golang :8085)...
start "INFOPERS - Backend REST API" cmd /k "title Backend Golang && cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_backend" && .\infopers_server.exe"

timeout /t 2 /nobreak >nul

echo [3/3] Menjalankan Server Antarmuka Frontend (Next.js :3000)...
start "INFOPERS - Frontend Next.js" cmd /k "title Frontend Next.js && cd /d "d:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_frontend" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ======================================================================
echo SEMUA LAYANAN SEDANG BERJALAN!
echo Membuka antarmuka di browser: http://localhost:3000
echo.
echo Akun Demo Pengujian Lokal (Mock Testing Credentials):
echo - Superadmin : admin.nasional / Polri2026!
echo - Mandiri    : 04031518       / Polri2026!
echo ======================================================================
start http://localhost:3000
pause

