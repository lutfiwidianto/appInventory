from flask import Flask, Response, request, send_from_directory
import logging
from datetime import datetime

# Import blueprint dan konfigurasi
from app.auth import auth_bp
from app.general import gen_bp
from app.helper import helper_bp
from app.users import users_bp
from app.permintaanit import permintIt_bp
from app.peminjamanbarang import peminjamanBarang_bp
from config.ipaddress import get_local_ip
from config.secretKey import SECRET_KEY
from config.database import create_connection
from app.pmc_nomor_surat import pmc_nomorsurat_bp
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

# Buat Flask app
app = Flask(__name__)
app.secret_key = SECRET_KEY

# ✅ SIMPLE REQUEST LOGGING MIDDLEWARE
@app.before_request
def log_request():
    ignore_paths = ("/static/", "/js/", "/favicon.ico", ".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".map", ".woff", ".woff2", ".ttf")
    path = request.path.lower()
    if any(path.startswith(p) or path.endswith(p) for p in ignore_paths):
        return
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {request.remote_addr} {request.method} {request.path}")

# Registrasi route untuk static files
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

# OTP logic simplified for dev
@app.route("/bc/otp", methods=["GET"])
def bc_get_otp():
    from config.bc_otp import BC_OTP_SECRET
    import pyotp, time
    try:
        otp = pyotp.TOTP(BC_OTP_SECRET)
        return {"otp": otp.now(), "expires_in": otp.interval - (int(time.time()) % otp.interval)}
    except Exception as e:
        return {"error": str(e)}, 500

from config.database import get_db_cursor

@app.route('/userlogin', methods=['POST'])
def userlogin():
    username = request.json['username']
    with get_db_cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Karya_Sutarindo.dbo.users WHERE username=%s AND LEN([Log]) = 20", (username,))
        user_countlogin = cursor.fetchone()[0]
    return {'count_userlogin': user_countlogin}

if __name__ == "__main__":
    print("Starting Flask Dev Server with Auto-Reload...")
    print("Code changes will automatically restart the server.")
    print("=" * 50)
    # Run server in debug mode (development)
    app.run(debug=True, host="0.0.0.0", port=80)
