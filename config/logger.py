import os
import sys
import logging
from logging.handlers import RotatingFileHandler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_LOG_FILE = os.path.join(BASE_DIR, "server.log")
ERROR_LOG_FILE = os.path.join(BASE_DIR, "error.log")

# Formatters
DETAILED_FORMAT = "[%(asctime)s] %(levelname)s di %(module)s [%(pathname)s:%(lineno)d]:\n%(message)s\n"
formatter = logging.Formatter(DETAILED_FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

# Server Handler (INFO and above)
server_handler = RotatingFileHandler(SERVER_LOG_FILE, maxBytes=5*1024*1024, backupCount=5, encoding="utf-8")
server_handler.setFormatter(formatter)
server_handler.setLevel(logging.INFO)

# Error Handler (DEDICATED ERROR LOG - ERROR and CRITICAL only)
error_handler = RotatingFileHandler(ERROR_LOG_FILE, maxBytes=5*1024*1024, backupCount=5, encoding="utf-8")
error_handler.setFormatter(formatter)
error_handler.setLevel(logging.ERROR)

# Setup root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
# Clear existing handlers to prevent duplicates
root_logger.handlers.clear()
root_logger.addHandler(server_handler)
root_logger.addHandler(error_handler)

# Dedicated Error Logger
error_logger = logging.getLogger("app_error")
error_logger.setLevel(logging.ERROR)

def log_exception(e, context="Application Error", req=None):
    """
    Mencatat exception/error lengkap ke error.log dengan detail request jika ada.
    """
    msg_parts = [f"=== ERROR OCCURRED: {context} ==="]
    if req:
        try:
            msg_parts.append(f"Request: {req.method} {req.url}")
            msg_parts.append(f"IP: {req.remote_addr}")
            token = req.cookies.get("token")
            if token:
                import jwt
                from config.secretKey import SECRET_KEY
                try:
                    tok_data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                    msg_parts.append(f"User: {tok_data.get('sub')} ({tok_data.get('nama_lengkap')})")
                except:
                    pass
            if req.is_json and req.get_json(silent=True):
                msg_parts.append(f"JSON Body: {req.get_json(silent=True)}")
            elif req.form:
                msg_parts.append(f"Form Data: {dict(req.form)}")
        except Exception:
            pass
    msg_parts.append(f"Exception Type: {type(e).__name__}")
    msg_parts.append(f"Exception Message: {str(e)}")
    
    full_message = "\n".join(msg_parts)
    error_logger.error(full_message, exc_info=True)
