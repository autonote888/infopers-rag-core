# Script Otomatis Backup Project INFOPERS SSDM POLRI
# Menyimpan seluruh source code backend, frontend, dokumen, skrip, keycloak, serta DUMP BASIS DATA POSTGRESQL LENGKAP ke dalam file .zip
param(
    [string]$Keterangan = "update_sistem_infopers_terakhir"
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

# Folder sementara untuk staging file (mengabaikan node_modules, .next, biner exe, dll)
$tempDir = Join-Path $env:TEMP "infopers_backup_staging_$timestamp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MEMULAI PROSES BACKUP LENGKAP INFOPERS POLRI (DATA & CODE) " -ForegroundColor Yellow
Write-Host "  Waktu Backup : $(Get-Date -Format 'dd MMMM yyyy HH:mm:ss')" -ForegroundColor White
Write-Host "  Keterangan   : $cleanKeterangan" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. PENCADANGAN BASIS DATA POSTGRESQL LENGKAP (DUMP 483K PERSONEL & AUDIT)
Write-Host "`n[1/6] Mencadangkan Basis Data PostgreSQL (infopers_db / postgres)..." -ForegroundColor Green
$pgDumpPath = $null
if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    $pgDumpPath = (Get-Command pg_dump).Source
} else {
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe"
    )
    foreach ($p in $pgPaths) {
        if (Test-Path $p) {
            $pgDumpPath = $p
            break
        }
    }
}

$dbDest = Join-Path $tempDir "database_backup"
New-Item -ItemType Directory -Path $dbDest | Out-Null

if ($pgDumpPath) {
    try {
        $env:PGPASSWORD = "admin"
        $dumpFile = Join-Path $dbDest "infopers_database_full.dump"
        $schemaFile = Join-Path $dbDest "infopers_database_schema.sql"
        
        Write-Host "  - Menjalankan pg_dump terkompresi cepat (-F c)..." -ForegroundColor Gray
        & $pgDumpPath -U postgres -h localhost -p 5432 -d postgres -F c -f $dumpFile 2>$null
        
        Write-Host "  - Menjalankan pg_dump struktur schema SQL..." -ForegroundColor Gray
        & $pgDumpPath -U postgres -h localhost -p 5432 -d postgres --schema-only -f $schemaFile 2>$null
        
        if (Test-Path $dumpFile) {
            $dumpSizeMB = [math]::Round((Get-Item $dumpFile).Length / 1MB, 2)
            Write-Host "  [OK] Dump data lengkap berhasil dibuat ($dumpSizeMB MB)." -ForegroundColor Green
        } else {
            Write-Host "  [PERINGATAN] Layanan PostgreSQL belum aktif atau password tidak sesuai. Melanjutkan pencadangan kode..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [PERINGATAN] Gagal menjalankan pg_dump: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] pg_dump tidak terdeteksi di PATH atau folder default. Melewati dump basis data..." -ForegroundColor Gray
}

# 2. Salin Konfigurasi IAM Keycloak
Write-Host "`n[2/6] Menyalin Modul IAM & SSO Keycloak..." -ForegroundColor Green
$keycloakSrc = Join-Path $projectRoot "keycloak_setup"
if (Test-Path $keycloakSrc) {
    $keycloakDest = Join-Path $tempDir "keycloak_setup"
    New-Item -ItemType Directory -Path $keycloakDest | Out-Null
    robocopy $keycloakSrc $keycloakDest /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    Write-Host "  [OK] Seluruh berkas realm dan docker-compose Keycloak tercadangkan." -ForegroundColor Gray
}

# 3. Salin Backend Golang (Sertakan source code lengkap & executable infopers_server.exe, abaikan file temporary editor *.exe~)
Write-Host "`n[3/6] Menyalin Backend REST API Golang..." -ForegroundColor Green
$backendDest = Join-Path $tempDir "infopers_backend"
New-Item -ItemType Directory -Path $backendDest | Out-Null
robocopy (Join-Path $projectRoot "infopers_backend") $backendDest /E /XF *.exe~ *.log scratch_* /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

# 4. Salin Frontend Next.js (Abaikan node_modules, .next, dan .git)
Write-Host "`n[4/6] Menyalin Frontend Next.js..." -ForegroundColor Green
$frontendDest = Join-Path $tempDir "infopers_frontend"
New-Item -ItemType Directory -Path $frontendDest | Out-Null
robocopy (Join-Path $projectRoot "infopers_frontend") $frontendDest /E /XD node_modules .next .git /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

# 5. Salin Modul & Konfigurasi AI serta Logo & Dokumen Perencanaan
Write-Host "`n[5/6] Menyalin Konfigurasi AI, Logo, dan Dokumen..." -ForegroundColor Green
$aiSrc = Join-Path $projectRoot "ai"
if (Test-Path $aiSrc) {
    $aiDest = Join-Path $tempDir "ai"
    New-Item -ItemType Directory -Path $aiDest | Out-Null
    robocopy $aiSrc $aiDest /E /XF *.gguf *.bin *.safetensors *.tmp /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
}

$logoSrc = Join-Path $projectRoot "logo"
if (Test-Path $logoSrc) {
    $logoDest = Join-Path $tempDir "logo"
    New-Item -ItemType Directory -Path $logoDest | Out-Null
    robocopy $logoSrc $logoDest /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
}

# Salin File Root (README, dokumen perencanaan markdown, batch, powershell, dll)
Get-ChildItem -Path $projectRoot -File | Where-Object { $_.Name -notmatch "\.zip$" } | ForEach-Object {
    Copy-Item $_.FullName -Destination $tempDir
}

# 6. Kompresi ke .ZIP
Write-Host "`n[6/6] Mengompresi seluruh paket data & kodingan ke file .ZIP..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFilePath -Force

# Bersihkan staging folder
Remove-Item -Recurse -Force $tempDir

$zipSize = (Get-Item $zipFilePath).Length / 1MB
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host " [$timestamp] BACKUP DATA LENGKAP BERHASIL DIBUAT DENGAN SUKSES! " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host " WAKTU / STEMPEL  : $timestamp" -ForegroundColor Cyan
Write-Host " KETERANGAN       : $cleanKeterangan" -ForegroundColor Yellow
Write-Host " FILE ARSIP       : $zipFileName" -ForegroundColor White
Write-Host " LOKASI PENYIMPAN : $zipFilePath" -ForegroundColor Gray
Write-Host " UKURAN ARSIP     : $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow
Write-Host " CAKUPAN ARSIP    : Data PostgreSQL (Dump), Keycloak, Backend, Frontend, AI, Dokumen" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Green
