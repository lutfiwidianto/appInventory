import os
import sys
from datetime import datetime
import pymssql
import logging
from logging.handlers import RotatingFileHandler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

LOG_FILE = os.path.join(BASE_DIR, "backup.log")

# Setup logging
logger = logging.getLogger("db_backup")
logger.setLevel(logging.INFO)
if not logger.handlers:
    formatter = logging.Formatter("[%(asctime)s] %(levelname)s: %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5*1024*1024, backupCount=3, encoding="utf-8")
    file_handler.setFormatter(formatter)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

def send_telegram_alert(message_text):
    try:
        from config.telegram import TELEGRAM_TOKEN, AUTHORIZED_IDS
        import requests
        if not TELEGRAM_TOKEN or not AUTHORIZED_IDS:
            return
        for chat_id in AUTHORIZED_IDS:
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
                payload = {
                    "chat_id": chat_id,
                    "text": message_text,
                    "parse_mode": "Markdown"
                }
                requests.post(url, json=payload, timeout=5)
            except Exception as te:
                logger.warning(f"Gagal mengirim notifikasi Telegram ke {chat_id}: {te}")
    except Exception as e:
        logger.warning(f"Telegram alert error: {e}")

def send_telegram_file(file_path, user_trigger="System Schedule"):
    """
    Mengompresi file .bak menjadi .zip secara cepat (3.5MB) dan mengirimkannya langsung ke Telegram
    sebagai cadangan kedua (secondary backup).
    """
    try:
        from config.telegram import TELEGRAM_TOKEN, AUTHORIZED_IDS
        import requests
        import zipfile
        
        if not TELEGRAM_TOKEN or not AUTHORIZED_IDS:
            return
            
        zip_path = file_path.replace(".bak", ".zip")
        # Kompresi dengan level 6 (sangat cepat ~0.9s dan rasio kompresi 88%)
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            zf.write(file_path, arcname=os.path.basename(file_path))
            
        zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
        filename = os.path.basename(zip_path)
        caption = (
            f"📦 *File Backup Database (Secondary Backup)*\n\n"
            f"📁 *File:* `{filename}`\n"
            f"📊 *Ukuran Zip:* `{zip_size_mb:.2f} MB`\n"
            f"👤 *Pemicu:* `{user_trigger}`\n"
            f"📅 *Waktu:* `{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}`\n\n"
            f"💡 *Catatan:* File ini adalah cadangan otomatis (.zip). Ekstrak file untuk mendapatkan file `.bak` database SQL Server."
        )
        
        for chat_id in AUTHORIZED_IDS:
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendDocument"
                with open(zip_path, 'rb') as doc:
                    files = {'document': doc}
                    data = {'chat_id': chat_id, 'caption': caption, 'parse_mode': 'Markdown'}
                    r = requests.post(url, files=files, data=data, timeout=60)
                    if r.status_code == 200:
                        logger.info(f"Berhasil mengirim file backup .zip ke Telegram ({chat_id}).")
                    else:
                        logger.warning(f"Gagal kirim ke Telegram ({chat_id}): {r.status_code}")
            except Exception as ce:
                logger.warning(f"Error kirim file ke Telegram ({chat_id}): {ce}")
                
        # Hapus temporary zip file setelah terkirim
        if os.path.exists(zip_path):
            os.remove(zip_path)
    except Exception as e:
        logger.warning(f"send_telegram_file error: {e}")

def perform_backup(target_dir="D:\\", database="tct_inventory", notify_telegram=True, user_trigger="System Schedule", wait_telegram=False):
    """
    Menjalankan full backup SQL Server ke file:
    D:\DB APPINVENTORY_YYYY-MM-DD_HH.MM.SS.bak
    """
    import threading

    timestamp = datetime.now().strftime("%Y-%m-%d_%H.%M.%S")
    filename = f"DB APPINVENTORY_{timestamp}.bak"
    file_path = os.path.join(target_dir, filename)

    logger.info(f"--- MEMULAI BACKUP DATABASE [{database}] (Trigger: {user_trigger}) ---")
    logger.info(f"Target file: {file_path}")

    start_time = datetime.now()

    try:
        conn = pymssql.connect(
            server="192.17.17.201\\SQLSERVER",
            user="sa",
            password="@itTCT5613288",
            database="master",
            autocommit=True,
            login_timeout=10,
            timeout=300
        )
        cursor = conn.cursor()
        
        # Perintah SQL Server Full Backup
        sql_command = f"BACKUP DATABASE [{database}] TO DISK = N'{file_path}' WITH NOFORMAT, NOINIT, NAME = N'{database}-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"
        cursor.execute(sql_command)
        conn.close()

        duration = (datetime.now() - start_time).total_seconds()

        if os.path.exists(file_path):
            file_size_bytes = os.path.getsize(file_path)
            file_size_mb = file_size_bytes / (1024 * 1024)
            success_msg = f"BACKUP SUKSES: {filename} ({file_size_mb:.2f} MB) dalam {duration:.2f}s."
            logger.info(success_msg)

            if notify_telegram:
                # Kirim pesan status ringkas
                tg_msg = (
                    f"💾 *Laporan Backup Database Berhasil*\n\n"
                    f"📁 *File:* `{filename}`\n"
                    f"📊 *Ukuran:* `{file_size_mb:.2f} MB`\n"
                    f"⏱️ *Durasi:* `{duration:.2f}s`\n"
                    f"👤 *Pemicu:* `{user_trigger}`\n"
                    f"📍 *Lokasi:* `{file_path}`\n"
                    f"📅 *Waktu:* `{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}`"
                )
                send_telegram_alert(tg_msg)

                # Kirim dokumen file fisik (.zip) ke Telegram
                t = threading.Thread(target=send_telegram_file, args=(file_path, user_trigger), daemon=not wait_telegram)
                t.start()
                if wait_telegram:
                    t.join(timeout=120)

            return True, success_msg, file_path, file_size_mb
        else:
            err_msg = f"File backup tidak ditemukan di {file_path} setelah eksekusi query."
            logger.error(err_msg)
            if notify_telegram:
                send_telegram_alert(f"⚠️ *Backup Warning:* File backup tidak terbentuk di `{file_path}`")
            return False, err_msg, None, 0

    except Exception as e:
        err_msg = f"Terjadi kesalahan saat backup: {str(e)}"
        logger.error(err_msg, exc_info=True)
        if notify_telegram:
            send_telegram_alert(f"🚨 *Gagal Backup Database!*\n\nError: `{str(e)}`\nWaktu: `{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}`")
        return False, err_msg, None, 0

if __name__ == "__main__":
    success, msg, path, size = perform_backup(user_trigger="Task Scheduler / CLI", wait_telegram=True)
    if not success:
        sys.exit(1)
