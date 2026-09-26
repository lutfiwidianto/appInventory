from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for, make_response
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from .utils import format_indo_date, format_dmy, parse_date
import datetime

wh_mutasibarangkeluar_bp = Blueprint("wh_mutasibarangkeluar_bp", __name__)
wh_mutasibarangkeluar_bp.config = {
    "MAX_CONTENT_LENGTH": 100 * 1024 * 1024  # 100 megabytes
}
wh_mutasibarangkeluar_bp.secret_key = SECRET_KEY


@wh_mutasibarangkeluar_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

def log_history_event(cursor, no_bon, action_type, user_name, details):
    """
    Centralized logging for wh_mutasi_history with session debouncing.
    If multiple 'Edited' actions happen within 30 seconds by the same user, 
    they are merged into one log entry.
    """
    no_bon = no_bon.strip()
    
    # Session debounce for 'Edited' actions (30 seconds window)
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
            # Append to existing details instead of creating new record
            # This keeps "Edited 1", "Edited 2" counts logical for the user
            current_details = existing[1] if existing[1] else ""
            new_details = f"{current_details}\n{details}" if current_details else details
            cursor.execute("UPDATE wh_mutasi_history SET Details = %s, ActionTime = GETDATE() WHERE Id = %s", (new_details, existing[0]))
            return

    # For 'Created' or non-debounced 'Edited': Insert new record
    history_query = "INSERT INTO wh_mutasi_history (NoBon, ActionType, UserName, ActionTime, Details) VALUES (%s, %s, %s, GETDATE(), %s)"
    cursor.execute(history_query, (no_bon, action_type, user_name, details))

''' Kode Asli

@wh_mutasibarangkeluar_bp.route("/mutasibarangkeluar")
def mutasibarangkeluar():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/wh_mutasibarangkeluar.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangkeluar', titlePage='Mutasi Barang')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login") '''

@wh_mutasibarangkeluar_bp.route('/api/get_mutasi_history/<path:no_bon>', methods=['GET'])
def get_mutasi_history(no_bon):
    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        data_token = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
        with get_db_cursor() as cursor:
            query = """
                SELECT ActionType, UserName, ActionTime, Details 
                FROM wh_mutasi_history 
                WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))
                ORDER BY ActionTime ASC
            """
            cursor.execute(query, (no_bon,))
            rows = cursor.fetchall()
            
            history = []
            for row in rows:
                history.append({
                    'action': row[0],
                    'user': row[1],
                    'time': row[2].strftime('%d-%b-%Y %H:%M:%S'),
                    'details': row[3] if row[3] else '-'
                })
            
            return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@wh_mutasibarangkeluar_bp.route("/mutasibarangkeluar")
