import telebot
import os
import psutil
import time
import subprocess
import re
import html
import logging
from config.telegram import TELEGRAM_TOKEN, AUTHORIZED_IDS
from config.database import get_db_cursor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PID_FILE = os.path.join(BASE_DIR, "server.pid")
BOT_PID_FILE = os.path.join(BASE_DIR, "bot.pid")
START_SCRIPT = os.path.join(BASE_DIR, "start_prod.bat")
LOG_FILE = os.path.join(BASE_DIR, "server.log")
ERROR_LOG_FILE = os.path.join(BASE_DIR, "error.log")
BOT_LOG_FILE = os.path.join(BASE_DIR, "bot.log")

# Setup comprehensive logging to bot.log
logging.basicConfig(
    filename=BOT_LOG_FILE,
    filemode='a',
    format='%(asctime)s [%(levelname)s] %(message)s',
    level=logging.INFO
)
telebot_logger = telebot.logger
telebot_logger.setLevel(logging.INFO)
telebot_logger.propagate = False
fh = logging.FileHandler(BOT_LOG_FILE, encoding='utf-8')
fh.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))
telebot_logger.addHandler(fh)

# Konfigurasi network timeout & retry telebot apihelper untuk mencegah ReadTimeout
telebot.apihelper.READ_TIMEOUT = 60
telebot.apihelper.CONNECT_TIMEOUT = 15
telebot.apihelper.RETRY_ON_ERROR = True
telebot.apihelper.RETRY_TIMEOUT = 2
telebot.apihelper.MAX_RETRIES = 5
telebot.apihelper.SESSION_TIME_TO_LIVE = 300

# Import cloudflare tunnel control functions
try:
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from app.cloudflare_tunnel import cf_get_status, cf_start_tunnel, cf_stop_tunnel
    CF_AVAILABLE = True
except Exception as e:
    CF_AVAILABLE = False
    logging.warning(f"Cloudflare module tidak tersedia: {e}")

bot = telebot.TeleBot(TELEGRAM_TOKEN, threaded=True)

def is_authorized(chat_id, user=None):
    """Check authorization by chat_id, user_id, or username (case-insensitive)."""
    auth_list = [str(x).lower() for x in AUTHORIZED_IDS]
    if str(chat_id).lower() in auth_list:
        return True
    if user is not None:
        user_id = str(getattr(user, 'id', user)).lower()
        if user_id in auth_list:
            return True
        username = getattr(user, 'username', '') or ''
        if username and (username.lower() in auth_list or f"@{username.lower()}" in auth_list or username.lower() == "lutfiwidianto"):
            return True
    return False

def get_user_display_name(user):
    if not user: return "Unknown"
    username = getattr(user, 'username', '')
    if username:
        return f"@{username}"
    # Fallback jika user belum membuat @username di profil Telegram
    first = html.escape(getattr(user, 'first_name', '') or f"User {getattr(user, 'id', '')}")
    return f"<b>{first}</b>"

def safe_send_message(chat_id, text, reply_markup=None):
    """Sends a message safely with HTML parse mode and fallback."""
    try:
        return bot.send_message(chat_id, text, parse_mode="HTML", reply_markup=reply_markup)
    except Exception as e:
        logging.warning(f"Failed to send HTML message, fallback to plain text: {e}")
        clean_text = re.sub(r'<[^>]+>', '', str(text))
        try:
            return bot.send_message(chat_id, clean_text, reply_markup=reply_markup)
        except Exception as e2:
            logging.error(f"Failed to send plain text message: {e2}")
            return None

def safe_edit_message(chat_id, message_id, text, reply_markup=None):
    """Edits a message safely with HTML parse mode and fallback."""
    try:
        return bot.edit_message_text(chat_id=chat_id, message_id=message_id, text=text, parse_mode="HTML", reply_markup=reply_markup)
    except telebot.apihelper.ApiTelegramException as e:
        if "message is not modified" in str(e).lower():
            return None
        logging.warning(f"Failed to edit HTML message: {e}")
        clean_text = re.sub(r'<[^>]+>', '', str(text))
        try:
            return bot.edit_message_text(chat_id=chat_id, message_id=message_id, text=clean_text, reply_markup=reply_markup)
        except Exception:
            return safe_send_message(chat_id, clean_text, reply_markup=reply_markup)
    except Exception as e:
        logging.warning(f"Unexpected edit exception: {e}")
        return safe_send_message(chat_id, text, reply_markup=reply_markup)

