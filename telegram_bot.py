import telebot
import os
import psutil
import time
import subprocess
import re
import random
import string
from config.telegram import TELEGRAM_TOKEN, AUTHORIZED_IDS
from config.database import get_db_cursor

# Import cloudflare tunnel control functions
try:
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from app.cloudflare_tunnel import cf_get_status, cf_start_tunnel, cf_stop_tunnel
    CF_AVAILABLE = True
except Exception as e:
    CF_AVAILABLE = False
    print(f"[WARN] Cloudflare module tidak tersedia: {e}")

bot = telebot.TeleBot(TELEGRAM_TOKEN, threaded=True)

def escape_markdown(text):
    if not text: return ""
    return re.sub(r'([_*\[\]~])', r'\\\1', text)

def get_user_display_name(user):
    if not user: return "Unknown User"
    first = escape_markdown(user.first_name)
    last = escape_markdown(user.last_name)
    username = escape_markdown(user.username)
    parts = [p for p in [first, last] if p]
    full_name = " ".join(parts).strip()
    if username:
        if full_name: return f"{full_name} (@{username})"
        return f"@{username}"
    return full_name if full_name else f"User {user.id}"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PID_FILE = os.path.join(BASE_DIR, "server.pid")
BOT_PID_FILE = os.path.join(BASE_DIR, "bot.pid")
START_SCRIPT = os.path.join(BASE_DIR, "start_prod.bat")
LOG_FILE = os.path.join(BASE_DIR, "server.log")
ERROR_LOG_FILE = os.path.join(BASE_DIR, "error.log")

def check_single_instance():
    current_pid = os.getpid()
    parent_pid = os.getppid()
    script_name = "telegram_bot.py"
    
    if os.path.exists(BOT_PID_FILE):
        try:
            with open(BOT_PID_FILE, "r") as f:
                pid = int(f.read().strip())
            if pid != current_pid and pid != parent_pid and psutil.pid_exists(pid):
                try:
                    proc = psutil.Process(pid)
                    if "python" in proc.name().lower():
                        print(f"[ERROR] Bot sudah jalan (PID {pid}).")
                        return False
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
        except: pass

    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            p_info = proc.info
            if p_info['pid'] != current_pid and p_info['pid'] != parent_pid and "python" in (p_info['name'] or "").lower():
                cmdline = p_info['cmdline'] or []
                if any(script_name in arg for arg in cmdline if arg):
                    print(f"[INFO] Bot sudah aktif di proses {p_info['pid']}.")
                    with open(BOT_PID_FILE, "w") as f:
                        f.write(str(p_info['pid']))
                    return False
        except: continue

    with open(BOT_PID_FILE, "w") as f:
        f.write(str(current_pid))
    return True

def is_server_running():
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                pid = int(f.read().strip())
            if psutil.pid_exists(pid):
                proc = psutil.Process(pid)
                if "python" in (proc.name() or "").lower():
                    return True
        except:
            pass
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            p_info = proc.info
            if "python" in (p_info['name'] or "").lower():
                cmdline = p_info['cmdline'] or []
                if any("run.py" in str(arg) for arg in cmdline):
                    return True
        except:
            continue
    return False

def get_main_keyboard():
    markup = telebot.types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        telebot.types.InlineKeyboardButton("📊 Status Server", callback_data="btn_status"),
        telebot.types.InlineKeyboardButton("🚀 Jalankan Server", callback_data="btn_start_server"),
        telebot.types.InlineKeyboardButton("🔄 Restart Server", callback_data="btn_restart_server"),
        telebot.types.InlineKeyboardButton("🤖 Restart Bot", callback_data="btn_restart_bot"),
        telebot.types.InlineKeyboardButton("💾 Backup DB", callback_data="btn_backup"),
        telebot.types.InlineKeyboardButton("📄 Lihat Log", callback_data="btn_logs"),
        telebot.types.InlineKeyboardButton("🛑 Lihat Error", callback_data="btn_errors"),
        telebot.types.InlineKeyboardButton("☁️ Cloudflare Tunnel", callback_data="btn_cloudflare"),
        telebot.types.InlineKeyboardButton("🔓 Reset Login", callback_data="btn_reset_login"),
        telebot.types.InlineKeyboardButton("❓ Bantuan", callback_data="btn_help")
    )
    return markup

