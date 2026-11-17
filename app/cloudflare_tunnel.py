from flask import Blueprint, render_template, request, jsonify, redirect
import subprocess
import os
import json
import threading
import time
import re
import jwt
import base64
import urllib.request
from config.secretKey import SECRET_KEY

cloudflare_tunnel_bp = Blueprint('cloudflare_tunnel_bp', __name__)

CONFIG_FILE = 'config/cloudflare_settings.json'
RUNTIME_FILE = 'config/cloudflare_runtime.json'
TUNNEL_PROCESS = None
TUNNEL_URL = None
TUNNEL_LOG = []
CLOUDFLARED_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'bin', 'cloudflared.exe')

# ─────────────────────────────────────────────
# Helper: runtime info & config
# ─────────────────────────────────────────────
def get_runtime_info():
    if os.path.exists(RUNTIME_FILE):
        try:
            with open(RUNTIME_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_runtime_info(info):
    try:
        with open(RUNTIME_FILE, 'w') as f:
            json.dump(info, f, indent=4)
    except Exception:
        pass

def clear_runtime_info():
    if os.path.exists(RUNTIME_FILE):
        try:
            os.remove(RUNTIME_FILE)
        except Exception:
            pass

def is_cloudflared_running():
    global TUNNEL_PROCESS, TUNNEL_URL
    if TUNNEL_PROCESS is not None and TUNNEL_PROCESS.poll() is None:
        return True
    
    # Check runtime file for cross-process detection (Flask vs Telegram Bot)
    runtime = get_runtime_info()
    pid = runtime.get('pid')
    if pid:
        try:
            import psutil
            if psutil.pid_exists(pid):
                proc = psutil.Process(pid)
                if 'cloudflared' in (proc.name() or '').lower():
                    if not TUNNEL_URL and runtime.get('url'):
                        TUNNEL_URL = runtime.get('url')
                    return True
        except Exception:
            pass
        clear_runtime_info()
    return False

def is_cloudflared_installed():
    return os.path.exists(CLOUDFLARED_PATH)

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"mode": "quick", "token": "", "custom_domain": "", "api_key": ""}

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=4)

# ─────────────────────────────────────────────
# Helper: decode connector token to get tunnel info
# ─────────────────────────────────────────────
def decode_connector_token(token_str):
    """Decode the cloudflared connector token (base64 JSON) to extract account_id and tunnel_id."""
    try:
        padded = token_str + '=' * (-len(token_str) % 4)
        decoded = base64.b64decode(padded).decode('utf-8')
        data = json.loads(decoded)
        return data.get('a'), data.get('t')  # account_id, tunnel_id
    except Exception:
        return None, None

