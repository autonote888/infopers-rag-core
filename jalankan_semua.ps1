# ======================================================================
# SCRIPT OTOMATIS PELUNCUR SISTEM INFOPERS SSDM POLRI 2026
# ======================================================================
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       SISTEM INFORMASI MANAJEMEN PERSONEL (INFOPERS) SSDM POLRI      " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Jalankan Ollama
Write-Host "`n[1/3] Menjalankan Mesin AI Ollama..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ollama run llama3:8b"

Start-Sleep -Seconds 3

# 2. Jalankan Backend Golang
Write-Host "[2/3] Menjalankan Backend Golang (:8085)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_backend'; .\infopers_server.exe"

Start-Sleep -Seconds 2

# 3. Jalankan Frontend Next.js
Write-Host "[3/3] Menjalankan Frontend Next.js (:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\1. MASTER\antigravityIDE\PROJECT\programingdatassdm\infopers_frontend'; npm run dev"

Start-Sleep -Seconds 4

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "Semua modul berhasil diaktifkan!" -ForegroundColor Green
Write-Host "Membuka browser ke http://localhost:3000 ..." -ForegroundColor White
Write-Host "Akun Demo Pengujian Lokal: admin.nasional / Polri2026!" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Process "http://localhost:3000"
