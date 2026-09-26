from flask import Flask, make_response, request, redirect, render_template, Blueprint, jsonify, url_for, make_response
import jwt
from config.database import create_connection, get_db_cursor  # ✅ IMPORT BARU
from config.secretKey import SECRET_KEY
from .utils import format_indo_date, format_dmy, parse_date
from datetime import datetime
import datetime as dt_module

wh_mutasibarangmasuk_bp = Blueprint("wh_mutasibarangmasuk_bp", __name__)
wh_mutasibarangmasuk_bp.config = {
    "MAX_CONTENT_LENGTH": 100 * 1024 * 1024  # 100 megabytes
}
wh_mutasibarangmasuk_bp.secret_key = SECRET_KEY

# ❌ HAPUS INI - Jangan pakai global connection!# Blueprint and secret key

def log_history_event(cursor, no_bon, action_type, user_name, details):
    """
    Centralized logging for wh_mutasi_history with session debouncing.
    """
    no_bon = no_bon.strip()
    
    if action_type == 'Edited':
        cursor.execute('''
            SELECT TOP 1 Id, Details FROM wh_mutasi_history 
            WHERE LTRIM(RTRIM(NoBon)) = %s 
            AND ActionType = 'Edited' 
            AND UserName = %s 
            AND ActionTime > DATEADD(second, -30, GETDATE())
            ORDER BY ActionTime DESC
        ''', (no_bon, user_name))
        existing = cursor.fetchone()
        
        if existing:
            current_details = existing[1] if existing[1] else ""
            new_details = f"{current_details}\n{details}" if current_details else details
            cursor.execute("UPDATE wh_mutasi_history SET Details = %s, ActionTime = GETDATE() WHERE Id = %s", (new_details, existing[0]))
            return

    history_query = "INSERT INTO wh_mutasi_history (NoBon, ActionType, UserName, ActionTime, Details) VALUES (%s, %s, %s, GETDATE(), %s)"
    cursor.execute(history_query, (no_bon, action_type, user_name, details))