def fetch_tunnel_url_from_api(account_id, tunnel_id, api_key):
    """
    Call Cloudflare API to get the public hostname configured for this tunnel.
    Requires a Cloudflare API Key with read permissions.
    """
    try:
        api_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations"
        req = urllib.request.Request(
            api_url,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if result.get('success'):
            ingress = result.get('result', {}).get('config', {}).get('ingress', [])
            for rule in ingress:
                hostname = rule.get('hostname', '')
                if hostname and hostname != '*':
                    return f"https://{hostname}"
        return None
    except Exception as e:
        print(f"[cloudflare] Gagal fetch URL dari API: {e}")
        return None

# ─────────────────────────────────────────────
# Tunnel output reader
# ─────────────────────────────────────────────
def _read_stream(stream, stream_name):
    global TUNNEL_URL
    try:
        for line in iter(stream.readline, b''):
            try:
                decoded_line = line.decode('utf-8', errors='replace').strip()
            except:
                decoded_line = line.decode('latin-1', errors='replace').strip()
            if decoded_line:
                clean_line = re.sub(r'\x1b\[[0-9;]*m', '', decoded_line)
                TUNNEL_LOG.append(f"[{stream_name}] {clean_line}")
                if len(TUNNEL_LOG) > 200:
                    TUNNEL_LOG.pop(0)
                print(f"[cloudflared/{stream_name}] {clean_line}")
                # Quick tunnel URL detection
                match = re.search(r'https://[a-zA-Z0-9\-]+\.trycloudflare\.com', clean_line)
                if match and not TUNNEL_URL:
                    TUNNEL_URL = match.group(0)
                    print(f"[cloudflared] URL ditemukan: {TUNNEL_URL}")
                    rt = get_runtime_info()
                    rt['url'] = TUNNEL_URL
                    save_runtime_info(rt)
    except Exception as e:
        print(f"Error reading tunnel {stream_name}: {e}")

def read_tunnel_output(process):
    t_stderr = threading.Thread(target=_read_stream, args=(process.stderr, 'stderr'))
    t_stdout = threading.Thread(target=_read_stream, args=(process.stdout, 'stdout'))
    t_stderr.daemon = True
    t_stdout.daemon = True
    t_stderr.start()
    t_stdout.start()

# ─────────────────────────────────────────────
# Standalone control functions (usable by Telegram bot & Flask)
# ─────────────────────────────────────────────
def cf_get_status():
    """Returns a dict with tunnel status info in < 0.001s."""
    global TUNNEL_PROCESS, TUNNEL_URL
    running = is_cloudflared_running()
    config = load_config()
    runtime = get_runtime_info() if running else {}
    current_url = TUNNEL_URL or runtime.get('url')
    if not current_url and running and config.get('mode') == 'token':
        current_url = config.get('custom_domain') or ''

    return {
        "running": running,
        "installed": is_cloudflared_installed(),
        "url": current_url if running else None,
        "mode": config.get('mode', 'quick'),
        "custom_domain": config.get('custom_domain', ''),
    }

def cf_start_tunnel():
    """Start the cloudflare tunnel. Returns (success: bool, message: str, url: str|None)."""
    global TUNNEL_PROCESS, TUNNEL_URL, TUNNEL_LOG

    if is_cloudflared_running():
        status = cf_get_status()
        return False, "Tunnel sudah berjalan.", status.get('url')

    if not is_cloudflared_installed():
        return False, "Cloudflare (cloudflared.exe) belum terinstall.", None

    config = load_config()
    TUNNEL_URL = None
    TUNNEL_LOG = []

    try:
        exe_path = CLOUDFLARED_PATH

        if config['mode'] == 'token':
            if not config['token']:
                return False, "Token belum diisi.", None

            saved_domain = config.get('custom_domain', '')
            if saved_domain:
                TUNNEL_URL = saved_domain
            else:
                api_key = config.get('api_key', '')
                if api_key:
                    account_id, tunnel_id = decode_connector_token(config['token'])
                    if account_id and tunnel_id:
                        fetched = fetch_tunnel_url_from_api(account_id, tunnel_id, api_key)
                        if fetched:
                            TUNNEL_URL = fetched
                            config['custom_domain'] = fetched
                            save_config(config)

            cmd = [exe_path, 'tunnel', 'run', '--token', config['token']]
        else:
            cmd = [exe_path, 'tunnel', '--url', 'http://localhost:80']

        CREATE_NO_WINDOW = 0x08000000
        TUNNEL_PROCESS = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=CREATE_NO_WINDOW
        )

        save_runtime_info({
            "pid": TUNNEL_PROCESS.pid,
            "url": TUNNEL_URL,
            "mode": config.get('mode', 'quick'),
            "started_at": time.strftime("%Y-%m-%d %H:%M:%S")
        })

        thread = threading.Thread(target=read_tunnel_output, args=(TUNNEL_PROCESS,))
        thread.daemon = True
        thread.start()

        return True, "Tunnel berhasil dijalankan.", TUNNEL_URL

    except FileNotFoundError:
        return False, "cloudflared.exe tidak ditemukan.", None
    except Exception as e:
        return False, str(e), None

def cf_stop_tunnel():
    """Stop the cloudflare tunnel. Returns (success: bool, message: str)."""
    global TUNNEL_PROCESS, TUNNEL_URL
    stopped = False
    if TUNNEL_PROCESS is not None:
        try:
            TUNNEL_PROCESS.terminate()
            TUNNEL_PROCESS.wait(timeout=2)
        except Exception:
            try:
                TUNNEL_PROCESS.kill()
            except Exception:
                pass
        TUNNEL_PROCESS = None
        stopped = True

    runtime = get_runtime_info()
    pid = runtime.get('pid')
    if pid:
        try:
            import psutil
            if psutil.pid_exists(pid):
                p = psutil.Process(pid)
                if 'cloudflared' in (p.name() or '').lower():
                    p.kill()
                    stopped = True
        except Exception:
            pass

    try:
        import psutil
        for p in psutil.process_iter(['pid', 'name']):
            if 'cloudflared' in (p.info['name'] or '').lower():
                try:
                    p.kill()
                    stopped = True
                except Exception:
                    pass
    except Exception:
        pass

    TUNNEL_URL = None
    clear_runtime_info()
    if stopped:
        return True, "Tunnel berhasil dihentikan."
    return False, "Tunnel tidak sedang berjalan."

