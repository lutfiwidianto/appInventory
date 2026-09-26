@echo off
set "TITLE=Inventory - Telegram Bot (STABLE)"
title %TITLE%

echo ------------------------------------------------------------
echo %TITLE%
echo ------------------------------------------------------------
echo.

cd /d "%~dp0"

:loop
echo [LOG] Mencoba menjalankan bot...
env\Scripts\python.exe telegram_bot.py

:: Simpan status hasil jalan bot
set "RET=%ERRORLEVEL%"

if "%RET%" == "5" (
    echo.
    echo [INFO] Bot sudah aktif di jendela lain atau background.
    echo Jendela ini akan ditutup dalam 10 detik...
    ping 127.0.0.1 -n 11 >nul
    exit /b
)

if "%RET%" == "0" (
    echo [WARNING] Bot dimatikan secara normal. Restarting in 5s...
    ping 127.0.0.1 -n 6 >nul
    goto loop
)

echo [ERROR] Bot terhenti unexpectedly (Code: %RET%). Restarting in 10s...
ping 127.0.0.1 -n 11 >nul
goto loop