def get_cloudflare_keyboard():
    markup = telebot.types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        telebot.types.InlineKeyboardButton("📡 Status Tunnel", callback_data="cf_status"),
        telebot.types.InlineKeyboardButton("▶️ Jalankan Tunnel", callback_data="cf_start"),
        telebot.types.InlineKeyboardButton("⏹️ Hentikan Tunnel", callback_data="cf_stop"),
        telebot.types.InlineKeyboardButton("🔙 Kembali ke Menu", callback_data="btn_help")
    )
    return markup

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]:
        print(f"[AUTH] Akses ditolak untuk ID: {message.chat.id}")
        bot.reply_to(message, "❌ Akses ditolak. Anda tidak berwenang.")
        return
    
    user_name = get_user_display_name(message.from_user)
    help_text = (
        f"👤 *{user_name}* memanggil menu:\n\n"
        "🤖 *Server Management Bot*\n"
        "Gunakan tombol di bawah untuk mengelola server secara realtime:\n\n"
        "💡 *Panduan Perintah:*\n"
        "• 📊 *Status Server*: Cek kondisi server.\n"
        "• 🚀 *Jalankan Server*: Nyalakan server.\n"
        "• 🔄 *Restart Server*: Mulai ulang server.\n"
        "• 🤖 *Restart Bot*: Mulai ulang Bot Telegram.\n"
        "• 💾 *Backup DB*: Cadangkan database ke D:\\.\n"
        "• 📄 *Lihat Log*: Cek 20 baris log terakhir.\n"
        "• 🛑 *Lihat Error*: Cek error yang terjadi.\n"
        "• 🔓 *Reset Login*: Putuskan sesi login user.\n"
    )
    bot.send_message(message.chat.id, help_text, parse_mode="Markdown", reply_markup=get_main_keyboard())

@bot.message_handler(func=lambda message: message.text == '❓ Bantuan')
def help_button(message): send_welcome(message)