# ─────────────────────────────────────────────
# Flask routes
# ─────────────────────────────────────────────
@cloudflare_tunnel_bp.route('/cloudflare_tunnel', methods=['GET'])
def cloudflare_tunnel_page():
    token = request.cookies.get("token")
    if not token:
        return redirect("/login")
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = data.get("sub")
        level_user = data.get("level_user")
    except Exception:
        return redirect("/login")
    return render_template('cloudflare_tunnel.html', submenu='cloudflare', menu='settings',
                           username=username, level_user=level_user, titlePage='Cloudflare Tunnel')

@cloudflare_tunnel_bp.route('/api/cloudflare/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@cloudflare_tunnel_bp.route('/api/cloudflare/config', methods=['POST'])
def update_config():
    data = request.json
    config = load_config()
    config['mode'] = data.get('mode', config['mode'])
    config['token'] = data.get('token', config['token'])
    config['custom_domain'] = data.get('custom_domain', config.get('custom_domain', ''))
    config['api_key'] = data.get('api_key', config.get('api_key', ''))
    save_config(config)
    return jsonify({"status": "success", "message": "Konfigurasi disimpan"})

@cloudflare_tunnel_bp.route('/api/cloudflare/fetch_url', methods=['POST'])
def fetch_url_from_api():
    """Try to auto-fetch the tunnel hostname from Cloudflare API using the stored token + api_key."""
    config = load_config()
    api_key = config.get('api_key', '')
    token_str = config.get('token', '')
    if not api_key:
        return jsonify({"status": "error", "message": "API Key belum diisi."})
    if not token_str:
        return jsonify({"status": "error", "message": "Token belum diisi."})

    account_id, tunnel_id = decode_connector_token(token_str)
    if not account_id or not tunnel_id:
        return jsonify({"status": "error", "message": "Gagal membaca informasi dari Token."})

    url = fetch_tunnel_url_from_api(account_id, tunnel_id, api_key)
    if url:
        config['custom_domain'] = url
        save_config(config)
        return jsonify({"status": "success", "url": url, "message": f"URL berhasil diambil: {url}"})
    return jsonify({"status": "error", "message": "Gagal mendapatkan URL. Pastikan API Key benar dan memiliki izin baca."})

@cloudflare_tunnel_bp.route('/api/cloudflare/download', methods=['POST'])
def download_cloudflared():
    if is_cloudflared_installed():
        return jsonify({"status": "success", "message": "Cloudflare sudah terinstall."})
    bin_dir = os.path.dirname(CLOUDFLARED_PATH)
    if not os.path.exists(bin_dir):
        os.makedirs(bin_dir)
    url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    tmp_path = CLOUDFLARED_PATH + ".tmp"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as response:
            with open(tmp_path, 'wb') as out_file:
                while True:
                    buffer = response.read(1024 * 1024)
                    if not buffer:
                        break
                    out_file.write(buffer)
        if os.path.exists(CLOUDFLARED_PATH):
            try:
                os.remove(CLOUDFLARED_PATH)
            except:
                pass
        os.rename(tmp_path, CLOUDFLARED_PATH)
        return jsonify({"status": "success", "message": "Cloudflare berhasil diunduh dan dipasang."})
    except Exception as e:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass
        return jsonify({"status": "error", "message": f"Gagal mengunduh Cloudflare: {e}"})

@cloudflare_tunnel_bp.route('/api/cloudflare/start', methods=['POST'])
def start_tunnel():
    ok, msg, url = cf_start_tunnel()
    if ok:
        return jsonify({"status": "success", "message": msg, "url": url})
    return jsonify({"status": "error", "message": msg})

@cloudflare_tunnel_bp.route('/api/cloudflare/stop', methods=['POST'])
def stop_tunnel():
    ok, msg = cf_stop_tunnel()
    return jsonify({"status": "success" if ok else "error", "message": msg})

@cloudflare_tunnel_bp.route('/api/cloudflare/status', methods=['GET'])
def get_status():
    data = cf_get_status()
    config = load_config()
    data['token'] = config.get('token', '')
    data['api_key'] = config.get('api_key', '')
    return jsonify(data)

@cloudflare_tunnel_bp.route('/api/cloudflare/logs', methods=['GET'])
def get_logs():
    return jsonify({"logs": TUNNEL_LOG[-50:]})
