@echo off
set "TITLE=Flask Server - DEVELOPMENT (Auto-Reload)"
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

echo [DEV] Menjalankan server dengan hot-reloading...
echo.
env\Scripts\python.exe run_dev.py

if errorlevel 1 (
    echo.
    echo [ERROR] Terjadi kesalahan saat menjalankan server.
    pause
)
