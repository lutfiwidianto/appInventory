import os
import sys
import glob
import shutil
from datetime import datetime
from flask import Blueprint, render_template, request, jsonify, redirect
import jwt
from config.secretKey import SECRET_KEY
from scripts.backup_db import perform_backup, LOG_FILE

backup_db_bp = Blueprint("backup_db_bp", __name__)
backup_db_bp.secret_key = SECRET_KEY

def get_disk_usage(drive="D:\\"):
    try:
        total, used, free = shutil.disk_usage(drive)
        return {
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2),
            "percent_used": round((used / total) * 100, 1)
        }
    except Exception as e:
        return {
            "total_gb": 0, "used_gb": 0, "free_gb": 0, "percent_used": 0, "error": str(e)
        }

def scan_backup_files(target_dir="D:\\"):
    files_data = []
    try:
        search_pattern = os.path.join(target_dir, "DB APPINVENTORY*.bak")
        found_files = glob.glob(search_pattern)
        
        for file_path in found_files:
            try:
                stat = os.stat(file_path)
                filename = os.path.basename(file_path)
                size_mb = round(stat.st_size / (1024 * 1024), 2)
                mtime = datetime.fromtimestamp(stat.st_mtime)
                created_str = mtime.strftime("%d-%m-%Y %H:%M:%S")
                
                files_data.append({
                    "filename": filename,
                    "path": file_path,
                    "size_mb": size_mb,
                    "timestamp": stat.st_mtime,
                    "created_at": created_str
                })
            except Exception:
                continue
                
        # Urutkan dari yang terbaru ke terlama
        files_data.sort(key=lambda x: x["timestamp"], reverse=True)
    except Exception as e:
        print(f"[ERROR] scan_backup_files error: {e}")
        
    return files_data

@backup_db_bp.route("/backup_db", methods=["GET"])
def backup_page():
    token = request.cookies.get("token")
    if not token:
        return redirect("/login")
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = data.get("sub")
        level_user = data.get("level_user")
        nama_lengkap = data.get("nama_lengkap")
    except Exception:
        return redirect("/login")

    return render_template(
        "controlpagehtml/backup_db.html",
        menu="settings",
        submenu="backupdb",
        username=username,
        level_user=level_user,
        namalengkap=nama_lengkap,
        titlePage="Backup Database"
    )

@backup_db_bp.route("/api/backup/status", methods=["GET"])
def get_backup_status():
    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return jsonify({"error": "Invalid Token"}), 401

    disk_info = get_disk_usage("D:\\")
    backup_files = scan_backup_files("D:\\")
    
    total_size_mb = round(sum(f["size_mb"] for f in backup_files), 2)
    last_backup = backup_files[0] if backup_files else None

    return jsonify({
        "target_dir": "D:\\",
        "schedule": "12:00 WIB & 17:00 WIB Setiap Hari",
        "disk": disk_info,
        "total_files": len(backup_files),
        "total_size_mb": total_size_mb,
        "last_backup": last_backup,
        "files": backup_files
    })

@backup_db_bp.route("/api/backup/trigger", methods=["POST"])
def trigger_backup():
    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = data.get("sub", "User")
        nama_lengkap = data.get("nama_lengkap", username)
    except Exception:
        return jsonify({"error": "Invalid Token"}), 401

    success, msg, file_path, size_mb = perform_backup(
        target_dir="D:\\",
        database="tct_inventory",
        notify_telegram=True,
        user_trigger=f"Web ({nama_lengkap})"
    )

    if success:
        return jsonify({
            "success": True,
            "message": msg,
            "file": os.path.basename(file_path) if file_path else "",
            "size_mb": size_mb
        })
    else:
        return jsonify({
            "success": False,
            "message": msg
        }), 500

@backup_db_bp.route("/api/backup/logs", methods=["GET"])
def get_backup_logs():
    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return jsonify({"error": "Invalid Token"}), 401

    if not os.path.exists(LOG_FILE):
        return jsonify({"logs": "Log backup belum tersedia."})

    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
            logs = "".join(lines[-100:])
        return jsonify({"logs": logs})
    except Exception as e:
        return jsonify({"logs": f"Gagal membaca log: {str(e)}"}), 500

@backup_db_bp.route("/api/backup/delete", methods=["POST"])
def delete_backup_file():
    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        level_user = data.get("level_user")
        if str(level_user) != "1":
            return jsonify({"error": "Hanya Admin Level 1 (lutfi) yang berhak menghapus file backup!"}), 403
    except Exception:
        return jsonify({"error": "Invalid Token"}), 401

    payload = request.get_json() or {}
    filename = str(payload.get("filename", "")).strip()

    # Validasi nama file agar aman dari path traversal
    if not filename.startswith("DB APPINVENTORY") or not filename.endswith(".bak") or "/" in filename or "\\" in filename or ".." in filename:
        return jsonify({"error": "Nama file tidak valid atau dilarang."}), 400

    full_path = os.path.join("D:\\", filename)
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
            return jsonify({"success": True, "message": f"File {filename} berhasil dihapus."})
        except Exception as e:
            return jsonify({"error": f"Gagal menghapus file: {str(e)}"}), 500
    else:
        return jsonify({"error": "File tidak ditemukan di D:\\"}), 404