@wh_mutasibarangmasuk_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_mutasibarangmasuk_bp.route("/mutasibarangmasuk")
def mutasibarangmasuk():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")

            # Render the template and get the HTML content
            html_content = render_template("controlpagehtml/wh_mutasibarangmasuk.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangmasuk', titlePage='Mutasi Barang')

            # Calculate the content length
            content_length = len(html_content)

            # Create a response with the rendered template and set Content-Length header
            response = make_response(html_content)
            response.headers["Content-Length"] = str(content_length)

            return response

        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@wh_mutasibarangmasuk_bp.route("/mutasibarangmasukdev")
def mutasibarangmasukdev():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            template = render_template("controlpagehtml/wh_mutasibarangmasuk_dev.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangmasukdev', titlePage='Mutasi Barang')
            response = make_response(template)
            response.headers["Content-Length"] = len(response.data)
            return response
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")


@wh_mutasibarangmasuk_bp.route('/api/datamutasibarangmasuk/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def get_datamutasibarangmasuk(tgl_awal, tgl_akhir):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            token_data = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                # ✅ GUNAKAN CONTEXT MANAGER
                with get_db_cursor() as cursor:
                    tgl_awal_dt = parse_date(tgl_awal)
                    tgl_akhir_dt = parse_date(tgl_akhir)
                    
                    # Ensure we pass ISO strings for absolute reliability with SQL Server
                    tgl_awal_val = tgl_awal_dt.strftime('%Y-%m-%d') if isinstance(tgl_awal_dt, datetime) else tgl_awal_dt
                    tgl_akhir_val = tgl_akhir_dt.strftime('%Y-%m-%d') if isinstance(tgl_akhir_dt, datetime) else tgl_akhir_dt

                    # Prepare the SQL query with parameters
                    query = """
                    SELECT 
                        mbm.id,
                        mbm.TanggalMasukBarang AS TANGGAL_MASUK, 
                        mbm.KodeBarang AS KODE_BARANG, 
                        mb.NamaBarangIndo AS NAMA_BARANG,
                        mbm.NoBon AS NOMOR_BON, 
                        mbm.Jumlah AS QTY_IN, 
                        mb.SatuanIndo AS SATUAN,
                        mbm.Suplier AS SUPLIER,
                        mb.KategoriBarang AS KATEGORI_BARANG,
                        (
                             -- Gabungkan info Created dari data utama dengan info Edited dari history
                             'Created : ' + FORMAT(mbm.TglUserInput, 'dd-MMM-yyyy HH:mm') + ' by : ' + mbm.UserInput +
                             COALESCE(
                                CHAR(10) + (
                                    SELECT STRING_AGG('Edited ' + CAST(rn AS NVARCHAR(10)) + ' : ' + FORMAT(ActionTime, 'dd-MMM-yyyy HH:mm') + ' by : ' + UserName, CHAR(10))
                                    WITHIN GROUP (ORDER BY ActionTime ASC)
                                    FROM (
                                        SELECT NoBon, ActionTime, UserName,
                                               ROW_NUMBER() OVER (PARTITION BY NoBon ORDER BY ActionTime ASC) as rn
                                        FROM dbo.wh_mutasi_history
                                        WHERE ActionType = 'Edited'
                                    ) h WHERE h.NoBon = mbm.NoBon
                                ), ''
                             )
                        ) as FULL_HISTORY
                    FROM dbo.wh_mutasi_barang_masuk mbm
                    LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = mbm.KodeBarang
                    WHERE mbm.TanggalMasukBarang BETWEEN CAST(%s AS DATE) AND CAST(%s AS DATE);
                    """
                    cursor.execute(query, (tgl_awal_val, tgl_akhir_val))            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        history_db = row[9]
                        nomorBon = f"{row[4]}\n{history_db}" if history_db else f"{row[4]}"

                        data.append({
                            "id": row[0],
                            "tanggalMasuk": format_dmy(row[1]),
                            "kodeBarang": row[2],
                            "namaBarang": row[3],
                            "nomorBon": nomorBon,
                            "qtyIn": float(row[5]) if row[5] is not None else 0,
                            "satuan": row[6],
                            "suplier": row[7],
                            "kategoriBarang": row[8]
                        })
                    return jsonify(data)
            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

    
@wh_mutasibarangmasuk_bp.route('/api/datamutasibarangmasukdev', methods=['GET'])
def get_datamutasibarangmasukdev():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                # ✅ GUNAKAN CONTEXT MANAGER
                with get_db_cursor() as cursor:
                    # Query data dari database
                    query = """
                    SELECT TOP 10
                        mbm.id,
                        mbm.TanggalMasukBarang AS TANGGAL_MASUK, 
                        mbm.KodeBarang AS KODE_BARANG, 
                        mb.NamaBarangIndo AS NAMA_BARANG,
                        mbm.NoBon AS NOMOR_BON, 
                        mbm.Jumlah AS QTY_IN, 
                        mb.SatuanIndo AS SATUAN,
                        mbm.Suplier AS SUPLIER,
                        mb.KategoriBarang AS KATEGORI_BARANG
                    FROM dbo.wh_mutasi_barang_masuk mbm
                    LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = mbm.KodeBarang
                    ORDER BY mbm.id DESC
                    """
                    cursor.execute(query)            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        data.append({
                            "id": row[0],
                            "tanggalMasuk": format_dmy(row[1]),
                            "kodeBarang": row[2],
                            "namaBarang": row[3],
                            "nomorBon": row[4],
                            "qtyIn": int(row[5]),
                            "satuan": row[6],
                            "suplier": row[7],
                            "kategoriBarang": row[8]
                        })
                    return jsonify(data)
            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@wh_mutasibarangmasuk_bp.route('/mutasibarangmasuk', methods=['POST'])
def post_mutasibarangmasuk():
    # 1. Cek validitas token
    token = request.cookies.get("token")
    if not token:
        return redirect("/login")
    
    try:
        data = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
    except (jwt.exceptions.DecodeError, jwt.ExpiredSignatureError):
        return redirect("/login")
    
    try:
        # Mengambil data JSON dari frontend
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Data kosong"}), 400
        
        with get_db_cursor() as cursor:
            # 2. Ambil nilai MAX(Id) satu kali saja sebelum loop dimulai.
            # Menggunakan WITH (UPDLOCK, HOLDLOCK) agar user lain tidak bisa mengambil 
            # ID yang sama sampai transaksi ini selesai (mencegah duplikat antar user).
            cursor.execute("SELECT COALESCE(MAX(Id), 0) FROM wh_mutasi_barang_masuk WITH (UPDLOCK, HOLDLOCK)")
            current_max_id = cursor.fetchone()[0]

                # 3. Iterasi data dan masukkan ke database
            for data_item in json_data:
                # Tambahkan increment ID di sisi Python
                current_max_id += 1 
                
                # Mengambil nilai dari tiap item
                tanggal_input_barang_str = data_item.get('tanggalinputbarangTambah')
                kode_barang = str(data_item.get('kodeBarang', '')).strip()[:100]
                no_bon = str(data_item.get('nomorBon', '')).strip() # Bersihkan spasi
                tanggal_masuk_barang_str = data_item.get('tanggalmasukbarangTambah')
                jumlah = data_item.get('qtyIn')
                suplier = str(data_item.get('namaSuplier', '')).strip()[:200]
                userInput = str(data_item.get('namaLengkap') or 'Unknown')[:100] # Increased to 100 as per new schema
                catatan_barang = str(data_item.get('catatanBarang') or data_item.get('keterangan') or '').strip()

                # Robust date parsing
                tgl_input = parse_date(tanggal_input_barang_str)
                if not isinstance(tgl_input, datetime):
                    tgl_input = datetime.now()

                tgl_masuk = parse_date(tanggal_masuk_barang_str)
                if not isinstance(tgl_masuk, datetime):
                    tgl_masuk = datetime.now()

                cursor.execute("""
                    INSERT INTO wh_mutasi_barang_masuk 
                    (Id, TanggalInputBarang, KodeBarang, NoBon, TanggalMasukBarang, Jumlah, Suplier, UserInput, Keterangan, TglUserInput) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, GETDATE())
                """, (current_max_id, tgl_input, kode_barang, no_bon, tgl_masuk, jumlah, suplier, userInput, catatan_barang))

            # 4. Tambahkan riwayat "Created" untuk NoBon yang unik
            unique_nobons = set(str(data_item['nomorBon']).strip() for data_item in json_data)
            for noBon in unique_nobons:
                try:
                    cursor.execute("SELECT 1 FROM wh_mutasi_history WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s)) AND ActionType = 'Created'", (noBon,))
                    if not cursor.fetchone():
                        log_history_event(cursor, noBon, 'Created', data.get('nama_lengkap', 'Unknown'), 'Bon Baru Dibuat')
                except Exception as e:
                    print("Error logging history:", e)

        # Jika semua loop berhasil, kirim respons sukses
        return jsonify({"status": "Data berhasil ditambahkan!"})

    except Exception as e:
        # Menampilkan log error di terminal server dan file log
        from flask import current_app
        current_app.logger.error(f"Error in post_mutasibarangmasuk: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@wh_mutasibarangmasuk_bp.route('/api/deleteitemmasuk/<int:id>', methods=['DELETE'])
def delete_item_masuk(id):
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Log history sebelum hapus
                    cursor.execute("SELECT NoBon, KodeBarang FROM wh_mutasi_barang_masuk WHERE Id = %s", (id,))
                    row_info = cursor.fetchone()
                    if row_info:
                        no_bon = row_info[0]
                        kode_brg = row_info[1]
                        log_history_event(cursor, no_bon, 'Edited', data_token.get('nama_lengkap', 'Unknown'), f"Hapus Item: {kode_brg}")

                    query = "DELETE FROM tct_inventory.dbo.[wh_mutasi_barang_masuk] WHERE Id = %s"
                    cursor.execute(query, (id,))
                return jsonify({"status": "Item berhasil dihapus!"})
            except Exception as e:
                print("Error delete item masuk:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarangmasuk_bp.route('/api/updatebonmasuk', methods=['PUT'])
def update_bon_masuk():
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                json_data = request.get_json()
                old_no_bon = json_data['old_no_bon']
                new_no_bon = json_data['new_no_bon']
                new_tanggal = json_data['new_tanggal']
                new_catatan = json_data['new_catatan']

                with get_db_cursor() as cursor:
                    # Fetch old data for history comparison (gunakan LTRIM RTRIM untuk keandalan)
                    cursor.execute("SELECT TOP 1 NoBon, TanggalMasukBarang, Keterangan FROM wh_mutasi_barang_masuk WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))", (old_no_bon.strip(),))
                    old_data = cursor.fetchone()

                    # Parse new_tanggal
                    try:
                        new_tgl_dt = datetime.strptime(new_tanggal, '%d/%m/%Y')
                    except (ValueError, TypeError):
                        new_tgl_dt = datetime.now()

                    query = """
                        UPDATE tct_inventory.dbo.[wh_mutasi_barang_masuk] 
                        SET NoBon = %s, TanggalMasukBarang = %s, Keterangan = %s 
                        WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))
                    """
                    cursor.execute(query, (new_no_bon.strip(), new_tgl_dt, new_catatan, old_no_bon.strip()))

                    # Log history with detail changes
                    if old_data:
                        changes = []
                        if str(old_data[0]).strip() != str(new_no_bon).strip():
                            changes.append(f"NoBon: {old_data[0]} -> {new_no_bon}")
                        try:
                            old_tgl = old_data[1].strftime('%d/%m/%Y')
                            if old_tgl != new_tanggal:
                                changes.append(f"Tgl: {old_tgl} -> {new_tanggal}")
                        except: pass
                        if str(old_data[2] or "").strip() != str(new_catatan or "").strip():
                            changes.append(f"Catatan: {old_data[2]} -> {new_catatan}")
                        
                        detail_text = ("\n".join(changes) if changes else "Refresh data / No Change")
                        log_history_event(cursor, new_no_bon, 'Edited', data_token.get('nama_lengkap', 'Unknown'), detail_text)
                    else:
                        log_history_event(cursor, new_no_bon, 'Edited', data_token.get('nama_lengkap', 'Unknown'), 'Update Info Bon')

                return jsonify({"status": "BON berhasil diperbarui!"})
            except Exception as e:
                print("Error update bon masuk:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarangmasuk_bp.route('/api/updateitemmasuk', methods=['PUT'])
def update_item_masuk():
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                json_data = request.get_json()
                item_id = json_data['id']
                new_qty = json_data['qty']
                new_kode = json_data.get('kode')
                new_suplier = json_data.get('suplier')
                new_tanggal = json_data.get('tanggal')

                updates = ["Jumlah = %s"]
                params = [new_qty]
                
                if new_kode:
                    updates.append("KodeBarang = %s")
                    params.append(new_kode)
                if new_suplier:
                    updates.append("Suplier = %s")
                    params.append(new_suplier)
                if new_tanggal:
                    # Parse new_tanggal
                    try:
                        new_tgl_dt = datetime.strptime(new_tanggal, '%d/%m/%Y')
                    except (ValueError, TypeError):
                        new_tgl_dt = datetime.now()
                    updates.append("TanggalMasukBarang = %s")
                    params.append(new_tgl_dt)
                
                params.append(item_id)
                query = f"UPDATE tct_inventory.dbo.[wh_mutasi_barang_masuk] SET {', '.join(updates)} WHERE Id = %s"
                
                with get_db_cursor() as cursor:
                    # Fetch old item data for history
                    cursor.execute("SELECT KodeBarang, Jumlah, Suplier, NoBon FROM wh_mutasi_barang_masuk WHERE Id = %s", (item_id,))
                    old_item = cursor.fetchone()

                    cursor.execute(query, tuple(params))

                    # Log history with detail changes
                    if old_item:
                        changes = []
                        if new_kode and str(old_item[0]).strip() != str(new_kode).strip():
                            changes.append(f"Kode: {old_item[0]} -> {new_kode}")
                        if float(old_item[1]) != float(new_qty):
                            changes.append(f"Qty: {int(old_item[1])} -> {int(new_qty)}")
                        if new_suplier and str(old_item[2] or "").strip() != str(new_suplier).strip():
                            changes.append(f"Suplier: {old_item[2]} -> {new_suplier}")
                        
                        detail_text = f"Item {old_item[0]}:\n" + ("\n".join(changes) if changes else "No Change")
                        log_history_event(cursor, old_item[3], 'Edited', data_token.get('nama_lengkap', 'Unknown'), detail_text)

                return jsonify({"status": "Item berhasil diperbarui!"})
            except Exception as e:
                print("Error update item masuk:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarangmasuk_bp.route('/api/deletebonmasuk', methods=['DELETE'])
def delete_bon_masuk():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                json_data = request.get_json()
                no_bon = str(json_data['no_bon']).strip()

                with get_db_cursor() as cursor:
                    # Hapus riwayat audit terkait bon ini agar benar-benar bersih
                    query_history = "DELETE FROM tct_inventory.dbo.[wh_mutasi_history] WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))"
                    cursor.execute(query_history, (no_bon,))

                    # Hapus data utama
                    query = "DELETE FROM tct_inventory.dbo.[wh_mutasi_barang_masuk] WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))"
                    cursor.execute(query, (no_bon,))
                return jsonify({"status": "Data berhasil dihapus!"})
            except Exception as e:
                print("Error delete bon masuk:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarangmasuk_bp.route('/api/gethistorymasuk/<path:no_bon>', methods=['GET'])
def get_history_masuk(no_bon):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Ambil data utama untuk fallback Created
                    query_main = "SELECT TOP 1 TglUserInput, UserInput FROM wh_mutasi_barang_masuk WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))"
                    cursor.execute(query_main, (no_bon,))
                    main_data = cursor.fetchone()

                    # Ambil riwayat dari history
                    query_hist = """
                        SELECT ActionTime, ActionType, UserName, Details 
                        FROM wh_mutasi_history 
                        WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s)) 
                        ORDER BY ActionTime ASC
                    """
                    cursor.execute(query_hist, (no_bon,))
                    rows = cursor.fetchall()
                    
                    history = []
                    has_created = False
                    
                    for row in rows:
                        if row[1] == 'Created':
                            has_created = True
                        history.append({
                            "time": row[0].strftime("%d-%m-%Y %H:%M:%S"),
                            "action": row[1],
                            "user": row[2],
                            "details": row[3] if row[3] else "-"
                        })
                    
                    # Jika belum ada entri Created di history, sisipkan dari data utama di posisi paling atas
                    if not has_created and main_data:
                        history.insert(0, {
                            "time": main_data[0].strftime("%d-%m-%Y %H:%M:%S"),
                            "action": "Created",
                            "user": main_data[1],
                            "details": "Initial Creation (Auto-migrated)"
                        })
                    
                    # Sortir ulang berdasarkan waktu ascending agar terlama (Created) di atas
                    history.sort(key=lambda x: datetime.strptime(x['time'], "%d-%m-%Y %H:%M:%S"))
                    
                    return jsonify(history)
            except Exception as e:
                print("Error fetching history:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"error": "No Token"}), 401

@wh_mutasibarangmasuk_bp.route('/adjustment', methods=['POST'])
def post_adjustment():
    token = request.cookies.get("token")
    if not token:
        return redirect("/login")
    
    try:
        data = jwt.decode(token, wh_mutasibarangmasuk_bp.secret_key, algorithms="HS256")
    except (jwt.exceptions.DecodeError, jwt.ExpiredSignatureError):
        return redirect("/login")
    
    try:
        json_data = request.get_json()
        
        # ✅ GUNAKAN CONTEXT MANAGER (sudah benar)
        with get_db_cursor() as cursor:
            for data_item in json_data:
                kodebarangAdj = data_item['kodebarangAdj']
                norefAdj = data_item['norefAdj'] 
                tanggalAdj = data_item['tanggalAdj']
                qtyAdj = data_item['qtyAdj']
                userInput = data_item['namaLengkap']
                
                # Parse tanggal
                tanggal_adjust = datetime.strptime(tanggalAdj, '%d/%m/%Y').date()
                
                cursor.execute("SELECT COALESCE(MAX(Id), 0) + 1 FROM dbo.wh_barang_adjustment")
                max_id = cursor.fetchone()[0]

                query = """
                    INSERT INTO dbo.wh_barang_adjustment 
                    (Id, TanggalAdjustment, KodeBarang, NoRef, Jumlah, UserInput, UserUpdate) 
                    VALUES (%s, %s, %s, %s, %s, %s, NULL)
                """
                cursor.execute(query, (max_id, tanggal_adjust, kodebarangAdj, norefAdj, qtyAdj, userInput))
        
        return jsonify({"status": "Data berhasil ditambahkan!"})

    except Exception as e:
        print("Error: ", e)
        return jsonify({"error": str(e)}), 500