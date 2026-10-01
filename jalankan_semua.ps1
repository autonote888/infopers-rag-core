# ======================================================================
# SCRIPT OTOMATIS PELUNCUR SISTEM INFOPERS SSDM POLRI 2026
# ======================================================================
$root = $PSScriptRoot
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       SISTEM INFORMASI MANAJEMEN PERSONEL (INFOPERS) SSDM POLRI      " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

# 0. Backup Otomatis Project & Basis Data Lengkap Sebelum Run
Write-Host "`n[PENCADANGAN OTOMATIS] Menjalankan pencadangan data lengkap (PostgreSQL + Keycloak + Kode)..." -ForegroundColor Yellow
& "$root\backup.ps1" -Keterangan "auto_backup_sebelum_run"

# 1. Periksa dan Jalankan Keycloak IAM (Jika Docker Berjalan)
Write-Host "`n[1/4] Memeriksa Layanan Keycloak Identity & Access Management (Port 8080)..." -ForegroundColor Green
$dockerRunning = $false
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) { $dockerRunning = $true }
} catch {}

if ($dockerRunning) {
    Write-Host "  [OK] Docker aktif. Menyalakan container Keycloak IAM SSDM Polri..." -ForegroundColor Green
    Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$root\keycloak_setup\docker-compose.yml", "up", "-d" -NoNewWindow -Wait
    Write-Host "  [OK] Keycloak SSO aktif di http://localhost:8080" -ForegroundColor Gray
} else {
    Write-Host "  [INFO] Docker Desktop belum aktif. Sistem berjalan mandiri dengan Database Lokal (:8085)." -ForegroundColor Yellow
}

# 2. Jalankan Ollama SSDM AI
Write-Host "`n[2/4] Menjalankan Mesin AI Ollama (ssdm-ai)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ai'; ollama run ssdm-ai"

Start-Sleep -Seconds 3

# 3. Jalankan Backend Golang
Write-Host "[3/4] Menjalankan Backend Golang (:8085)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\infopers_backend'; .\infopers_server.exe"

Start-Sleep -Seconds 2

# 4. Jalankan Frontend Next.js
Write-Host "[4/4] Menjalankan Frontend Next.js (:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\infopers_frontend'; npm run dev"

Start-Sleep -Seconds 4

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "Semua modul berhasil diaktifkan!" -ForegroundColor Green
Write-Host "- Web Portal   : http://localhost:3000" -ForegroundColor White
Write-Host "- Backend API  : http://localhost:8085" -ForegroundColor White
Write-Host "- IAM Keycloak : http://localhost:8080 (Jika Docker aktif)" -ForegroundColor White
Write-Host "- AI Engine    : Ollama (ssdm-ai) :11434" -ForegroundColor White
Write-Host "Akun Demo Pengujian: admin.nasional / Polri2026!" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Process "http://localhost:3000"

