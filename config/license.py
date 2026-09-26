import os
import json
import time
import logging
import threading
import requests
from bs4 import BeautifulSoup
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_FILE = os.path.join(BASE_DIR, "config", "license_cache.json")
DEFAULT_KEY = "lutfiw1diant0"

# URL Sumber Sinkronisasi Kunci
GOOGLE_FORMS_URL = "https://docs.google.com/forms/d/e/1FAIpQLScV7JwxUT6ylcI3F_DkJnvCZqOpq9LiqclRBqIs1qT4RbVi_A/viewform"
GITHUB_KEY_URL = "https://raw.githubusercontent.com/lutfiwidianto/appInventory/main/license.txt"

# In-Memory Cache (Thread-Safe)
_KEY_LOCK = threading.Lock()
_CURRENT_KEY = DEFAULT_KEY
_LAST_SYNC_TIME = None
_SYNC_STATUS = "Initialized"

logger = logging.getLogger("license_sync")

def _load_persisted_cache():
    """Memuat kunci terakhir dari disk cache jika ada."""
    global _CURRENT_KEY, _LAST_SYNC_TIME
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                cached_key = data.get("key", "").strip()
                if cached_key:
                    with _KEY_LOCK:
                        _CURRENT_KEY = cached_key
                        _LAST_SYNC_TIME = data.get("last_sync")
                    logger.info(f"Loaded license key from local cache: {_CURRENT_KEY[:4]}***")
                    return
        except Exception as e:
            logger.warning(f"Failed to read license cache file: {e}")
    
    with _KEY_LOCK:
        _CURRENT_KEY = DEFAULT_KEY

def _save_persisted_cache(key_value):
    """Menyimpan kunci valid ke disk cache agar selalu tersedia offline."""
    try:
        data = {
            "key": key_value,
            "last_sync": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Valid"
        }
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logger.warning(f"Failed to write license cache file: {e}")

def _fetch_from_github():
    """Coba ambil kunci lisensi dari GitHub raw / gist."""
    if not GITHUB_KEY_URL:
        return None
    try:
        headers = {"User-Agent": "InventoryLicenseClient/1.0"}
        r = requests.get(GITHUB_KEY_URL, headers=headers, timeout=3)
        if r.status_code == 200:
            val = r.text.strip()
            if val and len(val) >= 5:
                return val
    except Exception:
        pass
    return None

def _fetch_from_google_forms():
    """Coba ambil kunci lisensi dari Google Forms."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        r = requests.get(GOOGLE_FORMS_URL, headers=headers, timeout=3)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            div_element = soup.find('div', class_='cBGGJ OIC90c', dir='auto')
            if div_element:
                val = div_element.text.strip()
                if val:
                    return val
    except Exception:
        pass
    return None

def perform_sync():
    """
    Fungsi sinkronisasi multi-sumber (GitHub -> Google Forms -> Local Fallback).
    Dijalankan secara ASYNCHRONOUS (Background) agar tidak pernah memblokir login.
    """
    global _CURRENT_KEY, _LAST_SYNC_TIME, _SYNC_STATUS

    # 1. Coba GitHub terlebih dahulu
    new_key = _fetch_from_github()
    source_name = "GitHub"

    # 2. Jika GitHub gagal/tidak ada, coba Google Forms
    if not new_key:
        new_key = _fetch_from_google_forms()
        source_name = "Google Forms"

    # 3. Evaluasi hasil
    if new_key:
        with _KEY_LOCK:
            _CURRENT_KEY = new_key
            _LAST_SYNC_TIME = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            _SYNC_STATUS = f"Synced from {source_name} at {_LAST_SYNC_TIME}"
        _save_persisted_cache(new_key)
        logger.info(f"License key successfully synced from {source_name}")
        return True, new_key, source_name
    else:
        # 4. Jika semua server eksternal offline, tetap gunakan kunci cache saat ini (Never Crash/Hang)
        with _KEY_LOCK:
            _SYNC_STATUS = f"Offline Fallback (using cached key) at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        logger.warning("Remote license servers unreachable. Using local cached key.")
        return False, _CURRENT_KEY, "Local Cache Fallback"

def trigger_async_sync():
    """Memicu sinkronisasi di background thread terpisah tanpa menunggu."""
    t = threading.Thread(target=perform_sync, daemon=True)
    t.start()

def get_current_key():
    """
    Mengambil kunci lisensi secara INSTAN (0.0001 detik) langsung dari memori.
    Fungsi ini 100% aman dan tidak akan pernah menyebabkan loading/hang.
    """
    with _KEY_LOCK:
        return _CURRENT_KEY

def get_license_info():
    """Informasi status lisensi untuk admin/monitoring."""
    with _KEY_LOCK:
        return {
            "key": _CURRENT_KEY,
            "last_sync": _LAST_SYNC_TIME,
            "status": _SYNC_STATUS,
            "default_key": DEFAULT_KEY
        }

def start_license_background_worker(interval_seconds=3600):
    """
    Menjalankan background daemon thread yang secara berkala mensinkronkan kunci
    setiap 1 jam di latar belakang tanpa mengganggu request pengguna.
    """
    def _worker():
        # Sync pertama saat startup
        time.sleep(2)
        perform_sync()
        
        while True:
            try:
                time.sleep(interval_seconds)
                perform_sync()
            except Exception as e:
                logger.error(f"License background worker error: {e}")
                time.sleep(60)

    t = threading.Thread(target=_worker, daemon=True)
    t.start()
    logger.info("License background sync worker started (1 hour interval).")

# Inisialisasi awal saat modul diimport
_load_persisted_cache()
