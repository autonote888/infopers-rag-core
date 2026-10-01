@echo off
title HENTIKAN KEYCLOAK IAM - SSDM POLRI
color 0C

echo ======================================================================
echo          MENGHENTIKAN LAYANAN KEYCLOAK IDENTITY MANAGEMENT
echo ======================================================================
echo.

cd /d "%~dp0"
docker compose down

echo.
echo [SUKSES] Kontainer Keycloak dan Database IAM telah berhasil dinonaktifkan.
echo.
pause
