from flask import Flask, Response, request, send_from_directory
from waitress import serve
import logging
import pyotp
import time
import os
import jwt
from logging.handlers import RotatingFileHandler
from datetime import datetime

# Import blueprint dan konfigurasi
from app.auth import auth_bp
from app.general import gen_bp
from app.helper import helper_bp
from app.users import users_bp
from app.permintaanit import permintIt_bp
from app.peminjamanbarang import peminjamanBarang_bp
from config.ipaddress import get_local_ip
from app.utils import get_user_permissions
from config.secretKey import SECRET_KEY
from config.database import get_db_cursor
from app.pmc_nomor_surat import pmc_nomorsurat_bp
from app.pmc_pemetaan_kemasan import pmc_pemetaankemasan_bp
from app.pmc_produksi_pakai_pengemas import pmc_produksipakaipengemas_bp
from app.pmc_produksi_tanpa_pengemas import pmc_produksitanpapengemas_bp
from app.pmc_form import pmc_form_bp
from app.pmc_input_bc40 import pmc_bc40_bp
from app.pmc_mutasi_barang_keluar import wh_pmcmutasibarangkeluar_bp
from app.wh_all_bpb import wh_allbpb_bp
from app.wh_laporan import wh_laporan_bp
from app.wh_master_barang import wh_masterbarang_bp
from app.wh_all_pr_barang import wh_allprbarang_bp
from app.wh_receive_barang import wh_receivebarang_bp
from app.wh_mutasi_barang import wh_mutasibarang_bp
from app.wh_mutasi_barang_masuk import wh_mutasibarangmasuk_bp
from app.wh_mutasi_barang_keluar import wh_mutasibarangkeluar_bp
from app.wh_online_kartu_stock import wh_onlinekartustock_bp
from app.wh_onlinekartustockwithsmart import wh_onlinekartustock_w_smart_bp
from app.wh_global_stock import wh_globalstock_bp
from app.wh_invoice import wh_invoice_bp
from app.wh_bj_masuk import wh_bj_masuk_bp
from app.wh_bj_keluar import wh_bj_keluar_bp
from app.wh_bj_globalstock import wh_bj_globalstock_bp
from app.cloudflare_tunnel import cloudflare_tunnel_bp
from app.backup_db import backup_db_bp

# Buat Flask app
app = Flask(__name__)
app.secret_key = SECRET_KEY
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

# Set logging level
logging.getLogger('werkzeug').setLevel(logging.ERROR)

# ✅ SIMPLE REQUEST LOGGING MIDDLEWARE
@app.before_request
def log_request():
    ignore_paths = (
        "/static/",
        "/js/",
        "/favicon.ico",
        ".css",
        ".js",
        ".png",
        ".jpg",
        ".jpeg",
        ".svg",
        ".map",
        ".woff",
        ".woff2",
        ".ttf",
    )

    path = request.path.lower()

    # Jangan log jika path mengandung salah satu ignore_paths
    if any(path.startswith(p) or path.endswith(p) for p in ignore_paths):
        return

    # Catat log ke file server.log
    app.logger.info(f"{request.remote_addr} {request.method} {request.path}")

# Registrasi route untuk static files & favicon
@app.route("/favicon.ico")
def favicon():
    return send_from_directory(os.path.join(app.root_path, "static", "img"), "tct_logoa.png", mimetype="image/png")

@app.route("/js/<path:path>")
def send_js(path):
    return send_from_directory("templates/controlpagejs", path)

# Registrasi semua blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(gen_bp)
app.register_blueprint(helper_bp)
app.register_blueprint(users_bp)
app.register_blueprint(permintIt_bp)
app.register_blueprint(peminjamanBarang_bp)
app.register_blueprint(pmc_nomorsurat_bp)
app.register_blueprint(pmc_pemetaankemasan_bp)
app.register_blueprint(pmc_produksipakaipengemas_bp)
app.register_blueprint(pmc_produksitanpapengemas_bp)
app.register_blueprint(pmc_form_bp)
app.register_blueprint(pmc_bc40_bp)
app.register_blueprint(wh_pmcmutasibarangkeluar_bp)
app.register_blueprint(wh_allbpb_bp)
app.register_blueprint(wh_laporan_bp)
app.register_blueprint(wh_masterbarang_bp)
app.register_blueprint(wh_allprbarang_bp)
app.register_blueprint(wh_receivebarang_bp)
app.register_blueprint(wh_mutasibarang_bp)
app.register_blueprint(wh_mutasibarangmasuk_bp)
app.register_blueprint(wh_mutasibarangkeluar_bp)
app.register_blueprint(wh_onlinekartustock_bp)
app.register_blueprint(wh_onlinekartustock_w_smart_bp)
app.register_blueprint(wh_globalstock_bp)
app.register_blueprint(wh_invoice_bp)
app.register_blueprint(wh_bj_masuk_bp)
app.register_blueprint(wh_bj_keluar_bp)
app.register_blueprint(wh_bj_globalstock_bp)
app.register_blueprint(cloudflare_tunnel_bp)
app.register_blueprint(backup_db_bp)

