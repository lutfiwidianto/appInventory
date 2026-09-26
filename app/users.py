from flask import Flask, request, redirect, render_template, flash, jsonify, Blueprint
import jwt, datetime, hashlib
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from app.utils import check_permission, get_user_permissions
import random
import string

users_bp = Blueprint("users_bp", __name__)
users_bp.secret_key = SECRET_KEY

@users_bp.route("/users")
@check_permission("USER_CRUD")
def get_users():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, users_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = "SELECT [User_ID], Nama, Username, Password, Level_User, Email FROM dbo.users"
                cursor.execute(query)
                users = cursor.fetchall()
            return render_template("controlpagehtml/users.html", username=data["sub"], level_user=data["level_user"], users=users, menu='settings', submenu='users', titlePage='Users')
        except Exception:
            return redirect("/login")
    return redirect("/login")

@users_bp.route("/register", methods=["GET", "POST"])
@check_permission("USER_CRUD")
def register():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, users_bp.secret_key, algorithms="HS256")
            if request.method == "POST":
                nama = request.form["inputNama"]
                username = request.form["username"]
                password = hashlib.md5(request.form["password"].encode()).hexdigest()
                level_user = request.form["level_user"]
                email = request.form["email"]

                with get_db_cursor() as cursor:
                    query_check = "SELECT COUNT(*) FROM dbo.users WHERE username=%s"
                    cursor.execute(query_check, (username,))
                    if cursor.fetchone()[0] == 0:
                        # Auto-assign Role_ID matching level_user for legacy compatibility
                        query_insert = "INSERT INTO dbo.users (Nama, username, [Password], Level_User, Role_ID, Email) VALUES (%s, %s, %s, %s, %s, %s)"
                        cursor.execute(query_insert, (nama, username, password, level_user, level_user, email))
                        return redirect("/users")
                    else:
                        return "Username sudah ada, silahkan gunakan username lain."

            return render_template("controlpagehtml/users_register.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], titlePage='Users')
        except Exception:
            return redirect("/login")
    return redirect("/login")

@users_bp.route("/edit_user/<user_id>", methods=["GET", "POST"])
@check_permission("USER_CRUD")
def edit_user(user_id):
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, users_bp.secret_key, algorithms="HS256")
            if request.method == "GET":
                with get_db_cursor() as cursor:
                    query = "SELECT [User_ID], Nama, Username, [Password], Level_User, Email FROM dbo.users WHERE User_ID=%s"
                    cursor.execute(query, (user_id,))
                    user = cursor.fetchone()
                return render_template("controlpagehtml/users_edit.html", user=user, username=data["sub"], level_user=data["level_user"], titlePage='Users')

            if request.method == "POST":
                nama = request.form["inputNama"]
                username = request.form["username"]
                password = hashlib.md5(request.form["password"].encode()).hexdigest()
                level_user = request.form["level_user"]
                email = request.form["email"]

                with get_db_cursor() as cursor:
                    query = "UPDATE dbo.users SET Nama=%s, username=%s, [Password]=%s, Level_User=%s, Role_ID=%s, Email=%s WHERE User_ID=%s"
                    cursor.execute(query, (nama, username, password, level_user, level_user, email, user_id))
                return redirect("/users")
        except Exception:
            return redirect("/login")
    return redirect("/login")

@users_bp.route("/delete_user/<int:user_id>", methods=["POST"])
@check_permission("USER_CRUD")
def delete_user(user_id):
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, users_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("DELETE FROM dbo.users WHERE User_ID=%s", (user_id,))
                flash("Data berhasil dihapus!")
            return redirect("/users")
        except Exception:
            return redirect("/login")
    return redirect("/login")

@users_bp.route("/roles", methods=["GET", "POST"])
@check_permission("ROLE_MANAGE")
def get_roles():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, users_bp.secret_key, algorithms=["HS256"])
            with get_db_cursor() as cursor:
                if request.method == "POST":
                    action = request.form.get("action")
                    if action == "add":
                        role_name = request.form.get("role_name")
                        description = request.form.get("description")
                        cursor.execute("INSERT INTO dbo.roles (Role_Name, Description) VALUES (%s, %s)", (role_name, description))
                        flash("Role berhasil ditambahkan!")
                    elif action == "delete":
                        role_id = request.form.get("role_id")
                        cursor.execute("DELETE FROM dbo.roles WHERE Role_ID = %s", (role_id,))
                        flash("Role berhasil dihapus!")
                    elif action == "assign":
                        user_id = request.form.get("user_id")
                        role_id = request.form.get("role_id")
                        cursor.execute("UPDATE dbo.users SET Role_ID = %s, Level_User = %s WHERE User_ID = %s", (role_id, role_id, user_id))
                        flash("Peran pengguna berhasil diperbarui!")
                    return redirect("/roles")
                
                cursor.execute("SELECT Role_ID, Role_Name, Description FROM dbo.roles ORDER BY Role_ID ASC")
                roles = cursor.fetchall()
                
                cursor.execute("SELECT User_ID, Nama, Username, Level_User, Role_ID FROM dbo.users ORDER BY Nama ASC")
                users = cursor.fetchall()
                
            return render_template("controlpagehtml/users_roles.html", username=data["sub"], level_user=data["level_user"], roles=roles, users=users, menu='settings', submenu='usersrole', titlePage='Users Role')
        except Exception as e:
            print(f"Error in /roles: {e}")
            return redirect("/login")
    return redirect("/login")

