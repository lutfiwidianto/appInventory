from datetime import datetime

def format_indo_date(dt):
    """
    Thread-safe Indonesian date formatting.
    Example: 21 April 2026
    """
    if not dt:
        return ""
    
    months = {
        1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April', 
        5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus', 
        9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
    }
    
    day = dt.day
    month = months[dt.month]
    year = dt.year
    
    return f"{day} {month} {year}"

def format_dmy(dt):
    """
    Format date as dd-mm-yyyy.
    Example: 22-04-2026
    """
    if not dt:
        return ""
    return dt.strftime("%d-%m-%Y")

def format_indo_datetime(dt):
    """
    Thread-safe Indonesian datetime formatting.
    Example: 21-Apr-2026 15:16
    """
    if not dt:
        return ""
    
    months_short = {
        1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 
        5: 'Mei', 6: 'Jun', 7: 'Jul', 8: 'Ags', 
        9: 'Sep', 10: 'Okt', 11: 'Nov', 12: 'Des'
    }
    
    return dt.strftime(f"%d-{months_short[dt.month]}-%Y %H:%M")

def parse_date(date_str):
    """
    Robustly parse date strings into datetime objects.
    Supports: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD
    """
    if not date_str:
        return None
    if isinstance(date_str, datetime):
        return date_str
        
    date_str = date_str.strip()
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None # Safer fallback to avoid SQL conversion errors

from functools import wraps
from flask import request, redirect, render_template
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

import time
import threading

_PERMISSIONS_CACHE = {}
_CACHE_LOCK = threading.Lock()
_CACHE_TTL = 60  # seconds

def invalidate_permission_cache(username=None):
    """Invalidate permission cache when roles or permissions are updated."""
    with _CACHE_LOCK:
        if username:
            _PERMISSIONS_CACHE.pop(username, None)
        else:
            _PERMISSIONS_CACHE.clear()

def get_user_permissions(username):
    """Fetch user permission codes from database with thread-safe 60s in-memory caching."""
    if not username:
        return []
        
    now = time.time()
    with _CACHE_LOCK:
        if username in _PERMISSIONS_CACHE:
            cached_perms, exp_time = _PERMISSIONS_CACHE[username]
            if now < exp_time:
                return cached_perms

    permissions = []
    try:
        with get_db_cursor() as cursor:
            query = """
                SELECT p.Permission_Code 
                FROM dbo.users u
                JOIN dbo.roles r ON u.Role_ID = r.Role_ID
                JOIN dbo.role_permissions rp ON r.Role_ID = rp.Role_ID
                JOIN dbo.permissions p ON rp.Permission_ID = p.Permission_ID
                WHERE u.username = %s
            """
            cursor.execute(query, (username,))
            rows = cursor.fetchall()
            permissions = [row[0].strip() for row in rows]
            
            with _CACHE_LOCK:
                _PERMISSIONS_CACHE[username] = (permissions, now + _CACHE_TTL)
    except Exception as e:
        print(f"Error fetching user permissions for {username}: {e}")
        with _CACHE_LOCK:
            if username in _PERMISSIONS_CACHE:
                return _PERMISSIONS_CACHE[username][0]
    return permissions

def check_permission(permission_code):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.cookies.get("token")
            if not token:
                return redirect("/login")
            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                username = data.get("sub")
                
                permissions = get_user_permissions(username)
                if permission_code in permissions:
                    return f(*args, **kwargs)
                else:
                    return render_template("controlpagehtml/dilarang.html", 
                                           username=username, 
                                           namalengkap=data.get("nama_lengkap"),
                                           level_user=data.get("level_user"), 
                                           titlePage='Dilarang')
            except Exception:
                return redirect("/login")
        return decorated_function
    return decorator