@bot.message_handler(commands=['status'])
@bot.message_handler(func=lambda message: message.text == '📊 Status Server')
def check_status(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    bot.send_chat_action(message.chat.id, 'typing')
    user_name = get_user_display_name(message.from_user)
    try:
        if is_server_running():
            bot.reply_to(message, f"👤 *{user_name}* melakukan cek status:\n✅ *Server running!*", parse_mode="Markdown", reply_markup=get_main_keyboard())
        else:
            if os.path.exists(PID_FILE):
                try: os.remove(PID_FILE)
                except: pass
            bot.reply_to(message, f"👤 *{user_name}* melakukan cek status:\n❌ *Server is DOWN!*\nGunakan tombol 'Jalankan Server' untuk menyalakan.", parse_mode="Markdown", reply_markup=get_main_keyboard())
    except Exception as e:
        print(f"[ERROR] Gagal mengirim status: {e}")
        try: bot.send_message(message.chat.id, f"👤 *{user_name}* melakukan cek status:\n" + ("✅ Running" if is_server_running() else "❌ Down"), parse_mode="Markdown", reply_markup=get_main_keyboard())
        except: pass

@bot.message_handler(commands=['start_server'])
@bot.message_handler(func=lambda message: message.text == '🚀 Jalankan Server')
def run_server_command(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    if is_server_running():
        bot.reply_to(message, f"👤 *{user_name}*:\n⚠️ Server sudah berjalan aktif.", parse_mode="Markdown")
        return
    bot.reply_to(message, f"👤 *{user_name}*:\n🚀 Sedang menyalakan server...", parse_mode="Markdown")
    try:
        subprocess.Popen(f'start "" "{START_SCRIPT}"', shell=True, cwd=BASE_DIR)
        time.sleep(3)
        if is_server_running():
            bot.reply_to(message, f"👤 *{user_name}*:\n✅ *Server berhasil dinyalakan dan RUNNING!*", parse_mode="Markdown", reply_markup=get_main_keyboard())
        else:
            bot.reply_to(message, f"👤 *{user_name}*:\n⏳ Server sedang booting, silakan cek '📊 Status Server' beberapa saat lagi.", parse_mode="Markdown", reply_markup=get_main_keyboard())
    except Exception as e:
        bot.reply_to(message, f"👤 *{user_name}*:\n❌ Gagal menyalakan server: {str(e)}", parse_mode="Markdown")

@bot.message_handler(commands=['logs'])
@bot.message_handler(func=lambda message: message.text == '📄 Lihat Log')
def get_logs(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    if not os.path.exists(LOG_FILE):
        bot.reply_to(message, f"👤 *{user_name}*:\n❌ File log belum tersedia.", parse_mode="Markdown")
        return
    try:
        with open(LOG_FILE, "r") as f:
            log_text = "".join(f.readlines()[-20:])
        bot.reply_to(message, f"👤 *{user_name}*:\n📄 *Aktivitas Terakhir:*\n\n```\n{log_text}\n```", parse_mode="Markdown")
    except Exception as e: bot.reply_to(message, f"👤 *{user_name}*:\n❌ Gagal: {str(e)}", parse_mode="Markdown")

@bot.message_handler(commands=['errors'])
@bot.message_handler(func=lambda message: message.text == '🛑 Lihat Error')
def get_only_errors(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    if not os.path.exists(ERROR_LOG_FILE) or os.path.getsize(ERROR_LOG_FILE) == 0:
        bot.reply_to(message, f"👤 *{user_name}*:\n✅ *Tidak ada error tercatat!* (`error.log` bersih/kosong).", parse_mode="Markdown")
        return
    try:
        with open(ERROR_LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        log_text = "".join(lines[-30:])
        if not log_text.strip():
            bot.reply_to(message, f"👤 *{user_name}*:\n✅ *Tidak ada error tercatat.*", parse_mode="Markdown")
            return
        bot.reply_to(message, f"👤 *{user_name}*:\n🛑 *Log Error Terakhir (`error.log`):*\n\n```\n{log_text[:3500]}\n```", parse_mode="Markdown")
    except Exception as e: bot.reply_to(message, f"👤 *{user_name}*:\n❌ Gagal: {str(e)}", parse_mode="Markdown")

@bot.message_handler(commands=['restart_bot'])
@bot.message_handler(func=lambda message: message.text == '🤖 Restart Bot')
def restart_bot_command(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    bot.reply_to(message, f"👤 *{user_name}*:\n🔄 *Bot sedang memulai ulang...*", parse_mode="Markdown")
    time.sleep(1) 
    os._exit(0)

@bot.message_handler(commands=['reset_login'])
@bot.message_handler(func=lambda message: message.text == '🔓 Reset Login')
def reset_login_command(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT [User_ID], [Nama], [Username] FROM [dbo].[users] WHERE LEN([Log]) = 20")
            logged_in_users = cursor.fetchall()
            if not logged_in_users:
                bot.reply_to(message, f"👤 *{user_name}*:\nℹ️ Tidak ada user yang sedang login.", parse_mode="Markdown")
                return
            markup = telebot.types.InlineKeyboardMarkup()
            for user in logged_in_users:
                markup.add(telebot.types.InlineKeyboardButton(text=f"👤 {user[1]} (@{user[2]})", callback_data=f"rl_single_{user[0]}"))
            markup.add(telebot.types.InlineKeyboardButton(text="🚨 RESET SEMUA USER 🚨", callback_data="rl_all"))
            bot.send_message(message.chat.id, f"👤 *{user_name}*:\n📋 *List User Online:*", parse_mode="Markdown", reply_markup=markup)
    except Exception as e: bot.reply_to(message, f"👤 *{user_name}*:\n❌ Gagal: {str(e)}", parse_mode="Markdown")

@bot.callback_query_handler(func=lambda call: call.data.startswith('rl_'))
def handle_reset_login_callbacks(call):
    if str(call.message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(call.from_user)
    try:
        with get_db_cursor() as cursor:
            if call.data == "rl_all":
                cursor.execute("UPDATE [dbo].[users] SET [Log] = 'RESET' WHERE LEN([Log]) = 20")
                bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=f"👤 *{user_name}*:\n🚀 Semua user telah di-reset.", parse_mode="Markdown")
            elif call.data.startswith("rl_single_"):
                uid = call.data.replace("rl_single_", "")
                cursor.execute("SELECT [Nama], [Username] FROM [dbo].[users] WHERE [User_ID] = %s", (uid,))
                target_user = cursor.fetchone()
                if target_user:
                    target_name = escape_markdown(target_user[0]) if target_user[0] else ""
                    target_username = escape_markdown(target_user[1]) if target_user[1] else ""
                    if target_username:
                        display_str = f"*{target_name}* (@{target_username})" if target_name else f"@{target_username}"
                    else:
                        display_str = f"*{target_name}*" if target_name else f"User {uid}"
                    cursor.execute("UPDATE [dbo].[users] SET [Log] = 'RESET' WHERE [User_ID] = %s", (uid,))
                    bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=f"👤 *{user_name}*:\n✅ Sesi user {display_str} telah diputuskan.", parse_mode="Markdown")
                else:
                    bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=f"👤 *{user_name}*:\n❌ User tidak ditemukan.", parse_mode="Markdown")
    except: bot.answer_callback_query(call.id, "Gagal memproses.")

@bot.message_handler(commands=['backup', 'backup_db'])
@bot.message_handler(func=lambda message: message.text == '💾 Backup DB')
def backup_database_command(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    msg = bot.reply_to(message, f"👤 *{user_name}*:\n⏳ Sedang memproses backup database `tct_inventory` ke `D:\\`...", parse_mode="Markdown")
    try:
        from scripts.backup_db import perform_backup
        success, res_msg, file_path, size_mb = perform_backup(
            target_dir="D:\\",
            database="tct_inventory",
            notify_telegram=False,
            user_trigger=f"Telegram ({user_name})"
        )
        if success:
            filename = os.path.basename(file_path) if file_path else "Unknown"
            bot.edit_message_text(
                chat_id=message.chat.id,
                message_id=msg.message_id,
                text=f"👤 *{user_name}*:\n✅ *Backup Database Berhasil!*\n\n📁 *File:* `{filename}`\n📊 *Ukuran:* `{size_mb:.2f} MB`\n📍 *Lokasi:* `{file_path}`",
                parse_mode="Markdown",
                reply_markup=get_main_keyboard()
            )
        else:
            bot.edit_message_text(
                chat_id=message.chat.id,
                message_id=msg.message_id,
                text=f"👤 *{user_name}*:\n❌ *Gagal Backup:* {res_msg}",
                parse_mode="Markdown",
                reply_markup=get_main_keyboard()
            )
    except Exception as e:
        bot.edit_message_text(
            chat_id=message.chat.id,
            message_id=msg.message_id,
            text=f"👤 *{user_name}*:\n❌ Terjadi kesalahan: {str(e)}",
            parse_mode="Markdown",
            reply_markup=get_main_keyboard()
        )

@bot.callback_query_handler(func=lambda call: call.data.startswith('btn_'))
def handle_menu_callbacks(call):
    if str(call.message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    # Kita panggil fungsi handler yang sesuai dengan mensimulasikan objek message
    call.message.from_user = call.from_user
    cmd = call.data.replace('btn_', '')
    
    if cmd == 'status': check_status(call.message)
    elif cmd == 'start_server': run_server_command(call.message)
    elif cmd == 'restart_server': restart_server(call.message)
    elif cmd == 'restart_bot': restart_bot_command(call.message)
    elif cmd == 'backup': backup_database_command(call.message)
    elif cmd == 'logs': get_logs(call.message)
    elif cmd == 'errors': get_only_errors(call.message)
    elif cmd == 'reset_login': reset_login_command(call.message)
    elif cmd == 'cloudflare': cloudflare_menu(call.message)
    elif cmd == 'help': send_welcome(call.message)
    
    bot.answer_callback_query(call.id)

@bot.callback_query_handler(func=lambda call: call.data.startswith('cf_'))
def handle_cloudflare_callbacks(call):
    if str(call.message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    call.message.from_user = call.from_user
    user_name = get_user_display_name(call.from_user)
    bot.answer_callback_query(call.id)

    if not CF_AVAILABLE:
        bot.send_message(call.message.chat.id, "❌ Modul Cloudflare tidak tersedia.", reply_markup=get_cloudflare_keyboard())
        return

    cmd = call.data  # e.g. cf_status, cf_start, cf_stop

    if cmd == 'cf_status':
        status = cf_get_status()
        installed = status.get('installed', False)
        running = status.get('running', False)
        url = status.get('url', '-')
        mode = status.get('mode', '-')

        if not installed:
            state_text = "⚠️ *NOT INSTALLED* — Cloudflare belum terinstall."
        elif running:
            state_text = f"✅ *RUNNING*\n🔗 URL: `{url or 'Memproses...'}`"
        else:
            state_text = "🔵 *READY* — Tunnel belum dijalankan."

        bot.send_message(
            call.message.chat.id,
            f"👤 *{user_name}* cek Cloudflare:\n\n☁️ *Status Cloudflare Tunnel*\n{state_text}\n📡 Mode: `{mode}`",
            parse_mode="Markdown",
            reply_markup=get_cloudflare_keyboard()
        )

    elif cmd == 'cf_start':
        status = cf_get_status()
        if status.get('running'):
            bot.send_message(call.message.chat.id, f"👤 *{user_name}*:\n⚠️ Tunnel sudah berjalan!", parse_mode="Markdown", reply_markup=get_cloudflare_keyboard())
            return
        msg = bot.send_message(call.message.chat.id, f"👤 *{user_name}*:\n⏳ Memulai Cloudflare Tunnel...", parse_mode="Markdown")
        ok, message, url = cf_start_tunnel()
        result = f"✅ {message}" if ok else f"❌ {message}"
        if ok and url:
            result += f"\n🔗 URL: `{url}`"
        bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=msg.message_id,
            text=f"👤 *{user_name}*:\n{result}",
            parse_mode="Markdown",
            reply_markup=get_cloudflare_keyboard()
        )

    elif cmd == 'cf_stop':
        status = cf_get_status()
        if not status.get('running'):
            bot.send_message(call.message.chat.id, f"👤 *{user_name}*:\n⚠️ Tunnel tidak sedang berjalan.", parse_mode="Markdown", reply_markup=get_cloudflare_keyboard())
            return
        ok, message = cf_stop_tunnel()
        result = f"✅ {message}" if ok else f"❌ {message}"
        bot.send_message(call.message.chat.id, f"👤 *{user_name}*:\n{result}", parse_mode="Markdown", reply_markup=get_cloudflare_keyboard())

@bot.message_handler(commands=['restart'])
@bot.message_handler(func=lambda message: message.text == '🔄 Restart Server')
def restart_server(message):
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    bot.reply_to(message, f"👤 *{user_name}*:\n⏳ Memproses restart server (mematikan lalu menyalakan kembali)...", parse_mode="Markdown")
    try:
        # 1. Kill existing server processes
        if os.path.exists(PID_FILE):
            try:
                with open(PID_FILE, "r") as f:
                    pid = int(f.read().strip())
                if psutil.pid_exists(pid): 
                    psutil.Process(pid).kill()
            except:
                pass
            try:
                os.remove(PID_FILE)
            except:
                pass

        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                p_info = proc.info
                if "python" in (p_info['name'] or "").lower():
                    cmdline = p_info['cmdline'] or []
                    if any("run.py" in str(arg) for arg in cmdline):
                        proc.kill()
            except:
                pass

        time.sleep(2)

        # 2. Start server again
        subprocess.Popen(f'start "" "{START_SCRIPT}"', shell=True, cwd=BASE_DIR)
        
        # 3. Wait and verify
        time.sleep(3)
        if is_server_running():
            bot.reply_to(message, f"👤 *{user_name}*:\n✅ *Server berhasil di-restart dan sekarang aktif RUNNING!*", parse_mode="Markdown", reply_markup=get_main_keyboard())
        else:
            bot.reply_to(message, f"👤 *{user_name}*:\n⏳ Server sedang booting, silakan cek '📊 Status Server' sesaat lagi.", parse_mode="Markdown", reply_markup=get_main_keyboard())
    except Exception as e:
        bot.reply_to(message, f"👤 *{user_name}*:\n❌ Gagal restart: {str(e)}", parse_mode="Markdown")

def cloudflare_menu(message):
    """Show the Cloudflare Tunnel sub-menu."""
    if str(message.chat.id) not in [str(x) for x in AUTHORIZED_IDS]: return
    user_name = get_user_display_name(message.from_user)
    if not CF_AVAILABLE:
        bot.reply_to(message, f"👤 *{user_name}*:\n❌ Modul Cloudflare tidak tersedia.", parse_mode="Markdown")
        return
    status = cf_get_status()
    running = status.get('running', False)
    installed = status.get('installed', False)
    state_icon = '✅ RUNNING' if running else ('🔵 READY' if installed else '⚠️ NOT INSTALLED')
    bot.send_message(
        message.chat.id,
        f"👤 *{user_name}* membuka menu Cloudflare:\n\n☁️ *Cloudflare Tunnel*\nStatus saat ini: *{state_icon}*\n\nPilih tindakan:",
        parse_mode="Markdown",
        reply_markup=get_cloudflare_keyboard()
    )

# Handler logging (pindahkan ke bawah agar tidak memblokir command lain)
@bot.message_handler(func=lambda message: True)
def log_incoming(message):
    print(f"[LOG] Pesan dari {message.chat.id}: {message.text}")

if __name__ == "__main__":
    if not check_single_instance():
        print("[ERROR] Bot sudah jalan atau PID lock aktif. Menghentikan proses baru untuk mencegah konflik...")
        import sys
        sys.exit(5)
        
    print(f"Bot started... Monitoring: {AUTHORIZED_IDS}")
    try:
        bot.infinity_polling(timeout=60, long_polling_timeout=30)
    except Exception as e:
        print(f"[FATAL] Polling error: {e}")
        time.sleep(5)
        os._exit(1)