# ─── RBAC Context Processor ─────────────────────────────────────────────────
# Auto-inject user_permissions ke SEMUA template secara aman.
# Jika token tidak ada / DB error → return [] sehingga aplikasi tidak crash.
@app.context_processor
def inject_user_permissions():
    try:
        token = request.cookies.get("token")
        if not token:
            return dict(user_permissions=[])
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = data.get("sub")
        if not username:
            return dict(user_permissions=[])
        permissions = get_user_permissions(username)
        return dict(user_permissions=permissions)
    except Exception:
        return dict(user_permissions=[])

#titip TOTP Ceisa
@app.route("/bc/otp", methods=["GET"])
def bc_get_otp():
    from config.bc_otp import BC_OTP_SECRET
    import pyotp, time

    try:
        otp = pyotp.TOTP(BC_OTP_SECRET)
        kode_otp = otp.now()
        sisa_waktu = otp.interval - (int(time.time()) % otp.interval)

        return {
            "otp": kode_otp,
            "expires_in": sisa_waktu
        }

    except Exception as e:
        return {"error": str(e)}, 500


# Route untuk get user online count
@app.route('/api/user-count', methods=['GET'])
def api_user_count():
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM [dbo].[users] WHERE LEN([Log]) = 20")
            count = cursor.fetchone()[0]
        return {"count_userlogin": count}
    except Exception:
        return {"count_userlogin": 0}

@app.route('/userlogin', methods=['POST'])
def userlogin():
    try:
        username = request.json.get('username')
        with get_db_cursor() as cursor:
            query = "SELECT COUNT(*) FROM [dbo].[users] WHERE username=%s AND LEN([Log]) = 20"
            cursor.execute(query, (username,))
            user_countlogin = cursor.fetchone()[0]
        return {'count_userlogin': user_countlogin}
    except Exception:
        return {'count_userlogin': 0}

# Konfigurasi Logging Terpusat (server.log & dedicated error.log)
from config.logger import log_exception, root_logger, ERROR_LOG_FILE
from werkzeug.exceptions import HTTPException

# Tangkap SEMUA Error yang tidak tertangani (Traceback Lengkap ke error.log)
@app.errorhandler(Exception)
def handle_exception(e):
    # Biarkan HTTP exception standar (404, 403, 401, dll) ditangani dengan status code aslinya
    if isinstance(e, HTTPException):
        return e
    # Log error server yang sebenarnya (500) dengan detail context ke error.log
    log_exception(e, context="Uncaught Server Exception (500)", req=request)
    return {"error": "Internal Server Error"}, 500

if not app.debug:
    # Matikan log default Flask/Werkzeug agar tidak dobel
    logging.getLogger('werkzeug').setLevel(logging.ERROR)

def _run_backup_scheduler():
    import schedule
    import threading
    from scripts.backup_db import perform_backup

    def do_scheduled_backup():
        perform_backup(target_dir="D:\\", database="tct_inventory", notify_telegram=True, user_trigger="Auto Scheduler (Flask 12:00 / 17:00)")

    schedule.every().day.at("12:00").do(do_scheduled_backup)
    schedule.every().day.at("17:00").do(do_scheduled_backup)
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(10)
        except Exception:
            time.sleep(30)

def start_server():
    # Simpan PID ke file untuk remote restart
    with open("server.pid", "w") as f:
        f.write(str(os.getpid()))

    # Start auto backup scheduler in background daemon thread
    import threading
    scheduler_thread = threading.Thread(target=_run_backup_scheduler, daemon=True)
    scheduler_thread.start()

    # Start non-blocking multi-source license synchronization in background
    from config.license import start_license_background_worker
    start_license_background_worker(interval_seconds=3600)

    app.logger.info("Starting Flask Server...")
    app.logger.info("Request Logging Active - Monitoring GET/POST requests")
    print("Starting Flask Server with Waitress...")
    print("=" * 50)
    
    # Jalankan server dengan Waitress multi-threaded yang cepat dan non-blocking
    serve(app, host="0.0.0.0", port=80, threads=32, connection_limit=300, channel_timeout=30)

if __name__ == "__main__":
    start_server()