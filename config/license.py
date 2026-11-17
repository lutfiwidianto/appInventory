import os
import json
import time
import hmac
import hashlib
import logging
import threading
import requests
from datetime import datetime, date
from config.secretKey import SECRET_KEY

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETTINGS_FILE = os.path.join(BASE_DIR, "config", "license_settings.json")
CACHE_FILE = os.path.join(BASE_DIR, "config", "license_cache.json")

# Salt rahasia untuk HMAC Signature Anti-Tamper
HMAC_SALT = "TCT_INVENTORY_SECURITY_SALT_v1_Lutfi"

# Master SHA-256 Hash Kunci Default
MASTER_KEY_HASH = hashlib.sha256("lutfiw1diant0".encode()).hexdigest()

DEFAULT_SETTINGS = {
    "enabled": True,
    "github_raw_url": "https://raw.githubusercontent.com/lutfiwidianto/appInventory/main/license.txt",
    "expected_key": "lutfiw1diant0",
    "expire_enabled": False,
    "expire_date": "2026-12-31",
    "custom_error_message": "Akses aplikasi dinonaktifkan atau masa berlaku lisensi telah habis. Silakan hubungi Administrator.",
    "strict_mode": True
}

# In-Memory Cache (Thread-Safe)
_LOCK = threading.Lock()
_CURRENT_SETTINGS = dict(DEFAULT_SETTINGS)
_CURRENT_KEY = DEFAULT_SETTINGS["expected_key"]
_LAST_SYNC_TIME = None
_SYNC_STATUS = "Initialized"
_IS_TAMPERED = False

logger = logging.getLogger("license_sync")

def _compute_signature(settings_dict):
    """
    Menghasilkan HMAC-SHA256 signature digital dari seluruh data pengaturan.
    Jika ada orang yang mengedit file JSON secara manual (Notepad dll.),
    signature ini akan rusak dan sistem otomatis mendeteksi pembobolan (Tamper).
    """
    clean_data = {k: v for k, v in settings_dict.items() if k != "_signature"}
    serialized = json.dumps(clean_data, sort_keys=True, separators=(',', ':'))
    key_bytes = f"{SECRET_KEY}_{HMAC_SALT}".encode("utf-8")
    return hmac.new(key_bytes, serialized.encode("utf-8"), hashlib.sha256).hexdigest()

def _load_settings():
    """Memuat dan memverifikasi integritas license_settings.json."""
    global _CURRENT_SETTINGS, _IS_TAMPERED
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                
            stored_sig = saved.get("_signature")
            computed_sig = _compute_signature(saved)

            # Verifikasi HMAC Signature
            if not stored_sig or stored_sig != computed_sig:
                _IS_TAMPERED = True
                logger.critical("[TAMPER DETECTED] license_settings.json has been modified externally without authorization! Enforcing security lockdown.")
                with _LOCK:
                    _CURRENT_SETTINGS = dict(DEFAULT_SETTINGS)
                return
            else:
                _IS_TAMPERED = False
                with _LOCK:
                    # Ambil data tanpa key _signature ke dalam active memory
                    clean = {k: v for k, v in saved.items() if k != "_signature"}
                    _CURRENT_SETTINGS.update(clean)
                logger.info("Loaded and verified authentic license settings (HMAC Signature valid).")
                return
        except Exception as e:
            logger.warning(f"Failed to read license settings file: {e}")
            _IS_TAMPERED = True
    
    # Jika file belum ada, buat file baru dengan signature valid
    with _LOCK:
        _CURRENT_SETTINGS = dict(DEFAULT_SETTINGS)
    _save_settings(_CURRENT_SETTINGS)

def _save_settings(settings_dict):
    """Menyimpan pengaturan dengan HMAC-SHA256 digital signature."""
    global _IS_TAMPERED
    try:
        data_to_save = dict(settings_dict)
        data_to_save["_signature"] = _compute_signature(data_to_save)
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data_to_save, f, indent=4)
        _IS_TAMPERED = False
        return True
    except Exception as e:
        logger.error(f"Failed to write license settings file: {e}")
        return False

def _load_persisted_cache():
    """Memuat kunci terakhir dari disk cache jika ada."""
    global _CURRENT_KEY, _LAST_SYNC_TIME
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                cached_key = data.get("key", "").strip()
                if cached_key:
                    with _LOCK:
                        _CURRENT_KEY = cached_key
                        _LAST_SYNC_TIME = data.get("last_sync")
                    logger.info(f"Loaded license key from local cache: {_CURRENT_KEY[:4]}***")
                    return
        except Exception as e:
            logger.warning(f"Failed to read license cache file: {e}")

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

def _fetch_from_github(url):
    """Ambil kunci lisensi murni dari GitHub raw URL."""
    if not url:
        return None
    try:
        headers = {"User-Agent": "InventoryLicenseClient/1.0"}
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            val = r.text.strip()
            if val:
                return val
    except Exception as e:
        logger.debug(f"GitHub fetch error: {e}")
    return None