def kill_conflicting_bot_instances():
    """Ensures only ONE instance of telegram_bot.py runs by killing any previous instances."""
    current_pid = os.getpid()
    parent_pid = os.getppid()
    killed_count = 0
    
    # 1. Kill PID from bot.pid if exists and not current
    if os.path.exists(BOT_PID_FILE):
        try:
            with open(BOT_PID_FILE, "r") as f:
                old_pid = int(f.read().strip())
            if old_pid != current_pid and old_pid != parent_pid and psutil.pid_exists(old_pid):
                try:
                    p = psutil.Process(old_pid)
                    if "python" in (p.name() or "").lower():
                        p.kill()
                        killed_count += 1
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
        except Exception:
            pass

    # 2. Scan all python processes to kill any old telegram_bot.py instances
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if proc.info['pid'] not in (current_pid, parent_pid) and "python" in (proc.info['name'] or "").lower():
                cmdline = proc.cmdline() or []
                if "-c" in cmdline:
                    continue
                if any(os.path.basename(str(arg).lower()) == "telegram_bot.py" for arg in cmdline if arg):
                    try:
                        proc.kill()
                        killed_count += 1
                    except Exception:
                        pass
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    if killed_count > 0:
        logging.info(f"Membersihkan {killed_count} proses bot lama yang konflik.")
        time.sleep(0.5)

    with open(BOT_PID_FILE, "w") as f:
        f.write(str(current_pid))
    return True

def is_server_running():
    """Ultra-fast server running check using PID file and lightweight process check."""
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                pid = int(f.read().strip())
            if psutil.pid_exists(pid):
                proc = psutil.Process(pid)
                if "python" in (proc.name() or "").lower():
                    return True
        except Exception:
            pass
    # Fast scan only on python processes
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if "python" in (proc.info['name'] or "").lower():
                cmdline = proc.cmdline() or []
                if "-c" in cmdline:
                    continue
                if any(os.path.basename(str(arg).lower()) == "run.py" for arg in cmdline if arg):
                    return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False

def get_persistent_reply_keyboard():
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, is_persistent=True, row_width=2)
    markup.add(
        telebot.types.KeyboardButton("📊 Status Server"),
        telebot.types.KeyboardButton("🚀 Jalankan Server"),
        telebot.types.KeyboardButton("🔄 Restart Server"),
        telebot.types.KeyboardButton("🤖 Restart Bot"),
        telebot.types.KeyboardButton("💾 Backup DB"),
        telebot.types.KeyboardButton("☁️ Cloudflare Tunnel"),
        telebot.types.KeyboardButton("📄 Lihat Log"),
        telebot.types.KeyboardButton("🛑 Lihat Error"),
        telebot.types.KeyboardButton("🔓 Reset Login"),
        telebot.types.KeyboardButton("📋 Menu Utama")
    )
    return markup

def setup_bot_commands():
    try:
        commands = [
            telebot.types.BotCommand("1", "📊 Status Server"),
            telebot.types.BotCommand("2", "🚀 Jalankan Server"),
            telebot.types.BotCommand("3", "🔄 Restart Server"),
            telebot.types.BotCommand("4", "🤖 Restart Bot"),
            telebot.types.BotCommand("5", "💾 Backup Database ke D:\\"),
            telebot.types.BotCommand("6", "☁️ Menu Cloudflare Tunnel"),
            telebot.types.BotCommand("7", "📄 Lihat Log Server"),
            telebot.types.BotCommand("8", "🛑 Lihat Log Error"),
            telebot.types.BotCommand("9", "🔓 Reset Sesi User Online"),
            telebot.types.BotCommand("10", "📋 Menu Utama & Bantuan")
        ]
        # Daftarkan ke semua scope agar muncul di private chat dan grup
        try:
            bot.set_my_commands(commands, scope=telebot.types.BotCommandScopeDefault())
            bot.set_my_commands(commands, scope=telebot.types.BotCommandScopeAllPrivateChats())
            bot.set_my_commands(commands, scope=telebot.types.BotCommandScopeAllGroupChats())
            for auth_id in AUTHORIZED_IDS:
                if str(auth_id).startswith('-'):
                    try:
                        bot.set_my_commands(commands, scope=telebot.types.BotCommandScopeChat(chat_id=auth_id))
                    except Exception:
                        pass
        except Exception as e_scope:
            bot.set_my_commands(commands)
            logging.warning(f"Fallback set_my_commands default: {e_scope}")

        try:
            bot.set_chat_menu_button(menu_button=telebot.types.MenuButtonCommands())
        except Exception as e_btn:
            logging.warning(f"Gagal set chat menu button: {e_btn}")
        logging.info("Bot commands dan Chat Menu Button berhasil didaftarkan ke Telegram.")
    except Exception as e:
        logging.warning(f"Gagal set bot commands: {e}")

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