@users_bp.route("/permissions", methods=["GET", "POST"])
@check_permission("ROLE_MANAGE")
def get_permissions():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, users_bp.secret_key, algorithms=["HS256"])
            with get_db_cursor() as cursor:
                if request.method == "POST":
                    role_id = request.form.get("role_id")
                    selected_perms = request.form.getlist("permissions")
                    
                    cursor.execute("DELETE FROM dbo.role_permissions WHERE Role_ID = %s", (role_id,))
                    for perm_id in selected_perms:
                        cursor.execute("INSERT INTO dbo.role_permissions (Role_ID, Permission_ID) VALUES (%s, %s)", (role_id, perm_id))
                    
                    flash("Izin Akses peran berhasil diperbarui!")
                    return redirect("/permissions")
                
                cursor.execute("SELECT Role_ID, Role_Name FROM dbo.roles ORDER BY Role_ID ASC")
                roles = cursor.fetchall()
                
                cursor.execute("SELECT Permission_ID, Permission_Code, Permission_Name, Module FROM dbo.permissions ORDER BY Module, Permission_Name ASC")
                permissions = cursor.fetchall()
                
                cursor.execute("SELECT Role_ID, Permission_ID FROM dbo.role_permissions")
                mappings = cursor.fetchall()
                role_perms = {}
                for r_id, p_id in mappings:
                    if r_id not in role_perms:
                        role_perms[r_id] = set()
                    role_perms[r_id].add(p_id)
                
            return render_template("controlpagehtml/access_permissions.html", username=data["sub"], level_user=data["level_user"], roles=roles, permissions=permissions, role_perms=role_perms, menu='settings', submenu='usersaccess', titlePage='Access Permission')
        except Exception as e:
            print(f"Error in /permissions: {e}")
            return redirect("/login")
    return redirect("/login")


@users_bp.route('/log-user', methods=['POST'])
def log_user():
    token = request.cookies.get("token")
    if token:
        try:
            username = request.json['username']
            with get_db_cursor() as cursor:
                query = "SELECT Log FROM dbo.users WHERE username=%s"
                cursor.execute(query, (username,))
                result = cursor.fetchone()
                return {'cek_log': result[0] if result else ""}
        except Exception:
            return jsonify({"error": "Error"}), 500
    return jsonify({"error": "Unauthorized"}), 401

@users_bp.route('/user-list', methods=['GET'])
def user_list():
    try:
        with get_db_cursor() as cursor:
            query = "SELECT User_ID, Nama, Username FROM dbo.users WHERE LEN([Log]) = 20"
            cursor.execute(query)
            users = cursor.fetchall()
            
        data = []
        for user in users:
            data.append({
                'userid': user[0],
                'nama': user[1].strip(),
                'username': user[2].strip(),
                'status': '<a class="text-success">Online</a>'
            })
        return jsonify(data)
    except Exception:
        return jsonify([]), 500

@users_bp.route('/reset-login', methods=['POST'])
def reset_login():
    user_id = request.form.get('user_id')
    username = request.form.get('username')
    
    if request.is_json:
        data = request.get_json() or {}
        user_id = user_id or data.get('user_id')
        username = username or data.get('username')

    # Security verification:
    # 1. Check if caller has an active Admin / USER_CRUD session (e.g. from Dashboard or User Management)
    is_admin = False
    token = request.cookies.get("token")
    if token:
        try:
            payload = jwt.decode(token, users_bp.secret_key, algorithms=["HS256"])
            sub = str(payload.get("sub", "")).strip().lower()
            user_level = str(payload.get("level_user", ""))
            if sub == "lutfi" or user_level == "1" or "USER_CRUD" in get_user_permissions(sub):
                is_admin = True
        except Exception:
            pass

    # 2. If not authenticated as Admin, only allow resetting the username "lutfi" (self-reset on login screen)
    if not is_admin:
        target_username = ""
        if username:
            target_username = str(username).strip().lower()
        elif user_id:
            try:
                with get_db_cursor() as cursor:
                    cursor.execute("SELECT Username FROM dbo.users WHERE [User_ID] = %s", (user_id,))
                    row = cursor.fetchone()
                    if row:
                        target_username = str(row[0]).strip().lower()
            except Exception:
                pass

        if target_username != "lutfi":
            return jsonify({
                'status': 'error',
                'message': 'Hanya Administrator (Lutfi) yang berwenang mereset akun ini.'
            }), 403

    random_19 = ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=19))
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute("UPDATE [dbo].[users] SET [Log] = %s WHERE [User_ID] = %s", (random_19, user_id,))
        elif username:
            cursor.execute("UPDATE [dbo].[users] SET [Log] = %s WHERE [Username] = %s", (random_19, username,))
    return jsonify({'status': 'success', 'message': 'Berhasil Reset Login'})