def perform_sync():
    """
    Fungsi sinkronisasi lisensi dari GitHub Raw URL.
    """
    global _CURRENT_KEY, _LAST_SYNC_TIME, _SYNC_STATUS

    with _LOCK:
        url = _CURRENT_SETTINGS.get("github_raw_url", "")
        strict_mode = _CURRENT_SETTINGS.get("strict_mode", True)

    new_key = _fetch_from_github(url)

    if new_key:
        with _LOCK:
            _CURRENT_KEY = new_key
            _LAST_SYNC_TIME = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            _SYNC_STATUS = f"Tersinkronisasi dari GitHub Raw pada {_LAST_SYNC_TIME}"
        _save_persisted_cache(new_key)
        logger.info(f"License key successfully synced from GitHub: {new_key[:4]}***")
        return True, new_key, "GitHub Raw"
    else:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if strict_mode:
            with _LOCK:
                _CURRENT_KEY = "SERVER_OFFLINE_LOCKED"
                _SYNC_STATUS = f"Koneksi GitHub gagal / offline ({now_str})"
            logger.warning("Strict Security Mode: GitHub raw unreachable. Login locked down for normal users.")
            return False, _CURRENT_KEY, "Strict Lockdown (GitHub Unreachable)"
        else:
            with _LOCK:
                _SYNC_STATUS = f"Offline Fallback (menggunakan cache lokal) pada {now_str}"
            logger.warning("Remote license unreachable. Using cached key fallback.")
            return False, _CURRENT_KEY, "Local Cache Fallback"

def trigger_async_sync():
    """Memicu sinkronisasi di background thread terpisah."""
    t = threading.Thread(target=perform_sync, daemon=True)
    t.start()

def get_current_key():
    """Mengambil kunci lisensi aktif saat ini dari memori (instant 0.0001s)."""
    with _LOCK:
        return _CURRENT_KEY

def get_license_full_state():
    """Mengambil semua pengaturan dan status realtime untuk dashboard/UI."""
    with _LOCK:
        settings_copy = dict(_CURRENT_SETTINGS)
        key_val = _CURRENT_KEY
        last_sync = _LAST_SYNC_TIME
        sync_status = _SYNC_STATUS
        is_tampered = _IS_TAMPERED

    # Cek status expired hari ini
    today = date.today()
    is_expired = False
    if settings_copy.get("expire_enabled") and settings_copy.get("expire_date"):
        try:
            exp_date = datetime.strptime(settings_copy["expire_date"], "%Y-%m-%d").date()
            if today > exp_date:
                is_expired = True
        except Exception:
            pass

    # Cek kecocokan key
    expected = settings_copy.get("expected_key", "")
    key_matched = (key_val == expected)

    return {
        "settings": settings_copy,
        "current_key": key_val,
        "expected_key": expected,
        "key_matched": key_matched,
        "is_expired": is_expired,
        "is_tampered": is_tampered,
        "last_sync": last_sync,
        "sync_status": sync_status
    }

def update_license_settings(new_settings):
    """
    Menyimpan pengaturan baru dari UI (hanya dipanggil oleh master admin lutfi).
    """
    global _CURRENT_SETTINGS
    with _LOCK:
        _CURRENT_SETTINGS.update(new_settings)
        saved_copy = dict(_CURRENT_SETTINGS)

    success = _save_settings(saved_copy)
    if success:
        trigger_async_sync()
    return success

def validate_license_for_user(username):
    """
    Validasi lisensi saat login:
    - User 'lutfi' SELALU DI-BYPASS 100% (Never locked out).
    - Jika terdeteksi file konfigurasi dimanipulasi (Tampered) -> Ditolak.
    - Jika fitur 'enabled' == False -> Lolos untuk semua.
    - Jika 'expire_enabled' == True dan hari ini > expire_date -> Ditolak.
    - Jika 'current_key' != 'expected_key' -> Ditolak.
    
    Mengembalikan: (is_valid: bool, error_message: str)
    """
    user_clean = str(username or "").strip().lower()
    
    # 1. Master Admin Bypass untuk user lutfi
    if user_clean == "lutfi":
        return True, "Master Admin Bypass (lutfi)"

    # 2. Cek apakah ada upaya modifikasi tidak sah (Tampering) pada file lokal
    if _IS_TAMPERED:
        logger.critical(f"Login rejected for '{username}': System is in anti-tamper lockdown state.")
        return False, "Peringatan Keamanan: Terdeteksi modifikasi file lisensi secara tidak sah. Hubungi Master Administrator."

    with _LOCK:
        settings = dict(_CURRENT_SETTINGS)
        current_key = _CURRENT_KEY

    custom_msg = settings.get("custom_error_message") or DEFAULT_SETTINGS["custom_error_message"]

    # 3. Jika proteksi lisensi dinonaktifkan dari UI
    if not settings.get("enabled", True):
        return True, "License protection is disabled"

    # 4. Cek Tanggal Kadaluarsa (Blocked by Date)
    if settings.get("expire_enabled", False) and settings.get("expire_date"):
        try:
            exp_date = datetime.strptime(settings["expire_date"], "%Y-%m-%d").date()
            if date.today() > exp_date:
                logger.warning(f"Login rejected for '{username}': License expired on {settings['expire_date']}.")
                return False, custom_msg
        except Exception as e:
            logger.error(f"Error parsing license expire_date: {e}")

    # 5. Cek Kunci Lisensi (GitHub Raw Key Match)
    expected_key = settings.get("expected_key", DEFAULT_SETTINGS["expected_key"])
    if current_key != expected_key:
        logger.warning(f"Login rejected for '{username}': License key mismatch (Current: '{current_key[:4]}***', Expected: '{expected_key[:4]}***').")
        return False, custom_msg

    return True, "Valid"

def start_license_background_worker(interval_seconds=60):
    """Background worker untuk sinkronisasi lisensi otomatis."""
    def _worker():
        time.sleep(1)
        perform_sync()
        while True:
            try:
                time.sleep(interval_seconds)
                perform_sync()
            except Exception as e:
                logger.error(f"License background worker error: {e}")
                time.sleep(10)

    t = threading.Thread(target=_worker, daemon=True)
    t.start()
    logger.info(f"License background sync worker active ({interval_seconds}s interval).")

# Inisialisasi awal saat modul diimport
_load_settings()
_load_persisted_cache()
