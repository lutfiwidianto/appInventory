@echo off
set "TITLE=Inventory - Starter (Server + Bot)"
title %TITLE%

cd /d "%~dp0"

echo ============================================================
echo   Menjalankan App Inventory Server ^& Telegram Bot
echo ============================================================
echo.

:: 1. Jalankan Flask Server (Waitress)
echo [1/2] Memulai Flask Server...
start "Flask Server - PRODUCTION (Waitress)" cmd /k "start_prod.bat"

:: Tunggu 3 detik agar server mulai inisialisasi
ping 127.0.0.1 -n 4 >nul

:: 2. Jalankan Telegram Bot
echo [2/2] Memulai Telegram Bot...
start "Inventory - Telegram Bot (STABLE)" cmd /k "start_bot.bat"

echo.
echo ============================================================
echo   Semua service telah dijalankan di background!
echo ============================================================
ping 127.0.0.1 -n 3 >nul
exit
