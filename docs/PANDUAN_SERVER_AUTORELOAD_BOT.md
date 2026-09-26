# 📖 PANDUAN: FLASK WAITRESS (AUTO-RELOAD) + TELEGRAM MANAGEMENT BOT

Arsitektur produksi tangguh menggunakan **Waitress WSGI**, fitur **Hot-Reloading otomatis saat save file (hupper + watchdog)**, serta **Telegram Bot** dengan fitur pelacak identitas pemanggil (User Attribution).

---

## 1. 📦 DEPENDENSI (requirements.txt)
```bash
pip install Flask waitress hupper watchdog pyTelegramBotAPI psutil
```
Isi `requirements.txt`:
```text
Flask==2.2.3
waitress==2.1.2
hupper==1.12.1
watchdog==6.0.0
pyTelegramBotAPI==4.14.0
psutil==5.9.6
```

---

## 2. 🚀 SERVER FLASK AUTO-RELOAD (run.py)
```python
import os
from flask import Flask
from waitress import serve
import hupper

# Inisialisasi Flask
app = Flask(__name__)
app.secret_key = "GANTI_SECRET_KEY_ANDA"

# Auto-Reload Template HTML tanpa restart server
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

@app.route('/')
def index():
    return "<h1>Server Running with Auto-Reload!</h1>"

def start_server():
    # Catat PID untuk kontrol bot telegram
    with open("server.pid", "w") as f:
        f.write(str(os.getpid()))

    print(f"[{os.getpid()}] Server Waitress berjalan di port 80...")
    serve(app, host="0.0.0.0", port=80, threads=16)

if __name__ == "__main__":
    # Hupper memantau perubahan file .py secara otomatis
    reloader = hupper.start_reloader('run.start_server')
    
    # Pantau juga folder HTML dan Static
    reloader.watch_files(['Templates', 'templates', 'static'])
```

---

## 3. 🤖 TELEGRAM BOT MULTI-USER TRACKING (telegram_bot.py)
```python
import os
import re
import time
import subprocess
import psutil
import telebot

TELEGRAM_TOKEN = "TOKEN_BOT_TELEGRAM_ANDA"
AUTHORIZED_IDS = [123456789, -100123456789]  # User ID / Group ID

bot = telebot.TeleBot(TELEGRAM_TOKEN, threaded=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PID_FILE = os.path.join(BASE_DIR, "server.pid")
BOT_PID_FILE = os.path.join(BASE_DIR, "bot.pid")
START_SCRIPT = os.path.join(BASE_DIR, "start_prod.bat")

# Format nama pemanggil aman dari error Markdown
def escape_markdown(text):
    if not text: return ""
    return re.sub(r'([_*\[\]~])', r'\\\1', str(text))

def get_user_display_name(user):
    if not user: return "Unknown User"
    first = escape_markdown(user.first_name)
    last = escape_markdown(user.last_name)
    username = escape_markdown(user.username)
    parts = [p for p in [first, last] if p]
    full_name = " ".join(parts).strip()
    if username:
        return f"{full_name} (@{username})" if full_name else f"@{username}"
    return full_name if full_name else f"User {user.id}"

def is_server_running():
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                pid = int(f.read().strip())
            if psutil.pid_exists(pid): return True
        except: pass
    return False

def get_keyboard():
    markup = telebot.types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        telebot.types.InlineKeyboardButton("📊 Status Server", callback_data="btn_status"),
        telebot.types.InlineKeyboardButton("🚀 Jalankan Server", callback_data="btn_start"),
        telebot.types.InlineKeyboardButton("🔄 Restart Server", callback_data="btn_restart"),
        telebot.types.InlineKeyboardButton("🤖 Restart Bot", callback_data="btn_restart_bot")
    )
    return markup

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    bot.send_message(
        message.chat.id, 
        f"👤 *{user_name}* memanggil menu:\n\n🤖 *Server Management Bot*",
        parse_mode="Markdown", 
        reply_markup=get_keyboard()
    )

@bot.message_handler(commands=['status'])
def cmd_status(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    status_str = "✅ *Server RUNNING!*" if is_server_running() else "❌ *Server DOWN!*"
    bot.reply_to(message, f"👤 *{user_name}* cek status:\n{status_str}", parse_mode="Markdown", reply_markup=get_keyboard())

@bot.message_handler(commands=['restart'])
def cmd_restart(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    bot.reply_to(message, f"👤 *{user_name}*:\n⏳ Memproses restart server...", parse_mode="Markdown")
    try:
        # Kill server lama
        if os.path.exists(PID_FILE):
            try:
                with open(PID_FILE, "r") as f:
                    pid = int(f.read().strip())
                if psutil.pid_exists(pid): psutil.Process(pid).kill()
            except: pass
            try: os.remove(PID_FILE)
            except: pass

        time.sleep(2)
        subprocess.Popen(f'start "" "{START_SCRIPT}"', shell=True, cwd=BASE_DIR)
        time.sleep(3)

        if is_server_running():
            bot.reply_to(message, f"👤 *{user_name}*:\n✅ *Server berhasil di-restart dan RUNNING!*", parse_mode="Markdown", reply_markup=get_keyboard())
        else:
            bot.reply_to(message, f"👤 *{user_name}*:\n⏳ Server sedang booting...", parse_mode="Markdown", reply_markup=get_keyboard())
    except Exception as e:
        bot.reply_to(message, f"👤 *{user_name}*:\n❌ Gagal restart: {str(e)}", parse_mode="Markdown")

@bot.callback_query_handler(func=lambda call: call.data.startswith('btn_'))
def handle_btn(call):
    if str(call.message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    call.message.from_user = call.from_user
    cmd = call.data.replace('btn_', '')
    if cmd == 'status': cmd_status(call.message)
    elif cmd == 'restart': cmd_restart(call.message)
    bot.answer_callback_query(call.id)

if __name__ == "__main__":
    with open(BOT_PID_FILE, "w") as f:
        f.write(str(os.getpid()))
    print("Bot aktif...")
    bot.infinity_polling(timeout=60, long_polling_timeout=30)
```

---

## 4. ⚙️ BATCH SCRIPTS PENGENDALI (WINDOWS)

### `start_prod.bat`
```bat
@echo off
set "TITLE=Flask Server - PRODUCTION (Waitress)"
title %TITLE%
cd /d "%~dp0"

:loop
echo [%DATE% %TIME%] Memulai Server...
env\Scripts\python.exe run.py

echo [WARNING] Server terhenti! Restarting dalam 5 detik...
timeout /t 5 /nobreak
goto loop
```

### `start_bot.bat`
```bat
@echo off
set "TITLE=Telegram Management Bot"
title %TITLE%
cd /d "%~dp0"

:loop
echo [LOG] Memulai Bot Telegram...
env\Scripts\python.exe telegram_bot.py

timeout /t 5 /nobreak
goto loop
```

### `super_restart_bot.bat` (Admin Elevation Killer)
```bat
@echo off
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' neq '0' (
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
)
if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
pushd "%~dp0"

taskkill /F /IM python.exe /T
del *.pid /f /q
start start_bot.bat
```
