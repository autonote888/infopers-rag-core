# Script Otomatis Backup Project INFOPERS SSDM POLRI
# Menyimpan seluruh source code backend & frontend ke dalam file .zip dengan stempel tanggal & waktu serta label perubahan
param(
    [string]$Keterangan = "penambahan_menu_record_memory_dan_dokumen_kapasitas"
)

$projectRoot = $PSScriptRoot
$backupDir = Join-Path $projectRoot "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Bersihkan karakter agar aman untuk nama file Windows
$cleanKeterangan = $Keterangan.Trim() -replace '[^\w\s-]', '' -replace '\s+', '_'
if ($cleanKeterangan) {
    $zipFileName = "backup_infopers_${timestamp}_${cleanKeterangan}.zip"
} else {
    $zipFileName = "backup_infopers_${timestamp}.zip"
}

$zipFilePath = Join-Path $backupDir $zipFileName

# Folder sementara untuk filter file (mengabaikan node_modules, .next, backend.exe, dll)
$tempDir = Join-Path $env:TEMP "infopers_backup_staging_$timestamp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MEMULAI PROSES BACKUP KODINGAN INFOPERS SSDM POLRI      " -ForegroundColor Yellow
Write-Host "  Waktu Backup : $(Get-Date -Format 'dd MMMM yyyy HH:mm:ss')" -ForegroundColor White
Write-Host "  Keterangan   : $cleanKeterangan" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Salin Backend
$backendDest = Join-Path $tempDir "infopers_backend"
New-Item -ItemType Directory -Path $backendDest | Out-Null
robocopy (Join-Path $projectRoot "infopers_backend") $backendDest /E /XF *.exe *.log scratch_* /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

# 2. Salin Frontend (Abaikan node_modules dan .next)
$frontendDest = Join-Path $tempDir "infopers_frontend"
New-Item -ItemType Directory -Path $frontendDest | Out-Null
robocopy (Join-Path $projectRoot "infopers_frontend") $frontendDest /E /XD node_modules .next .git /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

# 3. Salin File Root (README, dokumen perencanaan, backup scripts, dll)
Get-ChildItem -Path $projectRoot -File | Where-Object { $_.Name -notmatch "\.zip$" } | ForEach-Object {
    Copy-Item $_.FullName -Destination $tempDir
}

# 4. Kompresi ke .ZIP
Write-Host "Sedang mengompresi ke file zip..." -ForegroundColor Gray
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFilePath -Force

# Bersihkan staging folder
Remove-Item -Recurse -Force $tempDir

$zipSize = (Get-Item $zipFilePath).Length / 1MB
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host " [$timestamp] BACKUP BERHASIL DIBUAT DENGAN SUKSES! " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host " WAKTU / STEMPEL  : $timestamp" -ForegroundColor Cyan
Write-Host " KETERANGAN       : $cleanKeterangan" -ForegroundColor Yellow
Write-Host " FILE ARSIP       : $zipFileName" -ForegroundColor White
Write-Host " LOKASI PENYIMPAN : $zipFilePath" -ForegroundColor Gray
Write-Host " UKURAN ARSIP     : $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host " DAFTAR MENU DAN FITUR TERBARU PADA ARSIP INI:" -ForegroundColor Yellow
Write-Host "   1. [SSDM Artificial Intelligence] : Cover bersih, branding resmi Presisi, 1 menu portal" -ForegroundColor White
Write-Host "   2. [Kotak Dialog Percakapan]      : 'Hari ini ada agenda apa?', Berpikir, Mic, Kirim" -ForegroundColor White
Write-Host "   3. [Menu Record Memory & NVRAM]   : Pantau & rekam live RAM 15.7GB, VRAM 1GB, stack proses" -ForegroundColor White
Write-Host "   4. [Dokumen Kapasitas Kebutuhan]  : MENENTUKAN_KAPASITAS_KEBUTUHAN_SAAT_INI.md" -ForegroundColor White
Write-Host "   5. [Menu Dokumen Pengadaan]       : Dokumen Perencanaan Hardware AI, Analisis Library & RAB" -ForegroundColor White
Write-Host "   6. [Panel Pengendali Ollama]      : Switcher Model (Llama3/Qwen/DeepSeek) dan Tes Host 11434" -ForegroundColor White
Write-Host "   7. [NLP Parser Kueri AI]          : Menemukan NIP/Nama/Satker spesifik (Contoh: PPPK Puskeu)" -ForegroundColor White
Write-Host "   8. [Dukungan Data PPPK]           : 1.666 data PPPK + 15.718 ASN + 465.971 Polri aktif" -ForegroundColor White
Write-Host "   9. [Portal SSDM 6 Pilar]          : 22 Submodul Lengkap Presisi Terintegrasi" -ForegroundColor White
Write-Host "==========================================================================" -ForegroundColor Green
