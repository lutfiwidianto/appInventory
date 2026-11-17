from flask import Blueprint, render_template, request, jsonify, redirect
import jwt
from config.secretKey import SECRET_KEY
from config.license import (
    get_license_full_state,
    update_license_settings,
    perform_sync
)

license_admin_bp = Blueprint("license_admin_bp", __name__)
license_admin_bp.secret_key = SECRET_KEY

def _get_authenticated_lutfi_user():
    """
    Helper untuk memvalidasi token JWT dan memastikan HANYA user 'lutfi' yang diizinkan.
    Mengembalikan data token jika valid, atau None jika tidak berhak.
    """
    token = request.cookies.get("token")
    if not token:
        return None
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = str(data.get("sub", "")).strip().lower()
        if username == "lutfi":
            return data
        return None
    except Exception:
        return None

@license_admin_bp.route("/license_settings", methods=["GET"])
def license_settings_page():
    auth_data = _get_authenticated_lutfi_user()
    if not auth_data:
        # Jika belum login, arahkan ke login
        token = request.cookies.get("token")
        if not token:
            return redirect("/login")
        # Jika login tapi bukan lutfi, tolak akses
        return "<h3>403 Forbidden: Akses menu ini hanya diperuntukkan bagi Master Admin (lutfi).</h3>", 403

    username = auth_data.get("sub")
    level_user = auth_data.get("level_user")
    nama_lengkap = auth_data.get("nama_lengkap", username)

    return render_template(
        "controlpagehtml/license_settings.html",
        menu="settings",
        submenu="license_settings",
        username=username,
        level_user=level_user,
        namalengkap=nama_lengkap,
        titlePage="License & Security Settings"
    )

@license_admin_bp.route("/api/license/state", methods=["GET"])
def api_get_license_state():
    auth_data = _get_authenticated_lutfi_user()
    if not auth_data:
        return jsonify({"error": "Unauthorized: Hanya user lutfi yang berhak mengakses data lisensi."}), 403

    state = get_license_full_state()
    return jsonify(state)

@license_admin_bp.route("/api/license/update", methods=["POST"])
def api_update_license():
    auth_data = _get_authenticated_lutfi_user()
    if not auth_data:
        return jsonify({"error": "Unauthorized: Hanya user lutfi yang berhak mengubah pengaturan lisensi."}), 403

    payload = request.get_json() or {}
    
    # Validasi dan sanitasi input
    new_settings = {
        "enabled": bool(payload.get("enabled", True)),
        "github_raw_url": str(payload.get("github_raw_url", "")).strip(),
        "expected_key": str(payload.get("expected_key", "")).strip(),
        "expire_enabled": bool(payload.get("expire_enabled", False)),
        "expire_date": str(payload.get("expire_date", "")).strip(),
        "custom_error_message": str(payload.get("custom_error_message", "")).strip(),
        "strict_mode": bool(payload.get("strict_mode", True))
    }

    if not new_settings["github_raw_url"]:
        return jsonify({"success": False, "error": "GitHub Raw URL tidak boleh kosong!"}), 400

    if not new_settings["expected_key"]:
        return jsonify({"success": False, "error": "Expected Key tidak boleh kosong!"}), 400

    success = update_license_settings(new_settings)
    if success:
        return jsonify({
            "success": True,
            "message": "Pengaturan lisensi berhasil disimpan & diperbarui.",
            "state": get_license_full_state()
        })
    else:
        return jsonify({"success": False, "error": "Gagal menyimpan file konfigurasi."}), 500

@license_admin_bp.route("/api/license/sync_now", methods=["POST"])
def api_sync_now():
    auth_data = _get_authenticated_lutfi_user()
    if not auth_data:
        return jsonify({"error": "Unauthorized: Hanya user lutfi yang berhak memicu sinkronisasi."}), 403

    success, key, source = perform_sync()
    state = get_license_full_state()

    return jsonify({
        "success": success,
        "message": f"Sinkronisasi selesai. Key terbaca: '{key}' (Sumber: {source})",
        "state": state
    })
