@echo off
title SSDM AI - Offline Assistant (Lokal Proyek)
color 0A

:: Arahkan direktori kerja ke folder ai proyek
cd /d "%~dp0ai" 2>nul
if not exist "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf" (
    cd /d "%~dp0"
)

echo ========================================================
echo               MEMULAI SISTEM SSDM AI LOKAL
echo ========================================================
echo.

:: Periksa ketersediaan file model
if not exist "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf" (
    echo [ERROR] File Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf tidak ditemukan!
    echo Pastikan file berada di folder ai sebelum menjalankan skrip ini.
    echo.
    pause
    exit /b
)

:: Periksa apakah model ssdm-ai sudah terdaftar di Ollama
ollama list | findstr /i "ssdm-ai" >nul
if %errorlevel% neq 0 (
    echo [INFO] Model ssdm-ai belum terdaftar. Menyiapkan konfigurasi...

    :: Buat file Modelfile secara otomatis
    (
        echo FROM ./Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf
        echo PARAMETER temperature 0.7
        echo PARAMETER num_ctx 4096
        echo SYSTEM "Nama kamu adalah SSDM AI, asisten AI cerdas dan ramah yang berjalan secara lokal dan offline."
    ) > Modelfile

    echo [INFO] Mendaftarkan file model ke sistem Ollama...
    ollama create ssdm-ai -f Modelfile

    if %errorlevel% neq 0 (
        echo [ERROR] Terjadi kegagalan saat registrasi model.
        pause
        exit /b
    )
    echo [SUKSES] Registrasi selesai!
    echo.
)

:: Jalankan model ssdm-ai
cls
echo ========================================================
echo        SSDM AI SIAP DIGUNAKAN (Ketik /bye untuk keluar)
echo ========================================================
echo.
ollama run ssdm-ai

pause
