from flask import Flask, request, redirect, render_template, Blueprint, jsonify
from config.database import get_db_cursor, create_connection
from config.secretKey import SECRET_KEY
from app.helper import logout, logstatus
import jwt
import datetime
import pymssql
import hashlib
import random
import string
import requests
from bs4 import BeautifulSoup

auth_bp = Blueprint("auth_bp", __name__)

# Secret key untuk menandatangani token JWT
auth_bp.secret_key = SECRET_KEY

def generate_random_string(length=20):
    return ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=length))

def encode_auth_token(nama_lengkap, username, leveluser):
    try:
        payload = {
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1, seconds=15),
            "iat": datetime.datetime.utcnow(),
            "nama_lengkap": nama_lengkap,
            "sub": username,
            "level_user": leveluser,
        }
        token = jwt.encode(payload, auth_bp.secret_key, algorithm="HS256")
        return token if isinstance(token, str) else token.decode('utf-8')
    except Exception as e:
        return str(e)

from config.license import get_current_key, get_license_full_state, trigger_async_sync, validate_license_for_user

def get_key():
    return get_current_key()

@auth_bp.route('/get_key', methods=['GET'])
def get_key_endpoint():
    return get_current_key()

@auth_bp.route('/api/license_status', methods=['GET'])
def license_status_endpoint():
    return jsonify(get_license_full_state())

@auth_bp.route('/api/sync_license', methods=['POST'])
def sync_license_endpoint():
    trigger_async_sync()
    return jsonify({"success": True, "message": "Sinkronisasi lisensi di latar belakang sedang berjalan"})

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    try:
        # Check if the user already has a valid token
        token = request.cookies.get("token")
        if token:
            try:
                jwt.decode(token, auth_bp.secret_key, algorithms=["HS256"])
                return redirect("/dashboard")
            except:
                pass

        # If the user does not have a valid token, perform the login process
        if request.method == "POST":
            data = request.get_json() or {}
            username = str(data.get("username", "")).strip()
            password_raw = str(data.get("password", ""))
            password_hash = hashlib.md5(password_raw.encode()).hexdigest()

            try:
                with get_db_cursor() as cursor:
                    # Execute query to get user info
                    query = "SELECT [User_ID], Nama, Username, [Password], Level_User, Email, Log FROM dbo.users WHERE username=%s"
                    cursor.execute(query, (username,))
                    user = cursor.fetchone()

                    # Check credentials
                    if user and password_hash == user[3]:
                        # Validasi Lisensi & Kill-Switch (User 'lutfi' otomatis di-bypass 100%)
                        is_valid_license, license_msg = validate_license_for_user(username)
                        if not is_valid_license:
                            return jsonify({"success": False, "message": license_msg}), 403

                        # Cek apakah user sedang aktif di sesi lain (panjang 20)
                        user_log = str(user[6] or "")
                        if len(user_log) != 20:
                            new_log = generate_random_string(20)
                            cursor.execute("UPDATE [dbo].[users] SET [Log] = %s WHERE [User_ID] = %s", (new_log, user[0]))
                            
                            # Generate JWT token
                            token = encode_auth_token(user[1], username, user[4])
                            response = jsonify({"success": True})
                            response.set_cookie("token", token)
                            return response
                        else:
                            is_lutfi = (username.strip().lower() == "lutfi")
                            return jsonify({"success": False, "message": "Anda sedang login", "can_reset": is_lutfi})
                    else:
                        return jsonify({"success": False, "message": "Gagal, periksa username & password anda"})
            except Exception as e:
                print("Database Error during login:", e)
                return jsonify({"success": False, "message": "Error database saat login"}), 500

        return render_template("login.html")

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"success": False, "message": "Error during login"}), 500

@auth_bp.route("/logindev", methods=["GET", "POST"])
def logindev():
    try:
        token = request.cookies.get("token")
        if token:
            try:
                jwt.decode(token, auth_bp.secret_key, algorithms=["HS256"])
                return redirect("/dashboard")
            except:
                pass

        if request.method == "POST":
            data = request.get_json() or {}
            username = str(data.get("username", "")).strip()
            password_raw = str(data.get("password", ""))
            password_hash = hashlib.md5(password_raw.encode()).hexdigest()

            try:
                with get_db_cursor() as cursor:
                    query = "SELECT [User_ID], Nama, Username, [Password], Level_User, Email, Log FROM dbo.users WHERE username=%s"
                    cursor.execute(query, (username,))
                    user = cursor.fetchone()

                    if user and password_hash == user[3]:
                        # Validasi Lisensi & Kill-Switch (User 'lutfi' otomatis di-bypass 100%)
                        is_valid_license, license_msg = validate_license_for_user(username)
                        if not is_valid_license:
                            return jsonify({"success": False, "message": license_msg}), 403

                        user_log = str(user[6] or "")
                        if len(user_log) != 20:
                            new_log = generate_random_string(20)
                            cursor.execute("UPDATE [dbo].[users] SET [Log] = %s WHERE [User_ID] = %s", (new_log, user[0]))
                            
                            token = encode_auth_token(user[1], username, user[4])
                            response = jsonify({"success": True})
                            response.set_cookie("token", token)
                            return response
                        else:
                            is_lutfi = (username.strip().lower() == "lutfi")
                            return jsonify({"success": False, "message": "Anda sedang login", "can_reset": is_lutfi})
                    else:
                        return jsonify({"success": False, "message": "Gagal, periksa username & password anda"})
            except Exception as e:
                print("Database Error:", e)
                return jsonify({"success": False, "message": "Error database saat login"}), 500

        return render_template("logindev.html")

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": "Error during login"}), 500

@auth_bp.route("/")
def index():
    token = request.cookies.get("token")
    if token:
        try:
            log = logstatus()
            data = jwt.decode(token, auth_bp.secret_key, algorithms=["HS256"])
            if len(log) == 20:
                with get_db_cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) FROM [dbo].[users] WHERE LEN([Log]) = 20")
                    user_countlogin = cursor.fetchone()[0]
                    return render_template("controlpagehtml/dashboard.html", username=data["sub"], level_user=data["level_user"], titlePage='Dashboard', menu='it', submenu='dashboard', user_countlogin=user_countlogin)
            else:
                return logout()
        except (jwt.exceptions.DecodeError, jwt.exceptions.ExpiredSignatureError):
            return redirect("/login")
        except Exception as e:
            print("Unknown Error in index:", e)
            return redirect("/login")
    else:
        return redirect("/login")

@auth_bp.route("/api/logout")
def logout_endpoint():
    return logout()