def mutasibarangkeluar():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")

            # Render the template and get the HTML content
            html_content = render_template("controlpagehtml/wh_mutasibarangkeluar.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangkeluar', titlePage='Mutasi Barang')

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


@wh_mutasibarangkeluar_bp.route('/api/datamutasibarangkeluarnonfasilitas/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def get_datamutasibarangkeluarnonfasilitas(tgl_awal, tgl_akhir):
    
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                tgl_awal_dt = parse_date(tgl_awal)
                tgl_akhir_dt = parse_date(tgl_akhir)
                
                print(f"DEBUG NON-FASILITAS: raw_awal={tgl_awal}, raw_akhir={tgl_akhir}, parsed_awal={tgl_awal_dt}, parsed_akhir={tgl_akhir_dt}")

                # Ensure we pass ISO strings for absolute reliability with SQL Server
                tgl_awal_val = tgl_awal_dt.strftime('%Y-%m-%d') if isinstance(tgl_awal_dt, datetime.datetime) else tgl_awal_dt
                tgl_akhir_val = tgl_akhir_dt.strftime('%Y-%m-%d') if isinstance(tgl_akhir_dt, datetime.datetime) else tgl_akhir_dt

                query = """
                SELECT 
                    mbk.id,
                    mbk.TanggalKeluarBarang AS TANGGAL_KELUAR, 
                    mbk.KodeBarang AS KODE_BARANG, 
                    mb.NamaBarangIndo AS NAMA_BARANG,
                    mbk.Jumlah AS QTY_OUT, 
                    mb.SatuanIndo AS SATUAN,
                    mb.KategoriBarang AS KATEGORI,
                    mbk.NoBon AS NOMOR_BON, 
                    mbk.PicGudang AS PIC_GUDANG,
                    mbk.PenerimaBarang AS PENERIMA_BARANG,
                    mbk.Departemen AS DEPARTEMEN,
                    COALESCE(
                        (
                            SELECT STRING_AGG(LogText, CHAR(10)) WITHIN GROUP (ORDER BY h.ActionTime ASC)
                            FROM (
                                SELECT NoBon, ActionTime,
                                       CASE 
                                           WHEN ActionType = 'Created' THEN 'Created : ' + FORMAT(ActionTime, 'dd-MM-yyyy HH:mm') + ' by : ' + ISNULL(UserName, '-')
                                           ELSE 'Edited ' + CAST(ROW_NUMBER() OVER (PARTITION BY NoBon, ActionType ORDER BY ActionTime ASC) AS NVARCHAR(10)) + ' : ' + FORMAT(ActionTime, 'dd-MM-yyyy HH:mm') + ' by : ' + ISNULL(UserName, '-')
                                       END as LogText
                                FROM dbo.wh_mutasi_history
                            ) h WHERE h.NoBon = mbk.NoBon
                        ),
                        'Created : ' + FORMAT(mbk.TglInputUser, 'dd-MM-yyyy HH:mm') + ' by : ' + ISNULL(mbk.UserInput, '-')
                    ) as FULL_HISTORY
                FROM dbo.wh_mutasi_barang_keluar mbk
                LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = mbk.KodeBarang
                WHERE mb.KategoriBarang = 'NON FASILITAS' 
                AND mbk.TanggalKeluarBarang BETWEEN CAST(%s AS DATE) AND CAST(%s AS DATE);
                """

                with get_db_cursor() as cursor:
                    cursor.execute(query, (tgl_awal_val, tgl_akhir_val))            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        history_db = row[11]
                        nomorBon = f"{row[7]}\n{history_db}" if history_db else f"{row[7]}"

                        data.append({
                            "id": row[0],
                            "tanggalKeluar": format_dmy(row[1]),
                            "kodeBarang": row[2],
                            "namaBarang": row[3],
                            "qtyOut": int(row[4]) if row[4] is not None else 0,
                            "satuan": row[5],
                            "kategori": row[6],
                            "nomorBon": nomorBon,
                            "picGudang": row[8],
                            "penerimaBarang": row[9],
                            "departemen": row[10]
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

@wh_mutasibarangkeluar_bp.route('/api/datamutasibarangkeluarfasilitas/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def get_datamutasibarangkeluarfasilitas(tgl_awal, tgl_akhir):
    
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                tgl_awal_dt = parse_date(tgl_awal)
                tgl_akhir_dt = parse_date(tgl_akhir)
                
                print(f"DEBUG FASILITAS: raw_awal={tgl_awal}, raw_akhir={tgl_akhir}, parsed_awal={tgl_awal_dt}, parsed_akhir={tgl_akhir_dt}")

                # Ensure we pass ISO strings for absolute reliability with SQL Server
                tgl_awal_val = tgl_awal_dt.strftime('%Y-%m-%d') if isinstance(tgl_awal_dt, datetime.datetime) else tgl_awal_dt
                tgl_akhir_val = tgl_akhir_dt.strftime('%Y-%m-%d') if isinstance(tgl_akhir_dt, datetime.datetime) else tgl_akhir_dt

                query = """
                SELECT 
                    mbk.id,
                    mbk.TanggalKeluarBarang AS TANGGAL_KELUAR, 
                    mbk.KodeBarang AS KODE_BARANG, 
                    mb.NamaBarangIndo AS NAMA_BARANG,
                    mbk.Jumlah AS QTY_OUT, 
                    mb.SatuanIndo AS SATUAN,
                    mb.KategoriBarang AS KATEGORI,
                    mbk.NoBon AS NOMOR_BON, 
                    mbk.PicGudang AS PIC_GUDANG,
                    mbk.PenerimaBarang AS PENERIMA_BARANG,
                    mbk.Departemen AS DEPARTEMEN,
                    mb.GlClass,
                    CASE 
                        WHEN mbk.Inputed = 1 THEN 'Inputed'
                        WHEN mbk.Inputed = 0 THEN 'On Process'
                        WHEN mbk.Inputed IS NULL THEN 'On Process'
                    END AS INPUTED,
                    COALESCE(
                        (
                            SELECT STRING_AGG(LogText, CHAR(10)) WITHIN GROUP (ORDER BY h.ActionTime ASC)
                            FROM (
                                SELECT NoBon, ActionTime,
                                       CASE 
                                           WHEN ActionType = 'Created' THEN 'Created : ' + FORMAT(ActionTime, 'dd-MM-yyyy HH:mm') + ' by : ' + ISNULL(UserName, '-')
                                           ELSE 'Edited ' + CAST(ROW_NUMBER() OVER (PARTITION BY NoBon, ActionType ORDER BY ActionTime ASC) AS NVARCHAR(10)) + ' : ' + FORMAT(ActionTime, 'dd-MM-yyyy HH:mm') + ' by : ' + ISNULL(UserName, '-')
                                       END as LogText
                                FROM dbo.wh_mutasi_history
                            ) h WHERE h.NoBon = mbk.NoBon
                        ),
                        'Created : ' + FORMAT(mbk.TglInputUser, 'dd-MM-yyyy HH:mm') + ' by : ' + ISNULL(mbk.UserInput, '-')
                    ) as FULL_HISTORY,
                    mbk.UserUpdate
                FROM dbo.wh_mutasi_barang_keluar mbk
                LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = mbk.KodeBarang
                WHERE mb.KategoriBarang = 'FASILITAS'
                AND mbk.TanggalKeluarBarang BETWEEN CAST(%s AS DATE) AND CAST(%s AS DATE);
                """

                with get_db_cursor() as cursor:
                    cursor.execute(query, (tgl_awal_val, tgl_akhir_val))            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        history_db = row[13]
                        nomorBon_full = f"{row[7]}\n{history_db}" if history_db else f"{row[7]}"
                        
                        # Preserve existing logic for last_part and notesmartone
                        last_part = row[7].split('/')[-1] if row[7] else ""
                        notesmartone = f"{row[10]} | {last_part}" 
                        
                        # Preserve existing logic for status
                        if row[14]:
                            status = f"{row[12]} by : {row[14]}"
                        else:
                            status = f"{row[12]}"

                        data.append({
                            "id": row[0],
                            "tanggalKeluar": format_dmy(row[1]),
                            "kodeBarang": row[2],
                            "namaBarang": row[3],
                            "qtyOut": int(row[4]) if row[4] is not None else 0,
                            "satuan": row[5],
                            "kategori": row[6],
                            "nomorBon": nomorBon_full,
                            "picGudang": row[8],
                            "penerimaBarang": row[9],
                            "departemen": row[10],
                            "GlClass": row[11],
                            "inputed": status,
                            "notesmartone" : notesmartone
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
    
@wh_mutasibarangkeluar_bp.route('/api/datamutasibarangkeluar', methods=['POST'])
def post_datamutasibarangkeluar():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                # Mengambil nilai-nilai dari data JSON
                json_data = request.get_json()
                
                # Simpan item satu per satu
                with get_db_cursor() as cursor:
                    # Ambil MAX(Id) sekali saja sebelum loop
                    cursor.execute("SELECT COALESCE(MAX(Id), 0) FROM wh_mutasi_barang_keluar WITH (UPDLOCK, HOLDLOCK)")
                    current_max_id = cursor.fetchone()[0]

                    for data_item in json_data:
                        current_max_id += 1
                        tanggalKeluar = data_item['tanggalKeluar']
                        kodeBarang = data_item['kodebarangKeluar']
                        qtyOut = data_item['qtyOut']
                        picGudang = data_item['picgudangKeluar']
                        penerimaBarang = data_item['penerimabarangKeluar']
                        departMen = data_item['departmentKeluar']
                        asalBarang = data_item['asalbarangKeluar']
                        userInput = data_item['namaLengkap']
                        userUpdate = None
                        noBon = data_item['norefKeluar']
                        isiKegunaan = data_item['isiKegunaan']
                        isiCatatan = data_item['isiCatatan']

                        # Robust date parsing (using utils.parse_date)
                        tgl_keluar = parse_date(tanggalKeluar)
                        if not isinstance(tgl_keluar, datetime.datetime):
                            tgl_keluar = datetime.datetime.now()

                        # Menjalankan query INSERT
                        query = "INSERT INTO wh_mutasi_barang_keluar (Id, TanggalKeluarBarang, KodeBarang, Jumlah, PicGudang, PenerimaBarang, NoBon, Departemen, AsalBarang, UserInput, UserUpdate, Kegunaan, Catatan, TglInputUser) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, GETDATE())"
                        values = (current_max_id, tgl_keluar, kodeBarang, qtyOut, picGudang, penerimaBarang, noBon, departMen, asalBarang, userInput, userUpdate, isiKegunaan, isiCatatan)
                        
                        cursor.execute(query, values)

                    # Tambahkan riwayat "Created" untuk NoBon yang unik (jika belum ada)
                    unique_nobons = set(data_item['norefKeluar'] for data_item in json_data)
                    for noBon in unique_nobons:
                        try:
                            # Cek dulu apakah history Created untuk NoBon ini sudah ada
                            cursor.execute("SELECT 1 FROM wh_mutasi_history WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s)) AND ActionType = 'Created'", (noBon,))
                            if not cursor.fetchone():
                                log_history_event(cursor, noBon, 'Created', data.get('nama_lengkap', 'Unknown'), 'Bon Baru Dibuat')
                        except Exception as e:
                            print("Error logging history:", e)




                # Kirimkan respons yang berhasil
                return jsonify({"status": "Data berhasil ditambahkan!"})

            except Exception as e:
                print("Error? ", e)
                return jsonify({"error": str(e)})

            # return render_template("dashboard.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@wh_mutasibarangkeluar_bp.route('/api/inputtosmartone', methods=['POST'])
def post_inputtosmartone():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                # Extract data from JSON request
                json_data = request.get_json()
                with get_db_cursor() as cursor:
                    for data_item in json_data:
                        # Extract values from each object
                        id = data_item['id']
                        no_bon = data_item['no_bon']
                        nilai = data_item['nilai']
                        username = data_item['username']

                        # Execute an SQL UPDATE query
                        query = "UPDATE tct_inventory.dbo.[wh_mutasi_barang_keluar] SET inputed = %s, UserUpdate = %s WHERE Id = %s AND NoBon = %s"
                        values = (nilai, username, id, no_bon)

                        # Execute the query
                        try:
                            cursor.execute(query, values)
                            print("Query executed successfully.")
                        except Exception as e:
                            print("Error executing query:", e)


                # Send a success response
                return jsonify({"status": "Data berhasil diupdate!"})

            except Exception as e:
                print("Error? ", e)
                return jsonify({"error": str(e)})

        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@wh_mutasibarangkeluar_bp.route('/api/deleteitemkeluar/<int:id>', methods=['DELETE'])
def delete_item_keluar(id):
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Log history sebelum hapus untuk ambil NoBon
                    cursor.execute("SELECT NoBon, KodeBarang FROM wh_mutasi_barang_keluar WHERE Id = %s", (id,))
                    row_info = cursor.fetchone()
                    if row_info:
                        no_bon = row_info[0]
                        kode_brg = row_info[1]
                        log_history_event(cursor, no_bon, 'Edited', data_token.get('nama_lengkap', 'Unknown'), f"Hapus Item: {kode_brg}")
                    
                    query = "DELETE FROM tct_inventory.dbo.[wh_mutasi_barang_keluar] WHERE Id = %s"

                    cursor.execute(query, (id,))
                return jsonify({"status": "Item berhasil dihapus!"})

            except Exception as e:
                print("Error delete item:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarangkeluar_bp.route('/api/updatebonkeluar', methods=['PUT'])
def update_bon_keluar():
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                json_data = request.get_json()
                old_no_bon = json_data['old_no_bon']
                new_no_bon = json_data['new_no_bon']
                new_tanggal = json_data['new_tanggal']
                new_kegunaan = json_data['new_kegunaan']
                new_catatan = json_data['new_catatan']

                with get_db_cursor() as cursor:
                    # Fetch old data for comparison
                    cursor.execute("SELECT TOP 1 NoBon, TanggalKeluarBarang, Kegunaan, Catatan FROM wh_mutasi_barang_keluar WHERE NoBon = %s", (old_no_bon,))
                    old_data = cursor.fetchone()
                    
                    # Parse new_tanggal
                    try:
                        new_tgl_dt = parse_date(new_tanggal)
                        if not isinstance(new_tgl_dt, datetime.datetime):
                            new_tgl_dt = datetime.datetime.now()
                    except (ValueError, TypeError):
                        new_tgl_dt = datetime.datetime.now()

                    query = """
                        UPDATE tct_inventory.dbo.[wh_mutasi_barang_keluar] 
                        SET NoBon = %s, TanggalKeluarBarang = %s, Kegunaan = %s, Catatan = %s 
                        WHERE NoBon = %s
                    """
                    cursor.execute(query, (new_no_bon.strip(), new_tgl_dt, new_kegunaan, new_catatan, old_no_bon.strip()))
                    
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
                        if str(old_data[2] or "").strip() != str(new_kegunaan or "").strip():
                            changes.append(f"Kegunaan: {old_data[2]} -> {new_kegunaan}")
                        if str(old_data[3] or "").strip() != str(new_catatan or "").strip():
                            changes.append(f"Catatan: {old_data[3]} -> {new_catatan}")
                        
                        detail_text = "Update Info Bon: " + (", ".join(changes) if changes else "Refresh data")
                        log_history_event(cursor, new_no_bon, 'Edited', data_token.get('nama_lengkap', 'Unknown'), detail_text)
                    else:
                        log_history_event(cursor, new_no_bon, 'Edited', data_token.get('nama_lengkap', 'Unknown'), 'Update Info Bon (Data lama tidak ditemukan)')


                
                return jsonify({"status": "BON berhasil diperbarui!"})

            except Exception as e:
                print("Error update bon:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarangkeluar_bp.route('/api/updateitemkeluar', methods=['PUT'])
def update_item_keluar():
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_mutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                json_data = request.get_json()
                item_id = json_data['id']
                # Pastikan qty disimpan sebagai negatif untuk barang keluar
                try:
                    new_qty = -abs(float(json_data['qty']))
                except (ValueError, TypeError):
                    new_qty = 0 # Fallback safety
                
                new_kode = json_data.get('kode') # Optional
                new_penerima = json_data.get('penerima') # Optional

                # Build query dynamically
                updates = ["Jumlah = %s"]
                params = [new_qty]
                
                if new_kode:
                    updates.append("KodeBarang = %s")
                    params.append(new_kode)
                if new_penerima:
                    updates.append("PenerimaBarang = %s")
                    params.append(new_penerima)
                
                params.append(item_id)
                query = f"UPDATE tct_inventory.dbo.[wh_mutasi_barang_keluar] SET {', '.join(updates)} WHERE Id = %s"
                
                with get_db_cursor() as cursor:
                    # Fetch old item data
                    cursor.execute("SELECT KodeBarang, Jumlah, PenerimaBarang, NoBon FROM wh_mutasi_barang_keluar WHERE Id = %s", (item_id,))
                    old_item = cursor.fetchone()

                    cursor.execute(query, tuple(params))
                    
                    # Log history with detail changes
                    if old_item:
                        changes = []
                        if new_kode and str(old_item[0]).strip() != str(new_kode).strip():
                            changes.append(f"Kode: {old_item[0]} -> {new_kode}")
                        if float(old_item[1]) != float(new_qty):
                            changes.append(f"Qty: {int(abs(old_item[1]))} -> {int(abs(new_qty))}")
                        if new_penerima and str(old_item[2] or "").strip() != str(new_penerima or "").strip():
                            changes.append(f"Penerima: {old_item[2]} -> {new_penerima}")
                        
                        detail_text = f"Update Item ({old_item[0]}): " + (", ".join(changes) if changes else "No Change")
                        log_history_event(cursor, old_item[3], 'Edited', data_token.get('nama_lengkap', 'Unknown'), detail_text)


                
                return jsonify({"status": "Item berhasil diperbarui!"})

            except Exception as e:
                print("Error update item:", e)
                return jsonify({"error": str(e)}), 500
        except Exception:
            return redirect("/login")
    return redirect("/login")
