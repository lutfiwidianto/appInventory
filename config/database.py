# config/database.py
import pymssql
import sys
from contextlib import contextmanager

# Fungsi original (tetap ada untuk compatibility)
def create_connection():
    """
    ⚠️ LEGACY FUNCTION - Hati-hati bisa cause connection leak!
    Gunakan get_db_cursor() untuk code baru
    """
    try:
        conn = pymssql.connect(
            server="192.17.17.201\\SQLSERVER",
            user="sa",
            password="@itTCT5613288",
            database="tct_inventory",
            login_timeout=5,     # Timeout 5 detik untuk login
            timeout=30           # Timeout 30 detik untuk query
        )
        return conn
    except pymssql.Error as e:
        print("Error:", e)
        sys.exit(1)

# ✅ NEW: Context manager untuk hindari connection leak
@contextmanager
def get_db_connection():
    """Context manager untuk handle database connection dengan auto-close"""
    conn = None
    try:
        conn = pymssql.connect(
            server="192.17.17.201\\SQLSERVER",
            user="sa",
            password="@itTCT5613288",
            database="tct_inventory",
            autocommit=True,
            login_timeout=5,     # Timeout 5 detik koneksi awal
            timeout=15           # Timeout 15 detik untuk query (mencegah thread starvation)
        )
        yield conn
    except pymssql.Error as e:
        from config.logger import log_exception
        log_exception(e, context="Database Connection / Query Error")
        print(f"Database connection error: {e}")
        raise e
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

@contextmanager
def get_db_cursor():
    """Context manager untuk handle database cursor dengan auto-close"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            yield cursor
        finally:
            cursor.close()