@bot.message_handler(commands=['10', 'start', 'help', 'menu'])
@bot.message_handler(func=lambda message: message.text in ['10', '/10', '📋 Menu Utama', '❓ Bantuan', 'Menu', 'menu'])
def send_welcome(message):
    logging.info(f"[MSG] start/help from chat={message.chat.id}, user={message.from_user.id} (@{getattr(message.from_user, 'username', '')})")
    if not is_authorized(message.chat.id, message.from_user):
        logging.warning(f"[AUTH] Akses ditolak untuk chat={message.chat.id}, user={message.from_user.id}")
        safe_send_message(message.chat.id, "❌ Akses ditolak. Anda tidak berwenang.")
        return
    
    user_name = get_user_display_name(message.from_user)
    help_text = (
        f"👤 {user_name} memanggil menu:\n\n"
        "🤖 <b>Server Management Bot</b>\n"
        "Gunakan tombol Menu di pojok kiri bawah atau tombol cepat di bawah ini:\n\n"
        "💡 <b>Daftar Perintah Menu:</b>\n"
        "• /1 📊 <b>Status Server</b>: Cek kondisi server.\n"
        "• /2 🚀 <b>Jalankan Server</b>: Nyalakan server.\n"
        "• /3 🔄 <b>Restart Server</b>: Mulai ulang server.\n"
        "• /4 🤖 <b>Restart Bot</b>: Mulai ulang Bot Telegram.\n"
        "• /5 💾 <b>Backup DB</b>: Cadangkan database ke D:\\.\n"
        "• /6 ☁️ <b>Cloudflare Tunnel</b>: Kelola tunnel.\n"
        "• /7 📄 <b>Lihat Log</b>: Cek 20 baris log terakhir.\n"
        "• /8 🛑 <b>Lihat Error</b>: Cek error yang terjadi.\n"
        "• /9 🔓 <b>Reset Login</b>: Putuskan sesi login user.\n"
        "• /10 📋 <b>Menu Utama</b>: Buka panduan ini.\n"
    )
    safe_send_message(message.chat.id, help_text, reply_markup=get_persistent_reply_keyboard())
    safe_send_message(message.chat.id, "⚡ <b>Pilih Tombol Cepat:</b>", reply_markup=get_main_keyboard())

