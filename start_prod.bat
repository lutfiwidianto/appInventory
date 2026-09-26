@echo off
set "TITLE=Flask Server - PRODUCTION (Waitress)"
title %TITLE%

echo ------------------------------------------------------------
echo %TITLE%
echo ------------------------------------------------------------
echo.

cd /d "%~dp0"

if not exist "env\Scripts\python.exe" (
    echo [ERROR] Virtual environment env tidak ditemukan!
    echo Pastikan folder env ada di direktori ini.
    pause
    exit /b
)

echo [PROD] Menjalankan server menggunakan Waitress...
echo.

:loop
echo [%DATE% %TIME%] Memulai Server...
env\Scripts\python.exe run.py

echo.
echo [WARNING] Server terhenti! Akan dimulai ulang dalam 5 detik...
echo Tekan Ctrl+C untuk membatalkan loop ini.
ping 127.0.0.1 -n 6 >nul
goto loop
