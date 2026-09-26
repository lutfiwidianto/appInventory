from flask import Flask, request, redirect, render_template, Blueprint, Response, make_response, session
import jwt, datetime, pymssql, hashlib
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
import random
import string

helper_bp = Blueprint("helper_bp",__name__)

# Secret key untuk menandatangani token JWT
helper_bp.secret_key = SECRET_KEY

# Generate random string with length of 20
def get_random_string(length=20):
    return ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=length))

def logout():
    # Connect to the database
    with get_db_cursor() as cursor:
        # Get the user information from the token
        token_cookie = request.cookies.get("token")
        if not token_cookie:
            return redirect("/login")

        try:
            token = token_cookie.encode('utf-8')
            data = jwt.decode(token, helper_bp.secret_key, algorithms="HS256")
            username = data["sub"]

            # Update the login count for the user
            random_19 = get_random_string(19)
            cursor.execute("UPDATE [dbo].[users] SET [Log] = %s WHERE [Username] = %s", (random_19, username,))
            # cursor.connection.commit() # get_db_cursor uses autocommit=True
            
            cursor.execute("SELECT COUNT(*) FROM [dbo].[users] WHERE LEN([Log]) = 20")
            user_countlogin = cursor.fetchone()[0]
            print("Jumlah user yang sedang login:", user_countlogin)
        except Exception as e:
            print(f"Error during logout: {e}")

    response = redirect("/login")
    response.delete_cookie("token")
    return response

def logstatus():
    # Get the user information from the token
    token = request.cookies.get("token")
    if not token:
        return ""
        
    try:
        data = jwt.decode(token, helper_bp.secret_key, algorithms="HS256")
        username = data["sub"]

        with get_db_cursor() as cursor:
            query1 = "SELECT Log FROM dbo.users WHERE username=%s"
            cursor.execute(query1, (username,))
            result = cursor.fetchone()
            log = result[0] if result else ""
            return log
    except Exception:
        return ""

@helper_bp.route("/helpers")
def get_helpers():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, helper_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/helpers.html",username=data["sub"], level_user=data["level_user"], menu='settings', submenu='helpers', titlePage='Helpers')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