@bot.message_handler(commands=['1', 'status'])
@bot.message_handler(func=lambda message: message.text in ['1', '/1', '📊 Status Server'])
def check_status(message):
    logging.info(f"[MSG] status from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    running = is_server_running()
    if running:
        safe_send_message(message.chat.id, f"👤 {user_name} melakukan cek status:\n✅ <b>Server running!</b>", reply_markup=get_main_keyboard())
    else:
        if os.path.exists(PID_FILE):
            try: os.remove(PID_FILE)
            except: pass
        safe_send_message(message.chat.id, f"👤 {user_name} melakukan cek status:\n❌ <b>Server is DOWN!</b>\nGunakan tombol 'Jalankan Server' untuk menyalakan.", reply_markup=get_main_keyboard())

@bot.message_handler(commands=['2', 'start_server'])
@bot.message_handler(func=lambda message: message.text in ['2', '/2', '🚀 Jalankan Server'])
def run_server_command(message):
    logging.info(f"[MSG] start_server from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    if is_server_running():
        safe_send_message(message.chat.id, f"👤 {user_name}:\n⚠️ <b>Server sudah berjalan aktif.</b>")
        return
    safe_send_message(message.chat.id, f"👤 {user_name}:\n🚀 <b>Sedang menyalakan server...</b>")
    try:
        subprocess.Popen(f'start "" "{START_SCRIPT}"', shell=True, cwd=BASE_DIR)
        time.sleep(3)
        if is_server_running():
            safe_send_message(message.chat.id, f"👤 {user_name}:\n✅ <b>Server berhasil dinyalakan dan RUNNING!</b>", reply_markup=get_main_keyboard())
        else:
            safe_send_message(message.chat.id, f"👤 {user_name}:\n⏳ <b>Server sedang booting</b>, silakan cek '📊 Status Server' beberapa saat lagi.", reply_markup=get_main_keyboard())
    except Exception as e:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ Gagal menyalakan server: {html.escape(str(e))}")

@bot.message_handler(commands=['7', 'logs', 'log'])
@bot.message_handler(func=lambda message: message.text in ['7', '/7', '📄 Lihat Log'])
def get_logs(message):
    logging.info(f"[MSG] logs from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    if not os.path.exists(LOG_FILE):
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ File log belum tersedia.")
        return
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
            log_text = "".join(f.readlines()[-20:])
        safe_send_message(message.chat.id, f"👤 {user_name}:\n📄 <b>Aktivitas Terakhir:</b>\n\n<pre>{html.escape(log_text[:3500])}</pre>")
    except Exception as e:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ Gagal: {html.escape(str(e))}")

@bot.message_handler(commands=['8', 'errors', 'error'])
@bot.message_handler(func=lambda message: message.text in ['8', '/8', '🛑 Lihat Error'])
def get_only_errors(message):
    logging.info(f"[MSG] errors from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    if not os.path.exists(ERROR_LOG_FILE) or os.path.getsize(ERROR_LOG_FILE) == 0:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n✅ <b>Tidak ada error tercatat!</b> (<code>error.log</code> bersih/kosong).")
        return
    try:
        with open(ERROR_LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        log_text = "".join(lines[-30:])
        if not log_text.strip():
            safe_send_message(message.chat.id, f"👤 {user_name}:\n✅ <b>Tidak ada error tercatat.</b>")
            return
        safe_send_message(message.chat.id, f"👤 {user_name}:\n🛑 <b>Log Error Terakhir:</b>\n\n<pre>{html.escape(log_text[:3500])}</pre>")
    except Exception as e:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ Gagal: {html.escape(str(e))}")

@bot.message_handler(commands=['4', 'restart_bot'])
@bot.message_handler(func=lambda message: message.text in ['4', '/4', '🤖 Restart Bot'])
def restart_bot_command(message):
    logging.info(f"[MSG] restart_bot from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    safe_send_message(message.chat.id, f"👤 {user_name}:\n🔄 <b>Bot sedang memulai ulang...</b>")
    try:
        py_exe = os.path.join(BASE_DIR, "env", "Scripts", "python.exe")
        if not os.path.exists(py_exe):
            py_exe = sys.executable
        script_file = os.path.join(BASE_DIR, "telegram_bot.py")
        CREATE_NO_WINDOW = 0x08000000
        subprocess.Popen([py_exe, script_file], cwd=BASE_DIR, creationflags=CREATE_NO_WINDOW)
    except Exception as e:
        logging.error(f"Failed to spawn new bot process: {e}")
    time.sleep(1) 
    os._exit(0)

@bot.message_handler(commands=['9', 'reset_login', 'resetlogin'])
@bot.message_handler(func=lambda message: message.text in ['9', '/9', '🔓 Reset Login', '/reset_login', '/resetlogin', 'reset login', 'Reset Login'])
def reset_login_command(message):
    logging.info(f"[MSG] reset_login from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT [User_ID], [Nama], [Username] FROM [dbo].[users] WHERE LEN([Log]) >= 15 AND [Log] != 'RESET'")
            logged_in_users = cursor.fetchall()
            if not logged_in_users:
                safe_send_message(message.chat.id, f"👤 {user_name}:\nℹ️ <b>Tidak ada user yang sedang login saat ini.</b>", reply_markup=get_main_keyboard())
                return
            markup = telebot.types.InlineKeyboardMarkup()
            for user in logged_in_users:
                u_name = html.escape(user[1] or "")
                u_uname = html.escape(user[2] or "")
                markup.add(telebot.types.InlineKeyboardButton(text=f"👤 {u_name} (@{u_uname})", callback_data=f"rl_single_{user[0]}"))
            markup.add(telebot.types.InlineKeyboardButton(text="🚨 RESET SEMUA USER 🚨", callback_data="rl_all"))
            safe_send_message(message.chat.id, f"👤 {user_name}:\n📋 <b>List User Online ({len(logged_in_users)} user):</b>\nPilih user di bawah untuk memutuskan sesi:", reply_markup=markup)
    except Exception as e:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ <b>Gagal:</b> {html.escape(str(e))}")

@bot.callback_query_handler(func=lambda call: call.data.startswith('rl_'))
def handle_reset_login_callbacks(call):
    logging.info(f"[CALLBACK] {call.data} from chat={call.message.chat.id}, user={call.from_user.id}")
    if not is_authorized(call.message.chat.id, call.from_user): return
    
    user_name = get_user_display_name(call.from_user)
    try:
        with get_db_cursor() as cursor:
            if call.data == "rl_all":
                cursor.execute("UPDATE [dbo].[users] SET [Log] = 'RESET' WHERE LEN([Log]) >= 15 AND [Log] != 'RESET'")
                affected = cursor.rowcount
                # 1. Alert modal popup instan ke layar pengguna
                try:
                    bot.answer_callback_query(call.id, text=f"🚀 Berhasil! {affected} user online telah di-reset.", show_alert=True)
                except Exception:
                    pass
                # 2. Edit pesan inline agar tombol dan daftar user lama langsung terupdate seketika
                safe_edit_message(
                    call.message.chat.id,
                    call.message.message_id,
                    f"👤 {user_name}:\n🚀 <b>Semua user online ({affected} user) telah berhasil di-reset!</b>\n\n✅ Seluruh sesi user telah diputuskan.",
                    reply_markup=get_main_keyboard()
                )
            elif call.data.startswith("rl_single_"):
                uid = call.data.replace("rl_single_", "")
                cursor.execute("SELECT [Nama], [Username] FROM [dbo].[users] WHERE [User_ID] = %s", (uid,))
                target_user = cursor.fetchone()
                if target_user:
                    target_name = html.escape(target_user[0] or "")
                    target_username = html.escape(target_user[1] or "")
                    display_str = f"<b>{target_name}</b> (@{target_username})" if target_username else f"<b>{target_name}</b>"
                    cursor.execute("UPDATE [dbo].[users] SET [Log] = 'RESET' WHERE [User_ID] = %s", (uid,))
                    
                    # Ambil sisa user online untuk update daftar tombol secara realtime
                    cursor.execute("SELECT [User_ID], [Nama], [Username] FROM [dbo].[users] WHERE LEN([Log]) >= 15 AND [Log] != 'RESET'")
                    remaining_users = cursor.fetchall()
                    
                    try:
                        bot.answer_callback_query(call.id, text=f"✅ Sesi user {target_name} telah diputuskan.", show_alert=False)
                    except Exception:
                        pass

                    if remaining_users:
                        new_markup = telebot.types.InlineKeyboardMarkup()
                        for u in remaining_users:
                            un = html.escape(u[1] or "")
                            uun = html.escape(u[2] or "")
                            new_markup.add(telebot.types.InlineKeyboardButton(text=f"👤 {un} (@{uun})", callback_data=f"rl_single_{u[0]}"))
                        new_markup.add(telebot.types.InlineKeyboardButton(text="🚨 RESET SEMUA USER 🚨", callback_data="rl_all"))
                        safe_edit_message(
                            call.message.chat.id,
                            call.message.message_id,
                            f"👤 {user_name}:\n✅ Sesi user {display_str} telah berhasil diputuskan.\n\n📋 <b>Sisa User Online ({len(remaining_users)} user):</b>\nPilih user di bawah untuk memutuskan sesi:",
                            reply_markup=new_markup
                        )
                    else:
                        safe_edit_message(
                            call.message.chat.id,
                            call.message.message_id,
                            f"👤 {user_name}:\n✅ Sesi user {display_str} telah berhasil diputuskan.\n\nℹ️ <b>Tidak ada user online yang tersisa.</b>",
                            reply_markup=get_main_keyboard()
                        )
                else:
                    try:
                        bot.answer_callback_query(call.id, text="❌ User tidak ditemukan atau sudah logout.", show_alert=True)
                    except Exception:
                        pass
                    safe_edit_message(call.message.chat.id, call.message.message_id, f"👤 {user_name}:\n❌ User tidak ditemukan.", reply_markup=get_main_keyboard())
    except Exception as e:
        try:
            bot.answer_callback_query(call.id, text=f"❌ Gagal: {e}", show_alert=True)
        except Exception:
            pass
        safe_send_message(call.message.chat.id, f"👤 {user_name}:\n❌ <b>Gagal:</b> {html.escape(str(e))}")

@bot.message_handler(commands=['5', 'backup', 'backup_db'])
@bot.message_handler(func=lambda message: message.text in ['5', '/5', '💾 Backup DB', '💾 Backup Database'])
def backup_database_command(message):
    logging.info(f"[MSG] backup from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    msg = safe_send_message(message.chat.id, f"👤 {user_name}:\n⏳ Sedang memproses backup database <code>tct_inventory</code> ke <code>D:\\</code>...")
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
            resp = f"👤 {user_name}:\n✅ <b>Backup Database Berhasil!</b>\n\n📁 <b>File:</b> <code>{html.escape(filename)}</code>\n📊 <b>Ukuran:</b> <code>{size_mb:.2f} MB</code>\n📍 <b>Lokasi:</b> <code>{html.escape(file_path)}</code>"
        else:
            resp = f"👤 {user_name}:\n❌ <b>Gagal Backup:</b> {html.escape(res_msg)}"
        if msg:
            safe_edit_message(message.chat.id, msg.message_id, resp, reply_markup=get_main_keyboard())
        else:
            safe_send_message(message.chat.id, resp, reply_markup=get_main_keyboard())
    except Exception as e:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ Terjadi kesalahan: {html.escape(str(e))}", reply_markup=get_main_keyboard())

def show_cloudflare_menu_from_call(call):
    user_name = get_user_display_name(call.from_user)
    if not CF_AVAILABLE:
        safe_edit_message(call.message.chat.id, call.message.message_id, f"👤 {user_name}:\n❌ Modul Cloudflare tidak tersedia.")
        return
    status = cf_get_status()
    running = status.get('running', False)
    installed = status.get('installed', False)
    state_icon = '✅ RUNNING' if running else ('🔵 READY' if installed else '⚠️ NOT INSTALLED')
    from datetime import datetime
    now_str = datetime.now().strftime("%H:%M:%S")
    menu_text = (
        f"👤 {user_name} membuka menu Cloudflare:\n\n"
        f"☁️ <b>Cloudflare Tunnel</b>\n"
        f"Status saat ini: <b>{state_icon}</b>\n"
        f"⏱️ Update: <code>{now_str}</code>\n\n"
        f"Pilih tindakan:"
    )
    safe_edit_message(call.message.chat.id, call.message.message_id, menu_text, reply_markup=get_cloudflare_keyboard())

@bot.callback_query_handler(func=lambda call: call.data.startswith('btn_'))
def handle_menu_callbacks(call):
    logging.info(f"[CALLBACK] {call.data} from chat={call.message.chat.id}, user={call.from_user.id}")
    if not is_authorized(call.message.chat.id, call.from_user): return
    try:
        bot.answer_callback_query(call.id)
    except Exception:
        pass

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
    elif cmd == 'cloudflare': show_cloudflare_menu_from_call(call)
    elif cmd == 'help': send_welcome(call.message)

@bot.callback_query_handler(func=lambda call: call.data.startswith('cf_'))
def handle_cloudflare_callbacks(call):
    logging.info(f"[CALLBACK] {call.data} from chat={call.message.chat.id}, user={call.from_user.id}")
    if not is_authorized(call.message.chat.id, call.from_user): return

    user_name = get_user_display_name(call.from_user)

    if not CF_AVAILABLE:
        try: bot.answer_callback_query(call.id, "❌ Modul Cloudflare tidak tersedia.", show_alert=True)
        except Exception: pass
        safe_send_message(call.message.chat.id, "❌ Modul Cloudflare tidak tersedia.", reply_markup=get_cloudflare_keyboard())
        return

    cmd = call.data

    if cmd == 'cf_status':
        status = cf_get_status()
        installed = status.get('installed', False)
        running = status.get('running', False)
        url = status.get('url', '-')
        mode = status.get('mode', '-')
        custom_domain = status.get('custom_domain', '')
        from datetime import datetime
        now_str = datetime.now().strftime("%H:%M:%S")

        if not installed:
            state_text = "⚠️ <b>NOT INSTALLED</b> — Cloudflare belum terinstall."
            alert_text = "⚠️ Cloudflare (cloudflared.exe) belum terinstall."
        elif running:
            state_text = f"✅ <b>RUNNING</b>\n🔗 URL: <code>{html.escape(url or 'Memproses...')}</code>"
            alert_text = f"✅ Status: RUNNING\n🔗 URL: {url or '-'}"
        else:
            domain_info = f"\n🌐 Domain: <code>{html.escape(custom_domain)}</code>" if custom_domain else ""
            state_text = f"🔵 <b>READY</b> — Tunnel siap dijalankan.{domain_info}"
            alert_text = f"🔵 Status: READY (Belum aktif)\n📡 Mode: {mode}\n🌐 Domain: {custom_domain or '-'}"

        # 1. Tampilkan modal dialog seketika di layar
        try:
            bot.answer_callback_query(call.id, text=alert_text, show_alert=True)
        except Exception:
            pass

        # 2. Kirim pesan respon baru di obrolan
        status_text = (
            f"👤 {user_name} cek Cloudflare:\n\n"
            f"☁️ <b>Status Cloudflare Tunnel</b>\n"
            f"{state_text}\n"
            f"📡 Mode: <code>{html.escape(str(mode))}</code>\n"
            f"⏱️ Waktu Cek: <code>{now_str}</code>"
        )
        safe_send_message(call.message.chat.id, status_text, reply_markup=get_cloudflare_keyboard())

    elif cmd == 'cf_start':
        status = cf_get_status()
        if status.get('running'):
            try: bot.answer_callback_query(call.id, "⚠️ Tunnel sudah berjalan!", show_alert=True)
            except Exception: pass
            safe_send_message(call.message.chat.id, f"👤 {user_name}:\n⚠️ <b>Tunnel sudah berjalan!</b>", reply_markup=get_cloudflare_keyboard())
            return
        
        try: bot.answer_callback_query(call.id, "⏳ Memulai Cloudflare Tunnel...", show_alert=False)
        except Exception: pass
        
        msg = safe_send_message(call.message.chat.id, f"👤 {user_name}:\n⏳ <b>Memulai Cloudflare Tunnel...</b>")
        ok, message_res, url = cf_start_tunnel()
        result = f"✅ {html.escape(message_res)}" if ok else f"❌ {html.escape(message_res)}"
        if ok and url:
            result += f"\n🔗 URL: <code>{html.escape(url)}</code>"
        if msg:
            safe_edit_message(call.message.chat.id, msg.message_id, f"👤 {user_name}:\n{result}", reply_markup=get_cloudflare_keyboard())
        else:
            safe_send_message(call.message.chat.id, f"👤 {user_name}:\n{result}", reply_markup=get_cloudflare_keyboard())

    elif cmd == 'cf_stop':
        status = cf_get_status()
        if not status.get('running'):
            try: bot.answer_callback_query(call.id, "⚠️ Tunnel tidak sedang berjalan.", show_alert=True)
            except Exception: pass
            safe_send_message(call.message.chat.id, f"👤 {user_name}:\n⚠️ <b>Tunnel tidak sedang berjalan.</b>", reply_markup=get_cloudflare_keyboard())
            return
        
        try: bot.answer_callback_query(call.id, "⏹️ Menghentikan Cloudflare Tunnel...", show_alert=False)
        except Exception: pass
        
        ok, message_res = cf_stop_tunnel()
        result = f"✅ {html.escape(message_res)}" if ok else f"❌ {html.escape(message_res)}"
        safe_send_message(call.message.chat.id, f"👤 {user_name}:\n{result}", reply_markup=get_cloudflare_keyboard())

@bot.message_handler(commands=['3', 'restart', 'restart_server'])
@bot.message_handler(func=lambda message: message.text in ['3', '/3', '🔄 Restart Server'])
def restart_server(message):
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    safe_send_message(message.chat.id, f"👤 {user_name}:\n⏳ <b>Memproses restart server...</b>")
    try:
        # 1. Kill existing server processes
        if os.path.exists(PID_FILE):
            try:
                with open(PID_FILE, "r") as f:
                    pid = int(f.read().strip())
                if psutil.pid_exists(pid): 
                    psutil.Process(pid).kill()
            except Exception:
                pass
            try:
                os.remove(PID_FILE)
            except Exception:
                pass

        for proc in psutil.process_iter(['pid', 'name']):
            try:
                if "python" in (proc.info['name'] or "").lower():
                    cmdline = proc.cmdline() or []
                    if any(os.path.basename(str(arg).lower()) == "run.py" for arg in cmdline if arg):
                        proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        time.sleep(1.5)

        # 2. Start server again cleanly without zombie CMD loops
        py_exe = os.path.join(BASE_DIR, "env", "Scripts", "python.exe")
        if not os.path.exists(py_exe): py_exe = sys.executable
        run_script = os.path.join(BASE_DIR, "run.py")
        CREATE_NO_WINDOW = 0x08000000
        subprocess.Popen([py_exe, run_script], cwd=BASE_DIR, creationflags=CREATE_NO_WINDOW)
        
        # 3. Wait and verify
        time.sleep(3)
        if is_server_running():
            safe_send_message(message.chat.id, f"👤 {user_name}:\n✅ <b>Server berhasil di-restart dan RUNNING!</b>", reply_markup=get_main_keyboard())
        else:
            safe_send_message(message.chat.id, f"👤 {user_name}:\n⏳ <b>Server sedang booting</b>, silakan cek '📊 Status Server' sesaat lagi.", reply_markup=get_main_keyboard())
    except Exception as e:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ Gagal restart: {html.escape(str(e))}")

@bot.message_handler(commands=['6', 'cloudflare'])
@bot.message_handler(func=lambda message: message.text in ['6', '/6', '☁️ Cloudflare Tunnel', '☁️ Cloudflare'])
def cloudflare_menu_entry(message):
    cloudflare_menu(message)

def cloudflare_menu(message):
    """Show the Cloudflare Tunnel sub-menu."""
    logging.info(f"[MSG] cloudflare_menu from chat={message.chat.id}, user={message.from_user.id}")
    if not is_authorized(message.chat.id, message.from_user): return
    user_name = get_user_display_name(message.from_user)
    if not CF_AVAILABLE:
        safe_send_message(message.chat.id, f"👤 {user_name}:\n❌ Modul Cloudflare tidak tersedia.")
        return
    status = cf_get_status()
    running = status.get('running', False)
    installed = status.get('installed', False)
    state_icon = '✅ RUNNING' if running else ('🔵 READY' if installed else '⚠️ NOT INSTALLED')
    from datetime import datetime
    now_str = datetime.now().strftime("%H:%M:%S")
    safe_send_message(
        message.chat.id,
        f"👤 {user_name} membuka menu Cloudflare:\n\n"
        f"☁️ <b>Cloudflare Tunnel</b>\n"
        f"Status saat ini: <b>{state_icon}</b>\n"
        f"⏱️ Update: <code>{now_str}</code>\n\n"
        f"Pilih tindakan:",
        reply_markup=get_cloudflare_keyboard()
    )

# Handler logging (pindahkan ke bawah agar tidak memblokir command lain)
@bot.message_handler(func=lambda message: True)
def log_incoming(message):
    logging.info(f"[MSG-OTHER] chat={message.chat.id}, user={message.from_user.id} (@{getattr(message.from_user, 'username', '')}): {message.text}")

if __name__ == "__main__":
    kill_conflicting_bot_instances()
    logging.info(f"Bot started (PID: {os.getpid()})... Monitoring: {AUTHORIZED_IDS}")
    try:
        # 1. Daftarkan menu perintah resmi ke Telegram
        setup_bot_commands()

        # 2. Bersihkan webhook yang aktif di server Telegram agar long polling tidak error 409 Conflict
        try:
            bot.delete_webhook(drop_pending_updates=False)
            logging.info("Webhook berhasil dibersihkan (deleteWebhook). Memulai polling Telegram...")
        except Exception as e_wh:
            logging.warning(f"Gagal membersihkan webhook: {e_wh}")

        # Pastikan allowed_updates mencakup callback_query agar tombol inline selalu diterima seketika
        bot.infinity_polling(
            timeout=60,
            long_polling_timeout=15,
            allowed_updates=getattr(telebot.util, 'update_types', None)
        )
    except Exception as e:
        logging.error(f"Polling error: {e}")
        time.sleep(3)
        os._exit(1)
