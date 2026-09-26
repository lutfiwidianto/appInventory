from flask import Flask, request, redirect, render_template, Blueprint, session, jsonify
import jwt
from config.secretKey import SECRET_KEY
from config.database import get_db_cursor
from app.helper import logout, logstatus

gen_bp = Blueprint("gen_bp", __name__)
gen_bp.secret_key = SECRET_KEY

@gen_bp.route('/set-theme', methods=['POST'])
def set_theme():
    token = request.cookies.get("token")
    if token:
        try:
            theme = request.form['theme']
            session['theme'] = theme
            return jsonify({'status': 'success'})
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@gen_bp.route("/dashboard")
def dashboard():
    token = request.cookies.get("token")
    if token:
        try:
            log = logstatus()
            data = jwt.decode(token, gen_bp.secret_key, algorithms="HS256")
            if len(log) == 20:
                # Gunakan context manager agar koneksi selalu ditutup (Cegah Hang)
                with get_db_cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) FROM [dbo].[users] WHERE LEN([Log]) = 20")
                    user_countlogin = cursor.fetchone()[0]
                
                return render_template("controlpagehtml/dashboard.html", username=data["sub"], level_user=data["level_user"], titlePage='Dashboard', menu='it', submenu='dashboard', user_countlogin=user_countlogin)
            else:
                return logout()
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@gen_bp.route("/kontak")
def kontak():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, gen_bp.secret_key, algorithms="HS256")
            return render_template("kontak.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
